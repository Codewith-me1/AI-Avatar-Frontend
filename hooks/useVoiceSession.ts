/**
 * useVoiceSession hook
 * Manages WebSocket connection + WebRTC audio pipeline.
 *
 * Flow:
 *  1. Connect WebSocket to backend
 *  2. Capture microphone via getUserMedia
 *  3. Stream raw PCM via WebSocket
 *  4. Receive TTS audio + events
 *  5. Play TTS audio through Web Audio API
 */

"use client";

import { useEffect, useRef, useCallback } from "react";
import { useVoiceStore } from "@/store";
import type { WSEvent, AvatarStateEvent, SessionReadyEvent } from "@/types";

const WS_URL = process.env.NEXT_PUBLIC_WS_URL ?? "ws://localhost:8000";
const SAMPLE_RATE = 16000;
const CHUNK_INTERVAL_MS = 100; // Send audio every 100ms

export function useVoiceSession(agentId: string) {
  const wsRef = useRef<WebSocket | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const audioQueueRef = useRef<ArrayBuffer[]>([]);
  const isPlayingRef = useRef(false);

  const {
    setConnected,
    setRecording,
    setSpeaking,
    setAvatarState,
    setVolume,
    setSessionId,
    setPartialTranscript,
    setFinalTranscript,
    appendToken,
    addMessage,
    reset,
  } = useVoiceStore();

  // ── WebSocket setup ──────────────────────────────────────────────────────

  const connect = useCallback(() => {
    const ws = new WebSocket(`${WS_URL}/ws/session/${agentId}`);
    ws.binaryType = "arraybuffer";
    wsRef.current = ws;

    ws.onopen = () => {
      setConnected(true);
    };

    ws.onclose = () => {
      setConnected(false);
      setRecording(false);
    };

    ws.onerror = (err) => {
      console.error("WebSocket error", err);
    };

    ws.onmessage = (event) => {
      if (event.data instanceof ArrayBuffer) {
        // TTS audio chunk
        audioQueueRef.current.push(event.data);
        if (!isPlayingRef.current) {
          playNextChunk();
        }
      } else {
        handleEvent(JSON.parse(event.data) as WSEvent);
      }
    };
  }, [agentId]);

  const disconnect = useCallback(() => {
    wsRef.current?.close();
    stopRecording();
    audioContextRef.current?.close();
    reset();
  }, []);

  // ── Event handling ────────────────────────────────────────────────────────

  const handleEvent = useCallback((event: WSEvent) => {
    switch (event.type) {
      case "session_ready": {
        const e = event as SessionReadyEvent;
        setSessionId(e.session_id);
        if (e.greeting) {
          addMessage({
            id: crypto.randomUUID(),
            role: "assistant",
            content: e.greeting,
            timestamp: new Date(),
          });
        }
        break;
      }
      case "transcript_partial":
        setPartialTranscript(event.text as string);
        break;

      case "transcript_final": {
        const text = event.text as string;
        setFinalTranscript(text);
        setPartialTranscript("");
        addMessage({
          id: crypto.randomUUID(),
          role: "user",
          content: text,
          timestamp: new Date(),
        });
        break;
      }

      case "llm_token":
        appendToken(event.token as string);
        break;

      case "audio_end":
        setSpeaking(false);
        break;

      case "interrupted":
        audioQueueRef.current = [];
        isPlayingRef.current = false;
        setSpeaking(false);
        break;

      case "avatar_state": {
        const e = event as AvatarStateEvent;
        setAvatarState(e.state);
        setSpeaking(e.state === "speaking");
        break;
      }

      case "error":
        console.error("Server error:", event.message);
        break;
    }
  }, []);

  // ── Audio playback ────────────────────────────────────────────────────────

  const playNextChunk = useCallback(async () => {
    if (!audioContextRef.current || audioQueueRef.current.length === 0) {
      isPlayingRef.current = false;
      return;
    }

    isPlayingRef.current = true;
    const chunk = audioQueueRef.current.shift()!;

    try {
      const decoded = await audioContextRef.current.decodeAudioData(chunk.slice(0));
      const source = audioContextRef.current.createBufferSource();
      source.buffer = decoded;
      source.connect(audioContextRef.current.destination);
      source.onended = playNextChunk;
      source.start();
    } catch {
      // PCM raw — create buffer manually
      const int16 = new Int16Array(chunk);
      const float32 = new Float32Array(int16.length);
      for (let i = 0; i < int16.length; i++) {
        float32[i] = int16[i] / 32768.0;
      }

      const ctx = audioContextRef.current;
      const buffer = ctx.createBuffer(1, float32.length, SAMPLE_RATE);
      buffer.copyToChannel(float32, 0);
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);
      source.onended = playNextChunk;
      source.start();
    }
  }, []);

  // ── Microphone recording ─────────────────────────────────────────────────

  const startRecording = useCallback(async () => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;

    audioContextRef.current = new AudioContext({ sampleRate: SAMPLE_RATE });

    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        sampleRate: SAMPLE_RATE,
        channelCount: 1,
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
    });

    mediaStreamRef.current = stream;

    const source = audioContextRef.current.createMediaStreamSource(stream);

    // Volume metering
    const analyser = audioContextRef.current.createAnalyser();
    analyser.fftSize = 256;
    source.connect(analyser);

    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    const updateVolume = () => {
      analyser.getByteFrequencyData(dataArray);
      const avg = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
      setVolume(avg / 255);
      if (mediaStreamRef.current) requestAnimationFrame(updateVolume);
    };
    updateVolume();

    // PCM processor
    const processor = audioContextRef.current.createScriptProcessor(4096, 1, 1);
    processorRef.current = processor;

    processor.onaudioprocess = (e) => {
      const float32 = e.inputBuffer.getChannelData(0);
      const int16 = new Int16Array(float32.length);
      for (let i = 0; i < float32.length; i++) {
        int16[i] = Math.max(-32768, Math.min(32767, float32[i] * 32768));
      }

      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(int16.buffer);
      }
    };

    source.connect(processor);
    processor.connect(audioContextRef.current.destination);

    setRecording(true);
  }, []);

  const stopRecording = useCallback(() => {
    processorRef.current?.disconnect();
    processorRef.current = null;
    mediaStreamRef.current?.getTracks().forEach((t) => t.stop());
    mediaStreamRef.current = null;
    setRecording(false);
    setVolume(0);
  }, []);

  const finishSpeaking = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "audio_end" }));
    }
    stopRecording();
  }, []);

  const interrupt = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "interrupt" }));
    }
  }, []);

  const sendText = useCallback((text: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "text_input", text }));
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, []);

  return {
    connect,
    disconnect,
    startRecording,
    stopRecording,
    finishSpeaking,
    interrupt,
    sendText,
  };
}
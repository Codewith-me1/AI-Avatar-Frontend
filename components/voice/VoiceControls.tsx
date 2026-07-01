"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, PhoneOff, Send, Zap } from "lucide-react";
import { useVoiceStore } from "@/store";
import { useVoiceSession } from "@/hooks/useVoiceSession";

interface VoiceControlsProps {
  agentId: string;
  className?: string;
}

export function VoiceControls({ agentId, className }: VoiceControlsProps) {
  const {
    isConnected,
    isRecording,
    isSpeaking,
    avatarState,
    volume,
    partialTranscript,
  } = useVoiceStore();

  const {
    connect,
    disconnect,
    startRecording,
    finishSpeaking,
    interrupt,
    sendText,
  } = useVoiceSession(agentId);

  const [textMode, setTextMode] = useState(false);
  const [textInput, setTextInput] = useState("");
  const isHoldingRef = useRef(false);

  const handleMicPress = async () => {
    if (isSpeaking) {
      interrupt();
      return;
    }
    if (!isConnected) {
      connect();
      return;
    }
    if (!isRecording) {
      await startRecording();
    }
  };

  const handleMicRelease = () => {
    if (isRecording) {
      finishSpeaking();
    }
  };

  const handleTextSend = () => {
    if (textInput.trim()) {
      sendText(textInput.trim());
      setTextInput("");
    }
  };

  return (
    <div className={`flex flex-col items-center gap-4 ${className}`}>
      {/* Partial transcript */}
      <AnimatePresence>
        {partialTranscript && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="px-4 py-2 bg-[#DCD6F7]/85 backdrop-blur-sm border border-[#A6B1E1]/40 rounded-xl text-sm text-[#424874] max-w-xs text-center shadow-sm font-semibold"
          >
            {partialTranscript}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center gap-4">
        {/* Text mode toggle */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setTextMode(!textMode)}
          className="w-10 h-10 rounded-full bg-white hover:bg-[#DCD6F7]/30 border border-slate-200 shadow-sm flex items-center justify-center text-slate-500 hover:text-[#424874] transition-colors cursor-pointer"
          title="Toggle text input"
        >
          <Send size={16} />
        </motion.button>

        {/* Main mic button */}
        <div className="relative">
          {/* Volume ring */}
          <AnimatePresence>
            {isRecording && (
              <motion.div
                className="absolute inset-0 rounded-full bg-red-400/20"
                initial={{ scale: 1 }}
                animate={{ scale: 1 + volume * 0.5 }}
                style={{ originX: "50%", originY: "50%" }}
              />
            )}
          </AnimatePresence>

          {/* Pulse ring when speaking (interrupt mode) */}
          <AnimatePresence>
            {isSpeaking && (
              <motion.div
                className="absolute -inset-2 rounded-full border-2 border-[#424874]/30"
                initial={{ opacity: 0.8, scale: 1 }}
                animate={{ opacity: 0, scale: 1.4 }}
                transition={{ duration: 1, repeat: Infinity }}
              />
            )}
          </AnimatePresence>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onPointerDown={handleMicPress}
            onPointerUp={handleMicRelease}
            onPointerLeave={handleMicRelease}
            className={`
              relative w-20 h-20 rounded-full flex items-center justify-center shadow-lg border border-white/50
              transition-all duration-200 cursor-pointer select-none
              ${
                !isConnected
                  ? "bg-gradient-to-br from-slate-400 to-slate-500 text-white"
                  : isRecording
                    ? "bg-gradient-to-br from-red-500 to-rose-600 text-white"
                    : isSpeaking
                      ? "bg-gradient-to-br from-[#A6B1E1] to-[#424874] text-white"
                      : "bg-gradient-to-br from-[#DCD6F7] to-[#A6B1E1] text-[#424874]"
              }
            `}
            title={
              !isConnected
                ? "Click to connect"
                : isSpeaking
                  ? "Click to interrupt"
                  : isRecording
                    ? "Release to send"
                    : "Hold to speak"
            }
          >
            {isSpeaking ? (
              <Zap size={28} />
            ) : isRecording ? (
              <MicOff size={28} />
            ) : (
              <Mic size={28} />
            )}
          </motion.button>
        </div>

        {/* Hang up */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={disconnect}
          disabled={!isConnected}
          className="w-10 h-10 rounded-full bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-200 hover:text-rose-600 shadow-sm flex items-center justify-center text-slate-400 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          title="End conversation"
        >
          <PhoneOff size={16} />
        </motion.button>
      </div>

      {/* Status text */}
      <p className="text-xs text-slate-500 font-semibold">
        {!isConnected
          ? "Click mic to start"
          : isRecording
            ? "Listening — release to send"
            : isSpeaking
              ? "Tap mic to interrupt"
              : "Hold mic to speak"}
      </p>

      {/* Text input fallback */}
      <AnimatePresence>
        {textMode && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="w-full max-w-sm overflow-hidden"
          >
            <div className="flex gap-2 mt-2">
              <input
                type="text"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleTextSend()}
                placeholder="Type a message..."
                className="flex-1 px-4 py-2 bg-white/95 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 text-sm outline-none focus:border-[#A6B1E1] focus:ring-2 focus:ring-[#DCD6F7] shadow-inner"
              />
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={handleTextSend}
                className="px-4 py-2 bg-[#424874] hover:bg-[#353b61] rounded-xl text-white text-sm font-semibold transition-colors cursor-pointer shadow-sm"
              >
                Send
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

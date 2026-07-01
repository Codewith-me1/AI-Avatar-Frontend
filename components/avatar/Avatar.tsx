"use client";

import { useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { AvatarState, AvatarConfig } from "@/types";

interface AvatarProps {
  type: "readyplayerme" | "live2d" | "waveform";
  url?: string;
  config?: AvatarConfig;
  state: AvatarState;
  agentName: string;
}

export function Avatar({ type, url, config, state, agentName }: AvatarProps) {
  if (type === "readyplayerme" && url) {
    return <RPMAvatar url={url} config={config} state={state} />;
  }
  return <WaveformAvatar state={state} agentName={agentName} />;
}

// ── Ready Player Me Avatar ─────────────────────────────────────────────────

function RPMAvatar({
  url,
  state,
}: {
  url: string;
  config?: AvatarConfig;
  state: AvatarState;
}) {
  const isSpeaking = state === "speaking";

  // Append morphTargets for viseme/lipsync support
  const glbUrl = url.includes("?")
    ? `${url}&morphTargets=ARKit,Oculus Visemes`
    : `${url}?morphTargets=ARKit,Oculus Visemes`;

  return (
    <div className="relative w-full h-full flex items-center justify-center bg-gradient-to-b from-[#F4EEFF] to-[#E2DBF0] border border-white/60 shadow-sm rounded-2xl overflow-hidden">
      {/* 3D model via iframe for RPM — replace with @react-three/fiber in production */}
      <iframe
        src={`https://models.readyplayer.me/${extractModelId(url)}/rendered?env=office`}
        className="w-full h-full border-0"
        allow="camera"
        title="Avatar"
      />

      {/* Speaking ring animation */}
      <AnimatePresence>
        {isSpeaking && (
          <motion.div
            className="absolute inset-0 rounded-2xl border-2 border-[#424874]/40 pointer-events-none"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{
              opacity: [0.5, 1, 0.5],
              scale: [0.98, 1.01, 0.98],
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        )}
      </AnimatePresence>

      {/* State label */}
      <StateIndicator state={state} />
    </div>
  );
}

function extractModelId(url: string): string {
  const parts = url.split("/");
  const last = parts[parts.length - 1];
  return last.replace(".glb", "");
}

// ── Waveform Avatar (fallback / default) ──────────────────────────────────

function WaveformAvatar({
  state,
  agentName,
}: {
  state: AvatarState;
  agentName: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);
  const phaseRef = useRef(0);

  const isSpeaking = state === "speaking";
  const isListening = state === "listening";
  const isThinking = state === "thinking" || state === "processing";

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;

    const draw = () => {
      const W = canvas.width;
      const H = canvas.height;
      ctx.clearRect(0, 0, W, H);

      const bars = 48;
      const barWidth = (W * 0.8) / bars;
      const gap = barWidth * 0.3;
      const startX = W * 0.1;

      for (let i = 0; i < bars; i++) {
        const x = startX + i * (barWidth + gap);

        let height: number;
        if (isSpeaking) {
          // Dynamic wave when speaking
          const wave1 = Math.sin(phaseRef.current + i * 0.4) * 0.5 + 0.5;
          const wave2 = Math.sin(phaseRef.current * 1.3 + i * 0.7) * 0.3 + 0.3;
          height = (wave1 * 0.6 + wave2 * 0.4) * H * 0.65 + H * 0.05;
        } else if (isListening) {
          // Small idle pulse
          height =
            Math.sin(phaseRef.current * 0.5 + i * 0.3) * H * 0.08 + H * 0.08;
        } else if (isThinking) {
          // Ripple
          height =
            Math.abs(Math.sin(phaseRef.current * 2 + i * 0.2)) * H * 0.3 +
            H * 0.03;
        } else {
          // Idle — flat line with tiny noise
          height = H * 0.04 + Math.random() * H * 0.01;
        }

        const alpha = isSpeaking ? 0.9 : isListening ? 0.6 : 0.35;

        let hue: number;
        let saturation = "80%";
        let lightness = "65%";
        if (isSpeaking) {
          hue = 233; // slate indigo
          saturation = "27%";
          lightness = "36%";
        } else if (isListening) {
          hue = 229; // periwinkle blue
          saturation = "44%";
          lightness = "77%";
        } else {
          hue = 251; // soft lavender
          saturation = "62%";
          lightness = "80%";
        }
        ctx.fillStyle = `hsla(${hue}, ${saturation}, ${lightness}, ${alpha})`;

        const yCenter = H / 2;
        const r = Math.min(barWidth / 2, 4);

        // Mirrored bars
        roundRect(ctx, x, yCenter - height / 2, barWidth - gap, height, r);
        ctx.fill();
      }

      phaseRef.current += isSpeaking ? 0.12 : isThinking ? 0.08 : 0.03;
      animFrameRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [isSpeaking, isListening, isThinking]);

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#F4EEFF] via-[#E2DBF0]/70 to-[#DCD6F7]/50 border border-white/60 shadow-sm rounded-2xl overflow-hidden">
      {/* Background glow */}
      <motion.div
        className="absolute inset-0"
        animate={{
          background: isSpeaking
            ? "radial-gradient(ellipse at center, rgba(166,177,225,0.25) 0%, transparent 70%)"
            : isListening
              ? "radial-gradient(ellipse at center, rgba(220,214,247,0.3) 0%, transparent 70%)"
              : "radial-gradient(ellipse at center, rgba(255,255,255,0.4) 0%, transparent 70%)",
        }}
        transition={{ duration: 0.6 }}
      />

      {/* Agent initials circle */}
      <motion.div
        className="relative z-10 w-24 h-24 rounded-full bg-gradient-to-br from-[#A6B1E1] to-[#424874] flex items-center justify-center text-white text-3xl font-bold shadow-md shadow-[#424874]/15 mb-6"
        animate={{
          scale: isSpeaking ? [1, 1.05, 1] : 1,
          boxShadow: isSpeaking
            ? "0 0 30px rgba(166,177,225,0.5)"
            : "0 10px 30px rgba(66,72,116,0.1)",
        }}
        transition={{ duration: 0.8, repeat: isSpeaking ? Infinity : 0 }}
      >
        {agentName.slice(0, 2).toUpperCase()}
      </motion.div>

      {/* Waveform canvas */}
      <canvas
        ref={canvasRef}
        width={400}
        height={80}
        className="relative z-10 w-full max-w-sm"
      />

      <StateIndicator state={state} />
    </div>
  );
}

function StateIndicator({ state }: { state: AvatarState }) {
  const labels: Record<AvatarState, string> = {
    idle: "Ready",
    listening: "Listening...",
    processing: "Processing...",
    thinking: "Thinking...",
    speaking: "Speaking",
  };

  const colors: Record<AvatarState, string> = {
    idle: "bg-slate-400",
    listening: "bg-blue-500",
    processing: "bg-amber-500",
    thinking: "bg-amber-500",
    speaking: "bg-[#424874]",
  };

  return (
    <motion.div
      className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/80 border border-slate-200/50 shadow-sm backdrop-blur-sm"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <motion.div
        className={`w-2 h-2 rounded-full ${colors[state]}`}
        animate={{ opacity: state !== "idle" ? [1, 0.4, 1] : 1 }}
        transition={{ duration: 1, repeat: state !== "idle" ? Infinity : 0 }}
      />
      <span className="text-xs text-slate-700 font-semibold">
        {labels[state]}
      </span>
    </motion.div>
  );
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

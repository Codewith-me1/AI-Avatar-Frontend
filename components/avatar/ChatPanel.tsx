"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { X, SendHorizonal } from "lucide-react";

export interface ChatMessage {
  id: string;
  from: "user" | "agent";
  text: string;
  final: boolean;
}

interface ChatPanelProps {
  messages: ChatMessage[];
  onSend: (text: string) => void;
  onClose: () => void;
}

export function ChatPanel({ messages, onSend, onClose }: ChatPanelProps) {
  const [draft, setDraft] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to the newest message
  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  const send = () => {
    const text = draft.trim();
    if (!text) return;
    onSend(text);
    setDraft("");
  };

  return (
    <motion.div
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ type: "tween", duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
      className="absolute top-0 right-0 bottom-0 w-[270px] z-40 flex flex-col
                 bg-[#0d1220]/95 backdrop-blur-md border-l border-white/10"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <span className="text-sm font-semibold text-white">Chat</span>
        <button
          onClick={onClose}
          className="w-7 h-7 flex items-center justify-center rounded-md
                     text-white/60 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X size={15} />
        </button>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-3 py-3 space-y-2"
      >
        {messages.length === 0 && (
          <p className="text-white/30 text-xs text-center mt-6">
            The conversation will appear here.
          </p>
        )}
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex ${m.from === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] px-3 py-2 rounded-2xl text-[12.5px] leading-snug
                ${
                  m.from === "user"
                    ? "bg-indigo-600 text-white rounded-br-md"
                    : "bg-[#2a3350] text-white/95 rounded-bl-md"
                } ${!m.final ? "opacity-70" : ""}`}
            >
              {m.text}
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="p-3 border-t border-white/10">
        <div
          className="flex items-center gap-2 bg-white/5 border border-white/10
                        rounded-xl px-3 py-2 focus-within:border-indigo-400/60"
        >
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Type a message…"
            className="flex-1 bg-transparent text-[13px] text-white placeholder-white/30
                       outline-none"
          />
          <button
            onClick={send}
            disabled={!draft.trim()}
            className="text-indigo-300 hover:text-indigo-100 disabled:text-white/20
                       transition-colors"
          >
            <SendHorizonal size={16} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import { ArrowLeft, Mic, Info, Server, Settings } from "lucide-react";
import { apiClient } from "@/lib/api/client";
import { useAgentStore } from "@/store";
import { ConversationView } from "@/components/avatar/ConversationView";
import type { Agent } from "@/types";

export default function AgentTestPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { agents } = useAgentStore();
  const [agent, setAgent] = useState<Agent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAgent();
  }, [id]);

  const loadAgent = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await apiClient.get<Agent>(`/api/agents/${id}`);
      setAgent(data);
    } catch (err) {
      console.warn(
        "Failed to load agent from API to test, searching local store",
        err,
      );
      const localAgent = agents.find((a) => a.id === id);
      if (localAgent) {
        setAgent(localAgent);
      } else {
        setError("Unable to find agent configuration.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-3 text-slate-400">
        <div className="w-10 h-10 border-4 border-[#424874] border-t-transparent rounded-full animate-spin" />
        <span className="text-sm font-semibold">
          Initializing voice session sandbox...
        </span>
      </div>
    );
  }

  if (error || !agent) {
    return (
      <div className="p-8 max-w-md mx-auto text-center space-y-6">
        <div className="p-6 bg-rose-50 border border-rose-200 rounded-2xl text-rose-600 shadow-sm">
          <p className="font-bold mb-1 text-rose-700">Configuration Error</p>
          <p className="text-xs text-rose-600/80">
            {error || "Agent details could not be loaded."}
          </p>
        </div>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-[#424874] hover:text-[#353b61] text-sm font-semibold"
        >
          <ArrowLeft size={16} />
          Return to Console
        </Link>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6 h-[calc(100vh-64px-64px)] flex flex-col min-h-0">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 flex-none">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-slate-400 font-semibold">
            <Link
              href="/dashboard"
              className="hover:text-[#424874] transition-colors"
            >
              Agents
            </Link>
            <span>/</span>
            <Link
              href={`/dashboard/agents/${agent.id}`}
              className="hover:text-[#424874] transition-colors"
            >
              {agent.name}
            </Link>
            <span>/</span>
            <span className="text-slate-600">Sandbox Test</span>
          </div>

          <h1 className="text-xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-[#424874] to-slate-800 flex items-center gap-2">
            <Mic size={18} className="text-[#A6B1E1]" />
            Voice Sandbox: {agent.name}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Link href={`/dashboard/agents/${agent.id}`}>
            <button className="flex items-center gap-1.5 px-3 py-2 bg-white/60 hover:bg-slate-100 text-slate-600 hover:text-slate-800 border border-slate-200 text-xs font-semibold rounded-xl transition-all shadow-sm cursor-pointer">
              <Settings size={14} />
              Configure Settings
            </button>
          </Link>
          <div className="flex items-center gap-2 bg-[#DCD6F7]/50 border border-[#A6B1E1]/40 px-3 py-2 rounded-xl text-xs text-[#424874] font-bold shadow-sm">
            <Server size={12} className="text-[#424874]" />
            RT Pipeline: WebRTC
          </div>
        </div>
      </div>

      {/* Main Sandbox Box */}
      <div className="flex-1 glass-panel rounded-3xl overflow-hidden shadow-lg border border-white/60 relative flex flex-col min-h-0">
        {/* Info Tip banner */}
        <div className="px-6 py-3 bg-[#DCD6F7]/50 border-b border-[#A6B1E1]/40 text-[11px] text-[#424874] flex items-center gap-2 flex-none font-semibold">
          <Info size={14} className="flex-none text-[#424874]" />
          <span>
            Click the microphone button to start a WebSocket and WebRTC stream
            with the agent. Make sure your browser has mic permissions enabled.
          </span>
        </div>

        {/* Conversation Box */}
        <div className="flex-1 min-h-0">
          <ConversationView agent={agent} />
        </div>
      </div>
    </div>
  );
}

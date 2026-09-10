"use client";

import { useState } from "react";
import { Plus, Search, Blocks, MoreHorizontal, X, Info } from "lucide-react";

interface Tool {
  name: string;
  type: "System" | "Custom";
  description: string;
  auth: string;
}

const SYSTEM_TOOLS: Tool[] = [
  {
    name: "end_call",
    type: "System",
    description:
      "Gracefully end the conversation when appropriate. Call this when the user indicates completion (\"that's what I needed\", \"all set\"), says goodbye, or all needs are answered.",
    auth: "None",
  },
  {
    name: "skip_turn",
    type: "System",
    description:
      "Skip the agent's turn when the user signals they need a moment to think or do something first. Do not speak after calling it — wait for the user. Triggers on \"give me a second\", \"let me think\", \"hold on\".",
    auth: "None",
  },
];

export default function ToolsPage() {
  const [query, setQuery] = useState("");
  const [showInfo, setShowInfo] = useState(false);

  const tools = SYSTEM_TOOLS.filter(
    (t) =>
      t.name.toLowerCase().includes(query.toLowerCase()) ||
      t.description.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div className="p-8! md:p-10! max-w-[1320px] mx-auto! w-full!">
      <div className="flex items-center justify-between gap-4! mb-6!">
        <h1 className="text-[24px] font-semibold text-[var(--ink)] tracking-tight">
          Tools
        </h1>
        <button
          onClick={() => setShowInfo((v) => !v)}
          className="btn-dark px-4! py-2.5! text-[13.5px]"
        >
          <Plus size={16} /> Add tool
        </button>
      </div>

      {showInfo && (
        <div className="flex items-start gap-3! bg-[var(--violet-050)] border border-[var(--violet-100)] rounded-2xl p-4! mb-6!">
          <Info size={18} className="text-[var(--violet-700)] shrink-0 mt-0.5!" />
          <div className="flex-1 text-[13px] text-[var(--slate)] leading-relaxed">
            <p className="font-semibold text-[var(--ink)] mb-0.5!">
              Custom tools are attached per agent
            </p>
            Add webhook-backed actions from an agent&apos;s{" "}
            <span className="font-medium text-[var(--ink)]">Behavior</span> step,
            where you can wire them to the exact conversation. The system tools
            below are available to every agent automatically.
          </div>
          <button
            onClick={() => setShowInfo(false)}
            className="w-7! h-7! grid place-items-center rounded-lg text-[var(--muted)] hover:bg-white transition-colors shrink-0"
          >
            <X size={15} />
          </button>
        </div>
      )}

      <div className="bg-white border border-[var(--line)] rounded-2xl shadow-[var(--shadow-sm)] overflow-hidden">
        {/* Search */}
        <div className="p-3! border-b border-[var(--line)]">
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3.5! top-1/2 -translate-y-1/2 text-[var(--muted)]"
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search tools…"
              className="fld pl-10! pr-4! py-2.5!"
            />
          </div>
        </div>

        {/* Table header */}
        <div className="hidden md:grid grid-cols-[1.4fr_0.7fr_3fr_0.9fr_auto] gap-4! px-5! py-3! border-b border-[var(--line)] text-[11px] font-semibold text-[var(--muted)] uppercase tracking-wide">
          <span>Name</span>
          <span>Type</span>
          <span>Description</span>
          <span>Authentication</span>
          <span />
        </div>

        {/* Rows */}
        {tools.map((t) => (
          <div
            key={t.name}
            className="grid grid-cols-1 md:grid-cols-[1.4fr_0.7fr_3fr_0.9fr_auto] gap-2! md:gap-4! px-5! py-4! border-b border-[var(--line)] last:border-0 hover:bg-[var(--sidebar-hover)]/50 transition-colors"
          >
            <span className="flex items-center gap-2.5! font-medium text-[var(--ink)] text-[14px]">
              <span className="w-7! h-7! rounded-lg grid place-items-center bg-[var(--violet-050)] text-[var(--violet-700)] border border-[var(--violet-100)] shrink-0">
                <Blocks size={14} />
              </span>
              {t.name}
            </span>
            <span className="flex items-center text-[13px] text-[var(--slate)]">
              <span className="inline-flex items-center text-[11.5px] font-medium text-[var(--slate)] bg-[var(--line-soft)] border border-[var(--line)] px-2! py-0.5! rounded-full">
                {t.type}
              </span>
            </span>
            <span className="text-[13px] text-[var(--slate)] leading-snug line-clamp-2">
              {t.description}
            </span>
            <span className="flex items-center text-[13px] text-[var(--slate)]">
              {t.auth}
            </span>
            <span className="flex items-center justify-end">
              <button className="w-8! h-8! grid place-items-center rounded-lg text-[var(--muted)] hover:bg-white hover:text-[var(--ink)] border border-transparent hover:border-[var(--line)] transition-colors">
                <MoreHorizontal size={16} />
              </button>
            </span>
          </div>
        ))}

        {tools.length === 0 && (
          <p className="text-center text-[13px] text-[var(--muted)] py-10!">
            No tools match “{query}”.
          </p>
        )}
      </div>
    </div>
  );
}

"use client";

/**
 * Agent sandbox.
 *
 * It frames /widget/preview/[agentId], which loads the real
 * public/components/widget/widget.js — the exact script the embed snippet
 * pulls in. So the launcher, mic/speaker/chat/end controls, the chat panel
 * with transcripts, media cards, conversation starters, the call timer and
 * the end-of-call screen are the shipping widget, not a second implementation
 * that would quietly drift from it.
 */

import { use, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ChevronLeft,
  ExternalLink,
  Info,
  Loader2,
  Monitor,
  RefreshCw,
  Settings,
  Smartphone,
} from "lucide-react";
import { getAgent, updateAgent } from "@/lib/api/agents";
import { useToast } from "@/components/widget/Toast";
import { GhostButton, Spinner } from "@/components/console/ui";
import type { Agent } from "@/types";

type Device = "desktop" | "mobile";

export default function AgentSandboxPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { showToast } = useToast();

  const [agent, setAgent] = useState<Agent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [device, setDevice] = useState<Device>("desktop");
  // Bumping this remounts the iframe, which is the cleanest way to restart the
  // widget after changing the agent's settings.
  const [frameKey, setFrameKey] = useState(0);
  const [publishing, setPublishing] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setAgent(await getAgent(id));
    } catch (e) {
      setError(e instanceof Error ? e.message : "This agent could not be loaded.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  /**
   * The widget's config endpoint only serves public agents, so a private one
   * would render "Assistant unavailable" here with no explanation. Offer the
   * fix rather than the symptom.
   */
  const makeEmbeddable = async () => {
    setPublishing(true);
    try {
      const updated = await updateAgent(id, { is_public: true });
      setAgent(updated);
      setFrameKey((k) => k + 1);
      showToast({ type: "success", title: "Agent is now embeddable" });
    } catch (e) {
      showToast({
        type: "error",
        title: "Could not publish the agent",
        message: e instanceof Error ? e.message : "Try again.",
      });
    } finally {
      setPublishing(false);
    }
  };

  if (loading) {
    return (
      <div className="grid place-items-center py-32! gap-4!">
        <Spinner />
        <span className="text-[13px] text-[var(--muted)]">Loading sandbox…</span>
      </div>
    );
  }

  if (error || !agent) {
    return (
      <div className="p-8! md:p-10! max-w-[720px] mx-auto!">
        <div className="bg-white border border-red-200 rounded-2xl p-6! text-center">
          <AlertCircle size={22} className="text-red-500 mx-auto! mb-2!" />
          <p className="text-[15px] font-semibold text-[var(--ink)]">
            Agent unavailable
          </p>
          <p className="text-[13px] text-[var(--slate)] mt-1!">
            {error || "It may have been deleted."}
          </p>
          <Link
            href="/dashboard/agents"
            className="btn-dark px-4! py-2.5! text-[13.5px] mt-5! inline-flex"
          >
            Back to agents
          </Link>
        </div>
      </div>
    );
  }

  const previewUrl = `/widget/preview/${id}`;

  return (
    <div className="p-6! md:p-10! max-w-[1200px] mx-auto! w-full!">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-3! mb-6!">
        <Link href={`/dashboard/agents/${id}`}>
          <span className="w-9! h-9! grid place-items-center rounded-lg border border-[var(--line)] bg-white text-[var(--slate)] hover:bg-[var(--sidebar-hover)] transition-colors">
            <ChevronLeft size={18} />
          </span>
        </Link>
        <div className="min-w-0">
          <h1 className="text-[20px] font-semibold text-[var(--ink)] tracking-tight truncate">
            Sandbox — {agent.name}
          </h1>
          <p className="text-[12.5px] text-[var(--muted)]">
            The live widget, exactly as a visitor sees it
          </p>
        </div>

        <div className="flex items-center gap-2! ml-auto">
          <div className="inline-flex items-center gap-1! bg-white border border-[var(--line)] rounded-lg p-1! shadow-[var(--shadow-sm)]">
            {(
              [
                { key: "desktop" as const, icon: <Monitor size={15} />, label: "Desktop" },
                { key: "mobile" as const, icon: <Smartphone size={15} />, label: "Mobile" },
              ]
            ).map((d) => (
              <button
                key={d.key}
                onClick={() => setDevice(d.key)}
                title={d.label}
                className={`w-9! h-8! grid place-items-center rounded-md transition-colors ${
                  device === d.key
                    ? "bg-[var(--ink)] text-white"
                    : "text-[var(--muted)] hover:bg-[var(--sidebar-hover)]"
                }`}
              >
                {d.icon}
              </button>
            ))}
          </div>

          <GhostButton onClick={() => setFrameKey((k) => k + 1)} className="py-2.5!">
            <RefreshCw size={14} /> Restart
          </GhostButton>

          <Link href={`/dashboard/agents/${id}`}>
            <span className="inline-flex items-center gap-2! rounded-lg border border-[var(--line)] bg-white px-3.5! py-2.5! text-[13px] font-semibold text-[var(--slate)] hover:bg-[var(--sidebar-hover)] transition-colors">
              <Settings size={14} /> Settings
            </span>
          </Link>
        </div>
      </div>

      {!agent.is_public && (
        <div className="flex flex-wrap items-center gap-3! bg-amber-50 border border-amber-200 rounded-xl px-4! py-3! mb-5!">
          <AlertCircle size={16} className="text-amber-700 shrink-0" />
          <p className="text-[13px] text-amber-800 flex-1 min-w-[240px]!">
            This agent isn&apos;t embeddable yet, so the widget will refuse to
            connect — the public config endpoint only serves published agents.
          </p>
          <button
            onClick={makeEmbeddable}
            disabled={publishing}
            className="inline-flex items-center gap-2! rounded-lg bg-amber-600 hover:bg-amber-700 text-white px-4! py-2! text-[12.5px] font-semibold transition-colors disabled:opacity-60"
          >
            {publishing && <Loader2 size={13} className="animate-spin" />}
            Make embeddable
          </button>
        </div>
      )}

      <div className="flex items-start gap-2.5! bg-[var(--violet-050)] border border-[var(--violet-100)] rounded-xl px-4! py-3! mb-5!">
        <Info size={15} className="text-[var(--violet-700)] shrink-0 mt-0.5!" />
        <p className="text-[12.5px] text-[var(--slate)] leading-relaxed">
          This frame runs the same{" "}
          <code className="text-[12px]">widget.js</code> your embed snippet
          loads — launcher, mic and speaker controls, the chat tab with
          transcripts and media, conversation starters, and the end-of-call
          screen all behave as they will in production. Click the launcher in
          the bottom-right to start; your browser will ask for microphone
          access, and a live call consumes conversation credits.
        </p>
      </div>

      {/* Browser-chrome frame around the preview site */}
      <div
        className={`mx-auto! transition-all ${
          device === "mobile" ? "max-w-[430px]!" : "max-w-full!"
        }`}
      >
        <div className="rounded-2xl border border-[var(--line)] bg-white shadow-[var(--shadow-md)] overflow-hidden">
          <div className="flex items-center gap-2! px-4! py-2.5! border-b border-[var(--line)] bg-[var(--sidebar)]">
            <span className="flex gap-1.5!">
              <i className="w-2.5! h-2.5! rounded-full bg-[#ff5f57] block" />
              <i className="w-2.5! h-2.5! rounded-full bg-[#febc2e] block" />
              <i className="w-2.5! h-2.5! rounded-full bg-[#28c840] block" />
            </span>
            <span className="flex-1 mx-2! text-center text-[11.5px] text-[var(--muted)] bg-white border border-[var(--line)] rounded-md py-1! truncate">
              your-website.com
            </span>
            <a
              href={previewUrl}
              target="_blank"
              rel="noreferrer"
              title="Open the preview in a new tab"
              className="w-7! h-7! grid place-items-center rounded-md text-[var(--muted)] hover:text-[var(--ink)] hover:bg-white transition-colors"
            >
              <ExternalLink size={13} />
            </a>
          </div>

          <iframe
            key={frameKey}
            src={previewUrl}
            title={`${agent.name} widget preview`}
            // Nested delegation: the widget mounts its own iframe inside this
            // one, so the microphone has to be allowed at both levels.
            allow="microphone; camera; autoplay; clipboard-write; fullscreen"
            className={`w-full! block border-0 bg-white ${
              device === "mobile" ? "h-[780px]!" : "h-[720px]!"
            }`}
          />
        </div>
      </div>
    </div>
  );
}

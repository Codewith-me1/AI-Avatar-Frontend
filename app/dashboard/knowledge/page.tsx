"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  BookOpen,
  ChevronLeft,
  FilePlus2,
  Globe,
  Plus,
  Settings,
} from "lucide-react";
import { listAgents } from "@/lib/api/agents";
import { getSummary } from "@/lib/api/knowledge";
import { KnowledgeManager } from "@/components/knowledge/KnowledgeManager";
import { Spinner } from "@/components/console/ui";
import type { Agent, KnowledgeSummary } from "@/types";

export default function KnowledgePage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [summaries, setSummaries] = useState<Record<string, KnowledgeSummary>>({});
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Agent | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const list = (await listAgents()).filter((a) => !a.id.startsWith("demo-"));
      setAgents(list);
      // Counts per agent — one summary call each, in parallel. A failure just
      // leaves that card without counts rather than emptying the page.
      const entries = await Promise.all(
        list.map(async (a) => {
          try {
            return [a.id, await getSummary(a.id)] as const;
          } catch {
            return null;
          }
        }),
      );
      setSummaries(
        Object.fromEntries(entries.filter(Boolean) as [string, KnowledgeSummary][]),
      );
    } catch {
      setAgents([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // ── One agent's knowledge ──────────────────────────────────────────────────
  if (selected) {
    return (
      <div className="p-8! md:p-10! max-w-[1100px] mx-auto! w-full!">
        <div className="flex items-center gap-3! mb-6!">
          <button
            onClick={() => {
              setSelected(null);
              load();
            }}
            className="w-9! h-9! grid place-items-center rounded-lg border border-[var(--line)] bg-white text-[var(--slate)] hover:bg-[var(--sidebar-hover)] transition-colors"
          >
            <ChevronLeft size={18} />
          </button>
          <div className="min-w-0">
            <h1 className="text-[20px] font-semibold text-[var(--ink)] tracking-tight truncate">
              {selected.name}
            </h1>
            <p className="text-[12.5px] text-[var(--muted)] truncate">
              Knowledge base · upload, edit, re-index
            </p>
          </div>
          <Link
            href={`/dashboard/agents/${selected.id}`}
            className="ml-auto inline-flex items-center gap-2! rounded-lg border border-[var(--line)] bg-white px-3.5! py-2! text-[13px] font-semibold text-[var(--slate)] hover:bg-[var(--sidebar-hover)] transition-colors"
          >
            <Settings size={14} /> Agent settings
          </Link>
        </div>

        <KnowledgeManager
          agentId={selected.id}
          knowledgeMode={selected.knowledge_mode}
          onModeChange={(mode) =>
            setSelected((a) => (a ? { ...a, knowledge_mode: mode } : a))
          }
        />
      </div>
    );
  }

  // ── Agent picker ───────────────────────────────────────────────────────────
  return (
    <div className="p-8! md:p-10! max-w-[1320px] mx-auto! w-full!">
      <div className="flex items-center justify-between gap-4! mb-2!">
        <h1 className="text-[24px] font-semibold text-[var(--ink)] tracking-tight">
          Knowledge
        </h1>
        {agents.length > 0 && (
          <button
            onClick={() => setSelected(agents[0])}
            className="btn-dark px-4! py-2.5! text-[13.5px]"
          >
            <Plus size={16} /> Add knowledge
          </button>
        )}
      </div>
      <p className="text-[13px] text-[var(--slate)] mb-6!">
        Knowledge attaches to an agent. Pick one to upload files, paste text,
        crawl a site, or edit what it already knows.
      </p>

      {loading ? (
        <div className="grid place-items-center py-24!">
          <Spinner />
        </div>
      ) : agents.length === 0 ? (
        <div className="bg-white border border-[var(--line)] rounded-2xl shadow-[var(--shadow-sm)]">
          <div className="grid place-items-center text-center py-20! px-6!">
            <span className="w-14! h-14! rounded-2xl grid place-items-center bg-[var(--violet-050)] text-[var(--violet-700)] border border-[var(--violet-100)] mb-4!">
              <FilePlus2 size={26} />
            </span>
            <h2 className="text-[17px] font-semibold text-[var(--ink)]">
              Build your knowledge base
            </h2>
            <p className="text-[13.5px] text-[var(--slate)] mt-1.5! max-w-[380px]!">
              Upload files, paste text, or crawl a website so your agents can
              answer from your own content. Create an agent first — knowledge
              belongs to one.
            </p>
            <Link
              href="/dashboard/agents?new=1"
              className="mt-6! inline-flex items-center gap-2! bg-white border border-[var(--line)] text-[var(--ink)] text-[13.5px] font-semibold px-4! py-2.5! rounded-xl hover:bg-[var(--sidebar-hover)] transition-colors"
            >
              <Plus size={16} /> New agent
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4!">
          {agents.map((a) => {
            const s = summaries[a.id];
            const website = s?.kbs.find((k) => k.kb_type === "website");
            return (
              <button
                key={a.id}
                onClick={() => setSelected(a)}
                className="group text-left bg-white border border-[var(--line)] rounded-2xl p-5! shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] hover:border-[var(--violet-100)] transition-all"
              >
                <div className="flex items-center justify-between mb-4!">
                  <span className="w-10! h-10! rounded-xl grid place-items-center bg-[var(--violet-050)] text-[var(--violet-700)] border border-[var(--violet-100)]">
                    <BookOpen size={18} />
                  </span>
                  <ArrowUpRight
                    size={16}
                    className="text-[var(--muted)] group-hover:text-[var(--violet-700)] transition-colors"
                  />
                </div>
                <p className="text-[14.5px] font-semibold text-[var(--ink)] leading-tight truncate">
                  {a.name}
                </p>
                <p className="text-[12.5px] text-[var(--slate)] mt-1! line-clamp-2 leading-snug">
                  {a.description || "Manage this agent's documents and sources."}
                </p>

                <div className="flex flex-wrap items-center gap-2! mt-4!">
                  <Pill>
                    {s ? `${s.total_documents} document${s.total_documents === 1 ? "" : "s"}` : "—"}
                  </Pill>
                  {s && s.total_chunks > 0 && <Pill>{s.total_chunks} chunks</Pill>}
                  {website && (
                    <Pill>
                      <Globe size={10} /> {website.crawl_status || "website"}
                    </Pill>
                  )}
                  {s && (
                    <Pill accent={s.restrict_to_knowledge}>
                      {s.restrict_to_knowledge ? "Strict" : "Hybrid"}
                    </Pill>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Pill({
  children,
  accent,
}: {
  children: React.ReactNode;
  accent?: boolean;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1! text-[11px] font-semibold px-2! py-0.5! rounded-full border ${
        accent
          ? "text-[var(--violet-700)] bg-[var(--violet-050)] border-[var(--violet-100)]"
          : "text-[var(--slate)] bg-[var(--line-soft)] border-[var(--line)]"
      }`}
    >
      {children}
    </span>
  );
}

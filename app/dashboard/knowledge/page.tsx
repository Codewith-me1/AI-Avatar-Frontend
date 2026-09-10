"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, FilePlus2, BookOpen, ArrowUpRight } from "lucide-react";
import { apiClient } from "@/lib/api/client";
import type { Agent } from "@/types";

export default function KnowledgePage() {
  const router = useRouter();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await apiClient.get<Agent[]>("/api/agents/");
        setAgents((data || []).filter((a) => !a.id.startsWith("demo-")));
      } catch {
        setAgents([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const addKnowledge = () => {
    // Knowledge attaches to an agent — send the user to pick or create one.
    if (agents.length === 1) router.push(`/dashboard/agents/${agents[0].id}`);
    else router.push("/dashboard/agents");
  };

  return (
    <div className="p-8! md:p-10! max-w-[1320px] mx-auto! w-full!">
      <div className="flex items-center justify-between gap-4! mb-6!">
        <h1 className="text-[24px] font-semibold text-[var(--ink)] tracking-tight">
          Knowledge
        </h1>
        <button onClick={addKnowledge} className="btn-dark px-4! py-2.5! text-[13.5px]">
          <Plus size={16} /> Add knowledge
        </button>
      </div>

      {loading ? (
        <div className="grid place-items-center py-24!">
          <div className="w-8! h-8! border-2 border-[var(--line)] border-t-[var(--violet)] rounded-full animate-spin" />
        </div>
      ) : agents.length === 0 ? (
        /* Empty state */
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
              answer from your own content.
            </p>
            <button
              onClick={addKnowledge}
              className="mt-6! inline-flex items-center gap-2! bg-white border border-[var(--line)] text-[var(--ink)] text-[13.5px] font-semibold px-4! py-2.5! rounded-xl hover:bg-[var(--sidebar-hover)] transition-colors"
            >
              <Plus size={16} /> Add knowledge
            </button>
          </div>
        </div>
      ) : (
        /* Per-agent knowledge sources */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4!">
          {agents.map((a) => (
            <Link
              key={a.id}
              href={`/dashboard/agents/${a.id}`}
              className="group bg-white border border-[var(--line)] rounded-2xl p-5! shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] hover:border-[var(--violet-100)] transition-all"
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
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

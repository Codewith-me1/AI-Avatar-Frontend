"use client";

/**
 * Which tools one agent runs with.
 *
 * System tools (`end_call`, `skip_turn`) are registered for every agent by the
 * worker, so they are listed as always-on and cannot be switched off here.
 * Custom webhook tools are attached with a single PUT that replaces the set.
 */

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Blocks, ExternalLink, Loader2, Lock } from "lucide-react";
import { listAgentTools, setAgentTools } from "@/lib/api/agents";
import { listTools } from "@/lib/api/tools";
import { useToast } from "@/components/widget/Toast";
import { Spinner, Toggle } from "@/components/console/ui";
import type { ToolRow } from "@/types";

export function ToolsPicker({ agentId }: { agentId: string }) {
  const { showToast } = useToast();
  const [all, setAll] = useState<ToolRow[]>([]);
  const [attached, setAttached] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [everything, mine] = await Promise.all([
        listTools(),
        listAgentTools(agentId),
      ]);
      setAll(everything);
      setAttached(
        mine.filter((t) => t.type === "Custom").map((t) => t.id),
      );
    } catch {
      setAll([]);
    } finally {
      setLoading(false);
    }
  }, [agentId]);

  useEffect(() => {
    load();
  }, [load]);

  const toggle = async (tool: ToolRow, on: boolean) => {
    const next = on
      ? [...attached, tool.id]
      : attached.filter((id) => id !== tool.id);
    setAttached(next);
    setSaving(tool.id);
    try {
      await setAgentTools(agentId, next);
    } catch (e) {
      setAttached(attached); // roll back to what the server still has
      showToast({
        type: "error",
        title: "Could not change the tools",
        message: e instanceof Error ? e.message : "Try again.",
      });
    } finally {
      setSaving(null);
    }
  };

  if (loading) {
    return (
      <div className="grid place-items-center py-14!">
        <Spinner />
      </div>
    );
  }

  const system = all.filter((t) => t.type === "System");
  const custom = all.filter((t) => t.type === "Custom");

  return (
    <div className="space-y-5!">
      <div>
        <p className="text-[13px] font-semibold text-[var(--ink)] mb-2!">
          Always on
        </p>
        <div className="space-y-2!">
          {system.map((t) => (
            <div
              key={t.id}
              className="flex items-start gap-3! bg-white border border-[var(--line)] rounded-xl px-4! py-3!"
            >
              <span className="w-7! h-7! rounded-lg grid place-items-center bg-[var(--violet-050)] text-[var(--violet-700)] border border-[var(--violet-100)] shrink-0">
                <Blocks size={14} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[13.5px] font-medium text-[var(--ink)]">
                  {t.name}
                </p>
                <p className="text-[12px] text-[var(--muted)] mt-0.5! leading-snug">
                  {t.description}
                </p>
              </div>
              <span className="flex items-center gap-1.5! text-[11.5px] font-semibold text-[var(--muted)] shrink-0 mt-1!">
                <Lock size={11} /> Built in
              </span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between gap-3! mb-2!">
          <p className="text-[13px] font-semibold text-[var(--ink)]">
            Your tools
          </p>
          <Link
            href="/dashboard/tools"
            className="inline-flex items-center gap-1.5! text-[12.5px] font-semibold text-[var(--violet-700)] hover:text-[var(--violet-600)]"
          >
            Manage tools <ExternalLink size={12} />
          </Link>
        </div>

        {custom.length === 0 ? (
          <div className="border-2 border-dashed border-[var(--line)] rounded-xl py-8! text-center">
            <p className="text-[13px] text-[var(--slate)]">
              No custom tools yet.
            </p>
            <Link
              href="/dashboard/tools"
              className="inline-block mt-1! text-[12.5px] font-semibold text-[var(--violet-700)] hover:text-[var(--violet-600)]"
            >
              Create a webhook tool →
            </Link>
          </div>
        ) : (
          <div className="space-y-2!">
            {custom.map((t) => {
              const on = attached.includes(t.id);
              return (
                <div
                  key={t.id}
                  className="flex items-start gap-3! bg-white border border-[var(--line)] rounded-xl px-4! py-3!"
                >
                  <span className="w-7! h-7! rounded-lg grid place-items-center bg-[var(--violet-050)] text-[var(--violet-700)] border border-[var(--violet-100)] shrink-0">
                    <Blocks size={14} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13.5px] font-medium text-[var(--ink)] truncate">
                      {t.name}
                      {!t.is_enabled && (
                        <span className="ml-2! text-[10.5px] font-semibold text-[var(--muted)] bg-[var(--line-soft)] border border-[var(--line)] px-1.5! py-0.5! rounded">
                          DISABLED
                        </span>
                      )}
                    </p>
                    <p className="text-[12px] text-[var(--muted)] mt-0.5! leading-snug line-clamp-2">
                      {t.description}
                    </p>
                  </div>
                  <div className="shrink-0 mt-0.5! flex items-center gap-2!">
                    {saving === t.id && (
                      <Loader2 size={13} className="animate-spin text-[var(--muted)]" />
                    )}
                    <Toggle on={on} onChange={(v) => toggle(t, v)} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

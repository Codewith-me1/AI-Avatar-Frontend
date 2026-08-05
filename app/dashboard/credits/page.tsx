"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Coins,
  Zap,
  Clock,
  TrendingDown,
  Check,
  Sparkles,
  AlertCircle,
  RefreshCw,
  Plus,
  ArrowRight,
} from "lucide-react";
import {
  getPrimaryAgentId,
  getCreditBalance,
  topUpCredits,
  listConversations,
  getAgentMap,
  fmtDuration,
  relTime,
  visitorLabel,
  type CreditBalance,
  type SessionRow,
} from "@/lib/api/dashboard";

const PACKS = [
  { minutes: 60, price: "$9", label: "Starter", per: "$0.15/min" },
  { minutes: 300, price: "$39", label: "Growth", per: "$0.13/min", popular: true },
  { minutes: 600, price: "$69", label: "Scale", per: "$0.115/min" },
  { minutes: 1500, price: "$149", label: "Business", per: "$0.099/min" },
];

function minutesUsed(sec?: number | null): number {
  return Math.round(((sec || 0) / 60) * 10) / 10;
}

export default function CreditsPage() {
  const [agentId, setAgentId] = useState<string | null>(null);
  const [balance, setBalance] = useState<CreditBalance | null>(null);
  const [rows, setRows] = useState<SessionRow[]>([]);
  const [agentMap, setAgentMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [noAgent, setNoAgent] = useState(false);
  const [error, setError] = useState(false);
  const [busyPack, setBusyPack] = useState<number | null>(null);
  const [flash, setFlash] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(false);
    setNoAgent(false);
    try {
      const id = await getPrimaryAgentId();
      if (!id) {
        setNoAgent(true);
        setLoading(false);
        return;
      }
      setAgentId(id);
      const [bal, sessions, map] = await Promise.all([
        getCreditBalance(id),
        listConversations({ limit: 50 }),
        getAgentMap(),
      ]);
      setBalance(bal);
      setRows(sessions || []);
      setAgentMap(map);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleTopUp = async (minutes: number) => {
    if (!agentId) return;
    setBusyPack(minutes);
    setFlash(null);
    try {
      const updated = await topUpCredits(agentId, minutes);
      setBalance(updated);
      setFlash(`Added ${minutes} minutes to your balance.`);
      setTimeout(() => setFlash(null), 4000);
    } catch {
      setFlash("Couldn't add credits — please try again.");
      setTimeout(() => setFlash(null), 4000);
    } finally {
      setBusyPack(null);
    }
  };

  const agentName = (id: string) => agentMap[id] || `Agent ${id.slice(0, 6)}`;
  const totalMin = balance?.credits_minutes ?? 0;
  const usedMin = balance?.credits_used_minutes ?? 0;
  const remainingMin = balance?.remaining_minutes ?? 0;
  const usedPct = totalMin > 0 ? Math.min(100, (usedMin / totalMin) * 100) : 0;

  return (
    <div className="min-h-full text-[var(--foreground)] p-8! md:p-12!">
      <div className="max-w-[1400px] mx-auto!">
        {/* Header */}
        <div className="flex flex-wrap items-end justify-between gap-4! mb-8!">
          <div>
            <span className="eyebrow mb-3!">
              <Coins size={11} /> Billing
            </span>
            <h1 className="text-[28px] font-semibold text-[var(--ink)] tracking-tight mt-3!">
              Credits
            </h1>
            <p className="text-sm text-[var(--slate)] mt-1.5!">
              Conversation minutes for your avatars — top up and track usage per session.
            </p>
          </div>
          <button
            onClick={load}
            className="inline-flex items-center gap-2! bg-white border border-[var(--line)] text-[var(--slate)] hover:text-[var(--ink)] text-[13px] font-semibold px-4! py-2.5! rounded-xl shadow-[var(--shadow-sm)] transition-colors"
          >
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} /> Refresh
          </button>
        </div>

        {flash && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2! text-[13px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-xl px-4! py-3! mb-6!"
          >
            <Check size={15} /> {flash}
          </motion.div>
        )}

        {noAgent ? (
          <div className="bg-white border border-[var(--line)] rounded-2xl p-10! text-center">
            <Coins size={24} className="text-[var(--muted)] mx-auto! mb-3!" />
            <p className="text-[15px] font-semibold text-[var(--ink)]">
              No agent yet
            </p>
            <p className="text-[13px] text-[var(--muted)] mt-1! mb-5!">
              Credits are tied to your workspace. Create an agent to start using them.
            </p>
            <Link
              href="/dashboard/agents"
              className="inline-flex items-center gap-2! text-white text-sm font-semibold px-5! py-2.5! rounded-xl"
              style={{ background: "var(--grad)" }}
            >
              <Plus size={16} /> Create an agent
            </Link>
          </div>
        ) : error ? (
          <div className="bg-white border border-[var(--line)] rounded-2xl p-8! flex items-center gap-3! text-[13px] text-rose-600">
            <AlertCircle size={18} className="shrink-0" />
            Couldn&apos;t reach the credits API. Check the server URL in Settings, then refresh.
          </div>
        ) : (
          <>
            {/* Balance hero + stats */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5! mb-6!">
              {/* Big balance card */}
              <div
                className="lg:col-span-2 rounded-2xl p-6! md:p-8! text-white relative overflow-hidden"
                style={{ background: "var(--grad)" }}
              >
                <div
                  className="absolute inset-0 opacity-20"
                  style={{
                    backgroundImage:
                      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Ccircle cx='1' cy='1' r='1' fill='white'/%3E%3C/svg%3E\")",
                  }}
                />
                <div className="relative">
                  <div className="flex items-center justify-between mb-5!">
                    <span className="text-[13px] font-medium text-white/80">
                      Remaining balance
                    </span>
                    {balance?.exhausted && (
                      <span className="text-[11px] font-semibold bg-white/20 border border-white/30 rounded-full px-2.5! py-1!">
                        Exhausted
                      </span>
                    )}
                  </div>
                  <div className="flex items-end gap-2! mb-1!">
                    <span className="text-[46px] font-semibold font-display leading-none">
                      {loading ? "—" : Math.floor(remainingMin)}
                    </span>
                    <span className="text-[15px] text-white/75 mb-1.5!">minutes left</span>
                  </div>
                  <div className="h-2! w-full! rounded-full bg-white/20 overflow-hidden mt-5! mb-2!">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${usedPct}%` }}
                      transition={{ duration: 0.7, ease: "easeOut" }}
                      className="h-full! rounded-full bg-white/85"
                    />
                  </div>
                  <div className="flex items-center justify-between text-[12.5px] text-white/80">
                    <span>{usedMin} min used</span>
                    <span>{totalMin} min total</span>
                  </div>
                </div>
              </div>

              {/* Stat tiles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-5!">
                <div className="bg-white border border-[var(--line)] rounded-2xl p-5! shadow-[var(--shadow-sm)]">
                  <span className="w-9! h-9! rounded-lg grid place-items-center text-[var(--violet-700)] bg-[var(--violet-050)] border border-[var(--violet-100)] mb-3!">
                    <Clock size={16} />
                  </span>
                  <div className="text-[22px] font-semibold text-[var(--ink)] font-display leading-none">
                    {loading ? "—" : `${usedMin}`}
                  </div>
                  <div className="text-[12.5px] text-[var(--slate)] mt-1!">Minutes used</div>
                </div>
                <div className="bg-white border border-[var(--line)] rounded-2xl p-5! shadow-[var(--shadow-sm)]">
                  <span className="w-9! h-9! rounded-lg grid place-items-center text-emerald-600 bg-emerald-50 border border-emerald-100 mb-3!">
                    <Zap size={16} />
                  </span>
                  <div className="text-[22px] font-semibold text-[var(--ink)] font-display leading-none">
                    {loading ? "—" : `${totalMin}`}
                  </div>
                  <div className="text-[12.5px] text-[var(--slate)] mt-1!">Total granted</div>
                </div>
              </div>
            </div>

            {/* Top-up packs */}
            <div className="bg-white border border-[var(--line)] rounded-2xl p-6! shadow-[var(--shadow-sm)] mb-6!">
              <div className="flex items-center gap-2! mb-1!">
                <Sparkles size={16} className="text-[var(--violet-700)]" />
                <h2 className="text-base font-semibold text-[var(--ink)]">
                  Add credits
                </h2>
              </div>
              <p className="text-[13px] text-[var(--slate)] mb-5!">
                Pick a pack — minutes are added to your balance instantly.
              </p>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4!">
                {PACKS.map((p) => (
                  <div
                    key={p.minutes}
                    className={`relative rounded-2xl border p-5! transition-all ${
                      p.popular
                        ? "border-[var(--violet)] bg-[var(--violet-050)]"
                        : "border-[var(--line)] bg-white hover:border-[var(--violet-100)]"
                    }`}
                  >
                    {p.popular && (
                      <span
                        className="absolute -top-2.5! left-1/2 -translate-x-1/2 text-[10px] font-bold text-white px-2.5! py-0.5! rounded-full"
                        style={{ background: "var(--grad)" }}
                      >
                        Best value
                      </span>
                    )}
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-[var(--muted)]">
                      {p.label}
                    </div>
                    <div className="text-[26px] font-semibold text-[var(--ink)] font-display leading-none mt-2!">
                      {p.minutes}
                      <span className="text-[13px] font-normal text-[var(--muted)]"> min</span>
                    </div>
                    <div className="text-[13px] text-[var(--slate)] mt-1!">
                      {p.price}{" "}
                      <span className="text-[var(--muted)]">· {p.per}</span>
                    </div>
                    <button
                      onClick={() => handleTopUp(p.minutes)}
                      disabled={busyPack !== null}
                      className={`mt-4! w-full! flex items-center justify-center gap-1.5! text-[13px] font-semibold py-2.5! rounded-xl transition-all disabled:opacity-60 ${
                        p.popular
                          ? "text-white"
                          : "text-[var(--violet-700)] bg-[var(--violet-050)] border border-[var(--violet-100)] hover:bg-[var(--violet-100)]"
                      }`}
                      style={p.popular ? { background: "var(--grad)" } : undefined}
                    >
                      {busyPack === p.minutes ? (
                        <span className="w-4! h-4! border-2 border-current border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <Plus size={14} /> Add credits
                        </>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Usage per session */}
            <div className="bg-white border border-[var(--line)] rounded-2xl p-6! shadow-[var(--shadow-sm)]">
              <div className="flex items-center gap-2! mb-1!">
                <TrendingDown size={16} className="text-[var(--violet-700)]" />
                <h2 className="text-base font-semibold text-[var(--ink)]">
                  Usage by session
                </h2>
              </div>
              <p className="text-[13px] text-[var(--slate)] mb-5!">
                Each conversation deducts its duration from your balance.
              </p>
              {loading ? (
                <div className="py-8! grid place-items-center">
                  <div className="w-7! h-7! border-2 border-[var(--line)] border-t-[var(--violet)] rounded-full animate-spin" />
                </div>
              ) : rows.length === 0 ? (
                <p className="text-sm text-[var(--muted)] py-6! text-center">
                  No sessions yet — usage will appear here as visitors talk to your agents.
                </p>
              ) : (
                <div className="w-full! overflow-x-auto">
                  <table className="w-full! text-left border-collapse min-w-[560px]!">
                    <thead>
                      <tr className="text-[11px] uppercase tracking-wider text-[var(--muted)] border-b border-[var(--line-soft)]">
                        <th className="font-semibold pb-3! pr-4!">Visitor</th>
                        <th className="font-semibold pb-3! px-4!">Agent</th>
                        <th className="font-semibold pb-3! px-4!">Duration</th>
                        <th className="font-semibold pb-3! px-4!">Minutes used</th>
                        <th className="font-semibold pb-3! pl-4!">When</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((r) => (
                        <tr
                          key={r.id}
                          className="border-b border-[var(--line-soft)] last:border-0 text-[13.5px]"
                        >
                          <td className="py-3.5! pr-4! font-medium text-[var(--ink)] truncate max-w-[160px]!">
                            {visitorLabel(r.external_user_id)}
                          </td>
                          <td className="py-3.5! px-4! text-[var(--slate)] truncate max-w-[140px]!">
                            {agentName(r.agent_id)}
                          </td>
                          <td className="py-3.5! px-4! text-[var(--slate)] tabular-nums">
                            {fmtDuration(r.duration_seconds)}
                          </td>
                          <td className="py-3.5! px-4!">
                            <span className="inline-flex items-center gap-1! text-[12px] font-semibold text-[var(--violet-700)] bg-[var(--violet-050)] border border-[var(--violet-100)] px-2! py-0.5! rounded-full tabular-nums">
                              −{minutesUsed(r.duration_seconds)} min
                            </span>
                          </td>
                          <td className="py-3.5! pl-4! text-[var(--muted)] text-[12.5px] whitespace-nowrap">
                            {relTime(r.started_at)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2! text-[12px] text-[var(--muted)] mt-6!">
              <ArrowRight size={13} /> Deductions are applied automatically when a
              session ends.
            </div>
          </>
        )}
      </div>
    </div>
  );
}

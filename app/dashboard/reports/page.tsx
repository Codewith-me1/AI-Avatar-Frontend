"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  MessageSquare,
  Clock,
  Activity,
  Sparkles,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import {
  getOverview,
  getTimeseries,
  getAgentBreakdown,
  getAgentMap,
  fmtDuration,
  fmtNumber,
  parseUTC,
  type OverviewData,
  type TimeseriesPoint,
  type AgentBreakdown,
} from "@/lib/api/dashboard";

const INTERVALS = [
  { label: "Hourly", value: "hour" },
  { label: "Daily", value: "day" },
  { label: "Weekly", value: "week" },
  { label: "Monthly", value: "month" },
];

function bucketLabel(iso: string | null, interval: string): string {
  const t = parseUTC(iso);
  if (isNaN(t)) return "";
  const d = new Date(t);
  if (interval === "hour")
    return d.toLocaleTimeString([], { hour: "numeric" });
  if (interval === "month")
    return d.toLocaleDateString([], { month: "short" });
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
}

function buildAreaPath(values: number[], w: number, h: number) {
  if (values.length === 0) return { line: "", area: "" };
  if (values.length === 1) values = [values[0], values[0]];
  const max = Math.max(...values, 1);
  const step = w / (values.length - 1);
  const coords = values.map((v, i) => [i * step, h - (v / max) * (h - 6) - 3]);
  const line = coords
    .map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`)
    .join(" ");
  const area = `${line} L${w},${h} L0,${h} Z`;
  return { line, area };
}

export default function ReportsPage() {
  const [interval, setInterval] = useState("day");
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [points, setPoints] = useState<TimeseriesPoint[]>([]);
  const [agents, setAgents] = useState<AgentBreakdown[]>([]);
  const [agentMap, setAgentMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = async (iv: string) => {
    setLoading(true);
    setError(false);
    try {
      const [ov, ts, ag, map] = await Promise.all([
        getOverview(),
        getTimeseries(iv),
        getAgentBreakdown(),
        getAgentMap(),
      ]);
      setOverview(ov);
      setPoints(ts.points || []);
      setAgents((ag || []).sort((a, b) => b.session_count - a.session_count));
      setAgentMap(map);
    } catch {
      setError(true);
      setOverview(null);
      setPoints([]);
      setAgents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [interval]);

  const W = 760;
  const H = 220;
  const counts = points.map((p) => p.session_count);
  const { line, area } = useMemo(() => buildAreaPath(counts, W, H), [points]);

  // Real growth: last bucket vs first bucket.
  const growth = useMemo(() => {
    if (counts.length < 2) return null;
    const first = counts.find((c) => c > 0);
    const last = counts[counts.length - 1];
    if (!first) return null;
    return Math.round(((last - first) / first) * 100);
  }, [counts]);

  const maxAgentSessions = Math.max(...agents.map((a) => a.session_count), 1);
  const agentName = (id: string) => agentMap[id] || `Agent ${id.slice(0, 6)}`;

  const KPIS = overview
    ? [
        {
          label: "Total sessions",
          value: fmtNumber(overview.total_sessions),
          icon: <Activity size={18} />,
          sub: `${overview.active_sessions} active now`,
        },
        {
          label: "Total messages",
          value: fmtNumber(overview.total_messages),
          icon: <MessageSquare size={18} />,
          sub: `${overview.avg_messages_per_session} avg / session`,
        },
        {
          label: "Unique visitors",
          value: fmtNumber(overview.unique_visitors),
          icon: <Users size={18} />,
          sub: "distinct users",
        },
        {
          label: "Avg. duration",
          value: fmtDuration(overview.avg_duration_seconds),
          icon: <Clock size={18} />,
          sub: `${fmtDuration(overview.total_duration_seconds)} total`,
        },
      ]
    : [];

  const statusBreakdown = overview
    ? (() => {
        const total = overview.total_sessions || 0;
        const other = Math.max(
          0,
          total - overview.active_sessions - overview.ended_sessions,
        );
        const pct = (n: number) => (total > 0 ? Math.round((n / total) * 100) : 0);
        return [
          { label: "Ended", count: overview.ended_sessions, pct: pct(overview.ended_sessions), color: "#7c3aed" },
          { label: "Active", count: overview.active_sessions, pct: pct(overview.active_sessions), color: "#fb7185" },
          { label: "Other", count: other, pct: pct(other), color: "#f97316" },
        ].filter((s) => s.count > 0);
      })()
    : [];

  return (
    <div className="min-h-full text-[var(--foreground)] p-8! md:p-12!">
      <div className="max-w-[1400px] mx-auto!">
        {/* Header */}
        <div className="flex flex-wrap items-end justify-between gap-4! mb-8!">
          <div>
            <span className="eyebrow mb-3!">
              <BarChart3 size={11} /> Analytics
            </span>
            <h1 className="text-[28px] font-semibold text-[var(--ink)] tracking-tight mt-3!">
              Reports
            </h1>
            <p className="text-sm text-[var(--slate)] mt-1.5!">
              Engagement and performance across all avatars, live from your data.
            </p>
          </div>
          <div className="flex items-center gap-2!">
            <div className="flex items-center gap-1! bg-white border border-[var(--line)] rounded-xl p-1! shadow-[var(--shadow-sm)]">
              {INTERVALS.map((r) => (
                <button
                  key={r.value}
                  onClick={() => setInterval(r.value)}
                  className={`px-3! py-1.5! rounded-lg text-[12.5px] font-medium transition-colors ${
                    interval === r.value
                      ? "bg-[var(--violet-050)] text-[var(--violet-700)]"
                      : "text-[var(--slate)] hover:text-[var(--ink)]"
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
            <button
              onClick={() => load(interval)}
              className="inline-flex items-center gap-2! bg-white border border-[var(--line)] text-[var(--slate)] hover:text-[var(--ink)] text-[13px] font-semibold px-4! py-2.5! rounded-xl shadow-[var(--shadow-sm)] transition-colors"
            >
              <RefreshCw size={15} className={loading ? "animate-spin" : ""} /> Refresh
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-white border border-[var(--line)] rounded-2xl p-4! mb-6! flex items-center gap-3! text-[13px] text-rose-600">
            <AlertCircle size={18} className="shrink-0" />
            Couldn&apos;t reach the analytics API. Check the server URL in Settings.
          </div>
        )}

        {/* KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5! mb-6!">
          {loading && !overview
            ? [0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-white border border-[var(--line)] rounded-2xl p-5! h-[132px]! animate-pulse"
                />
              ))
            : KPIS.map((k, i) => (
                <motion.div
                  key={k.label}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-white border border-[var(--line)] rounded-2xl p-5! shadow-[var(--shadow-sm)]"
                >
                  <span className="w-10! h-10! rounded-xl grid place-items-center text-[var(--violet-700)] bg-[var(--violet-050)] border border-[var(--violet-100)] mb-4!">
                    {k.icon}
                  </span>
                  <div className="text-[24px] font-semibold text-[var(--ink)] font-display leading-none">
                    {k.value}
                  </div>
                  <div className="text-[13px] text-[var(--slate)] mt-1.5!">
                    {k.label}
                  </div>
                  <div className="text-[12px] text-[var(--muted)] mt-0.5!">
                    {k.sub}
                  </div>
                </motion.div>
              ))}
        </div>

        {/* Area chart */}
        <div className="bg-white border border-[var(--line)] rounded-2xl p-6! shadow-[var(--shadow-sm)] mb-6!">
          <div className="flex items-center justify-between mb-6!">
            <div>
              <h2 className="text-base font-semibold text-[var(--ink)]">
                Session volume
              </h2>
              <p className="text-[13px] text-[var(--slate)] mt-0.5! capitalize">
                Grouped by {interval}
              </p>
            </div>
            {growth !== null && (
              <span
                className={`inline-flex items-center gap-1.5! text-[12px] font-semibold px-2.5! py-1! rounded-full border ${
                  growth >= 0
                    ? "text-emerald-700 bg-emerald-50 border-emerald-100"
                    : "text-rose-600 bg-rose-50 border-rose-100"
                }`}
              >
                {growth >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                {growth >= 0 ? "+" : ""}
                {growth}%
              </span>
            )}
          </div>

          {points.length === 0 ? (
            <div className="h-56! grid place-items-center text-center">
              <div>
                <Sparkles size={22} className="text-[var(--muted)] mx-auto! mb-2!" />
                <p className="text-sm text-[var(--muted)]">
                  No session data for this interval yet.
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="w-full! overflow-hidden">
                <svg
                  viewBox={`0 0 ${W} ${H}`}
                  className="w-full! h-56!"
                  preserveAspectRatio="none"
                >
                  <defs>
                    <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.28" />
                      <stop offset="100%" stopColor="#7c3aed" stopOpacity="0" />
                    </linearGradient>
                    <linearGradient id="lineStroke" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#7c3aed" />
                      <stop offset="100%" stopColor="#fb7185" />
                    </linearGradient>
                  </defs>
                  {[0.25, 0.5, 0.75].map((g) => (
                    <line
                      key={g}
                      x1="0"
                      y1={H * g}
                      x2={W}
                      y2={H * g}
                      stroke="var(--line)"
                      strokeWidth="1"
                    />
                  ))}
                  <motion.path
                    d={area}
                    fill="url(#areaFill)"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6 }}
                  />
                  <motion.path
                    d={line}
                    fill="none"
                    stroke="url(#lineStroke)"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1, ease: "easeInOut" }}
                  />
                </svg>
              </div>
              {/* x-axis labels (thinned to ~8) */}
              <div className="flex justify-between mt-2!">
                {points
                  .filter(
                    (_, i) =>
                      i %
                        Math.max(1, Math.ceil(points.length / 8)) ===
                      0,
                  )
                  .map((p, i) => (
                    <span key={i} className="text-[10px] text-[var(--muted)]">
                      {bucketLabel(p.bucket, interval)}
                    </span>
                  ))}
              </div>
            </>
          )}
        </div>

        {/* Bottom: top agents + status */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6!">
          {/* Top agents table */}
          <div className="lg:col-span-2 bg-white border border-[var(--line)] rounded-2xl p-6! shadow-[var(--shadow-sm)]">
            <h2 className="text-base font-semibold text-[var(--ink)] mb-5!">
              Agent performance
            </h2>
            {agents.length === 0 ? (
              <p className="text-sm text-[var(--muted)] py-6! text-center">
                No agent activity recorded yet.
              </p>
            ) : (
              <div className="w-full! overflow-x-auto">
                <table className="w-full! text-left border-collapse">
                  <thead>
                    <tr className="text-[11px] uppercase tracking-wider text-[var(--muted)]">
                      <th className="font-semibold pb-3! pr-4!">Agent</th>
                      <th className="font-semibold pb-3! px-4!">Sessions</th>
                      <th className="font-semibold pb-3! px-4!">Messages</th>
                      <th className="font-semibold pb-3! px-4!">Avg. duration</th>
                      <th className="font-semibold pb-3! pl-4!">Share</th>
                    </tr>
                  </thead>
                  <tbody>
                    {agents.map((a) => (
                      <tr
                        key={a.agent_id}
                        className="border-t border-[var(--line-soft)] text-[13.5px]"
                      >
                        <td className="py-3.5! pr-4! font-medium text-[var(--ink)]">
                          <span className="flex items-center gap-2.5!">
                            <span
                              className="w-7! h-7! rounded-full grid place-items-center text-white text-[10px] font-semibold shrink-0"
                              style={{ background: "var(--grad)" }}
                            >
                              {agentName(a.agent_id)[0].toUpperCase()}
                            </span>
                            <span className="truncate max-w-[180px]!">
                              {agentName(a.agent_id)}
                            </span>
                          </span>
                        </td>
                        <td className="py-3.5! px-4! text-[var(--slate)] tabular-nums">
                          {fmtNumber(a.session_count)}
                        </td>
                        <td className="py-3.5! px-4! text-[var(--slate)] tabular-nums">
                          {fmtNumber(a.message_count)}
                        </td>
                        <td className="py-3.5! px-4! text-[var(--slate)] tabular-nums">
                          {fmtDuration(a.avg_duration_seconds)}
                        </td>
                        <td className="py-3.5! pl-4!">
                          <div className="flex items-center gap-2!">
                            <div className="w-20! h-1.5! rounded-full bg-[var(--line-soft)] overflow-hidden">
                              <div
                                className="h-full! rounded-full"
                                style={{
                                  width: `${Math.round((a.session_count / maxAgentSessions) * 100)}%`,
                                  background: "var(--grad)",
                                }}
                              />
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Session status breakdown */}
          <div className="bg-white border border-[var(--line)] rounded-2xl p-6! shadow-[var(--shadow-sm)]">
            <h2 className="text-base font-semibold text-[var(--ink)] mb-5!">
              Session status
            </h2>
            {statusBreakdown.length === 0 ? (
              <p className="text-sm text-[var(--muted)] py-6! text-center">
                No sessions yet.
              </p>
            ) : (
              <div className="space-y-4!">
                {statusBreakdown.map((c) => (
                  <div key={c.label}>
                    <div className="flex items-center justify-between mb-1.5!">
                      <span className="text-[13px] text-[var(--slate)] flex items-center gap-2!">
                        <span
                          className="w-2.5! h-2.5! rounded-full"
                          style={{ background: c.color }}
                        />
                        {c.label}
                      </span>
                      <span className="text-[13px] font-semibold text-[var(--ink)] tabular-nums">
                        {c.count} · {c.pct}%
                      </span>
                    </div>
                    <div className="w-full! h-2! rounded-full bg-[var(--line-soft)] overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${c.pct}%` }}
                        transition={{ duration: 0.7, ease: "easeOut" }}
                        className="h-full! rounded-full"
                        style={{ background: c.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

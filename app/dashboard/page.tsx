"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Users,
  MessageSquare,
  Timer,
  UserCheck,
  Plus,
  BarChart3,
  Settings,
  ArrowUpRight,
  Sparkles,
  Activity,
  Globe,
} from "lucide-react";
import {
  getOverview,
  getTimeseries,
  listConversations,
  getAgentMap,
  fmtDuration,
  fmtNumber,
  relTime,
  visitorLabel,
  type OverviewData,
  type TimeseriesPoint,
  type SessionRow,
} from "@/lib/api/dashboard";

function bucketShort(iso: string | null): string {
  if (!iso) return "";
  const hasTz = /[zZ]$|[+-]\d\d:?\d\d$/.test(iso);
  const d = new Date(hasTz ? iso : `${iso}Z`);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
}

export default function DashboardOverview() {
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [points, setPoints] = useState<TimeseriesPoint[]>([]);
  const [recent, setRecent] = useState<SessionRow[]>([]);
  const [agentMap, setAgentMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [ov, ts, sessions, map] = await Promise.all([
          getOverview(),
          getTimeseries("day"),
          listConversations({ limit: 6 }),
          getAgentMap(),
        ]);
        setOverview(ov);
        setPoints((ts.points || []).slice(-12));
        setRecent(sessions || []);
        setAgentMap(map);
      } catch {
        setOverview(null);
        setPoints([]);
        setRecent([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const agentName = (id: string) => agentMap[id] || `Agent ${id.slice(0, 6)}`;
  const agentCount = Object.keys(agentMap).length;

  const STATS = [
    {
      label: "Total sessions",
      value: fmtNumber(overview?.total_sessions ?? 0),
      icon: <Activity size={18} />,
      sub: `${overview?.active_sessions ?? 0} active`,
    },
    {
      label: "Messages",
      value: fmtNumber(overview?.total_messages ?? 0),
      icon: <MessageSquare size={18} />,
      sub: `${overview?.avg_messages_per_session ?? 0} avg / session`,
    },
    {
      label: "Unique visitors",
      value: fmtNumber(overview?.unique_visitors ?? 0),
      icon: <UserCheck size={18} />,
      sub: "distinct users",
    },
    {
      label: "Avg. duration",
      value: fmtDuration(overview?.avg_duration_seconds ?? 0),
      icon: <Timer size={18} />,
      sub: `${fmtDuration(overview?.total_duration_seconds ?? 0)} total`,
    },
  ];

  const maxBar = Math.max(...points.map((p) => p.session_count), 1);

  return (
    <div className="min-h-full text-[var(--foreground)] p-8! md:p-12!">
      <div className="max-w-[1400px] mx-auto!">
        {/* Header */}
        <div className="flex flex-wrap items-end justify-between gap-4! mb-8!">
          <div>
            <span className="eyebrow mb-3!">
              <Sparkles size={11} /> Overview
            </span>
            <h1 className="text-[28px] font-semibold text-[var(--ink)] tracking-tight mt-3!">
              Welcome back 👋
            </h1>
            <p className="text-sm text-[var(--slate)] mt-1.5!">
              Here&apos;s what&apos;s happening across your avatars.
            </p>
          </div>
          <Link
            href="/dashboard/agents"
            className="inline-flex items-center gap-2! text-white text-sm font-semibold px-5! py-2.5! rounded-xl shadow-[0_8px_24px_rgba(124,58,237,0.25)] transition-transform hover:-translate-y-0.5"
            style={{ background: "var(--grad)" }}
          >
            <Plus size={16} /> New agent
          </Link>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5! mb-6!">
          {STATS.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white border border-[var(--line)] rounded-2xl p-5! shadow-[var(--shadow-sm)]"
            >
              <span className="w-10! h-10! rounded-xl grid place-items-center text-[var(--violet-700)] bg-[var(--violet-050)] border border-[var(--violet-100)] mb-4!">
                {s.icon}
              </span>
              <div className="text-[26px] font-semibold text-[var(--ink)] font-display leading-none">
                {loading ? "—" : s.value}
              </div>
              <div className="text-[13px] text-[var(--slate)] mt-1.5!">
                {s.label}
              </div>
              <div className="text-[12px] text-[var(--muted)] mt-0.5!">
                {s.sub}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6!">
          {/* Chart card */}
          <div className="lg:col-span-2 bg-white border border-[var(--line)] rounded-2xl p-6! shadow-[var(--shadow-sm)]">
            <div className="flex items-center justify-between mb-6!">
              <div>
                <h2 className="text-base font-semibold text-[var(--ink)]">
                  Sessions
                </h2>
                <p className="text-[13px] text-[var(--slate)] mt-0.5!">
                  Daily, last {points.length || 0} days
                </p>
              </div>
              <Link
                href="/dashboard/reports"
                className="inline-flex items-center gap-1! text-[13px] font-semibold text-[var(--violet-700)] hover:underline"
              >
                View reports <ArrowUpRight size={14} />
              </Link>
            </div>
            {points.length === 0 ? (
              <div className="h-48! grid place-items-center text-center">
                <p className="text-sm text-[var(--muted)]">
                  {loading ? "Loading…" : "No session activity yet."}
                </p>
              </div>
            ) : (
              <div className="flex items-end gap-2! h-48! w-full!">
                {points.map((p, i) => (
                  <div
                    key={i}
                    className="flex-1 flex flex-col items-center justify-end gap-2! group"
                    title={`${p.session_count} sessions`}
                  >
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${(p.session_count / maxBar) * 100}%` }}
                      transition={{ delay: i * 0.04, type: "spring", stiffness: 120, damping: 18 }}
                      className="w-full! rounded-t-lg opacity-85 group-hover:opacity-100 transition-opacity min-h-[3px]!"
                      style={{ background: "var(--grad)" }}
                    />
                    <span className="text-[10px] text-[var(--muted)] whitespace-nowrap">
                      {bucketShort(p.bucket)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent activity */}
          <div className="bg-white border border-[var(--line)] rounded-2xl p-6! shadow-[var(--shadow-sm)]">
            <div className="flex items-center justify-between mb-5!">
              <div className="flex items-center gap-2! text-[var(--ink)]">
                <Activity size={16} className="text-[var(--violet-700)]" />
                <h2 className="text-base font-semibold">Recent sessions</h2>
              </div>
              <Link
                href="/dashboard/conversations"
                className="text-[12px] font-semibold text-[var(--violet-700)] hover:underline"
              >
                All
              </Link>
            </div>
            {recent.length === 0 ? (
              <p className="text-[13px] text-[var(--muted)] py-4!">
                {loading ? "Loading…" : "No sessions recorded yet."}
              </p>
            ) : (
              <div className="space-y-4!">
                {recent.map((r) => (
                  <Link
                    key={r.id}
                    href="/dashboard/conversations"
                    className="flex items-start gap-3! group"
                  >
                    <span
                      className="w-8! h-8! rounded-full grid place-items-center text-white text-[11px] font-semibold shrink-0"
                      style={{ background: "var(--grad)" }}
                    >
                      {visitorLabel(r.external_user_id)[0].toUpperCase()}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] text-[var(--ink)] leading-snug">
                        <span className="font-semibold">
                          {visitorLabel(r.external_user_id)}
                        </span>{" "}
                        <span className="text-[var(--slate)]">
                          · {agentName(r.agent_id)}
                        </span>
                      </p>
                      <p className="text-[11px] text-[var(--muted)] mt-0.5!">
                        {r.message_count} messages · {relTime(r.started_at)}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5! mt-6!">
          {[
            {
              icon: <Plus size={18} />,
              title: "Create an agent",
              desc: "Design a new avatar in minutes.",
              href: "/dashboard/agents",
            },
            {
              icon: <BarChart3 size={18} />,
              title: "View reports",
              desc: "Track engagement & resolution.",
              href: "/dashboard/reports",
            },
            {
              icon: <Settings size={18} />,
              title: "Configure platform",
              desc: "Manage keys & integrations.",
              href: "/dashboard/settings",
            },
          ].map((q) => (
            <Link
              key={q.title}
              href={q.href}
              className="group bg-white border border-[var(--line)] rounded-2xl p-5! shadow-[var(--shadow-sm)] hover:border-[var(--violet-100)] hover:shadow-[var(--shadow-md)] transition-all"
            >
              <div className="flex items-center justify-between mb-3!">
                <span className="w-10! h-10! rounded-xl grid place-items-center text-white" style={{ background: "var(--grad)" }}>
                  {q.icon}
                </span>
                <ArrowUpRight
                  size={18}
                  className="text-[var(--muted)] group-hover:text-[var(--violet-700)] transition-colors"
                />
              </div>
              <h3 className="text-[15px] font-semibold text-[var(--ink)]">
                {q.title}
              </h3>
              <p className="text-[13px] text-[var(--slate)] mt-1!">{q.desc}</p>
            </Link>
          ))}
        </div>

        {/* footnote */}
        <div className="flex items-center gap-2! text-[12px] text-[var(--muted)] mt-8!">
          <Globe size={13} />{" "}
          {agentCount > 0
            ? `${agentCount} agent${agentCount === 1 ? "" : "s"} connected`
            : "Serving 60+ languages in real time"}
        </div>
      </div>
    </div>
  );
}

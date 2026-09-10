"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Bot,
  BookOpen,
  Blocks,
  CircleUserRound,
  Code2,
  MessageSquare,
  UserCheck,
  Timer,
  Activity,
  ArrowUpRight,
  Sparkles,
  X,
} from "lucide-react";
import {
  getOverview,
  getTimeseries,
  fmtDuration,
  fmtNumber,
  type OverviewData,
  type TimeseriesPoint,
} from "@/lib/api/dashboard";

const GET_STARTED = [
  {
    title: "Create an Agent",
    desc: "Train a conversational avatar your users will love.",
    icon: <Bot size={20} />,
    tint: "var(--violet)",
    bg: "var(--violet-050)",
    href: "/dashboard/agents?new=1",
  },
  {
    title: "Knowledge base",
    desc: "Upload files so agents answer from your own content.",
    icon: <BookOpen size={20} />,
    tint: "#0ea5e9",
    bg: "#e0f2fe",
    href: "/dashboard/knowledge",
  },
  {
    title: "Tools",
    desc: "Give agents actions they can call mid-conversation.",
    icon: <Blocks size={20} />,
    tint: "#db2777",
    bg: "#fce7f3",
    href: "/dashboard/tools",
  },
  {
    title: "Avatars",
    desc: "Pick a lifelike face for your agent to wear.",
    icon: <CircleUserRound size={20} />,
    tint: "#059669",
    bg: "#d1fae5",
    href: "/dashboard/avatars",
  },
  {
    title: "Embed",
    desc: "Drop the widget into any site with one snippet.",
    icon: <Code2 size={20} />,
    tint: "var(--orange)",
    bg: "#ffedd5",
    href: "/dashboard/agents",
  },
];

function bucketShort(iso: string | null): string {
  if (!iso) return "";
  const hasTz = /[zZ]$|[+-]\d\d:?\d\d$/.test(iso);
  const d = new Date(hasTz ? iso : `${iso}Z`);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
}

export default function DashboardHome() {
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [points, setPoints] = useState<TimeseriesPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBanner, setShowBanner] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [ov, ts] = await Promise.all([getOverview(), getTimeseries("day")]);
        setOverview(ov);
        setPoints((ts.points || []).slice(-14));
      } catch {
        setOverview(null);
        setPoints([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const STATS = [
    {
      label: "Total sessions",
      value: fmtNumber(overview?.total_sessions ?? 0),
      icon: <Activity size={16} />,
      sub: `${overview?.active_sessions ?? 0} active now`,
    },
    {
      label: "Messages",
      value: fmtNumber(overview?.total_messages ?? 0),
      icon: <MessageSquare size={16} />,
      sub: `${overview?.avg_messages_per_session ?? 0} avg / session`,
    },
    {
      label: "Unique visitors",
      value: fmtNumber(overview?.unique_visitors ?? 0),
      icon: <UserCheck size={16} />,
      sub: "distinct users",
    },
    {
      label: "Talk time",
      value: fmtDuration(overview?.total_duration_seconds ?? 0),
      icon: <Timer size={16} />,
      sub: `${fmtDuration(overview?.avg_duration_seconds ?? 0)} avg`,
    },
  ];

  const maxBar = Math.max(...points.map((p) => p.session_count), 1);

  return (
    <div className="p-8! md:p-10! max-w-[1320px] mx-auto! w-full!">
      {/* ── Get started ── */}
      <h1 className="text-[24px] font-semibold text-[var(--ink)] tracking-tight mb-5!">
        Get started
      </h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-3.5! mb-8!">
        {GET_STARTED.map((c, i) => (
          <motion.div
            key={c.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
          >
            <Link
              href={c.href}
              className="group flex flex-col h-full! bg-white border border-[var(--line)] rounded-2xl p-4! shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] hover:border-[var(--violet-100)] transition-all"
            >
              <span
                className="w-10! h-10! rounded-xl grid place-items-center mb-3!"
                style={{ color: c.tint, background: c.bg }}
              >
                {c.icon}
              </span>
              <span className="text-[14px] font-semibold text-[var(--ink)] leading-tight">
                {c.title}
              </span>
              <span className="text-[12px] text-[var(--slate)] mt-1! leading-snug">
                {c.desc}
              </span>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* ── Promo banner ── */}
      {showBanner && (
        <div className="relative overflow-hidden rounded-2xl mb-9! bg-[#141026] text-white">
          <div
            className="absolute inset-0 opacity-60"
            style={{
              background:
                "radial-gradient(120% 140% at 100% 0%, rgba(124,58,237,0.55) 0%, rgba(251,113,133,0.25) 45%, transparent 70%)",
            }}
          />
          <button
            onClick={() => setShowBanner(false)}
            className="absolute top-3.5! right-3.5! z-10 w-7! h-7! rounded-full grid place-items-center text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Dismiss"
          >
            <X size={15} />
          </button>
          <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6! p-7! md:p-9!">
            <div className="max-w-[540px]!">
              <span className="inline-flex items-center gap-1.5! text-[11px] font-semibold text-emerald-300 bg-emerald-400/10 border border-emerald-400/20 px-2.5! py-1! rounded-full mb-3.5!">
                <Sparkles size={11} /> New
              </span>
              <h2 className="text-[22px] md:text-[26px] font-semibold tracking-tight leading-tight text-white">
                Turn any page into an interactive experience
              </h2>
              <p className="text-[14px] text-white/70 mt-2.5! leading-relaxed">
                Let visitors ask questions, get answers, and talk to a lifelike
                AI avatar directly inside your website.
              </p>
              <Link
                href="/dashboard/agents?new=1"
                className="inline-flex items-center gap-2! mt-5! bg-white text-[#141026] text-[13.5px] font-semibold px-5! py-2.5! rounded-xl hover:bg-white/90 transition-colors"
              >
                Try now <ArrowUpRight size={15} />
              </Link>
            </div>
            <div className="hidden md:grid place-items-center w-[220px]! h-[130px]! rounded-2xl bg-white/5 border border-white/10 shrink-0">
              <span
                className="w-14! h-14! rounded-2xl grid place-items-center text-white"
                style={{ background: "var(--grad)" }}
              >
                <Bot size={26} />
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ── Insights snapshot ── */}
      <div className="flex items-end justify-between gap-4! mb-4!">
        <div>
          <h2 className="text-[18px] font-semibold text-[var(--ink)] tracking-tight">
            Insights snapshot
          </h2>
          <p className="text-[12.5px] text-[var(--muted)] mt-0.5!">
            All-time · all agents
          </p>
        </div>
        <Link
          href="/dashboard/reports"
          className="inline-flex items-center gap-1.5! text-[13px] font-semibold text-[var(--ink)] border border-[var(--line)] bg-white px-3.5! py-2! rounded-lg hover:bg-[var(--sidebar-hover)] transition-colors"
        >
          View insights <ArrowUpRight size={14} />
        </Link>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3.5! mb-5!">
        {STATS.map((s) => (
          <div
            key={s.label}
            className="bg-white border border-[var(--line)] rounded-2xl p-4! shadow-[var(--shadow-sm)]"
          >
            <div className="flex items-center gap-2! text-[var(--muted)] mb-3!">
              {s.icon}
              <span className="text-[12px] font-medium text-[var(--slate)]">
                {s.label}
              </span>
            </div>
            <div className="text-[24px] font-semibold text-[var(--ink)] font-display leading-none">
              {loading ? "—" : s.value}
            </div>
            <div className="text-[11.5px] text-[var(--muted)] mt-1.5!">{s.sub}</div>
          </div>
        ))}
      </div>

      <div className="bg-white border border-[var(--line)] rounded-2xl p-6! shadow-[var(--shadow-sm)]">
        <div className="flex items-center justify-between mb-5!">
          <h3 className="text-[15px] font-semibold text-[var(--ink)]">
            Sessions over time
          </h3>
          <span className="text-[12px] text-[var(--muted)]">
            Daily · last {points.length || 0} days
          </span>
        </div>
        {points.length === 0 ? (
          <div className="h-44! grid place-items-center rounded-xl bg-[var(--line-soft)]">
            <p className="text-[13px] text-[var(--muted)]">
              {loading ? "Loading…" : "No session activity yet."}
            </p>
          </div>
        ) : (
          <div className="flex items-end gap-2! h-44! w-full!">
            {points.map((p, i) => (
              <div
                key={i}
                className="flex-1 flex flex-col items-center justify-end gap-2! group"
                title={`${p.session_count} sessions`}
              >
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${(p.session_count / maxBar) * 100}%` }}
                  transition={{ delay: i * 0.03, type: "spring", stiffness: 120, damping: 18 }}
                  className="w-full! rounded-t-md opacity-85 group-hover:opacity-100 transition-opacity min-h-[3px]!"
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
    </div>
  );
}

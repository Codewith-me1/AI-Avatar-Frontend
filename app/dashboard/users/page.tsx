"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Users as UsersIcon,
  Search,
  RefreshCw,
  AlertCircle,
  UserCheck,
  MessageSquare,
  Clock,
  Activity,
} from "lucide-react";
import {
  listConversations,
  getOverview,
  getAgentMap,
  relTime,
  parseUTC,
  fmtDuration,
  fmtNumber,
  visitorLabel,
  type SessionRow,
  type OverviewData,
} from "@/lib/api/dashboard";

interface VisitorRow {
  key: string;
  label: string;
  sessions: number;
  messages: number;
  totalDuration: number;
  lastActive: string | null;
  lastActiveTs: number;
  agents: Set<string>;
  anonymous: boolean;
}

function aggregate(
  rows: SessionRow[],
  agentName: (id: string) => string,
): VisitorRow[] {
  const map = new Map<string, VisitorRow>();
  for (const r of rows) {
    const anonymous = !r.external_user_id;
    const key = anonymous ? "__anon__" : r.external_user_id!;
    let v = map.get(key);
    if (!v) {
      v = {
        key,
        label: anonymous ? "Anonymous visitors" : visitorLabel(r.external_user_id),
        sessions: 0,
        messages: 0,
        totalDuration: 0,
        lastActive: null,
        lastActiveTs: 0,
        agents: new Set(),
        anonymous,
      };
      map.set(key, v);
    }
    v.sessions += 1;
    v.messages += r.message_count || 0;
    v.totalDuration += r.duration_seconds || 0;
    v.agents.add(agentName(r.agent_id));
    const ts = parseUTC(r.started_at);
    if (!isNaN(ts) && ts > v.lastActiveTs) {
      v.lastActiveTs = ts;
      v.lastActive = r.started_at;
    }
  }
  return Array.from(map.values()).sort((a, b) => b.lastActiveTs - a.lastActiveTs);
}

export default function UsersPage() {
  const [rows, setRows] = useState<SessionRow[]>([]);
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [agentMap, setAgentMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [query, setQuery] = useState("");

  const load = async () => {
    setLoading(true);
    setError(false);
    try {
      const [sessions, ov, map] = await Promise.all([
        listConversations({ limit: 200 }),
        getOverview(),
        getAgentMap(),
      ]);
      setRows(sessions || []);
      setOverview(ov);
      setAgentMap(map);
    } catch {
      setError(true);
      setRows([]);
      setOverview(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const agentName = (id: string) => agentMap[id] || `Agent ${id.slice(0, 6)}`;

  const visitors = useMemo(
    () => aggregate(rows, agentName),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [rows, agentMap],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return visitors;
    return visitors.filter(
      (v) =>
        v.label.toLowerCase().includes(q) ||
        [...v.agents].some((a) => a.toLowerCase().includes(q)),
    );
  }, [query, visitors]);

  const totalMessages = visitors.reduce((s, v) => s + v.messages, 0);
  const returning = visitors.filter((v) => !v.anonymous && v.sessions > 1).length;

  const SUMMARY = [
    {
      label: "Unique visitors",
      value: fmtNumber(overview?.unique_visitors ?? visitors.filter((v) => !v.anonymous).length),
      icon: <UserCheck size={18} />,
    },
    {
      label: "Total sessions",
      value: fmtNumber(overview?.total_sessions ?? rows.length),
      icon: <Activity size={18} />,
    },
    {
      label: "Total messages",
      value: fmtNumber(overview?.total_messages ?? totalMessages),
      icon: <MessageSquare size={18} />,
    },
    {
      label: "Returning",
      value: fmtNumber(returning),
      icon: <RefreshCw size={18} />,
    },
  ];

  return (
    <div className="min-h-full text-[var(--foreground)] p-8! md:p-12!">
      <div className="max-w-[1400px] mx-auto!">
        {/* Header */}
        <div className="flex flex-wrap items-end justify-between gap-4! mb-8!">
          <div>
            <span className="eyebrow mb-3!">
              <UsersIcon size={11} /> Audience
            </span>
            <h1 className="text-[28px] font-semibold text-[var(--ink)] tracking-tight mt-3!">
              Users
            </h1>
            <p className="text-sm text-[var(--slate)] mt-1.5!">
              Visitors who talked to your avatars, aggregated from real sessions.
            </p>
          </div>
          <button
            onClick={load}
            className="inline-flex items-center gap-2! bg-white border border-[var(--line)] text-[var(--slate)] hover:text-[var(--ink)] text-[13px] font-semibold px-4! py-2.5! rounded-xl shadow-[var(--shadow-sm)] transition-colors"
          >
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} /> Refresh
          </button>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-5! mb-6!">
          {SUMMARY.map((s) => (
            <div
              key={s.label}
              className="bg-white border border-[var(--line)] rounded-2xl p-5! shadow-[var(--shadow-sm)]"
            >
              <span className="w-10! h-10! rounded-xl grid place-items-center text-[var(--violet-700)] bg-[var(--violet-050)] border border-[var(--violet-100)] mb-4!">
                {s.icon}
              </span>
              <div className="text-[24px] font-semibold text-[var(--ink)] font-display leading-none">
                {loading ? "—" : s.value}
              </div>
              <div className="text-[13px] text-[var(--slate)] mt-1.5!">
                {s.label}
              </div>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="relative mb-5! max-w-md!">
          <Search
            size={16}
            className="absolute left-3.5! top-1/2 -translate-y-1/2 text-[var(--muted)]"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search visitors or agents…"
            className="w-full! pl-10! pr-4! py-2.5! bg-white border border-[var(--line)] rounded-xl text-sm text-[var(--ink)] placeholder-gray-400 outline-none focus:border-[var(--violet)] focus:ring-2 focus:ring-[var(--violet-100)] transition-all shadow-[var(--shadow-sm)]"
          />
        </div>

        {/* Table */}
        <div className="bg-white border border-[var(--line)] rounded-2xl shadow-[var(--shadow-sm)] overflow-hidden">
          {loading ? (
            <div className="p-10! grid place-items-center">
              <div className="w-8! h-8! border-2 border-[var(--line)] border-t-[var(--violet)] rounded-full animate-spin" />
            </div>
          ) : error ? (
            <div className="p-10! text-center">
              <AlertCircle size={22} className="text-rose-400 mx-auto! mb-2!" />
              <p className="text-sm font-semibold text-[var(--ink)]">
                Couldn&apos;t reach the server
              </p>
              <p className="text-[13px] text-[var(--muted)] mt-1!">
                Check the API endpoint in Settings, then refresh.
              </p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-10! text-center">
              <UsersIcon size={22} className="text-[var(--muted)] mx-auto! mb-2!" />
              <p className="text-sm font-semibold text-[var(--ink)]">
                No visitors yet
              </p>
              <p className="text-[13px] text-[var(--muted)] mt-1!">
                Users appear here once they start conversations with your agents.
              </p>
            </div>
          ) : (
            <div className="w-full! overflow-x-auto">
              <table className="w-full! text-left border-collapse min-w-[720px]!">
                <thead>
                  <tr className="text-[11px] uppercase tracking-wider text-[var(--muted)] border-b border-[var(--line-soft)]">
                    <th className="font-semibold px-5! py-3.5!">Visitor</th>
                    <th className="font-semibold px-4! py-3.5!">Sessions</th>
                    <th className="font-semibold px-4! py-3.5!">Messages</th>
                    <th className="font-semibold px-4! py-3.5!">Total time</th>
                    <th className="font-semibold px-4! py-3.5!">Agents</th>
                    <th className="font-semibold px-5! py-3.5!">Last active</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((v) => (
                    <tr
                      key={v.key}
                      className="border-b border-[var(--line-soft)] last:border-0 text-[13.5px] hover:bg-[var(--line-soft)]/40 transition-colors"
                    >
                      <td className="px-5! py-4!">
                        <div className="flex items-center gap-3!">
                          <span
                            className={`w-9! h-9! rounded-full grid place-items-center text-white text-[12px] font-semibold shrink-0 ${
                              v.anonymous ? "opacity-70" : ""
                            }`}
                            style={{ background: "var(--grad)" }}
                          >
                            {v.label[0].toUpperCase()}
                          </span>
                          <div className="min-w-0">
                            <p className="font-medium text-[var(--ink)] truncate max-w-[200px]!">
                              {v.label}
                            </p>
                            {v.anonymous && (
                              <p className="text-[11px] text-[var(--muted)]">
                                No identifier
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4! py-4! text-[var(--slate)] tabular-nums">
                        {fmtNumber(v.sessions)}
                      </td>
                      <td className="px-4! py-4! text-[var(--slate)] tabular-nums">
                        {fmtNumber(v.messages)}
                      </td>
                      <td className="px-4! py-4! text-[var(--slate)]">
                        <span className="inline-flex items-center gap-1.5!">
                          <Clock size={13} className="text-[var(--muted)]" />
                          {fmtDuration(v.totalDuration)}
                        </span>
                      </td>
                      <td className="px-4! py-4!">
                        <div className="flex flex-wrap gap-1!">
                          {[...v.agents].slice(0, 2).map((a) => (
                            <span
                              key={a}
                              className="text-[11px] font-medium text-[var(--violet-700)] bg-[var(--violet-050)] border border-[var(--violet-100)] px-2! py-0.5! rounded-full truncate max-w-[120px]!"
                            >
                              {a}
                            </span>
                          ))}
                          {v.agents.size > 2 && (
                            <span className="text-[11px] font-medium text-[var(--muted)]">
                              +{v.agents.size - 2}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-5! py-4! text-[var(--muted)] text-[12.5px] whitespace-nowrap">
                        {relTime(v.lastActive)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

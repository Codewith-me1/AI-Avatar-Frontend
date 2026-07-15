"use client";

import { useEffect, useMemo, useState } from "react";
import {
  MessageSquare,
  Search,
  Filter,
  Clock,
  CheckCircle2,
  Circle,
  User,
  Bot,
  Zap,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import {
  listConversations,
  getConversation,
  getAgentMap,
  relTime,
  fmtDuration,
  visitorLabel,
  type SessionRow,
  type ConversationDetail,
} from "@/lib/api/dashboard";

const STATUS_STYLE: Record<string, string> = {
  active: "text-blue-700 bg-blue-50 border-blue-100",
  ended: "text-emerald-700 bg-emerald-50 border-emerald-100",
  error: "text-rose-600 bg-rose-50 border-rose-100",
  connecting: "text-amber-700 bg-amber-50 border-amber-100",
};
const statusStyle = (s: string) =>
  STATUS_STYLE[s] || "text-gray-600 bg-gray-50 border-gray-100";

const FILTERS = [
  { label: "All", value: "" },
  { label: "Active", value: "active" },
  { label: "Ended", value: "ended" },
];

export default function ConversationsPage() {
  const [rows, setRows] = useState<SessionRow[]>([]);
  const [agentMap, setAgentMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("");

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<ConversationDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const load = async (status: string) => {
    setLoading(true);
    setError(false);
    try {
      const [sessions, map] = await Promise.all([
        listConversations({ status: status || undefined, limit: 100 }),
        getAgentMap(),
      ]);
      setAgentMap(map);
      setRows(sessions || []);
      if (sessions && sessions.length > 0) {
        setSelectedId((cur) =>
          cur && sessions.some((s) => s.id === cur) ? cur : sessions[0].id,
        );
      } else {
        setSelectedId(null);
        setDetail(null);
      }
    } catch {
      setError(true);
      setRows([]);
      setSelectedId(null);
      setDetail(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(filter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  useEffect(() => {
    if (!selectedId) {
      setDetail(null);
      return;
    }
    let cancelled = false;
    setDetailLoading(true);
    getConversation(selectedId)
      .then((d) => {
        if (!cancelled) setDetail(d);
      })
      .catch(() => {
        if (!cancelled) setDetail(null);
      })
      .finally(() => {
        if (!cancelled) setDetailLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedId]);

  const agentName = (id: string) => agentMap[id] || `Agent ${id.slice(0, 6)}`;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (r) =>
        visitorLabel(r.external_user_id).toLowerCase().includes(q) ||
        agentName(r.agent_id).toLowerCase().includes(q) ||
        r.id.toLowerCase().includes(q) ||
        r.status.toLowerCase().includes(q),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, rows, agentMap]);

  const selected = detail;

  return (
    <div className="min-h-full text-[var(--foreground)] p-8! md:p-12!">
      <div className="max-w-[1400px] mx-auto!">
        {/* Header */}
        <div className="flex flex-wrap items-end justify-between gap-4! mb-8!">
          <div>
            <span className="eyebrow mb-3!">
              <MessageSquare size={11} /> Inbox
            </span>
            <h1 className="text-[28px] font-semibold text-[var(--ink)] tracking-tight mt-3!">
              Conversations{" "}
              <span className="text-[var(--muted)] font-normal">
                ({rows.length})
              </span>
            </h1>
            <p className="text-sm text-[var(--slate)] mt-1.5!">
              Live transcripts, timing, and outcomes from real sessions.
            </p>
          </div>
          <button
            onClick={() => load(filter)}
            className="inline-flex items-center gap-2! bg-white border border-[var(--line)] text-[var(--slate)] hover:text-[var(--ink)] text-[13px] font-semibold px-4! py-2.5! rounded-xl shadow-[var(--shadow-sm)] transition-colors"
          >
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} /> Refresh
          </button>
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3! mb-5!">
          <div className="relative flex-1 min-w-[220px]!">
            <Search
              size={16}
              className="absolute left-3.5! top-1/2 -translate-y-1/2 text-[var(--muted)]"
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by visitor, agent, or session id…"
              className="w-full! pl-10! pr-4! py-2.5! bg-white border border-[var(--line)] rounded-xl text-sm text-[var(--ink)] placeholder-gray-400 outline-none focus:border-[var(--violet)] focus:ring-2 focus:ring-[var(--violet-100)] transition-all shadow-[var(--shadow-sm)]"
            />
          </div>
          <div className="flex items-center gap-1! bg-white border border-[var(--line)] rounded-xl p-1! shadow-[var(--shadow-sm)]">
            <Filter size={14} className="text-[var(--muted)] ml-2! mr-1!" />
            {FILTERS.map((f) => (
              <button
                key={f.label}
                onClick={() => setFilter(f.value)}
                className={`px-3! py-1.5! rounded-lg text-[12.5px] font-medium transition-colors ${
                  filter === f.value
                    ? "bg-[var(--violet-050)] text-[var(--violet-700)]"
                    : "text-[var(--slate)] hover:text-[var(--ink)]"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Split view */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6!">
          {/* List */}
          <div className="lg:col-span-2 space-y-3!">
            {loading ? (
              [0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-white border border-[var(--line)] rounded-2xl p-4! h-[92px]! animate-pulse"
                />
              ))
            ) : error ? (
              <div className="bg-white border border-[var(--line)] rounded-2xl p-8! text-center">
                <AlertCircle size={22} className="text-rose-400 mx-auto! mb-2!" />
                <p className="text-sm font-semibold text-[var(--ink)]">
                  Couldn&apos;t reach the server
                </p>
                <p className="text-[13px] text-[var(--muted)] mt-1!">
                  Check the API endpoint in Settings, then refresh.
                </p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="bg-white border border-[var(--line)] rounded-2xl p-8! text-center">
                <MessageSquare size={22} className="text-[var(--muted)] mx-auto! mb-2!" />
                <p className="text-sm font-semibold text-[var(--ink)]">
                  No conversations yet
                </p>
                <p className="text-[13px] text-[var(--muted)] mt-1!">
                  Sessions appear here once visitors start talking to your agents.
                </p>
              </div>
            ) : (
              filtered.map((r) => {
                const active = selectedId === r.id;
                return (
                  <button
                    key={r.id}
                    onClick={() => setSelectedId(r.id)}
                    className={`w-full! text-left bg-white border rounded-2xl p-4! shadow-[var(--shadow-sm)] transition-all ${
                      active
                        ? "border-[var(--violet)] ring-1 ring-[var(--violet-100)]"
                        : "border-[var(--line)] hover:border-[var(--violet-100)]"
                    }`}
                  >
                    <div className="flex items-center gap-3! mb-2!">
                      <span
                        className="w-9! h-9! rounded-full grid place-items-center text-white text-[12px] font-semibold shrink-0"
                        style={{ background: "var(--grad)" }}
                      >
                        {visitorLabel(r.external_user_id)[0].toUpperCase()}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-[14px] text-[var(--ink)] truncate">
                          {visitorLabel(r.external_user_id)}
                        </p>
                        <p className="text-[12px] text-[var(--muted)] truncate">
                          {agentName(r.agent_id)}
                        </p>
                      </div>
                      <span className="text-[11px] text-[var(--muted)] shrink-0">
                        {relTime(r.started_at)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2! flex-wrap">
                      <span
                        className={`inline-flex items-center gap-1! text-[10.5px] font-semibold px-2! py-0.5! rounded-full border capitalize ${statusStyle(r.status)}`}
                      >
                        {r.status === "ended" ? (
                          <CheckCircle2 size={10} />
                        ) : (
                          <Circle size={10} />
                        )}
                        {r.status}
                      </span>
                      <span className="text-[11px] text-[var(--muted)]">
                        {r.message_count} messages
                      </span>
                      <span className="text-[11px] text-[var(--muted)]">
                        · {fmtDuration(r.duration_seconds)}
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Detail */}
          <div className="lg:col-span-3">
            {detailLoading ? (
              <div className="bg-white border border-[var(--line)] rounded-2xl p-10! min-h-[420px]! grid place-items-center">
                <div className="w-8! h-8! border-2 border-[var(--line)] border-t-[var(--violet)] rounded-full animate-spin" />
              </div>
            ) : selected ? (
              <div className="bg-white border border-[var(--line)] rounded-2xl shadow-[var(--shadow-sm)] flex flex-col h-full min-h-[420px]!">
                {/* Detail header */}
                <div className="flex flex-wrap items-center justify-between gap-3! p-5! border-b border-[var(--line-soft)]">
                  <div className="flex items-center gap-3!">
                    <span
                      className="w-10! h-10! rounded-full grid place-items-center text-white text-sm font-semibold"
                      style={{ background: "var(--grad)" }}
                    >
                      {visitorLabel(selected.session.external_user_id)[0].toUpperCase()}
                    </span>
                    <div>
                      <p className="font-semibold text-[15px] text-[var(--ink)]">
                        {visitorLabel(selected.session.external_user_id)}
                      </p>
                      <p className="text-[12px] text-[var(--muted)]">
                        {agentName(selected.session.agent_id)} ·{" "}
                        {selected.session.livekit_room
                          ? "Realtime · " + selected.session.livekit_room
                          : "Realtime voice"}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1! text-[11px] font-semibold px-2.5! py-1! rounded-full border capitalize ${statusStyle(selected.session.status)}`}
                  >
                    {selected.session.status}
                  </span>
                </div>

                {/* Insight metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-px! bg-[var(--line-soft)] border-b border-[var(--line-soft)]">
                  <Metric
                    icon={<Clock size={14} />}
                    label="Duration"
                    value={fmtDuration(selected.insights.duration_seconds)}
                  />
                  <Metric
                    icon={<MessageSquare size={14} />}
                    label="Messages"
                    value={String(selected.insights.message_count)}
                  />
                  <Metric
                    icon={<RefreshCw size={14} />}
                    label="Turns"
                    value={String(selected.insights.turn_count)}
                  />
                  <Metric
                    icon={<Zap size={14} />}
                    label="Avg latency"
                    value={
                      selected.insights.avg_response_latency_ms != null
                        ? `${Math.round(selected.insights.avg_response_latency_ms)}ms`
                        : "—"
                    }
                  />
                </div>

                {/* Transcript */}
                <div className="p-5! space-y-4! flex-1 overflow-y-auto max-h-[520px]!">
                  {selected.messages.length === 0 ? (
                    <p className="text-center text-sm text-[var(--muted)] py-8!">
                      No messages were recorded for this session.
                    </p>
                  ) : (
                    selected.messages.map((m) => (
                      <div
                        key={m.id}
                        className={`flex items-start gap-3! ${
                          m.role === "user" ? "" : "flex-row-reverse"
                        }`}
                      >
                        <span
                          className={`w-8! h-8! rounded-full grid place-items-center shrink-0 ${
                            m.role === "user"
                              ? "bg-[var(--line-soft)] text-[var(--slate)]"
                              : "text-white"
                          }`}
                          style={
                            m.role === "assistant"
                              ? { background: "var(--grad)" }
                              : undefined
                          }
                        >
                          {m.role === "user" ? <User size={15} /> : <Bot size={15} />}
                        </span>
                        <div
                          className={`max-w-[78%]! rounded-2xl px-4! py-2.5! text-[13.5px] leading-relaxed ${
                            m.role === "user"
                              ? "bg-[var(--line-soft)] text-[var(--ink)] rounded-tl-sm"
                              : "bg-[var(--violet-050)] text-[var(--ink)] border border-[var(--violet-100)] rounded-tr-sm"
                          }`}
                        >
                          {m.content}
                          {m.role === "assistant" && m.latency_ms != null && (
                            <span className="block text-[10px] text-[var(--muted)] mt-1!">
                              {Math.round(m.latency_ms)}ms
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white border border-[var(--line)] rounded-2xl p-10! min-h-[420px]! grid place-items-center text-center">
                <div>
                  <MessageSquare size={22} className="text-[var(--muted)] mx-auto! mb-2!" />
                  <p className="text-sm text-[var(--muted)]">
                    Select a conversation to view its transcript.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Metric({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="bg-white p-4!">
      <div className="flex items-center gap-1.5! text-[var(--muted)] mb-1!">
        {icon}
        <span className="text-[11px] font-medium uppercase tracking-wide">
          {label}
        </span>
      </div>
      <p className="text-[16px] font-semibold text-[var(--ink)] tabular-nums">
        {value}
      </p>
    </div>
  );
}

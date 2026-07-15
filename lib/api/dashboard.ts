/**
 * Typed data-access for the conversation + analytics backend.
 *
 *   /api/conversations/*  — session lifecycle, transcripts
 *   /api/analytics/*      — overview, timeseries, per-agent breakdown, insights
 *
 * Shapes mirror backend/db/repository/conversations.py exactly.
 */
import { apiClient } from "./client";
import type { Agent } from "@/types";

// ── Response shapes ───────────────────────────────────────────────────────────

export interface OverviewData {
  total_sessions: number;
  active_sessions: number;
  ended_sessions: number;
  total_messages: number;
  unique_visitors: number;
  avg_duration_seconds: number;
  total_duration_seconds: number;
  avg_messages_per_session: number;
}

export interface TimeseriesPoint {
  bucket: string | null;
  session_count: number;
  avg_duration_seconds: number;
}

export interface TimeseriesData {
  interval: string;
  points: TimeseriesPoint[];
}

export interface AgentBreakdown {
  agent_id: string;
  session_count: number;
  message_count: number;
  avg_duration_seconds: number;
  total_duration_seconds: number;
}

export interface SessionRow {
  id: string;
  agent_id: string;
  external_user_id: string | null;
  status: string;
  started_at: string | null;
  ended_at: string | null;
  duration_seconds: number | null;
  message_count: number;
}

export interface SessionInsights {
  session_id: string;
  status: string | null;
  started_at: string | null;
  ended_at: string | null;
  duration_seconds: number | null;
  message_count: number;
  user_message_count: number;
  assistant_message_count: number;
  turn_count: number;
  avg_response_latency_ms: number | null;
  max_response_latency_ms: number | null;
  min_response_latency_ms: number | null;
  total_audio_duration_ms: number;
  total_user_chars: number;
  total_assistant_chars: number;
  first_message_at: string | null;
  last_message_at: string | null;
}

export interface ConversationMessageRow {
  id: string;
  role: "user" | "assistant";
  content: string;
  audio_duration_ms: number | null;
  latency_ms: number | null;
  created_at: string | null;
}

export interface ConversationDetail {
  session: {
    id: string;
    agent_id: string;
    external_user_id: string | null;
    status: string;
    livekit_room: string | null;
    started_at: string | null;
    ended_at: string | null;
    duration_seconds: number | null;
    session_metadata: Record<string, unknown> | null;
  };
  messages: ConversationMessageRow[];
  insights: SessionInsights;
}

// ── Fetchers ──────────────────────────────────────────────────────────────────

export const getOverview = (agentId?: string) =>
  apiClient.get<OverviewData>(
    `/api/analytics/overview${agentId ? `?agent_id=${encodeURIComponent(agentId)}` : ""}`,
  );

export const getTimeseries = (interval = "day", agentId?: string) => {
  const p = new URLSearchParams({ interval });
  if (agentId) p.set("agent_id", agentId);
  return apiClient.get<TimeseriesData>(`/api/analytics/timeseries?${p.toString()}`);
};

export const getAgentBreakdown = () =>
  apiClient.get<AgentBreakdown[]>(`/api/analytics/agents`);

export const listConversations = (
  opts: { agentId?: string; status?: string; limit?: number; offset?: number } = {},
) => {
  const p = new URLSearchParams();
  if (opts.agentId) p.set("agent_id", opts.agentId);
  if (opts.status) p.set("status", opts.status);
  p.set("limit", String(opts.limit ?? 50));
  p.set("offset", String(opts.offset ?? 0));
  return apiClient.get<SessionRow[]>(`/api/conversations/sessions?${p.toString()}`);
};

export const getConversation = (id: string) =>
  apiClient.get<ConversationDetail>(
    `/api/conversations/sessions/${encodeURIComponent(id)}`,
  );

/** id → agent name map (best-effort; empty object if the agents API is down). */
export async function getAgentMap(): Promise<Record<string, string>> {
  try {
    const agents = await apiClient.get<Agent[]>("/api/agents/");
    const m: Record<string, string> = {};
    (agents || []).forEach((a) => {
      m[a.id] = a.name;
    });
    return m;
  } catch {
    return {};
  }
}

// ── Formatting helpers ────────────────────────────────────────────────────────

/** Backend timestamps are naive UTC (no tz suffix) — treat them as UTC. */
export function parseUTC(iso?: string | null): number {
  if (!iso) return NaN;
  const hasTz = /[zZ]$|[+-]\d\d:?\d\d$/.test(iso);
  return new Date(hasTz ? iso : `${iso}Z`).getTime();
}

export function fmtDuration(sec?: number | null): string {
  if (sec === null || sec === undefined) return "—";
  const s = Math.max(0, Math.round(sec));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const r = s % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${r}s`;
  return `${r}s`;
}

export function relTime(iso?: string | null): string {
  const then = parseUTC(iso);
  if (isNaN(then)) return "—";
  const diff = Date.now() - then;
  const s = Math.floor(diff / 1000);
  if (s < 45) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(then).toLocaleDateString();
}

export function fmtNumber(n?: number | null): string {
  if (n === null || n === undefined) return "0";
  return n.toLocaleString();
}

export function shortId(id?: string | null): string {
  if (!id) return "—";
  return id.length > 8 ? id.slice(0, 8) : id;
}

/** Human label for a visitor / external user id. */
export function visitorLabel(externalUserId?: string | null): string {
  if (!externalUserId) return "Anonymous visitor";
  return externalUserId.length > 20
    ? `Visitor ${externalUserId.slice(0, 6)}`
    : externalUserId;
}

/**
 * Super-admin API. Every endpoint requires a superuser session.
 * Mirrors backend/api/routes/admin.py.
 */
import { apiClient } from "./client";

export interface AdminUser {
  id: string;
  email: string;
  full_name?: string | null;
  is_active: boolean;
  is_superuser: boolean;
  is_suspended: boolean;
  suspended_reason?: string | null;
  agents_count: number;
  credits_minutes: number;
  credits_used_seconds: number;
  smtp_configured: boolean;
  last_login_at?: string | null;
  failed_login_count: number;
  locked_until?: string | null;
  created_at?: string | null;
}

export interface AdminUserUpdate {
  is_active?: boolean;
  is_suspended?: boolean;
  suspended_reason?: string | null;
  is_superuser?: boolean;
  credits_minutes?: number;
  full_name?: string;
}

export interface AdminAgent {
  id: string;
  name: string;
  slug: string;
  owner_email: string;
  is_active: boolean;
  language: string;
  llm: string;
  restrict_to_knowledge: boolean;
  appointments_enabled: boolean;
  lead_capture_enabled: boolean;
  website_url?: string | null;
  meet_link?: string | null;
  conversations: number;
  created_at?: string | null;
}

export interface AdminConversation {
  id: string;
  agent: string;
  owner_email: string;
  status: string;
  external_user_id?: string | null;
  started_at?: string | null;
  ended_at?: string | null;
  duration_seconds?: number | null;
}

export interface AdminAudit {
  id: string;
  event: string;
  email?: string | null;
  target?: string | null;
  detail?: string | null;
  success: boolean;
  ip_address?: string | null;
  created_at?: string | null;
}

export interface AdminTicket {
  id: string;
  reference: string;
  subject: string;
  category?: string | null;
  priority: string;
  status: string;
  raised_by?: string | null;
  assigned_to?: string | null;
  created_at?: string | null;
  resolved_at?: string | null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Json = any;

export const getOverview = () => apiClient.get<Json>("/api/admin/overview");
export const getHealth = () => apiClient.get<Json>("/api/admin/health");

export const listUsers = (opts: { q?: string; suspended?: boolean } = {}) => {
  const p = new URLSearchParams();
  if (opts.q) p.set("q", opts.q);
  if (opts.suspended !== undefined) p.set("suspended", String(opts.suspended));
  p.set("limit", "200");
  const qs = p.toString();
  return apiClient.get<AdminUser[]>(`/api/admin/users${qs ? `?${qs}` : ""}`);
};
export const getUser = (id: string) =>
  apiClient.get<Json>(`/api/admin/users/${encodeURIComponent(id)}`);
export const createUser = (body: {
  email: string;
  password: string;
  full_name?: string;
  is_superuser?: boolean;
  credits_minutes?: number;
}) => apiClient.post<AdminUser>("/api/admin/users", body);
export const updateUser = (id: string, body: AdminUserUpdate) =>
  apiClient.patch<AdminUser>(`/api/admin/users/${encodeURIComponent(id)}`, body);
export const deleteUser = (id: string, confirmEmail: string) =>
  apiClient.delete(
    `/api/admin/users/${encodeURIComponent(id)}?confirm_email=${encodeURIComponent(confirmEmail)}`,
  );
export const forceLogoutUser = (id: string) =>
  apiClient.post<{ sessions_revoked: number }>(
    `/api/admin/users/${encodeURIComponent(id)}/logout-all`,
    {},
  );

export const listAgents = (q?: string) =>
  apiClient.get<AdminAgent[]>(
    `/api/admin/agents${q ? `?q=${encodeURIComponent(q)}` : ""}`,
  );

export const listConversations = (activeOnly?: boolean) =>
  apiClient.get<AdminConversation[]>(
    `/api/admin/sessions${activeOnly ? "?active_only=true" : ""}`,
  );

export const listAudit = (event?: string) =>
  apiClient.get<AdminAudit[]>(
    `/api/admin/audit${event ? `?event=${encodeURIComponent(event)}` : ""}`,
  );

export const listTickets = (opts: { status?: string; priority?: string } = {}) => {
  const p = new URLSearchParams();
  if (opts.status) p.set("status", opts.status);
  if (opts.priority) p.set("priority", opts.priority);
  const qs = p.toString();
  return apiClient.get<AdminTicket[]>(`/api/admin/tickets${qs ? `?${qs}` : ""}`);
};
export const getTicket = (id: string) =>
  apiClient.get<Json>(`/api/admin/tickets/${encodeURIComponent(id)}`);
export const updateTicket = (
  id: string,
  body: { status?: string; priority?: string; assigned_to?: string; resolution?: string },
) => apiClient.patch<Json>(`/api/admin/tickets/${encodeURIComponent(id)}`, body);
export const replyTicket = (id: string, body: string, internal: boolean) =>
  apiClient.post<Json>(`/api/admin/tickets/${encodeURIComponent(id)}/reply`, {
    body,
    internal,
  });

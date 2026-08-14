/**
 * Typed data-access for the per-agent CRM.
 * All routes are scoped: /api/agents/{agentId}/crm/...
 * Shapes mirror backend/api/routes/crm.py exactly.
 */
import { apiClient } from "./client";

export const LEAD_STATUSES = ["new", "contacted", "qualified", "won", "lost"] as const;
export type LeadStatus = (typeof LEAD_STATUSES)[number];

export const APPT_STATUSES = ["booked", "cancelled", "completed", "no_show"] as const;
export type ApptStatus = (typeof APPT_STATUSES)[number];

export const WEEK_DAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;
export type WeekDay = (typeof WEEK_DAYS)[number];

export interface Lead {
  id: string;
  agent_id: string;
  conversation_id?: string | null;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  company?: string | null;
  interest?: string | null;
  notes?: string | null;
  status: string;
  score: number;
  source: string;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface Appointment {
  id: string;
  agent_id: string;
  lead_id?: string | null;
  conversation_id?: string | null;
  visitor_name?: string | null;
  visitor_email?: string | null;
  visitor_phone?: string | null;
  starts_at: string;
  ends_at: string;
  timezone: string;
  purpose?: string | null;
  notes?: string | null;
  status: string;
}

export type BusinessHours = Record<string, [string, string][]>;

export interface AppointmentConfig {
  timezone: string;
  slot_minutes: number;
  buffer_minutes: number;
  max_days_ahead: number;
  min_notice_minutes: number;
  business_hours: BusinessHours;
}

export interface CrmSettings {
  enable_lead_capture: boolean;
  enable_appointments: boolean;
  enable_human_handoff: boolean;
  appointment_config: AppointmentConfig;
}

export interface CrmSummary {
  leads_total: number;
  leads_by_status: Record<string, number>;
  leads_with_contact: number;
  appointments_upcoming: number;
}

export interface AvailabilitySlot {
  starts_at: string;
  label: string;
}

export interface AvailabilityResponse {
  enabled: boolean;
  config: AppointmentConfig;
  slots: AvailabilitySlot[];
}

export interface LeadInput {
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  company?: string | null;
  interest?: string | null;
  notes?: string | null;
  status?: string;
}

const base = (agentId: string) => `/api/agents/${encodeURIComponent(agentId)}/crm`;

// ── Summary ───────────────────────────────────────────────────────────────────
export const getCrmSummary = (agentId: string) =>
  apiClient.get<CrmSummary>(`${base(agentId)}/summary`);

// ── Leads ─────────────────────────────────────────────────────────────────────
export const listLeads = (
  agentId: string,
  opts: { status?: string; limit?: number; offset?: number } = {},
) => {
  const p = new URLSearchParams();
  if (opts.status) p.set("status", opts.status);
  p.set("limit", String(opts.limit ?? 200));
  p.set("offset", String(opts.offset ?? 0));
  return apiClient.get<Lead[]>(`${base(agentId)}/leads?${p.toString()}`);
};

export const createLead = (agentId: string, body: LeadInput) =>
  apiClient.post<Lead>(`${base(agentId)}/leads`, body);

export const updateLead = (agentId: string, leadId: string, body: LeadInput) =>
  apiClient.patch<Lead>(`${base(agentId)}/leads/${encodeURIComponent(leadId)}`, body);

export const deleteLead = (agentId: string, leadId: string) =>
  apiClient.delete(`${base(agentId)}/leads/${encodeURIComponent(leadId)}`);

export async function exportLeadsCsv(agentId: string): Promise<void> {
  const blob = await apiClient.getBlob(`${base(agentId)}/leads/export/csv`);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `leads_${agentId}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

// ── Appointments ──────────────────────────────────────────────────────────────
export const listAppointments = (
  agentId: string,
  opts: { status?: string; upcomingOnly?: boolean; limit?: number } = {},
) => {
  const p = new URLSearchParams();
  if (opts.status) p.set("status", opts.status);
  if (opts.upcomingOnly) p.set("upcoming_only", "true");
  p.set("limit", String(opts.limit ?? 200));
  return apiClient.get<Appointment[]>(`${base(agentId)}/appointments?${p.toString()}`);
};

export const createAppointment = (
  agentId: string,
  body: {
    starts_at: string;
    visitor_name?: string;
    visitor_email?: string;
    visitor_phone?: string;
    purpose?: string;
    notes?: string;
  },
) => apiClient.post<Appointment>(`${base(agentId)}/appointments`, body);

export const updateAppointmentStatus = (
  agentId: string,
  apptId: string,
  status: ApptStatus,
) =>
  apiClient.patch<Appointment>(
    `${base(agentId)}/appointments/${encodeURIComponent(apptId)}`,
    { status },
  );

export const getAvailability = (agentId: string, onDate?: string) => {
  const q = onDate ? `?on_date=${encodeURIComponent(onDate)}` : "";
  return apiClient.get<AvailabilityResponse>(`${base(agentId)}/availability${q}`);
};

// ── Settings ──────────────────────────────────────────────────────────────────
export const getCrmSettings = (agentId: string) =>
  apiClient.get<CrmSettings>(`${base(agentId)}/settings`);

export const putCrmSettings = (agentId: string, body: CrmSettings) =>
  apiClient.put<CrmSettings>(`${base(agentId)}/settings`, body);

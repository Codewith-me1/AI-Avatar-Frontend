"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Contact,
  CalendarClock,
  SlidersHorizontal,
  Download,
  Plus,
  Search,
  X,
  Trash2,
  Check,
  RefreshCw,
  AlertCircle,
  Phone,
  Mail,
  Building2,
  Clock,
  ChevronDown,
  UserCheck,
  CalendarPlus,
  Sparkles,
  ShieldAlert,
  Users,
  Video,
} from "lucide-react";
import { getAgentMap, parseUTC, relTime, fmtNumber } from "@/lib/api/dashboard";
import {
  getCrmSummary,
  listLeads,
  createLead,
  updateLead,
  deleteLead,
  exportLeadsCsv,
  listAppointments,
  createAppointment,
  updateAppointmentStatus,
  getAvailability,
  getCrmSettings,
  putCrmSettings,
  LEAD_STATUSES,
  WEEK_DAYS,
  type Lead,
  type Appointment,
  type CrmSummary,
  type CrmSettings,
  type AvailabilitySlot,
  type ApptStatus,
  type BusinessHours,
} from "@/lib/api/crm";

const inp =
  "w-full! px-3.5! py-2.5! bg-white border border-[var(--line)] rounded-xl text-[var(--ink)] text-sm placeholder-gray-400 outline-none focus:border-[var(--violet)] focus:ring-2 focus:ring-[var(--violet-100)] transition-all";

const LEAD_STATUS_STYLE: Record<string, string> = {
  new: "text-blue-700 bg-blue-50 border-blue-100",
  contacted: "text-violet-700 bg-violet-50 border-violet-100",
  qualified: "text-amber-700 bg-amber-50 border-amber-100",
  won: "text-emerald-700 bg-emerald-50 border-emerald-100",
  lost: "text-gray-500 bg-gray-50 border-gray-200",
};
const APPT_STATUS_STYLE: Record<string, string> = {
  booked: "text-blue-700 bg-blue-50 border-blue-100",
  completed: "text-emerald-700 bg-emerald-50 border-emerald-100",
  cancelled: "text-rose-600 bg-rose-50 border-rose-100",
  no_show: "text-amber-700 bg-amber-50 border-amber-100",
};
const stTone = (m: Record<string, string>, s: string) =>
  m[s] || "text-gray-600 bg-gray-50 border-gray-200";

const scoreTone = (n: number) =>
  n >= 70
    ? "text-emerald-700 bg-emerald-50 border-emerald-100"
    : n >= 40
      ? "text-amber-700 bg-amber-50 border-amber-100"
      : "text-gray-500 bg-gray-50 border-gray-200";

const TZS = [
  "UTC", "America/New_York", "America/Chicago", "America/Los_Angeles",
  "Europe/London", "Europe/Berlin", "Europe/Paris", "Asia/Kolkata",
  "Asia/Dubai", "Asia/Singapore", "Asia/Tokyo", "Australia/Sydney",
];

function fmtDateTime(iso: string, tz?: string): string {
  const t = parseUTC(iso);
  if (isNaN(t)) return "—";
  try {
    return new Intl.DateTimeFormat(undefined, {
      timeZone: tz || undefined,
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(new Date(t));
  } catch {
    return new Date(t).toLocaleString();
  }
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function CrmPage() {
  const [agents, setAgents] = useState<{ id: string; name: string }[]>([]);
  const [agentId, setAgentId] = useState<string>("");
  const [tab, setTab] = useState<"leads" | "appointments" | "settings">("leads");
  const [summary, setSummary] = useState<CrmSummary | null>(null);
  const [loadingAgents, setLoadingAgents] = useState(true);

  useEffect(() => {
    getAgentMap().then((m) => {
      const list = Object.entries(m).map(([id, name]) => ({ id, name }));
      setAgents(list);
      if (list.length) setAgentId((cur) => cur || list[0].id);
      setLoadingAgents(false);
    });
  }, []);

  const refreshSummary = useCallback(() => {
    if (!agentId) return;
    getCrmSummary(agentId).then(setSummary).catch(() => setSummary(null));
  }, [agentId]);

  useEffect(() => {
    refreshSummary();
  }, [refreshSummary]);

  const qualified = summary?.leads_by_status?.qualified ?? 0;

  return (
    <div className="min-h-full text-[var(--foreground)] p-8! md:p-12!">
      <div className="max-w-[1400px] mx-auto!">
        {/* Header */}
        <div className="flex flex-wrap items-end justify-between gap-4! mb-6!">
          <div>
            <span className="eyebrow mb-3!">
              <Contact size={11} /> CRM
            </span>
            <h1 className="text-[28px] font-semibold text-[var(--ink)] tracking-tight mt-3!">
              Leads &amp; appointments
            </h1>
            <p className="text-sm text-[var(--slate)] mt-1.5!">
              Captured by your agent — review, book, and configure capabilities.
            </p>
          </div>
          {agents.length > 0 && (
            <div className="relative">
              <select
                value={agentId}
                onChange={(e) => setAgentId(e.target.value)}
                className={`${inp} appearance-none pr-10! min-w-[200px]!`}
              >
                {agents.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={16}
                className="absolute right-3! top-1/2 -translate-y-1/2 text-[var(--muted)] pointer-events-none"
              />
            </div>
          )}
        </div>

        {loadingAgents ? (
          <div className="grid place-items-center h-64!">
            <div className="w-8! h-8! border-2 border-[var(--line)] border-t-[var(--violet)] rounded-full animate-spin" />
          </div>
        ) : agents.length === 0 ? (
          <EmptyCard
            icon={<Users size={24} />}
            title="No agent yet"
            desc="Create an agent to start capturing leads and booking appointments."
            action={
              <Link
                href="/dashboard/agents"
                className="inline-flex items-center gap-2! text-white text-sm font-semibold px-5! py-2.5! rounded-xl"
                style={{ background: "var(--grad)" }}
              >
                <Plus size={16} /> Create an agent
              </Link>
            }
          />
        ) : (
          <>
            {/* Summary */}
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-4! mb-6!">
              <Stat label="Total leads" value={fmtNumber(summary?.leads_total ?? 0)} icon={<Contact size={16} />} />
              <Stat label="With contact" value={fmtNumber(summary?.leads_with_contact ?? 0)} icon={<Mail size={16} />} />
              <Stat label="Qualified" value={fmtNumber(qualified)} icon={<UserCheck size={16} />} accent />
              <Stat label="Upcoming appts" value={fmtNumber(summary?.appointments_upcoming ?? 0)} icon={<CalendarClock size={16} />} />
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-1! bg-white border border-[var(--line)] rounded-xl p-1! shadow-[var(--shadow-sm)] w-fit! mb-6!">
              {(
                [
                  { k: "leads", label: "Leads", icon: <Contact size={14} /> },
                  { k: "appointments", label: "Appointments", icon: <CalendarClock size={14} /> },
                  { k: "settings", label: "Capabilities", icon: <SlidersHorizontal size={14} /> },
                ] as const
              ).map((t) => (
                <button
                  key={t.k}
                  onClick={() => setTab(t.k)}
                  className={`flex items-center gap-1.5! px-3.5! py-2! rounded-lg text-[13px] font-medium transition-colors ${
                    tab === t.k
                      ? "bg-[var(--violet-050)] text-[var(--violet-700)]"
                      : "text-[var(--slate)] hover:text-[var(--ink)]"
                  }`}
                >
                  {t.icon} {t.label}
                </button>
              ))}
            </div>

            {tab === "leads" && (
              <LeadsTab agentId={agentId} onChange={refreshSummary} />
            )}
            {tab === "appointments" && (
              <AppointmentsTab agentId={agentId} onChange={refreshSummary} />
            )}
            {tab === "settings" && <SettingsTab agentId={agentId} />}
          </>
        )}
      </div>
    </div>
  );
}

// ── Leads tab ─────────────────────────────────────────────────────────────────
function LeadsTab({ agentId, onChange }: { agentId: string; onChange: () => void }) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [filter, setFilter] = useState("");
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<Lead | "new" | null>(null);
  const [exporting, setExporting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      setLeads(await listLeads(agentId, { status: filter || undefined }));
    } catch {
      setError(true);
      setLeads([]);
    } finally {
      setLoading(false);
    }
  }, [agentId, filter]);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return leads;
    return leads.filter((l) =>
      [l.name, l.email, l.phone, l.company, l.interest]
        .filter(Boolean)
        .some((v) => (v as string).toLowerCase().includes(q)),
    );
  }, [leads, query]);

  const handleExport = async () => {
    setExporting(true);
    try {
      await exportLeadsCsv(agentId);
    } catch {
      /* ignore */
    } finally {
      setExporting(false);
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3! mb-4!">
        <div className="relative flex-1 min-w-[200px]!">
          <Search size={16} className="absolute left-3.5! top-1/2 -translate-y-1/2 text-[var(--muted)]" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, email, company…"
            className={`${inp} pl-10!`}
          />
        </div>
        <div className="flex items-center gap-1! bg-white border border-[var(--line)] rounded-xl p-1! shadow-[var(--shadow-sm)]">
          {["", ...LEAD_STATUSES].map((s) => (
            <button
              key={s || "all"}
              onClick={() => setFilter(s)}
              className={`px-2.5! py-1.5! rounded-lg text-[12px] font-medium capitalize transition-colors ${
                filter === s
                  ? "bg-[var(--violet-050)] text-[var(--violet-700)]"
                  : "text-[var(--slate)] hover:text-[var(--ink)]"
              }`}
            >
              {s || "All"}
            </button>
          ))}
        </div>
        <button
          onClick={handleExport}
          disabled={exporting || leads.length === 0}
          className="inline-flex items-center gap-2! bg-white border border-[var(--line)] text-[var(--slate)] hover:text-[var(--ink)] text-[13px] font-semibold px-3.5! py-2.5! rounded-xl shadow-[var(--shadow-sm)] transition-colors disabled:opacity-50"
        >
          <Download size={15} /> CSV
        </button>
        <button
          onClick={() => setEditing("new")}
          className="inline-flex items-center gap-2! text-white text-[13px] font-semibold px-4! py-2.5! rounded-xl"
          style={{ background: "var(--grad)" }}
        >
          <Plus size={15} /> Add lead
        </button>
      </div>

      <div className="bg-white border border-[var(--line)] rounded-2xl shadow-[var(--shadow-sm)] overflow-hidden">
        {loading ? (
          <div className="p-10! grid place-items-center">
            <div className="w-7! h-7! border-2 border-[var(--line)] border-t-[var(--violet)] rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="p-10! text-center text-[13px] text-rose-600 flex items-center justify-center gap-2!">
            <AlertCircle size={16} /> Couldn&apos;t load leads. Check the server URL in Settings.
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-10! text-center">
            <Contact size={22} className="text-[var(--muted)] mx-auto! mb-2!" />
            <p className="text-sm font-semibold text-[var(--ink)]">No leads yet</p>
            <p className="text-[13px] text-[var(--muted)] mt-1!">
              Your agent saves leads automatically when a visitor shares their details.
            </p>
          </div>
        ) : (
          <div className="w-full! overflow-x-auto">
            <table className="w-full! text-left border-collapse min-w-[820px]!">
              <thead>
                <tr className="text-[11px] uppercase tracking-wider text-[var(--muted)] border-b border-[var(--line-soft)]">
                  <th className="font-semibold px-5! py-3.5!">Lead</th>
                  <th className="font-semibold px-4! py-3.5!">Contact</th>
                  <th className="font-semibold px-4! py-3.5!">Interest</th>
                  <th className="font-semibold px-4! py-3.5!">Score</th>
                  <th className="font-semibold px-4! py-3.5!">Status</th>
                  <th className="font-semibold px-5! py-3.5!">Added</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((l) => (
                  <tr
                    key={l.id}
                    onClick={() => setEditing(l)}
                    className={`border-b border-[var(--line-soft)] last:border-0 text-[13.5px] cursor-pointer hover:bg-[var(--line-soft)]/40 transition-colors ${
                      l.status === "qualified" ? "bg-amber-50/40" : ""
                    }`}
                  >
                    <td className="px-5! py-3.5!">
                      <div className="flex items-center gap-2.5!">
                        <span
                          className="w-8! h-8! rounded-full grid place-items-center text-white text-[11px] font-semibold shrink-0"
                          style={{ background: "var(--grad)" }}
                        >
                          {(l.name || l.email || "?")[0].toUpperCase()}
                        </span>
                        <div className="min-w-0">
                          <p className="font-medium text-[var(--ink)] truncate max-w-[160px]!">
                            {l.name || "Unnamed"}
                          </p>
                          {l.company && (
                            <p className="text-[12px] text-[var(--muted)] truncate max-w-[160px]!">
                              {l.company}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4! py-3.5! text-[var(--slate)]">
                      <div className="space-y-0.5!">
                        {l.email && (
                          <p className="flex items-center gap-1.5! truncate max-w-[190px]!">
                            <Mail size={12} className="text-[var(--muted)] shrink-0" /> {l.email}
                          </p>
                        )}
                        {l.phone && (
                          <p className="flex items-center gap-1.5!">
                            <Phone size={12} className="text-[var(--muted)] shrink-0" /> {l.phone}
                          </p>
                        )}
                        {!l.email && !l.phone && <span className="text-[var(--muted)]">—</span>}
                      </div>
                    </td>
                    <td className="px-4! py-3.5! text-[var(--slate)]">
                      <span className="line-clamp-2 max-w-[200px]!">{l.interest || "—"}</span>
                    </td>
                    <td className="px-4! py-3.5!">
                      <span
                        className={`inline-flex items-center gap-1! text-[12px] font-semibold px-2! py-0.5! rounded-full border tabular-nums ${scoreTone(l.score)}`}
                      >
                        {l.score}
                      </span>
                    </td>
                    <td className="px-4! py-3.5!">
                      <span
                        className={`inline-flex items-center text-[11px] font-semibold px-2! py-0.5! rounded-full border capitalize ${stTone(LEAD_STATUS_STYLE, l.status)}`}
                      >
                        {l.status}
                      </span>
                    </td>
                    <td className="px-5! py-3.5! text-[var(--muted)] text-[12.5px] whitespace-nowrap">
                      {relTime(l.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {editing && (
        <LeadModal
          agentId={agentId}
          lead={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            load();
            onChange();
          }}
        />
      )}
    </div>
  );
}

function LeadModal({
  agentId,
  lead,
  onClose,
  onSaved,
}: {
  agentId: string;
  lead: Lead | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({
    name: lead?.name || "",
    email: lead?.email || "",
    phone: lead?.phone || "",
    company: lead?.company || "",
    interest: lead?.interest || "",
    notes: lead?.notes || "",
    status: lead?.status || "new",
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const save = async () => {
    if (!lead && !form.name && !form.email && !form.phone && !form.company) {
      setErr("Provide at least a name, email, phone, or company.");
      return;
    }
    setSaving(true);
    setErr(null);
    try {
      if (lead) {
        await updateLead(agentId, lead.id, form);
      } else {
        await createLead(agentId, form);
      }
      onSaved();
    } catch (e: any) {
      setErr(e?.message || "Couldn't save the lead.");
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!lead) return;
    if (!confirm("Delete this lead? This can't be undone.")) return;
    setSaving(true);
    try {
      await deleteLead(agentId, lead.id);
      onSaved();
    } catch {
      setErr("Couldn't delete the lead.");
      setSaving(false);
    }
  };

  return (
    <Modal
      title={lead ? "Edit lead" : "Add lead"}
      onClose={onClose}
      wide
      footer={
        <>
          {lead && (
            <button
              onClick={remove}
              disabled={saving}
              className="inline-flex items-center gap-1.5! text-[13px] font-semibold text-rose-600 px-4! py-2.5! rounded-xl border border-rose-100 hover:bg-rose-50 mr-auto! transition-colors"
            >
              <Trash2 size={14} /> Delete
            </button>
          )}
          <button
            onClick={onClose}
            className="text-[13px] font-semibold text-[var(--slate)] px-4! py-2.5! rounded-xl border border-[var(--line)] hover:bg-[var(--line-soft)] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={save}
            disabled={saving}
            className="inline-flex items-center gap-2! text-white text-[13px] font-semibold px-5! py-2.5! rounded-xl disabled:opacity-60"
            style={{ background: "var(--grad)" }}
          >
            <Check size={15} /> Save
          </button>
        </>
      }
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4!">
        <L label="Name"><input className={inp} value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Jane Doe" /></L>
        <L label="Status">
          <select className={`${inp} appearance-none`} value={form.status} onChange={(e) => set("status", e.target.value)}>
            {LEAD_STATUSES.map((s) => (<option key={s} value={s} className="capitalize">{s}</option>))}
          </select>
        </L>
        <L label="Email"><input className={inp} value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="jane@acme.com" /></L>
        <L label="Phone"><input className={inp} value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+1 555…" /></L>
        <L label="Company"><input className={inp} value={form.company} onChange={(e) => set("company", e.target.value)} placeholder="Acme Inc." /></L>
        <L label="Interest"><input className={inp} value={form.interest} onChange={(e) => set("interest", e.target.value)} placeholder="What they want" /></L>
        <div className="sm:col-span-2">
          <L label="Notes"><textarea className={`${inp} resize-y`} rows={3} value={form.notes} onChange={(e) => set("notes", e.target.value)} placeholder="Anything else…" /></L>
        </div>
      </div>
      {err && (
        <div className="flex items-center gap-2! text-[13px] text-rose-600 bg-rose-50 border border-rose-100 rounded-xl px-3.5! py-2.5! mt-4!">
          <AlertCircle size={15} /> {err}
        </div>
      )}
    </Modal>
  );
}

// ── Appointments tab ──────────────────────────────────────────────────────────
function AppointmentsTab({ agentId, onChange }: { agentId: string; onChange: () => void }) {
  const [appts, setAppts] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [upcomingOnly, setUpcomingOnly] = useState(false);
  const [booking, setBooking] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setAppts(await listAppointments(agentId, { status: filter || undefined, upcomingOnly }));
    } catch {
      setAppts([]);
    } finally {
      setLoading(false);
    }
  }, [agentId, filter, upcomingOnly]);

  useEffect(() => {
    load();
  }, [load]);

  const setStatus = async (id: string, status: ApptStatus) => {
    setAppts((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
    try {
      await updateAppointmentStatus(agentId, id, status);
    } catch {
      /* ignore */
    }
    load();
    onChange();
  };

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3! mb-4!">
        <div className="flex items-center gap-1! bg-white border border-[var(--line)] rounded-xl p-1! shadow-[var(--shadow-sm)]">
          {["", "booked", "completed", "cancelled", "no_show"].map((s) => (
            <button
              key={s || "all"}
              onClick={() => setFilter(s)}
              className={`px-2.5! py-1.5! rounded-lg text-[12px] font-medium transition-colors ${
                filter === s ? "bg-[var(--violet-050)] text-[var(--violet-700)]" : "text-[var(--slate)] hover:text-[var(--ink)]"
              }`}
            >
              {s ? s.replace("_", " ") : "All"}
            </button>
          ))}
        </div>
        <label className="flex items-center gap-2! text-[13px] text-[var(--slate)] cursor-pointer select-none">
          <input type="checkbox" checked={upcomingOnly} onChange={(e) => setUpcomingOnly(e.target.checked)} className="w-4! h-4! accent-[var(--violet)]" />
          Upcoming only
        </label>
        <button
          onClick={() => setBooking(true)}
          className="ml-auto! inline-flex items-center gap-2! text-white text-[13px] font-semibold px-4! py-2.5! rounded-xl"
          style={{ background: "var(--grad)" }}
        >
          <CalendarPlus size={15} /> Book appointment
        </button>
      </div>

      <div className="bg-white border border-[var(--line)] rounded-2xl shadow-[var(--shadow-sm)] overflow-hidden">
        {loading ? (
          <div className="p-10! grid place-items-center">
            <div className="w-7! h-7! border-2 border-[var(--line)] border-t-[var(--violet)] rounded-full animate-spin" />
          </div>
        ) : appts.length === 0 ? (
          <div className="p-10! text-center">
            <CalendarClock size={22} className="text-[var(--muted)] mx-auto! mb-2!" />
            <p className="text-sm font-semibold text-[var(--ink)]">No appointments</p>
            <p className="text-[13px] text-[var(--muted)] mt-1!">
              Enable appointments in Capabilities so your agent can book, or add one manually.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[var(--line-soft)]">
            {appts.map((a) => {
              const active = a.status === "booked";
              return (
                <div key={a.id} className="flex flex-wrap items-center gap-3! p-4! md:px-5!">
                  <div className="w-11! h-11! rounded-xl grid place-items-center text-[var(--violet-700)] bg-[var(--violet-050)] border border-[var(--violet-100)] shrink-0">
                    <CalendarClock size={18} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[14px] font-medium text-[var(--ink)]">
                      {a.visitor_name || "Visitor"}
                      {a.purpose ? <span className="text-[var(--muted)] font-normal"> · {a.purpose}</span> : null}
                    </p>
                    <p className="text-[12.5px] text-[var(--slate)] flex flex-wrap items-center gap-x-3! gap-y-0.5!">
                      <span className="flex items-center gap-1!">
                        <Clock size={12} className="text-[var(--muted)]" /> {fmtDateTime(a.starts_at, a.timezone)}
                      </span>
                      <span className="text-[var(--muted)]">{a.timezone}</span>
                      {a.visitor_email && <span className="text-[var(--muted)]">· {a.visitor_email}</span>}
                      {a.visitor_phone && <span className="text-[var(--muted)]">· {a.visitor_phone}</span>}
                    </p>
                  </div>
                  <span className={`inline-flex items-center text-[11px] font-semibold px-2.5! py-1! rounded-full border capitalize ${stTone(APPT_STATUS_STYLE, a.status)}`}>
                    {a.status.replace("_", " ")}
                  </span>
                  {active && (
                    <div className="flex items-center gap-1.5!">
                      <button onClick={() => setStatus(a.id, "completed")} title="Mark completed" className="w-8! h-8! rounded-lg border border-[var(--line)] grid place-items-center text-[var(--muted)] hover:text-emerald-600 hover:bg-emerald-50 transition-colors"><Check size={14} /></button>
                      <button onClick={() => setStatus(a.id, "no_show")} title="No show" className="w-8! h-8! rounded-lg border border-[var(--line)] grid place-items-center text-[var(--muted)] hover:text-amber-600 hover:bg-amber-50 transition-colors"><AlertCircle size={14} /></button>
                      <button onClick={() => setStatus(a.id, "cancelled")} title="Cancel" className="w-8! h-8! rounded-lg border border-[var(--line)] grid place-items-center text-[var(--muted)] hover:text-rose-600 hover:bg-rose-50 transition-colors"><X size={14} /></button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {booking && (
        <BookModal
          agentId={agentId}
          onClose={() => setBooking(false)}
          onBooked={() => {
            setBooking(false);
            load();
            onChange();
          }}
        />
      )}
    </div>
  );
}

function BookModal({ agentId, onClose, onBooked }: { agentId: string; onClose: () => void; onBooked: () => void }) {
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [enabled, setEnabled] = useState(true);
  const [loading, setLoading] = useState(true);
  const [slot, setSlot] = useState<AvailabilitySlot | null>(null);
  const [visitor, setVisitor] = useState({ name: "", email: "", phone: "", purpose: "" });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    getAvailability(agentId)
      .then((r) => {
        setEnabled(r.enabled);
        setSlots(r.slots || []);
      })
      .catch(() => setSlots([]))
      .finally(() => setLoading(false));
  }, [agentId]);

  const book = async () => {
    if (!slot) return setErr("Pick a time slot.");
    setSaving(true);
    setErr(null);
    try {
      await createAppointment(agentId, {
        starts_at: slot.starts_at,
        visitor_name: visitor.name || undefined,
        visitor_email: visitor.email || undefined,
        visitor_phone: visitor.phone || undefined,
        purpose: visitor.purpose || undefined,
      });
      onBooked();
    } catch (e: any) {
      setErr(e?.message || "That slot couldn't be booked.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      title="Book appointment"
      onClose={onClose}
      wide
      footer={
        <>
          <button onClick={onClose} className="text-[13px] font-semibold text-[var(--slate)] px-4! py-2.5! rounded-xl border border-[var(--line)] hover:bg-[var(--line-soft)] transition-colors">Cancel</button>
          <button onClick={book} disabled={saving || !slot} className="inline-flex items-center gap-2! text-white text-[13px] font-semibold px-5! py-2.5! rounded-xl disabled:opacity-60" style={{ background: "var(--grad)" }}>
            <CalendarPlus size={15} /> Book
          </button>
        </>
      }
    >
      {loading ? (
        <div className="py-8! grid place-items-center"><div className="w-7! h-7! border-2 border-[var(--line)] border-t-[var(--violet)] rounded-full animate-spin" /></div>
      ) : (
        <>
          {!enabled && (
            <div className="flex items-center gap-2! text-[13px] text-amber-700 bg-amber-50 border border-amber-100 rounded-xl px-3.5! py-2.5! mb-4!">
              <AlertCircle size={15} /> Appointments are disabled for this agent — enable them in Capabilities. You can still book manually below.
            </div>
          )}
          <p className="text-[13px] font-medium text-[var(--slate)] mb-2!">Available slots</p>
          {slots.length === 0 ? (
            <p className="text-[13px] text-[var(--muted)] mb-4!">No open slots — adjust business hours in Capabilities.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2! max-h-56! overflow-y-auto mb-4!">
              {slots.map((s) => (
                <button
                  key={s.starts_at}
                  onClick={() => setSlot(s)}
                  className={`text-[12.5px] font-medium px-3! py-2! rounded-lg border transition-colors text-left ${
                    slot?.starts_at === s.starts_at
                      ? "border-[var(--violet)] bg-[var(--violet-050)] text-[var(--violet-700)]"
                      : "border-[var(--line)] text-[var(--slate)] hover:border-[var(--violet-100)]"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4!">
            <L label="Visitor name"><input className={inp} value={visitor.name} onChange={(e) => setVisitor({ ...visitor, name: e.target.value })} placeholder="Jane Doe" /></L>
            <L label="Purpose"><input className={inp} value={visitor.purpose} onChange={(e) => setVisitor({ ...visitor, purpose: e.target.value })} placeholder="Demo call" /></L>
            <L label="Email"><input className={inp} value={visitor.email} onChange={(e) => setVisitor({ ...visitor, email: e.target.value })} placeholder="jane@acme.com" /></L>
            <L label="Phone"><input className={inp} value={visitor.phone} onChange={(e) => setVisitor({ ...visitor, phone: e.target.value })} placeholder="+1 555…" /></L>
          </div>
          {err && (
            <div className="flex items-center gap-2! text-[13px] text-rose-600 bg-rose-50 border border-rose-100 rounded-xl px-3.5! py-2.5! mt-4!">
              <AlertCircle size={15} /> {err}
            </div>
          )}
        </>
      )}
    </Modal>
  );
}

// ── Settings / capabilities tab ───────────────────────────────────────────────
type EditHours = Record<string, { open: boolean; start: string; end: string }>;

function toEditHours(bh: BusinessHours): EditHours {
  const out: EditHours = {};
  for (const d of WEEK_DAYS) {
    const r = bh?.[d] || [];
    out[d] = r.length ? { open: true, start: r[0][0], end: r[0][1] } : { open: false, start: "09:00", end: "17:00" };
  }
  return out;
}
function fromEditHours(h: EditHours): BusinessHours {
  const out: BusinessHours = {};
  for (const d of WEEK_DAYS) out[d] = h[d].open ? [[h[d].start, h[d].end]] : [];
  return out;
}

function SettingsTab({ agentId }: { agentId: string }) {
  const [settings, setSettings] = useState<CrmSettings | null>(null);
  const [hours, setHours] = useState<EditHours | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveErr, setSaveErr] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    getCrmSettings(agentId)
      .then((s) => {
        setSettings(s);
        setHours(toEditHours(s.appointment_config.business_hours));
      })
      .catch(() => setSettings(null))
      .finally(() => setLoading(false));
  }, [agentId]);

  const patchCfg = (patch: Partial<CrmSettings["appointment_config"]>) =>
    setSettings((s) => (s ? { ...s, appointment_config: { ...s.appointment_config, ...patch } } : s));

  const save = async () => {
    if (!settings || !hours) return;
    setSaving(true);
    setSaved(false);
    setSaveErr(null);
    try {
      const body: CrmSettings = {
        ...settings,
        meet_link: (settings.meet_link || "").trim() || null,
        appointment_config: { ...settings.appointment_config, business_hours: fromEditHours(hours) },
      };
      const res = await putCrmSettings(agentId, body);
      setSettings(res);
      setHours(toEditHours(res.appointment_config.business_hours));
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      setSaveErr(
        e instanceof Error && e.message
          ? e.message
          : "Couldn't save — check the Google Meet link.",
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading || !settings || !hours) {
    return (
      <div className="bg-white border border-[var(--line)] rounded-2xl p-10! grid place-items-center">
        <div className="w-7! h-7! border-2 border-[var(--line)] border-t-[var(--violet)] rounded-full animate-spin" />
      </div>
    );
  }

  const cfg = settings.appointment_config;
  const tzList = TZS.includes(cfg.timezone) ? TZS : [cfg.timezone, ...TZS];

  return (
    <div className="space-y-6!">
      {/* Capability flags */}
      <div className="bg-white border border-[var(--line)] rounded-2xl p-6! shadow-[var(--shadow-sm)]">
        <div className="flex items-center gap-2! mb-1!">
          <Sparkles size={16} className="text-[var(--violet-700)]" />
          <h2 className="text-base font-semibold text-[var(--ink)]">Agent capabilities</h2>
        </div>
        <p className="text-[13px] text-[var(--slate)] mb-5!">
          Tools are registered per session — a disabled capability isn&apos;t just discouraged, the model can&apos;t call it. Applies on the agent&apos;s next conversation.
        </p>
        <div className="divide-y divide-[var(--line-soft)]">
          <CapRow
            icon={<Contact size={16} />}
            title="Lead capture"
            desc="save_lead_details — records name, email, phone, company & interest, merging across turns."
            on={settings.enable_lead_capture}
            onToggle={() => setSettings({ ...settings, enable_lead_capture: !settings.enable_lead_capture })}
          />
          <CapRow
            icon={<CalendarClock size={16} />}
            title="Appointments"
            desc="check_appointment_availability, book_appointment, cancel_appointment — off by default."
            on={settings.enable_appointments}
            onToggle={() => setSettings({ ...settings, enable_appointments: !settings.enable_appointments })}
          />
          <CapRow
            icon={<ShieldAlert size={16} />}
            title="Human handoff"
            desc="request_human_handoff — records a reason and promotes the lead to qualified."
            on={settings.enable_human_handoff}
            onToggle={() => setSettings({ ...settings, enable_human_handoff: !settings.enable_human_handoff })}
          />
        </div>
      </div>

      {/* Appointment config */}
      {settings.enable_appointments && (
        <div className="bg-white border border-[var(--line)] rounded-2xl p-6! shadow-[var(--shadow-sm)]">
          <div className="flex items-center gap-2! mb-1!">
            <CalendarClock size={16} className="text-[var(--violet-700)]" />
            <h2 className="text-base font-semibold text-[var(--ink)]">Scheduling</h2>
          </div>
          <p className="text-[13px] text-[var(--slate)] mb-5!">
            Slots are generated in your timezone and spoken to visitors in theirs.
          </p>

          {/* Google Meet link */}
          <div className="mb-6! p-4! rounded-xl border border-[var(--line)] bg-[var(--violet-050)]/40">
            <label className="flex items-center gap-2! text-[13px] font-medium text-[var(--slate)] mb-1.5!">
              <Video size={14} className="text-[var(--violet-700)]" /> Google Meet link
            </label>
            <input
              className={inp}
              value={settings.meet_link || ""}
              onChange={(e) => setSettings({ ...settings, meet_link: e.target.value })}
              placeholder="meet.google.com/abc-defg-hij  (or a bare code)"
            />
            <p className="text-[12px] text-[var(--muted)] mt-1.5!">
              Reused for every booking and added to confirmation emails. Paste the
              full URL or just the code — we normalize it and reject non-Meet links.
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4! mb-6!">
            <L label="Timezone">
              <select className={`${inp} appearance-none`} value={cfg.timezone} onChange={(e) => patchCfg({ timezone: e.target.value })}>
                {tzList.map((t) => (<option key={t} value={t}>{t}</option>))}
              </select>
            </L>
            <L label="Slot length (min)"><input type="number" min={5} max={480} className={inp} value={cfg.slot_minutes} onChange={(e) => patchCfg({ slot_minutes: +e.target.value })} /></L>
            <L label="Buffer (min)"><input type="number" min={0} max={240} className={inp} value={cfg.buffer_minutes} onChange={(e) => patchCfg({ buffer_minutes: +e.target.value })} /></L>
            <L label="Min notice (min)"><input type="number" min={0} max={20160} className={inp} value={cfg.min_notice_minutes} onChange={(e) => patchCfg({ min_notice_minutes: +e.target.value })} /></L>
            <L label="Max days ahead"><input type="number" min={1} max={180} className={inp} value={cfg.max_days_ahead} onChange={(e) => patchCfg({ max_days_ahead: +e.target.value })} /></L>
          </div>

          <p className="text-[13px] font-medium text-[var(--slate)] mb-3!">Business hours</p>
          <div className="space-y-2!">
            {WEEK_DAYS.map((d) => (
              <div key={d} className="flex items-center gap-3! flex-wrap">
                <label className="flex items-center gap-2! w-28! cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={hours[d].open}
                    onChange={(e) => setHours({ ...hours, [d]: { ...hours[d], open: e.target.checked } })}
                    className="w-4! h-4! accent-[var(--violet)]"
                  />
                  <span className="text-[13px] font-medium text-[var(--ink)] capitalize">{d}</span>
                </label>
                {hours[d].open ? (
                  <div className="flex items-center gap-2!">
                    <input type="time" value={hours[d].start} onChange={(e) => setHours({ ...hours, [d]: { ...hours[d], start: e.target.value } })} className={`${inp} w-32!`} />
                    <span className="text-[var(--muted)] text-sm">to</span>
                    <input type="time" value={hours[d].end} onChange={(e) => setHours({ ...hours, [d]: { ...hours[d], end: e.target.value } })} className={`${inp} w-32!`} />
                  </div>
                ) : (
                  <span className="text-[13px] text-[var(--muted)]">Closed</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {saveErr && (
        <div className="flex items-center gap-2! text-[13px] text-rose-600 bg-rose-50 border border-rose-100 rounded-xl px-4! py-3!">
          <AlertCircle size={15} className="shrink-0" /> {saveErr}
        </div>
      )}

      <div className="flex items-center justify-end gap-3!">
        {saved && (
          <span className="flex items-center gap-1.5! text-[13px] font-medium text-emerald-700">
            <Check size={15} /> Saved
          </span>
        )}
        <button
          onClick={save}
          disabled={saving}
          className="inline-flex items-center gap-2! text-white text-[13px] font-semibold px-6! py-2.5! rounded-xl shadow-[0_8px_24px_rgba(124,58,237,0.25)] disabled:opacity-60"
          style={{ background: "var(--grad)" }}
        >
          {saving ? <RefreshCw size={15} className="animate-spin" /> : <Check size={15} />}
          Save capabilities
        </button>
      </div>
    </div>
  );
}

// ── Small shared pieces ───────────────────────────────────────────────────────
function Stat({ label, value, icon, accent }: { label: string; value: string; icon: React.ReactNode; accent?: boolean }) {
  return (
    <div className={`bg-white border rounded-2xl p-4! shadow-[var(--shadow-sm)] ${accent ? "border-[var(--violet-100)]" : "border-[var(--line)]"}`}>
      <span className={`w-9! h-9! rounded-lg grid place-items-center border mb-3! ${accent ? "text-amber-600 bg-amber-50 border-amber-100" : "text-[var(--violet-700)] bg-[var(--violet-050)] border-[var(--violet-100)]"}`}>
        {icon}
      </span>
      <div className="text-[22px] font-semibold text-[var(--ink)] font-display leading-none">{value}</div>
      <div className="text-[12.5px] text-[var(--slate)] mt-1!">{label}</div>
    </div>
  );
}

function CapRow({ icon, title, desc, on, onToggle }: { icon: React.ReactNode; title: string; desc: string; on: boolean; onToggle: () => void }) {
  return (
    <div className="flex items-start justify-between gap-4! py-4!">
      <div className="flex items-start gap-3!">
        <span className="w-9! h-9! rounded-lg grid place-items-center text-[var(--violet-700)] bg-[var(--violet-050)] border border-[var(--violet-100)] shrink-0">{icon}</span>
        <div>
          <p className="text-[14px] font-medium text-[var(--ink)]">{title}</p>
          <p className="text-[12.5px] text-[var(--muted)] mt-0.5! max-w-[520px]!">{desc}</p>
        </div>
      </div>
      <button
        onClick={onToggle}
        role="switch"
        aria-checked={on}
        className={`relative w-11! h-6! rounded-full shrink-0 transition-colors ${on ? "" : "bg-[var(--line)]"}`}
        style={on ? { background: "var(--grad)" } : undefined}
      >
        <span className={`absolute top-0.5! left-0.5! w-5! h-5! rounded-full bg-white shadow-sm transition-transform ${on ? "translate-x-5" : ""}`} />
      </button>
    </div>
  );
}

function L({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="w-full!">
      <label className="block text-[13px] font-medium text-[var(--slate)] mb-1.5!">{label}</label>
      {children}
    </div>
  );
}

function Modal({ title, onClose, children, footer, wide }: { title: string; onClose: () => void; children: React.ReactNode; footer?: React.ReactNode; wide?: boolean }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-4! bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className={`bg-white rounded-2xl shadow-2xl border border-[var(--line)] w-full! ${wide ? "max-w-2xl!" : "max-w-md!"} max-h-[90vh]! flex flex-col`}>
        <div className="flex items-center justify-between p-5! border-b border-[var(--line-soft)]">
          <h3 className="text-[16px] font-semibold text-[var(--ink)]">{title}</h3>
          <button onClick={onClose} className="w-8! h-8! grid place-items-center rounded-lg text-[var(--muted)] hover:bg-[var(--line-soft)] transition-colors"><X size={16} /></button>
        </div>
        <div className="p-5! overflow-y-auto">{children}</div>
        {footer && <div className="flex items-center justify-end gap-2! p-5! border-t border-[var(--line-soft)]">{footer}</div>}
      </div>
    </div>
  );
}

function EmptyCard({ icon, title, desc, action }: { icon: React.ReactNode; title: string; desc: string; action?: React.ReactNode }) {
  return (
    <div className="bg-white border border-[var(--line)] rounded-2xl p-10! text-center">
      <span className="text-[var(--muted)] inline-flex mb-3!">{icon}</span>
      <p className="text-[15px] font-semibold text-[var(--ink)]">{title}</p>
      <p className="text-[13px] text-[var(--muted)] mt-1! mb-5!">{desc}</p>
      {action}
    </div>
  );
}

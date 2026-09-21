"use client";

/**
 * Agent capability tools: lead capture, appointments, human handoff — plus the
 * account-level Google Calendar connection they lean on.
 *
 * These are real tools, not prompt hints: the worker registers a function per
 * enabled capability when a session starts, so a switch here changes what the
 * model can physically do on its next conversation.
 *
 * Two save behaviours, on purpose:
 *  - The three switches persist immediately (a switch that needs a Save button
 *    is a switch people leave in the wrong position).
 *  - The scheduling form has an explicit Save, and a switch never flushes an
 *    unsaved form draft, because saving half-typed business hours to a live
 *    agent is worse than making someone press a button.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowUpRight,
  CalendarCheck2,
  CalendarClock,
  Check,
  CheckCircle2,
  Contact,
  Copy,
  ExternalLink,
  Info,
  Link2,
  Loader2,
  Plus,
  RefreshCw,
  ShieldAlert,
  Trash2,
  Unplug,
  Video,
} from "lucide-react";
import {
  WEEK_DAYS,
  getAvailability,
  getCrmSettings,
  getCrmSummary,
  listAppointments,
  putCrmSettings,
  updateAppointmentStatus,
  type Appointment,
  type AppointmentConfig,
  type AvailabilityResponse,
  type BusinessHours,
  type CrmSettings,
  type CrmSummary,
  type WeekDay,
} from "@/lib/api/crm";
import {
  disconnectGoogle,
  getGoogleAuthUrl,
  getGoogleSettings,
  type GoogleStatus,
} from "@/lib/api/google";
import { getSmtp, type SmtpConfig } from "@/lib/api/smtp";
import { useToast } from "@/components/widget/Toast";
import {
  GhostButton,
  Label,
  Modal,
  PrimaryButton,
  Spinner,
  Toggle,
} from "@/components/console/ui";

// ── Option lists ─────────────────────────────────────────────────────────────

const SLOT_OPTIONS = [15, 20, 30, 45, 60, 90, 120];
const BUFFER_OPTIONS = [0, 5, 10, 15, 30];
const NOTICE_OPTIONS = [0, 30, 60, 120, 240, 1440];
const WINDOW_OPTIONS = [7, 14, 30, 60, 90];

const FALLBACK_TZS = [
  "UTC",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "America/Sao_Paulo",
  "Europe/London",
  "Europe/Berlin",
  "Europe/Paris",
  "Europe/Madrid",
  "Africa/Lagos",
  "Africa/Johannesburg",
  "Asia/Dubai",
  "Asia/Kolkata",
  "Asia/Singapore",
  "Asia/Tokyo",
  "Australia/Sydney",
  "Pacific/Auckland",
];

const DAY_LABELS: Record<WeekDay, string> = {
  mon: "Monday",
  tue: "Tuesday",
  wed: "Wednesday",
  thu: "Thursday",
  fri: "Friday",
  sat: "Saturday",
  sun: "Sunday",
};

const WEEKDAYS: WeekDay[] = ["mon", "tue", "wed", "thu", "fri"];

function timezoneOptions(current: string): string[] {
  let zones = FALLBACK_TZS;
  try {
    // Intl.supportedValuesOf is the full IANA list where the runtime has it.
    const supported = (
      Intl as unknown as { supportedValuesOf?: (k: string) => string[] }
    ).supportedValuesOf?.("timeZone");
    if (supported?.length) zones = supported;
  } catch {
    /* keep the curated list */
  }
  return zones.includes(current) ? zones : [current, ...zones];
}

const noticeLabel = (m: number) =>
  m === 0
    ? "No minimum"
    : m < 60
      ? `${m} minutes ahead`
      : m === 60
        ? "1 hour ahead"
        : m < 1440
          ? `${m / 60} hours ahead`
          : "1 day ahead";

// ── Business-hours editing ───────────────────────────────────────────────────

type Range = { start: string; end: string };
type EditHours = Record<WeekDay, Range[]>;

function toEditHours(bh: BusinessHours | undefined): EditHours {
  const out = {} as EditHours;
  for (const d of WEEK_DAYS) {
    out[d] = (bh?.[d] || []).map(([start, end]) => ({ start, end }));
  }
  return out;
}

function fromEditHours(hours: EditHours): BusinessHours {
  const out: BusinessHours = {};
  for (const d of WEEK_DAYS) {
    out[d] = hours[d].map((r) => [r.start, r.end] as [string, string]);
  }
  return out;
}

const minutes = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
};

/** First problem with the hours, or null. Blocks Save so bad hours never ship. */
function validateHours(hours: EditHours): string | null {
  for (const day of WEEK_DAYS) {
    const ranges = [...hours[day]].sort((a, b) => minutes(a.start) - minutes(b.start));
    for (const r of ranges) {
      if (!r.start || !r.end) return `${DAY_LABELS[day]}: fill in both times.`;
      if (minutes(r.end) <= minutes(r.start))
        return `${DAY_LABELS[day]}: the closing time must be after the opening time.`;
    }
    for (let i = 1; i < ranges.length; i += 1) {
      if (minutes(ranges[i].start) < minutes(ranges[i - 1].end))
        return `${DAY_LABELS[day]}: the time windows overlap.`;
    }
  }
  if (WEEK_DAYS.every((d) => hours[d].length === 0))
    return "Open at least one day, or visitors will never be offered a slot.";
  return null;
}

// ── Panel ────────────────────────────────────────────────────────────────────

export function CapabilitiesPanel({
  agentId,
  showIntegrations = true,
}: {
  agentId: string;
  /** The Google connection is account-level; hide it where it's shown already. */
  showIntegrations?: boolean;
}) {
  const { showToast } = useToast();

  const [settings, setSettings] = useState<CrmSettings | null>(null);
  const [summary, setSummary] = useState<CrmSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [togglingKey, setTogglingKey] = useState<string | null>(null);

  // Scheduling form draft — kept apart from `settings` so a capability switch
  // never silently persists half-finished hours.
  const [draftConfig, setDraftConfig] = useState<AppointmentConfig | null>(null);
  const [draftHours, setDraftHours] = useState<EditHours | null>(null);
  const [draftMeet, setDraftMeet] = useState("");
  const [savingConfig, setSavingConfig] = useState(false);
  const [configError, setConfigError] = useState<string | null>(null);
  const [configSaved, setConfigSaved] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const data = await getCrmSettings(agentId);
      setSettings(data);
      setDraftConfig(data.appointment_config);
      setDraftHours(toEditHours(data.appointment_config.business_hours));
      setDraftMeet(data.meet_link || "");
    } catch (e) {
      setLoadError(
        e instanceof Error ? e.message : "Could not load this agent's tools.",
      );
    } finally {
      setLoading(false);
    }
    getCrmSummary(agentId).then(setSummary).catch(() => setSummary(null));
  }, [agentId]);

  useEffect(() => {
    load();
  }, [load]);

  /** Flip one capability and persist it, sending the SERVER's config as-is. */
  const toggleCapability = async (
    key: "enable_lead_capture" | "enable_appointments" | "enable_human_handoff",
    next: boolean,
  ) => {
    if (!settings) return;
    const previous = settings;
    const optimistic = { ...settings, [key]: next };
    setSettings(optimistic);
    setTogglingKey(key);
    try {
      const saved = await putCrmSettings(agentId, {
        enable_lead_capture: optimistic.enable_lead_capture,
        enable_appointments: optimistic.enable_appointments,
        enable_human_handoff: optimistic.enable_human_handoff,
        appointment_config: previous.appointment_config,
        meet_link: previous.meet_link ?? null,
      });
      setSettings(saved);
      showToast({
        type: "success",
        title: next ? "Tool enabled" : "Tool disabled",
        message: "Applies to the agent's next conversation.",
      });
    } catch (e) {
      setSettings(previous); // the server still has the old value
      showToast({
        type: "error",
        title: "Could not change that",
        message: e instanceof Error ? e.message : "Try again.",
      });
    } finally {
      setTogglingKey(null);
    }
  };

  const patchConfig = (patch: Partial<AppointmentConfig>) =>
    setDraftConfig((c) => (c ? { ...c, ...patch } : c));

  const configDirty = useMemo(() => {
    if (!settings || !draftConfig || !draftHours) return false;
    const a = JSON.stringify({
      ...draftConfig,
      business_hours: fromEditHours(draftHours),
      meet: draftMeet.trim(),
    });
    const b = JSON.stringify({
      ...settings.appointment_config,
      business_hours: settings.appointment_config.business_hours,
      meet: settings.meet_link || "",
    });
    return a !== b;
  }, [settings, draftConfig, draftHours, draftMeet]);

  const saveConfig = async () => {
    if (!settings || !draftConfig || !draftHours) return;
    const problem = validateHours(draftHours);
    if (problem) {
      setConfigError(problem);
      return;
    }
    setSavingConfig(true);
    setConfigError(null);
    try {
      const saved = await putCrmSettings(agentId, {
        enable_lead_capture: settings.enable_lead_capture,
        enable_appointments: settings.enable_appointments,
        enable_human_handoff: settings.enable_human_handoff,
        appointment_config: {
          ...draftConfig,
          business_hours: fromEditHours(draftHours),
        },
        meet_link: draftMeet.trim() || null,
      });
      setSettings(saved);
      setDraftConfig(saved.appointment_config);
      setDraftHours(toEditHours(saved.appointment_config.business_hours));
      setDraftMeet(saved.meet_link || "");
      setConfigSaved(true);
      setTimeout(() => setConfigSaved(false), 2500);
      showToast({ type: "success", title: "Scheduling saved" });
    } catch (e) {
      // The server rejects a malformed Meet link with a helpful detail — show it.
      setConfigError(
        e instanceof Error ? e.message : "Could not save the scheduling rules.",
      );
    } finally {
      setSavingConfig(false);
    }
  };

  if (loading) {
    return (
      <div className="grid place-items-center py-16!">
        <Spinner />
      </div>
    );
  }

  if (loadError || !settings || !draftConfig || !draftHours) {
    return (
      <div className="flex items-start gap-2! text-[13px] text-red-600 bg-red-50 border border-red-200 rounded-xl px-4! py-3!">
        <AlertCircle size={15} className="shrink-0 mt-0.5!" />
        <span className="flex-1">{loadError || "Tools unavailable."}</span>
        <button onClick={load} className="font-semibold underline hover:no-underline">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4!">
      <div className="flex items-start gap-2.5! bg-[var(--violet-050)] border border-[var(--violet-100)] rounded-xl px-4! py-3!">
        <Info size={15} className="text-[var(--violet-700)] shrink-0 mt-0.5!" />
        <p className="text-[12.5px] text-[var(--slate)] leading-relaxed">
          Each switch registers or removes a real function on the agent&apos;s{" "}
          <span className="font-semibold text-[var(--ink)]">next</span>{" "}
          conversation — a disabled tool isn&apos;t merely discouraged, the model
          has no way to call it. Calls already running keep the tools they
          started with.
        </p>
      </div>

      {/* ── Lead capture ─────────────────────────────────────────────────── */}
      <ToolCard
        icon={<Contact size={17} />}
        title="Lead capture"
        fns={["save_lead_details"]}
        desc="Records a visitor's name, email, phone, company and interest as they mention them, merging details across the conversation."
        on={settings.enable_lead_capture}
        busy={togglingKey === "enable_lead_capture"}
        onToggle={(v) => toggleCapability("enable_lead_capture", v)}
        stats={
          summary
            ? [
                { label: "Leads captured", value: summary.leads_total },
                { label: "With contact details", value: summary.leads_with_contact },
              ]
            : []
        }
        footer={
          <Link
            href="/dashboard/crm"
            className="inline-flex items-center gap-1.5! text-[12.5px] font-semibold text-[var(--violet-700)] hover:text-[var(--violet-600)]"
          >
            View leads <ArrowUpRight size={13} />
          </Link>
        }
      />

      {/* ── Appointments ─────────────────────────────────────────────────── */}
      <ToolCard
        icon={<CalendarClock size={17} />}
        title="Appointments"
        fns={[
          "check_appointment_availability",
          "book_appointment",
          "check_existing_appointment",
          "cancel_appointment",
        ]}
        desc="Offers free slots from your business hours, books them, and emails a confirmation with a meeting link."
        on={settings.enable_appointments}
        busy={togglingKey === "enable_appointments"}
        onToggle={(v) => toggleCapability("enable_appointments", v)}
        stats={
          summary
            ? [{ label: "Upcoming bookings", value: summary.appointments_upcoming }]
            : []
        }
      >
        {settings.enable_appointments && (
          <div className="mt-5! pt-5! border-t border-[var(--line)] space-y-5!">
            <SchedulingForm
              config={draftConfig}
              hours={draftHours}
              meet={draftMeet}
              onConfig={patchConfig}
              onHours={setDraftHours}
              onMeet={setDraftMeet}
            />

            {configError && (
              <p className="flex items-start gap-2! text-[13px] text-red-600 bg-red-50 border border-red-200 rounded-xl px-3.5! py-3!">
                <AlertCircle size={15} className="shrink-0 mt-0.5!" /> {configError}
              </p>
            )}

            <div className="flex items-center gap-3!">
              <PrimaryButton
                onClick={saveConfig}
                loading={savingConfig}
                disabled={!configDirty}
              >
                {configSaved ? <Check size={15} /> : null}
                {configSaved ? "Saved" : configDirty ? "Save scheduling" : "Saved"}
              </PrimaryButton>
              {configDirty && !savingConfig && (
                <button
                  onClick={() => {
                    setDraftConfig(settings.appointment_config);
                    setDraftHours(toEditHours(settings.appointment_config.business_hours));
                    setDraftMeet(settings.meet_link || "");
                    setConfigError(null);
                  }}
                  className="text-[12.5px] font-semibold text-[var(--muted)] hover:text-[var(--ink)]"
                >
                  Discard changes
                </button>
              )}
              <span className="ml-auto text-[11.5px] text-[var(--muted)]">
                {configDirty
                  ? "Unsaved changes — the agent still uses the saved rules."
                  : "The agent is using these rules."}
              </span>
            </div>

            <AvailabilityPreview agentId={agentId} dirty={configDirty} />
            <UpcomingAppointments agentId={agentId} onChanged={load} />
          </div>
        )}
      </ToolCard>

      {/* ── Human handoff ────────────────────────────────────────────────── */}
      <HumanHandoffCard
        on={settings.enable_human_handoff}
        busy={togglingKey === "enable_human_handoff"}
        onToggle={(v) => toggleCapability("enable_human_handoff", v)}
      />

      {/* ── Google Calendar ──────────────────────────────────────────────── */}
      {showIntegrations && (
        <GoogleCalendarCard
          appointmentsOn={settings.enable_appointments}
          meetLink={settings.meet_link || null}
        />
      )}
    </div>
  );
}

// ── Card shell ───────────────────────────────────────────────────────────────

function ToolCard({
  icon,
  title,
  fns,
  desc,
  on,
  busy,
  onToggle,
  stats = [],
  footer,
  children,
  warning,
}: {
  icon: React.ReactNode;
  title: string;
  fns: string[];
  desc: string;
  on: boolean;
  busy?: boolean;
  onToggle: (v: boolean) => void;
  stats?: { label: string; value: number }[];
  footer?: React.ReactNode;
  children?: React.ReactNode;
  warning?: React.ReactNode;
}) {
  return (
    <div
      className={`bg-white border rounded-2xl p-5! shadow-[var(--shadow-sm)] transition-colors ${
        on ? "border-[var(--violet-100)]" : "border-[var(--line)]"
      }`}
    >
      <div className="flex items-start gap-3.5!">
        <span
          className={`w-10! h-10! rounded-xl grid place-items-center border shrink-0 ${
            on
              ? "bg-[var(--violet-050)] text-[var(--violet-700)] border-[var(--violet-100)]"
              : "bg-[var(--line-soft)] text-[var(--muted)] border-[var(--line)]"
          }`}
        >
          {icon}
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2! flex-wrap">
            <h3 className="text-[15px] font-semibold text-[var(--ink)]">{title}</h3>
            <span
              className={`text-[10.5px] font-bold px-1.5! py-0.5! rounded uppercase tracking-wide ${
                on
                  ? "text-emerald-700 bg-emerald-50 border border-emerald-200"
                  : "text-[var(--muted)] bg-[var(--line-soft)] border border-[var(--line)]"
              }`}
            >
              {on ? "On" : "Off"}
            </span>
          </div>
          <p className="text-[13px] text-[var(--slate)] mt-1! leading-relaxed">
            {desc}
          </p>
          <div className="flex flex-wrap gap-1.5! mt-2.5!">
            {fns.map((fn) => (
              <code
                key={fn}
                className="text-[11px] font-mono text-[var(--slate)] bg-[var(--sidebar)] border border-[var(--line)] px-1.5! py-0.5! rounded"
              >
                {fn}
              </code>
            ))}
          </div>
        </div>

        <div className="shrink-0 flex items-center gap-2! mt-1!">
          {busy && <Loader2 size={14} className="animate-spin text-[var(--muted)]" />}
          <Toggle on={on} onChange={onToggle} disabled={busy} label={title} />
        </div>
      </div>

      {warning}

      {(stats.length > 0 || footer) && on && (
        <div className="flex items-center flex-wrap gap-x-6! gap-y-2! mt-4! pt-4! border-t border-[var(--line)]">
          {stats.map((s) => (
            <div key={s.label}>
              <p className="text-[17px] font-semibold text-[var(--ink)] leading-none">
                {s.value}
              </p>
              <p className="text-[11.5px] text-[var(--muted)] mt-1!">{s.label}</p>
            </div>
          ))}
          {footer && <span className="ml-auto">{footer}</span>}
        </div>
      )}

      {children}
    </div>
  );
}

// ── Scheduling form ──────────────────────────────────────────────────────────

function SchedulingForm({
  config,
  hours,
  meet,
  onConfig,
  onHours,
  onMeet,
}: {
  config: AppointmentConfig;
  hours: EditHours;
  meet: string;
  onConfig: (patch: Partial<AppointmentConfig>) => void;
  onHours: (next: EditHours) => void;
  onMeet: (v: string) => void;
}) {
  const tzs = useMemo(() => timezoneOptions(config.timezone), [config.timezone]);

  const setDay = (day: WeekDay, ranges: Range[]) =>
    onHours({ ...hours, [day]: ranges });

  const copyToWeekdays = (day: WeekDay) => {
    const source = hours[day];
    const next = { ...hours };
    for (const d of WEEKDAYS) next[d] = source.map((r) => ({ ...r }));
    onHours(next);
  };

  const copyToAll = (day: WeekDay) => {
    const source = hours[day];
    const next = { ...hours } as EditHours;
    for (const d of WEEK_DAYS) next[d] = source.map((r) => ({ ...r }));
    onHours(next);
  };

  return (
    <div className="space-y-5!">
      {/* Rules */}
      <div>
        <p className="text-[13px] font-semibold text-[var(--ink)] mb-3!">
          Booking rules
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5!">
          <div>
            <Label>Timezone</Label>
            <select
              value={config.timezone}
              onChange={(e) => onConfig({ timezone: e.target.value })}
              className="fld px-3! py-2.5!"
            >
              {tzs.map((t) => (
                <option key={t} value={t}>
                  {t.replace(/_/g, " ")}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-[var(--muted)] mt-1!">
              Slots are generated here and spoken in the visitor&apos;s own zone.
            </p>
          </div>

          <div>
            <Label>Appointment length</Label>
            <select
              value={config.slot_minutes}
              onChange={(e) => onConfig({ slot_minutes: +e.target.value })}
              className="fld px-3! py-2.5!"
            >
              {(SLOT_OPTIONS.includes(config.slot_minutes)
                ? SLOT_OPTIONS
                : [config.slot_minutes, ...SLOT_OPTIONS]
              ).map((m) => (
                <option key={m} value={m}>
                  {m} minutes
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label>Gap between bookings</Label>
            <select
              value={config.buffer_minutes}
              onChange={(e) => onConfig({ buffer_minutes: +e.target.value })}
              className="fld px-3! py-2.5!"
            >
              {(BUFFER_OPTIONS.includes(config.buffer_minutes)
                ? BUFFER_OPTIONS
                : [config.buffer_minutes, ...BUFFER_OPTIONS]
              ).map((m) => (
                <option key={m} value={m}>
                  {m === 0 ? "Back to back" : `${m} minutes`}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label>Earliest booking</Label>
            <select
              value={config.min_notice_minutes}
              onChange={(e) => onConfig({ min_notice_minutes: +e.target.value })}
              className="fld px-3! py-2.5!"
            >
              {(NOTICE_OPTIONS.includes(config.min_notice_minutes)
                ? NOTICE_OPTIONS
                : [config.min_notice_minutes, ...NOTICE_OPTIONS]
              ).map((m) => (
                <option key={m} value={m}>
                  {noticeLabel(m)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label>Booking window</Label>
            <select
              value={config.max_days_ahead}
              onChange={(e) => onConfig({ max_days_ahead: +e.target.value })}
              className="fld px-3! py-2.5!"
            >
              {(WINDOW_OPTIONS.includes(config.max_days_ahead)
                ? WINDOW_OPTIONS
                : [config.max_days_ahead, ...WINDOW_OPTIONS]
              ).map((d) => (
                <option key={d} value={d}>
                  Next {d} days
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label optional>Google Meet room</Label>
            <div className="relative">
              <Video
                size={14}
                className="absolute left-3! top-1/2 -translate-y-1/2 text-[var(--muted)]"
              />
              <input
                value={meet}
                onChange={(e) => onMeet(e.target.value)}
                placeholder="meet.google.com/abc-defg-hij"
                className="fld pl-9! pr-3! py-2.5!"
              />
            </div>
            <p className="text-[11px] text-[var(--muted)] mt-1!">
              Fallback room used when Google isn&apos;t connected. A bare code
              works too.
            </p>
          </div>
        </div>
      </div>

      {/* Business hours */}
      <div>
        <p className="text-[13px] font-semibold text-[var(--ink)] mb-1!">
          Business hours
        </p>
        <p className="text-[11.5px] text-[var(--muted)] mb-3!">
          Only these windows are ever offered. Add a second window to a day for a
          lunch break.
        </p>

        <div className="border border-[var(--line)] rounded-xl divide-y divide-[var(--line)] overflow-hidden">
          {WEEK_DAYS.map((day) => {
            const ranges = hours[day];
            const open = ranges.length > 0;
            return (
              <div
                key={day}
                className={`flex flex-wrap items-start gap-3! px-3.5! py-3! ${
                  open ? "bg-white" : "bg-[var(--sidebar)]/60"
                }`}
              >
                <label className="flex items-center gap-2.5! w-[132px]! shrink-0 cursor-pointer select-none pt-1.5!">
                  <input
                    type="checkbox"
                    checked={open}
                    onChange={(e) =>
                      setDay(
                        day,
                        e.target.checked ? [{ start: "09:00", end: "17:00" }] : [],
                      )
                    }
                    className="w-4! h-4! accent-[var(--violet)]"
                  />
                  <span
                    className={`text-[13px] font-medium ${
                      open ? "text-[var(--ink)]" : "text-[var(--muted)]"
                    }`}
                  >
                    {DAY_LABELS[day]}
                  </span>
                </label>

                {!open ? (
                  <span className="text-[12.5px] text-[var(--muted)] pt-2!">
                    Closed
                  </span>
                ) : (
                  <div className="flex-1 min-w-0 space-y-2!">
                    {ranges.map((r, i) => (
                      <div key={i} className="flex items-center gap-2! flex-wrap">
                        <input
                          type="time"
                          value={r.start}
                          onChange={(e) =>
                            setDay(
                              day,
                              ranges.map((x, idx) =>
                                idx === i ? { ...x, start: e.target.value } : x,
                              ),
                            )
                          }
                          className="fld px-2.5! py-1.5! w-[118px]!"
                        />
                        <span className="text-[12px] text-[var(--muted)]">to</span>
                        <input
                          type="time"
                          value={r.end}
                          onChange={(e) =>
                            setDay(
                              day,
                              ranges.map((x, idx) =>
                                idx === i ? { ...x, end: e.target.value } : x,
                              ),
                            )
                          }
                          className="fld px-2.5! py-1.5! w-[118px]!"
                        />
                        {ranges.length > 1 && (
                          <button
                            onClick={() =>
                              setDay(day, ranges.filter((_, idx) => idx !== i))
                            }
                            title="Remove this window"
                            className="w-7! h-7! grid place-items-center rounded-md text-[var(--muted)] hover:text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    ))}

                    <div className="flex flex-wrap items-center gap-3!">
                      <button
                        onClick={() =>
                          setDay(day, [...ranges, { start: "13:00", end: "17:00" }])
                        }
                        className="inline-flex items-center gap-1! text-[11.5px] font-semibold text-[var(--violet-700)] hover:text-[var(--violet-600)]"
                      >
                        <Plus size={12} /> Add window
                      </button>
                      <button
                        onClick={() => copyToWeekdays(day)}
                        className="inline-flex items-center gap-1! text-[11.5px] font-semibold text-[var(--muted)] hover:text-[var(--ink)]"
                      >
                        <Copy size={12} /> Copy to Mon–Fri
                      </button>
                      <button
                        onClick={() => copyToAll(day)}
                        className="inline-flex items-center gap-1! text-[11.5px] font-semibold text-[var(--muted)] hover:text-[var(--ink)]"
                      >
                        <Copy size={12} /> Copy to every day
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Availability preview ─────────────────────────────────────────────────────

function AvailabilityPreview({
  agentId,
  dirty,
}: {
  agentId: string;
  dirty: boolean;
}) {
  const [date, setDate] = useState("");
  const [data, setData] = useState<AvailabilityResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(
    async (on?: string) => {
      setLoading(true);
      setError(null);
      try {
        setData(await getAvailability(agentId, on || undefined));
      } catch (e) {
        setError(e instanceof Error ? e.message : "Could not load slots.");
      } finally {
        setLoading(false);
      }
    },
    [agentId],
  );

  useEffect(() => {
    run();
  }, [run]);

  return (
    <div className="bg-[var(--sidebar)] border border-[var(--line)] rounded-xl p-4!">
      <div className="flex flex-wrap items-center gap-3! mb-3!">
        <p className="text-[13px] font-semibold text-[var(--ink)] flex items-center gap-2!">
          <CalendarCheck2 size={14} className="text-[var(--violet-700)]" /> What
          visitors will be offered
        </p>
        <div className="ml-auto flex items-center gap-2!">
          <input
            type="date"
            value={date}
            onChange={(e) => {
              setDate(e.target.value);
              run(e.target.value);
            }}
            className="fld px-2.5! py-1.5! w-[150px]! text-[12.5px]"
          />
          <button
            onClick={() => run(date)}
            disabled={loading}
            title="Refresh"
            className="w-8! h-8! grid place-items-center rounded-lg border border-[var(--line)] bg-white text-[var(--muted)] hover:text-[var(--ink)] transition-colors disabled:opacity-50"
          >
            {loading ? (
              <Loader2 size={13} className="animate-spin" />
            ) : (
              <RefreshCw size={13} />
            )}
          </button>
        </div>
      </div>

      {dirty && (
        <p className="text-[11.5px] text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-2.5! py-1.5! mb-3!">
          Showing the saved rules — save your changes to see them here.
        </p>
      )}

      {error ? (
        <p className="text-[12.5px] text-red-600">{error}</p>
      ) : loading && !data ? (
        <div className="py-4! grid place-items-center">
          <Loader2 size={16} className="animate-spin text-[var(--muted)]" />
        </div>
      ) : !data?.slots.length ? (
        <p className="text-[12.5px] text-[var(--slate)]">
          No free slots{date ? " on that date" : " in the booking window"}. Check
          the business hours, the earliest-booking rule, and whether the days are
          open.
        </p>
      ) : (
        <>
          <div className="flex flex-wrap gap-2!">
            {data.slots.slice(0, 8).map((s) => (
              <span
                key={s.starts_at}
                className="text-[11.5px] font-medium text-[var(--slate)] bg-white border border-[var(--line)] px-2.5! py-1! rounded-full"
              >
                {s.label}
              </span>
            ))}
          </div>
          <p className="text-[11px] text-[var(--muted)] mt-2.5!">
            {data.slots.length} slot{data.slots.length === 1 ? "" : "s"} found ·
            {" "}
            {data.config.slot_minutes} min · {data.config.timezone}
          </p>
        </>
      )}
    </div>
  );
}

// ── Upcoming appointments ────────────────────────────────────────────────────

function UpcomingAppointments({
  agentId,
  onChanged,
}: {
  agentId: string;
  onChanged: () => void;
}) {
  const { showToast } = useToast();
  const [items, setItems] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setItems(
        await listAppointments(agentId, { upcomingOnly: true, limit: 5 }),
      );
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [agentId]);

  useEffect(() => {
    load();
  }, [load]);

  const cancel = async (a: Appointment) => {
    setBusyId(a.id);
    try {
      await updateAppointmentStatus(agentId, a.id, "cancelled");
      showToast({ type: "success", title: "Appointment cancelled" });
      load();
      onChanged();
    } catch (e) {
      showToast({
        type: "error",
        title: "Could not cancel",
        message: e instanceof Error ? e.message : "Try again.",
      });
    } finally {
      setBusyId(null);
    }
  };

  const fmt = (iso: string, tz: string) => {
    const d = new Date(iso.endsWith("Z") || iso.includes("+") ? iso : `${iso}Z`);
    if (isNaN(d.getTime())) return iso;
    try {
      return new Intl.DateTimeFormat(undefined, {
        timeZone: tz || undefined,
        weekday: "short",
        day: "numeric",
        month: "short",
        hour: "numeric",
        minute: "2-digit",
      }).format(d);
    } catch {
      return d.toISOString().slice(0, 16).replace("T", " ");
    }
  };

  if (loading) {
    return (
      <div className="py-3! grid place-items-center">
        <Loader2 size={15} className="animate-spin text-[var(--muted)]" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-3! mb-2.5!">
        <p className="text-[13px] font-semibold text-[var(--ink)]">
          Next appointments
        </p>
        <Link
          href="/dashboard/crm"
          className="ml-auto inline-flex items-center gap-1.5! text-[12.5px] font-semibold text-[var(--violet-700)] hover:text-[var(--violet-600)]"
        >
          Manage all <ArrowUpRight size={13} />
        </Link>
      </div>

      {items.length === 0 ? (
        <p className="text-[12.5px] text-[var(--slate)] bg-[var(--sidebar)] border border-[var(--line)] rounded-xl px-3.5! py-3!">
          Nothing booked yet. Bookings made by the agent — or by you from the CRM
          — appear here.
        </p>
      ) : (
        <div className="border border-[var(--line)] rounded-xl divide-y divide-[var(--line)] overflow-hidden">
          {items.map((a) => (
            <div
              key={a.id}
              className="flex flex-wrap items-center gap-3! px-3.5! py-2.5! bg-white"
            >
              <span className="w-8! h-8! rounded-lg grid place-items-center bg-[var(--violet-050)] text-[var(--violet-700)] border border-[var(--violet-100)] shrink-0">
                <CalendarClock size={14} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-medium text-[var(--ink)] truncate">
                  {fmt(a.starts_at, a.timezone)}
                </p>
                <p className="text-[11.5px] text-[var(--muted)] truncate">
                  {a.visitor_name || a.visitor_email || "Visitor"}
                  {a.purpose ? ` · ${a.purpose}` : ""}
                </p>
              </div>
              <button
                onClick={() => cancel(a)}
                disabled={busyId === a.id}
                className="text-[11.5px] font-semibold text-[var(--muted)] hover:text-red-600 disabled:opacity-50"
              >
                {busyId === a.id ? "Cancelling…" : "Cancel"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Human handoff ────────────────────────────────────────────────────────────

function HumanHandoffCard({
  on,
  busy,
  onToggle,
}: {
  on: boolean;
  busy?: boolean;
  onToggle: (v: boolean) => void;
}) {
  const [smtp, setSmtp] = useState<SmtpConfig | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    getSmtp()
      .then(setSmtp)
      .catch(() => setSmtp(null))
      .finally(() => setChecked(true));
  }, []);

  // The tool itself always records the request; only the email alert depends on
  // SMTP, so this is a warning and never a reason to disable the capability.
  const emailReady = !!smtp?.enabled && !!smtp?.verified_at;

  return (
    <ToolCard
      icon={<ShieldAlert size={17} />}
      title="Human handoff"
      fns={["request_human_handoff"]}
      desc="Lets the agent escalate: it records the reason, promotes the lead to qualified, and emails you so someone can pick it up."
      on={on}
      busy={busy}
      onToggle={onToggle}
      warning={
        on && checked && !emailReady ? (
          <div className="flex items-start gap-2! text-[12.5px] text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-3.5! py-2.5! mt-4!">
            <AlertCircle size={14} className="shrink-0 mt-0.5!" />
            <span className="flex-1">
              Handoffs are being recorded, but no email will reach you until
              outbound email is set up and verified.
            </span>
            <Link
              href="/dashboard/settings"
              className="font-semibold underline hover:no-underline shrink-0"
            >
              Set up email
            </Link>
          </div>
        ) : on && emailReady ? (
          <p className="flex items-center gap-2! text-[12.5px] text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-3.5! py-2.5! mt-4!">
            <CheckCircle2 size={14} className="shrink-0" />
            Alerts will be emailed from {smtp?.from_email || smtp?.username}.
          </p>
        ) : null
      }
    />
  );
}

// ── Google Calendar & Meet ───────────────────────────────────────────────────

const RETURN_KEY = "avat_google_return";

function GoogleCalendarCard({
  appointmentsOn,
  meetLink,
}: {
  appointmentsOn: boolean;
  meetLink: string | null;
}) {
  const { showToast } = useToast();
  const [status, setStatus] = useState<GoogleStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [confirmOff, setConfirmOff] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setStatus(await getGoogleSettings());
    } catch {
      setStatus(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Flash after coming back from Google (?google=connected), then clean the URL.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const q = new URLSearchParams(window.location.search);
    if (q.get("google") === "connected") {
      showToast({ type: "success", title: "Google Calendar connected" });
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, [showToast]);

  const connect = async () => {
    setBusy(true);
    try {
      const { authorization_url } = await getGoogleAuthUrl("calendar");
      // Come back to THIS page, not the generic settings page.
      try {
        sessionStorage.setItem(
          RETURN_KEY,
          `${window.location.pathname}?google=connected`,
        );
      } catch {
        /* private mode — the callback falls back to Settings */
      }
      window.location.href = authorization_url;
    } catch (e) {
      setBusy(false);
      showToast({
        type: "error",
        title: "Couldn't start the Google connection",
        message: e instanceof Error ? e.message : "Try again.",
      });
    }
  };

  const disconnect = async () => {
    setBusy(true);
    try {
      await disconnectGoogle();
      setConfirmOff(false);
      showToast({
        type: "success",
        title: "Google disconnected",
        message: meetLink
          ? "New bookings will use the agent's static Meet room."
          : "New bookings will have no meeting link until you add one.",
      });
      load();
    } catch (e) {
      showToast({
        type: "error",
        title: "Could not disconnect",
        message: e instanceof Error ? e.message : "Try again.",
      });
    } finally {
      setBusy(false);
    }
  };

  const ready = !!status?.calendar_ready;

  return (
    <div className="bg-white border border-[var(--line)] rounded-2xl p-5! shadow-[var(--shadow-sm)]">
      <div className="flex items-start gap-3.5!">
        <span
          className={`w-10! h-10! rounded-xl grid place-items-center border shrink-0 ${
            ready
              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
              : "bg-[var(--line-soft)] text-[var(--muted)] border-[var(--line)]"
          }`}
        >
          <CalendarCheck2 size={17} />
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2! flex-wrap">
            <h3 className="text-[15px] font-semibold text-[var(--ink)]">
              Google Calendar &amp; Meet
            </h3>
            <span className="text-[10.5px] font-bold px-1.5! py-0.5! rounded uppercase tracking-wide text-[var(--slate)] bg-[var(--line-soft)] border border-[var(--line)]">
              Integration
            </span>
          </div>
          <p className="text-[13px] text-[var(--slate)] mt-1! leading-relaxed">
            Connect Google so every booking gets its own Calendar event and a
            unique Meet link. Without it, bookings reuse the static Meet room
            above.
          </p>

          {loading ? (
            <div className="py-3!">
              <Loader2 size={15} className="animate-spin text-[var(--muted)]" />
            </div>
          ) : !status ? (
            <p className="text-[12.5px] text-[var(--muted)] mt-3!">
              Connection status unavailable right now.
            </p>
          ) : !status.configured ? (
            <p className="flex items-start gap-2! text-[12.5px] text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-3.5! py-2.5! mt-3.5!">
              <AlertCircle size={14} className="shrink-0 mt-0.5!" />
              Google sign-in isn&apos;t configured on the server yet, so Calendar
              can&apos;t be linked. Bookings will use the static Meet room.
            </p>
          ) : status.connected ? (
            <div className="mt-3.5!">
              <div className="flex flex-wrap items-center gap-3! bg-[var(--sidebar)] border border-[var(--line)] rounded-xl px-3.5! py-3!">
                <span className="w-8! h-8! rounded-full grid place-items-center bg-white border border-[var(--line)] text-emerald-600 shrink-0">
                  <Check size={14} />
                </span>
                <div className="min-w-0">
                  <p className="text-[13px] font-medium text-[var(--ink)] truncate">
                    {status.google_email || "Google account"}
                  </p>
                  <p className="text-[11.5px] text-[var(--muted)]">
                    {ready
                      ? "Each booking gets its own Calendar event and Meet link."
                      : "Connected, but Calendar access is still pending."}
                  </p>
                </div>
                <div className="ml-auto flex items-center gap-2!">
                  <GhostButton onClick={connect} disabled={busy} className="py-2!">
                    <RefreshCw size={13} /> Re-authorize
                  </GhostButton>
                  <button
                    onClick={() => setConfirmOff(true)}
                    disabled={busy}
                    className="inline-flex items-center gap-1.5! rounded-lg border border-[var(--line)] bg-white px-3! py-2! text-[12.5px] font-semibold text-[var(--slate)] hover:text-red-600 hover:border-red-200 transition-colors disabled:opacity-50"
                  >
                    <Unplug size={13} /> Disconnect
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-3.5!">
              {!appointmentsOn && (
                <p className="flex items-start gap-2! text-[12.5px] text-[var(--slate)] bg-[var(--sidebar)] border border-[var(--line)] rounded-xl px-3.5! py-2.5! mb-3!">
                  <Info size={14} className="shrink-0 mt-0.5!" />
                  Turn on Appointments first — a calendar link only does
                  something once the agent can book.
                </p>
              )}
              <PrimaryButton onClick={connect} loading={busy}>
                <Link2 size={15} /> Connect Google Calendar
              </PrimaryButton>
              <p className="text-[11px] text-[var(--muted)] mt-2!">
                You&apos;ll be redirected to Google and brought straight back
                here. We request calendar access only.
              </p>
            </div>
          )}

          {status?.connected && (
            <a
              href="https://calendar.google.com"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5! text-[12.5px] font-semibold text-[var(--violet-700)] hover:text-[var(--violet-600)] mt-3!"
            >
              Open Google Calendar <ExternalLink size={12} />
            </a>
          )}
        </div>
      </div>

      {confirmOff && (
        <Modal
          title="Disconnect Google?"
          desc="Existing Calendar events stay where they are. New bookings stop getting their own event and Meet link."
          onClose={() => setConfirmOff(false)}
          footer={
            <>
              <GhostButton onClick={() => setConfirmOff(false)} disabled={busy}>
                Keep connected
              </GhostButton>
              <button
                onClick={disconnect}
                disabled={busy}
                className="inline-flex items-center gap-2! rounded-lg bg-red-600 px-4! py-2.5! text-[13px] font-semibold text-white hover:bg-red-700 transition disabled:bg-red-400"
              >
                {busy && <Loader2 size={14} className="animate-spin" />}
                Disconnect
              </button>
            </>
          }
        >
          <p className="text-[13px] text-[var(--slate)]">
            {meetLink
              ? `Bookings will fall back to the static Meet room (${meetLink}).`
              : "You have no static Meet room set, so new bookings will have no meeting link at all until you add one."}
          </p>
        </Modal>
      )}
    </div>
  );
}

"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  Shield,
  Users,
  Bot,
  MessageSquare,
  ScrollText,
  LifeBuoy,
  Activity,
  Search,
  X,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Trash2,
  LogOut,
  Coins,
  ChevronDown,
  UserPlus,
  Lock,
  Wand2,
} from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { relTime, fmtNumber, fmtDuration } from "@/lib/api/dashboard";
import {
  getOverview,
  getHealth,
  listUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  forceLogoutUser,
  listAgents,
  listConversations,
  listAudit,
  listTickets,
  getTicket,
  updateTicket,
  replyTicket,
  type AdminUser,
  type AdminAgent,
  type AdminConversation,
  type AdminAudit,
  type AdminTicket,
} from "@/lib/api/admin";

const inp =
  "w-full! px-3.5! py-2.5! bg-white border border-[var(--line)] rounded-xl text-[var(--ink)] text-sm placeholder-gray-400 outline-none focus:border-[var(--violet)] focus:ring-2 focus:ring-[var(--violet-100)] transition-all";

const TICKET_STATUS_TONE: Record<string, string> = {
  open: "text-blue-700 bg-blue-50 border-blue-100",
  in_progress: "text-violet-700 bg-violet-50 border-violet-100",
  waiting_user: "text-amber-700 bg-amber-50 border-amber-100",
  resolved: "text-emerald-700 bg-emerald-50 border-emerald-100",
  closed: "text-gray-500 bg-gray-50 border-gray-200",
};
const PRIORITY_TONE: Record<string, string> = {
  low: "text-gray-500 bg-gray-50 border-gray-200",
  normal: "text-blue-700 bg-blue-50 border-blue-100",
  high: "text-amber-700 bg-amber-50 border-amber-100",
  urgent: "text-rose-600 bg-rose-50 border-rose-100",
};
const tone = (m: Record<string, string>, k: string) =>
  m[k] || "text-gray-600 bg-gray-50 border-gray-200";

type Tab =
  | "overview"
  | "users"
  | "agents"
  | "conversations"
  | "audit"
  | "tickets"
  | "health";

export default function AdminPage() {
  const { user, status } = useAuth();
  const [tab, setTab] = useState<Tab>("overview");

  if (status === "loading") {
    return (
      <div className="min-h-full grid place-items-center">
        <div className="w-8! h-8! border-2 border-[var(--line)] border-t-[var(--violet)] rounded-full animate-spin" />
      </div>
    );
  }
  if (!user?.is_superuser) {
    return (
      <div className="min-h-full grid place-items-center p-8!">
        <div className="bg-white border border-[var(--line)] rounded-2xl p-10! text-center max-w-md!">
          <Shield size={26} className="text-rose-400 mx-auto! mb-3!" />
          <p className="text-[15px] font-semibold text-[var(--ink)]">Admins only</p>
          <p className="text-[13px] text-[var(--muted)] mt-1! mb-5!">
            You need super-admin access to view this page.
          </p>
          <Link href="/dashboard" className="text-[13px] font-semibold text-[var(--violet-700)]">
            ← Back to dashboard
          </Link>
        </div>
      </div>
    );
  }

  const TABS: { k: Tab; label: string; icon: React.ReactNode }[] = [
    { k: "overview", label: "Overview", icon: <Activity size={14} /> },
    { k: "users", label: "Users", icon: <Users size={14} /> },
    { k: "agents", label: "Agents", icon: <Bot size={14} /> },
    { k: "conversations", label: "Conversations", icon: <MessageSquare size={14} /> },
    { k: "tickets", label: "Tickets", icon: <LifeBuoy size={14} /> },
    { k: "audit", label: "Audit log", icon: <ScrollText size={14} /> },
    { k: "health", label: "Health", icon: <Shield size={14} /> },
  ];

  return (
    <div className="min-h-full text-[var(--foreground)] p-8! md:p-12!">
      <div className="max-w-[1400px] mx-auto!">
        <div className="mb-6!">
          <span className="eyebrow mb-3!">
            <Shield size={11} /> Admin
          </span>
          <h1 className="text-[28px] font-semibold text-[var(--ink)] tracking-tight mt-3!">
            Platform admin
          </h1>
          <p className="text-sm text-[var(--slate)] mt-1.5!">
            Accounts, agents, conversations, tickets, and system health.
          </p>
        </div>

        <div className="flex items-center gap-1! bg-white border border-[var(--line)] rounded-xl p-1! shadow-[var(--shadow-sm)] w-fit! mb-6! overflow-x-auto max-w-full!">
          {TABS.map((t) => (
            <button
              key={t.k}
              onClick={() => setTab(t.k)}
              className={`flex items-center gap-1.5! px-3.5! py-2! rounded-lg text-[13px] font-medium whitespace-nowrap transition-colors ${
                tab === t.k
                  ? "bg-[var(--violet-050)] text-[var(--violet-700)]"
                  : "text-[var(--slate)] hover:text-[var(--ink)]"
              }`}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {tab === "overview" && <Overview />}
        {tab === "users" && <UsersTab currentUserId={user.id} />}
        {tab === "agents" && <AgentsTab />}
        {tab === "conversations" && <ConversationsTab />}
        {tab === "tickets" && <TicketsTab />}
        {tab === "audit" && <AuditTab />}
        {tab === "health" && <HealthTab />}
      </div>
    </div>
  );
}

// ── Overview ──────────────────────────────────────────────────────────────────
function Overview() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [d, setD] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    getOverview().then(setD).catch(() => setD(null)).finally(() => setLoading(false));
  }, []);
  if (loading) return <Spinner />;
  if (!d) return <ErrorCard />;

  const groups: { title: string; items: [string, number][] }[] = [
    { title: "Users", items: [["Total", d.users.total], ["Active", d.users.active], ["Suspended", d.users.suspended], ["Admins", d.users.superusers]] },
    { title: "Agents", items: [["Total", d.agents.total], ["Active", d.agents.active], ["With appts", d.agents.with_appointments]] },
    { title: "Conversations", items: [["Total", d.conversations.total], ["Last 24h", d.conversations.last_24h], ["Active now", d.conversations.active_now]] },
    { title: "CRM", items: [["Leads", d.crm.leads], ["Leads 24h", d.crm.leads_last_24h], ["Upcoming appts", d.crm.appointments_upcoming]] },
    { title: "Tickets", items: [["Open", d.tickets.open], ["In progress", d.tickets.in_progress], ["Total", d.tickets.total]] },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5!">
      {groups.map((g) => (
        <div key={g.title} className="bg-white border border-[var(--line)] rounded-2xl p-5! shadow-[var(--shadow-sm)]">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--muted)] mb-3!">{g.title}</p>
          <div className="space-y-2.5!">
            {g.items.map(([label, n]) => (
              <div key={label} className="flex items-center justify-between">
                <span className="text-[13px] text-[var(--slate)]">{label}</span>
                <span className="text-[16px] font-semibold text-[var(--ink)] font-display tabular-nums">{fmtNumber(n)}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Users ─────────────────────────────────────────────────────────────────────
function UsersTab({ currentUserId }: { currentUserId: string }) {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [q, setQ] = useState("");
  const [suspended, setSuspended] = useState<boolean | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [sel, setSel] = useState<AdminUser | null>(null);
  const [creating, setCreating] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setUsers(await listUsers({ q: q || undefined, suspended }));
    } catch {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [q, suspended]);
  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [load]);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3! mb-4!">
        <div className="relative flex-1 min-w-[200px]!">
          <Search size={16} className="absolute left-3.5! top-1/2 -translate-y-1/2 text-[var(--muted)]" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search email or name…" className={`${inp} pl-10!`} />
        </div>
        <div className="flex items-center gap-1! bg-white border border-[var(--line)] rounded-xl p-1! shadow-[var(--shadow-sm)]">
          {[{ l: "All", v: undefined }, { l: "Active", v: false }, { l: "Suspended", v: true }].map((o) => (
            <button key={o.l} onClick={() => setSuspended(o.v)} className={`px-2.5! py-1.5! rounded-lg text-[12px] font-medium transition-colors ${suspended === o.v ? "bg-[var(--violet-050)] text-[var(--violet-700)]" : "text-[var(--slate)] hover:text-[var(--ink)]"}`}>{o.l}</button>
          ))}
        </div>
        <button onClick={() => setCreating(true)} className="inline-flex items-center gap-2! text-white text-[13px] font-semibold px-4! py-2.5! rounded-xl" style={{ background: "var(--grad)" }}>
          <UserPlus size={15} /> New user
        </button>
      </div>
      <div className="bg-white border border-[var(--line)] rounded-2xl shadow-[var(--shadow-sm)] overflow-hidden">
        {loading ? <Spinner /> : users.length === 0 ? <Empty text="No users." /> : (
          <div className="w-full! overflow-x-auto">
            <table className="w-full! text-left border-collapse min-w-[820px]!">
              <thead>
                <tr className="text-[11px] uppercase tracking-wider text-[var(--muted)] border-b border-[var(--line-soft)]">
                  <th className="font-semibold px-5! py-3.5!">User</th>
                  <th className="font-semibold px-4! py-3.5!">Agents</th>
                  <th className="font-semibold px-4! py-3.5!">Credits</th>
                  <th className="font-semibold px-4! py-3.5!">Status</th>
                  <th className="font-semibold px-5! py-3.5!">Last login</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} onClick={() => setSel(u)} className="border-b border-[var(--line-soft)] last:border-0 text-[13.5px] cursor-pointer hover:bg-[var(--line-soft)]/40">
                    <td className="px-5! py-3.5!">
                      <div className="flex items-center gap-2.5!">
                        <span className="w-8! h-8! rounded-full grid place-items-center text-white text-[11px] font-semibold shrink-0" style={{ background: "var(--grad)" }}>{u.email[0].toUpperCase()}</span>
                        <div className="min-w-0">
                          <p className="font-medium text-[var(--ink)] truncate max-w-[200px]! flex items-center gap-1.5!">
                            {u.full_name || u.email}
                            {u.is_superuser && <span className="text-[9px] font-bold text-violet-700 bg-violet-50 border border-violet-100 px-1.5! py-0.5! rounded-full">ADMIN</span>}
                          </p>
                          {u.full_name && <p className="text-[12px] text-[var(--muted)] truncate max-w-[200px]!">{u.email}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4! py-3.5! text-[var(--slate)] tabular-nums">{u.agents_count}</td>
                    <td className="px-4! py-3.5! text-[var(--slate)] tabular-nums">{u.credits_minutes}m</td>
                    <td className="px-4! py-3.5!">
                      {u.is_suspended ? <Badge tone="text-rose-600 bg-rose-50 border-rose-100">Suspended</Badge> : u.is_active ? <Badge tone="text-emerald-700 bg-emerald-50 border-emerald-100">Active</Badge> : <Badge tone="text-gray-500 bg-gray-50 border-gray-200">Disabled</Badge>}
                    </td>
                    <td className="px-5! py-3.5! text-[var(--muted)] text-[12.5px] whitespace-nowrap">{u.last_login_at ? relTime(u.last_login_at) : "never"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {sel && <UserModal user={sel} isSelf={sel.id === currentUserId} onClose={() => setSel(null)} onChanged={() => { setSel(null); load(); }} />}
      {creating && <CreateUserModal onClose={() => setCreating(false)} onCreated={() => { setCreating(false); load(); }} />}
    </div>
  );
}

function genPassword(): string {
  const upper = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const lower = "abcdefghijkmnpqrstuvwxyz";
  const digit = "23456789";
  const sym = "!@#$%*?";
  const all = upper + lower + digit + sym;
  const pick = (s: string) => s[Math.floor(Math.random() * s.length)];
  let out = pick(upper) + pick(lower) + pick(digit) + pick(sym);
  for (let i = 0; i < 10; i++) out += pick(all);
  return out
    .split("")
    .sort(() => Math.random() - 0.5)
    .join("");
}

function CreateUserModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState({ email: "", full_name: "", password: "", credits_minutes: 100, is_superuser: false });
  const [confirmAdmin, setConfirmAdmin] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const set = (k: string, v: string | number | boolean) => setForm((f) => ({ ...f, [k]: v }));

  const create = async () => {
    setErr(null);
    if (form.is_superuser && !confirmAdmin) return setErr("Confirm granting full platform (super-admin) access.");
    setBusy(true);
    try {
      await createUser({
        email: form.email.trim(),
        password: form.password,
        full_name: form.full_name.trim() || undefined,
        is_superuser: form.is_superuser,
        credits_minutes: form.credits_minutes,
      });
      onCreated();
    } catch (e) {
      // Server detail lists every password-policy failure / duplicate — show verbatim.
      setErr(e instanceof Error ? e.message : "Couldn't create the user.");
      setBusy(false);
    }
  };

  return (
    <Modal title="Create user" onClose={onClose} wide footer={
      <>
        <button onClick={onClose} className="text-[13px] font-semibold text-[var(--slate)] px-4! py-2.5! rounded-xl border border-[var(--line)] hover:bg-[var(--line-soft)]">Cancel</button>
        <button onClick={create} disabled={busy || !form.email || !form.password} className="inline-flex items-center gap-2! text-white text-[13px] font-semibold px-5! py-2.5! rounded-xl disabled:opacity-60" style={{ background: "var(--grad)" }}><UserPlus size={15} /> Create</button>
      </>
    }>
      {err && <div className="flex items-center gap-2! text-[13px] text-rose-600 bg-rose-50 border border-rose-100 rounded-xl px-3.5! py-2.5! mb-4!"><AlertCircle size={15} /> {err}</div>}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4!">
        <div className="sm:col-span-2">
          <label className="block text-[13px] font-medium text-[var(--slate)] mb-1.5!">Email</label>
          <input className={inp} value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="new@example.com" />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-[13px] font-medium text-[var(--slate)] mb-1.5!">Full name</label>
          <input className={inp} value={form.full_name} onChange={(e) => set("full_name", e.target.value)} placeholder="New Person" />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-[13px] font-medium text-[var(--slate)] mb-1.5!">Password</label>
          <div className="flex items-center gap-2!">
            <input className={`${inp} font-mono`} value={form.password} onChange={(e) => set("password", e.target.value)} placeholder="≥10 chars · upper · lower · digit" />
            <button type="button" onClick={() => set("password", genPassword())} className="inline-flex items-center gap-1.5! shrink-0 text-[13px] font-semibold text-[var(--violet-700)] bg-[var(--violet-050)] border border-[var(--violet-100)] px-3! py-2.5! rounded-xl hover:bg-[var(--violet-100)]"><Wand2 size={14} /> Generate</button>
          </div>
          <p className="text-[11.5px] text-[var(--muted)] mt-1.5!">Copy it now — the API never returns a password again.</p>
        </div>
        <div>
          <label className="block text-[13px] font-medium text-[var(--slate)] mb-1.5!">Credits (min)</label>
          <input type="number" className={inp} value={form.credits_minutes} onChange={(e) => set("credits_minutes", +e.target.value)} />
        </div>
      </div>
      <label className="flex items-start gap-2.5! mt-4! p-3! rounded-xl border border-amber-100 bg-amber-50/60 cursor-pointer select-none">
        <input type="checkbox" checked={form.is_superuser} onChange={(e) => { set("is_superuser", e.target.checked); if (!e.target.checked) setConfirmAdmin(false); }} className="mt-0.5! w-4! h-4! accent-amber-600" />
        <span className="text-[12.5px] text-amber-800"><span className="font-semibold flex items-center gap-1!"><Lock size={12} /> Super-admin</span> Grants full platform access, including this admin console.</span>
      </label>
      {form.is_superuser && (
        <label className="flex items-center gap-2! mt-2! text-[12.5px] text-[var(--slate)] cursor-pointer select-none">
          <input type="checkbox" checked={confirmAdmin} onChange={(e) => setConfirmAdmin(e.target.checked)} className="w-4! h-4! accent-amber-600" />
          Yes, I understand — create this account as a super-admin.
        </label>
      )}
    </Modal>
  );
}

function UserModal({ user, isSelf, onClose, onChanged }: { user: AdminUser; isSelf: boolean; onClose: () => void; onChanged: () => void }) {
  const [credits, setCredits] = useState(user.credits_minutes);
  const [reason, setReason] = useState(user.suspended_reason || "");
  const [confirmEmail, setConfirmEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [detail, setDetail] = useState<any>(null);

  useEffect(() => {
    getUser(user.id).then(setDetail).catch(() => setDetail(null));
  }, [user.id]);

  const run = async (fn: () => Promise<unknown>) => {
    setBusy(true); setErr(null);
    try { await fn(); onChanged(); } catch (e) { setErr(e instanceof Error ? e.message : "Action failed."); setBusy(false); }
  };

  return (
    <Modal title={user.email} onClose={onClose} wide footer={
      <>
        <button onClick={onClose} className="text-[13px] font-semibold text-[var(--slate)] px-4! py-2.5! rounded-xl border border-[var(--line)] hover:bg-[var(--line-soft)]">Close</button>
      </>
    }>
      {err && <div className="flex items-center gap-2! text-[13px] text-rose-600 bg-rose-50 border border-rose-100 rounded-xl px-3.5! py-2.5! mb-4!"><AlertCircle size={15} /> {err}</div>}

      <div className="grid grid-cols-2 gap-3! mb-5! text-[13px]">
        <Info label="Agents" value={String(user.agents_count)} />
        <Info label="Credits used" value={fmtDuration(user.credits_used_seconds)} />
        <Info label="SMTP" value={user.smtp_configured ? "Configured" : "—"} />
        <Info label="Failed logins" value={String(user.failed_login_count)} />
        <Info label="Created" value={user.created_at ? relTime(user.created_at) : "—"} />
        <Info label="Locked until" value={user.locked_until ? relTime(user.locked_until) : "—"} />
      </div>

      {/* Drill-down: integrations, activity, and their agents */}
      {detail && (
        <div className="mb-5!">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3! mb-4! text-[13px]">
            <Info label="Google" value={detail.user?.google_connected ? "Connected" : "—"} />
            <Info label="Last login IP" value={detail.user?.last_login_ip || "—"} />
            <Info label="Conversations" value={String(detail.stats?.conversations ?? 0)} />
            <Info label="Login sessions" value={String(detail.stats?.active_login_sessions ?? 0)} />
          </div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--muted)] mb-2!">
            Agents ({(detail.agents || []).length})
          </p>
          {(detail.agents || []).length === 0 ? (
            <p className="text-[13px] text-[var(--muted)]">No agents.</p>
          ) : (
            <div className="space-y-1.5!">
              {detail.agents.map(
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (a: any) => (
                  <div key={a.id} className="flex items-center gap-2! p-2.5! rounded-lg border border-[var(--line-soft)] text-[13px]">
                    <span className={`w-1.5! h-1.5! rounded-full ${a.is_active ? "bg-emerald-500" : "bg-gray-300"}`} />
                    <span className="font-medium text-[var(--ink)]">{a.name}</span>
                    <span className="text-[var(--muted)] text-[12px]">{a.language}</span>
                    {a.appointments_enabled && <Badge tone="text-blue-700 bg-blue-50 border-blue-100">Appts</Badge>}
                    {a.website_url && (
                      <a href={a.website_url} target="_blank" rel="noreferrer" className="ml-auto! text-[12px] text-[var(--violet-700)] hover:underline truncate max-w-[160px]!">
                        {a.website_url}
                      </a>
                    )}
                  </div>
                ),
              )}
            </div>
          )}
        </div>
      )}

      <div className="space-y-3!">
        {/* Suspend / activate */}
        <div className="flex items-center gap-2! flex-wrap">
          {user.is_suspended ? (
            <button disabled={busy} onClick={() => run(() => updateUser(user.id, { is_suspended: false }))} className={actBtn("emerald")}>Reactivate account</button>
          ) : (
            <>
              <input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Suspension reason (optional)" className={`${inp} flex-1 min-w-[180px]!`} />
              <button disabled={busy || isSelf} onClick={() => run(() => updateUser(user.id, { is_suspended: true, suspended_reason: reason || null }))} className={actBtn("amber")}>Suspend</button>
            </>
          )}
        </div>

        {/* Admin toggle */}
        <div className="flex items-center justify-between p-3! rounded-xl border border-[var(--line)]">
          <span className="text-[13px] text-[var(--slate)]">Super-admin</span>
          <button disabled={busy || isSelf} onClick={() => run(() => updateUser(user.id, { is_superuser: !user.is_superuser }))} className={actBtn(user.is_superuser ? "gray" : "violet")}>
            {user.is_superuser ? "Revoke admin" : "Grant admin"}
          </button>
        </div>

        {/* Credits */}
        <div className="flex items-center gap-2!">
          <label className="text-[13px] text-[var(--slate)]">Credits (min)</label>
          <input type="number" value={credits} onChange={(e) => setCredits(+e.target.value)} className={`${inp} w-32!`} />
          <button disabled={busy || credits === user.credits_minutes} onClick={() => run(() => updateUser(user.id, { credits_minutes: credits }))} className={actBtn("violet")}><Coins size={14} className="inline mr-1!" /> Set</button>
        </div>

        {/* Force logout */}
        <button disabled={busy} onClick={() => run(() => forceLogoutUser(user.id))} className="inline-flex items-center gap-2! text-[13px] font-semibold text-[var(--slate)] px-4! py-2.5! rounded-xl border border-[var(--line)] hover:bg-[var(--line-soft)]"><LogOut size={14} /> Force logout all sessions</button>

        {/* Delete */}
        {!isSelf && (
          <div className="p-3! rounded-xl border border-rose-100 bg-rose-50/50 mt-2!">
            <p className="text-[12.5px] text-rose-700 mb-2!">Danger — deletes the account and all its data. Type the email to confirm:</p>
            <div className="flex items-center gap-2!">
              <input value={confirmEmail} onChange={(e) => setConfirmEmail(e.target.value)} placeholder={user.email} className={`${inp} flex-1`} />
              <button disabled={busy || confirmEmail.trim().toLowerCase() !== user.email.toLowerCase()} onClick={() => run(() => deleteUser(user.id, confirmEmail.trim()))} className="inline-flex items-center gap-1.5! text-[13px] font-semibold text-white bg-rose-600 hover:bg-rose-700 px-4! py-2.5! rounded-xl disabled:opacity-50"><Trash2 size={14} /> Delete</button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}

// ── Agents ────────────────────────────────────────────────────────────────────
function AgentsTab() {
  const [agents, setAgents] = useState<AdminAgent[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => {
      setLoading(true);
      listAgents(q || undefined).then(setAgents).catch(() => setAgents([])).finally(() => setLoading(false));
    }, 250);
    return () => clearTimeout(t);
  }, [q]);

  return (
    <div>
      <div className="relative mb-4! max-w-md!">
        <Search size={16} className="absolute left-3.5! top-1/2 -translate-y-1/2 text-[var(--muted)]" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search agent or owner…" className={`${inp} pl-10!`} />
      </div>
      <div className="bg-white border border-[var(--line)] rounded-2xl shadow-[var(--shadow-sm)] overflow-hidden">
        {loading ? <Spinner /> : agents.length === 0 ? <Empty text="No agents." /> : (
          <div className="w-full! overflow-x-auto">
            <table className="w-full! text-left border-collapse min-w-[900px]!">
              <thead>
                <tr className="text-[11px] uppercase tracking-wider text-[var(--muted)] border-b border-[var(--line-soft)]">
                  <th className="font-semibold px-5! py-3.5!">Agent</th>
                  <th className="font-semibold px-4! py-3.5!">Owner</th>
                  <th className="font-semibold px-4! py-3.5!">Model</th>
                  <th className="font-semibold px-4! py-3.5!">Capabilities</th>
                  <th className="font-semibold px-4! py-3.5!">Convos</th>
                  <th className="font-semibold px-5! py-3.5!">Created</th>
                </tr>
              </thead>
              <tbody>
                {agents.map((a) => (
                  <tr key={a.id} className="border-b border-[var(--line-soft)] last:border-0 text-[13.5px]">
                    <td className="px-5! py-3.5! font-medium text-[var(--ink)]">
                      <span className="flex items-center gap-2!">
                        {a.name}
                        <span className={`w-1.5! h-1.5! rounded-full ${a.is_active ? "bg-emerald-500" : "bg-gray-300"}`} />
                      </span>
                    </td>
                    <td className="px-4! py-3.5! text-[var(--slate)] truncate max-w-[180px]!">{a.owner_email}</td>
                    <td className="px-4! py-3.5! text-[var(--muted)] text-[12px]">{a.llm}</td>
                    <td className="px-4! py-3.5!">
                      <div className="flex flex-wrap gap-1!">
                        {a.appointments_enabled && <Badge tone="text-blue-700 bg-blue-50 border-blue-100">Appts</Badge>}
                        {a.lead_capture_enabled && <Badge tone="text-violet-700 bg-violet-50 border-violet-100">Leads</Badge>}
                        {a.website_url && <Badge tone="text-emerald-700 bg-emerald-50 border-emerald-100">Web</Badge>}
                        {a.meet_link && <Badge tone="text-amber-700 bg-amber-50 border-amber-100">Meet</Badge>}
                      </div>
                    </td>
                    <td className="px-4! py-3.5! text-[var(--slate)] tabular-nums">{a.conversations}</td>
                    <td className="px-5! py-3.5! text-[var(--muted)] text-[12.5px] whitespace-nowrap">{a.created_at ? relTime(a.created_at) : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Conversations ─────────────────────────────────────────────────────────────
function ConversationsTab() {
  const [rows, setRows] = useState<AdminConversation[]>([]);
  const [activeOnly, setActiveOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    setLoading(true);
    listConversations(activeOnly).then(setRows).catch(() => setRows([])).finally(() => setLoading(false));
  }, [activeOnly]);

  return (
    <div>
      <label className="flex items-center gap-2! text-[13px] text-[var(--slate)] mb-4! cursor-pointer select-none w-fit!">
        <input type="checkbox" checked={activeOnly} onChange={(e) => setActiveOnly(e.target.checked)} className="w-4! h-4! accent-[var(--violet)]" /> Active now only
      </label>
      <div className="bg-white border border-[var(--line)] rounded-2xl shadow-[var(--shadow-sm)] overflow-hidden">
        {loading ? <Spinner /> : rows.length === 0 ? <Empty text="No conversations." /> : (
          <div className="w-full! overflow-x-auto">
            <table className="w-full! text-left border-collapse min-w-[760px]!">
              <thead>
                <tr className="text-[11px] uppercase tracking-wider text-[var(--muted)] border-b border-[var(--line-soft)]">
                  <th className="font-semibold px-5! py-3.5!">Agent</th>
                  <th className="font-semibold px-4! py-3.5!">Owner</th>
                  <th className="font-semibold px-4! py-3.5!">Status</th>
                  <th className="font-semibold px-4! py-3.5!">Duration</th>
                  <th className="font-semibold px-5! py-3.5!">Started</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((c) => (
                  <tr key={c.id} className="border-b border-[var(--line-soft)] last:border-0 text-[13.5px]">
                    <td className="px-5! py-3.5! font-medium text-[var(--ink)]">{c.agent}</td>
                    <td className="px-4! py-3.5! text-[var(--slate)] truncate max-w-[180px]!">{c.owner_email}</td>
                    <td className="px-4! py-3.5!"><Badge tone={c.status === "active" ? "text-blue-700 bg-blue-50 border-blue-100" : "text-gray-500 bg-gray-50 border-gray-200"}>{c.status}</Badge></td>
                    <td className="px-4! py-3.5! text-[var(--slate)] tabular-nums">{fmtDuration(c.duration_seconds)}</td>
                    <td className="px-5! py-3.5! text-[var(--muted)] text-[12.5px] whitespace-nowrap">{relTime(c.started_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Audit ─────────────────────────────────────────────────────────────────────
function AuditTab() {
  const [rows, setRows] = useState<AdminAudit[]>([]);
  const [event, setEvent] = useState("");
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    setLoading(true);
    listAudit(event || undefined).then(setRows).catch(() => setRows([])).finally(() => setLoading(false));
  }, [event]);
  const EVENTS = ["", "login", "login_failed", "logout", "logout_all", "admin_action", "password_change"];

  return (
    <div>
      <div className="relative mb-4! w-52!">
        <select value={event} onChange={(e) => setEvent(e.target.value)} className={`${inp} appearance-none pr-9!`}>
          {EVENTS.map((e) => (<option key={e || "all"} value={e}>{e || "All events"}</option>))}
        </select>
        <ChevronDown size={16} className="absolute right-3! top-1/2 -translate-y-1/2 text-[var(--muted)] pointer-events-none" />
      </div>
      <div className="bg-white border border-[var(--line)] rounded-2xl shadow-[var(--shadow-sm)] overflow-hidden">
        {loading ? <Spinner /> : rows.length === 0 ? <Empty text="No audit events." /> : (
          <div className="w-full! overflow-x-auto">
            <table className="w-full! text-left border-collapse min-w-[820px]!">
              <thead>
                <tr className="text-[11px] uppercase tracking-wider text-[var(--muted)] border-b border-[var(--line-soft)]">
                  <th className="font-semibold px-5! py-3!">Event</th>
                  <th className="font-semibold px-4! py-3!">User</th>
                  <th className="font-semibold px-4! py-3!">Detail</th>
                  <th className="font-semibold px-4! py-3!">IP</th>
                  <th className="font-semibold px-5! py-3!">When</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((a) => (
                  <tr key={a.id} className="border-b border-[var(--line-soft)] last:border-0 text-[13px]">
                    <td className="px-5! py-3!">
                      <span className="flex items-center gap-1.5!">
                        {a.success ? <CheckCircle2 size={12} className="text-emerald-500" /> : <AlertCircle size={12} className="text-rose-500" />}
                        <span className="font-medium text-[var(--ink)]">{a.event}</span>
                      </span>
                    </td>
                    <td className="px-4! py-3! text-[var(--slate)] truncate max-w-[160px]!">{a.email || "—"}</td>
                    <td className="px-4! py-3! text-[var(--muted)] truncate max-w-[260px]!">{a.target ? `${a.target} · ` : ""}{a.detail || ""}</td>
                    <td className="px-4! py-3! text-[var(--muted)] text-[12px]">{a.ip_address || "—"}</td>
                    <td className="px-5! py-3! text-[var(--muted)] text-[12px] whitespace-nowrap">{relTime(a.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Tickets ───────────────────────────────────────────────────────────────────
function TicketsTab() {
  const [rows, setRows] = useState<AdminTicket[]>([]);
  const [st, setSt] = useState("");
  const [loading, setLoading] = useState(true);
  const [sel, setSel] = useState<AdminTicket | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    listTickets({ status: st || undefined }).then(setRows).catch(() => setRows([])).finally(() => setLoading(false));
  }, [st]);
  useEffect(load, [load]);

  return (
    <div>
      <div className="flex items-center gap-1! bg-white border border-[var(--line)] rounded-xl p-1! shadow-[var(--shadow-sm)] w-fit! mb-4!">
        {["", "open", "in_progress", "waiting_user", "resolved", "closed"].map((s) => (
          <button key={s || "all"} onClick={() => setSt(s)} className={`px-2.5! py-1.5! rounded-lg text-[12px] font-medium transition-colors ${st === s ? "bg-[var(--violet-050)] text-[var(--violet-700)]" : "text-[var(--slate)] hover:text-[var(--ink)]"}`}>{s ? s.replace("_", " ") : "All"}</button>
        ))}
      </div>
      <div className="bg-white border border-[var(--line)] rounded-2xl shadow-[var(--shadow-sm)] overflow-hidden">
        {loading ? <Spinner /> : rows.length === 0 ? <Empty text="No tickets." /> : (
          <div className="w-full! overflow-x-auto">
            <table className="w-full! text-left border-collapse min-w-[760px]!">
              <thead>
                <tr className="text-[11px] uppercase tracking-wider text-[var(--muted)] border-b border-[var(--line-soft)]">
                  <th className="font-semibold px-5! py-3.5!">Ticket</th>
                  <th className="font-semibold px-4! py-3.5!">Raised by</th>
                  <th className="font-semibold px-4! py-3.5!">Priority</th>
                  <th className="font-semibold px-4! py-3.5!">Status</th>
                  <th className="font-semibold px-5! py-3.5!">Created</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((t) => (
                  <tr key={t.id} onClick={() => setSel(t)} className="border-b border-[var(--line-soft)] last:border-0 text-[13.5px] cursor-pointer hover:bg-[var(--line-soft)]/40">
                    <td className="px-5! py-3.5!">
                      <p className="font-medium text-[var(--ink)] truncate max-w-[260px]!">{t.subject}</p>
                      <p className="text-[11.5px] text-[var(--muted)] font-mono">{t.reference}</p>
                    </td>
                    <td className="px-4! py-3.5! text-[var(--slate)] truncate max-w-[160px]!">{t.raised_by || "—"}</td>
                    <td className="px-4! py-3.5!"><Badge tone={tone(PRIORITY_TONE, t.priority)}>{t.priority}</Badge></td>
                    <td className="px-4! py-3.5!"><Badge tone={tone(TICKET_STATUS_TONE, t.status)}>{t.status.replace("_", " ")}</Badge></td>
                    <td className="px-5! py-3.5! text-[var(--muted)] text-[12.5px] whitespace-nowrap">{relTime(t.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {sel && <TicketModal ticket={sel} onClose={() => setSel(null)} onChanged={() => { setSel(null); load(); }} />}
    </div>
  );
}

function TicketModal({ ticket, onClose, onChanged }: { ticket: AdminTicket; onClose: () => void; onChanged: () => void }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [d, setD] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState(ticket.status);
  const [priority, setPriority] = useState(ticket.priority);
  const [assignee, setAssignee] = useState(ticket.assigned_to || "");
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [reply, setReply] = useState("");
  const [internal, setInternal] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    getTicket(ticket.id)
      .then((t) => {
        setD(t);
        setStatus(t.status);
        setPriority(t.priority);
        setAssignee(t.assigned_to?.id || "");
      })
      .catch(() => setD(null))
      .finally(() => setLoading(false));
  }, [ticket.id]);
  useEffect(load, [load]);
  useEffect(() => {
    // Assignee picker is populated from super-admins only.
    listUsers({}).then((us) => setAdmins(us.filter((u) => u.is_superuser))).catch(() => setAdmins([]));
  }, []);

  const saveMeta = async () => {
    setBusy(true); setErr(null);
    try {
      await updateTicket(ticket.id, { status, priority, assigned_to: assignee || undefined });
      load();
      onChanged();
    } catch (e) { setErr(e instanceof Error ? e.message : "Couldn't update the ticket."); }
    finally { setBusy(false); }
  };
  const send = async () => {
    if (!reply.trim()) return;
    setBusy(true); setErr(null);
    try {
      await replyTicket(ticket.id, reply.trim(), internal);
      setReply("");
      load();
      onChanged();
    } catch (e) { setErr(e instanceof Error ? e.message : "Couldn't send the reply."); }
    finally { setBusy(false); }
  };

  const messages = d?.messages || [];

  return (
    <Modal title={`${ticket.reference} · ${ticket.subject}`} onClose={onClose} wide footer={
      <button onClick={onClose} className="text-[13px] font-semibold text-[var(--slate)] px-4! py-2.5! rounded-xl border border-[var(--line)] hover:bg-[var(--line-soft)]">Close</button>
    }>
      {err && <div className="flex items-center gap-2! text-[13px] text-rose-600 bg-rose-50 border border-rose-100 rounded-xl px-3.5! py-2.5! mb-4!"><AlertCircle size={15} /> {err}</div>}

      {/* Meta controls */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3! mb-3!">
        <div>
          <label className="block text-[12px] font-medium text-[var(--slate)] mb-1!">Status</label>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className={`${inp} appearance-none`}>
            {["open", "in_progress", "waiting_user", "resolved", "closed"].map((s) => (<option key={s} value={s}>{s.replace("_", " ")}</option>))}
          </select>
        </div>
        <div>
          <label className="block text-[12px] font-medium text-[var(--slate)] mb-1!">Priority</label>
          <select value={priority} onChange={(e) => setPriority(e.target.value)} className={`${inp} appearance-none`}>
            {["low", "normal", "high", "urgent"].map((s) => (<option key={s} value={s}>{s}</option>))}
          </select>
        </div>
        <div>
          <label className="block text-[12px] font-medium text-[var(--slate)] mb-1!">Assignee</label>
          <select value={assignee} onChange={(e) => setAssignee(e.target.value)} className={`${inp} appearance-none`}>
            <option value="">Unassigned</option>
            {admins.map((a) => (<option key={a.id} value={a.id}>{a.email}</option>))}
          </select>
        </div>
      </div>
      <div className="flex justify-end mb-5!">
        <button disabled={busy} onClick={saveMeta} className="inline-flex items-center gap-2! text-white text-[13px] font-semibold px-4! py-2! rounded-xl disabled:opacity-60" style={{ background: "var(--grad)" }}><CheckCircle2 size={14} /> Update</button>
      </div>

      {/* Thread */}
      <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--muted)] mb-2!">Conversation</p>
      {loading ? (
        <div className="py-6! grid place-items-center"><div className="w-6! h-6! border-2 border-[var(--line)] border-t-[var(--violet)] rounded-full animate-spin" /></div>
      ) : (
        <div className="space-y-2.5! mb-5! max-h-72! overflow-y-auto">
          {d?.body && (
            <div className="p-3! rounded-xl border border-[var(--line)] bg-[var(--line-soft)]/40">
              <p className="text-[11.5px] text-[var(--muted)] mb-1!">{d.requester?.email || "Customer"} · original request</p>
              <p className="text-[13px] text-[var(--ink)] whitespace-pre-wrap">{d.body}</p>
            </div>
          )}
          {messages.map(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (m: any) => (
              <div
                key={m.id}
                className={`p-3! rounded-xl border ${
                  m.internal
                    ? "border-amber-200 bg-amber-50"
                    : m.author_role === "admin"
                      ? "border-[var(--violet-100)] bg-[var(--violet-050)]"
                      : "border-[var(--line)] bg-white"
                }`}
              >
                <p className="text-[11.5px] mb-1! flex items-center gap-1.5!">
                  {m.internal && (
                    <span className="inline-flex items-center gap-1! text-[10px] font-bold text-amber-700 bg-amber-100 border border-amber-200 px-1.5! py-0.5! rounded-full uppercase tracking-wide">
                      <Lock size={9} /> Internal note
                    </span>
                  )}
                  <span className="text-[var(--muted)]">
                    {m.author_email || m.author_role} · {relTime(m.created_at)}
                  </span>
                </p>
                <p className="text-[13px] text-[var(--ink)] whitespace-pre-wrap">{m.body}</p>
              </div>
            ),
          )}
          {messages.length === 0 && !d?.body && <p className="text-[13px] text-[var(--muted)]">No messages yet.</p>}
        </div>
      )}

      {/* Composer */}
      <label className="block text-[13px] font-medium text-[var(--slate)] mb-1.5!">Reply</label>
      <textarea value={reply} onChange={(e) => setReply(e.target.value)} rows={4} className={`${inp} resize-y`} placeholder={internal ? "Write an internal note (operators only)…" : "Write a reply to the customer…"} />
      <div className="flex flex-wrap items-center justify-between gap-3! mt-3!">
        <div className="flex items-center gap-3!">
          <button
            type="button"
            role="switch"
            aria-checked={internal}
            onClick={() => setInternal((v) => !v)}
            className={`relative w-11! h-6! rounded-full transition-colors ${internal ? "bg-amber-500" : "bg-[var(--line)]"}`}
          >
            <span className={`absolute top-0.5! left-0.5! w-5! h-5! rounded-full bg-white shadow-sm transition-transform ${internal ? "translate-x-5" : ""}`} />
          </button>
          <span className={`text-[12.5px] font-medium flex items-center gap-1! ${internal ? "text-amber-700" : "text-emerald-700"}`}>
            {internal ? (<><Lock size={12} /> Internal note — only operators see this</>) : (<><CheckCircle2 size={12} /> Public reply — the customer will see this</>)}
          </span>
        </div>
        <button disabled={busy || !reply.trim()} onClick={send} className="inline-flex items-center gap-2! text-white text-[13px] font-semibold px-5! py-2.5! rounded-xl disabled:opacity-60" style={{ background: internal ? "linear-gradient(100deg,#f59e0b,#d97706)" : "var(--grad)" }}>
          {internal ? "Add internal note" : "Send reply"}
        </button>
      </div>
    </Modal>
  );
}

// ── Health ────────────────────────────────────────────────────────────────────
function HealthTab() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [d, setD] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const load = () => { setLoading(true); getHealth().then(setD).catch(() => setD(null)).finally(() => setLoading(false)); };
  useEffect(load, []);
  if (loading) return <Spinner />;
  if (!d) return <ErrorCard />;

  const ok = d.status === "ok";
  const checks: [string, Record<string, unknown>][] = Object.entries(d.checks || {});

  return (
    <div>
      <div className="flex items-center justify-between mb-5!">
        <span className={`inline-flex items-center gap-2! text-[14px] font-semibold px-4! py-2! rounded-xl border ${ok ? "text-emerald-700 bg-emerald-50 border-emerald-100" : "text-amber-700 bg-amber-50 border-amber-100"}`}>
          {ok ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />} {ok ? "All systems operational" : "Degraded"}
        </span>
        <button onClick={load} className="inline-flex items-center gap-2! bg-white border border-[var(--line)] text-[var(--slate)] hover:text-[var(--ink)] text-[13px] font-semibold px-4! py-2! rounded-xl"><RefreshCw size={15} /> Recheck</button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4!">
        {checks.map(([name, c]) => (
          <div key={name} className="bg-white border border-[var(--line)] rounded-2xl p-5! shadow-[var(--shadow-sm)]">
            <div className="flex items-center justify-between mb-3!">
              <p className="text-[14px] font-semibold text-[var(--ink)] capitalize">{name.replace("_", " ")}</p>
              <span className={`w-2.5! h-2.5! rounded-full ${c.ok ? "bg-emerald-500" : "bg-rose-500"}`} />
            </div>
            <div className="space-y-1! text-[12.5px]">
              {Object.entries(c).filter(([k]) => k !== "ok").map(([k, v]) => (
                <div key={k} className="flex items-center justify-between gap-3!">
                  <span className="text-[var(--muted)]">{k}</span>
                  <span className="text-[var(--slate)] font-medium truncate max-w-[160px]! text-right">{String(v)}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <p className="text-[12px] text-[var(--muted)] mt-4!">Checked {relTime(d.checked_at)}</p>
    </div>
  );
}

// ── Shared bits ───────────────────────────────────────────────────────────────
function Spinner() {
  return <div className="p-10! grid place-items-center"><div className="w-7! h-7! border-2 border-[var(--line)] border-t-[var(--violet)] rounded-full animate-spin" /></div>;
}
function ErrorCard() {
  return <div className="bg-white border border-[var(--line)] rounded-2xl p-8! text-center text-[13px] text-rose-600 flex items-center justify-center gap-2!"><AlertCircle size={16} /> Couldn&apos;t load — you may not have admin access, or the server is unreachable.</div>;
}
function Empty({ text }: { text: string }) {
  return <div className="p-10! text-center text-[13px] text-[var(--muted)]">{text}</div>;
}
function Badge({ tone, children }: { tone: string; children: React.ReactNode }) {
  return <span className={`inline-flex items-center text-[11px] font-semibold px-2! py-0.5! rounded-full border capitalize ${tone}`}>{children}</span>;
}
function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-3! rounded-lg bg-[var(--line-soft)]/50">
      <p className="text-[11px] text-[var(--muted)]">{label}</p>
      <p className="text-[13px] font-medium text-[var(--ink)] truncate">{value}</p>
    </div>
  );
}
function actBtn(color: "emerald" | "amber" | "violet" | "gray") {
  const map = {
    emerald: "text-emerald-700 bg-emerald-50 border-emerald-100 hover:bg-emerald-100",
    amber: "text-amber-700 bg-amber-50 border-amber-100 hover:bg-amber-100",
    violet: "text-[var(--violet-700)] bg-[var(--violet-050)] border-[var(--violet-100)] hover:bg-[var(--violet-100)]",
    gray: "text-[var(--slate)] bg-[var(--line-soft)] border-[var(--line)] hover:bg-[var(--line)]",
  } as const;
  return `inline-flex items-center gap-1.5! text-[13px] font-semibold px-4! py-2.5! rounded-xl border transition-colors disabled:opacity-50 ${map[color]}`;
}
function Modal({ title, onClose, children, footer, wide }: { title: string; onClose: () => void; children: React.ReactNode; footer?: React.ReactNode; wide?: boolean }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-4! bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className={`bg-white rounded-2xl shadow-2xl border border-[var(--line)] w-full! ${wide ? "max-w-2xl!" : "max-w-md!"} max-h-[90vh]! flex flex-col`}>
        <div className="flex items-center justify-between p-5! border-b border-[var(--line-soft)]">
          <h3 className="text-[15px] font-semibold text-[var(--ink)] truncate pr-3!">{title}</h3>
          <button onClick={onClose} className="w-8! h-8! grid place-items-center rounded-lg text-[var(--muted)] hover:bg-[var(--line-soft)] shrink-0"><X size={16} /></button>
        </div>
        <div className="p-5! overflow-y-auto">{children}</div>
        {footer && <div className="flex items-center justify-end gap-2! p-5! border-t border-[var(--line-soft)]">{footer}</div>}
      </div>
    </div>
  );
}

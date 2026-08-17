"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Building2,
  Phone,
  Globe,
  CreditCard,
  Save,
  Check,
  Bell,
  ShieldCheck,
  LogOut,
  Trash2,
  Lock,
  Pencil,
  Server,
  Send,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Monitor,
  KeyRound,
} from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { apiClient } from "@/lib/api/client";
import { relTime } from "@/lib/api/dashboard";
import type { UserSessionInfo } from "@/types";
import {
  getSmtp,
  putSmtp,
  testSmtp,
  deleteSmtp,
  type SmtpConfig,
} from "@/lib/api/smtp";

const inp =
  "w-full! px-4! py-2.5! bg-white border border-[var(--line)] rounded-xl text-[var(--ink)] text-sm placeholder-gray-400 outline-none focus:border-[var(--violet)] focus:ring-2 focus:ring-[var(--violet-100)] transition-all";

const TIMEZONES = [
  "UTC",
  "America/New_York",
  "America/Los_Angeles",
  "Europe/London",
  "Europe/Berlin",
  "Asia/Kolkata",
  "Asia/Singapore",
  "Asia/Tokyo",
  "Australia/Sydney",
];

function cardBrand(num: string): string {
  const n = num.replace(/\D/g, "");
  if (/^4/.test(n)) return "Visa";
  if (/^(5[1-5]|2[2-7])/.test(n)) return "Mastercard";
  if (/^3[47]/.test(n)) return "Amex";
  if (/^6(011|5)/.test(n)) return "Discover";
  return "Card";
}
function formatCard(v: string): string {
  return v
    .replace(/\D/g, "")
    .slice(0, 16)
    .replace(/(.{4})/g, "$1 ")
    .trim();
}

export default function AccountSettingsPage() {
  const { user, logout, updateUser } = useAuth();

  const [profile, setProfile] = useState({
    full_name: "",
    company: "",
    phone: "",
    timezone: "UTC",
  });
  const [billing, setBilling] = useState({
    plan: "Free",
    billing_email: "",
    card_name: "",
    card_brand: "",
    card_last4: "",
    card_exp: "",
  });
  const [prefs, setPrefs] = useState({
    product_news: true,
    usage_alerts: true,
    security_alerts: true,
  });
  const [cardForm, setCardForm] = useState({ number: "", name: "", exp: "", cvc: "" });
  const [editingCard, setEditingCard] = useState(false);
  const [saved, setSaved] = useState<string | null>(null);

  const flash = (m: string) => {
    setSaved(m);
    setTimeout(() => setSaved(null), 3000);
  };

  // Load persisted account details (fall back to the signed-in user).
  useEffect(() => {
    try {
      const p = JSON.parse(localStorage.getItem("avat_profile") || "{}");
      setProfile({
        full_name: p.full_name ?? (user?.full_name || ""),
        company: p.company || "",
        phone: p.phone || "",
        timezone: p.timezone || "UTC",
      });
      const b = JSON.parse(localStorage.getItem("avat_billing") || "{}");
      setBilling({
        plan: b.plan || "Free",
        billing_email: b.billing_email ?? (user?.email || ""),
        card_name: b.card_name || "",
        card_brand: b.card_brand || "",
        card_last4: b.card_last4 || "",
        card_exp: b.card_exp || "",
      });
      const pr = JSON.parse(localStorage.getItem("avat_prefs") || "{}");
      setPrefs({
        product_news: pr.product_news ?? true,
        usage_alerts: pr.usage_alerts ?? true,
        security_alerts: pr.security_alerts ?? true,
      });
    } catch {
      /* first run */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const saveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("avat_profile", JSON.stringify(profile));
    updateUser({ full_name: profile.full_name });
    flash("Profile saved");
  };

  const saveBilling = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("avat_billing", JSON.stringify(billing));
    flash("Billing details saved");
  };

  const saveCard = (e: React.FormEvent) => {
    e.preventDefault();
    const digits = cardForm.number.replace(/\D/g, "");
    if (digits.length < 13) return flash("Enter a valid card number");
    // Never persist the full PAN or CVC — store only display metadata.
    const next = {
      ...billing,
      card_brand: cardBrand(digits),
      card_last4: digits.slice(-4),
      card_exp: cardForm.exp,
      card_name: cardForm.name,
    };
    setBilling(next);
    localStorage.setItem("avat_billing", JSON.stringify(next));
    setCardForm({ number: "", name: "", exp: "", cvc: "" });
    setEditingCard(false);
    flash("Payment method updated");
  };

  const togglePref = (k: keyof typeof prefs) => {
    const next = { ...prefs, [k]: !prefs[k] };
    setPrefs(next);
    localStorage.setItem("avat_prefs", JSON.stringify(next));
    flash("Preferences updated");
  };

  const deleteAccount = () => {
    if (
      confirm(
        "Delete your account? This removes your local workspace data on this device.",
      )
    ) {
      localStorage.removeItem("avat_profile");
      localStorage.removeItem("avat_billing");
      localStorage.removeItem("avat_prefs");
      void logout();
    }
  };

  const initial = (profile.full_name || user?.email || "A")[0].toUpperCase();

  return (
    <div className="min-h-full text-[var(--foreground)] p-8! md:p-12!">
      <div className="max-w-[860px] mx-auto!">
        {/* Header */}
        <div className="mb-8!">
          <span className="eyebrow mb-3!">
            <User size={11} /> Account
          </span>
          <h1 className="text-[28px] font-semibold text-[var(--ink)] tracking-tight mt-3!">
            Settings
          </h1>
          <p className="text-sm text-[var(--slate)] mt-1.5!">
            Manage your profile, payment details, and preferences.
          </p>
        </div>

        {saved && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2! text-[13px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-xl px-4! py-3! mb-6!"
          >
            <Check size={15} /> {saved}
          </motion.div>
        )}

        {/* ── Profile ── */}
        <Section
          icon={<User size={16} />}
          title="Profile"
          desc="Your name and how we can reach you."
        >
          <form onSubmit={saveProfile}>
            <div className="flex items-center gap-4! mb-6!">
              <div
                className="w-16! h-16! rounded-2xl grid place-items-center text-white text-xl font-semibold shrink-0"
                style={{ background: "var(--grad)" }}
              >
                {initial}
              </div>
              <div>
                <p className="text-[15px] font-semibold text-[var(--ink)]">
                  {profile.full_name || "Your name"}
                </p>
                <p className="text-[13px] text-[var(--muted)]">{user?.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4!">
              <FieldRow label="Full name" icon={<User size={15} />}>
                <input
                  className={`${inp} pl-10!`}
                  value={profile.full_name}
                  onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                  placeholder="Jane Doe"
                />
              </FieldRow>
              <FieldRow label="Email" icon={<Mail size={15} />}>
                <input
                  className={`${inp} pl-10! bg-[var(--line-soft)]! text-[var(--muted)] cursor-not-allowed`}
                  value={user?.email || ""}
                  readOnly
                  title="Email can't be changed here"
                />
              </FieldRow>
              <FieldRow label="Company" icon={<Building2 size={15} />}>
                <input
                  className={`${inp} pl-10!`}
                  value={profile.company}
                  onChange={(e) => setProfile({ ...profile, company: e.target.value })}
                  placeholder="Acme Inc."
                />
              </FieldRow>
              <FieldRow label="Phone" icon={<Phone size={15} />}>
                <input
                  className={`${inp} pl-10!`}
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  placeholder="+1 555 000 1234"
                />
              </FieldRow>
              <FieldRow label="Timezone" icon={<Globe size={15} />}>
                <select
                  className={`${inp} pl-10! appearance-none`}
                  value={profile.timezone}
                  onChange={(e) => setProfile({ ...profile, timezone: e.target.value })}
                >
                  {TIMEZONES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </FieldRow>
            </div>

            <div className="flex justify-end mt-6!">
              <SaveButton>Save profile</SaveButton>
            </div>
          </form>
        </Section>

        {/* ── Payment ── */}
        <Section
          icon={<CreditCard size={16} />}
          title="Payment details"
          desc="Your plan and payment method for credits."
        >
          {/* Current plan row */}
          <div className="flex flex-wrap items-center justify-between gap-3! p-4! rounded-xl border border-[var(--line)] bg-[var(--violet-050)] mb-5!">
            <div>
              <p className="text-[13px] text-[var(--slate)]">Current plan</p>
              <p className="text-[16px] font-semibold text-[var(--ink)]">
                {billing.plan}
              </p>
            </div>
            <a
              href="/dashboard/credits"
              className="text-[13px] font-semibold text-white px-4! py-2! rounded-lg"
              style={{ background: "var(--grad)" }}
            >
              Manage credits
            </a>
          </div>

          {/* Saved card OR card form */}
          {billing.card_last4 && !editingCard ? (
            <div className="flex flex-wrap items-center justify-between gap-3! p-4! rounded-xl border border-[var(--line)] mb-5!">
              <div className="flex items-center gap-3!">
                <span className="w-11! h-8! rounded-md grid place-items-center bg-[var(--ink)] text-white text-[11px] font-semibold">
                  {billing.card_brand || "Card"}
                </span>
                <div>
                  <p className="text-[14px] font-medium text-[var(--ink)] tabular-nums">
                    •••• •••• •••• {billing.card_last4}
                  </p>
                  <p className="text-[12px] text-[var(--muted)]">
                    {billing.card_name}
                    {billing.card_exp ? ` · exp ${billing.card_exp}` : ""}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditingCard(true)}
                className="inline-flex items-center gap-1.5! text-[13px] font-semibold text-[var(--violet-700)] border border-[var(--violet-100)] bg-[var(--violet-050)] hover:bg-[var(--violet-100)] px-3.5! py-2! rounded-lg transition-colors"
              >
                <Pencil size={13} /> Update
              </button>
            </div>
          ) : (
            <form onSubmit={saveCard} className="mb-5!">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4!">
                <div className="sm:col-span-2">
                  <label className="block text-[13px] font-medium text-[var(--slate)] mb-1.5!">
                    Card number
                  </label>
                  <div className="relative">
                    <CreditCard
                      size={15}
                      className="absolute left-3.5! top-1/2 -translate-y-1/2 text-[var(--muted)]"
                    />
                    <input
                      className={`${inp} pl-10! tabular-nums`}
                      value={cardForm.number}
                      onChange={(e) =>
                        setCardForm({ ...cardForm, number: formatCard(e.target.value) })
                      }
                      placeholder="4242 4242 4242 4242"
                      inputMode="numeric"
                      autoComplete="cc-number"
                    />
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[13px] font-medium text-[var(--slate)] mb-1.5!">
                    Name on card
                  </label>
                  <input
                    className={inp}
                    value={cardForm.name}
                    onChange={(e) => setCardForm({ ...cardForm, name: e.target.value })}
                    placeholder="Jane Doe"
                    autoComplete="cc-name"
                  />
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-[var(--slate)] mb-1.5!">
                    Expiry (MM/YY)
                  </label>
                  <input
                    className={`${inp} tabular-nums`}
                    value={cardForm.exp}
                    onChange={(e) =>
                      setCardForm({
                        ...cardForm,
                        exp: e.target.value
                          .replace(/[^\d/]/g, "")
                          .slice(0, 5),
                      })
                    }
                    placeholder="08/28"
                    autoComplete="cc-exp"
                  />
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-[var(--slate)] mb-1.5!">
                    CVC
                  </label>
                  <input
                    className={`${inp} tabular-nums`}
                    value={cardForm.cvc}
                    onChange={(e) =>
                      setCardForm({
                        ...cardForm,
                        cvc: e.target.value.replace(/\D/g, "").slice(0, 4),
                      })
                    }
                    placeholder="123"
                    inputMode="numeric"
                    autoComplete="cc-csc"
                  />
                </div>
              </div>
              <div className="flex items-center gap-3! justify-end mt-5!">
                {billing.card_last4 && (
                  <button
                    type="button"
                    onClick={() => setEditingCard(false)}
                    className="text-[13px] font-semibold text-[var(--slate)] px-4! py-2.5! rounded-xl border border-[var(--line)] hover:bg-[var(--line-soft)] transition-colors"
                  >
                    Cancel
                  </button>
                )}
                <SaveButton>Save card</SaveButton>
              </div>
            </form>
          )}

          <form onSubmit={saveBilling}>
            <FieldRow label="Billing email" icon={<Mail size={15} />}>
              <input
                className={`${inp} pl-10!`}
                value={billing.billing_email}
                onChange={(e) =>
                  setBilling({ ...billing, billing_email: e.target.value })
                }
                placeholder="billing@acme.com"
              />
            </FieldRow>
            <div className="flex justify-end mt-5!">
              <SaveButton>Save billing</SaveButton>
            </div>
          </form>

          <p className="flex items-center gap-1.5! text-[12px] text-[var(--muted)] mt-4!">
            <ShieldCheck size={13} /> Card details are stored only as the last 4
            digits on this device — no full card number or CVC is kept.
          </p>
        </Section>

        {/* ── Notifications ── */}
        <Section
          icon={<Bell size={16} />}
          title="Notifications"
          desc="Choose what we email you about."
        >
          <div className="divide-y divide-[var(--line-soft)]">
            <ToggleRow
              title="Product news"
              desc="Occasional updates about new features."
              on={prefs.product_news}
              onToggle={() => togglePref("product_news")}
            />
            <ToggleRow
              title="Usage alerts"
              desc="Notify me when credits are running low."
              on={prefs.usage_alerts}
              onToggle={() => togglePref("usage_alerts")}
            />
            <ToggleRow
              title="Security alerts"
              desc="Sign-ins and important account activity."
              on={prefs.security_alerts}
              onToggle={() => togglePref("security_alerts")}
            />
          </div>
        </Section>

        {/* ── Email (SMTP) ── */}
        <SmtpSection accountEmail={user?.email || ""} />

        {/* ── Security / danger ── */}
        <Section
          icon={<ShieldCheck size={16} />}
          title="Security"
          desc="Password and account controls."
        >
          <ChangePassword />

          <ActiveSessions />

          <div className="flex flex-wrap items-center justify-between gap-3! mt-6!">
            <button
              onClick={() => void logout()}
              className="inline-flex items-center gap-2! text-[13px] font-semibold text-[var(--slate)] px-4! py-2.5! rounded-xl border border-[var(--line)] hover:bg-[var(--line-soft)] transition-colors"
            >
              <LogOut size={15} /> Sign out
            </button>
            <button
              onClick={deleteAccount}
              className="inline-flex items-center gap-2! text-[13px] font-semibold text-rose-600 px-4! py-2.5! rounded-xl border border-rose-100 hover:bg-rose-50 transition-colors"
            >
              <Trash2 size={15} /> Delete account
            </button>
          </div>
        </Section>
      </div>
    </div>
  );
}

/* ── Small building blocks ── */

/* ── SMTP (outbound email) ── */
function errText(e: unknown, fallback: string): string {
  const m = e instanceof Error ? e.message : "";
  if (!m) return fallback;
  return m.length > 220 ? m.slice(0, 220) + "…" : m;
}

function SmtpStatus({ cfg }: { cfg: SmtpConfig | null }) {
  if (cfg?.verified_at)
    return (
      <p className="flex items-center gap-1.5! text-[12.5px] text-emerald-700 mt-0.5!">
        <CheckCircle2 size={13} /> Verified {relTime(cfg.verified_at)}
      </p>
    );
  if (cfg?.last_error)
    return (
      <p className="flex items-start gap-1.5! text-[12.5px] text-rose-600 mt-0.5! max-w-[420px]!">
        <AlertCircle size={13} className="shrink-0 mt-0.5!" />
        <span className="line-clamp-2">Last test failed: {cfg.last_error}</span>
      </p>
    );
  if (cfg?.password_set)
    return (
      <p className="text-[12.5px] text-[var(--muted)] mt-0.5!">
        Configured — send a test to verify it works.
      </p>
    );
  return (
    <p className="text-[12.5px] text-[var(--muted)] mt-0.5!">Not configured.</p>
  );
}

function SmtpSection({ accountEmail }: { accountEmail: string }) {
  const [cfg, setCfg] = useState<SmtpConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPw, setShowPw] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testTo, setTestTo] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [form, setForm] = useState({
    enabled: false,
    host: "",
    port: 587,
    username: "",
    password: "",
    from_email: "",
    from_name: "",
    reply_to: "",
    security: "starttls" as "starttls" | "ssl" | "none",
  });

  const apply = (c: SmtpConfig) => {
    setCfg(c);
    setForm({
      enabled: c.enabled,
      host: c.host || "",
      port: c.port || 587,
      username: c.username || "",
      password: "",
      from_email: c.from_email || "",
      from_name: c.from_name || "",
      reply_to: c.reply_to || "",
      security: c.use_ssl ? "ssl" : c.use_tls ? "starttls" : "none",
    });
  };

  useEffect(() => {
    getSmtp()
      .then(apply)
      .catch(() => {})
      .finally(() => setLoading(false));
    setTestTo(accountEmail);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const set = (k: string, v: string | number | boolean) =>
    setForm((f) => ({ ...f, [k]: v }));
  const flash = (ok: boolean, text: string) => {
    setMsg({ ok, text });
    setTimeout(() => setMsg(null), 6000);
  };

  const pickSecurity = (s: "starttls" | "ssl" | "none") =>
    setForm((f) => ({
      ...f,
      security: s,
      port: s === "ssl" ? 465 : s === "starttls" ? 587 : f.port,
    }));

  const payload = () => ({
    enabled: form.enabled,
    host: form.host.trim() || undefined,
    port: Number(form.port) || 587,
    username: form.username.trim() || undefined,
    password: form.password ? form.password : undefined,
    from_email: form.from_email.trim() || undefined,
    from_name: form.from_name.trim() || undefined,
    use_tls: form.security === "starttls",
    use_ssl: form.security === "ssl",
    reply_to: form.reply_to.trim() || undefined,
  });

  const save = async () => {
    setSaving(true);
    setMsg(null);
    try {
      apply(await putSmtp(payload()));
      flash(true, "Email settings saved.");
    } catch (e) {
      flash(false, errText(e, "Couldn't save email settings."));
    } finally {
      setSaving(false);
    }
  };

  const runTest = async () => {
    setTesting(true);
    setMsg(null);
    try {
      const r = await testSmtp(testTo.trim() || undefined);
      flash(true, `Test email sent to ${r.to}.`);
    } catch (e) {
      flash(false, errText(e, "Test failed."));
    } finally {
      setTesting(false);
      getSmtp().then(apply).catch(() => {});
    }
  };

  const clearAll = async () => {
    if (!confirm("Clear your SMTP configuration? Outbound email will stop."))
      return;
    setSaving(true);
    try {
      await deleteSmtp();
      apply(await getSmtp());
      flash(true, "SMTP configuration cleared.");
    } catch (e) {
      flash(false, errText(e, "Couldn't clear the configuration."));
    } finally {
      setSaving(false);
    }
  };

  const canTest = !!cfg?.enabled && !!cfg?.host;
  const lbl = "block text-[13px] font-medium text-[var(--slate)] mb-1.5!";

  return (
    <Section
      icon={<Server size={16} />}
      title="Email (SMTP)"
      desc="Send confirmations and notifications from your own mail server."
    >
      {loading ? (
        <div className="py-6! grid place-items-center">
          <div className="w-6! h-6! border-2 border-[var(--line)] border-t-[var(--violet)] rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* Enable + status */}
          <div className="flex flex-wrap items-center justify-between gap-3! p-4! rounded-xl border border-[var(--line)] bg-[var(--violet-050)] mb-5!">
            <div>
              <p className="text-[14px] font-medium text-[var(--ink)]">
                Outbound email
              </p>
              <SmtpStatus cfg={cfg} />
            </div>
            <button
              role="switch"
              aria-checked={form.enabled}
              onClick={() => set("enabled", !form.enabled)}
              className={`relative w-11! h-6! rounded-full shrink-0 transition-colors ${
                form.enabled ? "" : "bg-[var(--line)]"
              }`}
              style={form.enabled ? { background: "var(--grad)" } : undefined}
            >
              <span
                className={`absolute top-0.5! left-0.5! w-5! h-5! rounded-full bg-white shadow-sm transition-transform ${
                  form.enabled ? "translate-x-5" : ""
                }`}
              />
            </button>
          </div>

          {/* Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4!">
            <div className="sm:col-span-2">
              <label className={lbl}>SMTP host</label>
              <input
                className={inp}
                value={form.host}
                onChange={(e) => set("host", e.target.value)}
                placeholder="smtp.yourprovider.com"
              />
            </div>

            <div>
              <label className={lbl}>Port</label>
              <input
                type="number"
                min={1}
                max={65535}
                className={inp}
                value={form.port}
                onChange={(e) => set("port", Number(e.target.value))}
                placeholder="587"
              />
            </div>

            <div>
              <label className={lbl}>Encryption</label>
              <div className="flex items-center gap-1! bg-white border border-[var(--line)] rounded-xl p-1!">
                {(
                  [
                    { k: "starttls", label: "STARTTLS" },
                    { k: "ssl", label: "SSL/TLS" },
                    { k: "none", label: "None" },
                  ] as const
                ).map((o) => (
                  <button
                    key={o.k}
                    type="button"
                    onClick={() => pickSecurity(o.k)}
                    className={`flex-1 px-2! py-1.5! rounded-lg text-[12px] font-medium transition-colors ${
                      form.security === o.k
                        ? "bg-[var(--violet-050)] text-[var(--violet-700)]"
                        : "text-[var(--slate)] hover:text-[var(--ink)]"
                    }`}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className={lbl}>Username</label>
              <input
                className={inp}
                value={form.username}
                onChange={(e) => set("username", e.target.value)}
                placeholder="apikey / user@domain.com"
                autoComplete="off"
              />
            </div>

            <div>
              <label className={lbl}>Password</label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  className={`${inp} pr-11!`}
                  value={form.password}
                  onChange={(e) => set("password", e.target.value)}
                  placeholder={
                    cfg?.password_set
                      ? "•••••••• saved — leave blank to keep"
                      : "App password"
                  }
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  aria-label={showPw ? "Hide password" : "Show password"}
                  className="absolute right-3! top-1/2 -translate-y-1/2 p-1! text-[var(--muted)] hover:text-[var(--violet-700)] transition-colors"
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className={lbl}>From email</label>
              <input
                className={inp}
                value={form.from_email}
                onChange={(e) => set("from_email", e.target.value)}
                placeholder="hello@yourcompany.com"
              />
            </div>

            <div>
              <label className={lbl}>From name</label>
              <input
                className={inp}
                value={form.from_name}
                onChange={(e) => set("from_name", e.target.value)}
                placeholder="Your Company"
              />
            </div>

            <div className="sm:col-span-2">
              <label className={lbl}>Reply-to (optional)</label>
              <input
                className={inp}
                value={form.reply_to}
                onChange={(e) => set("reply_to", e.target.value)}
                placeholder="support@yourcompany.com"
              />
            </div>
          </div>

          {msg && (
            <div
              className={`flex items-center gap-2! text-[13px] rounded-xl px-3.5! py-2.5! mt-4! ${
                msg.ok
                  ? "text-emerald-700 bg-emerald-50 border border-emerald-100"
                  : "text-rose-600 bg-rose-50 border border-rose-100"
              }`}
            >
              {msg.ok ? <Check size={15} /> : <AlertCircle size={15} />}
              <span className="break-words min-w-0">{msg.text}</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-3! mt-6!">
            <button
              onClick={save}
              disabled={saving}
              className="inline-flex items-center gap-2! text-white text-[13px] font-semibold px-5! py-2.5! rounded-xl shadow-[0_8px_24px_rgba(124,58,237,0.25)] disabled:opacity-60"
              style={{ background: "var(--grad)" }}
            >
              {saving ? (
                <RefreshCw size={15} className="animate-spin" />
              ) : (
                <Save size={15} />
              )}
              Save settings
            </button>

            <div className="flex items-center gap-2! ml-auto!">
              <input
                value={testTo}
                onChange={(e) => setTestTo(e.target.value)}
                placeholder="test@you.com"
                className={`${inp} w-52! py-2!`}
              />
              <button
                onClick={runTest}
                disabled={testing || !canTest}
                title={canTest ? "" : "Save & enable SMTP first"}
                className="inline-flex items-center gap-2! text-[13px] font-semibold text-[var(--violet-700)] bg-[var(--violet-050)] border border-[var(--violet-100)] hover:bg-[var(--violet-100)] px-4! py-2.5! rounded-xl transition-colors disabled:opacity-50"
              >
                {testing ? (
                  <RefreshCw size={15} className="animate-spin" />
                ) : (
                  <Send size={15} />
                )}
                Send test
              </button>
            </div>
          </div>

          {(cfg?.password_set || cfg?.enabled) && (
            <button
              onClick={clearAll}
              disabled={saving}
              className="inline-flex items-center gap-1.5! text-[12.5px] font-semibold text-rose-600 hover:underline mt-4!"
            >
              <Trash2 size={13} /> Clear SMTP configuration
            </button>
          )}
        </>
      )}
    </Section>
  );
}

/* ── Change password ── */
function ChangePassword() {
  const [open, setOpen] = useState(false);
  const [cur, setCur] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const submit = async () => {
    setMsg(null);
    if (next.length < 8) return setMsg({ ok: false, text: "New password must be at least 8 characters." });
    if (next !== confirm) return setMsg({ ok: false, text: "New passwords don't match." });
    setBusy(true);
    try {
      await apiClient.changePassword(cur, next);
      setMsg({ ok: true, text: "Password changed. Other devices were signed out." });
      setCur(""); setNext(""); setConfirm("");
      setTimeout(() => { setOpen(false); setMsg(null); }, 2500);
    } catch (e) {
      const m = e instanceof Error ? e.message : "";
      setMsg({ ok: false, text: /current|incorrect|match|400|401/i.test(m) ? "Your current password is incorrect." : (m || "Couldn't change password.") });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rounded-xl border border-[var(--line)] mb-4! overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3! p-4!">
        <div className="flex items-center gap-3!">
          <span className="w-9! h-9! rounded-lg grid place-items-center text-[var(--violet-700)] bg-[var(--violet-050)] border border-[var(--violet-100)]">
            <KeyRound size={15} />
          </span>
          <div>
            <p className="text-[14px] font-medium text-[var(--ink)]">Password</p>
            <p className="text-[12px] text-[var(--muted)]">
              Changing it signs out your other devices.
            </p>
          </div>
        </div>
        <button
          onClick={() => setOpen((v) => !v)}
          className="text-[13px] font-semibold text-[var(--slate)] px-4! py-2! rounded-lg border border-[var(--line)] hover:bg-[var(--line-soft)] transition-colors"
        >
          {open ? "Cancel" : "Change password"}
        </button>
      </div>
      {open && (
        <div className="p-4! pt-0! space-y-3!">
          <div className="relative">
            <input type={show ? "text" : "password"} className={`${inp} pr-11!`} value={cur} onChange={(e) => setCur(e.target.value)} placeholder="Current password" autoComplete="current-password" />
            <button type="button" onClick={() => setShow((v) => !v)} className="absolute right-3! top-1/2 -translate-y-1/2 p-1! text-[var(--muted)] hover:text-[var(--violet-700)]">{show ? <EyeOff size={16} /> : <Eye size={16} />}</button>
          </div>
          <input type={show ? "text" : "password"} className={inp} value={next} onChange={(e) => setNext(e.target.value)} placeholder="New password (min 8 chars)" autoComplete="new-password" />
          <input type={show ? "text" : "password"} className={inp} value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Confirm new password" autoComplete="new-password" />
          {msg && (
            <div className={`flex items-center gap-2! text-[13px] rounded-xl px-3.5! py-2.5! ${msg.ok ? "text-emerald-700 bg-emerald-50 border border-emerald-100" : "text-rose-600 bg-rose-50 border border-rose-100"}`}>
              {msg.ok ? <Check size={15} /> : <AlertCircle size={15} />} {msg.text}
            </div>
          )}
          <div className="flex justify-end!">
            <button onClick={submit} disabled={busy || !cur || !next} className="inline-flex items-center gap-2! text-white text-[13px] font-semibold px-5! py-2.5! rounded-xl disabled:opacity-60" style={{ background: "var(--grad)" }}>
              {busy ? <RefreshCw size={15} className="animate-spin" /> : <Check size={15} />} Update password
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Active login sessions ("devices") ── */
function ActiveSessions() {
  const { logout } = useAuth();
  const [sessions, setSessions] = useState<UserSessionInfo[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    apiClient
      .listSessions()
      .then((s) => setSessions(s || []))
      .catch(() => setSessions([]))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const revoke = async (id: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== id));
    try {
      await apiClient.revokeSession(id);
    } catch {
      load();
    }
  };

  const signOutEverywhere = async () => {
    if (!confirm("Sign out on all devices, including this one?")) return;
    await apiClient.logoutAll();
    void logout();
  };

  return (
    <div className="rounded-xl border border-[var(--line)] p-4! mb-2!">
      <div className="flex items-center justify-between mb-3!">
        <p className="text-[14px] font-medium text-[var(--ink)] flex items-center gap-2!">
          <Monitor size={15} className="text-[var(--violet-700)]" /> Active sessions
        </p>
        {sessions.length > 1 && (
          <button onClick={signOutEverywhere} className="text-[12.5px] font-semibold text-rose-600 hover:underline">
            Sign out everywhere
          </button>
        )}
      </div>
      {loading ? (
        <div className="py-3! grid place-items-center"><div className="w-5! h-5! border-2 border-[var(--line)] border-t-[var(--violet)] rounded-full animate-spin" /></div>
      ) : sessions.length === 0 ? (
        <p className="text-[13px] text-[var(--muted)]">No other active sessions.</p>
      ) : (
        <div className="space-y-2!">
          {sessions.map((s) => (
            <div key={s.id} className="flex items-center gap-3! p-3! rounded-lg border border-[var(--line-soft)]">
              <span className="w-8! h-8! rounded-lg grid place-items-center text-[var(--slate)] bg-[var(--line-soft)] shrink-0"><Monitor size={15} /></span>
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-medium text-[var(--ink)] truncate">
                  {s.user_agent || "Unknown device"}
                  {s.current && <span className="ml-2! text-[10px] font-bold text-[var(--violet-700)] bg-[var(--violet-050)] border border-[var(--violet-100)] px-1.5! py-0.5! rounded-full align-middle">This device</span>}
                </p>
                <p className="text-[11.5px] text-[var(--muted)]">
                  {s.ip_address || "—"} · active {relTime(s.last_seen_at)}
                </p>
              </div>
              {!s.current && (
                <button onClick={() => revoke(s.id)} title="Sign out this device" className="w-8! h-8! rounded-lg grid place-items-center text-[var(--muted)] hover:text-rose-600 hover:bg-rose-50 transition-colors shrink-0">
                  <LogOut size={14} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Section({
  icon,
  title,
  desc,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white border border-[var(--line)] rounded-2xl p-6! md:p-7! shadow-[var(--shadow-sm)] mb-6!">
      <div className="flex items-start gap-3! mb-6!">
        <span className="w-10! h-10! rounded-xl grid place-items-center text-[var(--violet-700)] bg-[var(--violet-050)] border border-[var(--violet-100)] shrink-0">
          {icon}
        </span>
        <div>
          <h2 className="text-[16px] font-semibold text-[var(--ink)]">{title}</h2>
          <p className="text-[13px] text-[var(--slate)] mt-0.5!">{desc}</p>
        </div>
      </div>
      {children}
    </div>
  );
}

function FieldRow({
  label,
  icon,
  children,
}: {
  label: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="w-full!">
      <label className="block text-[13px] font-medium text-[var(--slate)] mb-1.5!">
        {label}
      </label>
      <div className="relative">
        {icon && (
          <span className="absolute left-3.5! top-1/2 -translate-y-1/2 text-[var(--muted)] pointer-events-none">
            {icon}
          </span>
        )}
        {children}
      </div>
    </div>
  );
}

function SaveButton({ children }: { children: React.ReactNode }) {
  return (
    <button
      type="submit"
      className="inline-flex items-center gap-2! text-white text-[13px] font-semibold px-6! py-2.5! rounded-xl shadow-[0_8px_24px_rgba(124,58,237,0.25)] transition-transform hover:-translate-y-0.5"
      style={{ background: "var(--grad)" }}
    >
      <Save size={15} /> {children}
    </button>
  );
}

function ToggleRow({
  title,
  desc,
  on,
  onToggle,
}: {
  title: string;
  desc: string;
  on: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4! py-4!">
      <div>
        <p className="text-[14px] font-medium text-[var(--ink)]">{title}</p>
        <p className="text-[12.5px] text-[var(--muted)] mt-0.5!">{desc}</p>
      </div>
      <button
        onClick={onToggle}
        role="switch"
        aria-checked={on}
        className={`relative w-11! h-6! rounded-full shrink-0 transition-colors ${
          on ? "" : "bg-[var(--line)]"
        }`}
        style={on ? { background: "var(--grad)" } : undefined}
      >
        <span
          className={`absolute top-0.5! left-0.5! w-5! h-5! rounded-full bg-white shadow-sm transition-transform ${
            on ? "translate-x-5" : ""
          }`}
        />
      </button>
    </div>
  );
}

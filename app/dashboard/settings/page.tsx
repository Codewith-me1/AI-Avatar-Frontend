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
} from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";

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

        {/* ── Security / danger ── */}
        <Section
          icon={<ShieldCheck size={16} />}
          title="Security"
          desc="Password and account controls."
        >
          <div className="flex flex-wrap items-center justify-between gap-3! p-4! rounded-xl border border-[var(--line)] mb-4!">
            <div className="flex items-center gap-3!">
              <span className="w-9! h-9! rounded-lg grid place-items-center text-[var(--violet-700)] bg-[var(--violet-050)] border border-[var(--violet-100)]">
                <Lock size={15} />
              </span>
              <div>
                <p className="text-[14px] font-medium text-[var(--ink)]">Password</p>
                <p className="text-[12px] text-[var(--muted)]">
                  Last changed — never
                </p>
              </div>
            </div>
            <button
              onClick={() => flash("Password reset link sent (demo)")}
              className="text-[13px] font-semibold text-[var(--slate)] px-4! py-2! rounded-lg border border-[var(--line)] hover:bg-[var(--line-soft)] transition-colors"
            >
              Change password
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3!">
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

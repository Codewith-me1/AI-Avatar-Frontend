"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Sparkles,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Globe,
  Zap,
  Info,
} from "lucide-react";

// Dummy credentials — replace with real auth later.
const DEMO_EMAIL = "admin@avat.ai";
const DEMO_PASSWORD = "avat1234";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Simulate a network round-trip.
    setTimeout(() => {
      if (email.trim().toLowerCase() === DEMO_EMAIL && password === DEMO_PASSWORD) {
        try {
          localStorage.setItem("avat_auth", "true");
          localStorage.setItem("avat_user", email.trim().toLowerCase());
        } catch {}
        router.push("/dashboard");
      } else {
        setError("Invalid credentials. Use the demo login below.");
        setLoading(false);
      }
    }, 600);
  };

  const fillDemo = () => {
    setEmail(DEMO_EMAIL);
    setPassword(DEMO_PASSWORD);
    setError(null);
  };

  return (
    <div className="min-h-screen w-full! grid lg:grid-cols-2 bg-[var(--background)]">
      {/* ── Brand panel ─────────────────────────────────────── */}
      <div
        className="hidden lg:flex flex-col justify-between p-12! text-white relative overflow-hidden"
        style={{ background: "var(--grad)" }}
      >
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Ccircle cx='1' cy='1' r='1' fill='white'/%3E%3C/svg%3E\")",
          }}
        />
        <Link href="/" className="relative flex items-center gap-2.5! w-fit!">
          <span className="w-10! h-10! rounded-xl grid place-items-center bg-white/20 backdrop-blur">
            <Sparkles size={20} />
          </span>
          <span className="font-display font-bold text-xl">AVAT Avatar</span>
        </Link>

        <div className="relative">
          <h1 className="font-display text-[38px] font-semibold leading-[1.1] mb-4! max-w-md!">
            Give your product a face that talks back.
          </h1>
          <p className="text-white/80 text-[15px] max-w-sm! mb-10!">
            Deploy lifelike AI avatars for real-time conversations — answering
            questions, guiding signups, and resolving support in any language.
          </p>
          <div className="space-y-4!">
            {[
              { icon: <Zap size={16} />, text: "Sub-500ms voice-to-video latency" },
              { icon: <Globe size={16} />, text: "60+ languages with real-time lip-sync" },
              { icon: <ShieldCheck size={16} />, text: "SOC 2 Type II · end-to-end encrypted" },
            ].map((f) => (
              <div key={f.text} className="flex items-center gap-3!">
                <span className="w-8! h-8! rounded-lg grid place-items-center bg-white/15">
                  {f.icon}
                </span>
                <span className="text-[14px] text-white/90">{f.text}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-white/60 text-[13px]">
          © 2026 AVAT Avatar Inc.
        </p>
      </div>

      {/* ── Form panel ──────────────────────────────────────── */}
      <div className="flex items-center justify-center p-6! sm:p-12!">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full! max-w-[420px]!"
        >
          {/* Mobile logo */}
          <Link
            href="/"
            className="lg:hidden flex items-center gap-2.5! mb-8! w-fit!"
          >
            <span
              className="w-9! h-9! rounded-xl grid place-items-center text-white"
              style={{ background: "var(--grad)" }}
            >
              <Sparkles size={18} />
            </span>
            <span className="font-display font-bold text-[17px] text-[var(--ink)]">
              AVAT Avatar
            </span>
          </Link>

          <span className="eyebrow mb-4!">
            <Lock size={11} /> Sign in
          </span>
          <h2 className="text-[26px] font-semibold text-[var(--ink)] tracking-tight mt-3! mb-1.5!">
            Welcome back
          </h2>
          <p className="text-[14px] text-[var(--slate)] mb-7!">
            Sign in to your workspace to manage your avatars.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4!">
            <div>
              <label className="block text-[13px] font-medium text-[var(--slate)] mb-1.5!">
                Email
              </label>
              <div className="relative">
                <Mail
                  size={16}
                  className="absolute left-3.5! top-1/2 -translate-y-1/2 text-[var(--muted)]"
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  autoComplete="email"
                  className="w-full! pl-10! pr-4! py-3! bg-white border border-[var(--line)] rounded-xl text-[var(--ink)] text-sm placeholder-gray-400 outline-none focus:border-[var(--violet)] focus:ring-2 focus:ring-[var(--violet-100)] transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5!">
                <label className="text-[13px] font-medium text-[var(--slate)]">
                  Password
                </label>
                <button
                  type="button"
                  className="text-[12px] font-medium text-[var(--violet-700)] hover:underline"
                >
                  Forgot?
                </button>
              </div>
              <div className="relative">
                <Lock
                  size={16}
                  className="absolute left-3.5! top-1/2 -translate-y-1/2 text-[var(--muted)]"
                />
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="w-full! pl-10! pr-11! py-3! bg-white border border-[var(--line)] rounded-xl text-[var(--ink)] text-sm placeholder-gray-400 outline-none focus:border-[var(--violet)] focus:ring-2 focus:ring-[var(--violet-100)] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-3! top-1/2 -translate-y-1/2 p-1! text-[var(--muted)] hover:text-[var(--violet-700)] transition-colors"
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2! text-[13px] text-rose-600 bg-rose-50 border border-rose-100 rounded-xl px-3.5! py-2.5!">
                <Info size={15} className="shrink-0" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{ background: "var(--grad)" }}
              className="w-full! flex items-center justify-center gap-2! text-white text-[14px] font-semibold py-3! rounded-xl shadow-[0_10px_30px_rgba(124,58,237,0.3)] transition-transform hover:-translate-y-0.5 disabled:opacity-70 disabled:hover:translate-y-0"
            >
              {loading ? (
                <span className="w-4! h-4! border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Sign in <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Demo credentials helper */}
          <div className="mt-5! bg-[var(--violet-050)] border border-[var(--violet-100)] rounded-xl p-4!">
            <div className="flex items-center justify-between mb-2!">
              <span className="text-[12px] font-semibold text-[var(--violet-700)] flex items-center gap-1.5!">
                <Sparkles size={12} /> Demo credentials
              </span>
              <button
                onClick={fillDemo}
                className="text-[12px] font-semibold text-white px-2.5! py-1! rounded-lg"
                style={{ background: "var(--grad)" }}
              >
                Auto-fill
              </button>
            </div>
            <div className="text-[12.5px] text-[var(--slate)] font-mono space-y-0.5!">
              <div>
                Email: <span className="text-[var(--ink)]">{DEMO_EMAIL}</span>
              </div>
              <div>
                Password: <span className="text-[var(--ink)]">{DEMO_PASSWORD}</span>
              </div>
            </div>
          </div>

          <p className="text-[13px] text-[var(--slate)] text-center mt-6!">
            Don&apos;t have an account?{" "}
            <Link
              href="/dashboard"
              className="font-semibold text-[var(--violet-700)] hover:underline"
            >
              Start free trial
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}

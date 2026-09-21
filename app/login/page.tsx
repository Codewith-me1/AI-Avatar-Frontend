"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Sparkles,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Globe,
  Zap,
  Info,
} from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { getGoogleAuthUrl } from "@/lib/api/google";

type Mode = "login" | "register";

// Super admins default to the admin console; everyone else to the app.
const homeFor = (u?: { is_superuser?: boolean } | null) =>
  u?.is_superuser ? "/admin" : "/dashboard";

export default function LoginPage() {
  const router = useRouter();
  const { login, register, status, user } = useAuth();

  const [mode, setMode] = useState<Mode>("login");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // If already signed in, don't show the form — send them to their default home.
  useEffect(() => {
    if (status === "authenticated") router.replace(homeFor(user));
  }, [status, user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }
    if (mode === "register" && password.length < 10) {
      setError(
        "Password must be at least 10 characters, with an uppercase letter, a lowercase letter, and a digit.",
      );
      return;
    }

    setLoading(true);
    try {
      const signedIn =
        mode === "login"
          ? await login(email.trim(), password)
          : await register({
              email: email.trim(),
              password,
              full_name: fullName.trim() || undefined,
            });
      router.replace(homeFor(signedIn));
    } catch (err) {
      const msg = err instanceof Error ? err.message : "";
      // Lockout / rate-limit messages carry the wait time — show them verbatim
      // so the operator doesn't retry into a longer lockout.
      if (/too many|try again in|attempt/i.test(msg)) {
        setError(msg);
      } else if (mode === "login") {
        setError(
          /invalid|401|unauthor|credential|password/i.test(msg)
            ? "Invalid email or password."
            : msg || "Couldn't sign in. Please try again.",
        );
      } else {
        // Registration errors name the exact reason (policy, duplicate) — surface them.
        setError(msg || "Couldn't create your account. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (m: Mode) => {
    setMode(m);
    setError(null);
    setPassword("");
  };

  const [googleLoading, setGoogleLoading] = useState(false);
  const continueWithGoogle = async () => {
    setGoogleLoading(true);
    setError(null);
    try {
      const { authorization_url } = await getGoogleAuthUrl("login");
      window.location.href = authorization_url;
    } catch (err) {
      setGoogleLoading(false);
      setError(
        err instanceof Error && err.message
          ? err.message
          : "Google sign-in is unavailable right now.",
      );
    }
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
          <span className="font-display font-bold text-xl">avatarx</span>
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
          © 2026 avatarx
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
              avatarx
            </span>
          </Link>

          <span className="eyebrow mb-4!">
            <Lock size={11} /> {mode === "login" ? "Sign in" : "Create account"}
          </span>
          <h2 className="text-[26px] font-semibold text-[var(--ink)] tracking-tight mt-3! mb-1.5!">
            {mode === "login" ? "Welcome back" : "Get started"}
          </h2>
          <p className="text-[14px] text-[var(--slate)] mb-7!">
            {mode === "login"
              ? "Sign in to your workspace to manage your avatars."
              : "Create your workspace — it only takes a minute."}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4!" noValidate>
            {mode === "register" && (
              <div>
                <label className="block text-[13px] font-medium text-[var(--slate)] mb-1.5!">
                  Full name
                </label>
                <div className="relative">
                  <User
                    size={16}
                    className="absolute left-3.5! top-1/2 -translate-y-1/2 text-[var(--muted)]"
                  />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Jane Doe"
                    autoComplete="name"
                    className="w-full! pl-10! pr-4! py-3! bg-white border border-[var(--line)] rounded-xl text-[var(--ink)] text-sm placeholder-gray-400 outline-none focus:border-[var(--violet)] focus:ring-2 focus:ring-[var(--violet-100)] transition-all"
                  />
                </div>
              </div>
            )}

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
                {mode === "login" && (
                  <button
                    type="button"
                    className="text-[12px] font-medium text-[var(--violet-700)] hover:underline"
                  >
                    Forgot?
                  </button>
                )}
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
                  placeholder={mode === "register" ? "At least 10 characters" : "••••••••"}
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                  className="w-full! pl-10! pr-11! py-3! bg-white border border-[var(--line)] rounded-xl text-[var(--ink)] text-sm placeholder-gray-400 outline-none focus:border-[var(--violet)] focus:ring-2 focus:ring-[var(--violet-100)] transition-all"
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
                  {mode === "login" ? "Sign in" : "Create account"}
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3! my-5!">
            <span className="h-px flex-1 bg-[var(--line)]" />
            <span className="text-[12px] text-[var(--muted)]">or</span>
            <span className="h-px flex-1 bg-[var(--line)]" />
          </div>

          {/* Continue with Google */}
          <button
            type="button"
            onClick={continueWithGoogle}
            disabled={googleLoading}
            className="w-full! flex items-center justify-center gap-2.5! bg-white border border-[var(--line)] text-[var(--ink)] text-[14px] font-semibold py-3! rounded-xl hover:bg-[var(--line-soft)] transition-colors disabled:opacity-70"
          >
            {googleLoading ? (
              <span className="w-4! h-4! border-2 border-[var(--line)] border-t-[var(--violet)] rounded-full animate-spin" />
            ) : (
              <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
              </svg>
            )}
            Continue with Google
          </button>

          <p className="text-[13px] text-[var(--slate)] text-center mt-6!">
            {mode === "login" ? (
              <>
                Don&apos;t have an account?{" "}
                <button
                  onClick={() => switchMode("register")}
                  className="font-semibold text-[var(--violet-700)] hover:underline"
                >
                  Create one
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button
                  onClick={() => switchMode("login")}
                  className="font-semibold text-[var(--violet-700)] hover:underline"
                >
                  Sign in
                </button>
              </>
            )}
          </p>
        </motion.div>
      </div>
    </div>
  );
}

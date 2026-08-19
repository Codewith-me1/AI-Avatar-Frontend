"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Sparkles, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { completeGoogle } from "@/lib/api/google";

const homeFor = (u?: { is_superuser?: boolean } | null) =>
  u?.is_superuser ? "/admin" : "/dashboard";

type Phase = "working" | "ok" | "cancelled" | "error";

export default function GoogleCallbackPage() {
  const router = useRouter();
  const { adoptSession } = useAuth();
  const ran = useRef(false);
  const [phase, setPhase] = useState<Phase>("working");
  const [message, setMessage] = useState("Completing Google sign-in…");

  useEffect(() => {
    if (ran.current) return; // guard against double-invoke / re-render
    ran.current = true;

    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const state = params.get("state");
    const oauthError = params.get("error");

    // Strip code/state immediately — codes are single-use; a refresh must not replay.
    window.history.replaceState({}, "", "/auth/google/callback");

    if (oauthError) {
      setPhase("cancelled");
      setMessage(
        oauthError === "access_denied"
          ? "Google sign-in was cancelled."
          : `Google returned: ${oauthError}`,
      );
      return;
    }
    if (!code || !state) {
      setPhase("error");
      setMessage("Missing authorization code — please start again.");
      return;
    }

    completeGoogle(code, state)
      .then((data) => {
        if (data.purpose === "login") {
          if (data.user) adoptSession(data.user);
          setPhase("ok");
          setMessage(
            data.created_account
              ? "Account created — signing you in…"
              : "Signed in — redirecting…",
          );
          setTimeout(() => router.replace(homeFor(data.user)), 700);
        } else {
          // calendar
          setPhase("ok");
          const email = data.google?.google_email;
          setMessage(
            email ? `Calendar connected as ${email}.` : "Calendar connected.",
          );
          setTimeout(
            () => router.replace("/dashboard/settings?google=connected"),
            900,
          );
        }
      })
      .catch((e) => {
        setPhase("error");
        // Always render the server's detail verbatim.
        setMessage(e instanceof Error ? e.message : "Google sign-in failed.");
      });
  }, [router, adoptSession]);

  return (
    <div className="min-h-screen w-full! grid place-items-center bg-[var(--background)] p-6!">
      <div className="w-full! max-w-[420px]! text-center bg-white border border-[var(--line)] rounded-2xl shadow-[var(--shadow-md)] p-10!">
        <span
          className="w-12! h-12! rounded-xl grid place-items-center text-white mx-auto! mb-4!"
          style={{ background: "var(--grad)" }}
        >
          <Sparkles size={22} />
        </span>

        {phase === "working" && (
          <>
            <div className="w-8! h-8! border-2 border-[var(--line)] border-t-[var(--violet)] rounded-full animate-spin mx-auto! mb-4!" />
            <p className="text-[15px] font-semibold text-[var(--ink)]">{message}</p>
            <p className="text-[13px] text-[var(--muted)] mt-1!">One moment…</p>
          </>
        )}

        {phase === "ok" && (
          <>
            <CheckCircle2 size={28} className="text-emerald-500 mx-auto! mb-3!" />
            <p className="text-[15px] font-semibold text-[var(--ink)]">{message}</p>
          </>
        )}

        {(phase === "error" || phase === "cancelled") && (
          <>
            <AlertCircle
              size={28}
              className={`mx-auto! mb-3! ${phase === "cancelled" ? "text-amber-500" : "text-rose-500"}`}
            />
            <p className="text-[15px] font-semibold text-[var(--ink)]">
              {phase === "cancelled" ? "Sign-in cancelled" : "Something went wrong"}
            </p>
            <p className="text-[13px] text-[var(--muted)] mt-1! mb-6! break-words">
              {message}
            </p>
            <div className="flex items-center justify-center gap-2!">
              <Link
                href="/login"
                className="inline-flex items-center gap-2! text-white text-[13px] font-semibold px-5! py-2.5! rounded-xl"
                style={{ background: "var(--grad)" }}
              >
                <RefreshCw size={15} /> Back to sign in
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

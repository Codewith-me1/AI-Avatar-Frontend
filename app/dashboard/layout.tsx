"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import {
  LayoutDashboard,
  Users,
  UserCheck,
  BarChart3,
  MessageSquare,
  Settings,
  Sparkles,
  ArrowUpRight,
  Home,
  LogOut,
  Coins,
  Contact,
  Shield,
} from "lucide-react";
import { motion } from "framer-motion";
import {
  getPrimaryAgentId,
  getCreditBalance,
  type CreditBalance,
} from "@/lib/api/dashboard";

const NAV = [
  {
    heading: "Workspace",
    items: [
      { href: "/dashboard", label: "Overview", icon: <LayoutDashboard size={18} strokeWidth={2} /> },
      { href: "/dashboard/agents", label: "Agents", icon: <Users size={18} strokeWidth={2} /> },
      { href: "/dashboard/conversations", label: "Conversations", icon: <MessageSquare size={18} strokeWidth={2} /> },
      { href: "/dashboard/crm", label: "CRM", icon: <Contact size={18} strokeWidth={2} /> },
      { href: "/dashboard/users", label: "Users", icon: <UserCheck size={18} strokeWidth={2} /> },
      { href: "/dashboard/reports", label: "Reports", icon: <BarChart3 size={18} strokeWidth={2} /> },
    ],
  },
  {
    heading: "Account",
    items: [
      { href: "/dashboard/credits", label: "Credits", icon: <Coins size={18} strokeWidth={2} /> },
      { href: "/dashboard/settings", label: "Settings", icon: <Settings size={18} strokeWidth={2} /> },
      { href: "/", label: "Back to site", icon: <Home size={18} strokeWidth={2} /> },
    ],
  },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, status, logout } = useAuth();

  // Client-side guard (UX only — real protection is the backend requiring a
  // valid Bearer token on every request). Redirect once we know there's no
  // session.
  useEffect(() => {
    if (status === "unauthenticated") router.replace("/login");
  }, [status, router]);

  const handleLogout = () => {
    void logout();
  };

  // Best-effort real credit balance for the sidebar (account-scoped via the
  // first agent). Silent on failure — the sidebar just falls back to zeros.
  const [credits, setCredits] = useState<CreditBalance | null>(null);
  useEffect(() => {
    if (status !== "authenticated") return;
    let cancelled = false;
    (async () => {
      const id = await getPrimaryAgentId();
      if (!id || cancelled) return;
      try {
        const bal = await getCreditBalance(id);
        if (!cancelled) setCredits(bal);
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [status]);

  // Block render until the session is confirmed to avoid a flash of protected
  // content (and to keep child pages from firing API calls before we have a
  // token).
  if (status !== "authenticated") {
    return (
      <div className="min-h-screen w-full! grid place-items-center bg-[var(--background)]">
        <div className="flex flex-col items-center gap-3!">
          <div className="w-9! h-9! border-2 border-[var(--line)] border-t-[var(--violet)] rounded-full animate-spin" />
          <span className="text-sm text-[var(--muted)]">Loading your workspace…</span>
        </div>
      </div>
    );
  }

  const userEmail = user?.email || "";
  const displayName = user?.full_name || userEmail || "Account";
  const initial = (displayName[0] || "A").toUpperCase();

  return (
    <div className="min-h-screen flex bg-[var(--background)] text-[var(--foreground)]">
      {/* ── Sidebar ─────────────────────────────────────────── */}
      <nav className="w-[264px]! flex-shrink-0 bg-white border-r border-[var(--line)] flex flex-col h-screen sticky top-0 z-20">
        {/* Logo */}
        <div className="h-[72px]! flex items-center px-6! border-b border-[var(--line-soft)]">
          <Link href="/" className="flex items-center gap-2.5! group">
            <span
              className="w-9! h-9! rounded-xl grid place-items-center text-white shadow-sm transition-transform group-hover:scale-105"
              style={{ background: "var(--grad)" }}
            >
              <Sparkles size={18} />
            </span>
            <span className="font-display font-bold text-[17px] tracking-tight text-[var(--ink)]">
              AVAT<span className="font-medium text-[var(--slate)]"> Avatar</span>
            </span>
          </Link>
        </div>

        <div className="flex-1 overflow-y-auto px-3.5! py-6! space-y-7! no-scrollbar">
          {(user?.is_superuser
            ? [
                ...NAV,
                {
                  heading: "Admin",
                  items: [
                    {
                      href: "/admin",
                      label: "Admin console",
                      icon: <Shield size={18} strokeWidth={2} />,
                    },
                  ],
                },
              ]
            : NAV
          ).map((section) => (
            <div key={section.heading}>
              <p className="px-3! text-[10px] font-semibold text-[var(--muted)] uppercase tracking-[0.12em] mb-2.5!">
                {section.heading}
              </p>
              <div className="space-y-1!">
                {section.items.map((item) => (
                  <NavItem key={item.href} {...item} />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom: usage + profile */}
        <div className="p-3.5! border-t border-[var(--line-soft)] space-y-3!">
          <div className="rounded-2xl border border-[var(--line)] p-4! bg-[var(--violet-050)]">
            <div className="flex items-center justify-between mb-2!">
              <span className="text-xs font-semibold text-[var(--ink)]">Credits</span>
              <span className="text-[10px] font-bold text-[var(--violet-700)] bg-white border border-[var(--violet-100)] px-1.5! py-0.5! rounded-md">
                {credits ? `${Math.floor(credits.remaining_minutes)} min left` : "—"}
              </span>
            </div>
            <div className="h-1.5! w-full! rounded-full bg-white overflow-hidden mb-3!">
              <div
                className="h-full! rounded-full"
                style={{
                  width: `${
                    credits && credits.credits_minutes > 0
                      ? Math.min(
                          100,
                          (credits.credits_used_minutes / credits.credits_minutes) * 100,
                        )
                      : 0
                  }%`,
                  background: "var(--grad)",
                }}
              />
            </div>
            <Link
              href="/dashboard/credits"
              className="flex items-center justify-center gap-1.5! w-full! py-2! rounded-lg text-white text-xs font-semibold shadow-sm transition-transform hover:-translate-y-0.5"
              style={{ background: "var(--grad)" }}
            >
              Add credits <ArrowUpRight size={13} />
            </Link>
          </div>

          <div className="flex items-center justify-between p-2! rounded-xl hover:bg-[var(--line-soft)] transition-colors group">
            <div className="flex items-center gap-3! min-w-0">
              <div
                className="w-8! h-8! rounded-full grid place-items-center text-white text-xs font-semibold shrink-0"
                style={{ background: "var(--grad)" }}
              >
                {initial}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[13px] font-semibold text-[var(--ink)] leading-tight truncate">
                  {userEmail}
                </span>
                <span className="text-[11px] text-[var(--muted)] leading-tight">Free workspace</span>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Sign out"
              className="w-8! h-8! rounded-lg grid place-items-center text-[var(--muted)] hover:text-rose-600 hover:bg-rose-50 transition-colors shrink-0"
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </nav>

      {/* ── Main ────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col min-w-0 relative z-10 h-screen overflow-auto">
        {children}
      </main>
    </div>
  );
}

function NavItem({
  href,
  label,
  icon,
}: {
  href: string;
  label: string;
  icon: React.ReactNode;
}) {
  const pathname = usePathname();
  const isActive =
    href === "/"
      ? false
      : href === "/dashboard"
        ? pathname === "/dashboard"
        : pathname === href || pathname?.startsWith(href + "/") || pathname?.startsWith(href);

  return (
    <Link
      href={href}
      className={`relative px-3! py-2.5! rounded-xl text-[13.5px] flex items-center gap-3! transition-colors ${
        isActive
          ? "text-[var(--violet-700)] font-semibold bg-[var(--violet-050)]"
          : "text-[var(--slate)] hover:text-[var(--ink)] hover:bg-[var(--line-soft)] font-medium"
      }`}
    >
      {isActive && (
        <motion.span
          layoutId="nav-indicator"
          className="absolute left-0 top-1/2 -translate-y-1/2 w-1! h-5! rounded-r-full"
          style={{ background: "var(--grad)" }}
          transition={{ type: "spring", stiffness: 380, damping: 30 }}
        />
      )}
      <span className={isActive ? "text-[var(--violet-700)]" : "text-[var(--muted)]"}>
        {icon}
      </span>
      <span>{label}</span>
    </Link>
  );
}

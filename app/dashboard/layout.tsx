"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import {
  Home,
  BarChart3,
  Bot,
  BookOpen,
  Blocks,
  CircleUserRound,
  MessageSquare,
  Contact,
  UserCheck,
  LayoutGrid,
  Code2,
  Shield,
  Zap,
  LogOut,
  ChevronDown,
  ExternalLink,
} from "lucide-react";
import {
  getPrimaryAgentId,
  getCreditBalance,
  type CreditBalance,
} from "@/lib/api/dashboard";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? "https://avat.gigatechservices.org";

type NavLink = {
  href: string;
  label: string;
  icon: React.ReactNode;
  external?: boolean;
  /** Reachable, but the feature behind it is not finished yet. */
  soon?: boolean;
};

const NAV: { heading?: string; items: NavLink[] }[] = [
  {
    items: [
      { href: "/dashboard", label: "Home", icon: <Home size={18} strokeWidth={1.9} /> },
      { href: "/dashboard/reports", label: "Insights", icon: <BarChart3 size={18} strokeWidth={1.9} /> },
    ],
  },
  {
    heading: "Build",
    items: [
      { href: "/dashboard/agents", label: "Agents", icon: <Bot size={18} strokeWidth={1.9} /> },
      { href: "/dashboard/knowledge", label: "Knowledge", icon: <BookOpen size={18} strokeWidth={1.9} /> },
      { href: "/dashboard/tools", label: "Tools", icon: <Blocks size={18} strokeWidth={1.9} /> },
      { href: "/dashboard/avatars", label: "Avatars", icon: <CircleUserRound size={18} strokeWidth={1.9} />, soon: true },
    ],
  },
  {
    heading: "Workspace",
    items: [
      { href: "/dashboard/conversations", label: "Conversations", icon: <MessageSquare size={18} strokeWidth={1.9} /> },
      { href: "/dashboard/crm", label: "CRM", icon: <Contact size={18} strokeWidth={1.9} /> },
      { href: "/dashboard/users", label: "Users", icon: <UserCheck size={18} strokeWidth={1.9} /> },
    ],
  },
  {
    heading: "Connect",
    items: [
      { href: "/dashboard/settings", label: "Apps", icon: <LayoutGrid size={18} strokeWidth={1.9} /> },
      { href: `${API_BASE}/docs`, label: "API docs", icon: <Code2 size={18} strokeWidth={1.9} />, external: true },
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

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/login");
  }, [status, router]);

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

  const sections = user?.is_superuser
    ? [
        ...NAV,
        {
          heading: "Admin",
          items: [
            {
              href: "/admin",
              label: "Admin console",
              icon: <Shield size={18} strokeWidth={1.9} />,
            } as NavLink,
          ],
        },
      ]
    : NAV;

  return (
    <div className="min-h-screen flex bg-[var(--background)] text-[var(--foreground)]">
      {/* ── Sidebar ─────────────────────────────────────────── */}
      <nav className="w-[248px]! flex-shrink-0 bg-[var(--sidebar)] border-r border-[var(--line)] flex flex-col h-screen sticky top-0 z-20">
        {/* Brand + workspace switcher */}
        <div className="px-4! pt-5! pb-3!">
          <Link href="/" className="flex items-center gap-2.5! group mb-4! px-1!">
            <span
              className="w-8! h-8! rounded-lg grid place-items-center text-white shadow-sm transition-transform group-hover:scale-105"
              style={{ background: "var(--grad)" }}
            >
              <Zap size={16} fill="currentColor" />
            </span>
            <span className="font-display font-bold text-[16px] tracking-tight text-[var(--ink)]">
              avatarx
            </span>
          </Link>
          <div className="flex items-center justify-between gap-2! bg-white border border-[var(--line)] rounded-xl px-3! py-2! shadow-[var(--shadow-sm)]">
            <span className="flex items-center gap-2! min-w-0">
              <span
                className="w-6! h-6! rounded-md grid place-items-center text-white shrink-0"
                style={{ background: "var(--grad)" }}
              >
                <Bot size={13} />
              </span>
              <span className="text-[13.5px] font-semibold text-[var(--ink)] truncate">
                Agents
              </span>
            </span>
            <ChevronDown size={15} className="text-[var(--muted)] shrink-0" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-3! pb-4! space-y-5! no-scrollbar">
          {sections.map((section, si) => (
            <div key={section.heading || `top-${si}`}>
              {section.heading && (
                <p className="px-3! text-[10.5px] font-semibold text-[var(--muted)] uppercase tracking-[0.1em] mb-1.5!">
                  {section.heading}
                </p>
              )}
              <div className="space-y-0.5!">
                {section.items.map((item) => (
                  <NavItem key={item.href + item.label} {...item} />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom: upgrade + credits + profile */}
        <div className="p-3! border-t border-[var(--line)] space-y-2.5!">
          <Link
            href="/dashboard/credits"
            className="flex items-center justify-center gap-2! w-full! py-2.5! rounded-xl border border-[var(--orange)]/40 text-[var(--orange)] text-[13px] font-semibold hover:bg-[var(--orange)]/8 transition-colors"
          >
            <Zap size={15} fill="currentColor" /> Upgrade
            {credits && (
              <span className="text-[11px] font-medium text-[var(--muted)]">
                · {Math.floor(credits.remaining_minutes)}m left
              </span>
            )}
          </Link>

          <div className="flex items-center justify-between gap-2! p-1.5! rounded-xl hover:bg-[var(--sidebar-hover)] transition-colors group">
            <Link href="/dashboard/settings" className="flex items-center gap-2.5! min-w-0 flex-1">
              <div
                className="w-8! h-8! rounded-full grid place-items-center text-white text-xs font-semibold shrink-0"
                style={{ background: "var(--grad)" }}
              >
                {initial}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[13px] font-semibold text-[var(--ink)] leading-tight truncate">
                  {displayName}
                </span>
                <span className="text-[11px] text-[var(--muted)] leading-tight truncate">
                  {userEmail}
                </span>
              </div>
            </Link>
            <button
              onClick={() => void logout()}
              title="Sign out"
              className="w-8! h-8! rounded-lg grid place-items-center text-[var(--muted)] hover:text-rose-600 hover:bg-rose-50 transition-colors shrink-0"
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </nav>

      {/* ── Main ────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col min-w-0 relative z-10 h-screen overflow-auto bg-[var(--background)]">
        {children}
      </main>
    </div>
  );
}

function NavItem({ href, label, icon, external, soon }: NavLink) {
  const pathname = usePathname();
  const isActive =
    external || href === "/"
      ? false
      : href === "/dashboard"
        ? pathname === "/dashboard"
        : pathname === href || pathname?.startsWith(href + "/");

  const cls = `px-3! py-2! rounded-lg text-[13.5px] flex items-center gap-3! transition-colors ${
    isActive
      ? "text-[var(--ink)] font-semibold bg-[var(--sidebar-active)]"
      : "text-[var(--slate)] hover:text-[var(--ink)] hover:bg-[var(--sidebar-hover)] font-medium"
  }`;

  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>
        <span className="text-[var(--muted)]">{icon}</span>
        <span className="flex-1">{label}</span>
        <ExternalLink size={13} className="text-[var(--muted)]" />
      </a>
    );
  }

  return (
    <Link href={href} className={cls}>
      <span className={isActive ? "text-[var(--ink)]" : "text-[var(--muted)]"}>
        {icon}
      </span>
      <span>{label}</span>
      {soon && (
        <span className="ml-auto text-[9.5px] font-bold uppercase tracking-wide text-[var(--violet-700)] bg-[var(--violet-050)] border border-[var(--violet-100)] px-1.5! py-0.5! rounded">
          Soon
        </span>
      )}
    </Link>
  );
}

"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Shield,
  LayoutDashboard,
  Users,
  Bot,
  MessageSquare,
  LifeBuoy,
  ScrollText,
  Activity,
  ArrowLeft,
  LogOut,
} from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/components/auth/AuthProvider";

const NAV = [
  { href: "/admin", label: "Overview", icon: <LayoutDashboard size={18} strokeWidth={2} /> },
  { href: "/admin/users", label: "Users", icon: <Users size={18} strokeWidth={2} /> },
  { href: "/admin/agents", label: "Agents", icon: <Bot size={18} strokeWidth={2} /> },
  { href: "/admin/conversations", label: "Conversations", icon: <MessageSquare size={18} strokeWidth={2} /> },
  { href: "/admin/tickets", label: "Tickets", icon: <LifeBuoy size={18} strokeWidth={2} /> },
  { href: "/admin/audit", label: "Audit log", icon: <ScrollText size={18} strokeWidth={2} /> },
  { href: "/admin/health", label: "System health", icon: <Activity size={18} strokeWidth={2} /> },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, status, logout } = useAuth();

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/login");
  }, [status, router]);

  // Loading — session not resolved yet.
  if (status === "loading") {
    return (
      <div className="min-h-screen w-full! grid place-items-center bg-[#0b0b12]">
        <div className="w-9! h-9! border-2 border-white/15 border-t-amber-400 rounded-full animate-spin" />
      </div>
    );
  }
  if (status === "unauthenticated") return null;

  // Authenticated but not a superuser — clear "not admin" screen.
  if (!user?.is_superuser) {
    return (
      <div className="min-h-screen w-full! grid place-items-center bg-[#0b0b12] p-6! text-white">
        <div className="max-w-md! text-center bg-white/5 border border-white/10 rounded-2xl p-10!">
          <span className="w-12! h-12! rounded-xl grid place-items-center bg-rose-500/15 text-rose-400 mx-auto! mb-4!">
            <Shield size={24} />
          </span>
          <p className="text-[16px] font-semibold">Administrator privileges required</p>
          <p className="text-[13px] text-white/50 mt-1.5! mb-6!">
            This account is not an administrator. If that&apos;s unexpected, contact the platform owner.
          </p>
          <Link href="/dashboard" className="inline-flex items-center gap-2! text-[13px] font-semibold text-white bg-white/10 hover:bg-white/15 border border-white/10 px-5! py-2.5! rounded-xl transition-colors">
            <ArrowLeft size={15} /> Back to the app
          </Link>
        </div>
      </div>
    );
  }

  const initial = (user.full_name || user.email || "A")[0].toUpperCase();

  return (
    <div className="min-h-screen flex bg-[var(--background)] text-[var(--foreground)]">
      {/* ── Admin sidebar (distinct dark identity) ─────────────── */}
      <nav className="w-[260px]! shrink-0 bg-[#0f0f17] text-white flex flex-col h-screen sticky top-0 z-20 border-r border-white/5">
        <div className="h-[72px]! flex items-center px-6! border-b border-white/5">
          <div className="flex items-center gap-2.5!">
            <span className="w-9! h-9! rounded-xl grid place-items-center bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-lg">
              <Shield size={18} />
            </span>
            <div className="leading-tight">
              <p className="font-display font-bold text-[15px]">AVAT Admin</p>
              <p className="text-[10px] uppercase tracking-[0.14em] text-amber-400/80 font-semibold">Superuser</p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-3.5! py-6! no-scrollbar">
          <p className="px-3! text-[10px] font-semibold text-white/35 uppercase tracking-[0.12em] mb-2.5!">Console</p>
          <div className="space-y-1!">
            {NAV.map((item) => (
              <AdminNavItem key={item.href} {...item} />
            ))}
          </div>
        </div>

        {/* Bottom: back-to-app + profile */}
        <div className="p-3.5! border-t border-white/5 space-y-2!">
          <Link
            href="/dashboard"
            className="flex items-center gap-2.5! px-3! py-2.5! rounded-xl text-[13px] font-medium text-white/70 hover:text-white hover:bg-white/5 transition-colors"
          >
            <ArrowLeft size={16} /> Back to the app
          </Link>
          <div className="flex items-center justify-between p-2! rounded-xl hover:bg-white/5 transition-colors">
            <div className="flex items-center gap-3! min-w-0">
              <div className="w-8! h-8! rounded-full grid place-items-center text-white text-xs font-semibold shrink-0 bg-gradient-to-br from-amber-400 to-orange-500">
                {initial}
              </div>
              <div className="min-w-0">
                <p className="text-[13px] font-semibold truncate">{user.email}</p>
                <p className="text-[11px] text-white/40">Administrator</p>
              </div>
            </div>
            <button onClick={() => void logout()} title="Sign out" className="w-8! h-8! rounded-lg grid place-items-center text-white/50 hover:text-rose-400 hover:bg-rose-500/10 transition-colors shrink-0">
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </nav>

      {/* ── Content ─────────────────────────────────────────────── */}
      <main className="flex-1 min-w-0 h-screen overflow-auto">{children}</main>
    </div>
  );
}

function AdminNavItem({ href, label, icon }: { href: string; label: string; icon: React.ReactNode }) {
  const pathname = usePathname();
  const active = href === "/admin" ? pathname === "/admin" : pathname?.startsWith(href);
  return (
    <Link
      href={href}
      className={`relative px-3! py-2.5! rounded-xl text-[13.5px] flex items-center gap-3! transition-colors ${
        active ? "text-white bg-white/10 font-semibold" : "text-white/60 hover:text-white hover:bg-white/5 font-medium"
      }`}
    >
      {active && (
        <motion.span
          layoutId="admin-nav-indicator"
          className="absolute left-0 top-1/2 -translate-y-1/2 w-1! h-5! rounded-r-full bg-gradient-to-b from-amber-400 to-orange-500"
          transition={{ type: "spring", stiffness: 380, damping: 30 }}
        />
      )}
      <span className={active ? "text-amber-400" : "text-white/40"}>{icon}</span>
      <span>{label}</span>
    </Link>
  );
}

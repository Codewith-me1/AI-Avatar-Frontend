"use client";

/**
 * Shell for the public documentation pages (/doc and /api).
 *
 * Same light palette as the console and the landing page, with a sticky
 * section index that tracks scroll position. Code surfaces stay dark, matching
 * the embed-snippet block in the dashboard.
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowRight,
  BookOpen,
  Check,
  Code2,
  Copy,
  Info,
  Lightbulb,
  Scale,
} from "lucide-react";
import { Logo } from "@/components/brand/Logo";

export interface DocSection {
  id: string;
  label: string;
}

export type DocsPage = "doc" | "api" | "privacy" | "terms";

const PAGE_META: Record<
  DocsPage,
  { eyebrow: string; icon: React.ReactNode; otherHref: string; otherLabel: string }
> = {
  doc: {
    eyebrow: "Documentation",
    icon: <BookOpen size={11} />,
    otherHref: "/api",
    otherLabel: "API reference",
  },
  api: {
    eyebrow: "API reference",
    icon: <Code2 size={11} />,
    otherHref: "/doc",
    otherLabel: "Product guide",
  },
  privacy: {
    eyebrow: "Legal",
    icon: <Scale size={11} />,
    otherHref: "/terms",
    otherLabel: "Terms of Service",
  },
  terms: {
    eyebrow: "Legal",
    icon: <Scale size={11} />,
    otherHref: "/privacy",
    otherLabel: "Privacy Policy",
  },
};

export function DocsShell({
  page,
  title,
  intro,
  updated,
  sections,
  children,
}: {
  page: DocsPage;
  title: string;
  intro: string;
  /** e.g. "23 September 2026" — shown under the intro on legal pages. */
  updated?: string;
  sections: DocSection[];
  children: React.ReactNode;
}) {
  const meta = PAGE_META[page];
  const [active, setActive] = useState(sections[0]?.id ?? "");

  useEffect(() => {
    const seen = new Map<string, number>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          seen.set(e.target.id, e.intersectionRatio);
        }
        // The heading closest to the top that is on screen wins, so the index
        // does not flicker between two adjacent sections.
        const visible = sections
          .map((s) => ({ id: s.id, ratio: seen.get(s.id) ?? 0 }))
          .filter((s) => s.ratio > 0);
        if (visible.length) setActive(visible[0].id);
      },
      { rootMargin: "-80px 0px -70% 0px", threshold: [0, 0.25, 0.5, 1] },
    );
    for (const s of sections) {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [sections]);

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      {/* ── Top bar ─────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-[var(--line)]">
        <div className="max-w-[1180px] mx-auto! flex items-center gap-4! px-5! md:px-8! h-[62px]!">
          <Link href="/" className="flex items-center gap-2.5! shrink-0">
            <Logo size={30} priority />
            <span className="font-display font-bold text-[16px] tracking-tight text-[var(--ink)]">
              avatarx
            </span>
          </Link>

          <nav className="hidden sm:flex items-center gap-1! ml-3!">
            <TopLink href="/doc" active={page === "doc"}>
              <BookOpen size={14} /> Guide
            </TopLink>
            <TopLink href="/api" active={page === "api"}>
              <Code2 size={14} /> API
            </TopLink>
          </nav>

          <div className="ml-auto flex items-center gap-2!">
            <Link
              href="/login"
              className="hidden sm:inline text-[13px] font-semibold text-[var(--slate)] hover:text-[var(--ink)] px-3! py-2!"
            >
              Sign in
            </Link>
            <Link href="/dashboard" className="btn-dark px-4! py-2! text-[13px]">
              Dashboard <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-[1180px] mx-auto! px-5! md:px-8! grid grid-cols-1 lg:grid-cols-[232px_minmax(0,1fr)] gap-10! py-10! md:py-14!">
        {/* ── Section index ─────────────────────────────────────── */}
        <aside className="lg:sticky lg:top-[86px]! lg:self-start">
          <div className="lg:hidden flex gap-1.5! overflow-x-auto no-scrollbar pb-2! mb-2!">
            {sections.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className={`shrink-0 px-3! py-1.5! rounded-lg text-[12.5px] font-semibold whitespace-nowrap border transition-colors ${
                  active === s.id
                    ? "bg-[var(--ink)] text-white border-[var(--ink)]"
                    : "bg-white text-[var(--slate)] border-[var(--line)]"
                }`}
              >
                {s.label}
              </a>
            ))}
          </div>

          <p className="hidden lg:block text-[10.5px] font-semibold uppercase tracking-[0.14em] text-[var(--muted)] mb-3! px-3!">
            On this page
          </p>
          <nav className="hidden lg:flex flex-col gap-0.5!">
            {sections.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className={`px-3! py-1.5! rounded-lg text-[13px] transition-colors border-l-2 ${
                  active === s.id
                    ? "text-[var(--violet-700)] font-semibold border-[var(--violet)] bg-[var(--violet-050)]"
                    : "text-[var(--slate)] font-medium border-transparent hover:text-[var(--ink)] hover:bg-[var(--sidebar-hover)]"
                }`}
              >
                {s.label}
              </a>
            ))}
          </nav>
        </aside>

        {/* ── Content ───────────────────────────────────────────── */}
        <main className="min-w-0">
          <span className="eyebrow mb-3! inline-flex">
            {meta.icon}
            {meta.eyebrow}
          </span>
          <h1 className="font-display text-[34px] md:text-[40px] font-semibold tracking-tight text-[var(--ink)] leading-[1.08]">
            {title}
          </h1>
          <p className="text-[15px] text-[var(--slate)] mt-3! max-w-[680px]! leading-relaxed">
            {intro}
          </p>
          {updated && (
            <p className="text-[12.5px] text-[var(--muted)] mt-3!">
              Last updated {updated}
            </p>
          )}

          <div className="mt-10!">{children}</div>

          <div className="border-t border-[var(--line)] mt-16! pt-6! flex flex-wrap items-center gap-3! text-[13px] text-[var(--muted)]">
            <span>© 2026 avatarx</span>
            <Link href="/privacy" className="hover:text-[var(--ink)]">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-[var(--ink)]">
              Terms
            </Link>
            <Link
              href={meta.otherHref}
              className="ml-auto inline-flex items-center gap-1.5! font-semibold text-[var(--violet-700)] hover:text-[var(--violet-600)]"
            >
              {meta.otherLabel} <ArrowRight size={13} />
            </Link>
          </div>
        </main>
      </div>
    </div>
  );
}

function TopLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-1.5! px-3! py-2! rounded-lg text-[13px] font-semibold transition-colors ${
        active
          ? "text-[var(--violet-700)] bg-[var(--violet-050)]"
          : "text-[var(--slate)] hover:text-[var(--ink)] hover:bg-[var(--sidebar-hover)]"
      }`}
    >
      {children}
    </Link>
  );
}

// ── Content primitives ───────────────────────────────────────────────────────

export function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-[86px]! mb-14!">
      <h2 className="font-display text-[24px] font-semibold tracking-tight text-[var(--ink)] mb-4! pb-2! border-b border-[var(--line)]">
        {title}
      </h2>
      <div className="space-y-4!">{children}</div>
    </section>
  );
}

export function H3({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="font-display text-[16.5px] font-semibold text-[var(--ink)] mt-7! mb-2!">
      {children}
    </h3>
  );
}

export function P({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[14.5px] text-[var(--slate)] leading-[1.75]">{children}</p>
  );
}

export function UL({ children }: { children: React.ReactNode }) {
  return (
    <ul className="space-y-2! text-[14.5px] text-[var(--slate)] leading-[1.7]">
      {children}
    </ul>
  );
}

export function LI({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex gap-2.5!">
      <span className="mt-[9px]! w-1.5! h-1.5! rounded-full bg-[var(--violet)] shrink-0" />
      <span className="flex-1">{children}</span>
    </li>
  );
}

export function Steps({ items }: { items: { title: string; body: React.ReactNode }[] }) {
  return (
    <ol className="space-y-3!">
      {items.map((s, i) => (
        <li
          key={s.title}
          className="flex gap-3.5! bg-white border border-[var(--line)] rounded-xl p-4!"
        >
          <span
            className="w-7! h-7! rounded-lg grid place-items-center text-white text-[12.5px] font-bold shrink-0"
            style={{ background: "var(--grad)" }}
          >
            {i + 1}
          </span>
          <div className="min-w-0">
            <p className="text-[14px] font-semibold text-[var(--ink)]">{s.title}</p>
            <div className="text-[13.5px] text-[var(--slate)] mt-1! leading-relaxed">
              {s.body}
            </div>
          </div>
        </li>
      ))}
    </ol>
  );
}

export function Callout({
  kind = "info",
  title,
  children,
}: {
  kind?: "info" | "warn" | "tip";
  title?: string;
  children: React.ReactNode;
}) {
  const tone = {
    info: {
      cls: "bg-[var(--violet-050)] border-[var(--violet-100)] text-[var(--violet-700)]",
      icon: <Info size={15} />,
    },
    warn: {
      cls: "bg-amber-50 border-amber-200 text-amber-700",
      icon: <AlertCircle size={15} />,
    },
    tip: {
      cls: "bg-emerald-50 border-emerald-200 text-emerald-700",
      icon: <Lightbulb size={15} />,
    },
  }[kind];

  return (
    <div className={`flex items-start gap-3! border rounded-xl px-4! py-3.5! ${tone.cls}`}>
      <span className="shrink-0 mt-0.5!">{tone.icon}</span>
      <div className="text-[13.5px] text-[var(--slate)] leading-relaxed min-w-0">
        {title && (
          <p className="font-semibold text-[var(--ink)] mb-0.5!">{title}</p>
        )}
        {children}
      </div>
    </div>
  );
}

export function Code({
  children,
  label,
}: {
  children: string;
  label?: string;
}) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="rounded-xl overflow-hidden border border-[var(--line)] bg-[#141026] my-1!">
      <div className="flex items-center gap-2! px-4! py-2! border-b border-white/10">
        <span className="text-[11.5px] font-medium text-white/45">
          {label || "example"}
        </span>
        <button
          onClick={() => {
            navigator.clipboard.writeText(children);
            setCopied(true);
            setTimeout(() => setCopied(false), 1800);
          }}
          className="ml-auto inline-flex items-center gap-1.5! text-[11.5px] font-semibold text-white/55 hover:text-white transition-colors"
        >
          {copied ? <Check size={12} /> : <Copy size={12} />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="px-4! py-3.5! text-[12.5px] leading-[1.7] text-[#e2e8f0] overflow-x-auto whitespace-pre">
        {children}
      </pre>
    </div>
  );
}

/** Inline code. */
export function C({ children }: { children: React.ReactNode }) {
  return (
    <code className="text-[13px] font-mono text-[var(--violet-700)] bg-[var(--violet-050)] border border-[var(--violet-100)] rounded px-1.5! py-0.5!">
      {children}
    </code>
  );
}

const METHOD_TONE: Record<string, string> = {
  GET: "text-sky-700 bg-sky-50 border-sky-200",
  POST: "text-emerald-700 bg-emerald-50 border-emerald-200",
  PUT: "text-amber-700 bg-amber-50 border-amber-200",
  PATCH: "text-amber-700 bg-amber-50 border-amber-200",
  DELETE: "text-rose-700 bg-rose-50 border-rose-200",
};

export function Endpoints({
  rows,
}: {
  rows: { m: string; path: string; note: string }[];
}) {
  return (
    <div className="border border-[var(--line)] rounded-xl overflow-hidden bg-white">
      {rows.map((r) => (
        <div
          key={r.m + r.path}
          className="flex flex-wrap items-baseline gap-x-3! gap-y-1! px-4! py-3! border-b border-[var(--line)] last:border-0"
        >
          <span
            className={`text-[10.5px] font-bold px-1.5! py-0.5! rounded border shrink-0 ${
              METHOD_TONE[r.m] || "text-[var(--slate)] bg-[var(--line-soft)] border-[var(--line)]"
            }`}
          >
            {r.m}
          </span>
          <code className="text-[12.5px] font-mono text-[var(--ink)] break-all">
            {r.path}
          </code>
          <span className="text-[12.5px] text-[var(--muted)] w-full sm:w-auto sm:ml-auto sm:text-right">
            {r.note}
          </span>
        </div>
      ))}
    </div>
  );
}

export function Table({
  head,
  rows,
}: {
  head: string[];
  rows: React.ReactNode[][];
}) {
  return (
    <div className="border border-[var(--line)] rounded-xl overflow-hidden bg-white overflow-x-auto">
      <table className="w-full! text-left border-collapse">
        <thead>
          <tr className="bg-[var(--sidebar)]">
            {head.map((h) => (
              <th
                key={h}
                className="text-[11px] font-semibold uppercase tracking-wide text-[var(--muted)] px-4! py-2.5! whitespace-nowrap"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-t border-[var(--line)] align-top">
              {r.map((cell, j) => (
                <td
                  key={j}
                  className="text-[13.5px] text-[var(--slate)] px-4! py-3! leading-relaxed"
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

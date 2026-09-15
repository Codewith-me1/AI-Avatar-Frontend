"use client";

/**
 * Small layout primitives shared by the agent wizard, the agent settings page
 * and the Knowledge / Tools / Avatars pages, so the D-ID-style light theme
 * stays consistent: black `.btn-dark` CTAs, `.fld` inputs, hairline borders.
 */

import React from "react";
import { createPortal } from "react-dom";
import { Loader2, X } from "lucide-react";

export function SectionHead({ title, desc }: { title: string; desc?: string }) {
  return (
    <div className="mb-6!">
      <h2 className="text-[20px] font-semibold text-[var(--ink)] tracking-tight">
        {title}
      </h2>
      {desc && <p className="text-[13.5px] text-[var(--slate)] mt-1!">{desc}</p>}
    </div>
  );
}

export function Label({
  children,
  optional,
}: {
  children: React.ReactNode;
  optional?: boolean;
}) {
  return (
    <label className="block text-[13px] font-semibold text-[var(--ink)] mb-1.5!">
      {children}
      {optional && (
        <span className="text-[var(--muted)] font-normal"> (optional)</span>
      )}
    </label>
  );
}

export function Toggle({
  on,
  onChange,
  disabled,
}: {
  on: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onChange(!on)}
      className={`relative w-11! h-6! rounded-full transition-colors shrink-0 disabled:opacity-40 ${
        on ? "bg-[var(--ink)]" : "bg-[var(--line)]"
      }`}
    >
      <span
        className={`absolute top-0.5! left-0.5! w-5! h-5! rounded-full bg-white shadow transition-transform ${
          on ? "translate-x-5" : ""
        }`}
      />
    </button>
  );
}

export function Row({
  title,
  desc,
  children,
}: {
  title: string;
  desc?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4! bg-white border border-[var(--line)] rounded-xl px-4! py-3.5!">
      <div className="min-w-0">
        <p className="text-[13.5px] font-semibold text-[var(--ink)]">{title}</p>
        {desc && (
          <p className="text-[12px] text-[var(--muted)] mt-0.5!">{desc}</p>
        )}
      </div>
      {children}
    </div>
  );
}

export function Card({
  title,
  icon,
  action,
  children,
}: {
  title: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white border border-[var(--line)] rounded-2xl p-6! shadow-[var(--shadow-sm)]">
      <div className="flex items-center gap-2! mb-5!">
        {icon && <span className="text-[var(--violet-700)]">{icon}</span>}
        <h2 className="text-[15px] font-semibold text-[var(--ink)]">{title}</h2>
        {action && <span className="ml-auto">{action}</span>}
      </div>
      {children}
    </div>
  );
}

/** Chip list editor — topics to avoid, trigger keywords, starters. */
export function ChipInput({
  values,
  onChange,
  placeholder,
  max,
  maxLength,
}: {
  values: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
  max?: number;
  maxLength?: number;
}) {
  const [draft, setDraft] = React.useState("");
  const full = max !== undefined && values.length >= max;

  const add = () => {
    const text = draft.trim();
    if (!text || full) return;
    if (!values.some((v) => v.toLowerCase() === text.toLowerCase())) {
      onChange([...values, maxLength ? text.slice(0, maxLength) : text]);
    }
    setDraft("");
  };

  return (
    <div>
      <input
        value={draft}
        disabled={full}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            add();
          }
          if (e.key === "Backspace" && !draft && values.length) {
            onChange(values.slice(0, -1));
          }
        }}
        onBlur={add}
        placeholder={
          full ? `Maximum of ${max} reached` : placeholder || "Type and press Enter…"
        }
        className="fld px-3.5! py-2.5! disabled:bg-[var(--sidebar)]"
      />
      {values.length > 0 && (
        <div className="flex flex-wrap gap-2! mt-2.5!">
          {values.map((v) => (
            <span
              key={v}
              className="inline-flex items-center gap-1.5! text-[12px] font-medium text-[var(--slate)] bg-[var(--sidebar)] border border-[var(--line)] px-2.5! py-1! rounded-full"
            >
              {v}
              <button
                type="button"
                onClick={() => onChange(values.filter((x) => x !== v))}
                className="text-[var(--muted)] hover:text-red-600"
              >
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

/** 0→1 slider, labelled the way the reference console labels it. */
export function CreativitySlider({
  value,
  onChange,
  temperature,
}: {
  value: number;
  onChange: (v: number) => void;
  temperature?: number;
}) {
  return (
    <div className="bg-white border border-[var(--line)] rounded-xl p-4!">
      <div className="flex items-center gap-2! mb-3!">
        <span className="text-[13px] font-semibold text-[var(--ink)]">
          Creativity level
        </span>
        <span className="ml-auto text-[11.5px] font-medium text-[var(--muted)]">
          {Math.round(value * 100)}%
          {temperature !== undefined && ` · temp ${temperature.toFixed(2)}`}
        </span>
      </div>
      <input
        type="range"
        min={0}
        max={1}
        step={0.05}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full! accent-[var(--violet)]"
      />
      <div className="flex justify-between text-[11px] text-[var(--muted)] mt-1!">
        <span>More predictable answers</span>
        <span>More diverse answers</span>
      </div>
    </div>
  );
}

export function Spinner({ className }: { className?: string }) {
  return (
    <div
      className={`w-8! h-8! border-2 border-[var(--line)] border-t-[var(--violet)] rounded-full animate-spin ${className || ""}`}
    />
  );
}

export function Modal({
  title,
  desc,
  onClose,
  children,
  footer,
  wide,
}: {
  title: string;
  desc?: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  wide?: boolean;
}) {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return createPortal(
    <div className="fixed! inset-0! z-[9999] flex items-start justify-center overflow-y-auto bg-black/55 backdrop-blur-sm p-4! py-10!">
      <div
        className={`w-full ${wide ? "max-w-3xl!" : "max-w-lg!"} bg-white rounded-2xl shadow-2xl ring-1 ring-black/5 overflow-hidden`}
      >
        <div className="flex items-start gap-4! border-b border-[var(--line)] px-6! py-5!">
          <div className="min-w-0 flex-1">
            <h3 className="text-[16px] font-semibold text-[var(--ink)]">
              {title}
            </h3>
            {desc && (
              <p className="text-[13px] text-[var(--slate)] mt-1!">{desc}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-8! h-8! grid place-items-center rounded-lg text-[var(--muted)] hover:bg-[var(--sidebar-hover)] hover:text-[var(--ink)] transition-colors shrink-0"
          >
            <X size={16} />
          </button>
        </div>
        <div className="px-6! py-5!">{children}</div>
        {footer && (
          <div className="flex justify-end gap-3! bg-[var(--sidebar)] px-6! py-4!">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}

export function PrimaryButton({
  children,
  loading,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { loading?: boolean }) {
  return (
    <button
      {...rest}
      disabled={rest.disabled || loading}
      className={`btn-dark px-4! py-2.5! text-[13.5px] disabled:opacity-50 ${rest.className || ""}`}
    >
      {loading && <Loader2 size={14} className="animate-spin" />}
      {children}
    </button>
  );
}

export function GhostButton({
  children,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...rest}
      className={`inline-flex items-center gap-2! rounded-lg border border-[var(--line)] bg-white px-4! py-2.5! text-[13px] font-semibold text-[var(--slate)] hover:bg-[var(--sidebar-hover)] transition-colors disabled:opacity-50 ${rest.className || ""}`}
    >
      {children}
    </button>
  );
}

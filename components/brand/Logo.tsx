"use client";

/**
 * The avatarx mark — one definition, used by every shell (landing nav and
 * footer, dashboard sidebar, login, admin).
 *
 * The source file is a 2000×2000 master, so it always goes through next/image:
 * the optimizer serves a correctly-sized WebP instead of shipping ~900 KB to
 * render a 32px tile. The artwork has its own gradient on a transparent
 * background, so it needs no coloured plate behind it on a light surface —
 * `plate` is there for the one place it sits on the brand gradient (login).
 */

import Image from "next/image";

export function Logo({
  size = 32,
  priority = false,
  plate = false,
  className = "",
}: {
  size?: number;
  /** Set on above-the-fold marks so the tab icon doesn't pop in late. */
  priority?: boolean;
  /** White rounded plate — for use on top of the brand gradient. */
  plate?: boolean;
  className?: string;
}) {
  const img = (
    <Image
      src="/logo/logo.png"
      alt="avatarx"
      width={size}
      height={size}
      priority={priority}
      className={plate ? "" : className}
      style={{ width: size, height: size, objectFit: "contain" }}
    />
  );

  if (!plate) return img;

  return (
    <span
      className={`grid place-items-center rounded-xl bg-white shadow-sm ${className}`}
      style={{ width: size + 14, height: size + 14 }}
    >
      {img}
    </span>
  );
}

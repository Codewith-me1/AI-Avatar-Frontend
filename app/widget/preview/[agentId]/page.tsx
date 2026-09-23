"use client";

/**
 * Widget preview host — a stand-in for a customer's website.
 *
 * This page loads the REAL `/components/widget/widget.js` with the same
 * `window.VoiceAgentConfig` an embed snippet sets. Nothing here re-implements
 * the widget: the launcher, the call controls, the chat panel, media cards,
 * conversation starters and the end-of-call screen are whatever that script
 * does today, so the sandbox cannot drift from what visitors actually get.
 *
 * The sandbox (/dashboard/agents/[id]/test) frames this page in an iframe,
 * which keeps the floating, fixed-position widget out of the dashboard's own
 * layout and makes it disposable — reloading the frame is a clean restart.
 */

import { use, useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    VoiceAgentConfig?: {
      agentId: string;
      apiUrl: string;
      bannerTitle?: string;
      bannerCaption?: string;
      idleVideoUrl?: string;
    };
  }
}

const SCRIPT_ID = "va-widget-script";

export default function WidgetPreviewPage({
  params,
}: {
  params: Promise<{ agentId: string }>;
}) {
  const { agentId } = use(params);
  const injected = useRef(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || injected.current) return;
    // React runs effects twice in development; a second copy of the script
    // would append a second floating widget to the page.
    if (document.getElementById(SCRIPT_ID)) return;
    injected.current = true;

    window.VoiceAgentConfig = {
      agentId,
      // The widget builds its inner iframe as `${apiUrl}/widget/${agentId}`,
      // which this app serves, so the preview must point at its own origin.
      apiUrl: window.location.origin,
    };

    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.src = "/components/widget/widget.js";
    script.async = true;
    script.onerror = () => setFailed(true);
    document.body.appendChild(script);
  }, [agentId]);

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)] select-none">
      {/* A plausible page for the widget to sit on. Deliberately inert and
          unbranded — it exists so the floating launcher has context. */}
      <div className="border-b border-[var(--line)] bg-white">
        <div className="max-w-[880px] mx-auto! flex items-center gap-3! px-6! py-4!">
          <span className="w-7! h-7! rounded-lg bg-[var(--line-soft)]" />
          <span className="w-28! h-3! rounded-full bg-[var(--line-soft)]" />
          <span className="ml-auto flex gap-2!">
            <span className="w-14! h-3! rounded-full bg-[var(--line-soft)]" />
            <span className="w-14! h-3! rounded-full bg-[var(--line-soft)]" />
            <span className="w-20! h-6! rounded-lg bg-[var(--line-soft)]" />
          </span>
        </div>
      </div>

      <div className="max-w-[880px] mx-auto! px-6! py-12!">
        <p className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-[var(--muted)] mb-4!">
          Preview site
        </p>
        <div className="space-y-3! max-w-[520px]!">
          <span className="block w-full! h-7! rounded-lg bg-[var(--line-soft)]" />
          <span className="block w-4/5! h-7! rounded-lg bg-[var(--line-soft)]" />
          <span className="block w-2/3! h-4! rounded-lg bg-[var(--line-soft)] mt-6!" />
          <span className="block w-3/4! h-4! rounded-lg bg-[var(--line-soft)]" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4! mt-10!">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-28! rounded-2xl border border-[var(--line)] bg-white"
            />
          ))}
        </div>

        {failed && (
          <p className="mt-10! text-[13px] text-red-600 bg-red-50 border border-red-200 rounded-xl px-4! py-3!">
            The widget script could not be loaded from
            <code className="mx-1!">/components/widget/widget.js</code>.
          </p>
        )}
      </div>
    </main>
  );
}

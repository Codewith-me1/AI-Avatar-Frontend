"use client";

/**
 * The avatarx agent embedded on avatarx.net itself — the same widget customers
 * paste onto their own sites, pointed at our demo agent.
 *
 * Rendered last in the landing page tree and injected into <body>, so it lands
 * where the hand-written snippet would: immediately before </body>.
 */

import { useEffect } from "react";
import { mountWidget } from "@/lib/widget-embed";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://avatarx.net";

export function SiteWidget({ agentId }: { agentId: string }) {
  useEffect(() => {
    if (!agentId) return;
    return mountWidget({ agentId, apiUrl: API_URL }, "va-site-widget");
  }, [agentId]);

  return null;
}

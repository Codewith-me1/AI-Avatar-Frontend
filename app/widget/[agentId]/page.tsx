"use client";

/**
 * Embedded widget page (loaded in the iframe by public/components/widget/widget.js).
 *
 * The public config endpoint is the agent's own settings — name, greeting,
 * conversation starters, media, camera flag — so the embedded widget follows
 * whatever the owner last saved without needing a redeploy. Only this page
 * knows the API origin, so it fetches the config and relays it to the parent
 * widget, which owns the chat panel.
 */

import { use, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AlertTriangle } from "lucide-react";
import { apiClient } from "@/lib/api/client";
import { ConversationView } from "../conversationview";
import type { WidgetPublicConfig } from "@/types";

interface PageProps {
  params: Promise<{ agentId: string }>;
}

export default function WidgetEmbedPage({ params }: PageProps) {
  const { agentId } = use(params);
  const searchParams = useSearchParams();

  const roomName = searchParams.get("room");
  const userIdentity = searchParams.get("identity");

  const [config, setConfig] = useState<WidgetPublicConfig | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [session] = useState(() => ({
    room:
      roomName && roomName !== "undefined"
        ? roomName
        : `room_${agentId}_${Date.now()}`,
    identity:
      userIdentity && userIdentity !== "undefined"
        ? userIdentity
        : `user_${Math.random().toString(36).substring(7)}`,
  }));

  useEffect(() => {
    let alive = true;
    apiClient
      .get<WidgetPublicConfig>(`/api/widget/${agentId}/config`)
      .then((data) => {
        if (!alive) return;
        setConfig(data);
        // Hand the parent widget what it needs for the chat panel: the agent's
        // name, its starters, and any media marked to show from the start.
        try {
          window.parent.postMessage(
            {
              type: "VOICE_AGENT_CONFIG",
              name: data.name,
              greeting: data.greeting || null,
              starters: data.conversation_starters || [],
              enableCamera: data.enable_camera,
              feedbackScreen: data.feedback_screen,
              media: (data.media || []).map((m) => ({
                ...m,
                url: apiClient.absoluteUrl(m.url),
              })),
            },
            "*",
          );
        } catch {
          /* not embedded — nothing to relay to */
        }
      })
      .catch((e) => {
        if (!alive) return;
        // A non-public or deleted agent is the common case here, and it must
        // not look like a connection glitch.
        setError(
          e instanceof Error
            ? e.message
            : "This assistant is not available right now.",
        );
      });
    return () => {
      alive = false;
    };
  }, [agentId]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-3! p-6! text-center bg-[#11141a] text-white/70">
        <AlertTriangle size={22} className="text-amber-400" />
        <p className="text-[13px] font-semibold text-white">
          Assistant unavailable
        </p>
        <p className="text-[11.5px] max-w-[260px]!">{error}</p>
      </div>
    );
  }

  if (!config) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-3! bg-[#11141a] text-white/60">
        <div className="w-7! h-7! border-2 border-white/20 border-t-cyan-400 rounded-full animate-spin" />
        <span className="text-[11.5px] font-semibold">Connecting…</span>
      </div>
    );
  }

  return (
    <div className="w-screen h-screen overflow-hidden">
      <ConversationView
        agent={{
          id: config.agent_id,
          name: config.name,
          avatar_id: config.avatar_id || undefined,
          musetalk_avatar_id: config.musetalk_avatar_id || undefined,
          language: config.language,
        }}
        roomName={session.room}
        userIdentity={session.identity}
      />
    </div>
  );
}

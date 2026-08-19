"use client";

import { ConversationsSection } from "@/components/admin/sections";

export default function AdminConversationsPage() {
  return (
    <div className="p-8! md:p-10!">
      <div className="max-w-[1400px] mx-auto!">
        <div className="mb-6!">
          <h1 className="text-[26px] font-semibold text-[var(--ink)] tracking-tight">Conversations</h1>
          <p className="text-sm text-[var(--slate)] mt-1!">
            What&apos;s running right now across the platform, plus history.
          </p>
        </div>
        <ConversationsSection />
      </div>
    </div>
  );
}

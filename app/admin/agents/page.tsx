"use client";

import { AgentsSection } from "@/components/admin/sections";

export default function AdminAgentsPage() {
  return (
    <div className="p-8! md:p-10!">
      <div className="max-w-[1400px] mx-auto!">
        <div className="mb-6!">
          <h1 className="text-[26px] font-semibold text-[var(--ink)] tracking-tight">Agents</h1>
          <p className="text-sm text-[var(--slate)] mt-1!">
            Every agent across all accounts, with capabilities and owners.
          </p>
        </div>
        <AgentsSection />
      </div>
    </div>
  );
}

"use client";

import { TicketsSection } from "@/components/admin/sections";

export default function AdminTicketsPage() {
  return (
    <div className="p-8! md:p-10!">
      <div className="max-w-[1400px] mx-auto!">
        <div className="mb-6!">
          <h1 className="text-[26px] font-semibold text-[var(--ink)] tracking-tight">Support tickets</h1>
          <p className="text-sm text-[var(--slate)] mt-1!">
            The operator queue — reply, assign, and manage internal notes.
          </p>
        </div>
        <TicketsSection />
      </div>
    </div>
  );
}

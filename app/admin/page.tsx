"use client";

import { OverviewSection } from "@/components/admin/sections";

export default function AdminOverviewPage() {
  return (
    <div className="p-8! md:p-10!">
      <div className="max-w-[1400px] mx-auto!">
        <div className="mb-6!">
          <h1 className="text-[26px] font-semibold text-[var(--ink)] tracking-tight">Overview</h1>
          <p className="text-sm text-[var(--slate)] mt-1!">
            Platform at a glance — users, usage, sales, and health.
          </p>
        </div>
        <OverviewSection />
      </div>
    </div>
  );
}

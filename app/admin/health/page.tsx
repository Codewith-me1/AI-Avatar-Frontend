"use client";

import { HealthSection } from "@/components/admin/sections";

export default function AdminHealthPage() {
  return (
    <div className="p-8! md:p-10!">
      <div className="max-w-[1400px] mx-auto!">
        <div className="mb-6!">
          <h1 className="text-[26px] font-semibold text-[var(--ink)] tracking-tight">System health</h1>
          <p className="text-sm text-[var(--slate)] mt-1!">
            Live dependency checks — database, Redis, workers, storage.
          </p>
        </div>
        <HealthSection />
      </div>
    </div>
  );
}

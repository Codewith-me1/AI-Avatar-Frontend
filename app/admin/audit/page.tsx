"use client";

import { AuditSection } from "@/components/admin/sections";

export default function AdminAuditPage() {
  return (
    <div className="p-8! md:p-10!">
      <div className="max-w-[1400px] mx-auto!">
        <div className="mb-6!">
          <h1 className="text-[26px] font-semibold text-[var(--ink)] tracking-tight">Audit log</h1>
          <p className="text-sm text-[var(--slate)] mt-1!">
            Security events — sign-ins, admin actions, and failures.
          </p>
        </div>
        <AuditSection />
      </div>
    </div>
  );
}

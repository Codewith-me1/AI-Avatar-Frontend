"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// The admin console moved to its own /admin shell — send legacy links there.
export default function DashboardAdminRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/admin");
  }, [router]);
  return (
    <div className="min-h-full grid place-items-center">
      <div className="w-8! h-8! border-2 border-[var(--line)] border-t-[var(--violet)] rounded-full animate-spin" />
    </div>
  );
}

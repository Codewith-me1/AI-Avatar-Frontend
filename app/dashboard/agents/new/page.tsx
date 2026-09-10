"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// The create flow now lives as a full-screen wizard on the Agents page.
export default function NewAgentRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/dashboard/agents?new=1");
  }, [router]);

  return (
    <div className="min-h-full grid place-items-center p-8!">
      <div className="w-8! h-8! border-2 border-[var(--line)] border-t-[var(--violet)] rounded-full animate-spin" />
    </div>
  );
}

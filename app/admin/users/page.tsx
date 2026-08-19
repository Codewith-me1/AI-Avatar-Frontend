"use client";

import { UsersSection } from "@/components/admin/sections";
import { useAuth } from "@/components/auth/AuthProvider";

export default function AdminUsersPage() {
  const { user } = useAuth();
  return (
    <div className="p-8! md:p-10!">
      <div className="max-w-[1400px] mx-auto!">
        <div className="mb-6!">
          <h1 className="text-[26px] font-semibold text-[var(--ink)] tracking-tight">Users</h1>
          <p className="text-sm text-[var(--slate)] mt-1!">
            Every account — search, create, suspend, adjust credits, or remove.
          </p>
        </div>
        <UsersSection currentUserId={user?.id || ""} />
      </div>
    </div>
  );
}

"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { apiClient } from "@/lib/api/client";
import type { AuthUser, RegisterInput } from "@/types";

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

interface AuthContextValue {
  user: AuthUser | null;
  status: AuthStatus;
  login: (email: string, password: string) => Promise<AuthUser>;
  register: (payload: RegisterInput) => Promise<AuthUser>;
  logout: () => Promise<void>;
  updateUser: (patch: Partial<AuthUser>) => void;
  /** Adopt a session established out-of-band (e.g. Google OAuth callback). */
  adoptSession: (user: AuthUser) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  // The embeddable widget must stay fully public — never probe/attach auth there.
  const isPublicEmbed = !!pathname && pathname.startsWith("/widget");
  const [user, setUser] = useState<AuthUser | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");

  const forceSignOut = useCallback(() => {
    setUser(null);
    setStatus("unauthenticated");
  }, []);

  // Bootstrap: restore the session from the HttpOnly cookie via /me.
  useEffect(() => {
    if (isPublicEmbed) {
      setStatus("unauthenticated");
      return;
    }
    let cancelled = false;
    apiClient.setAuthFailureHandler(() => {
      if (!cancelled) {
        forceSignOut();
        router.replace("/login");
      }
    });

    apiClient
      .me()
      .then((u) => {
        if (cancelled) return;
        setUser(u);
        setStatus("authenticated");
      })
      .catch(() => {
        if (!cancelled) setStatus("unauthenticated");
      });

    return () => {
      cancelled = true;
      apiClient.setAuthFailureHandler(null);
    };
  }, [forceSignOut, router, isPublicEmbed]);

  const login = useCallback(async (email: string, password: string) => {
    const data = await apiClient.login(email, password);
    setUser(data.user);
    setStatus("authenticated");
    return data.user;
  }, []);

  const register = useCallback(async (payload: RegisterInput) => {
    // Session auth: register creates the account, then we sign in to start a session.
    await apiClient.register(payload);
    const data = await apiClient.login(payload.email, payload.password);
    setUser(data.user);
    setStatus("authenticated");
    return data.user;
  }, []);

  const logout = useCallback(async () => {
    await apiClient.logout();
    setUser(null);
    setStatus("unauthenticated");
    router.replace("/login");
  }, [router]);

  // Merge a local patch into the current user (e.g. after editing the profile
  // in Settings) so the UI reflects it immediately for the session.
  const updateUser = useCallback((patch: Partial<AuthUser>) => {
    setUser((u) => (u ? { ...u, ...patch } : u));
  }, []);

  const adoptSession = useCallback((u: AuthUser) => {
    setUser(u);
    setStatus("authenticated");
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, status, login, register, logout, updateUser, adoptSession }}
    >
      {children}
    </AuthContext.Provider>
  );
}

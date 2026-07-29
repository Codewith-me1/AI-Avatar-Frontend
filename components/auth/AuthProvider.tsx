"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { apiClient } from "@/lib/api/client";
import type { AuthResponse, AuthUser, RegisterInput } from "@/types";

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

interface AuthContextValue {
  user: AuthUser | null;
  status: AuthStatus;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: RegisterInput) => Promise<void>;
  logout: () => Promise<void>;
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
  const refreshTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = useCallback(() => {
    if (refreshTimer.current) {
      clearTimeout(refreshTimer.current);
      refreshTimer.current = null;
    }
  }, []);

  // Proactively refresh shortly before the access token expires so an active
  // user never hits a 401 mid-action.
  const scheduleRefresh = useCallback(
    (expiresInSeconds?: number) => {
      clearTimer();
      const ttl = expiresInSeconds && expiresInSeconds > 0 ? expiresInSeconds : 900;
      const delayMs = Math.max(15, ttl - 60) * 1000; // 60s early, floor 15s
      refreshTimer.current = setTimeout(async () => {
        const data = await apiClient.refresh();
        if (data?.access_token) {
          setUser(data.user);
          scheduleRefresh(data.expires_in);
        } else {
          setUser(null);
          setStatus("unauthenticated");
        }
      }, delayMs);
    },
    [clearTimer],
  );

  const applySession = useCallback(
    (data: AuthResponse) => {
      apiClient.setAccessToken(data.access_token);
      setUser(data.user);
      setStatus("authenticated");
      scheduleRefresh(data.expires_in);
    },
    [scheduleRefresh],
  );

  const forceSignOut = useCallback(() => {
    clearTimer();
    apiClient.setAccessToken(null);
    setUser(null);
    setStatus("unauthenticated");
  }, [clearTimer]);

  // Bootstrap: try to restore a session from the httpOnly refresh cookie.
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
      .refresh()
      .then((data) => {
        if (cancelled) return;
        if (data?.access_token) applySession(data);
        else setStatus("unauthenticated");
      })
      .catch(() => {
        if (!cancelled) setStatus("unauthenticated");
      });

    return () => {
      cancelled = true;
      apiClient.setAuthFailureHandler(null);
      clearTimer();
    };
  }, [applySession, forceSignOut, clearTimer, router, isPublicEmbed]);

  const login = useCallback(
    async (email: string, password: string) => {
      const data = await apiClient.login(email, password);
      applySession(data);
    },
    [applySession],
  );

  const register = useCallback(
    async (payload: RegisterInput) => {
      const data = await apiClient.register(payload);
      // Backend auto-logs-in on register (returns an access token).
      if (data?.access_token) applySession(data);
    },
    [applySession],
  );

  const logout = useCallback(async () => {
    clearTimer();
    await apiClient.logout();
    setUser(null);
    setStatus("unauthenticated");
    router.replace("/login");
  }, [clearTimer, router]);

  return (
    <AuthContext.Provider value={{ user, status, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

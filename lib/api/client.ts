import type {
  AuthResponse,
  AuthUser,
  RegisterInput,
  UserSessionInfo,
} from "@/types";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "https://avat.gigatechservices.org";

/**
 * Security model — server-side sessions
 * ─────────────────────────────────────
 * - Login sets an HttpOnly, Secure `session_id` cookie (the primary credential,
 *   invisible to JS) AND returns the session_id in the body.
 * - Every request uses `credentials: "include"` so the cookie rides along.
 * - We also keep the session_id in module MEMORY (never localStorage) and send it
 *   as `Authorization: Bearer` — a fallback for cross-site setups where a
 *   third-party cookie may be blocked. The backend accepts either.
 * - Sessions are server-side, so there is NO refresh flow. On a 401 we drop the
 *   in-memory token and tell the app to sign out (the server can revoke instantly).
 */
let accessToken: string | null = null;
let authFailureHandler: (() => void) | null = null;

// FastAPI returns `{ detail }` where detail is a string OR (on 422 validation)
// an array of `{ loc, msg, ... }`. Render both shapes into one message.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractDetail(body: any): string | null {
  if (!body) return null;
  const d = body.detail ?? body.message;
  if (typeof d === "string") return d;
  if (Array.isArray(d)) {
    return (
      d
        .map((e) =>
          typeof e === "string" ? e : e?.msg || JSON.stringify(e),
        )
        .join("; ") || null
    );
  }
  return typeof body.message === "string" ? body.message : null;
}

const AUTH_PATHS = [
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/me",
  "/api/auth/logout",
  "/api/auth/google",
];

class ApiClient {
  private defaultBaseUrl: string;

  constructor(baseUrl: string) {
    this.defaultBaseUrl = baseUrl;
  }

  private get baseUrl(): string {
    if (typeof window !== "undefined") {
      return (
        localStorage.getItem("voice_agent_server_url") || this.defaultBaseUrl
      );
    }
    return this.defaultBaseUrl;
  }

  // ── Token management (in-memory only) ───────────────────────────────────────
  setAccessToken(token: string | null) {
    accessToken = token;
  }
  getAccessToken(): string | null {
    return accessToken;
  }
  /** Legacy alias kept for callers that used setToken(). */
  setToken(token: string | null) {
    accessToken = token;
  }
  /** Registered by the AuthProvider so a failed refresh can force a sign-out. */
  setAuthFailureHandler(fn: (() => void) | null) {
    authFailureHandler = fn;
  }

  private buildHeaders(
    extra?: HeadersInit,
    isForm = false,
  ): Record<string, string> {
    const h: Record<string, string> = { ...(extra as Record<string, string>) };
    if (!isForm && !h["Content-Type"]) h["Content-Type"] = "application/json";
    if (accessToken) h["Authorization"] = `Bearer ${accessToken}`;
    return h;
  }

  private isAuthPath(path: string): boolean {
    return AUTH_PATHS.some((p) => path.startsWith(p));
  }

  // ── Core request (cookie + Bearer fallback; 401 → sign out) ─────────────────
  private async request<T>(
    path: string,
    init: RequestInit,
    opts: { isForm?: boolean; allowRetry?: boolean } = {},
  ): Promise<T> {
    const isForm = !!opts.isForm;
    const allowRetry = opts.allowRetry !== false;

    const res = await fetch(`${this.baseUrl}${path}`, {
      ...init,
      credentials: "include",
      headers: this.buildHeaders(init.headers, isForm),
    });

    if (res.status === 401 && allowRetry && !this.isAuthPath(path)) {
      // Server-side sessions can be revoked instantly — nothing to refresh.
      accessToken = null;
      authFailureHandler?.();
      throw new Error("Unauthorized");
    }

    if (!res.ok) {
      const body = await res.json().catch(() => null);
      throw new Error(
        extractDetail(body) ??
          `${init.method ?? "GET"} ${path} failed: ${res.status}`,
      );
    }
    if (res.status === 204) return undefined as T;
    return res.json();
  }

  // ── Generic verbs ───────────────────────────────────────────────────────────
  get<T>(path: string): Promise<T> {
    return this.request<T>(path, { method: "GET" });
  }
  post<T>(path: string, body: unknown): Promise<T> {
    return this.request<T>(path, { method: "POST", body: JSON.stringify(body) });
  }
  patch<T>(path: string, body: unknown): Promise<T> {
    return this.request<T>(path, {
      method: "PATCH",
      body: JSON.stringify(body),
    });
  }
  put<T>(path: string, body: unknown): Promise<T> {
    return this.request<T>(path, { method: "PUT", body: JSON.stringify(body) });
  }
  /** Authenticated binary GET (e.g. CSV export) → Blob. */
  async getBlob(path: string): Promise<Blob> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      credentials: "include",
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
    });
    if (!res.ok) throw new Error(`GET ${path} failed: ${res.status}`);
    return res.blob();
  }
  delete(path: string): Promise<void> {
    return this.request<void>(path, { method: "DELETE" });
  }
  upload<T>(path: string, formData: FormData): Promise<T> {
    return this.request<T>(path, { method: "POST", body: formData }, { isForm: true });
  }
  postForm<T>(path: string, formData: FormData): Promise<T> {
    return this.request<T>(path, { method: "POST", body: formData }, { isForm: true });
  }

  // ── Auth flows (server-side sessions) ───────────────────────────────────────
  async login(email: string, password: string): Promise<AuthResponse> {
    const data = await this.request<AuthResponse>(
      "/api/auth/login",
      { method: "POST", body: JSON.stringify({ email, password }) },
      { allowRetry: false },
    );
    accessToken = data.session_id; // Bearer fallback for cookie-blocked setups
    return data;
  }

  /** Register a new account. Does NOT auto-login (returns the user only). */
  async register(payload: RegisterInput): Promise<AuthUser> {
    return this.request<AuthUser>(
      "/api/auth/register",
      { method: "POST", body: JSON.stringify(payload) },
      { allowRetry: false },
    );
  }

  /** Current user from the active session (cookie or Bearer). */
  me(): Promise<AuthUser> {
    return this.request<AuthUser>(
      "/api/auth/me",
      { method: "GET" },
      { allowRetry: false },
    );
  }

  async logout(): Promise<void> {
    try {
      await this.request<void>("/api/auth/logout", { method: "POST" }, { allowRetry: false });
    } catch {
      /* best-effort */
    } finally {
      accessToken = null;
    }
  }

  async logoutAll(): Promise<void> {
    try {
      await this.request<void>("/api/auth/logout-all", { method: "POST" }, { allowRetry: false });
    } catch {
      /* best-effort */
    } finally {
      accessToken = null;
    }
  }

  changePassword(
    current_password: string,
    new_password: string,
  ): Promise<{ changed: boolean; other_sessions_revoked: number }> {
    return this.post("/api/auth/change-password", {
      current_password,
      new_password,
    });
  }

  listSessions(): Promise<UserSessionInfo[]> {
    return this.get<UserSessionInfo[]>("/api/auth/sessions");
  }

  revokeSession(id: string): Promise<void> {
    return this.delete(`/api/auth/sessions/${encodeURIComponent(id)}`);
  }
}

export const apiClient = new ApiClient(BASE_URL);

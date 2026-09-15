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
/**
 * Session persistence — sessionStorage (most secure viable option)
 * ────────────────────────────────────────────────────────────────
 * The backend sets an HttpOnly `session_id` cookie, but that cookie is scoped to
 * the API origin and is third-party from the frontend domain — many browsers
 * block it, so it can't be relied on to survive a reload. To keep the user
 * signed in we mirror the session_id into `sessionStorage` and restore it on
 * boot into the in-memory Bearer token.
 *
 * Why sessionStorage over a cookie / localStorage:
 *  - It is NEVER auto-sent with requests → no CSRF surface (we attach the Bearer
 *    header explicitly ourselves).
 *  - It is cleared when the tab closes → the token isn't left on disk, so the
 *    XSS exposure window is far smaller than a persistent cookie or localStorage.
 *  - It still survives reloads + in-tab navigation, which is the actual need.
 * The HttpOnly server cookie remains the primary credential; this is the
 * persistence fallback for cookie-blocked cross-site setups.
 */
const SESSION_KEY = "avat_session";

function persistToken(token: string | null) {
  if (typeof window === "undefined") return;
  try {
    if (token) window.sessionStorage.setItem(SESSION_KEY, token);
    else window.sessionStorage.removeItem(SESSION_KEY);
  } catch {
    /* storage unavailable (private mode / disabled) — memory-only fallback */
  }
}

function readPersistedToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.sessionStorage.getItem(SESSION_KEY);
  } catch {
    return null;
  }
}

// Restore any persisted session before the first request runs.
let accessToken: string | null = readPersistedToken();
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

  // ── Token management (in-memory + sessionStorage mirror) ────────────────────
  setAccessToken(token: string | null) {
    accessToken = token;
    persistToken(token);
  }
  getAccessToken(): string | null {
    return accessToken;
  }
  /** Legacy alias kept for callers that used setToken(). */
  setToken(token: string | null) {
    accessToken = token;
    persistToken(token);
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
      persistToken(null);
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
  /**
   * Absolute URL for a server-relative path the API handed us (media files,
   * avatar previews). The API lives on its own origin, so `/api/media/…/file`
   * must be resolved against the API base before it can go in an `src`.
   */
  absoluteUrl(path: string | null | undefined): string {
    if (!path) return "";
    if (/^(https?:|data:|blob:)/i.test(path)) return path;
    return `${this.baseUrl}${path.startsWith("/") ? path : `/${path}`}`;
  }

  /**
   * Object URL for an endpoint that requires authentication.
   *
   * An `<img src>` cannot carry the Bearer header, and the session cookie is
   * third-party from this origin, so owner-only assets (custom avatar
   * previews) have to be fetched here and handed to the DOM as a blob.
   * Callers own the result — revoke it when the element unmounts.
   */
  async objectUrl(path: string): Promise<string> {
    const blob = await this.getBlob(path);
    return URL.createObjectURL(blob);
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
    persistToken(data.session_id); // persist so a reload stays signed in
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
      persistToken(null);
    }
  }

  async logoutAll(): Promise<void> {
    try {
      await this.request<void>("/api/auth/logout-all", { method: "POST" }, { allowRetry: false });
    } catch {
      /* best-effort */
    } finally {
      accessToken = null;
      persistToken(null);
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

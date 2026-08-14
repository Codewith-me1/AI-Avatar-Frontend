import type { AuthResponse, AuthUser, RegisterInput } from "@/types";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "https://avat.gigatechservices.org";

/**
 * Security model
 * ──────────────
 * - The ACCESS token lives ONLY in module memory (never localStorage / cookies
 *   readable by JS). It is short-lived and sent as `Authorization: Bearer`.
 * - The REFRESH token is an httpOnly, Secure, SameSite cookie set by the backend.
 *   JS can never read it; it rides along automatically on `credentials: "include"`
 *   requests to the auth endpoints only (backend scopes it to Path=/api/auth).
 * - On a 401 we transparently attempt ONE refresh (single-flight) and retry.
 * - If refresh fails we drop the in-memory token and notify the app to sign out.
 */
let accessToken: string | null = null;
let refreshInFlight: Promise<AuthResponse | null> | null = null;
let authFailureHandler: (() => void) | null = null;

const AUTH_PATHS = [
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/refresh",
  "/api/auth/logout",
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

  // ── Refresh (single-flight) ─────────────────────────────────────────────────
  private refreshSession(): Promise<AuthResponse | null> {
    if (!refreshInFlight) {
      refreshInFlight = fetch(`${this.baseUrl}/api/auth/refresh`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      })
        .then(async (res) => {
          if (!res.ok) return null;
          const data = (await res.json().catch(() => null)) as AuthResponse | null;
          if (data?.access_token) accessToken = data.access_token;
          return data;
        })
        .catch(() => null)
        .finally(() => {
          refreshInFlight = null;
        });
    }
    return refreshInFlight;
  }

  /** Public: attempt to restore a session from the refresh cookie. */
  refresh(): Promise<AuthResponse | null> {
    return this.refreshSession();
  }

  // ── Core request with transparent 401 → refresh → retry ─────────────────────
  private async request<T>(
    path: string,
    init: RequestInit,
    opts: { isForm?: boolean; allowRetry?: boolean } = {},
  ): Promise<T> {
    const isForm = !!opts.isForm;
    const allowRetry = opts.allowRetry !== false;

    const exec = () =>
      fetch(`${this.baseUrl}${path}`, {
        ...init,
        credentials: "include",
        headers: this.buildHeaders(init.headers, isForm),
      });

    let res = await exec();

    if (res.status === 401 && allowRetry && !this.isAuthPath(path)) {
      const refreshed = await this.refreshSession();
      if (refreshed?.access_token) {
        res = await exec();
      }
      if (res.status === 401) {
        accessToken = null;
        authFailureHandler?.();
        throw new Error("Unauthorized");
      }
    }

    if (!res.ok) {
      const detail = await res.json().catch(() => null);
      throw new Error(
        (detail && (detail.detail || detail.message)) ??
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

  // ── Auth flows ──────────────────────────────────────────────────────────────
  async login(email: string, password: string): Promise<AuthResponse> {
    const data = await this.request<AuthResponse>(
      "/api/auth/login",
      { method: "POST", body: JSON.stringify({ email, password }) },
      { allowRetry: false },
    );
    accessToken = data.access_token;
    return data;
  }

  async register(payload: RegisterInput): Promise<AuthResponse> {
    const data = await this.request<AuthResponse>(
      "/api/auth/register",
      { method: "POST", body: JSON.stringify(payload) },
      { allowRetry: false },
    );
    if (data?.access_token) accessToken = data.access_token;
    return data;
  }

  async logout(): Promise<void> {
    try {
      await this.request<void>(
        "/api/auth/logout",
        { method: "POST" },
        { allowRetry: false },
      );
    } catch {
      /* best-effort; always clear local state below */
    } finally {
      accessToken = null;
    }
  }

  me(): Promise<AuthUser> {
    return this.request<AuthUser>("/api/auth/me", { method: "GET" });
  }
}

export const apiClient = new ApiClient(BASE_URL);

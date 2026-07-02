const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://avat.gigatechservices.org";

class ApiClient {
  private defaultBaseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string) {
    this.defaultBaseUrl = baseUrl;
  }

  private get baseUrl(): string {
    if (typeof window !== "undefined") {
      return localStorage.getItem("voice_agent_server_url") || this.defaultBaseUrl;
    }
    return this.defaultBaseUrl;
  }

  setToken(token: string) {
    this.token = token;
  }

  private headers(): HeadersInit {
    const h: HeadersInit = { "Content-Type": "application/json" };
    if (this.token) h["Authorization"] = `Bearer ${this.token}`;
    return h;
  }
  private authHeaders(): Record<string, string> {
    return this.token ? { Authorization: `Bearer ${this.token}` } : {};
  }

  async get<T>(path: string): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      headers: this.headers(),
    });
    if (!res.ok) throw new Error(`GET ${path} failed: ${res.status}`);
    return res.json();
  }

  async post<T>(path: string, body: unknown): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      method: "POST",
      headers: this.headers(),
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`POST ${path} failed: ${res.status}`);
    return res.json();
  }

  async patch<T>(path: string, body: unknown): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      method: "PATCH",
      headers: this.headers(),
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`PATCH ${path} failed: ${res.status}`);
    return res.json();
  }

  async delete(path: string): Promise<void> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      method: "DELETE",
      headers: this.headers(),
    });
    if (!res.ok && res.status !== 204)
      throw new Error(`DELETE ${path} failed: ${res.status}`);
  }

  async upload<T>(path: string, formData: FormData): Promise<T> {
    const headers: HeadersInit = {};
    if (this.token) headers["Authorization"] = `Bearer ${this.token}`;
    const res = await fetch(`${this.baseUrl}${path}`, {
      method: "POST",
      headers,
      body: formData,
    });
    if (!res.ok) throw new Error(`UPLOAD ${path} failed: ${res.status}`);
    return res.json();
  }
  async postForm<T>(path: string, formData: FormData): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      method: "POST",
      headers: { ...this.authHeaders() },   // no Content-Type here!
      body: formData,
    });
    if (!res.ok) {
      const detail = await res.json().catch(() => ({ detail: res.statusText }));
      throw new Error(detail?.detail ?? `HTTP ${res.status}`);
    }
    return res.json() as Promise<T>;
  }
}

export const apiClient = new ApiClient(BASE_URL);
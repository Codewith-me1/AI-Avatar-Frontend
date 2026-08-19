/**
 * Google OAuth — one registered redirect URI serves BOTH flows; the backend
 * reads the purpose from the signed `state`. We always complete at
 * /api/auth/google/complete.
 *
 *   purpose=login     — sign in / sign up (no session needed)
 *   purpose=calendar  — connect Calendar/Meet (requires an existing session)
 */
import { apiClient } from "./client";
import type { AuthUser } from "@/types";

export type GooglePurpose = "login" | "calendar";

export interface GoogleCompleteResult {
  purpose: GooglePurpose;
  // login shape (mirrors POST /api/auth/login) + created_account
  session_id?: string;
  token_type?: string;
  expires_at?: string;
  user?: AuthUser;
  created_account?: boolean;
  // calendar shape
  google?: { google_email?: string | null };
}

export interface GoogleStatus {
  configured: boolean;
  connected: boolean;
  google_email?: string | null;
  connected_at?: string | null;
  calendar_ready: boolean;
}

/** Get the consent URL to redirect the browser to. */
export const getGoogleAuthUrl = (purpose: GooglePurpose, loginHint?: string) => {
  const p = new URLSearchParams({ purpose });
  if (loginHint) p.set("login_hint", loginHint);
  return apiClient.get<{ authorization_url: string }>(
    `/api/auth/google/url?${p.toString()}`,
  );
};

/** Exchange the callback code+state. Sets the in-memory token on a login. */
export async function completeGoogle(code: string, state: string) {
  const data = await apiClient.post<GoogleCompleteResult>(
    "/api/auth/google/complete",
    { code, state },
  );
  if (data.purpose === "login" && data.session_id) {
    apiClient.setAccessToken(data.session_id);
  }
  return data;
}

export const getGoogleSettings = () =>
  apiClient.get<GoogleStatus>("/api/settings/google");

export const disconnectGoogle = () =>
  apiClient.delete("/api/settings/google");

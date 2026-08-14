/**
 * Account-level outbound email (SMTP) settings.
 * Mirrors backend/api/routes/settings.py. The password is write-only —
 * GET never returns it (only `password_set`); omit it on PUT to keep the stored one.
 */
import { apiClient } from "./client";

export interface SmtpConfig {
  enabled: boolean;
  host?: string | null;
  port: number;
  username?: string | null;
  from_email?: string | null;
  from_name?: string | null;
  use_tls: boolean;
  use_ssl: boolean;
  reply_to?: string | null;
  password_set: boolean;
  verified_at?: string | null;
  last_error?: string | null;
}

export interface SmtpInput {
  enabled: boolean;
  host?: string;
  port: number;
  username?: string;
  password?: string; // omit/empty to keep the stored password
  from_email?: string;
  from_name?: string;
  use_tls: boolean;
  use_ssl: boolean;
  reply_to?: string;
}

export interface SmtpTestResult {
  sent: boolean;
  to: string;
  verified_at: string;
}

export const getSmtp = () => apiClient.get<SmtpConfig>("/api/settings/smtp");

export const putSmtp = (body: SmtpInput) =>
  apiClient.put<SmtpConfig>("/api/settings/smtp", body);

export const testSmtp = (toEmail?: string) =>
  apiClient.post<SmtpTestResult>(
    "/api/settings/smtp/test",
    toEmail ? { to_email: toEmail } : {},
  );

export const deleteSmtp = () => apiClient.delete("/api/settings/smtp");

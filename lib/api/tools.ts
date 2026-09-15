/**
 * Tools registry — the two built-in system tools plus the owner's webhook tools.
 *
 * `GET /api/tools` returns both kinds in one list: system rows carry a
 * `system:` id and `editable: false`, so the table can render them without a
 * separate code path and the edit/delete calls refuse them server-side too.
 */

import { apiClient } from "./client";
import type { ToolInput, ToolRow, ToolTestResult } from "@/types";

export function listTools(): Promise<ToolRow[]> {
  return apiClient.get<ToolRow[]>("/api/tools");
}

export function createTool(input: ToolInput): Promise<ToolRow> {
  return apiClient.post<ToolRow>("/api/tools", input);
}

/** `auth_config` is write-only — sending it replaces the stored credentials. */
export function updateTool(
  toolId: string,
  patch: Partial<ToolInput>,
): Promise<ToolRow> {
  return apiClient.patch<ToolRow>(`/api/tools/${toolId}`, patch);
}

export function deleteTool(toolId: string): Promise<void> {
  return apiClient.delete(`/api/tools/${toolId}`);
}

/** Dry-run against the real endpoint. Persists nothing. */
export function testTool(
  toolId: string,
  args: Record<string, unknown> = {},
): Promise<ToolTestResult> {
  return apiClient.post<ToolTestResult>(`/api/tools/${toolId}/test`, {
    arguments: args,
  });
}

export const isSystemTool = (id: string) => id.startsWith("system:");

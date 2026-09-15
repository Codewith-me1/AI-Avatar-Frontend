/**
 * Agents, templates, media, tools attachment and text chat.
 *
 * Every settings field the wizard collects is sent as a structured field — the
 * backend composes the effective prompt (role, personality, topics to avoid,
 * word cap) at dispatch time. Do NOT bake those into `system_prompt` here or
 * they become unreadable prose the edit page cannot recover.
 */

import { apiClient } from "./client";
import type {
  Agent,
  AgentChatReply,
  AgentInput,
  AgentTemplate,
  AgentUpdateInput,
  ChatTurn,
  EffectivePrompt,
  MediaItem,
  ToolRow,
} from "@/types";

// ── Agents ───────────────────────────────────────────────────────────────────

export function listAgents(): Promise<Agent[]> {
  return apiClient.get<Agent[]>("/api/agents/");
}

export function getAgent(id: string): Promise<Agent> {
  return apiClient.get<Agent>(`/api/agents/${id}`);
}

export function createAgent(payload: AgentInput): Promise<Agent> {
  return apiClient.post<Agent>("/api/agents/", payload);
}

/**
 * PATCH with whatever keys you pass. The backend uses exclude_unset, so an
 * explicit `null` CLEARS the column — that is how "no word cap" and "no topics
 * to avoid" are saved. Omit a key to leave it untouched.
 */
export function updateAgent(id: string, patch: AgentUpdateInput): Promise<Agent> {
  return apiClient.patch<Agent>(`/api/agents/${id}`, patch);
}

export function deleteAgent(id: string): Promise<void> {
  return apiClient.delete(`/api/agents/${id}`);
}

export function listTemplates(): Promise<AgentTemplate[]> {
  return apiClient.get<AgentTemplate[]>("/api/agents/templates");
}

export function getEffectivePrompt(id: string): Promise<EffectivePrompt> {
  return apiClient.get<EffectivePrompt>(`/api/agents/${id}/effective-prompt`);
}

// ── Text chat ────────────────────────────────────────────────────────────────

export interface PreviewChatInput {
  messages: ChatTurn[];
  system_prompt?: string;
  personality?: string;
  agent_role?: string;
  topics_to_avoid?: string[] | null;
  max_response_words?: number | null;
  creativity?: number;
  llm_provider?: string;
  llm_model?: string;
}

/** Wizard preview — persists nothing, rate-limited per user. */
export function previewChat(input: PreviewChatInput): Promise<{ reply: string }> {
  return apiClient.post<{ reply: string }>("/api/agents/preview/chat", input);
}

/** Real agent: composed prompt + knowledge retrieval + media matching. */
export function agentChat(
  agentId: string,
  messages: ChatTurn[],
): Promise<AgentChatReply> {
  return apiClient.post<AgentChatReply>(`/api/agents/${agentId}/chat`, { messages });
}

// ── Media shown in chat ──────────────────────────────────────────────────────

export function listMedia(agentId: string): Promise<MediaItem[]> {
  return apiClient.get<MediaItem[]>(`/api/agents/${agentId}/media`);
}

export interface MediaUploadInput {
  file: File;
  title?: string;
  description?: string;
  trigger_keywords?: string[];
  show_by_default?: boolean;
  sort_order?: number;
}

export function uploadMedia(
  agentId: string,
  input: MediaUploadInput,
): Promise<MediaItem> {
  const fd = new FormData();
  fd.append("file", input.file);
  if (input.title) fd.append("title", input.title);
  if (input.description) fd.append("description", input.description);
  if (input.trigger_keywords?.length)
    fd.append("trigger_keywords", input.trigger_keywords.join(","));
  fd.append("show_by_default", String(!!input.show_by_default));
  fd.append("sort_order", String(input.sort_order ?? 0));
  return apiClient.postForm<MediaItem>(`/api/agents/${agentId}/media`, fd);
}

export interface MediaLinkInput {
  title: string;
  external_url: string;
  description?: string;
  trigger_keywords?: string[];
  show_by_default?: boolean;
  sort_order?: number;
}

export function addMediaLink(
  agentId: string,
  input: MediaLinkInput,
): Promise<MediaItem> {
  return apiClient.post<MediaItem>(`/api/agents/${agentId}/media`, {
    ...input,
    kind: "link",
  });
}

export function updateMedia(
  agentId: string,
  mediaId: string,
  patch: Partial<Pick<MediaItem, "title" | "description" | "show_by_default" | "sort_order" | "is_active">> & {
    trigger_keywords?: string[];
  },
): Promise<MediaItem> {
  return apiClient.patch<MediaItem>(`/api/agents/${agentId}/media/${mediaId}`, patch);
}

export function deleteMedia(agentId: string, mediaId: string): Promise<void> {
  return apiClient.delete(`/api/agents/${agentId}/media/${mediaId}`);
}

/** Media files are public for a public agent, so a plain <img src> works. */
export function mediaSrc(url: string): string {
  return apiClient.absoluteUrl(url);
}

// ── Tools attached to one agent ──────────────────────────────────────────────

export function listAgentTools(agentId: string): Promise<ToolRow[]> {
  return apiClient.get<ToolRow[]>(`/api/agents/${agentId}/tools`);
}

/** Replaces the whole set. System tools are implicit and ignored here. */
export function setAgentTools(
  agentId: string,
  toolIds: string[],
): Promise<unknown> {
  return apiClient.put(`/api/agents/${agentId}/tools`, {
    tool_ids: toolIds.filter((id) => !id.startsWith("system:")),
  });
}

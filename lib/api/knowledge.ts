/**
 * Knowledge bases: summary, editing, and the one-call bootstrap the wizard uses.
 *
 * Paths are all under /api/knowledge. The per-KB endpoints are nested under
 * /agents/{agent_id}/kb/{kb_id}; the agent-level ones (summary, bootstrap,
 * search) sit directly under /agents/{agent_id}.
 */

import { apiClient } from "./client";
import type {
  BootstrapResult,
  Document,
  DocumentContent,
  KnowledgeBase,
  KnowledgeSearchResult,
  KnowledgeSummary,
} from "@/types";

const base = (agentId: string) => `/api/knowledge/agents/${agentId}`;

// ── Agent-level ──────────────────────────────────────────────────────────────

export function getSummary(agentId: string): Promise<KnowledgeSummary> {
  return apiClient.get<KnowledgeSummary>(`${base(agentId)}/summary`);
}

export interface BootstrapInput {
  text?: string;
  urls?: string[];
  restrict_to_knowledge?: boolean;
}

/**
 * Creates the default KB if absent, stores pasted text, queues one crawl per
 * URL, and reports each part separately. Idempotent — safe to call again for
 * the same agent, which is what makes it usable from the wizard.
 */
export function bootstrap(
  agentId: string,
  input: BootstrapInput,
): Promise<BootstrapResult> {
  return apiClient.post<BootstrapResult>(`${base(agentId)}/bootstrap`, input);
}

/** Owner-only retrieval probe: exactly the chunks the agent would see. */
export function search(
  agentId: string,
  query: string,
  k = 5,
): Promise<KnowledgeSearchResult> {
  return apiClient.get<KnowledgeSearchResult>(
    `${base(agentId)}/search?q=${encodeURIComponent(query)}&k=${k}`,
  );
}

// ── Knowledge bases ──────────────────────────────────────────────────────────

export function listKbs(agentId: string): Promise<KnowledgeBase[]> {
  return apiClient.get<KnowledgeBase[]>(`${base(agentId)}/kb/`);
}

export function createKb(
  agentId: string,
  name: string,
  description?: string,
): Promise<KnowledgeBase> {
  return apiClient.post<KnowledgeBase>(`${base(agentId)}/kb/`, {
    name,
    description,
  });
}

export function renameKb(
  agentId: string,
  kbId: string,
  patch: { name?: string; description?: string },
): Promise<KnowledgeBase> {
  return apiClient.patch<KnowledgeBase>(`${base(agentId)}/kb/${kbId}`, patch);
}

export function deleteKb(agentId: string, kbId: string): Promise<void> {
  return apiClient.delete(`${base(agentId)}/kb/${kbId}`);
}

// ── Documents ────────────────────────────────────────────────────────────────

export function listDocuments(agentId: string, kbId: string): Promise<Document[]> {
  return apiClient.get<Document[]>(`${base(agentId)}/kb/${kbId}/documents`);
}

export function getDocument(
  agentId: string,
  kbId: string,
  docId: string,
): Promise<Document> {
  return apiClient.get<Document>(`${base(agentId)}/kb/${kbId}/documents/${docId}`);
}

/** Full editable text. `reconstructed` means it was rebuilt from chunks. */
export function getDocumentContent(
  agentId: string,
  kbId: string,
  docId: string,
): Promise<DocumentContent> {
  return apiClient.get<DocumentContent>(
    `${base(agentId)}/kb/${kbId}/documents/${docId}/content`,
  );
}

/** Saving content re-chunks and re-embeds — no stale vectors are left behind. */
export function saveDocumentContent(
  agentId: string,
  kbId: string,
  docId: string,
  content: string,
  filename?: string,
): Promise<DocumentContent> {
  return apiClient.put<DocumentContent>(
    `${base(agentId)}/kb/${kbId}/documents/${docId}/content`,
    { content, filename },
  );
}

export function renameDocument(
  agentId: string,
  kbId: string,
  docId: string,
  filename: string,
): Promise<Document> {
  return apiClient.patch<Document>(
    `${base(agentId)}/kb/${kbId}/documents/${docId}`,
    { filename },
  );
}

export function reindexDocument(
  agentId: string,
  kbId: string,
  docId: string,
): Promise<Document> {
  return apiClient.post<Document>(
    `${base(agentId)}/kb/${kbId}/documents/${docId}/reindex`,
    {},
  );
}

export function deleteDocument(
  agentId: string,
  kbId: string,
  docId: string,
): Promise<void> {
  return apiClient.delete(`${base(agentId)}/kb/${kbId}/documents/${docId}`);
}

export function createTextDocument(
  agentId: string,
  kbId: string,
  filename: string,
  content: string,
): Promise<Document> {
  return apiClient.post<Document>(`${base(agentId)}/kb/${kbId}/documents/text`, {
    filename,
    content,
  });
}

export function uploadDocument(
  agentId: string,
  kbId: string,
  file: File,
): Promise<Document> {
  const fd = new FormData();
  fd.append("file", file);
  return apiClient.postForm<Document>(
    `${base(agentId)}/kb/${kbId}/documents`,
    fd,
  );
}

// ── Website source ───────────────────────────────────────────────────────────

export interface WebsiteKb {
  id: string;
  agent_id: string;
  name: string;
  source_url: string;
  kb_type: string;
  crawl_status: string;
  pages_indexed: number;
  crawl_error?: string | null;
  last_crawled_at?: string | null;
}

export function attachWebsite(
  agentId: string,
  url: string,
  opts: { max_pages?: number; max_depth?: number; restrict_to_knowledge?: boolean } = {},
): Promise<WebsiteKb> {
  return apiClient.post<WebsiteKb>(`${base(agentId)}/kb/from-url`, {
    url,
    max_pages: opts.max_pages ?? 1,
    max_depth: opts.max_depth ?? 0,
    restrict_to_knowledge: opts.restrict_to_knowledge ?? true,
  });
}

export function websiteStatus(agentId: string): Promise<WebsiteKb[]> {
  return apiClient.get<WebsiteKb[]>(`${base(agentId)}/kb/from-url/status`);
}

export function recrawlWebsite(agentId: string, kbId: string): Promise<WebsiteKb> {
  return apiClient.post<WebsiteKb>(`${base(agentId)}/kb/${kbId}/recrawl`, {});
}

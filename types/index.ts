// Agent types
// Mirrors AgentResponse in backend/api/routes/agents.py — every field the
// wizard can set comes back out, so the edit page rehydrates from the API
// instead of parsing settings back out of the prompt text.
export interface Agent {
  id: string;
  name: string;
  description?: string;
  slug: string;
  system_prompt: string;
  personality?: string;
  language: string;

  // Voice
  voice_id?: string;
  voice_speed: number;
  pronunciations?: Pronunciation[];

  // Avatar
  avatar_id?: string;
  musetalk_avatar_id?: string;

  // Model
  llm_provider: string;
  llm_model: string;
  llm_temperature: number;
  llm_max_tokens: number;

  // Behavior
  agent_role?: string;
  creativity: number;
  topics_to_avoid?: string[];
  max_response_words?: number | null;

  // Conversation
  greeting?: string;
  conversation_starters?: string[];
  enable_camera: boolean;
  feedback_screen: boolean;
  agent_memory: boolean;
  share_memory: boolean;

  // Knowledge scope
  restrict_to_knowledge: boolean;
  knowledge_mode: KnowledgeMode;
  website_url?: string;

  // Capabilities (read-only here; written from the CRM settings)
  enable_lead_capture: boolean;
  enable_appointments: boolean;
  enable_human_handoff: boolean;

  // Derived server-side from `creativity` — what the model actually runs at.
  effective_temperature: number;

  widget_config?: WidgetConfig;
  is_public: boolean;
  is_active: boolean;
}

export type KnowledgeMode = "hybrid" | "strict";

export interface Pronunciation {
  word: string;
  say_as: string;
}

/** Everything the create/update endpoints accept. All optional but the name. */
export interface AgentInput {
  name: string;
  description?: string;
  system_prompt?: string;
  personality?: string;
  language?: string;
  voice_id?: string;
  voice_speed?: number;
  pronunciations?: Pronunciation[] | null;
  avatar_id?: string;
  musetalk_avatar_id?: string;
  llm_provider?: string;
  llm_model?: string;
  llm_temperature?: number;
  agent_role?: string | null;
  creativity?: number;
  topics_to_avoid?: string[] | null;
  max_response_words?: number | null;
  greeting?: string | null;
  conversation_starters?: string[] | null;
  enable_camera?: boolean;
  feedback_screen?: boolean;
  agent_memory?: boolean;
  share_memory?: boolean;
  knowledge_mode?: KnowledgeMode;
  restrict_to_knowledge?: boolean;
  is_public?: boolean;
  is_active?: boolean;
  widget_config?: WidgetConfig | null;
}

/** GET /api/agents/templates — starter agents that prefill the wizard. */
export interface AgentTemplate {
  key: string;
  name: string;
  tagline: string;
  avatar_preview: string;
  musetalk_avatar_id: string;
  voice_id: string;
  personality: string;
  agent_role: string;
  system_prompt: string;
  greeting: string;
  conversation_starters: string[];
  creativity: number;
}

/** GET /api/agents/{id}/effective-prompt */
export interface EffectivePrompt {
  system_prompt: string;
  temperature: number;
}

// ── Media shown in chat (flyers, business cards, price lists) ────────────────
export type MediaKind = "image" | "pdf" | "video" | "link" | "card";

export interface MediaItem {
  id: string;
  agent_id: string;
  kind: MediaKind;
  title: string;
  description?: string | null;
  trigger_keywords: string[];
  /** Server-relative for uploads, absolute for links — resolve before use. */
  url: string;
  mime_type?: string | null;
  file_size?: number | null;
  show_by_default: boolean;
  sort_order: number;
  is_active: boolean;
  created_at?: string | null;
}

// ── Tools ────────────────────────────────────────────────────────────────────
export interface ToolRow {
  id: string;
  name: string;
  type: "System" | "Custom";
  description: string;
  /** Display label the table shows, e.g. "None", "Api Key". */
  authentication: string;
  is_enabled: boolean;
  editable: boolean;
  auth_type?: ToolAuthType;
  has_credentials?: boolean;
  method?: string;
  url?: string;
  parameters?: Record<string, unknown>;
  timeout_seconds?: number;
  agent_count?: number;
  created_at?: string | null;
}

export type ToolAuthType = "none" | "api_key" | "bearer" | "basic";

export interface ToolInput {
  name: string;
  description: string;
  url: string;
  method: string;
  headers?: Record<string, string> | null;
  parameters?: Record<string, unknown> | null;
  auth_type: ToolAuthType;
  auth_config?: Record<string, string> | null;
  timeout_seconds: number;
  is_enabled: boolean;
}

export interface ToolTestResult {
  ok: boolean;
  status?: number | null;
  latency_ms?: number | null;
  body?: string | null;
  error?: string | null;
}

// ── Avatars ──────────────────────────────────────────────────────────────────
export interface AvatarCatalogueItem {
  id: string;
  name: string;
  description?: string;
  preview_url?: string | null;
  kind: "video" | "photo";
  provider: "musetalk" | "liveavatar" | "custom";
  status?: string;
  error?: string | null;
}

export interface CustomAvatar {
  id: string;
  name: string;
  kind: "video" | "photo";
  status: "pending" | "processing" | "ready" | "failed";
  error?: string | null;
  provider_avatar_id?: string | null;
  preview_url?: string | null;
  created_at?: string | null;
}

export interface AvatarConfig {
  scale?: number;
  position?: [number, number, number];
  background?: string;
  lighting?: "soft" | "studio" | "natural";
}

export interface WidgetConfig {
  greeting?: string;
  primaryColor?: string;
  position?: "bottom-right" | "bottom-left";
  buttonLabel?: string;
  width?: number;
  height?: number;
}

// Knowledge base types
export interface KnowledgeBase {
  id: string;
  agent_id: string;
  name: string;
  description?: string;
  document_count: number;
}

export type DocumentStatus = "pending" | "processing" | "ready" | "error";

export interface Document {
  id: string;
  kb_id: string;
  filename: string;
  status: DocumentStatus;
  file_size?: number | null;
  content_type?: string | null;
  source_url?: string | null;
}

/** GET /api/knowledge/agents/{id}/kb/{kb}/documents/{doc}/content */
export interface DocumentContent {
  id: string;
  kb_id: string;
  filename: string;
  status: DocumentStatus;
  content: string;
  source_url?: string | null;
  /** True when the text was rebuilt from embedded chunks, not the original. */
  reconstructed: boolean;
}

/** GET /api/knowledge/agents/{id}/summary */
export interface KnowledgeSummary {
  agent_id: string;
  total_documents: number;
  total_chunks: number;
  restrict_to_knowledge: boolean;
  kbs: KnowledgeBaseSummary[];
}

export interface KnowledgeBaseSummary {
  id: string;
  name: string;
  kb_type: "upload" | "website" | string;
  source_url?: string | null;
  document_count: number;
  chunk_count: number;
  crawl_status?: string | null;
  updated_at?: string | null;
}

export interface BootstrapResult {
  kb_id: string;
  created: { text: boolean; urls: string[] };
  errors: string[];
  restrict_to_knowledge: boolean;
}

export interface KnowledgeSearchResult {
  agent_id: string;
  query: string;
  count: number;
  results: { content: string | null; score: number | null; source: string | null }[];
}

// ── Text chat (wizard preview + real agent) ──────────────────────────────────
export interface ChatTurn {
  role: "user" | "assistant";
  content: string;
}

export interface AgentChatReply {
  reply: string;
  media?: { id: string; kind: MediaKind; title: string; url: string } | null;
  used_knowledge?: boolean;
}

/** GET /api/widget/{id}/config — public, no prompt or owner data. */
export interface WidgetPublicConfig {
  agent_id: string;
  name: string;
  language: string;
  avatar_id?: string | null;
  musetalk_avatar_id?: string | null;
  voice_id?: string | null;
  voice_speed: number;
  greeting?: string | null;
  conversation_starters: string[];
  enable_camera: boolean;
  feedback_screen: boolean;
  media: { id: string; kind: MediaKind; title: string; url: string; show_by_default: boolean }[];
  widget_config?: WidgetConfig | null;
  ws_url: string;
}

// Session / conversation types
export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  audio_duration_ms?: number;
}

export interface ConversationSession {
  id: string;
  agent_id: string;
  status: "connecting" | "active" | "ended" | "error";
  messages: Message[];
}

// WebSocket event types
export type WSEventType =
  | "session_ready"
  | "transcript_partial"
  | "transcript_final"
  | "llm_token"
  | "audio_end"
  | "interrupted"
  | "avatar_state"
  | "error"
  | "pong";

export type AvatarState = "idle" | "listening" | "processing" | "thinking" | "speaking";

export interface WSEvent {
  type: WSEventType;
  [key: string]: unknown;
}

export interface SessionReadyEvent extends WSEvent {
  type: "session_ready";
  session_id: string;
  agent: {
    name: string;
    avatar_type: string;
    avatar_url?: string;
    avatar_config?: AvatarConfig;
    voice_id?: string;
    language: string;
  };
  greeting?: string;
}

export interface AvatarStateEvent extends WSEvent {
  type: "avatar_state";
  state: AvatarState;
}

// Voice / WebRTC types
export interface VoiceState {
  isConnected: boolean;
  isRecording: boolean;
  isSpeaking: boolean;  // agent is speaking
  isProcessing: boolean;
  avatarState: AvatarState;
  volume: number;        // microphone input level 0-1
  agentVolume: number;   // agent audio level 0-1
}

// Auth types
export interface AuthUser {
  id: string;
  email: string;
  full_name?: string | null;
  is_active?: boolean;
  is_superuser?: boolean;
  created_at?: string;
  last_login_at?: string | null;
}

// Server-side session login (session_id is set as an HttpOnly cookie AND
// returned in the body so it can also be sent as a Bearer fallback).
export interface AuthResponse {
  session_id: string;
  token_type?: string;
  expires_at?: string;
  user: AuthUser;
}

export interface RegisterInput {
  email: string;
  password: string;
  full_name?: string;
}

// One active login session ("device") for the current user.
export interface UserSessionInfo {
  id: string;
  ip_address?: string | null;
  user_agent?: string | null;
  created_at: string;
  last_seen_at: string;
  expires_at: string;
  current: boolean;
}

// API response types
export interface ApiError {
  detail: string;
  status: number;
}

export type AgentCreateInput = AgentInput;
export type AgentUpdateInput = Partial<AgentInput>;
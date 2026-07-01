// Agent types
export interface Agent {
  avatar_id: string;
  id: string;
  name: string;
  description?: string;
  slug: string;
  system_prompt: string;
  personality?: string;
 
  language: string;
  voice_id?: string;
  avatar_type: "readyplayerme" | "live2d" | "waveform";
  avatar_url?: string;
  avatar_config?: AvatarConfig;
  llm_provider: "anthropic" | "openai";
  llm_model: string;
  musetalk_avatar_id?: string;
  widget_config?: WidgetConfig;
  is_public: boolean;
  is_active: boolean;
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

export interface Document {
  id: string;
  kb_id: string;
  filename: string;
  status: "pending" | "processing" | "ready" | "error";
  file_size?: number;
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

// API response types
export interface ApiError {
  detail: string;
  status: number;
}

export type AgentCreateInput = Omit<Agent, "id" | "slug" | "is_active">;
export type AgentUpdateInput = Partial<AgentCreateInput>;
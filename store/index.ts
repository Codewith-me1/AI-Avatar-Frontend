import { create } from "zustand";
import type { Agent, Message, AvatarState, VoiceState } from "@/types";

interface VoiceStore extends VoiceState {
  // Session
  sessionId: string | null;
  agent: Agent | null;
  messages: Message[];

  // Transcripts
  partialTranscript: string;
  finalTranscript: string;

  // Actions
  setConnected: (connected: boolean) => void;
  setRecording: (recording: boolean) => void;
  setSpeaking: (speaking: boolean) => void;
  setProcessing: (processing: boolean) => void;
  setAvatarState: (state: AvatarState) => void;
  setVolume: (volume: number) => void;
  setAgentVolume: (volume: number) => void;
  setSessionId: (id: string) => void;
  setAgent: (agent: Agent) => void;
  addMessage: (msg: Message) => void;
  appendToken: (token: string) => void;
  setPartialTranscript: (text: string) => void;
  setFinalTranscript: (text: string) => void;
  reset: () => void;
}

const initialVoiceState: VoiceState = {
  isConnected: false,
  isRecording: false,
  isSpeaking: false,
  isProcessing: false,
  avatarState: "idle",
  volume: 0,
  agentVolume: 0,
};

export const useVoiceStore = create<VoiceStore>((set, get) => ({
  ...initialVoiceState,
  sessionId: null,
  agent: null,
  messages: [],
  partialTranscript: "",
  finalTranscript: "",

  setConnected: (isConnected) => set({ isConnected }),
  setRecording: (isRecording) => set({ isRecording }),
  setSpeaking: (isSpeaking) => set({ isSpeaking }),
  setProcessing: (isProcessing) => set({ isProcessing }),
  setAvatarState: (avatarState) => set({ avatarState }),
  setVolume: (volume) => set({ volume }),
  setAgentVolume: (agentVolume) => set({ agentVolume }),
  setSessionId: (sessionId) => set({ sessionId }),
  setAgent: (agent) => set({ agent }),

  addMessage: (msg) =>
    set((state) => ({ messages: [...state.messages, msg] })),

  appendToken: (token) =>
    set((state) => {
      const messages = [...state.messages];
      const last = messages[messages.length - 1];
      if (last?.role === "assistant") {
        messages[messages.length - 1] = { ...last, content: last.content + token };
      } else {
        messages.push({
          id: crypto.randomUUID(),
          role: "assistant",
          content: token,
          timestamp: new Date(),
        });
      }
      return { messages };
    }),

  setPartialTranscript: (partialTranscript) => set({ partialTranscript }),
  setFinalTranscript: (finalTranscript) => set({ finalTranscript }),

  reset: () =>
    set({
      ...initialVoiceState,
      sessionId: null,
      messages: [],
      partialTranscript: "",
      finalTranscript: "",
    }),
}));


// Agent management store
interface AgentStore {
  agents: Agent[];
  selectedAgent: Agent | null;
  isLoading: boolean;
  setAgents: (agents: Agent[]) => void;
  selectAgent: (agent: Agent | null) => void;
  addAgent: (agent: Agent) => void;
  updateAgent: (id: string, updates: Partial<Agent>) => void;
  removeAgent: (id: string) => void;
  setLoading: (loading: boolean) => void;
}

export const useAgentStore = create<AgentStore>((set) => ({
  agents: [],
  selectedAgent: null,
  isLoading: false,

  setAgents: (agents) => set({ agents }),
  selectAgent: (selectedAgent) => set({ selectedAgent }),
  addAgent: (agent) => set((state) => ({ agents: [...state.agents, agent] })),
  updateAgent: (id, updates) =>
    set((state) => ({
      agents: state.agents.map((a) => (a.id === id ? { ...a, ...updates } : a)),
    })),
  removeAgent: (id) =>
    set((state) => ({ agents: state.agents.filter((a) => a.id !== id) })),
  setLoading: (isLoading) => set({ isLoading }),
}));
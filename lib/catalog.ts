// Shared catalog data used by the agent-creation wizard and the Avatars page.

export interface AvatarItem {
  id: string;
  name: string;
  description: string;
  preview_url: string;
  kind: "video" | "photo";
}

export const MUSETALK_AVATARS: AvatarItem[] = [
  { id: "ava", name: "Ava", description: "Professional female presenter", preview_url: "/avatars/Ava.png", kind: "video" },
  { id: "yongen", name: "Yongen", description: "Default demo avatar", preview_url: "/avatars/Yongen.png", kind: "video" },
  { id: "maya", name: "Maya", description: "Default demo avatar", preview_url: "/avatars/maya.png", kind: "video" },
  { id: "mayamid", name: "Maya (Mid Quality)", description: "Default demo avatar", preview_url: "/avatars/maya.png", kind: "video" },
  { id: "ava4", name: "Ava (Low Quality)", description: "Default demo avatar", preview_url: "/avatars/Ava.png", kind: "video" },
  { id: "sidhart", name: "Sidharth", description: "Friendly Indian male avatar", preview_url: "/avatars/sidharth.png", kind: "video" },
  { id: "sidhartmid", name: "Sidharth (Mid Quality)", description: "Friendly Indian male avatar", preview_url: "/avatars/sidharth.png", kind: "video" },
  { id: "theo", name: "Theo", description: "Corporate support rep from Oceania", preview_url: "/avatars/theo.png", kind: "video" },
];

export interface VoiceItem {
  id: string;
  name: string;
  description: string;
  language: string;
  gender: string;
  previewUrl: string;
}

export const CARTESIA_VOICES: VoiceItem[] = [
  { id: "47c38ca4-5f35-497b-b1a3-415245fb35e1", name: "Daniel", description: "Deep, crisp, professional corporate American male", language: "en", gender: "Masculine", previewUrl: "./voice/daniel.wav" },
  { id: "db6b0ed5-d5d3-463d-ae85-518a07d3c2b4", name: "Skylar", description: "Warm, empathetic conversational American female", language: "en", gender: "Feminine", previewUrl: "./voice/sarah.wav" },
  { id: "95d51f79-c397-46f9-b49a-23763d3eaa2d", name: "Arushi", description: "Natural English / Hindi hybrid speaker", language: "hi", gender: "Feminine", previewUrl: "./voice/arushi.wav" },
  { id: "62ae83ad-4f6a-430b-af41-a9bede9286ca", name: "British Reading Lady", description: "Elegant Received Pronunciation storyteller", language: "en", gender: "Feminine", previewUrl: "./voice/british.wav" },
  { id: "79f8b5fb-2cc8-479a-80df-29f7a7cf1a3e", name: "Theo", description: "Friendly, casual corporate support rep from Oceania", language: "en", gender: "Masculine", previewUrl: "./voice/theo.wav" },
];

export const LANGUAGES = [
  { value: "en", label: "English", flag: "🇺🇸" },
  { value: "hi", label: "Hindi", flag: "🇮🇳" },
  { value: "es", label: "Spanish", flag: "🇪🇸" },
  { value: "fr", label: "French", flag: "🇫🇷" },
  { value: "de", label: "German", flag: "🇩🇪" },
  { value: "pt", label: "Portuguese", flag: "🇵🇹" },
  { value: "it", label: "Italian", flag: "🇮🇹" },
  { value: "nl", label: "Dutch", flag: "🇳🇱" },
  { value: "ja", label: "Japanese", flag: "🇯🇵" },
  { value: "zh", label: "Chinese", flag: "🇨🇳" },
];

export const PERSONALITIES = [
  "Friendly and Professional",
  "Warm and Empathetic",
  "Energetic and Persuasive",
  "Calm and Concise",
  "Playful and Witty",
  "Formal and Authoritative",
];

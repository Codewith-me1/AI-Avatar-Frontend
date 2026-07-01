/**
 * LiveAvatar stock avatar catalogue.
 * avatar_id values are stored on the Agent model and passed to
 * liveavatar.AvatarSession(avatar_id=...) in agentworker.py.
 *
 * Verify/update IDs at: app.liveavatar.com/home → Public Avatars
 */

export interface AvatarOption {
  id: string;              // LiveAvatar avatar_id
  name: string;
  description: string;
  gender: "female" | "male";
  style: "professional" | "casual" | "friendly";
  preview_url?: string; // optional URL for local avatar preview images (overrides default LiveAvatar preview)
  previewGradient: string; // shown before video stream is ready
}

export const AVATAR_OPTIONS: AvatarOption[] = [
  {
    id: "513fd1b7-7ef9-466d-9af2-344e51eeb833",
    name: "Shawn",
    description: "Calm & professional",
    gender: "male",
    style: "professional",
    previewGradient: "linear-gradient(135deg,#1a1a2e 0%,#16213e 50%,#0f3460 100%)",
  },
  {
    id: "Anna_public_3_20240108",
    name: "Anna",
    description: "Warm & approachable",
    gender: "female",
    style: "friendly",
    previewGradient: "linear-gradient(135deg,#2d1b69 0%,#11998e 100%)",
  },
  {
    id: "Susan_public_2_20240328",
    name: "Susan",
    description: "Sharp & confident",
    gender: "female",
    style: "professional",
    previewGradient: "linear-gradient(135deg,#0f0c29 0%,#302b63 50%,#24243e 100%)",
  },
  {
    id: "Tyler-inblacksuit-20220721",
    name: "Tyler",
    description: "Polished & engaging",
    gender: "male",
    style: "professional",
    previewGradient: "linear-gradient(135deg,#1c1c1c 0%,#2c3e50 100%)",
  },
  {
    id: "Daisy-inT-shirt-20220901",
    name: "Daisy",
    description: "Casual & relatable",
    gender: "female",
    style: "casual",
    previewGradient: "linear-gradient(135deg,#fc5c7d 0%,#6a3093 100%)",
  },
  {
    id: "Eric_public_pro1_20230608",
    name: "Eric",
    description: "Energetic & direct",
    gender: "male",
    style: "casual",
    previewGradient: "linear-gradient(135deg,#11998e 0%,#38ef7d 100%)",
  },
];

export const DEFAULT_AVATAR = AVATAR_OPTIONS[0];
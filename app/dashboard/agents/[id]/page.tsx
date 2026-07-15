// "use client";

// import React, { useEffect, useState, use } from "react";
// import { useRouter } from "next/navigation";
// import Link from "next/link";
// import {
//   ArrowLeft,
//   Cpu,
//   Radio,
//   AlignLeft,
//   Info,
//   HelpCircle,
//   Code,
//   Copy,
//   Check,
// } from "lucide-react";
// import { motion, AnimatePresence } from "framer-motion";
// import { apiClient } from "@/lib/api/client";
// import { useAgentStore } from "@/store";
// import type { Agent } from "@/types";

// export default function EditAgentPage({
//   params,
// }: {
//   params: Promise<{ id: string }>;
// }) {
//   const { id } = use(params);
//   const router = useRouter();
//   const { updateAgent, agents } = useAgentStore();
//   const [isLoading, setIsLoading] = useState(true);
//   const [isSaving, setIsSaving] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [success, setSuccess] = useState(false);
//   const [copied, setCopied] = useState(false);

//   // Form State
//   const [formData, setFormData] = useState<Omit<Agent, "id" | "slug">>({
//     name: "",
//     description: "",
//     system_prompt: "",
//     language: "en-US",
//     avatar_type: "waveform",
//     avatar_url: "",
//     avatar_id: "",
//     musetalk_avatar_id: "",

//     llm_provider: "openai",
//     llm_model: "gpt-4o",
//     is_public: true,
//     is_active: true,
//   });

//   useEffect(() => {
//     loadAgent();
//   }, [id]);

//   const loadAgent = async () => {
//     setIsLoading(true);
//     setError(null);
//     try {
//       // 1. Try fetching from backend API
//       const data = await apiClient.get<Agent>(`/api/agents/${id}`);
//       setFormData({
//         name: data.name,
//         description: data.description || "",
//         system_prompt: data.system_prompt,
//         language: data.language,
//         avatar_type: data.avatar_type,
//         avatar_url: data.avatar_url || "",
//         avatar_id: data.avatar_id || "",
//         musetalk_avatar_id: data.musetalk_avatar_id || "",
//         llm_provider: data.llm_provider,
//         llm_model: data.llm_model,
//         is_public: data.is_public,
//         is_active: data.is_active,
//       });
//     } catch (err) {
//       console.warn("Failed to load agent from API, searching local store", err);
//       // 2. Fall back to local store (for demo mode / offline support)
//       const localAgent = agents.find((a) => a.id === id);
//       if (localAgent) {
//         setFormData({
//           name: localAgent.name,
//           description: localAgent.description || "",
//           system_prompt: localAgent.system_prompt,
//           language: localAgent.language,
//           avatar_type: localAgent.avatar_type,
//           avatar_url: localAgent.avatar_url || "",
//           avatar_id: localAgent.avatar_id || "",
//           musetalk_avatar_id: localAgent.musetalk_avatar_id || "",
//           llm_provider: localAgent.llm_provider,
//           llm_model: localAgent.llm_model,
//           is_public: localAgent.is_public,
//           is_active: localAgent.is_active,
//         });
//       } else {
//         setError("Agent not found in registry.");
//       }
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleInputChange = (
//     e: React.ChangeEvent<
//       HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
//     >,
//   ) => {
//     const { name, value, type } = e.target;
//     if (type === "checkbox") {
//       const checked = (e.target as HTMLInputElement).checked;
//       setFormData((prev) => ({ ...prev, [name]: checked }));
//     } else {
//       setFormData((prev) => ({ ...prev, [name]: value }));
//     }
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!formData.name) {
//       setError("Agent name is required");
//       return;
//     }

//     setIsSaving(true);
//     setError(null);
//     setSuccess(false);

//     const slug = formData.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
//     const payload = {
//       ...formData,
//       slug,
//     };

//     try {
//       // Try sending update to API
//       const response = await apiClient.patch<Agent>(
//         `/api/agents/${id}`,
//         payload,
//       );
//       updateAgent(id, response);
//       setSuccess(true);
//       setTimeout(() => setSuccess(false), 3000);
//     } catch (err) {
//       console.warn(
//         "API patch failed, editing client-side mock agent instead",
//         err,
//       );
//       // Update in Zustand store locally
//       updateAgent(id, payload);
//       setSuccess(true);
//       setTimeout(() => setSuccess(false), 3000);
//     } finally {
//       setIsSaving(false);
//     }
//   };

//   // Embed script generator snippet
//   const embedCode = `<!-- VoiceAgent Embeddable Assistant Widget -->
// <script>
//   window.VoiceAgentConfig = {
//     agentId: "${id}",
//     apiUrl: "${typeof window !== "undefined" ? window.location.origin : "http://localhost:3000"}"
//   };
// </script>
// <script src="${typeof window !== "undefined" ? window.location.origin : "http://localhost:3000"}/components/widget/widget.js" async></script>`;

//   const handleCopy = () => {
//     navigator.clipboard.writeText(embedCode);
//     setCopied(true);
//     setTimeout(() => setCopied(false), 2000);
//   };

//   if (isLoading) {
//     return (
//       <div className="flex flex-col items-center justify-center h-96 gap-3 text-slate-400">
//         <div className="w-10 h-10 border-4 border-[#6d28d9] border-t-transparent rounded-full animate-spin" />
//         <span className="text-sm font-semibold">Loading agent settings...</span>
//       </div>
//     );
//   }

//   return (
//     <div className="p-8 max-w-4xl mx-auto space-y-8">
//       {/* Top Breadcrumb */}
//       <div className="flex items-center justify-between">
//         <Link
//           href="/dashboard/agents"
//           className="inline-flex items-center gap-2 text-slate-500 hover:text-[#6d28d9] text-sm font-medium transition-colors group"
//         >
//           <ArrowLeft
//             size={16}
//             className="transition-transform group-hover:-translate-x-1"
//           />
//           Back to dashboard
//         </Link>

//         <Link href={`/dashboard/agents/${id}/test`}>
//           <button className="px-4 py-2 bg-[#ede9fe] hover:bg-[#a78bfa] text-[#6d28d9] border border-[#a78bfa]/40 text-xs font-bold rounded-xl transition-all cursor-pointer">
//             Test Speech Mode
//           </button>
//         </Link>
//       </div>

//       {/* Header */}
//       <div className="flex items-center gap-3">
//         <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#a78bfa] to-[#6d28d9] flex items-center justify-center text-white font-black text-xl shadow-md border border-white/80">
//           {formData.name.slice(0, 2).toUpperCase()}
//         </div>
//         <div>
//           <h1 className="text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-[#6d28d9] to-slate-800">
//             Configure Agent: {formData.name}
//           </h1>
//           <p className="text-slate-500 text-sm">
//             Update model, voice characteristics, and system guidelines
//           </p>
//         </div>
//       </div>

//       {error && (
//         <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-600 text-sm shadow-sm">
//           {error}
//         </div>
//       )}

//       {success && (
//         <motion.div
//           initial={{ opacity: 0, y: -5 }}
//           animate={{ opacity: 1, y: 0 }}
//           className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-600 text-sm font-medium shadow-sm"
//         >
//           Agent settings updated successfully!
//         </motion.div>
//       )}

//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//         {/* Left 2 columns - Settings Form */}
//         <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-6">
//           {/* Profile Section */}
//           <FormSection title="Agent Info" icon={<AlignLeft size={16} />}>
//             <div className="space-y-4">
//               <div className="space-y-2">
//                 <label className="text-xs font-bold text-[#6d28d9] uppercase tracking-wider block">
//                   Agent Name
//                 </label>
//                 <input
//                   type="text"
//                   name="name"
//                   value={formData.name}
//                   onChange={handleInputChange}
//                   placeholder="Agent Name"
//                   className="w-full px-4 py-3 bg-white/70 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 text-sm outline-none focus:border-[#a78bfa] focus:ring-2 focus:ring-[#ede9fe] transition-all"
//                   required
//                 />
//               </div>
//               <div className="space-y-2">
//                 <label className="text-xs font-bold text-[#6d28d9] uppercase tracking-wider block">
//                   Description
//                 </label>
//                 <input
//                   type="text"
//                   name="description"
//                   value={formData.description}
//                   onChange={handleInputChange}
//                   placeholder="Short description"
//                   className="w-full px-4 py-3 bg-white/70 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 text-sm outline-none focus:border-[#a78bfa] focus:ring-2 focus:ring-[#ede9fe] transition-all"
//                 />
//               </div>
//             </div>
//           </FormSection>

//           {/* AI LLM Section */}
//           <FormSection title="LLM Configuration" icon={<Cpu size={16} />}>
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <div className="space-y-2">
//                 <label className="text-xs font-bold text-[#6d28d9] uppercase tracking-wider block">
//                   LLM Provider
//                 </label>
//                 <select
//                   name="llm_provider"
//                   value={formData.llm_provider}
//                   onChange={handleInputChange}
//                   className="w-full px-4 py-3 bg-white/80 border border-slate-200 rounded-xl text-slate-800 text-sm outline-none focus:border-[#a78bfa] focus:ring-2 focus:ring-[#ede9fe] transition-all"
//                 >
//                   <option value="openai">OpenAI</option>
//                   <option value="anthropic">Anthropic</option>
//                 </select>
//               </div>
//               <div className="space-y-2">
//                 <label className="text-xs font-bold text-[#6d28d9] uppercase tracking-wider block">
//                   LLM Model
//                 </label>
//                 <select
//                   name="llm_model"
//                   value={formData.llm_model}
//                   onChange={handleInputChange}
//                   className="w-full px-4 py-3 bg-white/80 border border-slate-200 rounded-xl text-slate-800 text-sm outline-none focus:border-[#a78bfa] focus:ring-2 focus:ring-[#ede9fe] transition-all"
//                 >
//                   {formData.llm_provider === "openai" ? (
//                     <>
//                       <option value="gpt-4o">gpt-4o</option>
//                       <option value="gpt-4o-mini">gpt-4o-mini</option>
//                       <option value="gpt-3.5-turbo">gpt-3.5-turbo</option>
//                     </>
//                   ) : (
//                     <>
//                       <option value="claude-3-5-sonnet">
//                         claude-3-5-sonnet
//                       </option>
//                       <option value="claude-3-haiku">claude-3-haiku</option>
//                     </>
//                   )}
//                 </select>
//               </div>
//             </div>
//           </FormSection>

//           {/* UI Representation */}
//           <FormSection
//             title="Voice & Visual Interface"
//             icon={<Radio size={16} />}
//           >
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <div className="space-y-2">
//                 <label className="text-xs font-bold text-[#6d28d9] uppercase tracking-wider block">
//                   Avatar Type
//                 </label>
//                 <select
//                   name="avatar_type"
//                   value={formData.avatar_type}
//                   onChange={handleInputChange}
//                   className="w-full px-4 py-3 bg-white/80 border border-slate-200 rounded-xl text-slate-800 text-sm outline-none focus:border-[#a78bfa] focus:ring-2 focus:ring-[#ede9fe] transition-all"
//                 >
//                   <option value="waveform">Waveform (Default)</option>
//                   <option value="readyplayerme">
//                     Ready Player Me (3D GLB)
//                   </option>
//                 </select>
//               </div>
//               <div className="space-y-2">
//                 <label className="text-xs font-bold text-[#6d28d9] uppercase tracking-wider block">
//                   Language
//                 </label>
//                 <select
//                   name="language"
//                   value={formData.language}
//                   onChange={handleInputChange}
//                   className="w-full px-4 py-3 bg-white/80 border border-slate-200 rounded-xl text-slate-800 text-sm outline-none focus:border-[#a78bfa] focus:ring-2 focus:ring-[#ede9fe] transition-all"
//                 >
//                   <option value="en-US">English (US)</option>
//                   <option value="es-ES">Spanish (Spain)</option>
//                   <option value="fr-FR">French (France)</option>
//                   <option value="de-DE">German (Germany)</option>
//                 </select>
//               </div>
//             </div>
//             {formData.avatar_type === "readyplayerme" && (
//               <div className="space-y-2 pt-2">
//                 <label className="text-xs font-bold text-[#6d28d9] uppercase tracking-wider block">
//                   Avatar GLB URL
//                 </label>
//                 <input
//                   type="text"
//                   name="avatar_url"
//                   value={formData.avatar_url}
//                   onChange={handleInputChange}
//                   placeholder="https://models.readyplayer.me/your-avatar.glb"
//                   className="w-full px-4 py-3 bg-white/70 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 text-sm outline-none focus:border-[#a78bfa] focus:ring-2 focus:ring-[#ede9fe] transition-all"
//                 />
//               </div>
//             )}
//           </FormSection>

//           {/* System Instructions */}
//           <div className="glass-panel rounded-2xl p-6 space-y-4 shadow-sm border border-white/60">
//             <h3 className="text-sm font-bold text-[#6d28d9] uppercase tracking-wider">
//               System Instructions
//             </h3>
//             <div className="space-y-2">
//               <textarea
//                 name="system_prompt"
//                 value={formData.system_prompt}
//                 onChange={handleInputChange}
//                 rows={6}
//                 placeholder="Write system instructions..."
//                 className="w-full px-4 py-3 bg-white/70 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 text-sm outline-none focus:border-[#a78bfa] focus:ring-2 focus:ring-[#ede9fe] transition-all resize-none leading-relaxed"
//                 required
//               />
//             </div>
//           </div>

//           <div className="flex items-center gap-4 bg-white/60 border border-slate-200/60 p-4 rounded-xl shadow-sm">
//             <label className="flex items-center gap-3 cursor-pointer select-none">
//               <input
//                 type="checkbox"
//                 name="is_active"
//                 checked={formData.is_active}
//                 onChange={(e) =>
//                   setFormData((prev) => ({
//                     ...prev,
//                     is_active: e.target.checked,
//                   }))
//                 }
//                 className="w-4 h-4 rounded text-[#6d28d9] bg-white border-slate-300 focus:ring-[#a78bfa] focus:ring-offset-2"
//               />
//               <div>
//                 <p className="text-sm font-bold text-slate-800">
//                   Active Status
//                 </p>
//                 <p className="text-[11px] text-slate-500">
//                   Toggle whether this voice agent is available for user calls.
//                 </p>
//               </div>
//             </label>
//           </div>

//           <div className="flex items-center justify-end gap-3 pt-2">
//             <Link href="/dashboard/agents">
//               <button
//                 type="button"
//                 className="px-6 py-3 bg-white/60 hover:bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-800 rounded-xl text-sm font-semibold transition-all cursor-pointer"
//               >
//                 Cancel
//               </button>
//             </Link>
//             <motion.button
//               whileHover={{ scale: 1.02 }}
//               whileTap={{ scale: 0.98 }}
//               type="submit"
//               disabled={isSaving}
//               className="px-8 py-3 bg-[#6d28d9] hover:bg-[#5b21b6] text-white rounded-xl text-sm font-bold shadow-md shadow-[#6d28d9]/10 transition-all disabled:opacity-50 cursor-pointer"
//             >
//               {isSaving ? "Saving..." : "Save Changes"}
//             </motion.button>
//           </div>
//         </form>

//         {/* Right 1 column - Integration Widget Embed */}
//         <div className="space-y-6">
//           <div className="glass-panel rounded-2xl p-6 space-y-4 shadow-sm border border-white/60">
//             <div className="flex items-center gap-2 text-[#6d28d9]">
//               <Code size={16} className="text-[#a78bfa]" />
//               <h3 className="text-sm font-bold uppercase tracking-wider text-[#6d28d9]">
//                 Embed Script
//               </h3>
//             </div>

//             <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
//               Copy and paste this script snippet before the closing{" "}
//               <code className="text-[#6d28d9] font-semibold">
//                 &lt;/body&gt;
//               </code>{" "}
//               tag on any website to embed the floatable voice assistant button.
//             </p>

//             <div className="relative bg-[#6d28d9]/5 border border-slate-200/60 rounded-xl p-3.5 overflow-hidden">
//               <pre className="text-[10px] text-[#6d28d9] font-mono overflow-x-auto whitespace-pre-wrap select-all pr-8">
//                 {embedCode}
//               </pre>
//               <button
//                 onClick={handleCopy}
//                 className="absolute top-2.5 right-2.5 p-1.5 bg-white border border-slate-200 hover:bg-[#ede9fe]/30 rounded-lg text-[#6d28d9] transition-all shadow-sm cursor-pointer"
//                 title="Copy embed script"
//               >
//                 {copied ? (
//                   <Check size={12} className="text-emerald-500" />
//                 ) : (
//                   <Copy size={12} />
//                 )}
//               </button>
//             </div>

//             <div className="p-3 bg-[#ede9fe]/50 border border-[#a78bfa]/40 rounded-xl text-[10px] text-[#6d28d9] flex items-start gap-2 leading-relaxed font-semibold">
//               <Info size={14} className="flex-none mt-0.5" />
//               <span>
//                 Note: The embed target requires browser permission for
//                 Microphone and audio output access.
//               </span>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// function FormSection({
//   title,
//   icon,
//   children,
// }: {
//   title: string;
//   icon: React.ReactNode;
//   children: React.ReactNode;
// }) {
//   return (
//     <div className="glass-panel rounded-2xl p-6 space-y-4 shadow-sm border border-white/60">
//       <div className="flex items-center gap-2 border-b border-slate-200/50 pb-3">
//         <span className="text-[#a78bfa]">{icon}</span>
//         <h2 className="text-sm font-bold uppercase tracking-wider text-[#6d28d9]">
//           {title}
//         </h2>
//       </div>
//       {children}
//     </div>
//   );
// }

"use client";

import React, { useEffect, useState, useRef, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ChevronLeft,
  Info,
  User,
  Settings,
  Code,
  Copy,
  ChevronDown,
  Play,
  Pause,
  Check,
  Trash2,
  Save,
  Sparkles,
  Volume2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import { apiClient } from "@/lib/api/client";
import { useAgentStore } from "@/store";
import type { Agent } from "@/types";
import { useToast } from "../../../../components/widget/Toast";

// ── Constants (kept in sync with the create flow) ────────────────────────────

const MUSETALK_AVATARS = [
  {
    id: "ava",
    name: "Ava",
    description: "Professional female presenter",
    preview_url: "/avatars/Ava.png",
  },
  {
    id: "yongen",
    name: "Yongen",
    description: "Default demo avatar",
    preview_url: "/avatars/Yongen.png",
  },
  {
    id: "ava2",
    name: "Ava (High Quality)",
    description: "Default demo avatar",
    preview_url: "/avatars/Ava.png",
  },
  {
    id: "ava3",
    name: "Ava (Mid Quality)",
    description: "Default demo avatar",
    preview_url: "/avatars/Ava.png",
  },
  {
    id: "ava4",
    name: "Ava (Low Quality)",
    description: "Default demo avatar",
    preview_url: "/avatars/Ava.png",
  },
];

const CARTESIA_VOICES = [
  {
    id: "47c38ca4-5f35-497b-b1a3-415245fb35e1",
    name: "Daniel",
    description: "Deep, crisp, professional corporate American male",
    language: "en",
    gender: "Masculine",
    previewUrl: "./voice/daniel.wav",
  },
  {
    id: "db6b0ed5-d5d3-463d-ae85-518a07d3c2b4",
    name: "Skylar",
    description: "Warm, empathetic conversational American female ",
    language: "en",
    gender: "Feminine",
    previewUrl: "./voice/sarah.wav",
  },
  {
    id: "95d51f79-c397-46f9-b49a-23763d3eaa2d",
    name: "Arushi",
    description:
      "Natural localized conversational English / Hindi hybrid speaker",
    language: "hi",
    gender: "Feminine",
    previewUrl: "./voice/arushi.wav",
  },
  {
    id: "62ae83ad-4f6a-430b-af41-a9bede9286ca",
    name: "British Reading Lady",
    description:
      "Elegant, authoritative Received Pronunciation (RP) storyteller",
    language: "en",
    gender: "Feminine",
    previewUrl: "./voice/british.wav",
  },
  {
    id: "79f8b5fb-2cc8-479a-80df-29f7a7cf1a3e",
    name: "Theo",
    description:
      "Friendly, casual corporate support representative from Oceania",
    language: "en",
    gender: "Masculine",
    previewUrl: "./voice/theo.wav",
  },
];

const inp =
  "w-full px-4! py-2.5! bg-white! border border-[var(--line)] rounded-xl text-[var(--ink)] text-sm placeholder-gray-400 outline-none focus:border-[var(--violet)] focus:ring-2 focus:ring-[var(--violet-100)] transition-all shadow-sm";

// ── Page ─────────────────────────────────────────────────────────────────────

export default function EditAgentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { updateAgent, removeAgent, agents } = useAgentStore();
  const { showToast } = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [copied, setCopied] = useState(false);

  // Delete modal
  const [showDelete, setShowDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Voice preview
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [form, setForm] = useState({
    name: "",
    description: "",
    system_prompt: "",
    voice_id: "",
    musetalk_avatar_id: "ava",
  });

  useEffect(() => {
    loadAgent();
  }, [id]);

  useEffect(() => {
    return () => {
      if (audioRef.current) audioRef.current.pause();
    };
  }, []);

  const set = (k: string, v: any) => setForm((prev) => ({ ...prev, [k]: v }));

  const loadAgent = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await apiClient.get<Agent>(`/api/agents/${id}`);
      hydrate(data);
    } catch (err) {
      console.warn("Failed to load agent from API, searching local store", err);
      const localAgent = agents.find((a) => a.id === id);
      if (localAgent) {
        hydrate(localAgent);
      } else {
        setError("Agent not found in registry.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const hydrate = (data: Agent) => {
    setForm({
      name: data.name ?? "",
      description: data.description ?? "",
      system_prompt: data.system_prompt ?? "",
      voice_id: (data as any).voice_id ?? "",
      musetalk_avatar_id: data.musetalk_avatar_id || "ava",
    });
  };

  const handleTogglePreview = (
    e: React.MouseEvent,
    voiceId: string,
    url: string,
  ) => {
    e.stopPropagation();
    if (playingVoiceId === voiceId) {
      audioRef.current?.pause();
      setPlayingVoiceId(null);
    } else {
      if (audioRef.current) audioRef.current.pause();
      audioRef.current = new Audio(url);
      setPlayingVoiceId(voiceId);
      audioRef.current.play().catch(() => setPlayingVoiceId(null));
      audioRef.current.onended = () => setPlayingVoiceId(null);
    }
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      setError("Agent name is required.");
      return;
    }
    setIsSaving(true);
    setError(null);
    setSuccess(false);

    const slug = form.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const payload = { ...form, slug };

    try {
      const response = await apiClient.patch<Agent>(
        `/api/agents/${id}`,
        payload,
      );
      updateAgent(id, response);
      setSuccess(true);
      showToast({
        type: "success",
        title: "Agent updated",
        message: "Your changes were saved successfully.",
      });
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.warn("API patch failed, editing client-side mock agent", err);
      updateAgent(id, payload as any);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    if (id.startsWith("demo-")) {
      removeAgent(id);
      setShowDelete(false);
      setIsDeleting(false);
      router.push("/dashboard/agents");
      return;
    }
    try {
      await apiClient.delete(`/api/agents/${id}`);
      removeAgent(id);
      setShowDelete(false);
      showToast({
        type: "success",
        title: "Voice agent deleted",
        message: "The agent was removed successfully.",
      });
      router.push("/dashboard/agents");
    } catch {
      setError("Failed to delete the agent from server");
      showToast({
        type: "error",
        title: "Delete failed",
        message: "Something went wrong. Try again.",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const embedCode = `<!-- VoiceAgent Embeddable Assistant Widget -->
<script src="${typeof window !== "undefined" ? window.location.origin : ""}/components/widget/widget.js" async>
</script>

<script>
  window.VoiceAgentConfig = {
    agentId: "${id}",
    apiUrl: "${typeof window !== "undefined" ? window.location.origin : ""}"
  };
</script>
`;

  const handleCopy = () => {
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4 text-gray-400">
        <div className="w-8 h-8 border-2 border-[var(--line)] border-t-[var(--violet)] rounded-full animate-spin" />
        <span className="text-sm font-medium">Loading agent settings…</span>
      </div>
    );
  }

  return (
    <div className="min-h-full text-[var(--foreground)] p-8! md:p-12!">
      <div className="max-w-[1200px] mx-auto">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-4!">
          <div className="flex items-center gap-3">
            <Link href="/dashboard/agents">
              <button className="p-2! -ml-2! rounded-lg text-gray-500 hover:text-black hover:bg-gray-100 transition-all">
                <ChevronLeft size={20} />
              </button>
            </Link>
            <div>
              <span className="eyebrow mb-2!">
                <Sparkles size={11} /> Configure
              </span>
              <h2 className="text-xl font-semibold text-[var(--ink)] tracking-tight mt-2!">
                {form.name || "Agent"}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link href={`/dashboard/agents/${id}/test`}>
              <button className="px-4! py-2! bg-[var(--violet-050)] hover:bg-[var(--violet-100)] text-[var(--violet-700)] border border-[var(--violet-100)] text-xs font-semibold rounded-xl transition-all">
                Test Speech Mode
              </button>
            </Link>
            <button
              onClick={handleSubmit}
              disabled={isSaving}
              className="bg-[#7c3aed] hover:bg-[#6d28d9] text-white px-4! py-2! rounded-lg flex items-center gap-2 text-sm font-medium shadow-sm transition-all disabled:opacity-60"
            >
              <Save size={16} /> {isSaving ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </div>

        <div className="border-b border-[var(--line)] my-6! w-full" />

        {/* Alerts */}
        {error && (
          <div className="px-4! py-3! mb-6! bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm flex items-center gap-2">
            <Info size={16} /> {error}
          </div>
        )}
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="px-4! py-3! mb-6! bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-600 text-sm font-medium flex items-center gap-2"
          >
            <Check size={16} /> Agent settings updated successfully!
          </motion.div>
        )}

        <div className="space-y-6!">
          {/* ── Basic Information ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6!">
            <Card
              title="Basic Information"
              icon={<Info size={16} className="text-[#7c3aed]" />}
            >
              <div className="space-y-4!">
                <Field label="Agent Name *">
                  <input
                    value={form.name}
                    onChange={(e) => set("name", e.target.value)}
                    placeholder="Support Desk 1"
                    className={inp}
                  />
                </Field>
                <Field label="Description">
                  <textarea
                    value={form.description}
                    onChange={(e) => set("description", e.target.value)}
                    rows={4}
                    placeholder="Short description"
                    className={`${inp} resize-none`}
                  />
                </Field>
              </div>
            </Card>

            {/* ── Change Voice ── */}
            <Card
              title="Change Voice"
              icon={<Volume2 size={16} className="text-[#7c3aed]" />}
            >
              <Field label="Voice">
                <div className="relative">
                  <select
                    value={form.voice_id}
                    onChange={(e) => set("voice_id", e.target.value)}
                    className={`${inp} appearance-none pr-10!`}
                  >
                    <option value="">Select a voice timbre</option>
                    {CARTESIA_VOICES.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.name} ({v.description})
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-3! top-1/2 -translate-y-1/2 pointer-events-none">
                    <ChevronDown size={16} className="text-gray-400" />
                  </div>
                </div>
              </Field>
              {form.voice_id && (
                <button
                  onClick={(e) => {
                    const v = CARTESIA_VOICES.find(
                      (x) => x.id === form.voice_id,
                    );
                    if (v) handleTogglePreview(e, v.id, v.previewUrl);
                  }}
                  className="mt-3! flex items-center gap-2 text-xs font-semibold text-[var(--violet-700)] hover:text-[var(--violet)] transition-colors"
                >
                  {playingVoiceId === form.voice_id ? (
                    <Pause size={14} fill="currentColor" />
                  ) : (
                    <Play size={14} fill="currentColor" />
                  )}
                  Preview Selected Voice
                </button>
              )}
              {!form.voice_id && (
                <p className="mt-3! text-xs text-gray-400">
                  Pick a voice to preview how your agent will sound.
                </p>
              )}
            </Card>
          </div>

          {/* ── Change Avatar ── */}
          <Card
            title="Change Avatar"
            icon={<User size={16} className="text-[#7c3aed]" />}
          >
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4!">
              {MUSETALK_AVATARS.map((av) => (
                <AvatarCard
                  key={av.id}
                  avatar={av}
                  previewUrl={av.preview_url}
                  selected={form.musetalk_avatar_id === av.id}
                  onClick={() => set("musetalk_avatar_id", av.id)}
                />
              ))}
            </div>
          </Card>

          {/* ── System Instructions ── */}
          <Card
            title="System Instructions"
            icon={<Settings size={16} className="text-[#7c3aed]" />}
          >
            <Field label="System Prompt *">
              <textarea
                value={form.system_prompt}
                onChange={(e) => set("system_prompt", e.target.value)}
                rows={9}
                placeholder="Write system instructions…"
                className={`${inp} resize-none bg-gray-50! leading-relaxed`}
              />
            </Field>
          </Card>

          {/* ── Embed Code ── */}
          <Card
            title="Embed Code"
            icon={<Code size={16} className="text-[#7c3aed]" />}
          >
            <div className="bg-[#f0f7ff] p-4! rounded-xl mb-6! text-[#0c4a6e] flex gap-3">
              <Info size={20} className="shrink-0 text-blue-500" />
              <div>
                <p className="font-medium mb-1!">Implementation Guide:</p>
                <ol className="list-decimal list-inside text-sm opacity-80">
                  <li>Copy the script tag below</li>
                  <li>
                    Paste it into your index.html just before the &lt;/body&gt;
                    tag
                  </li>
                </ol>
              </div>
            </div>
            <div className="bg-[#1a1a1a] p-5! rounded-2xl mb-6! font-mono text-sm text-green-400 overflow-x-auto whitespace-pre-wrap">
              {embedCode}
            </div>
            <button
              onClick={handleCopy}
              className="bg-[#7c3aed] hover:bg-[#6d28d9] text-white px-6! py-2.5! rounded-lg flex items-center gap-2 transition-all"
            >
              <Copy size={18} /> {copied ? "Copied!" : "Copy Embed Code"}
            </button>
          </Card>

          {/* ── Danger Zone ── */}
          <div className="bg-white border border-red-200 rounded-2xl p-6! shadow-[var(--shadow-sm)]">
            <div className="flex items-center gap-2 mb-4! text-red-600">
              <Trash2 size={16} />
              <h2 className="text-base font-semibold text-[var(--ink)]">
                Delete Agent
              </h2>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-4!">
              <p className="text-sm text-[var(--slate)] max-w-lg">
                Permanently remove this voice agent and its configuration. This
                action cannot be undone.
              </p>
              <button
                onClick={() => setShowDelete(true)}
                className="inline-flex items-center gap-2 rounded-lg bg-red-600 hover:bg-red-700 text-white px-5! py-2.5! text-sm font-medium shadow-sm transition-all"
              >
                <Trash2 size={15} /> Delete Agent
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Delete Confirmation Modal ── */}
      {showDelete &&
        createPortal(
          <div className="!fixed !inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm !p-4">
            <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-start gap-4 border-b border-gray-100 !px-6 !py-5">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-red-100">
                  <svg
                    className="h-5 w-5 text-red-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                    />
                  </svg>
                </div>
                <div className="!mt-0.5">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Delete Voice Agent
                  </h2>
                  <p className="!mt-1.5 text-sm leading-relaxed text-gray-500">
                    Are you sure you want to delete this voice agent? This
                    action cannot be undone.
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-3 bg-gray-50 !px-6 !py-4">
                <button
                  disabled={isDeleting}
                  onClick={() => setShowDelete(false)}
                  className="rounded-lg border border-gray-300 bg-white !px-4 !py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  disabled={isDeleting}
                  onClick={handleDelete}
                  className="inline-flex items-center justify-center rounded-lg bg-red-600 !px-4 !py-2 text-sm font-medium text-white shadow-sm transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-400"
                >
                  {isDeleting ? (
                    <span className="flex items-center gap-2">
                      <svg
                        className="h-4 w-4 animate-spin"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                        />
                      </svg>
                      Deleting…
                    </span>
                  ) : (
                    "Delete"
                  )}
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}

// ── Shared UI Components (mirrors the create flow) ───────────────────────────

function Card({ title, icon, children, className }: any) {
  return (
    <div
      className={`bg-white border border-[var(--line)] rounded-2xl p-6! shadow-[var(--shadow-sm)] ${className || ""}`}
    >
      <div className="flex items-center gap-2 mb-6! text-[var(--violet-700)]">
        {icon}{" "}
        <h2 className="text-base font-semibold text-[var(--ink)]">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function Field({ label, children }: any) {
  return (
    <div className="w-full">
      <label className="block text-[13px] font-medium text-[var(--slate)] mb-1.5!">
        {label}
      </label>
      {children}
    </div>
  );
}

function AvatarCard({ avatar, selected, onClick, previewUrl }: any) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative flex flex-col items-center gap-3 p-4! rounded-2xl border transition-all ${
        selected
          ? "border-[var(--violet)] bg-[var(--violet-050)] ring-1 ring-[var(--violet)]"
          : "border-[var(--line)] bg-white hover:border-[var(--violet-100)] hover:bg-[var(--violet-050)]/40"
      }`}
    >
      {selected && (
        <span
          className="absolute top-2.5! right-2.5! w-5 h-5 rounded-full grid place-items-center text-white"
          style={{ background: "var(--grad)" }}
        >
          <Check size={11} strokeWidth={3} />
        </span>
      )}
      <div className="rounded-full ring-1 ring-[var(--line)] bg-gray-100 overflow-hidden w-20 h-20">
        <img
          src={previewUrl || "https://ui-avatars.com/api/?name=A"}
          alt={avatar.name}
          className="w-full h-full object-cover"
        />
      </div>
      <p
        className={`text-sm font-medium ${selected ? "text-[var(--violet-700)]" : "text-[var(--ink)]"}`}
      >
        {avatar.name}
      </p>
    </button>
  );
}

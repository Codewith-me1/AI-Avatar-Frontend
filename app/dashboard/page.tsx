// "use client";

// import { useEffect, useState } from "react";
// import { motion } from "framer-motion";
// import Link from "next/link";
// import {
//   Plus,
//   Mic,
//   Settings,
//   Trash2,
//   Shield,
//   Info,
//   Radio,
//   Database,
// } from "lucide-react";
// import { useAgentStore } from "@/store";
// import { apiClient } from "@/lib/api/client";
// import type { Agent } from "@/types";

// // Premium demo agents to display when the API is not active or empty
// const DEMO_AGENTS: Agent[] = [
//   {
//     id: "demo-sarah",
//     name: "Sarah (Customer Support)",
//     slug: "sarah-support",
//     description:
//       "Empathetic customer success agent specialized in SaaS troubleshooting, billing questions, and onboarding.",
//     system_prompt:
//       "You are Sarah, a customer support agent. Be warm, professional, and clear.",
//     language: "en-US",
//     avatar_type: "waveform",
//     llm_provider: "openai",
//     llm_model: "gpt-4o",
//     is_public: true,
//     is_active: true,
//   },
//   {
//     id: "demo-alex",
//     name: "Alex (Tech Recruiter)",
//     slug: "alex-recruiter",
//     description:
//       "Highly engaging interactive voice recruiter. Conducts technical screenings and schedules follow-up interviews.",
//     system_prompt:
//       "You are Alex, a tech recruiter. Be upbeat, ask screening questions, and assess skills.",
//     language: "en-US",
//     avatar_type: "readyplayerme",
//     avatar_url: "https://models.readyplayer.me/64b58e72750e6878b6711a78.glb",
//     llm_provider: "anthropic",
//     llm_model: "claude-3-5-sonnet",
//     is_public: true,
//     is_active: true,
//   },
//   {
//     id: "demo-elena",
//     name: "Elena (Spanish Tutor)",
//     slug: "elena-espanol",
//     description:
//       "Converse in natural Spanish. Adjusts vocabulary based on your speech and provides supportive corrections.",
//     system_prompt:
//       "You are Elena, a friendly Spanish tutor. Guide the user in learning conversational Spanish.",
//     language: "es-ES",
//     avatar_type: "waveform",
//     llm_provider: "openai",
//     llm_model: "gpt-4o",
//     is_public: true,
//     is_active: false,
//   },
// ];

// export default function AgentsPage() {
//   const { agents, setAgents, removeAgent, isLoading, setLoading } =
//     useAgentStore();
//   const [error, setError] = useState<string | null>(null);
//   const [isDemoMode, setIsDemoMode] = useState(false);

//   useEffect(() => {
//     loadAgents();
//   }, []);

//   async function loadAgents() {
//     setLoading(true);
//     setError(null);
//     try {
//       const data = await apiClient.get<Agent[]>("/api/agents/");
//       if (data && data.length > 0) {
//         setAgents(data);
//         setIsDemoMode(false);
//       } else {
//         setAgents(DEMO_AGENTS);
//         setIsDemoMode(true);
//       }
//     } catch (e) {
//       console.warn(
//         "Failed to load agents from API. Loading offline demo agents instead.",
//         e,
//       );
//       setAgents(DEMO_AGENTS);
//       setIsDemoMode(true);
//     } finally {
//       setLoading(false);
//     }
//   }

//   async function handleDelete(id: string) {
//     if (!confirm("Are you sure you want to delete this voice agent?")) return;

//     if (isDemoMode || id.startsWith("demo-")) {
//       removeAgent(id);
//       return;
//     }

//     try {
//       await apiClient.delete(`/api/agents/${id}`);
//       removeAgent(id);
//     } catch (e) {
//       setError("Failed to delete the agent from server");
//     }
//   }

//   return (
//     <div className="p-8 max-w-7xl mx-auto space-y-6">
//       {/* Header section matching LiveAvatar style */}
//       <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-5">
//         <div className="flex items-center gap-3">
//           <h1 className="text-2xl font-black text-slate-800 tracking-tight">
//             Voice Agents ({agents.length})
//           </h1>
//           <a
//             href="/api/agents"
//             target="_blank"
//             rel="noopener noreferrer"
//             className="inline-flex items-center gap-1 px-2.5 py-1 bg-black text-[9px] font-black text-white rounded-md tracking-wider hover:opacity-90 transition-opacity"
//           >
//             GET /api/agents
//             <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block ml-0.5" />
//           </a>
//         </div>

//         <div className="flex items-center gap-3">
//           {isDemoMode && (
//             <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 text-xs font-bold shadow-sm">
//               <Info size={12} className="text-amber-600" />
//               Demo mode fallback
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Connection error banner */}
//       {error && (
//         <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-700 text-sm flex items-center gap-3 shadow-sm">
//           <Shield size={16} className="text-red-500/80 flex-none" />
//           <span>{error}</span>
//         </div>
//       )}

//       {/* Loading state */}
//       {isLoading && (
//         <div className="flex flex-col items-center justify-center h-64 gap-3 text-slate-400">
//           <div className="w-10 h-10 border-4 border-[#424874] border-t-transparent rounded-full animate-spin" />
//           <span className="text-sm font-semibold">
//             Retrieving voice registry...
//           </span>
//         </div>
//       )}

//       {/* Agents grid */}
//       {!isLoading && (
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
//           {/* First element is the Create New Card matching reference image */}
//           <Link href="/dashboard/agents/new" className="block h-full">
//             <motion.div
//               whileHover={{ scale: 1.01, y: -2 }}
//               className="border border-dashed border-slate-300 hover:border-[#A6B1E1] rounded-2xl p-6 flex flex-col items-center justify-center min-h-[240px] h-full bg-slate-50/10 hover:bg-slate-50/40 transition-all cursor-pointer group"
//             >
//               <div className="w-11 h-11 rounded-full border border-slate-200 bg-white flex items-center justify-center shadow-sm text-slate-400 group-hover:text-[#424874] group-hover:border-[#A6B1E1] transition-colors mb-3">
//                 <Plus size={20} />
//               </div>
//               <span className="text-xs font-extrabold text-slate-600 group-hover:text-[#424874] transition-colors">
//                 Create New
//               </span>
//             </motion.div>
//           </Link>

//           {/* Render existing agents list */}
//           {agents.map((agent, i) => (
//             <AgentCard
//               key={agent.id}
//               agent={agent}
//               index={i}
//               onDelete={() => handleDelete(agent.id)}
//             />
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }

// function AgentCard({
//   agent,
//   index,
//   onDelete,
// }: {
//   agent: Agent;
//   index: number;
//   onDelete: () => void;
// }) {
//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 15 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ delay: index * 0.04 }}
//       className="group relative bg-[#f8fafc]/30 hover:bg-white border border-slate-200/60 rounded-2xl p-6 transition-all duration-300 hover:border-[#A6B1E1]/40 shadow-sm hover:shadow-md flex flex-col justify-between min-h-[240px]"
//     >
//       <div>
//         {/* Top Header Section */}
//         <div className="flex justify-between items-start mb-5">
//           <div className="space-y-1">
//             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
//               Name
//             </span>
//             <h3 className="font-extrabold text-slate-800 text-sm group-hover:text-[#424874] transition-colors leading-snug">
//               {agent.name}
//             </h3>
//           </div>

//           <div className="flex items-center gap-1">
//             <Link href={`/dashboard/agents/${agent.id}`}>
//               <button
//                 className="w-7 h-7 rounded-md bg-white hover:bg-slate-50 border border-slate-200/50 flex items-center justify-center text-slate-400 hover:text-[#424874] transition-colors shadow-sm cursor-pointer"
//                 title="Configure settings"
//               >
//                 <Settings size={13} />
//               </button>
//             </Link>
//             <button
//               onClick={onDelete}
//               className="w-7 h-7 rounded-md bg-white hover:bg-red-50 border border-slate-200/50 flex items-center justify-center text-slate-400 hover:text-red-600 transition-colors shadow-sm cursor-pointer"
//               title="Delete agent"
//             >
//               <Trash2 size={13} />
//             </button>
//           </div>
//         </div>

//         {/* Info Grid Section */}
//         <div className="space-y-3.5 border-t border-slate-100 pt-4">
//           <div>
//             <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
//               LLM Pipeline
//             </span>
//             <span className="text-xs font-semibold text-slate-700 block mt-0.5 capitalize">
//               {agent.llm_provider} ({agent.llm_model})
//             </span>
//           </div>

//           <div className="grid grid-cols-2 gap-4">
//             <div>
//               <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
//                 Language
//               </span>
//               <span className="text-xs font-semibold text-slate-700 block mt-0.5">
//                 {agent.language}
//               </span>
//             </div>
//             <div>
//               <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
//                 Status
//               </span>
//               <div className="flex items-center gap-1.5 mt-1">
//                 <span
//                   className={`w-1.5 h-1.5 rounded-full ${agent.is_active ? "bg-emerald-500 shadow-sm" : "bg-slate-300"}`}
//                 />
//                 <span className="text-xs font-bold text-slate-600">
//                   {agent.is_active ? "Active" : "Idle"}
//                 </span>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Action Footer */}
//       <Link href={`/dashboard/agents/${agent.id}/test`} className="mt-5 block">
//         <motion.button
//           whileHover={{ scale: 1.01 }}
//           whileTap={{ scale: 0.99 }}
//           className="w-full py-2 bg-[#DCD6F7]/50 hover:bg-[#DCD6F7] text-[#424874] font-bold text-[11px] rounded-lg border border-[#A6B1E1]/10 shadow-sm transition-colors cursor-pointer flex items-center justify-center gap-1.5"
//         >
//           <Mic size={11} />
//           Test Speech Sandbox
//         </motion.button>
//       </Link>
//     </motion.div>
//   );
// }

// "use client";

// import { useState } from "react";
// import { useRouter } from "next/navigation";
// import { motion } from "framer-motion";
// import { Check, ChevronLeft, User } from "lucide-react";
// import { AVATAR_OPTIONS, type AvatarOption } from "@/components/avatar/Avatars";
// import { apiClient } from "@/lib/api/client";

// const LLM_MODELS = [
//   { value: "gpt-4o-mini", label: "GPT-4o Mini", provider: "openai" },
//   { value: "gpt-4o", label: "GPT-4o", provider: "openai" },
//   {
//     value: "claude-3-5-sonnet-20241022",
//     label: "Claude 3.5 Sonnet",
//     provider: "anthropic",
//   },
//   {
//     value: "claude-3-5-haiku-20241022",
//     label: "Claude 3.5 Haiku",
//     provider: "anthropic",
//   },
// ];

// export default function NewAgentPage() {
//   const router = useRouter();
//   const [saving, setSaving] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [form, setForm] = useState({
//     name: "",
//     description: "",
//     language: "en",
//     voice_id: "",
//     system_prompt:
//       "You are a helpful voice assistant. Keep responses concise — under 3 sentences.",
//     llm_model: "gpt-4o-mini",
//     llm_provider: "openai",
//     is_public: true,
//     avatar_id: AVATAR_OPTIONS[0].id,
//   });

//   const set = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));

//   const handleModelChange = (value: string) => {
//     const m = LLM_MODELS.find((m) => m.value === value);
//     set("llm_model", value);
//     if (m) set("llm_provider", m.provider);
//   };

//   const handleSubmit = async () => {
//     if (!form.name.trim()) {
//       setError("Name is required.");
//       return;
//     }
//     if (form.system_prompt.trim().length < 10) {
//       setError("System prompt must be at least 10 characters.");
//       return;
//     }
//     setSaving(true);
//     setError(null);
//     try {
//       await apiClient.post("/api/agents/", form);
//       router.push("/dashboard");
//     } catch (e: any) {
//       setError(e.message ?? "Failed to create agent");
//     } finally {
//       setSaving(false);
//     }
//   };

//   return (
//     <div className="p-8 max-w-2xl mx-auto">
//       <div className="flex items-center gap-3 mb-8">
//         <button
//           onClick={() => router.back()}
//           className="text-white/40 hover:text-white transition-colors"
//         >
//           <ChevronLeft size={20} />
//         </button>
//         <div>
//           <h1 className="text-2xl font-bold text-white">New Agent</h1>
//           <p className="text-white/40 text-sm mt-0.5">
//             Configure your AI voice agent
//           </p>
//         </div>
//       </div>

//       <div className="space-y-5">
//         <Card title="Identity">
//           <Field label="Name *">
//             <input
//               value={form.name}
//               onChange={(e) => set("name", e.target.value)}
//               placeholder="e.g. Support Bot"
//               className={inp}
//             />
//           </Field>
//           <Field label="Description">
//             <input
//               value={form.description}
//               onChange={(e) => set("description", e.target.value)}
//               placeholder="What does this agent do?"
//               className={inp}
//             />
//           </Field>
//         </Card>

//         <Card title="System Prompt">
//           <textarea
//             value={form.system_prompt}
//             onChange={(e) => set("system_prompt", e.target.value)}
//             rows={5}
//             className={`${inp} resize-none`}
//           />
//           <p className="text-xs text-white/30 mt-1.5">
//             Keep it concise — agents respond in real-time voice.
//           </p>
//         </Card>

//         <Card title="Avatar — LiveAvatar">
//           <p className="text-xs text-white/40 mb-3">
//             Select the human avatar that will appear to users. Rendered live via
//             LiveAvatar in the LiveKit room.
//           </p>
//           <div className="grid grid-cols-3 gap-2">
//             {AVATAR_OPTIONS.map((av) => (
//               <AvatarCard
//                 key={av.id}
//                 avatar={av}
//                 selected={form.avatar_id === av.id}
//                 onClick={() => set("avatar_id", av.id)}
//               />
//             ))}
//           </div>
//         </Card>

//         <Card title="Language Model">
//           <div className="grid grid-cols-2 gap-2">
//             {LLM_MODELS.map((m) => (
//               <button
//                 key={m.value}
//                 type="button"
//                 onClick={() => handleModelChange(m.value)}
//                 className={`p-3 rounded-xl border text-left text-sm transition-all ${
//                   form.llm_model === m.value
//                     ? "border-violet-500/60 bg-violet-500/10 text-white"
//                     : "border-white/10 bg-white/3 text-white/50 hover:bg-white/6"
//                 }`}
//               >
//                 <div className="font-medium text-sm">{m.label}</div>
//                 <div className="text-xs text-white/30 mt-0.5 capitalize">
//                   {m.provider}
//                 </div>
//               </button>
//             ))}
//           </div>
//         </Card>

//         <Card title="Voice (optional)">
//           <Field label="Cartesia Voice ID">
//             <input
//               value={form.voice_id}
//               onChange={(e) => set("voice_id", e.target.value)}
//               placeholder="Leave blank to use default"
//               className={inp}
//             />
//           </Field>
//           <p className="text-xs text-white/30 mt-1">
//             Find IDs at{" "}
//             <a
//               href="https://play.cartesia.ai"
//               target="_blank"
//               rel="noreferrer"
//               className="text-violet-400 hover:underline"
//             >
//               play.cartesia.ai
//             </a>
//           </p>
//         </Card>

//         {error && (
//           <div className="px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
//             {error}
//           </div>
//         )}

//         <motion.button
//           whileHover={{ scale: 1.01 }}
//           whileTap={{ scale: 0.99 }}
//           onClick={handleSubmit}
//           disabled={saving}
//           className="w-full py-3.5 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-white font-medium transition-colors shadow-lg shadow-violet-600/20"
//         >
//           {saving ? "Creating…" : "Create Agent"}
//         </motion.button>
//       </div>
//     </div>
//   );
// }

// function AvatarCard({
//   avatar,
//   selected,
//   onClick,
// }: {
//   avatar: AvatarOption;
//   selected: boolean;
//   onClick: () => void;
// }) {
//   return (
//     <motion.button
//       type="button"
//       whileHover={{ scale: 1.02 }}
//       whileTap={{ scale: 0.97 }}
//       onClick={onClick}
//       className={`relative flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${
//         selected
//           ? "border-violet-500/60 bg-violet-500/10"
//           : "border-white/8 bg-white/3 hover:bg-white/6"
//       }`}
//     >
//       {selected && (
//         <motion.div
//           initial={{ scale: 0 }}
//           animate={{ scale: 1 }}
//           className="absolute top-2 right-2 w-4 h-4 rounded-full bg-violet-500 flex items-center justify-center"
//         >
//           <Check size={9} className="text-white" />
//         </motion.div>
//       )}
//       <div
//         className="w-12 h-12 rounded-xl flex items-center justify-center"
//         style={{ background: avatar.previewGradient }}
//       >
//         <User size={20} className="text-white/60" />
//       </div>
//       <div className="text-center">
//         <p className="text-xs font-semibold text-white">{avatar.name}</p>
//         <p className="text-[9px] text-white/40 mt-0.5 capitalize">
//           {avatar.style}
//         </p>
//       </div>
//     </motion.button>
//   );
// }

// function Card({
//   title,
//   children,
// }: {
//   title: string;
//   children: React.ReactNode;
// }) {
//   return (
//     <div className="bg-white/3 border border-white/8 rounded-2xl p-5">
//       <h2 className="text-sm font-semibold text-white/70 mb-4">{title}</h2>
//       {children}
//     </div>
//   );
// }
// function Field({
//   label,
//   children,
// }: {
//   label: string;
//   children: React.ReactNode;
// }) {
//   return (
//     <div className="mb-3 last:mb-0">
//       <label className="block text-xs text-white/40 mb-1.5">{label}</label>
//       {children}
//     </div>
//   );
// }
// const inp =
//   "w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder-white/25 outline-none focus:border-violet-500/50 transition-colors";

// Current Old
// "use client";

// import { useState } from "react";
// import { useRouter } from "next/navigation";
// import { motion } from "framer-motion";
// import { Check, ChevronLeft, User, Sparkles, Cpu } from "lucide-react";
// import { AVATAR_OPTIONS, type AvatarOption } from "@/components/avatar/Avatars";
// import { apiClient } from "@/lib/api/client";

// const LLM_MODELS = [
//   { value: "gpt-4o-mini", label: "GPT-4o Mini", provider: "openai" },
//   { value: "gpt-4o", label: "GPT-4o", provider: "openai" },
//   {
//     value: "claude-3-5-sonnet-20241022",
//     label: "Claude 3.5 Sonnet",
//     provider: "anthropic",
//   },
//   {
//     value: "claude-3-5-haiku-20241022",
//     label: "Claude 3.5 Haiku",
//     provider: "anthropic",
//   },
// ];

// export default function NewAgentPage() {
//   const router = useRouter();
//   const [saving, setSaving] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [form, setForm] = useState({
//     name: "",
//     description: "",
//     language: "en",
//     voice_id: "",
//     system_prompt:
//       "You are a helpful voice assistant. Keep responses concise — under 3 sentences.",
//     llm_model: "gpt-4o-mini",
//     llm_provider: "openai",
//     is_public: true,
//     avatar_id: AVATAR_OPTIONS[0].id,
//   });

//   const set = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));

//   const handleModelChange = (value: string) => {
//     const m = LLM_MODELS.find((m) => m.value === value);
//     set("llm_model", value);
//     if (m) set("llm_provider", m.provider);
//   };

//   const handleSubmit = async () => {
//     if (!form.name.trim()) {
//       setError("Name is required.");
//       return;
//     }
//     if (form.system_prompt.trim().length < 10) {
//       setError("System prompt must be at least 10 characters.");
//       return;
//     }
//     setSaving(true);
//     setError(null);
//     try {
//       await apiClient.post("/api/agents/", form);
//       router.push("/dashboard");
//     } catch (e: any) {
//       setError(e.message ?? "Failed to create agent");
//     } finally {
//       setSaving(false);
//     }
//   };

//   return (
//     <div className="p-6 md:p-10 max-w-3xl mx-auto min-h-screen text-slate-200">
//       {/* ── Header ──────────────────────────────────────────────────────── */}
//       <div className="flex items-center gap-4 mb-10">
//         <button
//           onClick={() => router.back()}
//           className="p-2 -ml-2 rounded-xl text-white/40 hover:text-white hover:bg-white/5 transition-all"
//         >
//           <ChevronLeft size={22} />
//         </button>
//         <div>
//           <h1 className="text-2xl md:text-3xl font-semibold text-white tracking-tight">
//             Configure Agent
//           </h1>
//           <p className="text-white/50 text-sm mt-1">
//             Design your AI's identity, brain, and appearance.
//           </p>
//         </div>
//       </div>

//       <div className="space-y-6">
//         {/* ── Identity Card ──────────────────────────────────────────────── */}
//         <Card
//           title="Identity"
//           icon={<User size={16} className="text-indigo-400" />}
//         >
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
//             <Field label="Agent Name *">
//               <input
//                 value={form.name}
//                 onChange={(e) => set("name", e.target.value)}
//                 placeholder="e.g. Sales Assistant"
//                 className={inp}
//               />
//             </Field>
//             <Field label="Description (Internal)">
//               <input
//                 value={form.description}
//                 onChange={(e) => set("description", e.target.value)}
//                 placeholder="What is this agent's purpose?"
//                 className={inp}
//               />
//             </Field>
//           </div>
//         </Card>

//         {/* ── System Prompt Card ─────────────────────────────────────────── */}
//         <Card
//           title="System Prompt"
//           icon={<Sparkles size={16} className="text-teal-400" />}
//         >
//           <textarea
//             value={form.system_prompt}
//             onChange={(e) => set("system_prompt", e.target.value)}
//             rows={4}
//             className={`${inp} resize-none leading-relaxed`}
//           />
//           <p className="text-xs text-white/40 mt-2 flex items-center gap-1.5">
//             <span className="w-1.5 h-1.5 rounded-full bg-teal-500/50" />
//             Keep it concise — Voice agents sound best with short, conversational
//             responses.
//           </p>
//         </Card>

//         {/* ── Avatar Card ────────────────────────────────────────────────── */}
//         <Card
//           title="LiveAvatar Interface"
//           icon={<User size={16} className="text-indigo-400" />}
//         >
//           <p className="text-sm text-white/50 mb-4">
//             Select the human avatar that will stream live to your users.
//           </p>
//           <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
//             {AVATAR_OPTIONS.map((av) => (
//               <AvatarCard
//                 key={av.id}
//                 avatar={av}
//                 selected={form.avatar_id === av.id}
//                 onClick={() => set("avatar_id", av.id)}
//               />
//             ))}
//           </div>
//         </Card>

//         {/* ── LLM Card ───────────────────────────────────────────────────── */}
//         <Card
//           title="Language Engine"
//           icon={<Cpu size={16} className="text-teal-400" />}
//         >
//           <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
//             {LLM_MODELS.map((m) => {
//               const isSelected = form.llm_model === m.value;
//               return (
//                 <button
//                   key={m.value}
//                   type="button"
//                   onClick={() => handleModelChange(m.value)}
//                   className={`
//                     relative flex flex-col p-4 rounded-xl border text-left transition-all overflow-hidden
//                     ${
//                       isSelected
//                         ? "border-indigo-500/50 bg-indigo-500/10 shadow-sm"
//                         : "border-white/10 bg-black/20 hover:bg-white/5 hover:border-white/20"
//                     }
//                   `}
//                 >
//                   <div
//                     className={`font-medium text-sm ${isSelected ? "text-indigo-100" : "text-white/80"}`}
//                   >
//                     {m.label}
//                   </div>
//                   <div className="text-xs text-white/40 mt-1 capitalize tracking-wide">
//                     {m.provider}
//                   </div>
//                   {isSelected && (
//                     <motion.div
//                       layoutId="activeModel"
//                       className="absolute inset-0 border-2 border-indigo-500/50 rounded-xl pointer-events-none"
//                       initial={false}
//                       transition={{
//                         type: "spring",
//                         bounce: 0.2,
//                         duration: 0.6,
//                       }}
//                     />
//                   )}
//                 </button>
//               );
//             })}
//           </div>
//         </Card>

//         {/* ── Voice & Error ──────────────────────────────────────────────── */}
//         <Card title="Voice Configuration">
//           <Field label="Cartesia Voice ID (Optional)">
//             <input
//               value={form.voice_id}
//               onChange={(e) => set("voice_id", e.target.value)}
//               placeholder="Leave blank to use the avatar's default voice"
//               className={inp}
//             />
//           </Field>
//           <p className="text-xs text-white/40 mt-2">
//             Find custom voice IDs at{" "}
//             <a
//               href="https://play.cartesia.ai"
//               target="_blank"
//               rel="noreferrer"
//               className="text-indigo-400 hover:text-indigo-300 hover:underline transition-colors"
//             >
//               play.cartesia.ai
//             </a>
//           </p>
//         </Card>

//         {/* ── Submit Area ────────────────────────────────────────────────── */}
//         <div className="pt-4 pb-12">
//           {error && (
//             <motion.div
//               initial={{ opacity: 0, y: -10 }}
//               animate={{ opacity: 1, y: 0 }}
//               className="px-4 py-3 mb-6 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm flex items-center gap-2"
//             >
//               <div className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
//               {error}
//             </motion.div>
//           )}

//           <motion.button
//             whileHover={{ scale: 1.01 }}
//             whileTap={{ scale: 0.99 }}
//             onClick={handleSubmit}
//             disabled={saving}
//             className={`
//               w-full py-4 rounded-xl text-white font-medium text-base transition-all
//               shadow-lg flex items-center justify-center gap-2
//               ${
//                 saving
//                   ? "bg-indigo-500/50 cursor-not-allowed"
//                   : "bg-indigo-600 hover:bg-indigo-500 hover:shadow-indigo-500/25"
//               }
//             `}
//           >
//             {saving ? (
//               <span className="flex items-center gap-2">
//                 <motion.div
//                   animate={{ rotate: 360 }}
//                   transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
//                   className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
//                 />
//                 Provisioning Agent…
//               </span>
//             ) : (
//               "Create Agent"
//             )}
//           </motion.button>
//         </div>
//       </div>
//     </div>
//   );
// }

// // ── Components ─────────────────────────────────────────────────────────────

// function AvatarCard({
//   avatar,
//   selected,
//   onClick,
// }: {
//   avatar: AvatarOption;
//   selected: boolean;
//   onClick: () => void;
// }) {
//   return (
//     <motion.button
//       type="button"
//       whileHover={{ scale: 1.02 }}
//       whileTap={{ scale: 0.97 }}
//       onClick={onClick}
//       className={`relative flex flex-col items-center gap-3 p-4 rounded-xl border transition-all ${
//         selected
//           ? "border-indigo-500/60 bg-indigo-500/10 shadow-sm"
//           : "border-white/10 bg-black/20 hover:bg-white/5 hover:border-white/20"
//       }`}
//     >
//       {selected && (
//         <motion.div
//           initial={{ scale: 0 }}
//           animate={{ scale: 1 }}
//           className="absolute top-2.5 right-2.5 w-4 h-4 rounded-full bg-indigo-500 flex items-center justify-center shadow-sm"
//         >
//           <Check size={10} strokeWidth={3} className="text-white" />
//         </motion.div>
//       )}
//       <div
//         className="w-14 h-14 rounded-full flex items-center justify-center ring-2 ring-black/20 shadow-inner"
//         style={{ background: avatar.previewGradient }}
//       >
//         <User size={22} className="text-white/60 drop-shadow-sm" />
//       </div>
//       <div className="text-center">
//         <p
//           className={`text-sm font-medium ${selected ? "text-indigo-100" : "text-white/90"}`}
//         >
//           {avatar.name}
//         </p>
//         <p className="text-[10px] text-white/40 mt-1 capitalize tracking-wider font-medium">
//           {avatar.style}
//         </p>
//       </div>
//     </motion.button>
//   );
// }

// function Card({
//   title,
//   icon,
//   children,
// }: {
//   title: string;
//   icon?: React.ReactNode;
//   children: React.ReactNode;
// }) {
//   return (
//     <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6 md:p-8 backdrop-blur-xl">
//       <div className="flex items-center gap-2 mb-5">
//         {icon && <div className="p-1.5 rounded-lg bg-white/5">{icon}</div>}
//         <h2 className="text-base font-medium text-white/90 tracking-wide">
//           {title}
//         </h2>
//       </div>
//       {children}
//     </div>
//   );
// }

// function Field({
//   label,
//   children,
// }: {
//   label: string;
//   children: React.ReactNode;
// }) {
//   return (
//     <div className="w-full">
//       <label className="block text-xs font-medium text-white/60 mb-2 ml-1">
//         {label}
//       </label>
//       {children}
//     </div>
//   );
// }

// // Global input styling string
// const inp =
//   "w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white text-sm placeholder-white/20 outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-inner";

// "use client";

// import { useEffect, useState } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import Link from "next/link";
// import {
//   Plus,
//   Mic,
//   Settings,
//   Trash2,
//   Shield,
//   Info,
//   ChevronLeft,
//   User,
//   Sparkles,
//   Cpu,
//   Check,
// } from "lucide-react";
// import { useAgentStore } from "@/store";
// import { apiClient } from "@/lib/api/client";
// import { AVATAR_OPTIONS, type AvatarOption } from "@/components/avatar/Avatars";
// import type { Agent } from "@/types";

// // ── Constants & Demos ────────────────────────────────────────────────────────

// const DEMO_AGENTS: Agent[] = [
//   {
//     id: "demo-sarah",
//     name: "Sarah (Customer Support)",
//     slug: "sarah-support",
//     description:
//       "Empathetic customer success agent specialized in SaaS troubleshooting.",
//     system_prompt:
//       "You are Sarah, a customer support agent. Be warm, professional, and clear.",
//     language: "en-US",
//     avatar_type: "waveform",
//     llm_provider: "openai",
//     avatar_id: AVATAR_OPTIONS[0].id,
//     llm_model: "gpt-4o",
//     is_public: true,
//     is_active: true,
//   },
//   {
//     id: "demo-alex",
//     name: "Alex (Tech Recruiter)",
//     slug: "alex-recruiter",
//     description:
//       "Highly engaging interactive voice recruiter for technical screenings.",
//     system_prompt:
//       "You are Alex, a tech recruiter. Be upbeat and assess skills.",
//     language: "en-US",
//     avatar_type: "readyplayerme",
//     avatar_url: "https://models.readyplayer.me/64b58e72750e6878b6711a78.glb",
//     llm_provider: "anthropic",
//     avatar_id: "12134",
//     llm_model: "claude-3-5-sonnet",
//     is_public: true,
//     is_active: true,
//   },
// ];

// const LLM_MODELS = [
//   { value: "gpt-4o-mini", label: "GPT-4o Mini", provider: "openai" },
//   { value: "gpt-4o", label: "GPT-4o", provider: "openai" },
//   {
//     value: "claude-3-5-sonnet-20241022",
//     label: "Claude 3.5 Sonnet",
//     provider: "anthropic",
//   },
//   {
//     value: "claude-3-5-haiku-20241022",
//     label: "Claude 3.5 Haiku",
//     provider: "anthropic",
//   },
// ];

// const inp =
//   "w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white text-sm placeholder-white/20 outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-inner";

// // ── Main Page Component ──────────────────────────────────────────────────────

// export default function AgentsPage() {
//   const { agents, setAgents, removeAgent, isLoading, setLoading } =
//     useAgentStore();
//   const [error, setError] = useState<string | null>(null);
//   const [isDemoMode, setIsDemoMode] = useState(false);

//   // View Controller: Toggles between Dashboard and Creation Form
//   const [view, setView] = useState<"list" | "create">("list");

//   useEffect(() => {
//     loadAgents();
//   }, []);

//   async function loadAgents() {
//     setLoading(true);
//     setError(null);
//     try {
//       const data = await apiClient.get<Agent[]>("/api/agents/");
//       if (data && data.length > 0) {
//         setAgents(data);
//         setIsDemoMode(false);
//       } else {
//         setAgents(DEMO_AGENTS);
//         setIsDemoMode(true);
//       }
//     } catch (e) {
//       console.warn(
//         "Failed to load agents from API. Loading offline demo agents instead.",
//         e,
//       );
//       setAgents(DEMO_AGENTS);
//       setIsDemoMode(true);
//     } finally {
//       setLoading(false);
//     }
//   }

//   async function handleDelete(id: string) {
//     if (!confirm("Are you sure you want to delete this voice agent?")) return;
//     if (isDemoMode || id.startsWith("demo-")) {
//       removeAgent(id);
//       return;
//     }
//     try {
//       await apiClient.delete(`/api/agents/${id}`);
//       removeAgent(id);
//     } catch (e) {
//       setError("Failed to delete the agent from server");
//     }
//   }

//   return (
//     <div className="min-h-screen bg-slate-950 text-slate-200">
//       <AnimatePresence mode="wait">
//         {view === "list" ? (
//           <motion.div
//             key="list-view"
//             initial={{ opacity: 0, x: -20 }}
//             animate={{ opacity: 1, x: 0 }}
//             exit={{ opacity: 0, x: -20 }}
//             transition={{ duration: 0.3 }}
//             className="p-8 max-w-7xl mx-auto space-y-8"
//           >
//             {/* Header section */}
//             <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-6">
//               <div className="flex items-center gap-4">
//                 <h1 className="text-2xl md:text-3xl font-semibold text-white tracking-tight">
//                   Voice Agents{" "}
//                   <span className="text-white/30 ml-2">({agents.length})</span>
//                 </h1>
//               </div>
//               {isDemoMode && (
//                 <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-medium">
//                   <Info size={14} /> Offline Demo Mode
//                 </div>
//               )}
//             </div>

//             {error && (
//               <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm flex items-center gap-3">
//                 <Shield size={16} className="text-red-500/80" />
//                 <span>{error}</span>
//               </div>
//             )}

//             {isLoading ? (
//               <div className="flex flex-col items-center justify-center h-64 gap-4 text-white/40">
//                 <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
//                 <span className="text-sm font-medium tracking-wide">
//                   Connecting to registry...
//                 </span>
//               </div>
//             ) : (
//               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
//                 {/* Create New Card */}
//                 <motion.div
//                   whileHover={{ scale: 1.02, y: -2 }}
//                   whileTap={{ scale: 0.98 }}
//                   onClick={() => setView("create")}
//                   className="group cursor-pointer border border-dashed border-white/20 hover:border-indigo-500/50 rounded-2xl p-6 flex flex-col items-center justify-center min-h-[260px] h-full bg-white/[0.01] hover:bg-indigo-500/5 transition-all shadow-sm"
//                 >
//                   <div className="w-12 h-12 rounded-full border border-white/10 bg-white/5 flex items-center justify-center text-white/40 group-hover:text-indigo-400 group-hover:border-indigo-500/30 group-hover:bg-indigo-500/10 transition-colors mb-4">
//                     <Plus size={24} />
//                   </div>
//                   <span className="text-sm font-medium text-white/50 group-hover:text-indigo-300 transition-colors">
//                     Create New Agent
//                   </span>
//                 </motion.div>

//                 {/* Agent Grid */}
//                 {agents.map((agent, i) => (
//                   <AgentCard
//                     key={agent.id}
//                     agent={agent}
//                     index={i}
//                     onDelete={() => handleDelete(agent.id)}
//                   />
//                 ))}
//               </div>
//             )}
//           </motion.div>
//         ) : (
//           <motion.div
//             key="create-view"
//             initial={{ opacity: 0, x: 20 }}
//             animate={{ opacity: 1, x: 0 }}
//             exit={{ opacity: 0, x: 20 }}
//             transition={{ duration: 0.3 }}
//             className="p-6 md:p-10 max-w-3xl mx-auto"
//           >
//             <CreateAgentView
//               onBack={() => setView("list")}
//               onSuccess={() => {
//                 setView("list");
//                 loadAgents(); // Refresh the grid to show the new agent
//               }}
//             />
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </div>
//   );
// }

// // ── Dashboard Grid Components ────────────────────────────────────────────────

// function AgentCard({
//   agent,
//   index,
//   onDelete,
// }: {
//   agent: Agent;
//   index: number;
//   onDelete: () => void;
// }) {
//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 15 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ delay: index * 0.04 }}
//       className="group relative bg-white/[0.02] hover:bg-white/[0.04] border border-white/10 rounded-2xl p-6 transition-all duration-300 hover:border-indigo-500/40 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 flex flex-col justify-between min-h-[260px]"
//     >
//       <div>
//         <div className="flex justify-between items-start mb-5">
//           <div className="space-y-1.5 pr-2">
//             <h3 className="font-semibold text-white/90 text-lg group-hover:text-indigo-300 transition-colors leading-snug truncate">
//               {agent.name}
//             </h3>
//             <p className="text-xs text-white/40 line-clamp-2 leading-relaxed">
//               {agent.description || "No description provided."}
//             </p>
//           </div>
//           <div className="flex flex-col gap-1.5 shrink-0">
//             <Link href={`/dashboard/agents/${agent.id}`}>
//               <button className="w-8 h-8 rounded-lg bg-black/20 hover:bg-indigo-500/20 border border-white/5 flex items-center justify-center text-white/40 hover:text-indigo-300 transition-colors cursor-pointer">
//                 <Settings size={14} />
//               </button>
//             </Link>
//             <button
//               onClick={onDelete}
//               className="w-8 h-8 rounded-lg bg-black/20 hover:bg-red-500/20 border border-white/5 flex items-center justify-center text-white/40 hover:text-red-400 transition-colors cursor-pointer"
//             >
//               <Trash2 size={14} />
//             </button>
//           </div>
//         </div>

//         <div className="space-y-4 border-t border-white/10 pt-5">
//           <div className="flex items-center justify-between">
//             <span className="text-[10px] font-medium text-white/30 uppercase tracking-wider block">
//               Engine
//             </span>
//             <span className="text-xs font-medium text-indigo-200/70 block capitalize">
//               {agent.llm_provider}
//             </span>
//           </div>
//           <div className="flex items-center justify-between">
//             <span className="text-[10px] font-medium text-white/30 uppercase tracking-wider block">
//               Status
//             </span>
//             <div className="flex items-center gap-1.5">
//               <span
//                 className={`w-1.5 h-1.5 rounded-full ${agent.is_active ? "bg-teal-400 shadow-[0_0_8px_rgba(45,212,191,0.5)]" : "bg-white/20"}`}
//               />
//               <span className="text-xs font-medium text-white/60">
//                 {agent.is_active ? "Active" : "Idle"}
//               </span>
//             </div>
//           </div>
//         </div>
//       </div>

//       <Link href={`/dashboard/agents/${agent.id}/test`} className="mt-6 block">
//         <motion.button
//           whileHover={{ scale: 1.02 }}
//           whileTap={{ scale: 0.98 }}
//           className="w-full py-2.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 font-medium text-xs rounded-xl border border-indigo-500/20 transition-colors cursor-pointer flex items-center justify-center gap-2"
//         >
//           <Mic size={14} />
//           Launch Sandbox
//         </motion.button>
//       </Link>
//     </motion.div>
//   );
// }

// // ── Creation Form Component ──────────────────────────────────────────────────

// function CreateAgentView({
//   onBack,
//   onSuccess,
// }: {
//   onBack: () => void;
//   onSuccess: () => void;
// }) {
//   const [saving, setSaving] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [form, setForm] = useState({
//     name: "",
//     description: "",
//     language: "en",
//     voice_id: "",
//     system_prompt:
//       "You are a helpful voice assistant. Keep responses concise — under 3 sentences.",
//     llm_model: "gpt-4o-mini",
//     llm_provider: "openai",
//     is_public: true,
//     avatar_id: AVATAR_OPTIONS[0].id,
//   });

//   const set = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));

//   const handleModelChange = (value: string) => {
//     const m = LLM_MODELS.find((m) => m.value === value);
//     set("llm_model", value);
//     if (m) set("llm_provider", m.provider);
//   };

//   const handleSubmit = async () => {
//     if (!form.name.trim()) return setError("Agent name is required.");
//     if (form.system_prompt.trim().length < 10)
//       return setError("System prompt must be at least 10 characters.");

//     setSaving(true);
//     setError(null);
//     try {
//       await apiClient.post("/api/agents/", form);
//       onSuccess(); // Switch back to grid view and refresh
//     } catch (e: any) {
//       setError(e.message ?? "Failed to create agent");
//     } finally {
//       setSaving(false);
//     }
//   };

//   return (
//     <div className="w-full">
//       <div className="flex items-center gap-4 mb-10">
//         <button
//           onClick={onBack}
//           className="p-2 -ml-2 rounded-xl text-white/40 hover:text-white hover:bg-white/5 transition-all"
//         >
//           <ChevronLeft size={22} />
//         </button>
//         <div>
//           <h2 className="text-2xl md:text-3xl font-semibold text-white tracking-tight">
//             Configure New Agent
//           </h2>
//           <p className="text-white/50 text-sm mt-1">
//             Design your AI's identity, brain, and appearance.
//           </p>
//         </div>
//       </div>

//       <div className="space-y-6">
//         <Card
//           title="Identity"
//           icon={<User size={16} className="text-indigo-400" />}
//         >
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
//             <Field label="Agent Name *">
//               <input
//                 value={form.name}
//                 onChange={(e) => set("name", e.target.value)}
//                 placeholder="e.g. Sales Assistant"
//                 className={inp}
//               />
//             </Field>
//             <Field label="Description (Internal)">
//               <input
//                 value={form.description}
//                 onChange={(e) => set("description", e.target.value)}
//                 placeholder="What is this agent's purpose?"
//                 className={inp}
//               />
//             </Field>
//           </div>
//         </Card>

//         <Card
//           title="System Prompt"
//           icon={<Sparkles size={16} className="text-teal-400" />}
//         >
//           <textarea
//             value={form.system_prompt}
//             onChange={(e) => set("system_prompt", e.target.value)}
//             rows={4}
//             className={`${inp} resize-none leading-relaxed`}
//           />
//         </Card>

//         <Card
//           title="LiveAvatar Interface"
//           icon={<User size={16} className="text-indigo-400" />}
//         >
//           <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
//             {AVATAR_OPTIONS.map((av) => (
//               <AvatarCard
//                 key={av.id}
//                 avatar={av}
//                 selected={form.avatar_id === av.id}
//                 onClick={() => set("avatar_id", av.id)}
//               />
//             ))}
//           </div>
//         </Card>

//         <Card
//           title="Language Engine"
//           icon={<Cpu size={16} className="text-teal-400" />}
//         >
//           <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
//             {LLM_MODELS.map((m) => (
//               <button
//                 key={m.value}
//                 type="button"
//                 onClick={() => handleModelChange(m.value)}
//                 className={`relative flex flex-col p-4 rounded-xl border text-left transition-all overflow-hidden ${
//                   form.llm_model === m.value
//                     ? "border-indigo-500/50 bg-indigo-500/10 shadow-sm"
//                     : "border-white/10 bg-black/20 hover:bg-white/5 hover:border-white/20"
//                 }`}
//               >
//                 <div
//                   className={`font-medium text-sm ${form.llm_model === m.value ? "text-indigo-100" : "text-white/80"}`}
//                 >
//                   {m.label}
//                 </div>
//                 <div className="text-xs text-white/40 mt-1 capitalize tracking-wide">
//                   {m.provider}
//                 </div>
//               </button>
//             ))}
//           </div>
//         </Card>

//         <div className="pt-4 pb-12">
//           {error && (
//             <motion.div
//               initial={{ opacity: 0, y: -10 }}
//               animate={{ opacity: 1, y: 0 }}
//               className="px-4 py-3 mb-6 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm flex items-center gap-2"
//             >
//               <div className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />{" "}
//               {error}
//             </motion.div>
//           )}

//           <motion.button
//             whileHover={{ scale: 1.01 }}
//             whileTap={{ scale: 0.99 }}
//             onClick={handleSubmit}
//             disabled={saving}
//             className={`w-full py-4 rounded-xl text-white font-medium text-base transition-all shadow-lg flex items-center justify-center gap-2 ${
//               saving
//                 ? "bg-indigo-500/50 cursor-not-allowed"
//                 : "bg-indigo-600 hover:bg-indigo-500 hover:shadow-indigo-500/25"
//             }`}
//           >
//             {saving ? "Provisioning Agent..." : "Create Agent"}
//           </motion.button>
//         </div>
//       </div>
//     </div>
//   );
// }

// // ── Shared UI Subcomponents ────────────────────────────────────────────────

// function AvatarCard({
//   avatar,
//   selected,
//   onClick,
// }: {
//   avatar: AvatarOption;
//   selected: boolean;
//   onClick: () => void;
// }) {
//   return (
//     <motion.button
//       type="button"
//       whileHover={{ scale: 1.02 }}
//       whileTap={{ scale: 0.97 }}
//       onClick={onClick}
//       className={`relative flex flex-col items-center gap-3 p-4 rounded-xl border transition-all ${
//         selected
//           ? "border-indigo-500/60 bg-indigo-500/10 shadow-sm"
//           : "border-white/10 bg-black/20 hover:bg-white/5 hover:border-white/20"
//       }`}
//     >
//       {selected && (
//         <motion.div
//           initial={{ scale: 0 }}
//           animate={{ scale: 1 }}
//           className="absolute top-2.5 right-2.5 w-4 h-4 rounded-full bg-indigo-500 flex items-center justify-center shadow-sm"
//         >
//           <Check size={10} strokeWidth={3} className="text-white" />
//         </motion.div>
//       )}
//       <div
//         className="w-14 h-14 rounded-full flex items-center justify-center ring-2 ring-black/20 shadow-inner"
//         style={{ background: avatar.previewGradient }}
//       >
//         <User size={22} className="text-white/60 drop-shadow-sm" />
//       </div>
//       <div className="text-center">
//         <p
//           className={`text-sm font-medium ${selected ? "text-indigo-100" : "text-white/90"}`}
//         >
//           {avatar.name}
//         </p>
//         <p className="text-[10px] text-white/40 mt-1 capitalize tracking-wider font-medium">
//           {avatar.style}
//         </p>
//       </div>
//     </motion.button>
//   );
// }

// function Card({
//   title,
//   icon,
//   children,
// }: {
//   title: string;
//   icon?: React.ReactNode;
//   children: React.ReactNode;
// }) {
//   return (
//     <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6 md:p-8 backdrop-blur-xl">
//       <div className="flex items-center gap-2 mb-5">
//         {icon && <div className="p-1.5 rounded-lg bg-white/5">{icon}</div>}
//         <h2 className="text-base font-medium text-white/90 tracking-wide">
//           {title}
//         </h2>
//       </div>
//       {children}
//     </div>
//   );
// }

// function Field({
//   label,
//   children,
// }: {
//   label: string;
//   children: React.ReactNode;
// }) {
//   return (
//     <div className="w-full">
//       <label className="block text-xs font-medium text-white/60 mb-2 ml-1">
//         {label}
//       </label>
//       {children}
//     </div>
//   );
// }

// "use client";

// import { useEffect, useState, useRef } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import Link from "next/link";
// import {
//   Plus,
//   Mic,
//   Settings,
//   Trash2,
//   Shield,
//   Info,
//   ChevronLeft,
//   User,
//   Sparkles,
//   Cpu,
//   Check,
//   Volume2,
//   VolumeX,
//   Play,
//   Pause,
// } from "lucide-react";
// import { useAgentStore } from "@/store";
// import { apiClient } from "@/lib/api/client";
// import { AVATAR_OPTIONS, type AvatarOption } from "@/components/avatar/Avatars";
// import type { Agent } from "@/types";

// // ── Constants & Demos ────────────────────────────────────────────────────────

// const DEMO_AGENTS: Agent[] = [
//   {
//     id: "demo-sarah",
//     name: "Sarah (Customer Support)",
//     slug: "sarah-support",
//     description:
//       "Empathetic customer success agent specialized in SaaS troubleshooting.",
//     system_prompt:
//       "You are Sarah, a customer support agent. Be warm, professional, and clear.",
//     language: "en-US",
//     avatar_type: "waveform",
//     llm_provider: "openai",
//     avatar_id: "123",
//     llm_model: "gpt-4o",
//     is_public: true,
//     is_active: true,
//   },
//   {
//     id: "demo-alex",
//     name: "Alex (Tech Recruiter)",
//     slug: "alex-recruiter",
//     description:
//       "Highly engaging interactive voice recruiter for technical screenings.",
//     system_prompt:
//       "You are Alex, a tech recruiter. Be upbeat and assess skills.",
//     language: "en-US",
//     avatar_type: "readyplayerme",
//     avatar_url: "https://models.readyplayer.me/64b58e72750e6878b6711a78.glb",
//     llm_provider: "anthropic",
//     avatar_id: "12134",
//     llm_model: "claude-3-5-sonnet",
//     is_public: true,
//     is_active: true,
//   },
// ];

// const LLM_MODELS = [
//   { value: "gpt-4o-mini", label: "GPT-4o Mini", provider: "openai" },
//   { value: "gpt-4o", label: "GPT-4o", provider: "openai" },
//   {
//     value: "claude-3-5-sonnet-20241022",
//     label: "Claude 3.5 Sonnet",
//     provider: "anthropic",
//   },
//   {
//     value: "claude-3-5-haiku-20241022",
//     label: "Claude 3.5 Haiku",
//     provider: "anthropic",
//   },
// ];

// // Production Cartesia Voice library with dynamic play previews
// const CARTESIA_VOICES = [
//   {
//     id: "47c38ca4-5f35-497b-b1a3-415245fb35e1",
//     name: "Daniel",
//     description: "Deep, crisp, professional corporate American male",
//     language: "en",
//     gender: "Masculine",
//     previewUrl: "./voice/daniel.wav",
//   },
//   {
//     id: "db6b0ed5-d5d3-463d-ae85-518a07d3c2b4",
//     name: "Skylar",
//     description: "Warm, empathetic conversational American female ",
//     language: "en",
//     gender: "Feminine",
//     previewUrl: "./voice/sarah.wav",
//   },
//   {
//     id: "95d51f79-c397-46f9-b49a-23763d3eaa2d",
//     name: "Arushi",
//     description:
//       "Natural localized conversational English / Hindi hybrid speaker",
//     language: "hi",
//     gender: "Feminine",
//     previewUrl: "./voice/arushi.wav",
//   },

//   {
//     id: "62ae83ad-4f6a-430b-af41-a9bede9286ca",
//     name: "British Reading Lady",
//     description:
//       "Elegant, authoritative Received Pronunciation (RP) storyteller",
//     language: "en",
//     gender: "Feminine",
//     previewUrl: "./voice/british.wav",
//   },
//   {
//     id: "79f8b5fb-2cc8-479a-80df-29f7a7cf1a3e",
//     name: "Theo",
//     description:
//       "Friendly, casual corporate support representative from Oceania",
//     language: "en",
//     gender: "Masculine",
//     previewUrl: "./voice/theo.wav",
//   },
// ];

// const inp =
//   "w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white text-sm placeholder-white/20 outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-inner";

// // ── Main Page Component ──────────────────────────────────────────────────────

// export default function AgentsPage() {
//   const { agents, setAgents, removeAgent, isLoading, setLoading } =
//     useAgentStore();
//   const [error, setError] = useState<string | null>(null);
//   const [isDemoMode, setIsDemoMode] = useState(false);

//   // View Controller: Toggles between Dashboard and Creation Form
//   const [view, setView] = useState<"list" | "create">("list");

//   useEffect(() => {
//     loadAgents();
//   }, []);

//   async function loadAgents() {
//     setLoading(true);
//     setError(null);
//     try {
//       const data = await apiClient.get<Agent[]>("/api/agents/");
//       if (data && data.length > 0) {
//         setAgents(data);
//         setIsDemoMode(false);
//       } else {
//         setAgents(DEMO_AGENTS);
//         setIsDemoMode(true);
//       }
//     } catch (e) {
//       console.warn(
//         "Failed to load agents from API. Loading offline demo agents instead.",
//         e,
//       );
//       setAgents(DEMO_AGENTS);
//       setIsDemoMode(true);
//     } finally {
//       setLoading(false);
//     }
//   }

//   async function handleDelete(id: string) {
//     if (!confirm("Are you sure you want to delete this voice agent?")) return;
//     if (isDemoMode || id.startsWith("demo-")) {
//       removeAgent(id);
//       return;
//     }
//     try {
//       await apiClient.delete(`/api/agents/${id}`);
//       removeAgent(id);
//     } catch (e) {
//       setError("Failed to delete the agent from server");
//     }
//   }

//   return (
//     <div className="min-h-screen bg-slate-950 text-slate-200">
//       <AnimatePresence mode="wait">
//         {view === "list" ? (
//           <motion.div
//             key="list-view"
//             initial={{ opacity: 0, x: -20 }}
//             animate={{ opacity: 1, x: 0 }}
//             exit={{ opacity: 0, x: -20 }}
//             transition={{ duration: 0.3 }}
//             className="p-8 max-w-7xl mx-auto space-y-8"
//           >
//             {/* Header section */}
//             <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-6">
//               <div className="flex items-center gap-4">
//                 <h1 className="text-2xl md:text-3xl font-semibold text-white tracking-tight">
//                   Voice Agents{" "}
//                   <span className="text-white/30 ml-2">({agents.length})</span>
//                 </h1>
//               </div>
//               {isDemoMode && (
//                 <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-medium">
//                   <Info size={14} /> Offline Demo Mode
//                 </div>
//               )}
//             </div>

//             {error && (
//               <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm flex items-center gap-3">
//                 <Shield size={16} className="text-red-500/80" />
//                 <span>{error}</span>
//               </div>
//             )}

//             {isLoading ? (
//               <div className="flex flex-col items-center justify-center h-64 gap-4 text-white/40">
//                 <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
//                 <span className="text-sm font-medium tracking-wide">
//                   Connecting to registry...
//                 </span>
//               </div>
//             ) : (
//               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
//                 {/* Create New Card */}
//                 <motion.div
//                   whileHover={{ scale: 1.02, y: -2 }}
//                   whileTap={{ scale: 0.98 }}
//                   onClick={() => setView("create")}
//                   className="group cursor-pointer border border-dashed border-white/20 hover:border-indigo-500/50 rounded-2xl p-6 flex flex-col items-center justify-center min-h-[260px] h-full bg-white/[0.01] hover:bg-indigo-500/5 transition-all shadow-sm"
//                 >
//                   <div className="w-12 h-12 rounded-full border border-white/10 bg-white/5 flex items-center justify-center text-white/40 group-hover:text-indigo-400 group-hover:border-indigo-500/30 group-hover:bg-indigo-500/10 transition-colors mb-4">
//                     <Plus size={24} />
//                   </div>
//                   <span className="text-sm font-medium text-white/50 group-hover:text-indigo-300 transition-colors">
//                     Create New Agent
//                   </span>
//                 </motion.div>

//                 {/* Agent Grid */}
//                 {agents.map((agent, i) => (
//                   <AgentCard
//                     key={agent.id}
//                     agent={agent}
//                     index={i}
//                     onDelete={() => handleDelete(agent.id)}
//                   />
//                 ))}
//               </div>
//             )}
//           </motion.div>
//         ) : (
//           <motion.div
//             key="create-view"
//             initial={{ opacity: 0, x: 20 }}
//             animate={{ opacity: 1, x: 0 }}
//             exit={{ opacity: 0, x: 20 }}
//             transition={{ duration: 0.3 }}
//             className="p-6 md:p-10 max-w-3xl mx-auto"
//           >
//             <CreateAgentView
//               onBack={() => setView("list")}
//               onSuccess={() => {
//                 setView("list");
//                 loadAgents();
//               }}
//             />
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </div>
//   );
// }

// // ── Dashboard Grid Components ────────────────────────────────────────────────

// function AgentCard({
//   agent,
//   index,
//   onDelete,
// }: {
//   agent: Agent;
//   index: number;
//   onDelete: () => void;
// }) {
//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 15 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ delay: index * 0.04 }}
//       className="group relative bg-white/[0.02] hover:bg-white/[0.04] border border-white/10 rounded-2xl p-6 transition-all duration-300 hover:border-indigo-500/40 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 flex flex-col justify-between min-h-[260px]"
//     >
//       <div>
//         <div className="flex justify-between items-start mb-5">
//           <div className="space-y-1.5 pr-2">
//             <h3 className="font-semibold text-white/90 text-lg group-hover:text-indigo-300 transition-colors leading-snug truncate">
//               {agent.name}
//             </h3>
//             <p className="text-xs text-white/40 line-clamp-2 leading-relaxed">
//               {agent.description || "No description provided."}
//             </p>
//           </div>
//           <div className="flex flex-col gap-1.5 shrink-0">
//             <Link href={`/dashboard/agents/${agent.id}`}>
//               <button className="w-8 h-8 rounded-lg bg-black/20 hover:bg-indigo-500/20 border border-white/5 flex items-center justify-center text-white/40 hover:text-indigo-300 transition-colors cursor-pointer">
//                 <Settings size={14} />
//               </button>
//             </Link>
//             <button
//               onClick={onDelete}
//               className="w-8 h-8 rounded-lg bg-black/20 hover:bg-red-500/20 border border-white/5 flex items-center justify-center text-white/40 hover:text-red-400 transition-colors cursor-pointer"
//             >
//               <Trash2 size={14} />
//             </button>
//           </div>
//         </div>

//         <div className="space-y-4 border-t border-white/10 pt-5">
//           <div className="flex items-center justify-between">
//             <span className="text-[10px] font-medium text-white/30 uppercase tracking-wider block">
//               Engine
//             </span>
//             <span className="text-xs font-medium text-indigo-200/70 block capitalize">
//               {agent.llm_provider}
//             </span>
//           </div>
//           <div className="flex items-center justify-between">
//             <span className="text-[10px] font-medium text-white/30 uppercase tracking-wider block">
//               Status
//             </span>
//             <div className="flex items-center gap-1.5">
//               <span
//                 className={`w-1.5 h-1.5 rounded-full ${agent.is_active ? "bg-teal-400 shadow-[0_0_8px_rgba(45,212,191,0.5)]" : "bg-white/20"}`}
//               />
//               <span className="text-xs font-medium text-white/60">
//                 {agent.is_active ? "Active" : "Idle"}
//               </span>
//             </div>
//           </div>
//         </div>
//       </div>

//       <Link href={`/dashboard/agents/${agent.id}/test`} className="mt-6 block">
//         <motion.button
//           whileHover={{ scale: 1.02 }}
//           whileTap={{ scale: 0.98 }}
//           className="w-full py-2.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 font-medium text-xs rounded-xl border border-indigo-500/20 transition-colors cursor-pointer flex items-center justify-center gap-2"
//         >
//           <Mic size={14} />
//           Launch Sandbox
//         </motion.button>
//       </Link>
//     </motion.div>
//   );
// }

// // ── Creation Form Component ──────────────────────────────────────────────────
// function CreateAgentView({
//   onBack,
//   onSuccess,
// }: {
//   onBack: () => void;
//   onSuccess: () => void;
// }) {
//   const [saving, setSaving] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   // Dynamic arrays from Python Server endpoints

//   const [avatars, setAvatars] = useState<AvatarOption[]>([]);

//   // Asynchronous Loading Flags
//   const [loadingAvatars, setLoadingAvatars] = useState(true);
//   const [form, setForm] = useState({
//     name: "",
//     description: "",
//     language: "en",
//     voice_id: "",
//     system_prompt:
//       "You are a helpful voice assistant. Keep responses concise — under 3 sentences.",
//     llm_model: "gpt-4o",
//     llm_provider: "openai",
//     is_public: true,
//     avatar_id: "",
//   });
//   const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);
//   const audioRef = useRef<HTMLAudioElement | null>(null);

//   // Initialize unified data fetch handlers across both resource sets
//   useEffect(() => {
//     async function initFormData() {
//       // 1. Fetch Cartesia Voices List Matrix

//       // 2. Fetch LiveAvatar Data List
//       try {
//         setLoadingAvatars(true);
//         const avatarResponse = await apiClient.get<any>("/api/avatars");
//         const avatarData =
//           avatarResponse?.data?.results ?? avatarResponse?.data ?? [];
//         console.log("Fetched avatars:", avatarData);

//         if (avatarData && avatarData.length > 0) {
//           setAvatars(avatarData);
//           console.log("Setting avatars:", avatarData);
//           setForm((f) => {
//             const updated = {
//               ...f,
//               avatar_id: avatarData[0].id,
//               previewUrl: avatarData[0].preview_url || "",
//             };

//             return updated;
//           });
//         }
//         console.log("Initial Form:", avatars);
//       } catch (err) {
//         console.error("Failed to load avatars:", err);
//       } finally {
//         setLoadingAvatars(false);
//       }
//     }

//     initFormData();

//     return () => {
//       if (audioRef.current) {
//         audioRef.current.pause();
//         audioRef.current = null;
//       }
//     };
//   }, []);

//   const set = (k: string, v: any) => {
//     setForm((prev) => {
//       const updated = {
//         ...prev,
//         [k]: v,
//       };

//       console.log("Form Updated:", updated);

//       return updated;
//     });
//   };
//   const handleTogglePreview = (
//     e: React.MouseEvent,
//     voiceId: string,
//     url: string,
//   ) => {
//     e.stopPropagation(); // Avoid choosing the selector block card automatically upon clicking audio playback

//     if (playingVoiceId === voiceId) {
//       audioRef.current?.pause();
//       setPlayingVoiceId(null);
//     } else {
//       if (audioRef.current) {
//         audioRef.current.pause();
//       }
//       audioRef.current = new Audio(url);
//       setPlayingVoiceId(voiceId);
//       audioRef.current.play().catch((err) => {
//         console.error("Audio preview blocked or failed:", err);
//         setPlayingVoiceId(null);
//       });

//       audioRef.current.onended = () => {
//         setPlayingVoiceId(null);
//       };
//     }
//   };

//   const handleModelChange = (value: string) => {
//     const m = LLM_MODELS.find((m) => m.value === value);
//     set("llm_model", value);
//     if (m) set("llm_provider", m.provider);
//   };

//   const handleSubmit = async () => {
//     if (!form.name.trim()) return setError("Agent name is required.");
//     if (!form.avatar_id)
//       return setError("An avatar layout shell must be assigned.");
//     if (form.system_prompt.trim().length < 10)
//       return setError("System prompt must be at least 10 characters.");

//     setSaving(true);
//     setError(null);
//     try {
//       await apiClient.post("/api/agents/", form);
//       onSuccess();
//     } catch (e: any) {
//       setError(e.message ?? "Failed to create agent");
//     } finally {
//       setSaving(false);
//     }
//   };

//   return (
//     <div className="w-full">
//       <div className="flex items-center gap-4 mb-10">
//         <button
//           onClick={onBack}
//           className="p-2 -ml-2 rounded-xl text-white/40 hover:text-white hover:bg-white/5 transition-all"
//         >
//           <ChevronLeft size={22} />
//         </button>
//         <div>
//           <h2 className="text-2xl md:text-3xl font-semibold text-white tracking-tight">
//             Configure New Agent
//           </h2>
//           <p className="text-white/50 text-sm mt-1">
//             Design your AI's identity, brain, and appearance.
//           </p>
//         </div>
//       </div>

//       <div className="space-y-6">
//         <Card
//           title="Identity"
//           icon={<User size={16} className="text-indigo-400" />}
//         >
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
//             <Field label="Agent Name *">
//               <input
//                 value={form.name}
//                 onChange={(e) => set("name", e.target.value)}
//                 placeholder="e.g. Sales Assistant"
//                 className={inp}
//               />
//             </Field>
//             <Field label="Description (Internal)">
//               <input
//                 value={form.description}
//                 onChange={(e) => set("description", e.target.value)}
//                 placeholder="What is this agent's purpose?"
//                 className={inp}
//               />
//             </Field>
//           </div>
//         </Card>

//         <Card
//           title="System Prompt"
//           icon={<Sparkles size={16} className="text-teal-400" />}
//         >
//           <textarea
//             value={form.system_prompt}
//             onChange={(e) => set("system_prompt", e.target.value)}
//             rows={4}
//             className={`${inp} resize-none leading-relaxed`}
//           />
//         </Card>

//         {/* ── Dynamic LiveAvatar Interface List ──────────────── */}
//         <Card
//           title="LiveAvatar Selection Panel"
//           icon={<User size={16} className="text-indigo-400" />}
//         >
//           {loadingAvatars ? (
//             <div className="flex flex-col items-center justify-center py-8 gap-3 text-white/30">
//               <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
//               <p className="text-xs tracking-wide">
//                 Syncing available digital human interfaces...
//               </p>
//             </div>
//           ) : (
//             <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
//               {avatars.map((av) => (
//                 <AvatarCard
//                   key={av.id}
//                   avatar={av}
//                   previewUrl={av.preview_url}
//                   selected={form.avatar_id === av.id}
//                   onClick={() => set("avatar_id", av.id)}
//                 />
//               ))}
//             </div>
//           )}
//         </Card>

//         <Card
//           title="Language Engine"
//           icon={<Cpu size={16} className="text-teal-400" />}
//         >
//           <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
//             {LLM_MODELS.map((m) => (
//               <button
//                 key={m.value}
//                 type="button"
//                 onClick={() => handleModelChange(m.value)}
//                 className={`relative flex flex-col p-4 rounded-xl border text-left transition-all overflow-hidden ${
//                   form.llm_model === m.value
//                     ? "border-indigo-500/50 bg-indigo-500/10 shadow-sm"
//                     : "border-white/10 bg-black/20 hover:bg-white/5 hover:border-white/20"
//                 }`}
//               >
//                 <div
//                   className={`font-medium text-sm ${form.llm_model === m.value ? "text-indigo-100" : "text-white/80"}`}
//                 >
//                   {m.label}
//                 </div>
//                 <div className="text-xs text-white/40 mt-1 capitalize tracking-wide">
//                   {m.provider}
//                 </div>
//               </button>
//             ))}
//           </div>
//         </Card>

//         <Card
//           title="Vocal Timbre (Cartesia Sonic Engine)"
//           icon={<Volume2 size={16} className="text-indigo-400" />}
//         >
//           <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
//             {CARTESIA_VOICES.map((voice) => {
//               const isSelected = form.voice_id === voice.id;
//               const isPlaying = playingVoiceId === voice.id;

//               return (
//                 <div
//                   key={voice.id}
//                   onClick={() => set("voice_id", voice.id)}
//                   className={`group relative flex items-center justify-between p-4 rounded-xl border text-left transition-all cursor-pointer ${
//                     isSelected
//                       ? "border-indigo-500/60 bg-indigo-500/10 shadow-sm"
//                       : "border-white/10 bg-black/20 hover:bg-white/5 hover:border-white/20"
//                   }`}
//                 >
//                   <div className="flex items-center gap-3.5 max-w-[80%]">
//                     {/* Continuous Play/Pause Trigger Button */}
//                     <button
//                       type="button"
//                       onClick={(e) =>
//                         handleTogglePreview(e, voice.id, voice.previewUrl)
//                       }
//                       className={`w-9 h-9 rounded-full flex items-center justify-center border transition-all shrink-0 ${
//                         isPlaying
//                           ? "bg-indigo-500 border-indigo-400 text-white animate-pulse"
//                           : "bg-white/5 border-white/10 text-white/60 group-hover:text-white group-hover:border-white/20"
//                       }`}
//                     >
//                       {isPlaying ? (
//                         <Pause size={13} fill="currentColor" />
//                       ) : (
//                         <Play
//                           size={13}
//                           fill="currentColor"
//                           className="ml-0.5"
//                         />
//                       )}
//                     </button>

//                     <div className="truncate">
//                       <div className="flex items-center gap-2">
//                         <span
//                           className={`font-medium text-sm ${isSelected ? "text-indigo-100" : "text-white/80"}`}
//                         >
//                           {voice.name}
//                         </span>
//                         <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/5 text-white/40 uppercase tracking-wider">
//                           {voice.language}
//                         </span>
//                       </div>
//                       <p className="text-xs text-white/40 mt-0.5 truncate leading-relaxed">
//                         {voice.description}
//                       </p>
//                     </div>
//                   </div>

//                   {/* Indicator Checkbox icon element */}
//                   <div
//                     className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all shrink-0 ${
//                       isSelected
//                         ? "bg-indigo-500 border-indigo-400 text-white"
//                         : "border-white/20 bg-black/20"
//                     }`}
//                   >
//                     {isSelected && <Check size={10} strokeWidth={4} />}
//                   </div>
//                 </div>
//               );
//             })}
//           </div>
//         </Card>

//         <div className="pt-4 pb-12">
//           {error && (
//             <motion.div
//               initial={{ opacity: 0, y: -10 }}
//               animate={{ opacity: 1, y: 0 }}
//               className="px-4 py-3 mb-6 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm flex items-center gap-2"
//             >
//               <div className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />{" "}
//               {error}
//             </motion.div>
//           )}

//           <motion.button
//             whileHover={{ scale: 1.01 }}
//             whileTap={{ scale: 0.99 }}
//             onClick={handleSubmit}
//             disabled={saving || loadingAvatars}
//             className={`w-full py-4 rounded-xl text-white font-medium text-base transition-all shadow-lg flex items-center justify-center gap-2 ${
//               saving || loadingAvatars
//                 ? "bg-indigo-500/50 cursor-not-allowed"
//                 : "bg-indigo-600 hover:bg-indigo-500 hover:shadow-indigo-500/25"
//             }`}
//           >
//             {saving ? "Provisioning Agent..." : "Create Agent"}
//           </motion.button>
//         </div>
//       </div>
//     </div>
//   );
// }

// function AvatarCard({
//   avatar,
//   selected,
//   onClick,
//   previewUrl,
// }: {
//   avatar: AvatarOption;
//   selected: boolean;
//   onClick: () => void;
//   previewUrl: string | undefined;
// }) {
//   return (
//     <motion.button
//       type="button"
//       whileHover={{ scale: 1.02 }}
//       whileTap={{ scale: 0.97 }}
//       onClick={onClick}
//       className={`relative flex flex-col items-center gap-3 p-4 rounded-xl border transition-all ${
//         selected
//           ? "border-indigo-500/60 bg-indigo-500/10 shadow-sm"
//           : "border-white/10 bg-black/20 hover:bg-white/5 hover:border-white/20"
//       }`}
//     >
//       {selected && (
//         <motion.div
//           initial={{ scale: 0 }}
//           animate={{ scale: 1 }}
//           className="absolute top-2.5 right-2.5 w-4 h-4 rounded-full bg-indigo-500 flex items-center justify-center shadow-sm"
//         >
//           <Check size={10} strokeWidth={3} className="text-white" />
//         </motion.div>
//       )}
//       <div
//         className=" rounded-full flex items-center justify-center ring-2 ring-black/20 shadow-inner"
//         style={{ background: avatar.previewGradient }}
//       >
//         <img
//           src={previewUrl}
//           alt={avatar.name}
//           className="w-full h-full rounded-full object-cover"
//           onError={(e) => {
//             console.log("Avatar image failed:", avatar);

//             e.currentTarget.src =
//               "https://ui-avatars.com/api/?name=" +
//               encodeURIComponent(avatar.name || "Avatar");
//           }}
//         />
//       </div>
//       <div className="text-center">
//         <p
//           className={`text-sm font-medium ${selected ? "text-indigo-100" : "text-white/90"}`}
//         >
//           {avatar.name}
//         </p>
//         <p className="text-[10px] text-white/40 mt-1 capitalize tracking-wider font-medium">
//           {avatar.style}
//         </p>
//       </div>
//     </motion.button>
//   );
// }

// function Card({
//   title,
//   icon,
//   children,
// }: {
//   title: string;
//   icon?: React.ReactNode;
//   children: React.ReactNode;
// }) {
//   return (
//     <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6 md:p-8 backdrop-blur-xl">
//       <div className="flex items-center gap-2 mb-5">
//         {icon && <div className="p-1.5 rounded-lg bg-white/5">{icon}</div>}
//         <h2 className="text-base font-medium text-white/90 tracking-wide">
//           {title}
//         </h2>
//       </div>
//       {children}
//     </div>
//   );
// }

// function Field({
//   label,
//   children,
// }: {
//   label: string;
//   children: React.ReactNode;
// }) {
//   return (
//     <div className="w-full">
//       <label className="block text-xs font-medium text-white/60 mb-2 ml-1">
//         {label}
//       </label>
//       {children}
//     </div>
//   );
// }

// Current Old

// "use client";

// import { useEffect, useState, useRef } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import Link from "next/link";
// import {
//   Plus,
//   Mic,
//   Settings,
//   Trash2,
//   Shield,
//   Info,
//   ChevronLeft,
//   User,
//   Check,
//   Volume2,
//   Play,
//   Pause,
//   ExternalLink,
//   Code,
//   Save,
//   Copy,
//   ChevronDown,
//   Sparkles,
// } from "lucide-react";
// import { useAgentStore } from "@/store";
// import { apiClient } from "@/lib/api/client";
// import { AvatarOption } from "@/components/avatar/Avatars";
// import type { Agent } from "@/types";

// // ── Constants & Demos ────────────────────────────────────────────────────────

// const DEMO_AGENTS: Agent[] = [
//   {
//     id: "demo-sarah",
//     name: "Welcome to LiveAvatar",
//     slug: "sarah-support",
//     description:
//       "Empathetic customer success agent specialized in SaaS troubleshooting.",
//     system_prompt:
//       "You are Sarah, a customer support agent. Be warm, professional, and clear.",
//     language: "en-US",
//     avatar_type: "waveform",
//     llm_provider: "openai",
//     avatar_id: "123",
//     llm_model: "gpt-4o",
//     is_public: true,
//     is_active: true,
//   },
//   {
//     id: "demo-alex",
//     name: "Customer Support",
//     slug: "alex-recruiter",
//     description:
//       "Highly engaging interactive voice recruiter for technical screenings.",
//     system_prompt:
//       "You are Alex, a tech recruiter. Be upbeat and assess skills.",
//     language: "en-US",
//     avatar_type: "readyplayerme",
//     avatar_url: "https://models.readyplayer.me/64b58e72750e6878b6711a78.glb",
//     llm_provider: "anthropic",
//     avatar_id: "12134",
//     llm_model: "claude-3-5-sonnet",
//     is_public: true,
//     is_active: true,
//   },
// ];

// const LLM_MODELS = [
//   { value: "gpt-4o-mini", label: "GPT-4o Mini", provider: "openai" },
//   { value: "gpt-4o", label: "GPT-4o", provider: "openai" },
//   {
//     value: "claude-3-5-sonnet-20241022",
//     label: "Claude 3.5 Sonnet",
//     provider: "anthropic",
//   },
//   {
//     value: "claude-3-5-haiku-20241022",
//     label: "Claude 3.5 Haiku",
//     provider: "anthropic",
//   },
// ];

// const CARTESIA_VOICES = [
//   {
//     id: "47c38ca4-5f35-497b-b1a3-415245fb35e1",
//     name: "Daniel",
//     description: "Deep, crisp, professional",
//     language: "en",
//     previewUrl: "./voice/daniel.wav",
//   },
//   {
//     id: "db6b0ed5-d5d3-463d-ae85-518a07d3c2b4",
//     name: "Skylar",
//     description: "Warm, empathetic",
//     language: "en",
//     previewUrl: "./voice/sarah.wav",
//   },
// ];

// const inp =
//   "w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-gray-900 text-sm placeholder-gray-400 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all shadow-sm";

// // ── Main Page Component ──────────────────────────────────────────────────────

// export default function AgentsPage() {
//   const { agents, setAgents, removeAgent, isLoading, setLoading } =
//     useAgentStore();
//   const [error, setError] = useState<string | null>(null);
//   const [isDemoMode, setIsDemoMode] = useState(false);
//   const [view, setView] = useState<"list" | "create">("list");

//   useEffect(() => {
//     loadAgents();
//   }, []);

//   async function loadAgents() {
//     setLoading(true);
//     setError(null);
//     try {
//       const data = await apiClient.get<Agent[]>("/api/agents/");
//       if (data && data.length > 0) {
//         setAgents(data);
//         setIsDemoMode(false);
//       } else {
//         setAgents(DEMO_AGENTS);
//         setIsDemoMode(true);
//       }
//     } catch (e) {
//       setAgents(DEMO_AGENTS);
//       setIsDemoMode(true);
//     } finally {
//       setLoading(false);
//     }
//   }

//   async function handleDelete(id: string) {
//     if (!confirm("Are you sure you want to delete this voice agent?")) return;
//     if (isDemoMode || id.startsWith("demo-")) {
//       removeAgent(id);
//       return;
//     }
//     try {
//       await apiClient.delete(`/api/agents/${id}`);
//       removeAgent(id);
//     } catch (e) {
//       setError("Failed to delete the agent from server");
//     }
//   }

//   return (
//     <div className="min-h-full bg-[#f8fafc] text-gray-900 p-8 md:p-12">
//       <AnimatePresence mode="wait">
//         {view === "list" ? (
//           <motion.div
//             key="list-view"
//             initial={{ opacity: 0, y: 10 }}
//             animate={{ opacity: 1, y: 0 }}
//             exit={{ opacity: 0, y: -10 }}
//             transition={{ duration: 0.3 }}
//             className="max-w-[1400px] mx-auto"
//           >
//             {/* Header */}
//             <div className="flex items-center gap-4 mb-8">
//               <h1 className="text-2xl font-medium text-gray-900 tracking-tight">
//                 Contexts ({agents.length})
//               </h1>
//               <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1c1c1c] text-white text-[11px] font-semibold tracking-wide cursor-pointer hover:bg-black transition-colors">
//                 GET /v1/contexts{" "}
//                 <ExternalLink size={12} className="ml-0.5 opacity-80" />
//               </div>

//               {isDemoMode && (
//                 <div className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 text-xs font-medium">
//                   <Info size={14} /> Demo Mode
//                 </div>
//               )}
//             </div>

//             <div className="border-b border-gray-200 mb-8 w-full" />

//             {isLoading ? (
//               <div className="flex flex-col items-center justify-center h-64 gap-4 text-gray-400">
//                 <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
//               </div>
//             ) : (
//               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
//                 <motion.div
//                   whileHover={{ y: -2 }}
//                   whileTap={{ scale: 0.98 }}
//                   onClick={() => setView("create")}
//                   className="group cursor-pointer border-2 border-dashed border-gray-300 hover:border-gray-400 rounded-2xl flex flex-col items-center justify-center min-h-[240px] bg-white hover:bg-gray-50 transition-all"
//                 >
//                   <div className="w-12 h-12 rounded-full flex items-center justify-center text-gray-400 mb-3 bg-white border border-gray-200 shadow-sm group-hover:text-blue-600">
//                     <Plus size={24} strokeWidth={2} />
//                   </div>
//                   <span className="text-sm font-bold text-gray-900 group-hover:text-blue-700">
//                     Create New
//                   </span>
//                 </motion.div>

//                 {agents.map((agent, i) => (
//                   <AgentCard
//                     key={agent.id}
//                     agent={agent}
//                     index={i}
//                     onDelete={() => handleDelete(agent.id)}
//                   />
//                 ))}
//               </div>
//             )}
//           </motion.div>
//         ) : (
//           <motion.div
//             key="create-view"
//             initial={{ opacity: 0, x: 50 }}
//             animate={{ opacity: 1, x: 0 }}
//             exit={{ opacity: 0, x: -50 }}
//             transition={{ type: "spring", stiffness: 300, damping: 30 }}
//             className="max-w-[1200px] mx-auto"
//           >
//             <CreateAgentView
//               onBack={() => setView("list")}
//               onSuccess={() => {
//                 setView("list");
//                 loadAgents();
//               }}
//             />
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </div>
//   );
// }

// function AgentCard({
//   agent,
//   index,
//   onDelete,
// }: {
//   agent: Agent;
//   index: number;
//   onDelete: () => void;
// }) {
//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 15 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ delay: index * 0.04 }}
//       className="bg-white border border-gray-200 rounded-2xl p-6 transition-all duration-200 hover:shadow-md flex flex-col min-h-[240px] relative group"
//     >
//       <div className="absolute top-4 right-4 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
//         <Link href={`/dashboard/agents/${agent.id}`}>
//           <button className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 hover:text-black">
//             <Settings size={14} />
//           </button>
//         </Link>
//         <button
//           onClick={onDelete}
//           className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-red-50 hover:text-red-600"
//         >
//           <Trash2 size={14} />
//         </button>
//       </div>

//       <div className="flex-1 space-y-5 mt-1">
//         <div>
//           <p className="text-[11px] text-gray-400 font-medium mb-1">Name</p>
//           <h3 className="font-semibold text-gray-900 text-[15px] pr-20 leading-tight truncate">
//             {agent.name}
//           </h3>
//         </div>
//         <div>
//           <p className="text-[11px] text-gray-400 font-medium mb-1">
//             Creation Date
//           </p>
//           <p className="text-[13px] text-gray-700 font-medium">May 19, 2026</p>
//         </div>
//         <div>
//           <p className="text-[11px] text-gray-400 font-medium mb-1">
//             Last Edit
//           </p>
//           <p className="text-[13px] text-gray-700 font-medium flex items-center gap-2">
//             May 19, 2026
//             <span
//               className={`w-1.5 h-1.5 rounded-full ${agent.is_active ? "bg-green-500" : "bg-gray-300"}`}
//             />
//           </p>
//         </div>
//       </div>
//       <Link
//         href={`/dashboard/agents/${agent.id}/test`}
//         className="mt-5 block opacity-0 group-hover:opacity-100 transition-opacity"
//       >
//         <button className="w-full py-2 bg-gray-50 hover:bg-gray-100 text-black font-medium text-xs rounded-lg border border-gray-200 flex items-center justify-center gap-2">
//           <Mic size={14} /> Launch Sandbox
//         </button>
//       </Link>
//     </motion.div>
//   );
// }

// // ── Creation Form Component (Step-by-Step Wizard with Animations) ───────────

// function CreateAgentView({
//   onBack,
//   onSuccess,
// }: {
//   onBack: () => void;
//   onSuccess: () => void;
// }) {
//   const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
//   const [saving, setSaving] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [createdAgentId, setCreatedAgentId] = useState<string | null>(null);
//   const [copied, setCopied] = useState(false);
//   const [avatars, setAvatars] = useState<AvatarOption[]>([]);
//   const [loadingAvatars, setLoadingAvatars] = useState(true);

//   const [form, setForm] = useState({
//     name: "",
//     description: "",
//     language: "en",
//     voice_id: "",
//     system_prompt:
//       "You are a professional AI Support Desk Assistant designed to help users resolve issues...",
//     llm_model: "gpt-4o",
//     llm_provider: "openai",
//     is_public: true,
//     avatar_id: "",
//   });

//   const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);
//   const audioRef = useRef<HTMLAudioElement | null>(null);

//   useEffect(() => {
//     async function initFormData() {
//       try {
//         setLoadingAvatars(true);
//         const avatarResponse = await apiClient.get<any>("/api/avatars");
//         const avatarData =
//           avatarResponse?.data?.results ?? avatarResponse?.data ?? [];
//         if (avatarData && avatarData.length > 0) {
//           setAvatars(avatarData);
//           setForm((f) => ({ ...f, avatar_id: avatarData[0].id }));
//         }
//       } catch (err) {
//         console.error(err);
//       } finally {
//         setLoadingAvatars(false);
//       }
//     }
//     initFormData();
//     return () => {
//       if (audioRef.current) audioRef.current.pause();
//     };
//   }, []);

//   const set = (k: string, v: any) => setForm((prev) => ({ ...prev, [k]: v }));

//   const handleTogglePreview = (
//     e: React.MouseEvent,
//     voiceId: string,
//     url: string,
//   ) => {
//     e.stopPropagation();
//     if (playingVoiceId === voiceId) {
//       audioRef.current?.pause();
//       setPlayingVoiceId(null);
//     } else {
//       if (audioRef.current) audioRef.current.pause();
//       audioRef.current = new Audio(url);
//       setPlayingVoiceId(voiceId);
//       audioRef.current.play().catch(() => setPlayingVoiceId(null));
//       audioRef.current.onended = () => setPlayingVoiceId(null);
//     }
//   };

//   const handleSubmit = async () => {
//     if (!form.name.trim()) return setError("Agent name is required.");
//     setSaving(true);
//     try {
//       const res = await apiClient.post<any>("/api/agents/", form);
//       setCreatedAgentId(res?.id || "18ba065b41e349a38c138767a10de987");
//       setCurrentStep(3);
//     } catch (e: any) {
//       setError(e.message ?? "Failed to create agent");
//     } finally {
//       setSaving(false);
//     }
//   };

//   const handleStepClick = (step: 1 | 2 | 3) => {
//     if (step === 3 && !createdAgentId) return; // Prevent going to embed if not created
//     setCurrentStep(step);
//   };

//   return (
//     <div className="w-full pb-16">
//       {/* Top Action Bar */}
//       <div className="flex items-center justify-between mb-8">
//         <div className="flex items-center gap-3">
//           <button
//             onClick={onBack}
//             className="p-2 -ml-2 rounded-lg text-gray-500 hover:text-black hover:bg-gray-100 transition-all"
//           >
//             <ChevronLeft size={20} />
//           </button>
//           <h2 className="text-xl font-semibold text-gray-900">
//             {form.name || "Support Desk 1"}
//           </h2>
//         </div>
//         <button
//           onClick={currentStep === 2 ? handleSubmit : () => setCurrentStep(2)}
//           disabled={saving}
//           className="bg-[#2442a8] hover:bg-[#1d3588] text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium shadow-sm transition-all"
//         >
//           <Save size={16} /> {saving ? "Saving..." : "Save Changes"}
//         </button>
//       </div>

//       {/* Interactive Stepper Navigation */}
//       <div className="flex items-center gap-12 border-b border-gray-200 mb-8 bg-white px-6 rounded-t-xl shadow-sm pt-4">
//         <StepItem
//           step={1}
//           currentStep={currentStep}
//           icon={<Settings size={16} />}
//           label="Configuration"
//           onClick={() => handleStepClick(1)}
//         />
//         <StepItem
//           step={2}
//           currentStep={currentStep}
//           icon={<User size={16} />}
//           label="Avatars"
//           onClick={() => handleStepClick(2)}
//         />
//         <StepItem
//           step={3}
//           currentStep={currentStep}
//           icon={<Code size={16} />}
//           label="Embed Code"
//           onClick={() => handleStepClick(3)}
//         />
//       </div>

//       <AnimatePresence mode="wait">
//         <motion.div
//           key={currentStep}
//           initial={{ opacity: 0, x: 20 }}
//           animate={{ opacity: 1, x: 0 }}
//           exit={{ opacity: 0, x: -20 }}
//           transition={{ duration: 0.3, ease: "easeInOut" }}
//         >
//           {error && (
//             <div className="px-4 py-3 mb-6 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm flex items-center gap-2">
//               <Shield size={16} /> {error}
//             </div>
//           )}

//           {/* STEP 1: CONFIGURATION */}
//           {currentStep === 1 && (
//             <div className="space-y-6">
//               <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//                 <Card
//                   title="Basic Information"
//                   icon={<Info size={16} className="text-[#2442a8]" />}
//                 >
//                   <div className="space-y-5">
//                     <Field label="Chatbot Name *">
//                       <input
//                         value={form.name}
//                         onChange={(e) => set("name", e.target.value)}
//                         placeholder="Support Desk 1"
//                         className={inp}
//                       />
//                     </Field>
//                     <Field label="Description">
//                       <textarea
//                         value={form.description}
//                         onChange={(e) => set("description", e.target.value)}
//                         rows={4}
//                         className={`${inp} resize-none`}
//                       />
//                     </Field>
//                   </div>
//                 </Card>

//                 <Card
//                   title="AI Configuration"
//                   icon={<Settings size={16} className="text-[#2442a8]" />}
//                 >
//                   <Field label="System Prompt *">
//                     <textarea
//                       value={form.system_prompt}
//                       onChange={(e) => set("system_prompt", e.target.value)}
//                       rows={9}
//                       className={`${inp} resize-none bg-gray-50`}
//                     />
//                   </Field>
//                 </Card>
//               </div>

//               <Card
//                 title="Model Settings"
//                 icon={<Settings size={16} className="text-[#2442a8]" />}
//               >
//                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
//                   {/* Voice Dropdown */}
//                   <Field label="Voice">
//                     <div className="relative">
//                       <select
//                         value={form.voice_id}
//                         onChange={(e) => set("voice_id", e.target.value)}
//                         className={`${inp} appearance-none pr-10`}
//                       >
//                         <option value="">Select a voice timbre</option>
//                         {CARTESIA_VOICES.map((v) => (
//                           <option key={v.id} value={v.id}>
//                             {v.name} ({v.description})
//                           </option>
//                         ))}
//                       </select>
//                       <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none flex items-center gap-2">
//                         <ChevronDown size={16} className="text-gray-400" />
//                       </div>
//                       {/* Play Button for Selected Voice */}
//                       {form.voice_id && (
//                         <button
//                           onClick={(e) => {
//                             const v = CARTESIA_VOICES.find(
//                               (x) => x.id === form.voice_id,
//                             );
//                             if (v) handleTogglePreview(e, v.id, v.previewUrl);
//                           }}
//                           className="mt-3 flex items-center gap-2 text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors"
//                         >
//                           {playingVoiceId === form.voice_id ? (
//                             <Pause size={14} fill="currentColor" />
//                           ) : (
//                             <Play size={14} fill="currentColor" />
//                           )}
//                           Preview Selected Voice
//                         </button>
//                       )}
//                     </div>
//                   </Field>

//                   {/* Model Dropdown */}
//                   <Field label="Language Engine">
//                     <div className="relative">
//                       <select
//                         value={form.llm_model}
//                         onChange={(e) => {
//                           const m = LLM_MODELS.find(
//                             (x) => x.value === e.target.value,
//                           );
//                           set("llm_model", e.target.value);
//                           if (m) set("llm_provider", m.provider);
//                         }}
//                         className={`${inp} appearance-none pr-10`}
//                       >
//                         {LLM_MODELS.map((m) => (
//                           <option key={m.value} value={m.value}>
//                             {m.label} ({m.provider})
//                           </option>
//                         ))}
//                       </select>
//                       <ChevronDown
//                         size={16}
//                         className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400"
//                       />
//                     </div>
//                   </Field>
//                 </div>
//               </Card>
//               <div className="flex justify-end">
//                 <button
//                   onClick={() => setCurrentStep(2)}
//                   className="bg-[#2442a8] text-white px-8 py-2.5 rounded-lg font-medium"
//                 >
//                   Next
//                 </button>
//               </div>
//             </div>
//           )}

//           {/* STEP 2: AVATARS */}
//           {currentStep === 2 && (
//             <div className="space-y-6">
//               <Card
//                 title="Avatars"
//                 icon={<User size={16} className="text-[#2442a8]" />}
//               >
//                 {loadingAvatars ? (
//                   <div className="py-12 flex justify-center">
//                     <div className="w-8 h-8 border-2 border-t-blue-600 rounded-full animate-spin" />
//                   </div>
//                 ) : (
//                   <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
//                     {avatars.map((av) => (
//                       <AvatarCard
//                         key={av.id}
//                         avatar={av}
//                         previewUrl={av.preview_url}
//                         selected={form.avatar_id === av.id}
//                         onClick={() => set("avatar_id", av.id)}
//                       />
//                     ))}
//                   </div>
//                 )}
//               </Card>
//               <div className="flex justify-between">
//                 <button
//                   onClick={() => setCurrentStep(1)}
//                   className="px-8 py-2.5 border border-gray-300 rounded-lg"
//                 >
//                   Back
//                 </button>
//                 <button
//                   onClick={handleSubmit}
//                   disabled={saving}
//                   className="bg-[#2442a8] text-white px-8 py-2.5 rounded-lg"
//                 >
//                   {saving ? "Saving..." : "Finish"}
//                 </button>
//               </div>
//             </div>
//           )}

//           {/* STEP 3: EMBED CODE */}
//           {currentStep === 3 && (
//             <div className="space-y-6">
//               <Card
//                 title="Embed Code"
//                 icon={<Code size={16} className="text-[#2442a8]" />}
//               >
//                 <div className="bg-[#f0f7ff] p-4 rounded-xl mb-6 text-[#0c4a6e] flex gap-3">
//                   <Info size={20} className="shrink-0 text-blue-500" />
//                   <div>
//                     <p className="font-medium mb-1">Implementation Guide:</p>
//                     <ol className="list-decimal list-inside text-sm opacity-80">
//                       <li>Copy the script tag below</li>
//                       <li>
//                         Paste it into your index.html just before the
//                         &lt;/body&gt; tag
//                       </li>
//                     </ol>
//                   </div>
//                 </div>
//                 <div className="bg-[#1a1a1a] p-5 rounded-2xl mb-6 font-mono text-sm text-green-400 overflow-x-auto">
//                   {`<script src="https://app.digitalemployees.us/qxbox/embed/${createdAgentId}.js"></script>`}
//                 </div>
//                 <button
//                   onClick={() => {
//                     navigator.clipboard.writeText(
//                       `<script src="https://app.digitalemployees.us/qxbox/embed/${createdAgentId}.js"></script>`,
//                     );
//                     setCopied(true);
//                     setTimeout(() => setCopied(false), 2000);
//                   }}
//                   className="bg-[#2442a8] text-white px-6 py-2.5 rounded-lg flex items-center gap-2"
//                 >
//                   <Copy size={18} /> {copied ? "Copied!" : "Copy Embed Code"}
//                 </button>
//               </Card>
//             </div>
//           )}
//         </motion.div>
//       </AnimatePresence>
//     </div>
//   );
// }

// // ── Shared UI Components ────────────────────────────────────────────────────

// function StepItem({ step, currentStep, icon, label, onClick }: any) {
//   const isActive = currentStep === step;
//   const isPast = currentStep > step;
//   return (
//     <div
//       onClick={onClick}
//       className={`flex items-center gap-2 py-4 border-b-2 transition-all cursor-pointer ${isActive ? "border-[#2442a8]" : "border-transparent opacity-60 hover:opacity-100"}`}
//     >
//       <div
//         className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${isActive || isPast ? "bg-[#2442a8] text-white" : "bg-gray-200 text-gray-500"}`}
//       >
//         {step}
//       </div>
//       <div
//         className={`flex items-center gap-1.5 font-semibold text-sm ${isActive || isPast ? "text-[#2442a8]" : "text-gray-400"}`}
//       >
//         {icon} {label}
//       </div>
//     </div>
//   );
// }

// function Card({ title, icon, children }: any) {
//   return (
//     <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm">
//       <div className="flex items-center gap-2 mb-6 text-[#2442a8]">
//         {icon} <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
//       </div>
//       {children}
//     </div>
//   );
// }

// function Field({ label, children }: any) {
//   return (
//     <div className="w-full">
//       <label className="block text-[13px] font-medium text-gray-600 mb-1.5">
//         {label}
//       </label>
//       {children}
//     </div>
//   );
// }

// function AvatarCard({ avatar, selected, onClick, previewUrl }: any) {
//   return (
//     <button
//       type="button"
//       onClick={onClick}
//       className={`relative flex flex-col items-center gap-3 p-4 rounded-xl border transition-all ${selected ? "border-[#2442a8] bg-blue-50/30 ring-1 ring-[#2442a8]" : "border-gray-200 bg-white hover:border-gray-300"}`}
//     >
//       <div className="rounded-full ring-1 ring-gray-200 bg-gray-100 overflow-hidden w-20 h-20">
//         <img
//           src={previewUrl || "https://ui-avatars.com/api/?name=A"}
//           alt={avatar.name}
//           className="w-full h-full object-cover"
//         />
//       </div>
//       <p
//         className={`text-sm font-medium ${selected ? "text-[#2442a8]" : "text-gray-800"}`}
//       >
//         {avatar.name}
//       </p>
//     </button>
//   );
// }

"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Plus,
  Mic,
  Settings,
  Trash2,
  Shield,
  Info,
  ChevronLeft,
  User,
  Check,
  Volume2,
  Play,
  Pause,
  ExternalLink,
  Code,
  Save,
  Copy,
  ChevronDown,
  Sparkles,
  BookOpen,
  Upload,
  FileText,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
  File,
  RotateCcw,
  Type,
} from "lucide-react";
import { useAgentStore } from "@/store";
import { apiClient } from "@/lib/api/client";
import { AvatarOption } from "@/components/avatar/Avatars";
import type { Agent } from "@/types";

// ── Constants ────────────────────────────────────────────────────────────────

const DEMO_AGENTS: Agent[] = [
  {
    id: "demo-sarah",
    name: "Welcome to LiveAvatar",
    slug: "sarah-support",
    description:
      "Empathetic customer success agent specialized in SaaS troubleshooting.",
    system_prompt:
      "You are Sarah, a customer support agent. Be warm, professional, and clear.",
    language: "en-US",
    avatar_type: "waveform",
    llm_provider: "openai",
    avatar_id: "123",
    llm_model: "gpt-4o",
    is_public: true,
    is_active: true,
  },
  {
    id: "demo-alex",
    name: "Customer Support",
    slug: "alex-recruiter",
    description:
      "Highly engaging interactive voice recruiter for technical screenings.",
    system_prompt:
      "You are Alex, a tech recruiter. Be upbeat and assess skills.",
    language: "en-US",
    avatar_type: "readyplayerme",
    avatar_url: "https://models.readyplayer.me/64b58e72750e6878b6711a78.glb",
    llm_provider: "anthropic",
    avatar_id: "12134",
    llm_model: "claude-3-5-sonnet",
    is_public: true,
    is_active: true,
  },
];

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

const LLM_MODELS = [
  { value: "gpt-4o-mini", label: "GPT-4o Mini", provider: "openai" },
  { value: "gpt-4o", label: "GPT-4o", provider: "openai" },
  {
    value: "claude-3-5-sonnet-20241022",
    label: "Claude 3.5 Sonnet",
    provider: "anthropic",
  },
  {
    value: "claude-3-5-haiku-20241022",
    label: "Claude 3.5 Haiku",
    provider: "anthropic",
  },
];

// const CARTESIA_VOICES = [
//   {
//     id: "47c38ca4-5f35-497b-b1a3-415245fb35e1",
//     name: "Daniel",
//     description: "Deep, crisp, professional",
//     language: "en",
//     previewUrl: "./voice/daniel.wav",
//   },
//   {
//     id: "db6b0ed5-d5d3-463d-ae85-518a07d3c2b4",
//     name: "Skylar",
//     description: "Warm, empathetic",
//     language: "en",
//     previewUrl: "./voice/sarah.wav",
//   },
// ];
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

const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "text/plain",
  "text/markdown",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);
const ALLOWED_EXT_LABEL = "PDF, TXT, MD, DOCX";
const MAX_FILE_MB = 20;

const inp =
  "w-full px-4! py-2.5! bg-white! border border-gray-200 rounded-lg text-gray-900 text-sm placeholder-gray-400 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all shadow-sm";

// ── Types ────────────────────────────────────────────────────────────────────

type DocStatus = "pending" | "processing" | "ready" | "error";

interface UploadedDoc {
  id: string;
  filename: string;
  status: DocStatus;
  file_size?: number;
  content_type?: string;
  // local-only while uploading
  uploading?: boolean;
  uploadError?: string;
}

interface KBInfo {
  id: string;
  name: string;
  document_count: number;
}

// ── Main Page ────────────────────────────────────────────────────────────────

export default function AgentsPage() {
  const { agents, setAgents, removeAgent, isLoading, setLoading } =
    useAgentStore();
  const [error, setError] = useState<string | null>(null);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [view, setView] = useState<"list" | "create">("list");

  useEffect(() => {
    loadAgents();
  }, []);

  async function loadAgents() {
    setLoading(true);
    setError(null);
    try {
      const data = await apiClient.get<Agent[]>("/api/agents/");
      if (data && data.length > 0) {
        setAgents(data);
        setIsDemoMode(false);
      } else {
        setAgents(DEMO_AGENTS);
        setIsDemoMode(true);
      }
    } catch {
      setAgents(DEMO_AGENTS);
      setIsDemoMode(true);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this voice agent?")) return;
    if (isDemoMode || id.startsWith("demo-")) {
      removeAgent(id);
      return;
    }
    try {
      await apiClient.delete(`/api/agents/${id}`);
      removeAgent(id);
    } catch {
      setError("Failed to delete the agent from server");
    }
  }

  return (
    <div className="min-h-full bg-[#f8fafc] text-gray-900 p-8 md:p-12">
      <AnimatePresence mode="wait">
        {view === "list" ? (
          <motion.div
            key="list"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="max-w-[1400px] mx-auto"
          >
            <div className="flex items-center gap-4 mb-8">
              <h1 className="text-2xl font-medium text-gray-900 tracking-tight">
                Agents ({agents.length})
              </h1>

              {isDemoMode && (
                <div className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 text-xs font-medium">
                  <Info size={14} /> Demo Mode
                </div>
              )}
            </div>
            <div className="border-b border-gray-200 mb-8 w-full" />
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-64 gap-4 text-gray-400">
                <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 m-10! ">
                <motion.div
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setView("create")}
                  className="group cursor-pointer border-2 border-dashed border-gray-300 hover:border-gray-400 rounded-2xl flex flex-col items-center justify-center min-h-[240px] bg-white hover:bg-gray-50 transition-all"
                >
                  <div className="w-12 h-12 rounded-full flex items-center justify-center text-gray-400 mb-3 bg-white border border-gray-200 shadow-sm group-hover:text-blue-600">
                    <Plus size={24} strokeWidth={2} />
                  </div>
                  <span className="text-sm font-bold text-gray-900 group-hover:text-blue-700">
                    Create New
                  </span>
                </motion.div>
                {agents.map((agent, i) => (
                  <AgentCard
                    key={agent.id}
                    agent={agent}
                    index={i}
                    onDelete={() => handleDelete(agent.id)}
                  />
                ))}
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="create"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="max-w-[1200px] mx-auto"
          >
            <CreateAgentView
              onBack={() => setView("list")}
              onSuccess={() => {
                setView("list");
                loadAgents();
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Agent Card ───────────────────────────────────────────────────────────────

function AgentCard({
  agent,
  index,
  onDelete,
}: {
  agent: Agent;
  index: number;
  onDelete: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className="bg-white border border-gray-200 rounded-2xl p-4! transition-all duration-200 hover:shadow-md flex flex-col min-h-[240px] relative group "
    >
      <div className="absolute top-4 right-4 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
        <Link href={`/dashboard/agents/${agent.id}`}>
          <button className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 hover:text-black">
            <Settings size={14} />
          </button>
        </Link>
        <button
          onClick={onDelete}
          className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-red-50 hover:text-red-600"
        >
          <Trash2 size={14} />
        </button>
      </div>
      <div className="flex-1 space-y-5 mt-1">
        <div>
          <p className="text-[11px] text-gray-400 font-medium mb-1">Name</p>
          <h3 className="font-semibold text-gray-900 text-[15px] pr-20 leading-tight truncate">
            {agent.name}
          </h3>
        </div>
        <div>
          <p className="text-[11px] text-gray-400 font-medium mb-1">
            Creation Date
          </p>
          <p className="text-[13px] text-gray-700 font-medium">May 19, 2026</p>
        </div>
        <div>
          <p className="text-[11px] text-gray-400 font-medium mb-1">
            Last Edit
          </p>
          <p className="text-[13px] text-gray-700 font-medium flex items-center gap-2">
            May 19, 2026
            <span
              className={`w-1.5 h-1.5 rounded-full ${agent.is_active ? "bg-green-500" : "bg-gray-300"}`}
            />
          </p>
        </div>
      </div>
      <Link
        href={`/dashboard/agents/${agent.id}/test`}
        className="mt-5 block opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <button className="w-full py-2 bg-gray-50 hover:bg-gray-100 text-black font-medium text-xs rounded-lg border border-gray-200 flex items-center justify-center gap-2">
          <Mic size={14} /> Launch Sandbox
        </button>
      </Link>
    </motion.div>
  );
}

// ── Create Agent Wizard (4 Steps) ─────────────────────────────────────────────

function CreateAgentView({
  onBack,
  onSuccess,
}: {
  onBack: () => void;
  onSuccess: () => void;
}) {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdAgentId, setCreatedAgentId] = useState<string | null>(null);
  const [createdKbId, setCreatedKbId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [avatars, setAvatars] = useState<AvatarOption[]>([]);
  const [loadingAvatars, setLoadingAvatars] = useState(true);

  const [form, setForm] = useState({
    name: "",
    description: "",
    language: "en",
    voice_id: "",
    system_prompt:
      "You are a professional AI Support Desk Assistant designed to help users resolve issues...",
    llm_model: "gpt-4o",
    llm_provider: "openai",
    is_public: true,
    avatar_id: "",
    musetalk_avatar_id: "ava",
  });

  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
      if (audioRef.current) audioRef.current.pause();
    };
  }, []);

  const set = (k: string, v: any) => setForm((prev) => ({ ...prev, [k]: v }));

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

  // Create agent (called from step 2 "Finish" button)
  const handleCreateAgent = async () => {
    if (!form.name.trim()) return setError("Agent name is required.");
    setSaving(true);
    setError(null);
    try {
      const res = await apiClient.post<any>("/api/agents/", form);
      const agentId = res?.id ?? "fallback-id";
      setCreatedAgentId(agentId);

      // Eagerly create the default KB so step 3 can upload immediately
      const kb = await apiClient.post<any>(
        `/api/knowledge/agents/${agentId}/kb/`,
        {
          name: "Main Knowledge Base",
          description: "Auto-created knowledge base",
        },
      );
      setCreatedKbId(kb?.id ?? null);
      setCurrentStep(3);
    } catch (e: any) {
      setError(e.message ?? "Failed to create agent");
    } finally {
      setSaving(false);
    }
  };

  const handleStepClick = (step: 1 | 2 | 3 | 4) => {
    if (step >= 3 && !createdAgentId) return;
    setCurrentStep(step);
  };

  const STEPS = [
    { step: 1 as const, icon: <Settings size={16} />, label: "Configuration" },
    { step: 2 as const, icon: <User size={16} />, label: "Avatars" },
    { step: 3 as const, icon: <BookOpen size={16} />, label: "Knowledge Base" },
    { step: 4 as const, icon: <Code size={16} />, label: "Embed Code" },
  ];

  const embedCode = `<!-- VoiceAgent Embeddable Assistant Widget -->
<script>
  window.VoiceAgentConfig = {
    agentId: "${createdAgentId}",
    apiUrl: "${typeof window !== "undefined" ? window.location.origin : ""}"
  };
</script>
<script src="${typeof window !== "undefined" ? window.location.origin : ""}/components/widget/widget.js" async></script>`;

  return (
    <div className="w-full m-2!">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-8 ">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 -ml-2 rounded-lg text-gray-500 hover:text-black hover:bg-gray-100 transition-all"
          >
            <ChevronLeft size={20} />
          </button>
          <h2 className="text-xl font-semibold text-gray-900">
            {form.name || "New Agent"}
          </h2>
        </div>
        {currentStep < 3 && (
          <button
            onClick={
              currentStep === 2 ? handleCreateAgent : () => setCurrentStep(2)
            }
            disabled={saving}
            className="bg-[#2442a8] hover:bg-[#1d3588] text-white px-4! py-2! rounded-lg flex items-center gap-2 text-sm font-medium shadow-sm transition-all disabled:opacity-60"
          >
            <Save size={16} /> {saving ? "Saving…" : "Save Changes"}
          </button>
        )}
        {currentStep === 3 && (
          <button
            onClick={() => setCurrentStep(4)}
            className="bg-[#2442a8] hover:bg-[#1d3588] text-white px-4! py-2! rounded-lg flex items-center gap-2 text-sm font-medium"
          >
            Continue to Embed <ChevronDown size={16} className="-rotate-90" />
          </button>
        )}
      </div>

      {/* Stepper */}
      <div className="flex items-center gap-8 border-b border-gray-200 mb-8 bg-white px-6 rounded-t-xl shadow-sm p-5! ">
        {STEPS.map((s) => (
          <StepItem
            key={s.step}
            step={s.step}
            currentStep={currentStep}
            icon={s.icon}
            label={s.label}
            onClick={() => handleStepClick(s.step)}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.25, ease: "easeInOut" }}
        >
          {error && (
            <div className="px-4 py-3 mb-6 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm flex items-center gap-2">
              <Shield size={16} /> {error}
            </div>
          )}

          {/* ── STEP 1: CONFIGURATION ── */}
          {currentStep === 1 && (
            <div className="space-y-6 m-2!">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card
                  title="Basic Information"
                  icon={<Info size={16} className="text-[#2442a8]" />}
                >
                  <div className="space-y-4!">
                    <Field label="Chatbot Name *">
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
                        className={`${inp} resize-none`}
                      />
                    </Field>
                  </div>
                </Card>
                <Card
                  title="AI Configuration"
                  icon={<Settings size={16} className="text-[#2442a8]" />}
                >
                  <Field label="System Prompt *">
                    <textarea
                      value={form.system_prompt}
                      onChange={(e) => set("system_prompt", e.target.value)}
                      rows={9}
                      className={`${inp} resize-none bg-gray-50`}
                    />
                  </Field>
                </Card>
              </div>
              <Card
                title="Model Settings"
                icon={<Settings size={16} className="text-[#2442a8]" />}
                className="!mt-6"
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 ">
                  <Field label="Voice">
                    <div className="relative">
                      <select
                        value={form.voice_id}
                        onChange={(e) => set("voice_id", e.target.value)}
                        className={`${inp} appearance-none pr-10`}
                      >
                        <option value="">Select a voice timbre</option>
                        {CARTESIA_VOICES.map((v) => (
                          <option key={v.id} value={v.id}>
                            {v.name} ({v.description})
                          </option>
                        ))}
                      </select>
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                        <ChevronDown size={16} className="text-gray-400" />
                      </div>
                      {form.voice_id && (
                        <button
                          onClick={(e) => {
                            const v = CARTESIA_VOICES.find(
                              (x) => x.id === form.voice_id,
                            );
                            if (v) handleTogglePreview(e, v.id, v.previewUrl);
                          }}
                          className="mt-3 flex items-center gap-2 text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors"
                        >
                          {playingVoiceId === form.voice_id ? (
                            <Pause size={14} fill="currentColor" />
                          ) : (
                            <Play size={14} fill="currentColor" />
                          )}
                          Preview Selected Voice
                        </button>
                      )}
                    </div>
                  </Field>
                  <Field label="Language Engine">
                    <div className="relative">
                      <select
                        value={form.llm_model}
                        onChange={(e) => {
                          const m = LLM_MODELS.find(
                            (x) => x.value === e.target.value,
                          );
                          set("llm_model", e.target.value);
                          if (m) set("llm_provider", m.provider);
                        }}
                        className={`${inp} appearance-none pr-10`}
                      >
                        {LLM_MODELS.map((m) => (
                          <option key={m.value} value={m.value}>
                            {m.label} ({m.provider})
                          </option>
                        ))}
                      </select>
                      <ChevronDown
                        size={16}
                        className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400"
                      />
                    </div>
                  </Field>
                </div>
              </Card>
              <div className="flex justify-end">
                <Button
                  onClick={() => setCurrentStep(2)}
                  className="bg-[#2442a8] text-white px-8 py-2.5 rounded-lg font-medium"
                >
                  Next
                </Button>
              </div>
            </div>
          )}

          {/* ── STEP 2: AVATARS ── */}
          {/* ── STEP 2: AVATARS ── */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <Card
                title="Choose Avatar"
                icon={<User size={16} className="text-[#2442a8]" />}
              >
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
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
              <div className="flex justify-between">
                <Button
                  onClick={() => setCurrentStep(1)}
                  className="bg-white! text-gray-700! px-8 py-2.5 border border-gray-300 rounded-lg font-medium"
                >
                  Back
                </Button>
                <Button
                  onClick={handleCreateAgent}
                  disabled={saving}
                  className="bg-[#2442a8] text-white px-8 py-2.5 rounded-lg font-medium disabled:opacity-60"
                >
                  {saving ? "Creating…" : "Create Agent →"}
                </Button>
              </div>
            </div>
          )}

          {/* ── STEP 3: KNOWLEDGE BASE ── */}
          {currentStep === 3 && createdAgentId && (
            <KnowledgeBaseStep
              agentId={createdAgentId}
              kbId={createdKbId}
              onKbCreated={setCreatedKbId}
              onContinue={() => setCurrentStep(4)}
              onBack={() => setCurrentStep(2)}
            />
          )}

          {/* ── STEP 4: EMBED CODE ── */}
          {currentStep === 4 && (
            <div className="space-y-6 mt-2!">
              <Card
                title="Embed Code"
                icon={<Code size={16} className="text-[#2442a8]" />}
              >
                <div className="bg-[#f0f7ff] p-4! rounded-xl mb-6! text-[#0c4a6e] flex gap-3">
                  <Info size={20} className="shrink-0 text-blue-500" />
                  <div>
                    <p className="font-medium mb-1">Implementation Guide:</p>
                    <ol className="list-decimal list-inside text-sm opacity-80">
                      <li>Copy the script tag below</li>
                      <li>
                        Paste it into your index.html just before the
                        &lt;/body&gt; tag
                      </li>
                    </ol>
                  </div>
                </div>
                <div className="bg-[#1a1a1a] p-5! rounded-2xl mb-6! font-mono text-sm text-green-400 overflow-x-auto">
                  {embedCode}
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(embedCode);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="bg-[#2442a8] text-white px-6! py-2.5! rounded-lg flex items-center gap-2"
                >
                  <Copy size={18} /> {copied ? "Copied!" : "Copy Embed Code"}
                </button>
              </Card>
              <div className="flex justify-end gap-3 mt-5!">
                <button
                  onClick={() => setCurrentStep(3)}
                  className="px-6! py-2.5! border border-gray-300 rounded-lg font-medium text-sm"
                >
                  ← Back to Knowledge Base
                </button>
                <button
                  onClick={onSuccess}
                  className="bg-green-600 hover:bg-green-700 rounded-lg text-white px-8! py-2.5!rounded-lg font-medium text-sm"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ── Knowledge Base Step ───────────────────────────────────────────────────────

function KnowledgeBaseStep({
  agentId,
  kbId,
  onKbCreated,
  onContinue,
  onBack,
}: {
  agentId: string;
  kbId: string | null;
  onKbCreated: (id: string) => void;
  onContinue: () => void;
  onBack: () => void;
}) {
  const [docs, setDocs] = useState<UploadedDoc[]>([]);
  const [dragging, setDragging] = useState(false);
  const [textMode, setTextMode] = useState(false);
  const [rawText, setRawText] = useState("");
  const [textName, setTextName] = useState("custom_text.txt");
  const [submittingText, setSubmittingText] = useState(false);
  const [kbName] = useState("Main Knowledge Base");
  const fileInputRef = useRef<HTMLInputElement>(null);
  // Poll interval refs keyed by doc id
  const pollRefs = useRef<Record<string, ReturnType<typeof setInterval>>>({});

  // Cleanup all polls on unmount
  useEffect(
    () => () => {
      Object.values(pollRefs.current).forEach(clearInterval);
    },
    [],
  );

  // ── Ensure KB exists (it was created in parent, but guard here too) ─────────
  const ensureKb = useCallback(async (): Promise<string> => {
    if (kbId) return kbId;
    const kb = await apiClient.post<any>(
      `/api/knowledge/agents/${agentId}/kb/`,
      {
        name: kbName,
        description: "Auto-created knowledge base",
      },
    );
    onKbCreated(kb.id);
    return kb.id;
  }, [kbId, agentId, kbName, onKbCreated]);

  // ── Poll a single doc until ready/error ─────────────────────────────────────
  const pollDoc = (currentKbId: string, docId: string) => {
    if (pollRefs.current[docId]) return; // already polling
    pollRefs.current[docId] = setInterval(async () => {
      try {
        const d = await apiClient.get<UploadedDoc>(
          `/api/knowledge/agents/${agentId}/kb/${currentKbId}/documents/${docId}`,
        );
        setDocs((prev) =>
          prev.map((doc) =>
            doc.id === docId ? { ...doc, status: d.status } : doc,
          ),
        );
        if (d.status === "ready" || d.status === "error") {
          clearInterval(pollRefs.current[docId]);
          delete pollRefs.current[docId];
        }
      } catch {
        /* silently ignore poll errors */
      }
    }, 3000);
  };

  // ── Upload a single File object ──────────────────────────────────────────────
  const uploadFile = async (file: File) => {
    // Client-side validation
    const isAllowedType =
      ALLOWED_MIME_TYPES.has(file.type) ||
      [".pdf", ".txt", ".md", ".docx"].some((ext) =>
        file.name.toLowerCase().endsWith(ext),
      );
    if (!isAllowedType) {
      setDocs((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          filename: file.name,
          status: "error",
          uploadError: `Unsupported type. Allowed: ${ALLOWED_EXT_LABEL}`,
        },
      ]);
      return;
    }
    if (file.size > MAX_FILE_MB * 1024 * 1024) {
      setDocs((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          filename: file.name,
          status: "error",
          uploadError: `Exceeds ${MAX_FILE_MB} MB limit`,
        },
      ]);
      return;
    }

    // Optimistic placeholder
    const tempId = crypto.randomUUID();
    setDocs((prev) => [
      ...prev,
      { id: tempId, filename: file.name, status: "pending", uploading: true },
    ]);

    try {
      const currentKbId = await ensureKb();
      const fd = new FormData();
      fd.append("file", file);

      const result = await apiClient.postForm<UploadedDoc>(
        `/api/knowledge/agents/${agentId}/kb/${currentKbId}/documents`,
        fd,
      );

      setDocs((prev) =>
        prev.map((d) =>
          d.id === tempId
            ? {
                id: result.id,
                filename: result.filename,
                status: result.status,
                file_size: result.file_size,
                content_type: result.content_type,
              }
            : d,
        ),
      );
      // Start polling for indexing progress
      pollDoc(currentKbId, result.id);
    } catch (err: any) {
      setDocs((prev) =>
        prev.map((d) =>
          d.id === tempId
            ? {
                ...d,
                uploading: false,
                status: "error",
                uploadError: err.message ?? "Upload failed",
              }
            : d,
        ),
      );
    }
  };

  // ── Handle file input / drag-drop ────────────────────────────────────────────
  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    Array.from(files).forEach(uploadFile);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  // ── Submit plain text ────────────────────────────────────────────────────────
  const handleSubmitText = async () => {
    if (!rawText.trim()) return;
    setSubmittingText(true);
    const tempId = crypto.randomUUID();
    const name = textName.trim() || "custom_text.txt";
    setDocs((prev) => [
      ...prev,
      { id: tempId, filename: name, status: "pending", uploading: true },
    ]);
    try {
      const currentKbId = await ensureKb();
      // Send as a plain-text file blob so it goes through the same upload route
      const blob = new Blob([rawText], { type: "text/plain" });
      const fd = new FormData();
      fd.append("file", blob, name);

      const result = await apiClient.postForm<UploadedDoc>(
        `/api/agents/${agentId}/kb/${currentKbId}/documents`,
        fd,
      );
      setDocs((prev) =>
        prev.map((d) =>
          d.id === tempId
            ? {
                id: result.id,
                filename: result.filename,
                status: result.status,
                file_size: result.file_size,
                content_type: result.content_type,
              }
            : d,
        ),
      );
      pollDoc(currentKbId, result.id);
      setRawText("");
      setTextName("custom_text.txt");
      setTextMode(false);
    } catch (err: any) {
      setDocs((prev) =>
        prev.map((d) =>
          d.id === tempId
            ? {
                ...d,
                uploading: false,
                status: "error",
                uploadError: err.message ?? "Failed",
              }
            : d,
        ),
      );
    } finally {
      setSubmittingText(false);
    }
  };

  // ── Remove a doc row ─────────────────────────────────────────────────────────
  const removeDoc = async (doc: UploadedDoc) => {
    if (pollRefs.current[doc.id]) {
      clearInterval(pollRefs.current[doc.id]);
      delete pollRefs.current[doc.id];
    }
    setDocs((prev) => prev.filter((d) => d.id !== doc.id));
    if (kbId && !doc.uploading) {
      try {
        await apiClient.delete(
          `/api/knowledge/agents/${agentId}/kb/${kbId}/documents/${doc.id}`,
        );
      } catch {
        /* best-effort */
      }
    }
  };

  const allReady =
    docs.length > 0 &&
    docs.every((d) => d.status === "ready" || d.status === "error");
  const anyBusy = docs.some(
    (d) => d.status === "pending" || d.status === "processing" || d.uploading,
  );

  return (
    <div className="space-y-6 m-3!">
      <Card
        title="Knowledge Base"
        icon={<BookOpen size={16} className="text-[#2442a8]" />}
      >
        {/* Info banner */}
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6 flex gap-3 text-blue-800 my-2!">
          <Info size={18} className="shrink-0 mt-0.5 text-blue-500" />
          <div className="text-sm">
            <p className="font-medium mb-1">
              Optional — add documents your agent can reference
            </p>
            <p className="opacity-75">
              Upload PDFs, text files, Word docs, or paste raw text. The agent
              will search these during conversations and cite source filenames.
              You can skip this step and add documents later from the agent
              settings.
            </p>
          </div>
        </div>

        {/* Toggle: File upload vs Plain text */}
        <div className="flex gap-2! mb-6!">
          <button
            onClick={() => setTextMode(false)}
            className={`flex items-center gap-2! px-4! py-2! rounded-lg text-sm font-medium border transition-all ${!textMode ? "bg-[#2442a8] text-white border-[#2442a8]" : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"}`}
          >
            <Upload size={14} /> Upload Files
          </button>
          <button
            onClick={() => setTextMode(true)}
            className={`flex items-center gap-2 px-4! py-2! rounded-lg text-sm font-medium border transition-all ${textMode ? "bg-[#2442a8] text-white border-[#2442a8]" : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"}`}
          >
            <Type size={14} /> Paste Text
          </button>
        </div>

        {/* ── File Upload Area ── */}
        {!textMode && (
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center cursor-pointer transition-all mb-6 ${
              dragging
                ? "border-[#2442a8] bg-blue-50"
                : "border-gray-200 bg-gray-50 hover:border-gray-300 hover:bg-white"
            }`}
          >
            <div
              className={`w-14 h-14 rounded-full flex items-center justify-center mb-4 transition-colors ${dragging ? "bg-blue-100 text-[#2442a8]" : "bg-white border border-gray-200 text-gray-400"}`}
            >
              <Upload size={24} />
            </div>
            <p className="text-sm font-semibold text-gray-700 mb-1">
              {dragging ? "Drop files here" : "Drag & drop files here"}
            </p>
            <p className="text-xs text-gray-400">
              or click to browse · {ALLOWED_EXT_LABEL} · max {MAX_FILE_MB} MB
            </p>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              accept=".pdf,.txt,.md,.docx,application/pdf,text/plain,text/markdown,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              onChange={(e) => handleFiles(e.target.files)}
            />
          </div>
        )}

        {/* ── Plain Text Input ── */}
        {textMode && (
          <div className="space-y-4 mb-6">
            <Field label="Document Name">
              <input
                value={textName}
                onChange={(e) => setTextName(e.target.value)}
                placeholder="e.g. faq.txt"
                className={inp}
              />
            </Field>
            <Field label="Content">
              <textarea
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                rows={10}
                placeholder="Paste or type your content here…"
                className={`${inp} resize-y font-mono text-xs`}
              />
            </Field>
            <button
              onClick={handleSubmitText}
              disabled={!rawText.trim() || submittingText}
              className="flex items-center gap-2 bg-[#2442a8] text-white px-5 py-2.5 rounded-lg text-sm font-medium disabled:opacity-50 transition-all"
            >
              {submittingText ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Plus size={16} />
              )}
              {submittingText ? "Uploading…" : "Add to Knowledge Base"}
            </button>
          </div>
        )}

        {/* ── Document List ── */}
        {docs.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Documents ({docs.length})
            </p>
            <AnimatePresence>
              {docs.map((doc) => (
                <motion.div
                  key={doc.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-colors ${
                    doc.status === "error"
                      ? "bg-red-50 border-red-200"
                      : doc.status === "ready"
                        ? "bg-green-50 border-green-200"
                        : "bg-white border-gray-200"
                  }`}
                >
                  {/* File icon */}
                  <div className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center shrink-0">
                    <FileText size={16} className="text-gray-500" />
                  </div>

                  {/* Name + size */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {doc.filename}
                    </p>
                    {doc.file_size && (
                      <p className="text-xs text-gray-400">
                        {(doc.file_size / 1024).toFixed(1)} KB
                      </p>
                    )}
                    {doc.uploadError && (
                      <p className="text-xs text-red-500 mt-0.5">
                        {doc.uploadError}
                      </p>
                    )}
                  </div>

                  {/* Status badge */}
                  <DocStatusBadge doc={doc} />

                  {/* Remove button */}
                  <button
                    onClick={() => removeDoc(doc)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors shrink-0"
                  >
                    <X size={14} />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Indexing progress summary */}
            {anyBusy && (
              <div className="flex items-center gap-2 text-xs text-gray-500 pt-2 pl-1">
                <Loader2 size={13} className="animate-spin text-blue-500" />
                Indexing in progress — you can continue to the next step
              </div>
            )}
            {allReady && (
              <div className="flex items-center gap-2 text-xs text-green-600 pt-2 pl-1">
                <CheckCircle2 size={13} /> All documents indexed and ready
              </div>
            )}
          </div>
        )}

        {/* Empty state */}
        {docs.length === 0 && !textMode && (
          <p className="text-center text-xs text-gray-400 py-2">
            No documents yet — upload files or paste text above, or skip this
            step.
          </p>
        )}
      </Card>

      <div className="flex justify-between!">
        <button
          onClick={onBack}
          className="px-8! py-2.5! border mt-5! border-gray-300 rounded-lg font-medium text-sm"
        >
          ← Back
        </button>
        <Button
          onClick={onContinue}
          className="bg-[#2442a8] hover:bg-[#1d3588] text-white px-8 py-2.5 rounded-lg font-medium text-sm flex items-center gap-2"
        >
          {docs.length === 0 ? "Skip for now" : "Continue →"}
        </Button>
      </div>
    </div>
  );
}

// ── Doc Status Badge ──────────────────────────────────────────────────────────

function DocStatusBadge({ doc }: { doc: UploadedDoc }) {
  if (doc.uploading)
    return (
      <span className="flex items-center gap-1.5 text-xs font-medium text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
        <Loader2 size={11} className="animate-spin" /> Uploading
      </span>
    );
  if (doc.status === "pending")
    return (
      <span className="flex items-center gap-1.5 text-xs font-medium text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full">
        <Loader2 size={11} className="animate-spin" /> Queued
      </span>
    );
  if (doc.status === "processing")
    return (
      <span className="flex items-center gap-1.5 text-xs font-medium text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
        <Loader2 size={11} className="animate-spin" /> Indexing
      </span>
    );
  if (doc.status === "ready")
    return (
      <span className="flex items-center gap-1.5 text-xs font-medium text-green-700 bg-green-50 px-2.5 py-1 rounded-full">
        <CheckCircle2 size={11} /> Ready
      </span>
    );
  return (
    <span className="flex items-center gap-1.5 text-xs font-medium text-red-600 bg-red-50 px-2.5 py-1 rounded-full">
      <AlertCircle size={11} /> Error
    </span>
  );
}

// ── Shared UI Components ─────────────────────────────────────────────────────

function StepItem({ step, currentStep, icon, label, onClick }: any) {
  const isActive = currentStep === step;
  const isPast = currentStep > step;
  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-2 py-4 border-b-2 transition-all cursor-pointer ${
        isActive
          ? "border-[#2442a8]"
          : "border-transparent opacity-60 hover:opacity-100"
      }`}
    >
      <div
        className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
          isActive || isPast
            ? "bg-[#2442a8] text-white"
            : "bg-gray-200 text-gray-500"
        }`}
      >
        {isPast && !isActive ? <Check size={10} /> : step}
      </div>
      <div
        className={`flex items-center gap-1.5 font-semibold text-sm ${
          isActive || isPast ? "text-[#2442a8]" : "text-gray-400"
        }`}
      >
        {icon} {label}
      </div>
    </div>
  );
}

function Card({ title, icon, children, className }: any) {
  return (
    <div
      className={`bg-white border border-gray-200 rounded-3xl p-5! shadow-sm ${className}`}
    >
      <div className="flex items-center gap-2 mb-6 text-[#2442a8]">
        {icon} <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function Button({ name, className, children, onClick }: any) {
  return (
    <button
      className={` bg-[#2442a8] text-white px-8! py-2.5! mt-5! rounded-lg font-medium shadow-sm ${className}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function Field({ label, children }: any) {
  return (
    <div className="w-full">
      <label className="block text-[13px] font-medium text-gray-600 mb-1.5">
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
      className={`relative flex flex-col items-center gap-3 p-4 rounded-xl border transition-all ${
        selected
          ? "border-[#2442a8] bg-blue-50/30 ring-1 ring-[#2442a8]"
          : "border-gray-200 bg-white hover:border-gray-300"
      }`}
    >
      <div className="rounded-full ring-1 ring-gray-200 bg-gray-100 overflow-hidden w-20 h-20">
        <img
          src={previewUrl || "https://ui-avatars.com/api/?name=A"}
          alt={avatar.name}
          className="w-full h-full object-cover"
        />
      </div>
      <p
        className={`text-sm font-medium ${selected ? "text-[#2442a8]" : "text-gray-800"}`}
      >
        {avatar.name}
      </p>
    </button>
  );
}

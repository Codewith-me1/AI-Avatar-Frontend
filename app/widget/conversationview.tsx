// "use client";

// import { useEffect, useRef, useState, useCallback } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import { Mic, MicOff, PhoneOff, RefreshCw } from "lucide-react";
// import { LiveAvatarRoom } from "@/components/avatar/Liveavatarroom";
// import { useLiveKitRoom } from "@/hooks/Uselivekitroom";
// import { DEFAULT_AVATAR, AVATAR_OPTIONS } from "@/components/avatar/Avatars";
// import type { Agent } from "@/types";

// interface ConversationViewProps {
//   agent: Agent & { avatar_id?: string };
//   roomName?: string;
//   userIdentity?: string;
// }

// export function ConversationView({
//   agent,
//   roomName,
//   userIdentity,
// }: ConversationViewProps) {
//   const {
//     videoRef,
//     state,
//     connect,
//     disconnect,
//     isMicEnabled,
//     toggleMic,
//     error,
//     hasVideo,
//     isAgentSpeaking,
//   } = useLiveKitRoom();

//   const initialAvatar =
//     AVATAR_OPTIONS.find((a) => a.id === agent.avatar_id) ?? DEFAULT_AVATAR;
//   const [selectedAvatar] = useState(initialAvatar);
//   const connectionAttempted = useRef(false);

//   // ── Auto-Connect on Page Load ──────────────────────────────────────────────
//   useEffect(() => {
//     if (!connectionAttempted.current) {
//       connectionAttempted.current = true;
//       connect(agent.id, roomName, userIdentity).catch((err) =>
//         console.error("Automated session token acquisition failed:", err),
//       );
//     }

//     // Auto-disconnect if parent window kills or unmounts the iframe
//     return () => {
//       disconnect();
//     };
//   }, [agent.id, roomName, userIdentity, connect, disconnect]);

//   const isConnecting = ["connecting", "connected", "agent_joining"].includes(
//     state,
//   );
//   const isSessionActive = state === "avatar_ready";

//   const waveformPatterns = [
//     ["20%", "60%", "30%", "80%", "20%"],
//     ["20%", "80%", "40%", "100%", "20%"],
//     ["20%", "50%", "90%", "40%", "20%"],
//     ["20%", "100%", "50%", "80%", "20%"],
//     ["20%", "70%", "30%", "60%", "20%"],
//   ];
//   useEffect(() => {
//     if (!isSessionActive) return;
//     let raf: number;
//     let ctx: AudioContext;

//     navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
//       ctx = new AudioContext();
//       const analyser = ctx.createAnalyser();
//       analyser.fftSize = 32; // 16 bins, use first 8
//       analyser.smoothingTimeConstant = 0.6;
//       ctx.createMediaStreamSource(stream).connect(analyser);
//       const data = new Uint8Array(analyser.frequencyBinCount);

//       const send = () => {
//         analyser.getByteFrequencyData(data);
//         window.parent?.postMessage(
//           {
//             type: "VOICE_AGENT_AUDIO_DATA",
//             bins: Array.from(data.slice(1, 9)), // bins 1-8 = voice range
//             speaking: isAgentSpeaking,
//           },
//           "*",
//         );
//         raf = requestAnimationFrame(send);
//       };
//       send();
//     });

//     return () => {
//       cancelAnimationFrame(raf);
//       ctx?.close();
//     };
//   }, [isSessionActive, isAgentSpeaking]);

//   return (
//     <div className="relative w-full h-full bg-[#11141a] text-white overflow-hidden select-none">
//       {/* ── Immersive Full-Screen Visual Core ─────────────────────────────── */}
//       <div className="absolute inset-0 w-full h-full z-0">
//         {hasVideo ? (
//           <LiveAvatarRoom
//             videoRef={videoRef}
//             state={state}
//             avatar={selectedAvatar}
//             agentName={agent.name}
//             error={error}
//           />
//         ) : (
//           <div className="w-full h-full flex flex-col items-center justify-center relative overflow-hidden bg-gradient-to-b from-slate-900 to-slate-950">
//             {/* Pulsing ambient aura behind the speech waveform bars */}
//             <motion.div
//               animate={{
//                 scale: isAgentSpeaking ? [1, 1.15, 1] : 1,
//                 opacity: isAgentSpeaking ? 0.25 : 0.05,
//               }}
//               transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
//               className="absolute w-72 h-72 bg-indigo-500/30 blur-3xl rounded-full pointer-events-none"
//             />

//             <div className="flex items-center gap-2 h-20 z-10">
//               {[0, 1, 2, 3, 4].map((i) => (
//                 <motion.div
//                   key={i}
//                   animate={{
//                     height: isAgentSpeaking ? waveformPatterns[i] : "12%",
//                   }}
//                   transition={{
//                     duration: 0.5 + i * 0.08,
//                     repeat: Infinity,
//                     ease: "easeInOut",
//                   }}
//                   className={`w-3 rounded-full transition-colors duration-300 ${
//                     isAgentSpeaking
//                       ? "bg-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.5)]"
//                       : "bg-white/20"
//                   }`}
//                 />
//               ))}
//             </div>
//           </div>
//         )}
//       </div>

//       {/* ── Status HUD Layer ────────────────────────────────────────────────── */}
//       <div className="absolute top-4 left-0 right-0 mx-auto text-center z-20 pointer-events-none">
//         <AnimatePresence mode="wait">
//           {isConnecting && (
//             <motion.div
//               initial={{ opacity: 0, y: -10 }}
//               animate={{ opacity: 1, y: 0 }}
//               exit={{ opacity: 0 }}
//               className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-xs text-white/80"
//             >
//               <RefreshCw size={12} className="animate-spin text-cyan-400" />
//               <span>
//                 {state === "agent_joining"
//                   ? "Agent entering..."
//                   : "Establishing WebRTC pipeline..."}
//               </span>
//             </motion.div>
//           )}
//         </AnimatePresence>
//       </div>

//       {/* ── Floating Overlay Controls (Aggregated Action Bar) ────────────────── */}
//       <div className="absolute bottom-6 left-0 right-0 z-30 flex flex-col items-center gap-3 pointer-events-none">
//         {/* Disconnected / Error States Call-To-Action Overlay */}
//         {["idle", "disconnected", "error"].includes(state) && (
//           <motion.button
//             initial={{ opacity: 0, scale: 0.9 }}
//             animate={{ opacity: 1, scale: 1 }}
//             className="pointer-events-auto px-5 py-2.5 rounded-full bg-cyan-500 hover:bg-cyan-600 font-medium text-xs shadow-xl tracking-wide flex items-center gap-2 transition-colors"
//             onClick={() => connect(agent.id, roomName, userIdentity)}
//           >
//             <RefreshCw size={14} />
//             <span>Reconnect Session</span>
//           </motion.button>
//         )}

//         {/* Live Audio Session HUD controls */}
//         {isSessionActive && (
//           <motion.div
//             initial={{ opacity: 0, y: 15 }}
//             animate={{ opacity: 1, y: 0 }}
//             className="pointer-events-auto flex items-center gap-4 px-4 py-3 rounded-full bg-black/50 backdrop-blur-lg border border-white/10 shadow-2xl"
//           >
//             {/* Mic Action button */}
//             <button
//               onClick={toggleMic}
//               className={`w-11 h-11 rounded-full flex items-center justify-center border transition-all ${
//                 isMicEnabled
//                   ? "bg-white/10 border-white/20 text-white hover:bg-white/20"
//                   : "bg-red-500/20 border-red-500/40 text-red-400 hover:bg-red-500/30"
//               }`}
//               title={isMicEnabled ? "Mute Microphone" : "Unmute Microphone"}
//             >
//               {isMicEnabled ? <Mic size={16} /> : <MicOff size={16} />}
//             </button>

//             <div className="w-px h-6 bg-white/10" />

//             {/* Direct Hangup Trigger */}
//             <button
//               onClick={disconnect}
//               className="w-11 h-11 rounded-full flex items-center justify-center bg-red-600 hover:bg-red-700 text-white transition-colors border border-red-500/20 shadow-lg"
//               title="End Conversation"
//             >
//               <PhoneOff size={16} />
//             </button>
//           </motion.div>
//         )}
//       </div>
//     </div>
//   );
// }

// Working on a new version of the ConversationView component that is more streamlined and focused on the core functionality of connecting to a voice session, handling mic toggling, and displaying the avatar. The new version will remove some of the more complex state management and focus on providing a clear and responsive user interface for the voice sandbox test.
// "use client";

// import { useEffect, useRef, useState } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import { Mic, MicOff, PhoneOff, RefreshCw } from "lucide-react";
// import { LiveAvatarRoom } from "@/components/avatar/Liveavatarroom";
// import { useLiveKitRoom } from "@/hooks/Uselivekitroom";
// import { DEFAULT_AVATAR, AVATAR_OPTIONS } from "@/components/avatar/Avatars";
// import type { Agent } from "@/types";

// interface ConversationViewProps {
//   agent: Agent & { avatar_id?: string };
//   roomName?: string;
//   userIdentity?: string;
// }

// export function ConversationView({
//   agent,
//   roomName,
//   userIdentity,
// }: ConversationViewProps) {
//   const {
//     videoRef,
//     state,
//     connect,
//     disconnect,
//     isMicEnabled,
//     toggleMic,
//     error,
//     hasVideo,
//     isAgentSpeaking,
//   } = useLiveKitRoom();

//   const initialAvatar =
//     AVATAR_OPTIONS.find((a) => a.id === agent.avatar_id) ?? DEFAULT_AVATAR;
//   const [selectedAvatar] = useState(initialAvatar);
//   const connectionAttempted = useRef(false);

//   // ── Connection Logic ──────────────────────────────────────────────
//   useEffect(() => {
//     // Only connect once, but ensure it handles WebRTC cleanly
//     if (!connectionAttempted.current) {
//       connectionAttempted.current = true;
//       connect(agent.id, roomName, userIdentity).catch((err) =>
//         console.error("Automated session token acquisition failed:", err),
//       );
//     }

//     return () => {
//       disconnect();
//     };
//   }, [agent.id, roomName, userIdentity, connect, disconnect]);

//   const isConnecting = ["connecting", "connected", "agent_joining"].includes(
//     state,
//   );
//   const isSessionActive = state === "avatar_ready";

//   // Inside ConversationView, after the existing hooks/state:

//   // ── Bridge: parent widget (widget.js) → iframe controls ──────────────
//   useEffect(() => {
//     function handleParentMessage(event: MessageEvent) {
//       const data = event.data;
//       if (!data || !data.type) return;

//       switch (data.type) {
//         case "VOICE_AGENT_MIC_TOGGLE": {
//           // Only toggle if the requested state differs from current
//           if (data.enabled !== isMicEnabled) {
//             toggleMic();
//           }
//           break;
//         }
//         case "VOICE_AGENT_SPEAKER_TOGGLE": {
//           document.querySelectorAll("audio").forEach((el) => {
//             (el as HTMLAudioElement).muted = !data.enabled;
//           });
//           break;
//         }
//         case "VOICE_AGENT_DISCONNECT": {
//           disconnect();
//           break;
//         }
//       }
//     }

//     window.addEventListener("message", handleParentMessage);
//     return () => window.removeEventListener("message", handleParentMessage);
//   }, [isMicEnabled, toggleMic, disconnect]);

//   // ── Report mic state back so the parent's icon stays in sync ──────────
//   useEffect(() => {
//     if (!isSessionActive) return;
//     window.parent.postMessage(
//       { type: "VOICE_AGENT_MIC_STATE", enabled: isMicEnabled },
//       "*",
//     );
//   }, [isMicEnabled, isSessionActive]);

//   // ── Tell the parent when the avatar is actually ready ─────────────────
//   useEffect(() => {
//     if (isSessionActive) {
//       window.parent.postMessage({ type: "VOICE_AGENT_READY" }, "*");
//     }
//   }, [isSessionActive]);

//   const waveformPatterns = [
//     ["20%", "60%", "30%", "80%", "20%"],
//     ["20%", "80%", "40%", "100%", "20%"],
//     ["20%", "50%", "90%", "40%", "20%"],
//     ["20%", "100%", "50%", "80%", "20%"],
//     ["20%", "70%", "30%", "60%", "20%"],
//   ];

//   return (
//     <div className="relative w-full h-full bg-[#11141a] text-white overflow-hidden select-none">
//       {/* ── Immersive Full-Screen Visual Core ─────────────────────────────── */}
//       <div className="absolute inset-0 w-full h-full z-0">
//         {/* Force a click-to-play overlay if the browser blocks autoplay */}
//         {hasVideo && state === "avatar_ready" && (
//           <LiveAvatarRoom
//             videoRef={videoRef}
//             state={state}
//             avatar={selectedAvatar}
//             agentName={agent.name}
//             error={error}
//           />
//         )}

//         {/* Render fallback ONLY if video is truly not present or still connecting */}
//         {(!hasVideo || state !== "avatar_ready") && (
//           <div className="w-full h-full flex flex-col items-center justify-center relative overflow-hidden bg-gradient-to-b from-slate-900 to-slate-950">
//             <motion.div
//               animate={{
//                 scale: isAgentSpeaking ? [1, 1.15, 1] : 1,
//                 opacity: isAgentSpeaking ? 0.25 : 0.05,
//               }}
//               transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
//               className="absolute w-72 h-72 bg-indigo-500/30 blur-3xl rounded-full pointer-events-none"
//             />

//             <div className="flex items-center gap-2 h-20 z-10">
//               {[0, 1, 2, 3, 4].map((i) => (
//                 <motion.div
//                   key={i}
//                   animate={{
//                     height: isAgentSpeaking ? waveformPatterns[i] : "12%",
//                   }}
//                   transition={{
//                     duration: 0.5 + i * 0.08,
//                     repeat: Infinity,
//                     ease: "easeInOut",
//                   }}
//                   className={`w-3 rounded-full transition-colors duration-300 ${
//                     isAgentSpeaking
//                       ? "bg-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.5)]"
//                       : "bg-white/20"
//                   }`}
//                 />
//               ))}
//             </div>
//           </div>
//         )}
//       </div>

//       {/* ── Status HUD Layer ────────────────────────────────────────────────── */}
//       <div className="absolute top-4 left-0 right-0 mx-auto text-center z-20 pointer-events-none">
//         <AnimatePresence mode="wait">
//           {isConnecting && (
//             <motion.div
//               initial={{ opacity: 0, y: -10 }}
//               animate={{ opacity: 1, y: 0 }}
//               exit={{ opacity: 0 }}
//               className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-xs text-white/80"
//             >
//               <RefreshCw size={12} className="animate-spin text-cyan-400" />
//               <span>
//                 {state === "agent_joining"
//                   ? "Avatar entering room..."
//                   : "Establishing WebRTC pipeline..."}
//               </span>
//             </motion.div>
//           )}
//         </AnimatePresence>
//       </div>

//       {/* ── Floating Overlay Controls ────────────────────────────────────────── */}
//       <div className="absolute bottom-6 left-0 right-0 z-30 flex flex-col items-center gap-3 pointer-events-none">
//         {/* Autoplay / Blocked State Override */}
//         {hasVideo && state === "avatar_ready" && !isSessionActive && (
//           <motion.button
//             className="pointer-events-auto px-6 py-3 rounded-full bg-cyan-500 hover:bg-cyan-600 font-medium text-sm shadow-xl flex items-center gap-2"
//             onClick={() => {
//               // A physical click forces the browser to allow the video tag to play
//               videoRef.current?.play();
//             }}
//           >
//             Click to Start Video
//           </motion.button>
//         )}

//         {/* Disconnected / Error States */}
//         {["idle", "disconnected", "error"].includes(state) && (
//           <motion.button
//             initial={{ opacity: 0, scale: 0.9 }}
//             animate={{ opacity: 1, scale: 1 }}
//             className="pointer-events-auto px-5 py-2.5 rounded-full bg-cyan-500 hover:bg-cyan-600 font-medium text-xs shadow-xl tracking-wide flex items-center gap-2 transition-colors"
//             onClick={() => connect(agent.id, roomName, userIdentity)}
//           >
//             <RefreshCw size={14} />
//             <span>Reconnect Session</span>
//           </motion.button>
//         )}

//         {/* Live Audio Session HUD controls */}
//         {isSessionActive && (
//           <motion.div
//             initial={{ opacity: 0, y: 15 }}
//             animate={{ opacity: 1, y: 0 }}
//             className="pointer-events-auto flex items-center gap-4 px-4 py-3 rounded-full bg-black/50 backdrop-blur-lg border border-white/10 shadow-2xl"
//           >
//             <button
//               onClick={toggleMic}
//               className={`w-11 h-11 rounded-full flex items-center justify-center border transition-all ${
//                 isMicEnabled
//                   ? "bg-white/10 border-white/20 text-white hover:bg-white/20"
//                   : "bg-red-500/20 border-red-500/40 text-red-400 hover:bg-red-500/30"
//               }`}
//             >
//               {isMicEnabled ? <Mic size={16} /> : <MicOff size={16} />}
//             </button>

//             <div className="w-px h-6 bg-white/10" />

//             <button
//               onClick={disconnect}
//               className="w-11 h-11 rounded-full flex items-center justify-center bg-red-600 hover:bg-red-700 text-white transition-colors border border-red-500/20 shadow-lg"
//             >
//               <PhoneOff size={16} />
//             </button>
//           </motion.div>
//         )}
//       </div>
//     </div>
//   );
// }

// "use client";

// import { useEffect, useRef, useState, useCallback } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import { Mic, MicOff, PhoneOff, RefreshCw, MessageSquare } from "lucide-react";
// import { LiveAvatarRoom } from "@/components/avatar/Liveavatarroom";
// import { useLiveKitRoom } from "@/hooks/Uselivekitroom";
// import { DEFAULT_AVATAR, AVATAR_OPTIONS } from "@/components/avatar/Avatars";
// import { ChatPanel, type ChatMessage } from "@/components/avatar/ChatPanel";
// import type { Agent } from "@/types";

// interface ConversationViewProps {
//   agent: Agent & { avatar_id?: string };
//   roomName?: string;
//   userIdentity?: string;
// }

// export function ConversationView({
//   agent,
//   roomName,
//   userIdentity,
// }: ConversationViewProps) {
//   const liveKitRoom = useLiveKitRoom();
//   const {
//     videoRef,
//     state,
//     connect,
//     disconnect,
//     isMicEnabled,
//     toggleMic,
//     error,
//     hasVideo,
//     isAgentSpeaking,
//   } = liveKitRoom;
//   const room = (liveKitRoom as any).room;

//   const initialAvatar =
//     AVATAR_OPTIONS.find((a) => a.id === agent.avatar_id) ?? DEFAULT_AVATAR;
//   const [selectedAvatar] = useState(initialAvatar);
//   const connectionAttempted = useRef(false);

//   // ── Chat state ─────────────────────────────────────────────────────
//   const [chatOpen, setChatOpen] = useState(false);
//   const [messages, setMessages] = useState<ChatMessage[]>([]);

//   // Upsert a transcript segment (streams update the same segment id as the
//   // text firms up, then mark it final).
//   const upsertMessage = useCallback(
//     (id: string, from: "user" | "agent", text: string, final: boolean) => {
//       setMessages((prev) => {
//         const i = prev.findIndex((m) => m.id === id);
//         if (i === -1) return [...prev, { id, from, text, final }];
//         const next = [...prev];
//         next[i] = { ...next[i], text, final };
//         return next;
//       });
//     },
//     [],
//   );

//   // ── Connection Logic ──────────────────────────────────────────────
//   useEffect(() => {
//     if (!connectionAttempted.current) {
//       connectionAttempted.current = true;
//       connect(agent.id, roomName, userIdentity).catch((err) =>
//         console.error("Automated session token acquisition failed:", err),
//       );
//     }
//     return () => {
//       disconnect();
//     };
//   }, [agent.id, roomName, userIdentity, connect, disconnect]);

//   // ── Transcription listener: agent + user speech → chat messages ────
//   // The agent session publishes text streams on topic "lk.transcription":
//   //  - the agent's own replies
//   //  - the user's speech-to-text
//   // Segments stream in with attributes: lk.segment_id (stable id) and
//   // lk.transcribed_track_id (present when it's the USER's transcribed audio).
//   useEffect(() => {
//     if (!room) return;
//     const handler = async (reader: any, participantInfo: any) => {
//       try {
//         const attrs: Record<string, string> = reader.info?.attributes ?? {};
//         const segId =
//           attrs["lk.segment_id"] || `${Date.now()}-${Math.random()}`;
//         const transcribedTrack = attrs["lk.transcribed_track_id"];
//         // If the stream references a transcribed track, check whether that
//         // track belongs to US (the local participant) → it's the user's words.
//         let isUser = false;
//         if (transcribedTrack && room.localParticipant) {
//           const pubs = Array.from(
//             room.localParticipant.trackPublications?.values?.() ?? [],
//           ) as any[];
//           isUser = pubs.some((p) => p?.trackSid === transcribedTrack);
//         }
//         const final = attrs["lk.transcription_final"] === "true";
//         const text = await reader.readAll();
//         if (text && text.trim()) {
//           upsertMessage(segId, isUser ? "user" : "agent", text, final);
//         }
//       } catch (e) {
//         console.warn("[chat] transcription stream error", e);
//       }
//     };
//     try {
//       room.registerTextStreamHandler("lk.transcription", handler);
//     } catch (e) {
//       // Handler may already be registered on reconnects — safe to ignore
//       console.warn("[chat] register handler:", e);
//     }
//     return () => {
//       try {
//         room.unregisterTextStreamHandler?.("lk.transcription");
//       } catch {}
//     };
//   }, [room, upsertMessage]);

//   // ── Send a typed message: appears in chat + the avatar answers it ──
//   const sendChat = useCallback(
//     async (text: string) => {
//       // Show the user's typed message immediately (typed input isn't echoed
//       // back through the transcription topic).
//       upsertMessage(`local-${Date.now()}`, "user", text, true);
//       try {
//         // Topic "lk.chat" = agent text input → LLM → TTS → avatar speaks.
//         await room?.localParticipant?.sendText(text, { topic: "lk.chat" });
//       } catch (e) {
//         console.error("[chat] send failed", e);
//       }
//     },
//     [room, upsertMessage],
//   );

//   const isConnecting = ["connecting", "connected", "agent_joining"].includes(
//     state,
//   );
//   const isSessionActive = state === "avatar_ready";

//   // ── Bridge: parent widget (widget.js) → iframe controls ──────────────
//   useEffect(() => {
//     function handleParentMessage(event: MessageEvent) {
//       const data = event.data;
//       if (!data || !data.type) return;

//       switch (data.type) {
//         case "VOICE_AGENT_MIC_TOGGLE": {
//           if (data.enabled !== isMicEnabled) {
//             toggleMic();
//           }
//           break;
//         }
//         case "VOICE_AGENT_SPEAKER_TOGGLE": {
//           document.querySelectorAll("audio").forEach((el) => {
//             (el as HTMLAudioElement).muted = !data.enabled;
//           });
//           break;
//         }
//         case "VOICE_AGENT_CAPTIONS_TOGGLE": {
//           // The widget's chat bubble button toggles the chat panel
//           setChatOpen((v) => !v);
//           break;
//         }
//         case "VOICE_AGENT_DISCONNECT": {
//           disconnect();
//           break;
//         }
//       }
//     }

//     window.addEventListener("message", handleParentMessage);
//     return () => window.removeEventListener("message", handleParentMessage);
//   }, [isMicEnabled, toggleMic, disconnect]);

//   // ── Report chat open/closed so the parent can widen the card ─────────
//   useEffect(() => {
//     window.parent.postMessage(
//       { type: "VOICE_AGENT_CHAT_STATE", open: chatOpen },
//       "*",
//     );
//   }, [chatOpen]);

//   // ── Report mic state back so the parent's icon stays in sync ──────────
//   useEffect(() => {
//     if (!isSessionActive) return;
//     window.parent.postMessage(
//       { type: "VOICE_AGENT_MIC_STATE", enabled: isMicEnabled },
//       "*",
//     );
//   }, [isMicEnabled, isSessionActive]);

//   // ── Tell the parent when the avatar is actually ready ─────────────────
//   useEffect(() => {
//     if (isSessionActive) {
//       window.parent.postMessage({ type: "VOICE_AGENT_READY" }, "*");
//     }
//   }, [isSessionActive]);

//   const waveformPatterns = [
//     ["20%", "60%", "30%", "80%", "20%"],
//     ["20%", "80%", "40%", "100%", "20%"],
//     ["20%", "50%", "90%", "40%", "20%"],
//     ["20%", "100%", "50%", "80%", "20%"],
//     ["20%", "70%", "30%", "60%", "20%"],
//   ];

//   return (
//     <div className="relative w-full h-full bg-[#11141a] text-white overflow-hidden select-none">
//       {/* ── Immersive Full-Screen Visual Core ─────────────────────────────── */}
//       <div
//         className="absolute inset-y-0 left-0 z-0 transition-all duration-300"
//         style={{ right: chatOpen ? 270 : 0 }}
//       >
//         {hasVideo && state === "avatar_ready" && (
//           <LiveAvatarRoom
//             videoRef={videoRef}
//             state={state}
//             avatar={selectedAvatar}
//             agentName={agent.name}
//             error={error}
//           />
//         )}

//         {(!hasVideo || state !== "avatar_ready") && (
//           <div className="w-full h-full flex flex-col items-center justify-center relative overflow-hidden bg-gradient-to-b from-slate-900 to-slate-950">
//             <motion.div
//               animate={{
//                 scale: isAgentSpeaking ? [1, 1.15, 1] : 1,
//                 opacity: isAgentSpeaking ? 0.25 : 0.05,
//               }}
//               transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
//               className="absolute w-72 h-72 bg-indigo-500/30 blur-3xl rounded-full pointer-events-none"
//             />
//             <div className="flex items-center gap-2 h-20 z-10">
//               {[0, 1, 2, 3, 4].map((i) => (
//                 <motion.div
//                   key={i}
//                   animate={{
//                     height: isAgentSpeaking ? waveformPatterns[i] : "12%",
//                   }}
//                   transition={{
//                     duration: 0.5 + i * 0.08,
//                     repeat: Infinity,
//                     ease: "easeInOut",
//                   }}
//                   className={`w-3 rounded-full transition-colors duration-300 ${
//                     isAgentSpeaking
//                       ? "bg-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.5)]"
//                       : "bg-white/20"
//                   }`}
//                 />
//               ))}
//             </div>
//           </div>
//         )}
//       </div>

//       {/* ── Chat side panel ─────────────────────────────────────────────────── */}
//       <AnimatePresence>
//         {chatOpen && (
//           <ChatPanel
//             messages={messages}
//             onSend={sendChat}
//             onClose={() => setChatOpen(false)}
//           />
//         )}
//       </AnimatePresence>

//       {/* ── Status HUD Layer ────────────────────────────────────────────────── */}
//       <div className="absolute top-4 left-0 right-0 mx-auto text-center z-20 pointer-events-none">
//         <AnimatePresence mode="wait">
//           {isConnecting && (
//             <motion.div
//               initial={{ opacity: 0, y: -10 }}
//               animate={{ opacity: 1, y: 0 }}
//               exit={{ opacity: 0 }}
//               className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-xs text-white/80"
//             >
//               <RefreshCw size={12} className="animate-spin text-cyan-400" />
//               <span>
//                 {state === "agent_joining"
//                   ? "Avatar entering room..."
//                   : "Establishing WebRTC pipeline..."}
//               </span>
//             </motion.div>
//           )}
//         </AnimatePresence>
//       </div>

//       {/* ── Floating Overlay Controls ────────────────────────────────────────── */}
//       <div
//         className="absolute bottom-6 left-0 z-30 flex flex-col items-center gap-3 pointer-events-none transition-all duration-300"
//         style={{ right: chatOpen ? 270 : 0 }}
//       >
//         {hasVideo && state === "avatar_ready" && !isSessionActive && (
//           <motion.button
//             className="pointer-events-auto px-6 py-3 rounded-full bg-cyan-500 hover:bg-cyan-600 font-medium text-sm shadow-xl flex items-center gap-2"
//             onClick={() => {
//               videoRef.current?.play();
//             }}
//           >
//             Click to Start Video
//           </motion.button>
//         )}

//         {["idle", "disconnected", "error"].includes(state) && (
//           <motion.button
//             initial={{ opacity: 0, scale: 0.9 }}
//             animate={{ opacity: 1, scale: 1 }}
//             className="pointer-events-auto px-5 py-2.5 rounded-full bg-cyan-500 hover:bg-cyan-600 font-medium text-xs shadow-xl tracking-wide flex items-center gap-2 transition-colors"
//             onClick={() => connect(agent.id, roomName, userIdentity)}
//           >
//             <RefreshCw size={14} />
//             <span>Reconnect Session</span>
//           </motion.button>
//         )}

//         {isSessionActive && (
//           <motion.div
//             initial={{ opacity: 0, y: 15 }}
//             animate={{ opacity: 1, y: 0 }}
//             className="pointer-events-auto flex items-center gap-4 px-4 py-3 rounded-full bg-black/50 backdrop-blur-lg border border-white/10 shadow-2xl"
//           >
//             <button
//               onClick={toggleMic}
//               className={`w-11 h-11 rounded-full flex items-center justify-center border transition-all ${
//                 isMicEnabled
//                   ? "bg-white/10 border-white/20 text-white hover:bg-white/20"
//                   : "bg-red-500/20 border-red-500/40 text-red-400 hover:bg-red-500/30"
//               }`}
//             >
//               {isMicEnabled ? <Mic size={16} /> : <MicOff size={16} />}
//             </button>

//             <button
//               onClick={() => setChatOpen((v) => !v)}
//               className={`w-11 h-11 rounded-full flex items-center justify-center border transition-all ${
//                 chatOpen
//                   ? "bg-indigo-500/30 border-indigo-400/50 text-indigo-200"
//                   : "bg-white/10 border-white/20 text-white hover:bg-white/20"
//               }`}
//               title="Chat"
//             >
//               <MessageSquare size={16} />
//             </button>

//             <div className="w-px h-6 bg-white/10" />

//             <button
//               onClick={disconnect}
//               className="w-11 h-11 rounded-full flex items-center justify-center bg-red-600 hover:bg-red-700 text-white transition-colors border border-red-500/20 shadow-lg"
//             >
//               <PhoneOff size={16} />
//             </button>
//           </motion.div>
//         )}
//       </div>
//     </div>
//   );
// }
// "use client";

// import { useEffect, useRef, useState, useCallback } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import { Mic, MicOff, PhoneOff, RefreshCw, MessageSquare } from "lucide-react";
// import { LiveAvatarRoom } from "@/components/avatar/Liveavatarroom";
// import { useLiveKitRoom } from "@/hooks/Uselivekitroom";
// import { DEFAULT_AVATAR, AVATAR_OPTIONS } from "@/components/avatar/Avatars";
// import { ChatPanel, type ChatMessage } from "@/components/avatar/ChatPanel";
// import type { Agent } from "@/types";

// interface ConversationViewProps {
//   agent: Agent & { avatar_id?: string };
//   roomName?: string;
//   userIdentity?: string;
// }

// export function ConversationView({
//   agent,
//   roomName,
//   userIdentity,
// }: ConversationViewProps) {
//   const _lk: any = useLiveKitRoom();
//   const {
//     videoRef,
//     state,
//     connect,
//     disconnect,
//     isMicEnabled,
//     toggleMic,
//     error,
//     hasVideo,
//     isAgentSpeaking,
//   } = _lk;
//   // `room` if the hook exposes it (optional — window.__lkRoom is the fallback)
//   const room = _lk.room;

//   const initialAvatar =
//     AVATAR_OPTIONS.find((a) => a.id === agent.avatar_id) ?? DEFAULT_AVATAR;
//   const [selectedAvatar] = useState(initialAvatar);
//   const connectionAttempted = useRef(false);

//   // ── Chat state ─────────────────────────────────────────────────────
//   const [chatOpen, setChatOpen] = useState(false);

//   // ── Room access with fallback ────────────────────────────────────────
//   // The chat needs the LiveKit Room instance. Preferred: the hook returns
//   // `room`. FALLBACK: add ONE line in the hook right after the Room is
//   // created (inside connect):   (window as any).__lkRoom = room;
//   // We pick it up here, so chat works even without changing the hook's return.
//   const getRoom = useCallback((): any => {
//     return (
//       (room as any) ??
//       (typeof window !== "undefined" ? (window as any).__lkRoom : undefined)
//     );
//   }, [room]);
//   const [messages, setMessages] = useState<ChatMessage[]>([]);

//   // Upsert a transcript segment (streams update the same segment id as the
//   // text firms up, then mark it final).
//   const upsertMessage = useCallback(
//     (id: string, from: "user" | "agent", text: string, final: boolean) => {
//       setMessages((prev) => {
//         const i = prev.findIndex((m) => m.id === id);
//         if (i === -1) return [...prev, { id, from, text, final }];
//         const next = [...prev];
//         next[i] = { ...next[i], text, final };
//         return next;
//       });
//       // Relay to the PARENT widget, which renders the chat panel.
//       try {
//         window.parent.postMessage(
//           { type: "VOICE_AGENT_TRANSCRIPT", id, from, text, final },
//           "*",
//         );
//       } catch {}
//     },
//     [],
//   );

//   // ── Connection Logic ──────────────────────────────────────────────
//   useEffect(() => {
//     if (!connectionAttempted.current) {
//       connectionAttempted.current = true;
//       connect(agent.id, roomName, userIdentity).catch((err: any) =>
//         console.error("Automated session token acquisition failed:", err),
//       );
//     }
//     return () => {
//       disconnect();
//     };
//   }, [agent.id, roomName, userIdentity, connect, disconnect]);

//   // ── Transcription listener: agent + user speech → chat messages ────
//   // Transcripts arrive via ONE of two paths depending on livekit versions:
//   //  A) text streams on topic "lk.transcription" (newer)
//   //  B) RoomEvent.TranscriptionReceived segments (older)
//   // Listen to BOTH; whichever fires wins. Debug logs show which path is live.
//   useEffect(() => {
//     const lkRoom = getRoom();
//     if (!lkRoom) {
//       console.warn(
//         "[chat] room not available yet (state=" +
//           state +
//           ") — " +
//           "expose `room` from useLiveKitRoom OR set window.__lkRoom = room inside the hook's connect()",
//       );
//       return;
//     }
//     console.log(
//       "[chat] registering transcript listeners (state=" + state + ")",
//     );

//     // Path A: text streams
//     const streamHandler = async (reader: any, participantInfo: any) => {
//       try {
//         const attrs: Record<string, string> = reader.info?.attributes ?? {};
//         console.log("[chat] text stream received", { attrs, participantInfo });
//         const segId =
//           attrs["lk.segment_id"] || `${Date.now()}-${Math.random()}`;
//         const transcribedTrack = attrs["lk.transcribed_track_id"];
//         let isUser = false;
//         if (transcribedTrack && lkRoom.localParticipant) {
//           const pubs = Array.from(
//             lkRoom.localParticipant.trackPublications?.values?.() ?? [],
//           ) as any[];
//           isUser = pubs.some((p) => p?.trackSid === transcribedTrack);
//         }
//         const final = attrs["lk.transcription_final"] === "true";
//         const text = await reader.readAll();
//         if (text && text.trim()) {
//           upsertMessage(segId, isUser ? "user" : "agent", text, final);
//         }
//       } catch (e) {
//         console.warn("[chat] transcription stream error", e);
//       }
//     };
//     try {
//       lkRoom.registerTextStreamHandler("lk.transcription", streamHandler);
//     } catch (e) {
//       console.warn("[chat] text stream handler unavailable:", e);
//     }

//     // Path B: legacy transcription events
//     const onTranscription = (segments: any[], participant: any) => {
//       console.log("[chat] TranscriptionReceived", { segments, participant });
//       const localIdentity = lkRoom.localParticipant?.identity;
//       for (const seg of segments ?? []) {
//         const isUser = participant?.identity === localIdentity;
//         if (seg?.text && seg.text.trim()) {
//           upsertMessage(
//             seg.id || `${Date.now()}-${Math.random()}`,
//             isUser ? "user" : "agent",
//             seg.text,
//             !!seg.final,
//           );
//         }
//       }
//     };
//     try {
//       lkRoom.on("transcriptionReceived", onTranscription);
//     } catch (e) {
//       console.warn("[chat] legacy transcription event unavailable:", e);
//     }

//     return () => {
//       try {
//         lkRoom.unregisterTextStreamHandler?.("lk.transcription");
//       } catch {}
//       try {
//         lkRoom.off?.("transcriptionReceived", onTranscription);
//       } catch {}
//     };
//     // `state` in deps: re-attempts registration as the connection progresses,
//     // so a room created mid-connect (window.__lkRoom) is picked up.
//   }, [getRoom, upsertMessage, state]);

//   // ── Send a typed message: appears in chat + the avatar answers it ──
//   const sendChat = useCallback(
//     async (text: string) => {
//       upsertMessage(`local-${Date.now()}`, "user", text, true);
//       try {
//         await getRoom()?.localParticipant?.sendText(text, { topic: "lk.chat" });
//       } catch (e) {
//         console.error("[chat] send failed", e);
//       }
//     },
//     [getRoom, upsertMessage],
//   );

//   const isConnecting = ["connecting", "connected", "agent_joining"].includes(
//     state,
//   );
//   const isSessionActive = state === "avatar_ready";

//   // ── Bridge: parent widget (widget.js) → iframe controls ──────────────
//   useEffect(() => {
//     function handleParentMessage(event: MessageEvent) {
//       const data = event.data;
//       if (!data || !data.type) return;

//       switch (data.type) {
//         case "VOICE_AGENT_MIC_TOGGLE": {
//           if (data.enabled !== isMicEnabled) {
//             toggleMic();
//           }
//           break;
//         }
//         case "VOICE_AGENT_SPEAKER_TOGGLE": {
//           document.querySelectorAll("audio").forEach((el) => {
//             (el as HTMLAudioElement).muted = !data.enabled;
//           });
//           break;
//         }
//         case "VOICE_AGENT_CAPTIONS_TOGGLE": {
//           // The widget's chat bubble button toggles the chat panel
//           setChatOpen((v) => !v);
//           break;
//         }
//         case "VOICE_AGENT_SEND_TEXT": {
//           const t = (data.text || "").trim();
//           const lkRoom = getRoom();
//           console.log("[chat] SEND_TEXT received", {
//             text: t,
//             hasRoom: !!lkRoom,
//           });
//           if (t && lkRoom?.localParticipant?.sendText) {
//             lkRoom.localParticipant
//               .sendText(t, { topic: "lk.chat" })
//               .then(() => console.log("[chat] sendText OK"))
//               .catch((e: any) => console.error("[chat] sendText failed", e));
//           } else if (t) {
//             console.error(
//               "[chat] cannot send: " +
//                 (!lkRoom
//                   ? "room unavailable (set window.__lkRoom in the hook)"
//                   : "localParticipant.sendText missing — livekit-client too old, upgrade to >=2.13"),
//             );
//           }
//           break;
//         }
//         case "VOICE_AGENT_DISCONNECT": {
//           disconnect();
//           break;
//         }
//       }
//     }

//     window.addEventListener("message", handleParentMessage);
//     return () => window.removeEventListener("message", handleParentMessage);
//   }, [isMicEnabled, toggleMic, disconnect, getRoom]);

//   // ── Report chat open/closed so the parent can widen the card ─────────
//   useEffect(() => {
//     window.parent.postMessage(
//       { type: "VOICE_AGENT_CHAT_STATE", open: chatOpen },
//       "*",
//     );
//   }, [chatOpen]);

//   // ── Report mic state back so the parent's icon stays in sync ──────────
//   useEffect(() => {
//     if (!isSessionActive) return;
//     window.parent.postMessage(
//       { type: "VOICE_AGENT_MIC_STATE", enabled: isMicEnabled },
//       "*",
//     );
//   }, [isMicEnabled, isSessionActive]);

//   // ── Tell the parent when the avatar is actually ready ─────────────────
//   useEffect(() => {
//     if (isSessionActive) {
//       window.parent.postMessage({ type: "VOICE_AGENT_READY" }, "*");
//     }
//   }, [isSessionActive]);

//   const waveformPatterns = [
//     ["20%", "60%", "30%", "80%", "20%"],
//     ["20%", "80%", "40%", "100%", "20%"],
//     ["20%", "50%", "90%", "40%", "20%"],
//     ["20%", "100%", "50%", "80%", "20%"],
//     ["20%", "70%", "30%", "60%", "20%"],
//   ];

//   return (
//     <div className="relative w-full h-full bg-[#11141a] text-white overflow-hidden select-none">
//       {/* ── Immersive Full-Screen Visual Core ─────────────────────────────── */}
//       <div
//         className="absolute inset-y-0 left-0 z-0 transition-all duration-300"
//         style={{ right: chatOpen ? 270 : 0 }}
//       >
//         {hasVideo && state === "avatar_ready" && (
//           <LiveAvatarRoom
//             videoRef={videoRef}
//             state={state}
//             avatar={selectedAvatar}
//             agentName={agent.name}
//             error={error}
//           />
//         )}

//         {(!hasVideo || state !== "avatar_ready") && (
//           <div className="w-full h-full flex flex-col items-center justify-center relative overflow-hidden bg-gradient-to-b from-slate-900 to-slate-950">
//             <motion.div
//               animate={{
//                 scale: isAgentSpeaking ? [1, 1.15, 1] : 1,
//                 opacity: isAgentSpeaking ? 0.25 : 0.05,
//               }}
//               transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
//               className="absolute w-72 h-72 bg-indigo-500/30 blur-3xl rounded-full pointer-events-none"
//             />
//             <div className="flex items-center gap-2 h-20 z-10">
//               {[0, 1, 2, 3, 4].map((i) => (
//                 <motion.div
//                   key={i}
//                   animate={{
//                     height: isAgentSpeaking ? waveformPatterns[i] : "12%",
//                   }}
//                   transition={{
//                     duration: 0.5 + i * 0.08,
//                     repeat: Infinity,
//                     ease: "easeInOut",
//                   }}
//                   className={`w-3 rounded-full transition-colors duration-300 ${
//                     isAgentSpeaking
//                       ? "bg-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.5)]"
//                       : "bg-white/20"
//                   }`}
//                 />
//               ))}
//             </div>
//           </div>
//         )}
//       </div>

//       {/* ── Chat side panel ─────────────────────────────────────────────────── */}
//       <AnimatePresence>
//         {chatOpen && (
//           <ChatPanel
//             messages={messages}
//             onSend={sendChat}
//             onClose={() => setChatOpen(false)}
//           />
//         )}
//       </AnimatePresence>

//       {/* ── Status HUD Layer ────────────────────────────────────────────────── */}
//       <div className="absolute top-4 left-0 right-0 mx-auto text-center z-20 pointer-events-none">
//         <AnimatePresence mode="wait">
//           {isConnecting && (
//             <motion.div
//               initial={{ opacity: 0, y: -10 }}
//               animate={{ opacity: 1, y: 0 }}
//               exit={{ opacity: 0 }}
//               className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-xs text-white/80"
//             >
//               <RefreshCw size={12} className="animate-spin text-cyan-400" />
//               <span>
//                 {state === "agent_joining"
//                   ? "Avatar entering room..."
//                   : "Establishing WebRTC pipeline..."}
//               </span>
//             </motion.div>
//           )}
//         </AnimatePresence>
//       </div>

//       {/* ── Floating Overlay Controls ────────────────────────────────────────── */}
//       <div
//         className="absolute bottom-6 left-0 z-30 flex flex-col items-center gap-3 pointer-events-none transition-all duration-300"
//         style={{ right: chatOpen ? 270 : 0 }}
//       >
//         {hasVideo && state === "avatar_ready" && !isSessionActive && (
//           <motion.button
//             className="pointer-events-auto px-6 py-3 rounded-full bg-cyan-500 hover:bg-cyan-600 font-medium text-sm shadow-xl flex items-center gap-2"
//             onClick={() => {
//               videoRef.current?.play();
//             }}
//           >
//             Click to Start Video
//           </motion.button>
//         )}

//         {["idle", "disconnected", "error"].includes(state) && (
//           <motion.button
//             initial={{ opacity: 0, scale: 0.9 }}
//             animate={{ opacity: 1, scale: 1 }}
//             className="pointer-events-auto px-5 py-2.5 rounded-full bg-cyan-500 hover:bg-cyan-600 font-medium text-xs shadow-xl tracking-wide flex items-center gap-2 transition-colors"
//             onClick={() => connect(agent.id, roomName, userIdentity)}
//           >
//             <RefreshCw size={14} />
//             <span>Reconnect Session</span>
//           </motion.button>
//         )}

//         {isSessionActive && (
//           <motion.div
//             initial={{ opacity: 0, y: 15 }}
//             animate={{ opacity: 1, y: 0 }}
//             className="pointer-events-auto flex items-center gap-4 px-4 py-3 rounded-full bg-black/50 backdrop-blur-lg border border-white/10 shadow-2xl"
//           >
//             <button
//               onClick={toggleMic}
//               className={`w-11 h-11 rounded-full flex items-center justify-center border transition-all ${
//                 isMicEnabled
//                   ? "bg-white/10 border-white/20 text-white hover:bg-white/20"
//                   : "bg-red-500/20 border-red-500/40 text-red-400 hover:bg-red-500/30"
//               }`}
//             >
//               {isMicEnabled ? <Mic size={16} /> : <MicOff size={16} />}
//             </button>

//             <button
//               onClick={() => setChatOpen((v) => !v)}
//               className={`w-11 h-11 rounded-full flex items-center justify-center border transition-all ${
//                 chatOpen
//                   ? "bg-indigo-500/30 border-indigo-400/50 text-indigo-200"
//                   : "bg-white/10 border-white/20 text-white hover:bg-white/20"
//               }`}
//               title="Chat"
//             >
//               <MessageSquare size={16} />
//             </button>

//             <div className="w-px h-6 bg-white/10" />

//             <button
//               onClick={disconnect}
//               className="w-11 h-11 rounded-full flex items-center justify-center bg-red-600 hover:bg-red-700 text-white transition-colors border border-red-500/20 shadow-lg"
//             >
//               <PhoneOff size={16} />
//             </button>
//           </motion.div>
//         )}
//       </div>
//     </div>
//   );
// }

"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCw } from "lucide-react";
import { LiveAvatarRoom } from "@/components/avatar/Liveavatarroom";
import { useLiveKitRoom } from "@/hooks/Uselivekitroom";
import { DEFAULT_AVATAR, AVATAR_OPTIONS } from "@/components/avatar/Avatars";
import type { Agent } from "@/types";

interface ConversationViewProps {
  agent: Agent & { avatar_id?: string };
  roomName?: string;
  userIdentity?: string;
}

export function ConversationView({
  agent,
  roomName,
  userIdentity,
}: ConversationViewProps) {
  const _lk: any = useLiveKitRoom();
  const {
    videoRef,
    state,
    connect,
    disconnect,
    isMicEnabled,
    toggleMic,
    error,
    hasVideo,
    isAgentSpeaking,
  } = _lk;
  // `room` if the hook exposes it (optional — window.__lkRoom is the fallback)
  const room = _lk.room;

  const initialAvatar =
    AVATAR_OPTIONS.find((a) => a.id === agent.avatar_id) ?? DEFAULT_AVATAR;
  const [selectedAvatar] = useState(initialAvatar);
  const connectionAttempted = useRef(false);

  // ── Chat state ─────────────────────────────────────────────────────

  // ── Room access with fallback ────────────────────────────────────────
  // The chat needs the LiveKit Room instance. Preferred: the hook returns
  // `room`. FALLBACK: add ONE line in the hook right after the Room is
  // created (inside connect):   (window as any).__lkRoom = room;
  // We pick it up here, so chat works even without changing the hook's return.
  const getRoom = useCallback((): any => {
    return (
      (room as any) ??
      (typeof window !== "undefined" ? (window as any).__lkRoom : undefined)
    );
  }, [room]);
  interface _ChatMsg {
    id: string;
    from: "user" | "agent";
    text: string;
    final: boolean;
  }
  const [messages, setMessages] = useState<_ChatMsg[]>([]);

  // Upsert a transcript segment (streams update the same segment id as the
  // text firms up, then mark it final).
  const upsertMessage = useCallback(
    (id: string, from: "user" | "agent", text: string, final: boolean) => {
      setMessages((prev) => {
        const i = prev.findIndex((m) => m.id === id);
        if (i === -1) return [...prev, { id, from, text, final }];
        const next = [...prev];
        next[i] = { ...next[i], text, final };
        return next;
      });
      // Relay to the PARENT widget, which renders the chat panel.
      try {
        window.parent.postMessage(
          { type: "VOICE_AGENT_TRANSCRIPT", id, from, text, final },
          "*",
        );
      } catch {}
    },
    [],
  );

  // ── Connection Logic ──────────────────────────────────────────────
  useEffect(() => {
    if (!connectionAttempted.current) {
      connectionAttempted.current = true;
      connect(agent.id, roomName, userIdentity).catch((err: any) =>
        console.error("Automated session token acquisition failed:", err),
      );
    }
    return () => {
      disconnect();
    };
  }, [agent.id, roomName, userIdentity, connect, disconnect]);

  // ── Transcription listener: agent + user speech → chat messages ────
  // Transcripts arrive via ONE of two paths depending on livekit versions:
  //  A) text streams on topic "lk.transcription" (newer)
  //  B) RoomEvent.TranscriptionReceived segments (older)
  // Listen to BOTH; whichever fires wins. Debug logs show which path is live.
  // Which delivery path is live — lock to the FIRST one that delivers so the
  // same transcript arriving via both paths doesn't render twice.
  const transcriptPath = useRef<null | "stream" | "legacy">(null);

  useEffect(() => {
    const lkRoom = getRoom();
    if (!lkRoom) {
      console.warn(
        "[chat] room not available yet (state=" +
          state +
          ") — " +
          "expose `room` from useLiveKitRoom OR set window.__lkRoom = room inside the hook's connect()",
      );
      return;
    }
    console.log(
      "[chat] registering transcript listeners (state=" + state + ")",
    );

    // Path A: text streams
    const streamHandler = async (reader: any, participantInfo: any) => {
      try {
        const attrs: Record<string, string> = reader.info?.attributes ?? {};
        console.log("[chat] text stream received", { attrs, participantInfo });
        const segId =
          attrs["lk.segment_id"] || `${Date.now()}-${Math.random()}`;
        const transcribedTrack = attrs["lk.transcribed_track_id"];
        let isUser = false;
        if (transcribedTrack && lkRoom.localParticipant) {
          const pubs = Array.from(
            lkRoom.localParticipant.trackPublications?.values?.() ?? [],
          ) as any[];
          isUser = pubs.some((p) => p?.trackSid === transcribedTrack);
        }
        const final = attrs["lk.transcription_final"] === "true";
        const text = await reader.readAll();
        if (text && text.trim()) {
          if (transcriptPath.current === null)
            transcriptPath.current = "stream";
          if (transcriptPath.current !== "stream") return; // legacy path owns delivery
          upsertMessage(segId, isUser ? "user" : "agent", text, final);
        }
      } catch (e) {
        console.warn("[chat] transcription stream error", e);
      }
    };
    try {
      lkRoom.registerTextStreamHandler("lk.transcription", streamHandler);
    } catch (e) {
      console.warn("[chat] text stream handler unavailable:", e);
    }

    // Path B: legacy transcription events
    const onTranscription = (segments: any[], participant: any) => {
      console.log("[chat] TranscriptionReceived", { segments, participant });
      if (transcriptPath.current === "stream") return; // stream path owns delivery
      if (transcriptPath.current === null) transcriptPath.current = "legacy";
      const localIdentity = lkRoom.localParticipant?.identity;
      for (const seg of segments ?? []) {
        const isUser = participant?.identity === localIdentity;
        if (seg?.text && seg.text.trim()) {
          upsertMessage(
            seg.id || `${Date.now()}-${Math.random()}`,
            isUser ? "user" : "agent",
            seg.text,
            !!seg.final,
          );
        }
      }
    };
    try {
      lkRoom.on("transcriptionReceived", onTranscription);
    } catch (e) {
      console.warn("[chat] legacy transcription event unavailable:", e);
    }

    return () => {
      try {
        lkRoom.unregisterTextStreamHandler?.("lk.transcription");
      } catch {}
      try {
        lkRoom.off?.("transcriptionReceived", onTranscription);
      } catch {}
    };
    // `state` in deps: re-attempts registration as the connection progresses,
    // so a room created mid-connect (window.__lkRoom) is picked up.
  }, [getRoom, upsertMessage, state]);

  // ── Send a typed message: appears in chat + the avatar answers it ──
  const isConnecting = ["connecting", "connected", "agent_joining"].includes(
    state,
  );
  const isSessionActive = state === "avatar_ready";

  // ── Bridge: parent widget (widget.js) → iframe controls ──────────────
  useEffect(() => {
    function handleParentMessage(event: MessageEvent) {
      const data = event.data;
      if (!data || !data.type) return;

      switch (data.type) {
        case "VOICE_AGENT_MIC_TOGGLE": {
          if (data.enabled !== isMicEnabled) {
            toggleMic();
          }
          break;
        }
        case "VOICE_AGENT_SPEAKER_TOGGLE": {
          document.querySelectorAll("audio").forEach((el) => {
            (el as HTMLAudioElement).muted = !data.enabled;
          });
          break;
        }
        case "VOICE_AGENT_SEND_TEXT": {
          const t = (data.text || "").trim();
          const lkRoom = getRoom();
          console.log("[chat] SEND_TEXT received", {
            text: t,
            hasRoom: !!lkRoom,
          });
          if (t && lkRoom?.localParticipant?.sendText) {
            lkRoom.localParticipant
              .sendText(t, { topic: "lk.chat" })
              .then(() => console.log("[chat] sendText OK"))
              .catch((e: any) => console.error("[chat] sendText failed", e));
          } else if (t) {
            console.error(
              "[chat] cannot send: " +
                (!lkRoom
                  ? "room unavailable (set window.__lkRoom in the hook)"
                  : "localParticipant.sendText missing — livekit-client too old, upgrade to >=2.13"),
            );
          }
          break;
        }
        case "VOICE_AGENT_DISCONNECT": {
          disconnect();
          break;
        }
      }
    }

    window.addEventListener("message", handleParentMessage);
    return () => window.removeEventListener("message", handleParentMessage);
  }, [isMicEnabled, toggleMic, disconnect, getRoom]);

  // ── Report mic state back so the parent's icon stays in sync ──────────
  useEffect(() => {
    if (!isSessionActive) return;
    window.parent.postMessage(
      { type: "VOICE_AGENT_MIC_STATE", enabled: isMicEnabled },
      "*",
    );
  }, [isMicEnabled, isSessionActive]);

  // ── Tell the parent when the avatar is actually ready ─────────────────
  useEffect(() => {
    if (isSessionActive) {
      window.parent.postMessage({ type: "VOICE_AGENT_READY" }, "*");
    }
  }, [isSessionActive]);

  const waveformPatterns = [
    ["20%", "60%", "30%", "80%", "20%"],
    ["20%", "80%", "40%", "100%", "20%"],
    ["20%", "50%", "90%", "40%", "20%"],
    ["20%", "100%", "50%", "80%", "20%"],
    ["20%", "70%", "30%", "60%", "20%"],
  ];

  return (
    <div className="relative w-full h-full bg-[#11141a] text-white overflow-hidden select-none">
      {/* ── Immersive Full-Screen Visual Core ─────────────────────────────── */}
      <div
        className="absolute inset-y-0 left-0 z-0 transition-all duration-300"
        style={{ right: 0 }}
      >
        {hasVideo && state === "avatar_ready" && (
          <LiveAvatarRoom
            videoRef={videoRef}
            state={state}
            avatar={selectedAvatar}
            agentName={agent.name}
            error={error}
          />
        )}

        {(!hasVideo || state !== "avatar_ready") && (
          <div className="w-full h-full flex flex-col items-center justify-center relative overflow-hidden bg-gradient-to-b from-slate-900 to-slate-950">
            <motion.div
              animate={{
                scale: isAgentSpeaking ? [1, 1.15, 1] : 1,
                opacity: isAgentSpeaking ? 0.25 : 0.05,
              }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="absolute w-72 h-72 bg-indigo-500/30 blur-3xl rounded-full pointer-events-none"
            />
            <div className="flex items-center gap-2 h-20 z-10">
              {[0, 1, 2, 3, 4].map((i) => (
                <motion.div
                  key={i}
                  animate={{
                    height: isAgentSpeaking ? waveformPatterns[i] : "12%",
                  }}
                  transition={{
                    duration: 0.5 + i * 0.08,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className={`w-3 rounded-full transition-colors duration-300 ${
                    isAgentSpeaking
                      ? "bg-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.5)]"
                      : "bg-white/20"
                  }`}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Chat UI is rendered by the PARENT widget; this iframe only relays
          transcripts up and forwards typed text into the room. */}

      {/* ── Status HUD Layer ────────────────────────────────────────────────── */}
      <div className="absolute top-4 left-0 right-0 mx-auto text-center z-20 pointer-events-none">
        <AnimatePresence mode="wait">
          {isConnecting && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-xs text-white/80"
            >
              <RefreshCw size={12} className="animate-spin text-cyan-400" />
              <span>
                {state === "agent_joining"
                  ? "Avatar entering room..."
                  : "Establishing WebRTC pipeline..."}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Floating Overlay Controls ────────────────────────────────────────── */}
      <div
        className="absolute bottom-6 left-0 z-30 flex flex-col items-center gap-3 pointer-events-none transition-all duration-300"
        style={{ right: 0 }}
      >
        {hasVideo && state === "avatar_ready" && !isSessionActive && (
          <motion.button
            className="pointer-events-auto px-6 py-3 rounded-full bg-cyan-500 hover:bg-cyan-600 font-medium text-sm shadow-xl flex items-center gap-2"
            onClick={() => {
              videoRef.current?.play();
            }}
          >
            Click to Start Video
          </motion.button>
        )}

        {["idle", "disconnected", "error"].includes(state) && (
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="pointer-events-auto px-5 py-2.5 rounded-full bg-cyan-500 hover:bg-cyan-600 font-medium text-xs shadow-xl tracking-wide flex items-center gap-2 transition-colors"
            onClick={() => connect(agent.id, roomName, userIdentity)}
          >
            <RefreshCw size={14} />
            <span>Reconnect Session</span>
          </motion.button>
        )}

        {/* NOTE: no internal control dock here — the PARENT widget renders the
            mic / speaker / chat / end-call controls. An internal dock duplicated
            the buttons and became visible when the chat panel shifted layouts. */}
      </div>
    </div>
  );
}

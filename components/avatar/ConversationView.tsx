// // "use client";

// // import { useEffect, useRef } from "react";
// // import { motion, AnimatePresence } from "framer-motion";
// // import { Avatar } from "@/components/avatar/Avatar";
// // import { VoiceControls } from "@/components/voice/VoiceControls";
// // import { useVoiceStore } from "@/store";
// // import type { Agent } from "@/types";

// // interface ConversationViewProps {
// //   agent: Agent;
// // }

// // export function ConversationView({ agent }: ConversationViewProps) {
// //   const { messages, avatarState } = useVoiceStore();
// //   const messagesEndRef = useRef<HTMLDivElement>(null);

// //   useEffect(() => {
// //     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
// //   }, [messages]);

// //   return (
// //     <div className="flex flex-col h-full bg-white/30 text-slate-800">
// //       {/* Avatar panel */}
// //       <div className="relative flex-none h-72 md:h-96 p-4">
// //         <Avatar
// //           type={agent.avatar_type}
// //           url={agent.avatar_url}
// //           config={agent.avatar_config}
// //           state={avatarState}
// //           agentName={agent.name}
// //         />
// //       </div>

// //       {/* Transcript */}
// //       <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 min-h-0 bg-slate-50/50">
// //         <AnimatePresence initial={false}>
// //           {messages.map((msg) => (
// //             <motion.div
// //               key={msg.id}
// //               initial={{ opacity: 0, y: 12 }}
// //               animate={{ opacity: 1, y: 0 }}
// //               className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
// //             >
// //               <div
// //                 className={`
// //                   max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm
// //                   ${
// //                     msg.role === "user"
// //                       ? "bg-[#424874] text-white rounded-br-md"
// //                       : "bg-[#DCD6F7]/60 text-[#424874] border border-[#A6B1E1]/40 rounded-bl-md"
// //                   }
// //                 `}
// //               >
// //                 {msg.content}
// //               </div>
// //             </motion.div>
// //           ))}
// //         </AnimatePresence>
// //         <div ref={messagesEndRef} />
// //       </div>

// //       {/* Voice controls */}
// //       <div className="flex-none px-4 py-6 bg-gradient-to-t from-white via-white/80 to-transparent">
// //         <VoiceControls agentId={agent.id} />
// //       </div>
// //     </div>
// //   );
// // }

// "use client";

// import { useEffect, useState } from "react";
// import {
//   LiveKitRoom,
//   RoomAudioRenderer,
//   useTracks,
//   useDataChannel,
// } from "@livekit/components-react";
// import { Track } from "livekit-client";
// import { motion, AnimatePresence } from "framer-motion";
// import { Avatar } from "@/components/avatar/Avatar";
// import { apiClient } from "@/lib/api/client";
// import type { Agent } from "@/types";

// interface ConversationViewProps {
//   agent: Agent;
//   roomName: string;
//   userIdentity: string;
// }

// export function ConversationView({
//   agent,
//   roomName,
//   userIdentity,
// }: ConversationViewProps) {
//   const [token, setToken] = useState<string | null>(null);

//   // Pull authenticating room parameters cleanly on render loops
//   useEffect(() => {
//     async function fetchToken() {
//       try {
//         const data = await apiClient.get<{ token: string }>(
//           `/api/livekit/token?room=${roomName}&identity=${userIdentity}`,
//         );
//         setToken(data.token);
//       } catch (err) {
//         console.error("Failed fetching livekit connection authorizations", err);
//       }
//     }
//     fetchToken();
//   }, [roomName, userIdentity]);

//   if (!token) {
//     return (
//       <div className="flex h-full items-center justify-center text-sm">
//         Securing network handshake tokens...
//       </div>
//     );
//   }

//   return (
//     <LiveKitRoom
//       video={false}
//       audio={true}
//       token={token}
//       serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
//       data-lk-theme="default"
//       className="flex flex-col h-full bg-white/30 text-slate-800"
//     >
//       <RoomAudioRenderer />
//       <ActiveSessionLayout agent={agent} />
//     </LiveKitRoom>
//   );
// }

// // ── Inner Active Session Context ──────────────────────────────────────────

// function ActiveSessionLayout({ agent }: { agent: Agent }) {
//   const [messages, setMessages] = useState<
//     Array<{ id: string; role: string; text: string }>
//   >([]);

//   // Use data channel abstractions to catch real-time agent transcripts seamlessly
//   const { message: dataMessage } = useDataChannel("transcript");

//   useEffect(() => {
//     if (dataMessage) {
//       const payload = JSON.parse(new TextDecoder().decode(dataMessage.payload));
//       // Expected payload format layout from the agent worker script: { id, role, text, final }
//       if (payload.final) {
//         setMessages((prev) => [
//           ...prev,
//           { id: payload.id, role: payload.role, text: payload.text },
//         ]);
//       }
//     }
//   }, [dataMessage]);

//   return (
//     <div className="flex flex-col h-full w-full">
//       {/* Avatar Panel */}
//       <div className="relative flex-none h-72 md:h-96 p-4">
//         <Avatar
//           type={agent.avatar_type}
//           url={agent.avatar_url}
//           config={agent.avatar_config}
//           state="speaking" // In a real implementation, this would be dynamic based on agent state
//           agentName={agent.name}
//         />
//       </div>

//       {/* Live Audio Interaction Transcript Visualizer */}
//       <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 min-h-0 bg-slate-50/50">
//         <AnimatePresence initial={false}>
//           {messages.map((msg) => (
//             <motion.div
//               key={msg.id}
//               initial={{ opacity: 0, y: 12 }}
//               animate={{ opacity: 1, y: 0 }}
//               className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
//             >
//               <div
//                 className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
//                   msg.role === "user"
//                     ? "bg-[#424874] text-white rounded-br-md"
//                     : "bg-[#DCD6F7]/60 text-[#424874] border border-[#A6B1E1]/40 rounded-bl-md"
//                 }`}
//               >
//                 {msg.text}
//               </div>
//             </motion.div>
//           ))}
//         </AnimatePresence>
//       </div>
//     </div>
//   );
// }

// "use client";

// import { useEffect, useRef, useState, useCallback } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import { Mic, MicOff, PhoneOff, Settings2 } from "lucide-react";
// import { LiveAvatarRoom } from "./Liveavatarroom";
// import { AvatarPicker } from "./Avatarpicker";
// import { useLiveKitRoom } from "@/hooks/Uselivekitroom";
// import { DEFAULT_AVATAR, AVATAR_OPTIONS, type AvatarOption } from "./Avatars";
// import { apiClient } from "@/lib/api/client";
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
//     roomName: lkRoomName,
//     hasVideo,
//     isAgentSpeaking,
//   } = useLiveKitRoom();

//   const displayRoomName = roomName || lkRoomName;

//   // Resolve initial avatar from saved agent.avatar_id
//   const initialAvatar =
//     AVATAR_OPTIONS.find((a) => a.id === agent.avatar_id) ?? DEFAULT_AVATAR;

//   const [selectedAvatar, setSelectedAvatar] =
//     useState<AvatarOption>(initialAvatar);
//   const [showPicker, setShowPicker] = useState(false);
//   const [messages, setMessages] = useState<
//     { id: string; role: "user" | "assistant"; text: string }[]
//   >([]);
//   const messagesEndRef = useRef<HTMLDivElement>(null);

//   useEffect(() => {
//     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages]);

//   // ── Avatar change: persist to DB then reconnect ───────────────────────────
//   const handleAvatarChange = useCallback(
//     async (avatar: AvatarOption) => {
//       setSelectedAvatar(avatar);
//       setShowPicker(false);

//       // Persist to agent so agentworker picks it up on next dispatch
//       try {
//         await apiClient.patch(`/api/agents/${agent.id}`, {
//           avatar_id: avatar.id,
//         });
//       } catch (e) {
//         console.error("Failed to save avatar choice", e);
//       }

//       // Restart session with new avatar if currently connected
//       if (state !== "idle" && state !== "error" && state !== "disconnected") {
//         disconnect();
//         // Small delay to let room disconnect cleanly
//         setTimeout(() => connect(agent.id, roomName, userIdentity), 400);
//       }
//     },
//     [agent.id, state, connect, disconnect, roomName, userIdentity],
//   );

//   // ── Start / stop session ──────────────────────────────────────────────────
//   const handleStartStop = useCallback(async () => {
//     if (state === "idle" || state === "disconnected" || state === "error") {
//       await connect(agent.id, roomName, userIdentity);
//     } else {
//       disconnect();
//     }
//   }, [state, agent.id, connect, disconnect, roomName, userIdentity]);

//   const isActive = !["idle", "disconnected", "error"].includes(state);
//   const isConnecting = ["connecting", "connected", "agent_joining"].includes(
//     state,
//   );

//   // Array of varied heights to make the waveform look like natural speech frequencies
//   const waveformPatterns = [
//     ["20%", "60%", "30%", "80%", "20%"],
//     ["20%", "80%", "40%", "100%", "20%"],
//     ["20%", "50%", "90%", "40%", "20%"],
//     ["20%", "100%", "50%", "80%", "20%"],
//     ["20%", "70%", "30%", "60%", "20%"],
//   ];

//   return (
//     <div className="flex flex-col h-full bg-slate-950 text-white">
//       {/* ── Avatar video or Waveform panel ─────────────────────────────── */}
//       <div className="relative flex-none h-64 md:h-80 lg:h-96 px-4 pt-4">
//         {/* Render Avatar if video exists, otherwise render the Waveform fallback */}
//         {hasVideo ? (
//           <LiveAvatarRoom
//             videoRef={videoRef}
//             state={state}
//             avatar={selectedAvatar}
//             agentName={agent.name}
//             error={error}
//           />
//         ) : (
//           <div className="w-full h-full bg-slate-900 rounded-2xl border border-white/5 flex flex-col items-center justify-center relative overflow-hidden">
//             {/* Pulsing glow background when speaking */}
//             <motion.div
//               animate={{ opacity: isAgentSpeaking ? 0.3 : 0 }}
//               transition={{ duration: 0.3 }}
//               className="absolute inset-0 bg-indigo-500/20 blur-3xl rounded-full"
//             />

//             {/* AI Reactive Waveform Bars */}
//             <div className="flex items-center gap-1.5 h-16 z-10">
//               {[0, 1, 2, 3, 4].map((i) => (
//                 <motion.div
//                   key={i}
//                   animate={{
//                     height: isAgentSpeaking ? waveformPatterns[i] : "15%",
//                   }}
//                   transition={{
//                     duration: 0.6 + i * 0.05,
//                     repeat: Infinity,
//                     ease: "easeInOut",
//                     times: [0, 0.25, 0.5, 0.75, 1], // Map to the 5 keyframes smoothly
//                   }}
//                   className={`w-2.5 rounded-full ${
//                     isAgentSpeaking ? "bg-indigo-400" : "bg-white/10"
//                   }`}
//                 />
//               ))}
//             </div>

//             <p className="mt-6 text-sm text-white/40 font-medium z-10">
//               {agent.name}{" "}
//               {state === "avatar_ready" ? "(Audio Only)" : "Connecting..."}
//             </p>
//           </div>
//         )}

//         {/* Avatar switcher */}
//         <motion.button
//           whileHover={{ scale: 1.05 }}
//           whileTap={{ scale: 0.95 }}
//           onClick={() => setShowPicker((v) => !v)}
//           className="absolute top-7 right-7 z-10 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-black/50 backdrop-blur-sm border border-white/15 hover:border-white/30 text-white/60 hover:text-white transition-colors text-xs"
//         >
//           <Settings2 size={13} />
//           {selectedAvatar.name}
//         </motion.button>
//       </div>

//       {/* ── Avatar picker dropdown ─────────────────────────────────────── */}
//       <AnimatePresence>
//         {showPicker && (
//           <motion.div
//             initial={{ opacity: 0, height: 0 }}
//             animate={{ opacity: 1, height: "auto" }}
//             exit={{ opacity: 0, height: 0 }}
//             className="flex-none px-4 overflow-hidden"
//           >
//             <div className="py-3">
//               <AvatarPicker
//                 selected={selectedAvatar}
//                 onChange={handleAvatarChange}
//                 disabled={isConnecting}
//               />
//             </div>
//           </motion.div>
//         )}
//       </AnimatePresence>

//       {/* ── Room info strip ────────────────────────────────────────────── */}
//       {displayRoomName && (
//         <div className="flex-none px-4 py-1">
//           <p className="text-[10px] text-white/20 font-mono">
//             room: {displayRoomName}
//           </p>
//         </div>
//       )}

//       {/* ── Messages transcript ────────────────────────────────────────── */}
//       <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 min-h-0">
//         {messages.length === 0 && (
//           <p className="text-white/20 text-sm text-center mt-8">
//             {isActive ? "Listening…" : "Start a conversation"}
//           </p>
//         )}
//         <AnimatePresence initial={false}>
//           {messages.map((msg) => (
//             <motion.div
//               key={msg.id}
//               initial={{ opacity: 0, y: 8 }}
//               animate={{ opacity: 1, y: 0 }}
//               className={`flex ${
//                 msg.role === "user" ? "justify-end" : "justify-start"
//               }`}
//             >
//               <div
//                 className={`
//                   max-w-[82%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed
//                   ${
//                     msg.role === "user"
//                       ? "bg-indigo-600/80 text-white rounded-br-md"
//                       : "bg-white/10 text-white/90 rounded-bl-md"
//                   }
//                 `}
//               >
//                 {msg.text}
//               </div>
//             </motion.div>
//           ))}
//         </AnimatePresence>
//         <div ref={messagesEndRef} />
//       </div>

//       {/* ── Controls ──────────────────────────────────────────────────── */}
//       <div className="flex-none px-4 pb-6 pt-3 flex flex-col items-center gap-3 bg-gradient-to-t from-slate-950 via-slate-950/95 to-transparent">
//         {/* Status hint */}
//         <p className="text-xs text-white/30">
//           {state === "idle" && "Press start to connect"}
//           {state === "connecting" && "Connecting to room…"}
//           {state === "connected" && "Dispatching agent…"}
//           {state === "agent_joining" && "Agent joining room…"}
//           {state === "avatar_ready" &&
//             (isMicEnabled ? "Mic on — speak now" : "Mic muted")}
//           {state === "error" && `Error: ${error}`}
//           {state === "disconnected" && "Session ended"}
//         </p>

//         <div className="flex items-center gap-4">
//           {/* Mic toggle — only available once avatar is ready */}
//           <motion.button
//             whileHover={{ scale: 1.05 }}
//             whileTap={{ scale: 0.95 }}
//             onClick={toggleMic}
//             disabled={state !== "avatar_ready"}
//             className={`
//               w-12 h-12 rounded-full flex items-center justify-center
//               border transition-all disabled:opacity-30 disabled:cursor-not-allowed
//               ${
//                 isMicEnabled
//                   ? "bg-red-500/20 border-red-500/50 text-red-400"
//                   : "bg-white/8 border-white/15 text-white/50"
//               }
//             `}
//           >
//             {isMicEnabled ? <Mic size={18} /> : <MicOff size={18} />}
//           </motion.button>

//           {/* Start / stop button */}
//           <motion.button
//             whileHover={{ scale: 1.03 }}
//             whileTap={{ scale: 0.97 }}
//             onClick={handleStartStop}
//             disabled={isConnecting}
//             className={`
//               relative w-20 h-20 rounded-full flex items-center justify-center
//               shadow-2xl transition-all disabled:opacity-60 disabled:cursor-not-allowed
//               ${
//                 isActive
//                   ? "bg-gradient-to-br from-red-500 to-rose-600"
//                   : "bg-gradient-to-br from-indigo-500 to-violet-600"
//               }
//             `}
//           >
//             {/* Connecting spinner ring */}
//             {isConnecting && (
//               <motion.div
//                 className="absolute inset-0 rounded-full border-2 border-transparent border-t-white/60"
//                 animate={{ rotate: 360 }}
//                 transition={{ duration: 0.9, repeat: Infinity, ease: "linear" }}
//               />
//             )}
//             {isActive ? (
//               <PhoneOff size={26} className="text-white" />
//             ) : (
//               <Mic size={26} className="text-white" />
//             )}
//           </motion.button>

//           {/* Placeholder right side for symmetry */}
//           <div className="w-12 h-12" />
//         </div>
//       </div>
//     </div>
//   );
// }

"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mic,
  MicOff,
  PhoneOff,
  Settings2,
  Minimize2,
  RefreshCw,
} from "lucide-react";
import { LiveAvatarRoom } from "./Liveavatarroom";
import { useLiveKitRoom } from "@/hooks/Uselivekitroom";
import { DEFAULT_AVATAR, AVATAR_OPTIONS } from "./Avatars";
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
  } = useLiveKitRoom();

  const initialAvatar =
    AVATAR_OPTIONS.find((a) => a.id === agent.avatar_id) ?? DEFAULT_AVATAR;
  const [selectedAvatar] = useState(initialAvatar);
  const connectionAttempted = useRef(false);
  const [sessionTime, setSessionTime] = useState(0);

  // ── Connection Logic ──────────────────────────────────────────────
  useEffect(() => {
    if (!connectionAttempted.current) {
      connectionAttempted.current = true;
      connect(agent.id, roomName, userIdentity).catch((err) =>
        console.error("Automated session token acquisition failed:", err),
      );
    }
    return () => {
      disconnect();
    };
  }, [agent.id, roomName, userIdentity, connect, disconnect]);

  // Session Timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (state === "avatar_ready") {
      interval = setInterval(() => {
        setSessionTime((prev) => prev + 1);
      }, 1000);
    } else {
      setSessionTime(0);
    }
    return () => clearInterval(interval);
  }, [state]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const handleCloseWidget = () => {
    disconnect();
    if (window.parent) {
      window.parent.postMessage({ type: "VOICE_AGENT_CLOSE" }, "*");
    }
  };

  const isConnecting = ["connecting", "connected", "agent_joining"].includes(
    state,
  );
  const isSessionActive = state === "avatar_ready";

  const waveformPatterns = [
    ["20%", "60%", "30%", "80%", "20%"],
    ["20%", "80%", "40%", "100%", "20%"],
    ["20%", "50%", "90%", "40%", "20%"],
    ["20%", "100%", "50%", "80%", "20%"],
    ["20%", "70%", "30%", "60%", "20%"],
  ];

  return (
    <div className="relative w-full h-full bg-[#050505] text-white overflow-hidden rounded-2xl border-2 border-[#1A1A2E] shadow-2xl">
      {/* ── Main Avatar Video Layer ─────────────────────────────────────────── */}
      <div className="absolute inset-0 w-full h-full z-0">
        <LiveAvatarRoom
          videoRef={videoRef}
          state={state}
          avatar={selectedAvatar}
          agentName={agent.name}
          error={error}
        />

        {/* Fallback Waveform if Video isn't ready or hasn't started playing */}
        {(!hasVideo || !isSessionActive) && (
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

      {/* ── Top HUD Bar ────────────────────────────────────────────────────── */}
      <div className="absolute top-0 left-0 right-0 p-4 flex justify-end gap-3 z-20 pointer-events-none">
        <AnimatePresence>
          {isSessionActive && (
            <>
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="pointer-events-auto flex items-center justify-center px-3 py-1.5 rounded-lg bg-black/40 backdrop-blur-md border border-white/10"
              >
                <div className="flex items-end gap-[2px] h-3.5">
                  <div className="w-[3px] h-[40%] bg-green-500 rounded-sm"></div>
                  <div className="w-[3px] h-[70%] bg-green-500 rounded-sm"></div>
                  <div className="w-[3px] h-[100%] bg-green-500 rounded-sm"></div>
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="pointer-events-auto flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/40 backdrop-blur-md border border-white/10 text-xs font-semibold"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></div>
                {formatTime(sessionTime)}
              </motion.div>
            </>
          )}
        </AnimatePresence>

        <button
          onClick={handleCloseWidget}
          className="pointer-events-auto w-8 h-8 flex items-center justify-center rounded-lg bg-black/40 backdrop-blur-md border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-colors"
        >
          <Minimize2 size={16} />
        </button>
      </div>

      {/* ── Loading / Connecting Overlay ───────────────────────────────────── */}
      <AnimatePresence>
        {isConnecting && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#050505]/80 backdrop-blur-sm"
          >
            <div className="flex items-center gap-3">
              <RefreshCw size={24} className="animate-spin text-cyan-400" />
              <span className="text-white/80 font-medium">
                {state === "agent_joining"
                  ? "Agent entering room..."
                  : "Establishing pipeline..."}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Bottom Control Dock ────────────────────────────────────────────── */}
      <div className="absolute bottom-6 left-0 right-0 flex flex-col items-center gap-4 z-20 pointer-events-none">
        {/* Autoplay Fallback Button */}
        {hasVideo && state === "avatar_ready" && (
          <button
            className="pointer-events-auto px-6 py-3 rounded-full bg-cyan-500 hover:bg-cyan-600 text-white font-medium shadow-xl opacity-0 hover:opacity-100 transition-opacity duration-300 absolute -top-16"
            onClick={() => videoRef.current?.play()}
            title="If video is frozen, click here to force play."
          >
            Start Video
          </button>
        )}

        {/* Disconnect/Error Reconnect State */}
        {["idle", "disconnected", "error"].includes(state) && (
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="pointer-events-auto px-6 py-3 rounded-full bg-indigo-600 hover:bg-indigo-700 font-medium text-sm shadow-xl flex items-center gap-2 transition-colors"
            onClick={() => connect(agent.id, roomName, userIdentity)}
          >
            Reconnect Call
          </motion.button>
        )}

        {/* Active Session Dock */}
        <AnimatePresence>
          {isSessionActive && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="pointer-events-auto flex items-center gap-3 px-3 py-3 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl"
            >
              <button
                onClick={toggleMic}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                  isMicEnabled
                    ? "bg-white/10 text-white hover:bg-white/20"
                    : "bg-white/5 text-white/50 hover:bg-white/10"
                }`}
              >
                {isMicEnabled ? <Mic size={20} /> : <MicOff size={20} />}
              </button>

              <button className="w-12 h-12 rounded-full flex items-center justify-center bg-white/10 text-white hover:bg-white/20 transition-all">
                <Settings2 size={20} />
              </button>

              <button className="w-12 h-12 rounded-full flex items-center justify-center bg-white/10 text-white hover:bg-white/20 transition-all">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </button>

              <div className="w-px h-8 bg-white/10 mx-1" />

              <button
                onClick={handleCloseWidget}
                className="w-12 h-12 rounded-full flex items-center justify-center bg-[#E11D48] hover:bg-red-700 text-white transition-all shadow-[0_0_15px_rgba(225,29,72,0.4)]"
              >
                <PhoneOff size={20} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

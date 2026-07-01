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

"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, PhoneOff, RefreshCw } from "lucide-react";
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

  // ── Connection Logic ──────────────────────────────────────────────
  useEffect(() => {
    // Only connect once, but ensure it handles WebRTC cleanly
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
    <div className="relative w-full h-full bg-[#11141a] text-white overflow-hidden select-none">
      {/* ── Immersive Full-Screen Visual Core ─────────────────────────────── */}
      <div className="absolute inset-0 w-full h-full z-0">
        {/* Force a click-to-play overlay if the browser blocks autoplay */}
        {hasVideo && state === "avatar_ready" && (
          <LiveAvatarRoom
            videoRef={videoRef}
            state={state}
            avatar={selectedAvatar}
            agentName={agent.name}
            error={error}
          />
        )}

        {/* Render fallback ONLY if video is truly not present or still connecting */}
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
      <div className="absolute bottom-6 left-0 right-0 z-30 flex flex-col items-center gap-3 pointer-events-none">
        {/* Autoplay / Blocked State Override */}
        {hasVideo && state === "avatar_ready" && !isSessionActive && (
          <motion.button
            className="pointer-events-auto px-6 py-3 rounded-full bg-cyan-500 hover:bg-cyan-600 font-medium text-sm shadow-xl flex items-center gap-2"
            onClick={() => {
              // A physical click forces the browser to allow the video tag to play
              videoRef.current?.play();
            }}
          >
            Click to Start Video
          </motion.button>
        )}

        {/* Disconnected / Error States */}
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

        {/* Live Audio Session HUD controls */}
        {isSessionActive && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="pointer-events-auto flex items-center gap-4 px-4 py-3 rounded-full bg-black/50 backdrop-blur-lg border border-white/10 shadow-2xl"
          >
            <button
              onClick={toggleMic}
              className={`w-11 h-11 rounded-full flex items-center justify-center border transition-all ${
                isMicEnabled
                  ? "bg-white/10 border-white/20 text-white hover:bg-white/20"
                  : "bg-red-500/20 border-red-500/40 text-red-400 hover:bg-red-500/30"
              }`}
            >
              {isMicEnabled ? <Mic size={16} /> : <MicOff size={16} />}
            </button>

            <div className="w-px h-6 bg-white/10" />

            <button
              onClick={disconnect}
              className="w-11 h-11 rounded-full flex items-center justify-center bg-red-600 hover:bg-red-700 text-white transition-colors border border-red-500/20 shadow-lg"
            >
              <PhoneOff size={16} />
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}

// "use client";

// /**
//  * LiveAvatarRoom
//  *
//  * Renders the LiveAvatar video stream delivered through the LiveKit room.
//  * The agentworker joins the room, starts liveavatar.AvatarSession,
//  * and LiveAvatar publishes video + audio as a remote participant.
//  * This component subscribes to that video track via a <video> element.
//  */

// import { motion, AnimatePresence } from "framer-motion";
// import type { LiveKitRoomState } from "../../hooks/Uselivekitroom";
// import type { AvatarOption } from "./Avatars";
// import { useEffect } from "react";

// interface LiveAvatarRoomProps {
//   videoRef: React.RefObject<HTMLVideoElement>;
//   state: LiveKitRoomState;
//   avatar: AvatarOption;
//   agentName: string;
//   error: string | null;
// }

// export function LiveAvatarRoom({
//   videoRef,
//   state,
//   avatar,
//   agentName,
//   error,
// }: LiveAvatarRoomProps) {
//   const isLive = state === "avatar_ready";
//   const isConnecting = ["connecting", "connected", "agent_joining"].includes(
//     state,
//   );
//   const isSpeaking = state === "avatar_ready"; // avatar video = always speaking-capable
//   // Inside ConversationView, after connection is established
//   // Add this hook call once isSessionActive becomes true

//   useEffect(() => {
//     if (!isLive) return;

//     let animFrame: number;
//     let analyser: AnalyserNode;
//     let audioCtx: AudioContext;

//     async function startAnalyser() {
//       try {
//         // Get the local mic stream from LiveKit's local participant
//         // room is exposed from useLiveKitRoom — add it to the hook's return value
//         const stream = await navigator.mediaDevices.getUserMedia({
//           audio: true,
//         });
//         audioCtx = new AudioContext();
//         const source = audioCtx.createMediaStreamSource(stream);
//         analyser = audioCtx.createAnalyser();
//         analyser.fftSize = 64; // small = fewer bars, smoother
//         analyser.smoothingTimeConstant = 0.75;
//         source.connect(analyser);

//         const data = new Uint8Array(analyser.frequencyBinCount); // 32 bins

//         function tick() {
//           analyser.getByteFrequencyData(data);
//           // Send only the lower bins (voice range: ~80Hz–3kHz)
//           const voiceBins = Array.from(data.slice(1, 9)); // 8 bars
//           window.parent?.postMessage(
//             {
//               type: "VOICE_AGENT_AUDIO_DATA",
//               bins: voiceBins,
//               speaking: isSpeaking,
//             },
//             "*",
//           );
//           animFrame = requestAnimationFrame(tick);
//         }
//         tick();
//       } catch (e) {
//         console.warn("Audio analyser failed:", e);
//       }
//     }

//     startAnalyser();

//     return () => {
//       cancelAnimationFrame(animFrame);
//       audioCtx?.close();
//     };
//   }, [isLive, isSpeaking]);

//   return (
//     <div className="relative w-full h-full rounded-2xl overflow-hidden bg-slate-950">
//       {/* Placeholder / connecting state */}
//       <AnimatePresence>
//         {!isLive && state !== "error" && (
//           <motion.div
//             initial={{ opacity: 1 }}
//             exit={{ opacity: 0, transition: { duration: 0.6 } }}
//             className="absolute inset-0 flex flex-col items-center justify-center"
//             style={{ background: avatar.previewGradient }}
//           >
//             {isConnecting ? (
//               <ConnectingState state={state} name={agentName} />
//             ) : (
//               <IdleState name={agentName} />
//             )}
//           </motion.div>
//         )}
//       </AnimatePresence>

//       {/* Error */}
//       <AnimatePresence>
//         {state === "error" && (
//           <motion.div
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950 p-6 text-center"
//           >
//             <div className="text-3xl mb-3">⚠️</div>
//             <p className="text-white/70 text-sm font-medium mb-1">
//               Connection failed
//             </p>
//             <p className="text-white/40 text-xs">{error}</p>
//           </motion.div>
//         )}
//       </AnimatePresence>

//       {/* LiveKit avatar video */}
//       <video
//         ref={videoRef}
//         autoPlay
//         playsInline
//         className={`
//           w-full h-full object-cover transition-opacity duration-700
//           ${isLive ? "opacity-100" : "opacity-0"}
//         `}
//       />

//       {/* Speaking ring overlay */}
//       <AnimatePresence>
//         {isLive && (
//           <motion.div
//             initial={{ opacity: 0 }}
//             animate={{ opacity: [0.25, 0.7, 0.25] }}
//             exit={{ opacity: 0 }}
//             transition={{ duration: 2.2, repeat: Infinity }}
//             className="absolute inset-0 rounded-2xl border-2 border-violet-400/40 pointer-events-none"
//           />
//         )}
//       </AnimatePresence>

//       {/* Status badge */}
//       <div className="absolute bottom-3 left-3">
//         <StateBadge state={state} name={agentName} />
//       </div>
//     </div>
//   );
// }

// // ── Sub-components ────────────────────────────────────────────────────────────

// function IdleState({ name }: { name: string }) {
//   return (
//     <div className="flex flex-col items-center gap-3 text-center">
//       <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center text-xl font-bold text-white/50">
//         {name[0].toUpperCase()}
//       </div>
//       <p className="text-white/50 text-sm">{name}</p>
//       <p className="text-white/30 text-xs">Press mic to start</p>
//     </div>
//   );
// }

// function ConnectingState({ state, name }: { state: string; name: string }) {
//   const label: Record<string, string> = {
//     connecting: "Connecting…",
//     connected: "Starting agent…",
//     agent_joining: `${name} is joining…`,
//   };

//   return (
//     <div className="flex flex-col items-center gap-4">
//       <div className="relative w-14 h-14">
//         <motion.div
//           className="absolute inset-0 rounded-full border-2 border-transparent border-t-white/70"
//           animate={{ rotate: 360 }}
//           transition={{ duration: 0.9, repeat: Infinity, ease: "linear" }}
//         />
//         <div className="absolute inset-0 flex items-center justify-center text-white/40 text-sm font-medium">
//           {name[0]}
//         </div>
//       </div>
//       <p className="text-white/60 text-sm">{label[state] ?? "Loading…"}</p>
//     </div>
//   );
// }

// const STATE_LABEL: Record<LiveKitRoomState, string> = {
//   idle: "Ready",
//   connecting: "Connecting…",
//   connected: "Connected",
//   agent_joining: "Agent joining…",
//   avatar_ready: "Live",
//   disconnected: "Disconnected",
//   error: "Error",
// };

// const STATE_DOT: Record<LiveKitRoomState, string> = {
//   idle: "bg-slate-500",
//   connecting: "bg-amber-400 animate-pulse",
//   connected: "bg-amber-400 animate-pulse",
//   agent_joining: "bg-blue-400 animate-pulse",
//   avatar_ready: "bg-emerald-400 animate-pulse",
//   disconnected: "bg-slate-600",
//   error: "bg-red-500",
// };

// function StateBadge({
//   state,
//   name,
// }: {
//   state: LiveKitRoomState;
//   name: string;
// }) {
//   return (
//     <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-sm">
//       <div className={`w-1.5 h-1.5 rounded-full ${STATE_DOT[state]}`} />
//       <span className="text-[11px] text-white/70 font-medium">
//         {name} · {STATE_LABEL[state]}
//       </span>
//     </div>
//   );
// }

"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { LiveKitRoomState } from "../../hooks/Uselivekitroom";
import type { AvatarOption } from "./Avatars";

interface LiveAvatarRoomProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  state: LiveKitRoomState;
  avatar: AvatarOption;
  agentName: string;
  error: string | null;
}

export function LiveAvatarRoom({
  videoRef,
  state,
  avatar,
  agentName,
  error,
}: LiveAvatarRoomProps) {
  const isLive = state === "avatar_ready";
  const isConnecting = ["connecting", "connected", "agent_joining"].includes(
    state,
  );

  return (
    <div className="relative w-full h-full bg-slate-950 overflow-hidden">
      {/* ── Placeholder / Connecting State ────────────────────────────────────── */}
      <AnimatePresence>
        {!isLive && state !== "error" && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.6 } }}
            className="absolute inset-0 flex flex-col items-center justify-center"
            style={{ background: avatar.previewGradient }}
          >
            {isConnecting ? (
              <ConnectingState state={state} name={agentName} />
            ) : (
              <IdleState name={agentName} />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Error State ───────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {state === "error" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950 p-6 text-center"
          >
            <div className="text-3xl mb-3">⚠️</div>
            <p className="text-white/70 text-sm font-medium mb-1">
              Connection failed
            </p>
            <p className="text-white/40 text-xs">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── LiveKit Avatar Video ──────────────────────────────────────────────── */}
      {/* Ensure playsInline and disablePictureInPicture are present to prevent iOS/browser hijacking */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        disablePictureInPicture
        className={`w-full h-full object-cover transition-opacity duration-700 ${isLive ? "opacity-100" : "opacity-0"}`}
      />
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function IdleState({ name }: { name: string }) {
  return (
    <div className="flex flex-col items-center gap-3 text-center z-10">
      <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center text-xl font-bold text-white/50">
        {name[0].toUpperCase()}
      </div>
      <p className="text-white/50 text-sm">{name}</p>
    </div>
  );
}

function ConnectingState({ state, name }: { state: string; name: string }) {
  const label: Record<string, string> = {
    connecting: "Connecting…",
    connected: "Starting agent…",
    agent_joining: `${name} is joining…`,
  };

  return (
    <div className="flex flex-col items-center gap-4 z-10">
      <div className="relative w-14 h-14">
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-transparent border-t-white/70"
          animate={{ rotate: 360 }}
          transition={{ duration: 0.9, repeat: Infinity, ease: "linear" }}
        />
        <div className="absolute inset-0 flex items-center justify-center text-white/40 text-sm font-medium">
          {name[0].toUpperCase()}
        </div>
      </div>
      <p className="text-white/60 text-sm">{label[state] ?? "Loading…"}</p>
    </div>
  );
}

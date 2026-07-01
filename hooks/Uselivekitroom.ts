// /**
//  * useLiveKitRoom
//  *
//  * Manages a LiveKit room connection for the voice + LiveAvatar session.
//  *
//  * Flow:
//  *  1. POST /api/livekit/join { agent_id, room?, identity? }
//  *     → backend creates token + dispatches agentworker with avatar config
//  *  2. Connect to LiveKit room with token
//  *  3. Subscribe to remote tracks:
//  *     - Audio track  → plays agent voice
//  *     - Video track  → LiveAvatar lip-synced video (published by agentworker)
//  *  4. Publish local mic audio → agent hears user
//  *
//  * The avatar video track is attached to a <video> ref for display.
//  */

// "use client";

// import { useRef, useCallback, useState, useEffect } from "react";

// export type LiveKitRoomState =
//   | "idle"
//   | "connecting"
//   | "connected"
//   | "agent_joining"
//   | "avatar_ready"
//   | "disconnected"
//   | "error";

// export interface UseLiveKitRoomReturn {
//   videoRef: React.RefObject<HTMLVideoElement>;
//   state: LiveKitRoomState;
//   connect: (agentId: string, roomName?: string, userIdentity?: string) => Promise<void>;
//   disconnect: () => void;
//   isMicEnabled: boolean;
//   toggleMic: () => Promise<void>;
//   error: string | null;
//   roomName: string | null;
// }

// const API_URL   = process.env.NEXT_PUBLIC_API_URL   ?? "http://localhost:8000";
// const LK_URL    = process.env.NEXT_PUBLIC_LIVEKIT_URL ?? "ws://localhost:8000";

// export function useLiveKitRoom(): UseLiveKitRoomReturn {
//   const videoRef     = useRef<HTMLVideoElement>(null!);
//   const roomRef      = useRef<any>(null);
//   const localMicRef  = useRef<any>(null);

//   const [state, setState]           = useState<LiveKitRoomState>("idle");
//   const [isMicEnabled, setMicEnabled] = useState(false);
//   const [error, setError]           = useState<string | null>(null);
//   const [roomName, setRoomName]     = useState<string | null>(null);

//   // ── Connect ────────────────────────────────────────────────────────────────
//   const connect = useCallback(async (agentId: string, roomNameOverride?: string, userIdentityOverride?: string) => {
//     setState("connecting");
//     setError(null);

//     const baseUrl = typeof window !== "undefined" ? localStorage.getItem("voice_agent_server_url") || API_URL : API_URL;

//     try {
//       // 1. Get token + trigger agent dispatch
//       const res = await fetch(`${baseUrl}/api/livekit/join`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           agent_id: agentId,
//           room: roomNameOverride,
//           identity: userIdentityOverride || `user-${Math.random().toString(36).slice(2, 8)}`,
//           openai_key: typeof window !== "undefined" ? localStorage.getItem("voice_agent_openai_key") || "" : "",
//           anthropic_key: typeof window !== "undefined" ? localStorage.getItem("voice_agent_anthropic_key") || "" : "",
//           cartesia_key: typeof window !== "undefined" ? localStorage.getItem("voice_agent_cartesia_key") || "" : "",
//           liveavatar_key: typeof window !== "undefined" ? localStorage.getItem("voice_agent_liveavatar_key") || "" : "",
//           livekit_url: typeof window !== "undefined" ? localStorage.getItem("voice_agent_livekit_url") || "" : "",
//           livekit_key: typeof window !== "undefined" ? localStorage.getItem("voice_agent_livekit_key") || "" : "",
//           livekit_secret: typeof window !== "undefined" ? localStorage.getItem("voice_agent_livekit_secret") || "" : "",
//         }),
//       });

//       if (!res.ok) {
//         const err = await res.json().catch(() => ({}));
//         throw new Error(err.detail ?? `Join failed (${res.status})`);
//       }

//       const { token, room: assignedRoom, livekit_url } = await res.json();
//       setRoomName(assignedRoom);

//       // 2. Dynamically import LiveKit client (browser-only)
//       const { Room, RoomEvent, Track, createLocalAudioTrack } =
//         await import("livekit-client");

//       const room = new Room({
//         adaptiveStream: true,
//         dynacast: true,
//       });
//       roomRef.current = room;

//       // 3. Wire remote track events before connecting
//       room.on(RoomEvent.TrackSubscribed, (track: any, _pub: any, participant: any) => {
//         if (track.kind === Track.Kind.Video) {
//           // LiveAvatar publishes video — attach to our <video> element
//           if (videoRef.current) {
//             track.attach(videoRef.current);
//           }
//           setState("avatar_ready");
//         }
//       });

//       room.on(RoomEvent.TrackUnsubscribed, (track: any) => {
//         if (track.kind === Track.Kind.Video && videoRef.current) {
//           track.detach(videoRef.current);
//         }
//       });

//       room.on(RoomEvent.ParticipantConnected, (p: any) => {
//         // Agent or avatar joining — update state
//         if (state !== "avatar_ready") setState("agent_joining");
//       });

//       room.on(RoomEvent.Disconnected, () => {
//         setState("disconnected");
//         setMicEnabled(false);
//         roomRef.current = null;
//       });

//       room.on(RoomEvent.ConnectionStateChanged, (s: any) => {
//         if (s === "connected") setState("connected");
//       });

//       // 4. Connect to room
//       await room.connect(livekit_url ?? LK_URL, token);
//       setState("connected");

//       // 5. Publish mic audio so agent can hear user
//       const micTrack = await createLocalAudioTrack({
//         echoCancellation: true,
//         noiseSuppression: true,
//         autoGainControl: true,
//       });
//       localMicRef.current = micTrack;
//       await room.localParticipant.publishTrack(micTrack);
//       setMicEnabled(true);

//     } catch (err: any) {
//       console.error("[LiveKitRoom] connect error:", err);
//       setError(err?.message ?? "Connection failed");
//       setState("error");
//     }
//   }, []);

//   // ── Disconnect ────────────────────────────────────────────────────────────
//   const disconnect = useCallback(() => {
//     localMicRef.current?.stop();
//     localMicRef.current = null;
//     roomRef.current?.disconnect();
//     roomRef.current = null;
//     setMicEnabled(false);
//     setState("idle");
//     if (videoRef.current) videoRef.current.srcObject = null;
//   }, []);

//   // ── Toggle mic ────────────────────────────────────────────────────────────
//   const toggleMic = useCallback(async () => {
//     if (!localMicRef.current) return;
//     const enabled = !isMicEnabled;
//     await localMicRef.current.setEnabled(enabled);
//     setMicEnabled(enabled);
//   }, [isMicEnabled]);

//   useEffect(() => () => { disconnect(); }, []);

//   return { videoRef, state, connect, disconnect, isMicEnabled, toggleMic, error, roomName };
// }






// "use client";

// import { useRef, useCallback, useState, useEffect } from "react";

// export type LiveKitRoomState =
//   | "idle"
//   | "connecting"
//   | "connected"
//   | "agent_joining"
//   | "avatar_ready"
//   | "disconnected"
//   | "error";

// export interface UseLiveKitRoomReturn {
//   videoRef: React.RefObject<HTMLVideoElement>;
//   state: LiveKitRoomState;
//   connect: (agentId: string, roomName?: string, userIdentity?: string) => Promise<void>;
//   disconnect: () => void;
//   isMicEnabled: boolean;
//   toggleMic: () => Promise<void>;
//   error: string | null;
//   roomName: string | null;
// }

// const API_URL   = process.env.NEXT_PUBLIC_API_URL   ?? "http://localhost:8000";
// const LK_URL    = process.env.NEXT_PUBLIC_LIVEKIT_URL ?? "ws://localhost:8000";

// export function useLiveKitRoom(): UseLiveKitRoomReturn {
//   const videoRef     = useRef<HTMLVideoElement>(null!);
//   const roomRef      = useRef<any>(null);
//   const localMicRef  = useRef<any>(null);

//   const [state, setState]           = useState<LiveKitRoomState>("idle");
//   const [isMicEnabled, setMicEnabled] = useState(false);
//   const [error, setError]           = useState<string | null>(null);
//   const [roomName, setRoomName]     = useState<string | null>(null);

//   // ── Connect ────────────────────────────────────────────────────────────────
//   const connect = useCallback(async (agentId: string, roomNameOverride?: string, userIdentityOverride?: string) => {
//     setState("connecting");
//     setError(null);

//     const baseUrl = typeof window !== "undefined" ? localStorage.getItem("voice_agent_server_url") || API_URL : API_URL;

//     try {
//       // 1. Get token + trigger agent dispatch
//       const res = await fetch(`${baseUrl}/api/livekit/join`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           agent_id: agentId,
//           room: roomNameOverride,
//           identity: userIdentityOverride || `user-${Math.random().toString(36).slice(2, 8)}`,
//           openai_key: typeof window !== "undefined" ? localStorage.getItem("voice_agent_openai_key") || "" : "",
//           anthropic_key: typeof window !== "undefined" ? localStorage.getItem("voice_agent_anthropic_key") || "" : "",
//           cartesia_key: typeof window !== "undefined" ? localStorage.getItem("voice_agent_cartesia_key") || "" : "",
//           liveavatar_key: typeof window !== "undefined" ? localStorage.getItem("voice_agent_liveavatar_key") || "" : "",
//           livekit_url: typeof window !== "undefined" ? localStorage.getItem("voice_agent_livekit_url") || "" : "",
//           livekit_key: typeof window !== "undefined" ? localStorage.getItem("voice_agent_livekit_key") || "" : "",
//           livekit_secret: typeof window !== "undefined" ? localStorage.getItem("voice_agent_livekit_secret") || "" : "",
//         }),
//       });

//       if (!res.ok) {
//         const err = await res.json().catch(() => ({}));
//         throw new Error(err.detail ?? `Join failed (${res.status})`);
//       }

//       const { token, room: assignedRoom, livekit_url } = await res.json();
//       setRoomName(assignedRoom);

//       // 2. Dynamically import LiveKit client (browser-only)
//       const { Room, RoomEvent, Track, createLocalAudioTrack } =
//         await import("livekit-client");

//       const room = new Room({
//         adaptiveStream: true,
//         dynacast: true,
//       });
//       roomRef.current = room;

//       // 3. Wire remote track events before connecting
//       room.on(RoomEvent.TrackSubscribed, (track: any, _pub: any, participant: any) => {
//         if (track.kind === Track.Kind.Video) {
//           // LiveAvatar publishes video — attach to our <video> element
//           if (videoRef.current) {
//             track.attach(videoRef.current);
//           }
//           setState("avatar_ready");
//         } else if (track.kind === Track.Kind.Audio) {
//           // ── FIX: Attach the agent's incoming audio to the DOM ──
//           const audioElement = track.attach();
//           document.body.appendChild(audioElement);
//         }
//       });

//       room.on(RoomEvent.TrackUnsubscribed, (track: any) => {
//         if (track.kind === Track.Kind.Video && videoRef.current) {
//           track.detach(videoRef.current);
//         } else if (track.kind === Track.Kind.Audio) {
//           // ── FIX: Clean up the audio element when the track stops ──
//           track.detach().forEach((el: HTMLElement) => el.remove());
//         }
//       });

//       room.on(RoomEvent.ParticipantConnected, (p: any) => {
//         // Agent or avatar joining — update state
//         if (state !== "avatar_ready") setState("agent_joining");
//       });

//       room.on(RoomEvent.Disconnected, () => {
//         setState("disconnected");
//         setMicEnabled(false);
//         roomRef.current = null;
//       });

//       room.on(RoomEvent.ConnectionStateChanged, (s: any) => {
//         if (s === "connected") setState("connected");
//       });

//       // 4. Connect to room
//       await room.connect(livekit_url ?? LK_URL, token);
//       setState("connected");

//       // 5. Publish mic audio so agent can hear user
//       const micTrack = await createLocalAudioTrack({
//         echoCancellation: true,
//         noiseSuppression: true,
//         autoGainControl: true,
//       });
//       localMicRef.current = micTrack;
//       await room.localParticipant.publishTrack(micTrack);
//       setMicEnabled(true);

//     } catch (err: any) {
//       console.error("[LiveKitRoom] connect error:", err);
//       setError(err?.message ?? "Connection failed");
//       setState("error");
//     }
//   }, []);

//   // ── Disconnect ────────────────────────────────────────────────────────────
//   const disconnect = useCallback(() => {
//     localMicRef.current?.stop();
//     localMicRef.current = null;
//     roomRef.current?.disconnect();
//     roomRef.current = null;
//     setMicEnabled(false);
//     setState("idle");
//     if (videoRef.current) videoRef.current.srcObject = null;
//   }, []);

//   // ── Toggle mic ────────────────────────────────────────────────────────────
//   const toggleMic = useCallback(async () => {
//     if (!localMicRef.current) return;
//     const enabled = !isMicEnabled;
//     await localMicRef.current.setEnabled(enabled);
//     setMicEnabled(enabled);
//   }, [isMicEnabled]);

//   useEffect(() => () => { disconnect(); }, []);

//   return { videoRef, state, connect, disconnect, isMicEnabled, toggleMic, error, roomName };
// }

"use client";

import { useRef, useCallback, useState, useEffect } from "react";
import { Room, RoomEvent, RemoteTrack, Track } from "livekit-client";
export type LiveKitRoomState =
  | "idle"
  | "connecting"
  | "connected"
  | "agent_joining"
  | "avatar_ready"
  | "disconnected"
  | "error";

export interface UseLiveKitRoomReturn {
  videoRef: React.RefObject<HTMLVideoElement>;
  state: LiveKitRoomState;
  connect: (agentId: string, roomName?: string, userIdentity?: string) => Promise<void>;
  disconnect: () => void;
  isMicEnabled: boolean;
  toggleMic: () => Promise<void>;
  error: string | null;
  roomName: string | null;
  hasVideo: boolean;           // NEW: Know if video arrived
  isAgentSpeaking: boolean;    // NEW: Know when to animate waveform
}

const API_URL   = process.env.NEXT_PUBLIC_API_URL   ?? "http://localhost:8000";
const LK_URL    = process.env.NEXT_PUBLIC_LIVEKIT_URL ?? "ws://localhost:8000";

export function useLiveKitRoom(): UseLiveKitRoomReturn {
  const videoRef     = useRef<HTMLVideoElement>(null!);
  const roomRef      = useRef<any>(null);
  const localMicRef  = useRef<any>(null);

  const [state, setState]           = useState<LiveKitRoomState>("idle");
  const [isMicEnabled, setMicEnabled] = useState(false);
  const [error, setError]           = useState<string | null>(null);
  const [roomName, setRoomName]     = useState<string | null>(null);
  const [hasVideo, setHasVideo]     = useState<boolean>(false);
  const pendingVideoTrack = useRef<RemoteTrack | null>(null);  // ← ADD HERE, top level
  const [isAgentSpeaking, setIsAgentSpeaking] = useState<boolean>(false);

   useEffect(() => {
        if (state === "avatar_ready" && pendingVideoTrack.current && videoRef.current) {
          pendingVideoTrack.current.attach(videoRef.current);
          videoRef.current.play().catch(() => {});
        }
      }, [state]);
// Keep a reference to the video track so we can (re)attach when the element mounts
    const connect = useCallback(async (agentId: string, roomNameOverride?: string, userIdentityOverride?: string) => {
    setState("connecting");
    setError(null);
    setHasVideo(false);

    const baseUrl = typeof window !== "undefined" ? localStorage.getItem("voice_agent_server_url") || API_URL : API_URL;

    try {
      const res = await fetch(`${baseUrl}/api/livekit/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agent_id: agentId,
          room: roomNameOverride,
          identity: userIdentityOverride || `user-${Math.random().toString(36).slice(2, 8)}`,
          openai_key: typeof window !== "undefined" ? localStorage.getItem("voice_agent_openai_key") || "" : "",
          anthropic_key: typeof window !== "undefined" ? localStorage.getItem("voice_agent_anthropic_key") || "" : "",
          cartesia_key: typeof window !== "undefined" ? localStorage.getItem("voice_agent_cartesia_key") || "" : "",
          liveavatar_key: typeof window !== "undefined" ? localStorage.getItem("voice_agent_liveavatar_key") || "" : "",
          livekit_url: typeof window !== "undefined" ? localStorage.getItem("voice_agent_livekit_url") || "" : "",
          livekit_key: typeof window !== "undefined" ? localStorage.getItem("voice_agent_livekit_key") || "" : "",
          livekit_secret: typeof window !== "undefined" ? localStorage.getItem("voice_agent_livekit_secret") || "" : "",
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail ?? `Join failed (${res.status})`);
      }

      const { token, room: assignedRoom, livekit_url } = await res.json();
      setRoomName(assignedRoom);

      const { Room, RoomEvent, Track, createLocalAudioTrack } = await import("livekit-client");

      const room = new Room({
        adaptiveStream: true,
        dynacast: true,
      });
      roomRef.current = room;

      room.on(RoomEvent.TrackSubscribed, (track: any) => {
        if (track.kind === Track.Kind.Video) {
          if (videoRef.current) track.attach(videoRef.current);
          setHasVideo(true);
          setState("avatar_ready");
        } else if (track.kind === Track.Kind.Audio) {
          const audioElement = track.attach();
          document.body.appendChild(audioElement);
          // FIX: Allow the mic to activate if the agent is audio-only
          setState((prev) => prev === "agent_joining" || prev === "connecting" ? "avatar_ready" : prev);
        }
      });

      room.on(RoomEvent.TrackSubscribed, (track: RemoteTrack) => {
      if (track.kind === Track.Kind.Audio) {
        track.attach();
        return;
      }
      if (track.kind === Track.Kind.Video) {
        pendingVideoTrack.current = track;   // ← just USE it, no useRef here
        setHasVideo(true);
        setState("avatar_ready");
        if (videoRef.current) {
          track.attach(videoRef.current);
          videoRef.current.play().catch(() => {});
        }
      }
    });
  
     
      room.on(RoomEvent.TrackUnsubscribed, (track: any) => {
        if (track.kind === Track.Kind.Video) {
          if (videoRef.current) track.detach(videoRef.current);
          setHasVideo(false);
        } else if (track.kind === Track.Kind.Audio) {
          track.detach().forEach((el: HTMLElement) => el.remove());
        }
      });

      // ── Detect when the agent is speaking to animate the waveform ──
      room.on(RoomEvent.ActiveSpeakersChanged, (speakers: any[]) => {
        const remoteSpeaking = speakers.some((p) => p.identity !== room.localParticipant.identity);
        setIsAgentSpeaking(remoteSpeaking);
      });

      room.on(RoomEvent.ParticipantConnected, () => {
        if (state !== "avatar_ready") setState("agent_joining");
      });

      room.on(RoomEvent.Disconnected, () => {
        setState("disconnected");
        setMicEnabled(false);
        setHasVideo(false);
        setIsAgentSpeaking(false);
        roomRef.current = null;
      });

      room.on(RoomEvent.ConnectionStateChanged, (s: any) => {
        if (s === "connected") setState("connected");
      });

      await room.connect(livekit_url ?? LK_URL, token);
      setState("connected");

      const micTrack = await createLocalAudioTrack({
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      });
      localMicRef.current = micTrack;
      await room.localParticipant.publishTrack(micTrack);
      setMicEnabled(true);

    } catch (err: any) {
      console.error("[LiveKitRoom] connect error:", err);
      setError(err?.message ?? "Connection failed");
      setState("error");
    }
  }, []);

  const disconnect = useCallback(() => {
    localMicRef.current?.stop();
    localMicRef.current = null;
    roomRef.current?.disconnect();
    roomRef.current = null;
    setMicEnabled(false);
    setHasVideo(false);
    setIsAgentSpeaking(false);
    setState("idle");
    if (videoRef.current) videoRef.current.srcObject = null;
  }, []);

  const toggleMic = useCallback(async () => {
  if (!roomRef.current) return;
  const enabled = !isMicEnabled;
  await roomRef.current.localParticipant.setMicrophoneEnabled(enabled);
  setMicEnabled(enabled);
}, [isMicEnabled]);

  useEffect(() => () => { disconnect(); }, []);

  return { videoRef, state, connect, disconnect, isMicEnabled, toggleMic, error, roomName, hasVideo, isAgentSpeaking };
}

// "use client";

// import React, { useEffect, useState, use } from "react";
// import { Mic, AlertTriangle } from "lucide-react";
// import { apiClient } from "@/lib/api/client";
// import { useAgentStore } from "@/store";
// import { ConversationView } from "@/components/avatar/ConversationView";
// import type { Agent } from "@/types";

// export default function WidgetPage({ params }: { params: Promise<{ id: string }> }) {
//   const { id } = use(params);
//   const { agents } = useAgentStore();
//   const [agent, setAgent] = useState<Agent | null>(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     loadAgent();
//   }, [id]);

//   const loadAgent = async () => {
//     setIsLoading(true);
//     setError(null);
//     try {
//       const data = await apiClient.get<Agent>(`/api/agents/${id}`);
//       setAgent(data);
//     } catch (err) {
//       console.warn("Failed to load agent for widget from API, searching local store", err);
//       const localAgent = agents.find((a) => a.id === id);
//       if (localAgent) {
//         setAgent(localAgent);
//       } else {
//         setError("Voice assistant configuration could not be loaded.");
//       }
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   if (isLoading) {
//     return (
//       <div className="flex flex-col items-center justify-center h-screen bg-white/40 text-slate-400 gap-3">
//         <div className="w-8 h-8 border-3 border-[#424874] border-t-transparent rounded-full animate-spin" />
//         <span className="text-xs font-semibold">Connecting to voice agent...</span>
//       </div>
//     );
//   }

//   if (error || !agent) {
//     return (
//       <div className="flex flex-col items-center justify-center h-screen p-6 bg-white/40 text-center text-slate-500 space-y-4">
//         <AlertTriangle size={24} className="text-amber-500" />
//         <div className="space-y-1">
//           <p className="text-xs font-bold text-slate-800">Connection Interrupted</p>
//           <p className="text-[10px] text-slate-400">{error || "Agent configuration missing."}</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="h-screen w-screen overflow-hidden bg-gradient-to-br from-[#F4EEFF] via-[#E2DBF0]/30 to-[#DCD6F7]/20 flex flex-col">
//       {/* Mini clean widget header */}
//       <div className="flex-none px-4 py-3 border-b border-slate-200/50 flex items-center justify-between bg-white/80 backdrop-blur-md shadow-sm">
//         <div className="flex items-center gap-2">
//           <div className="w-4 h-4 rounded-full bg-[#424874] flex items-center justify-center shadow-sm">
//             <Mic size={9} className="text-white" />
//           </div>
//           <span className="text-xs font-extrabold text-slate-800">{agent.name}</span>
//         </div>
//         <span className="text-[9px] text-[#424874] font-extrabold uppercase tracking-wider bg-[#DCD6F7] px-2 py-0.5 rounded-full shadow-sm">
//           Realtime
//         </span>
//       </div>

//       {/* Embedded ConversationView */}
//       <div className="flex-1 min-h-0 bg-white/20">
//         <ConversationView agent={agent} />
//       </div>
//     </div>
//   );
// }

// app/widget/[agentId]/page.tsx
"use client";

import { use } from "react";
import { useSearchParams } from "next/navigation";
import { ConversationView } from "../conversationview";

interface PageProps {
  params: Promise<{ agentId: string }>;
}

export default function WidgetEmbedPage({ params }: PageProps) {
  const { agentId } = use(params);
  const searchParams = useSearchParams();

  // Extract query parameters passed by widget.js
  const roomName = searchParams.get("room");
  const userIdentity = searchParams.get("identity");

  // Fallback generation to prevent the application from sending undefined strings to FastAPI
  const activeRoom =
    roomName && roomName !== "undefined"
      ? roomName
      : `room_${agentId}_${Date.now()}`;

  const activeIdentity =
    userIdentity && userIdentity !== "undefined"
      ? userIdentity
      : `user_${Math.random().toString(36).substring(7)}`;

  // Mock agent configuration object fetched or mapped by ID

  const agentMock: any = {
    id: agentId,
    name: "AI Assistant",
    slug: `agent-${agentId}`,
    system_prompt: "",
    language: "en",
    llm_provider: "openai",
    model: "gpt-4",
    avatar_type: "3d",
    avatar_url: "/placeholder.glb",
    avatar_config: {},
  };

  return (
    <div className="w-screen h-screen overflow-hidden">
      <ConversationView
        agent={agentMock}
        roomName={activeRoom}
        userIdentity={activeIdentity}
      />
    </div>
  );
}

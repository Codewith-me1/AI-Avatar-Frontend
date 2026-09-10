"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  Search,
  Plus,
  Trash2,
  Settings,
  Mic,
  ChevronLeft,
  Check,
  Play,
  Pause,
  Monitor,
  Smartphone,
  Send,
  Upload,
  Type,
  Globe,
  X,
  Copy,
  Code2,
  ChevronDown,
  Info,
  Loader2,
  Video,
  Link2,
  AlertCircle,
  CheckCircle2,
  FileText,
  SlidersHorizontal,
  Blocks,
  Sparkles,
} from "lucide-react";
import { apiClient } from "@/lib/api/client";
import { useAgentStore } from "@/store";
import { useToast } from "@/components/widget/Toast";
import {
  MUSETALK_AVATARS,
  CARTESIA_VOICES,
  LANGUAGES,
  PERSONALITIES,
} from "@/lib/catalog";
import type { Agent } from "@/types";

// ── Templates (prefill the wizard) ───────────────────────────────────────────
interface Template {
  name: string;
  tagline: string;
  avatar: string;
  musetalk_avatar_id: string;
  voice_id: string;
  personality: string;
  system_prompt: string;
}

const TEMPLATES: Template[] = [
  {
    name: "Lila",
    tagline: "A witty brand ambassador that brings your brand to life",
    avatar: "/avatars/Ava.png",
    musetalk_avatar_id: "ava",
    voice_id: "db6b0ed5-d5d3-463d-ae85-518a07d3c2b4",
    personality: "Playful and Witty",
    system_prompt:
      "You are Lila, a witty and charismatic brand ambassador. Bring the brand's personality to life, answer questions with warmth and humor, and keep replies short and lively.",
  },
  {
    name: "Alex",
    tagline: "Laid-back guide who helps you plan trips with insider tips",
    avatar: "/avatars/theo.png",
    musetalk_avatar_id: "theo",
    voice_id: "79f8b5fb-2cc8-479a-80df-29f7a7cf1a3e",
    personality: "Friendly and Professional",
    system_prompt:
      "You are Alex, a laid-back, well-traveled guide. Help users plan trips with insider tips and cultural notes. Keep it friendly and conversational.",
  },
  {
    name: "Emma",
    tagline: "Master of role-play, ready for any scene — smooth and fun",
    avatar: "/avatars/maya.png",
    musetalk_avatar_id: "maya",
    voice_id: "db6b0ed5-d5d3-463d-ae85-518a07d3c2b4",
    personality: "Warm and Empathetic",
    system_prompt:
      "You are Emma, a master of role-play ready for any scene. Make demos smooth, fun, and engaging while staying helpful and on-topic.",
  },
  {
    name: "Jack",
    tagline: "Tech-savvy SDR who makes sales chats effortless",
    avatar: "/avatars/sidharth.png",
    musetalk_avatar_id: "sidhart",
    voice_id: "47c38ca4-5f35-497b-b1a3-415245fb35e1",
    personality: "Energetic and Persuasive",
    system_prompt:
      "You are Jack, a tech-savvy sales development rep. Make sales chats effortless — qualify needs, highlight value, and guide toward a booked demo.",
  },
];

const ALLOWED_EXT = [".pdf", ".txt", ".md", ".docx"];
const ALLOWED_EXT_LABEL = "PDF, TXT, MD, DOCX";
const MAX_FILE_MB = 20;
const CRAWL_DONE = new Set(["ready", "error", "failed"]);

const avatarPreview = (musetalkId: string) =>
  MUSETALK_AVATARS.find((a) => a.id === musetalkId)?.preview_url ||
  "/avatars/Ava.png";

// ── Page ─────────────────────────────────────────────────────────────────────
export default function AgentsPage() {
  const { agents, setAgents, removeAgent, isLoading, setLoading } =
    useAgentStore();
  const { showToast } = useToast();
  const [query, setQuery] = useState("");
  const [wizard, setWizard] = useState<{ open: boolean; template?: Template }>({
    open: false,
  });
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadAgents = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiClient.get<Agent[]>("/api/agents/");
      setAgents((data || []).filter((a) => !a.id.startsWith("demo-")));
    } catch {
      setAgents([]);
    } finally {
      setLoading(false);
    }
  }, [setAgents, setLoading]);

  useEffect(() => {
    loadAgents();
  }, [loadAgents]);

  // Open the wizard when arriving with ?new=1 (from Home / sidebar).
  useEffect(() => {
    if (typeof window === "undefined") return;
    const q = new URLSearchParams(window.location.search);
    if (q.get("new") === "1") {
      setWizard({ open: true });
      window.history.replaceState({}, "", "/dashboard/agents");
    }
  }, []);

  const handleDelete = async (id: string) => {
    setDeleting(true);
    try {
      await apiClient.delete(`/api/agents/${id}`);
      removeAgent(id);
      showToast({ type: "success", title: "Agent deleted" });
    } catch {
      showToast({ type: "error", title: "Delete failed", message: "Try again." });
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  };

  const filtered = agents.filter((a) =>
    a.name.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div className="p-8! md:p-10! max-w-[1320px] mx-auto! w-full!">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-3! mb-8!">
        <div className="relative flex-1 min-w-[220px] max-w-[420px]!">
          <Search
            size={16}
            className="absolute left-3.5! top-1/2 -translate-y-1/2 text-[var(--muted)]"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search agents…"
            className="fld pl-10! pr-4! py-2.5!"
          />
        </div>
        <button
          onClick={() => setWizard({ open: true })}
          className="btn-dark px-4! py-2.5! text-[13.5px] ml-auto"
        >
          <Plus size={16} /> New agent
        </button>
      </div>

      {/* Templates */}
      <h2 className="text-[15px] font-semibold text-[var(--ink)] mb-3.5!">
        Agent templates
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4! mb-10!">
        {TEMPLATES.map((t) => (
          <button
            key={t.name}
            onClick={() => setWizard({ open: true, template: t })}
            className="group text-left bg-white border border-[var(--line)] rounded-2xl overflow-hidden shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] hover:border-[var(--violet-100)] transition-all"
          >
            <div className="relative aspect-[16/10] bg-[var(--line-soft)] overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={t.avatar}
                alt={t.name}
                className="w-full! h-full! object-cover"
              />
              <span className="absolute inset-0 grid place-items-center bg-black/0 group-hover:bg-black/25 transition-colors">
                <span className="text-white text-[12px] font-semibold opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 px-3! py-1.5! rounded-lg">
                  Use template
                </span>
              </span>
            </div>
            <div className="p-4!">
              <p className="text-[14.5px] font-semibold text-[var(--ink)]">
                {t.name}
              </p>
              <p className="text-[12.5px] text-[var(--slate)] mt-1! line-clamp-2 leading-snug">
                {t.tagline}
              </p>
            </div>
          </button>
        ))}
      </div>

      {/* My Agents */}
      <h2 className="text-[15px] font-semibold text-[var(--ink)] mb-3.5!">
        My Agents{" "}
        <span className="text-[var(--muted)] font-normal">
          ({filtered.length})
        </span>
      </h2>

      {isLoading ? (
        <div className="grid place-items-center py-20!">
          <div className="w-8! h-8! border-2 border-[var(--line)] border-t-[var(--violet)] rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-[var(--line)] rounded-2xl shadow-[var(--shadow-sm)] grid place-items-center text-center py-16! px-6!">
          <span className="w-12! h-12! rounded-2xl grid place-items-center bg-[var(--violet-050)] text-[var(--violet-700)] border border-[var(--violet-100)] mb-3!">
            <Sparkles size={22} />
          </span>
          <p className="text-[15px] font-semibold text-[var(--ink)]">
            {query ? "No agents match your search" : "No agents yet"}
          </p>
          <p className="text-[13px] text-[var(--slate)] mt-1!">
            {query
              ? "Try a different name."
              : "Create your first agent or start from a template above."}
          </p>
          {!query && (
            <button
              onClick={() => setWizard({ open: true })}
              className="btn-dark px-4! py-2.5! text-[13.5px] mt-5!"
            >
              <Plus size={16} /> New agent
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4!">
          {filtered.map((a, i) => (
            <AgentCard
              key={a.id}
              agent={a}
              index={i}
              onDelete={() => setDeleteId(a.id)}
            />
          ))}
        </div>
      )}

      {/* Delete modal */}
      {deleteId &&
        createPortal(
          <div className="fixed! inset-0! z-[9999] flex items-center justify-center bg-black/55 backdrop-blur-sm p-4!">
            <div className="w-full max-w-md! bg-white rounded-2xl shadow-2xl ring-1 ring-black/5 overflow-hidden">
              <div className="flex items-start gap-4! border-b border-[var(--line)] px-6! py-5!">
                <div className="w-11! h-11! shrink-0 grid place-items-center rounded-full bg-red-100 text-red-600">
                  <Trash2 size={18} />
                </div>
                <div>
                  <h3 className="text-[16px] font-semibold text-[var(--ink)]">
                    Delete agent
                  </h3>
                  <p className="text-[13px] text-[var(--slate)] mt-1!">
                    This permanently removes the agent and its knowledge. This
                    can&apos;t be undone.
                  </p>
                </div>
              </div>
              <div className="flex justify-end gap-3! bg-[var(--sidebar)] px-6! py-4!">
                <button
                  disabled={deleting}
                  onClick={() => setDeleteId(null)}
                  className="rounded-lg border border-[var(--line)] bg-white px-4! py-2! text-[13px] font-medium text-[var(--slate)] hover:bg-[var(--sidebar-hover)] transition disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  disabled={deleting}
                  onClick={() => handleDelete(deleteId)}
                  className="inline-flex items-center gap-2! rounded-lg bg-red-600 px-4! py-2! text-[13px] font-semibold text-white hover:bg-red-700 transition disabled:bg-red-400"
                >
                  {deleting && <Loader2 size={14} className="animate-spin" />}
                  {deleting ? "Deleting…" : "Delete"}
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}

      {/* Wizard overlay */}
      <AnimatePresence>
        {wizard.open && (
          <CreateWizard
            template={wizard.template}
            onClose={() => setWizard({ open: false })}
            onCreated={() => {
              setWizard({ open: false });
              loadAgents();
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Agent card ───────────────────────────────────────────────────────────────
function AgentCard({
  agent,
  index,
  onDelete,
}: {
  agent: Agent;
  index: number;
  onDelete: () => void;
}) {
  const preview = avatarPreview(agent.musetalk_avatar_id || "ava");
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      className="group bg-white border border-[var(--line)] rounded-2xl overflow-hidden shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] hover:border-[var(--violet-100)] transition-all flex flex-col"
    >
      <div className="relative aspect-[16/10] bg-[var(--line-soft)] overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={preview} alt={agent.name} className="w-full! h-full! object-cover" />
        <div className="absolute top-2.5! right-2.5! flex gap-1.5! opacity-0 group-hover:opacity-100 transition-opacity">
          <Link href={`/dashboard/agents/${agent.id}`}>
            <span className="w-8! h-8! rounded-lg grid place-items-center bg-white/90 backdrop-blur text-[var(--slate)] hover:text-[var(--violet-700)] shadow-sm transition-colors">
              <Settings size={14} />
            </span>
          </Link>
          <button
            onClick={onDelete}
            className="w-8! h-8! rounded-lg grid place-items-center bg-white/90 backdrop-blur text-[var(--slate)] hover:text-red-600 shadow-sm transition-colors"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
      <div className="p-4! flex-1 flex flex-col">
        <p className="text-[14.5px] font-semibold text-[var(--ink)] leading-tight truncate">
          {agent.name}
        </p>
        <p className="text-[12.5px] text-[var(--slate)] mt-1! line-clamp-2 leading-snug flex-1">
          {agent.description || "No description provided."}
        </p>
        <Link href={`/dashboard/agents/${agent.id}/test`} className="mt-3.5! block">
          <span className="flex items-center justify-center gap-2! w-full! py-2! bg-[var(--violet-050)] hover:bg-[var(--violet-100)] text-[var(--violet-700)] font-semibold text-[12.5px] rounded-lg border border-[var(--violet-100)] transition-colors">
            <Mic size={13} /> Launch sandbox
          </span>
        </Link>
      </div>
    </motion.div>
  );
}

// ── Create wizard ────────────────────────────────────────────────────────────
type Tab = "Avatar" | "Voice" | "Behavior" | "Knowledge" | "Conversation";
const TABS: Tab[] = ["Avatar", "Voice", "Behavior", "Knowledge", "Conversation"];

interface StagedFile {
  file: File;
  error?: string;
}

function CreateWizard({
  template,
  onClose,
  onCreated,
}: {
  template?: Template;
  onClose: () => void;
  onCreated: () => void;
}) {
  const { showToast } = useToast();
  const [tab, setTab] = useState<Tab>("Avatar");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [phase, setPhase] = useState<"edit" | "embed">("edit");
  const [createdId, setCreatedId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const [form, setForm] = useState({
    name: template?.name ?? "",
    description: "",
    musetalk_avatar_id: template?.musetalk_avatar_id ?? "ava",
    language: "en",
    voice_id: template?.voice_id ?? "",
    pronunciation: false,
    agent_role: "",
    personality: template?.personality ?? PERSONALITIES[0],
    system_prompt:
      template?.system_prompt ??
      "You are a professional, friendly AI assistant. Help users clearly and concisely. Ask a clarifying question when you're unsure.",
    llm_model: "gpt-4o",
    llm_provider: "openai",
    knowledge_mode: "hybrid" as "hybrid" | "strict",
    creativity: 0.4,
    // conversation
    enable_camera: true,
    topics: [] as string[],
    max_words: null as number | null,
    feedback_screen: false,
    agent_memory: false,
    share_memory: false,
  });
  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((p) => ({ ...p, [k]: v }));

  // Staged knowledge (flushed to the KB after the agent is created)
  const [stagedFiles, setStagedFiles] = useState<StagedFile[]>([]);
  const [stagedText, setStagedText] = useState("");
  const [stagedUrl, setStagedUrl] = useState("");

  // Voice preview
  const [playing, setPlaying] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  useEffect(() => () => audioRef.current?.pause(), []);
  const togglePreview = (id: string, url: string) => {
    if (playing === id) {
      audioRef.current?.pause();
      setPlaying(null);
      return;
    }
    audioRef.current?.pause();
    const audio = new Audio(url.replace(/^\.?\/*/, "/"));
    audioRef.current = audio;
    setPlaying(id);
    audio.play().catch(() => setPlaying(null));
    audio.onended = () => setPlaying(null);
    audio.onerror = () => setPlaying(null);
  };

  const composePrompt = () => {
    const pre: string[] = [];
    if (form.agent_role.trim()) pre.push(`Your role: ${form.agent_role.trim()}.`);
    if (form.personality) pre.push(`Your personality: ${form.personality}.`);
    const post: string[] = [];
    if (form.topics.length)
      post.push(`Never discuss these topics: ${form.topics.join(", ")}.`);
    if (form.max_words)
      post.push(`Keep every response under ${form.max_words} words.`);
    return [pre.join(" "), form.system_prompt.trim(), post.join(" ")]
      .filter(Boolean)
      .join("\n\n");
  };

  const flushKnowledge = async (agentId: string) => {
    const hasKnowledge =
      stagedFiles.some((f) => !f.error) || stagedText.trim() || stagedUrl.trim();
    if (!hasKnowledge) return;
    try {
      const kb = await apiClient.post<{ id: string }>(
        `/api/knowledge/agents/${agentId}/kb/`,
        { name: "Main Knowledge Base", description: "Auto-created knowledge base" },
      );
      const kbId = kb?.id;
      // Files
      for (const sf of stagedFiles) {
        if (sf.error) continue;
        const fd = new FormData();
        fd.append("file", sf.file);
        await apiClient
          .postForm(`/api/knowledge/agents/${agentId}/kb/${kbId}/documents`, fd)
          .catch(() => {});
      }
      // Pasted text
      if (stagedText.trim()) {
        const blob = new Blob([stagedText], { type: "text/plain" });
        const fd = new FormData();
        fd.append("file", blob, "pasted_text.txt");
        await apiClient
          .postForm(`/api/knowledge/agents/${agentId}/kb/${kbId}/documents`, fd)
          .catch(() => {});
      }
      // Website crawl
      if (stagedUrl.trim()) {
        await apiClient
          .post(`/api/knowledge/agents/${agentId}/kb/from-url`, {
            url: stagedUrl.trim(),
            restrict_to_knowledge: form.knowledge_mode === "strict",
          })
          .catch(() => {});
      }
    } catch {
      /* best-effort — agent is created regardless */
    }
  };

  const handleCreate = async () => {
    if (!form.name.trim()) {
      setTab("Avatar");
      setError("Give your agent a name first.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        language: form.language,
        voice_id: form.voice_id,
        system_prompt: composePrompt(),
        llm_model: form.llm_model,
        llm_provider: form.llm_provider,
        is_public: true,
        avatar_id: "",
        musetalk_avatar_id: form.musetalk_avatar_id,
      };
      const res = await apiClient.post<{ id: string }>("/api/agents/", payload);
      const id = res?.id ?? "";
      setCreatedId(id);
      await flushKnowledge(id);
      setPhase("embed");
      showToast({ type: "success", title: "Agent created" });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create agent.");
    } finally {
      setSaving(false);
    }
  };

  const goNext = () => {
    const i = TABS.indexOf(tab);
    if (i < TABS.length - 1) setTab(TABS[i + 1]);
    else handleCreate();
  };
  const goBack = () => {
    const i = TABS.indexOf(tab);
    if (i > 0) setTab(TABS[i - 1]);
  };

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const embedCode = `<!-- AVAT Avatar embeddable widget -->
<script src="${origin}/components/widget/widget.js" async></script>
<script>
  window.VoiceAgentConfig = {
    agentId: "${createdId}",
    apiUrl: "${origin}"
  };
</script>`;

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed! inset-0! z-[9998] bg-white flex flex-col"
    >
      {/* Top bar */}
      <header className="h-[64px]! shrink-0 border-b border-[var(--line)] flex items-center px-4! md:px-6! gap-4!">
        <button
          onClick={onClose}
          className="w-9! h-9! grid place-items-center rounded-lg text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--sidebar-hover)] transition-colors shrink-0"
        >
          <ChevronLeft size={20} />
        </button>
        <div className="min-w-0">
          <p className="text-[15px] font-semibold text-[var(--ink)] leading-tight truncate">
            {form.name || "New agent"}
          </p>
          <p className="text-[12px] text-[var(--muted)] leading-tight truncate">
            {form.description || "Add a description…"}
          </p>
        </div>

        {phase === "edit" && (
          <>
            <nav className="hidden lg:flex items-center gap-1! mx-auto!">
              {TABS.map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`px-3.5! py-2! rounded-lg text-[13.5px] font-semibold transition-colors ${
                    tab === t
                      ? "text-[var(--violet-700)]"
                      : "text-[var(--slate)] hover:text-[var(--ink)]"
                  }`}
                >
                  {t}
                  {tab === t && (
                    <motion.span
                      layoutId="wizard-tab"
                      className="block h-[2px]! rounded-full mt-1!"
                      style={{ background: "var(--grad)" }}
                    />
                  )}
                </button>
              ))}
            </nav>
            <div className="flex items-center gap-2! ml-auto lg:ml-0 shrink-0">
              <button
                onClick={onClose}
                className="px-4! py-2! rounded-lg border border-[var(--line)] text-[13.5px] font-semibold text-[var(--slate)] hover:bg-[var(--sidebar-hover)] transition-colors"
              >
                Cancel
              </button>
              {tab !== "Avatar" && (
                <button
                  onClick={goBack}
                  className="px-4! py-2! rounded-lg border border-[var(--line)] text-[13.5px] font-semibold text-[var(--slate)] hover:bg-[var(--sidebar-hover)] transition-colors"
                >
                  Back
                </button>
              )}
              <button
                onClick={goNext}
                disabled={saving}
                className="btn-dark px-5! py-2! text-[13.5px]"
              >
                {saving
                  ? "Creating…"
                  : tab === "Conversation"
                    ? "Create agent"
                    : "Next"}
              </button>
            </div>
          </>
        )}
      </header>

      {/* Body */}
      {phase === "embed" ? (
        <EmbedScreen
          code={embedCode}
          copied={copied}
          onCopy={() => {
            navigator.clipboard.writeText(embedCode);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          }}
          onDone={onCreated}
        />
      ) : (
        <div className="flex-1 min-h-0 flex">
          {/* Left: settings */}
          <div className="flex-1 min-w-0 overflow-y-auto px-6! md:px-10! py-8!">
            <div className="max-w-[620px]! mx-auto!">
              {/* mobile tab pills */}
              <div className="lg:hidden flex gap-1.5! overflow-x-auto no-scrollbar mb-6! pb-1!">
                {TABS.map((t) => (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    className={`px-3! py-1.5! rounded-lg text-[13px] font-semibold whitespace-nowrap transition-colors ${
                      tab === t
                        ? "bg-[var(--ink)] text-white"
                        : "bg-[var(--sidebar)] text-[var(--slate)]"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>

              {error && (
                <div className="flex items-center gap-2! text-[13px] text-red-600 bg-red-50 border border-red-200 rounded-xl px-4! py-3! mb-6!">
                  <AlertCircle size={15} className="shrink-0" /> {error}
                </div>
              )}

              {tab === "Avatar" && (
                <AvatarTab form={form} set={set} />
              )}
              {tab === "Voice" && (
                <VoiceTab
                  form={form}
                  set={set}
                  playing={playing}
                  togglePreview={togglePreview}
                />
              )}
              {tab === "Behavior" && <BehaviorTab form={form} set={set} />}
              {tab === "Knowledge" && (
                <KnowledgeTab
                  form={form}
                  set={set}
                  stagedFiles={stagedFiles}
                  setStagedFiles={setStagedFiles}
                  stagedText={stagedText}
                  setStagedText={setStagedText}
                  stagedUrl={stagedUrl}
                  setStagedUrl={setStagedUrl}
                />
              )}
              {tab === "Conversation" && <ConversationTab form={form} set={set} />}
            </div>
          </div>

          {/* Right: live preview */}
          <AgentPreview
            name={form.name || "Your agent"}
            avatarUrl={avatarPreview(form.musetalk_avatar_id)}
          />
        </div>
      )}
    </motion.div>,
    document.body,
  );
}

// ── Wizard tabs ──────────────────────────────────────────────────────────────
/* eslint-disable @typescript-eslint/no-explicit-any */
function SectionHead({ title, desc }: { title: string; desc?: string }) {
  return (
    <div className="mb-6!">
      <h2 className="text-[20px] font-semibold text-[var(--ink)] tracking-tight">
        {title}
      </h2>
      {desc && <p className="text-[13.5px] text-[var(--slate)] mt-1!">{desc}</p>}
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-[13px] font-semibold text-[var(--ink)] mb-1.5!">
      {children}
    </label>
  );
}

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!on)}
      className={`relative w-11! h-6! rounded-full transition-colors shrink-0 ${
        on ? "bg-[var(--ink)]" : "bg-[var(--line)]"
      }`}
    >
      <span
        className={`absolute top-0.5! left-0.5! w-5! h-5! rounded-full bg-white shadow transition-transform ${
          on ? "translate-x-5" : ""
        }`}
      />
    </button>
  );
}

function AvatarTab({ form, set }: any) {
  const [filter, setFilter] = useState<"all" | "video" | "photo">("all");
  const list = MUSETALK_AVATARS.filter(
    (a) => filter === "all" || a.kind === filter,
  );
  return (
    <div>
      <SectionHead
        title="Avatar"
        desc="Pick the face your agent wears in the widget."
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4! mb-7!">
        <div>
          <Label>Agent name</Label>
          <input
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            placeholder="e.g. Support Desk"
            className="fld px-3.5! py-2.5!"
          />
        </div>
        <div>
          <Label>Short description</Label>
          <input
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            placeholder="What does this agent do?"
            className="fld px-3.5! py-2.5!"
          />
        </div>
      </div>

      <div className="inline-flex items-center gap-1! bg-[var(--sidebar)] border border-[var(--line)] rounded-xl p-1! mb-5!">
        {(
          [
            { key: "all", label: "All" },
            { key: "video", label: "Video Avatars" },
            { key: "photo", label: "Photo Avatars" },
          ] as const
        ).map((t) => (
          <button
            key={t.key}
            onClick={() => setFilter(t.key)}
            className={`px-3! py-1.5! rounded-lg text-[12.5px] font-semibold transition-colors ${
              filter === t.key
                ? "bg-[var(--ink)] text-white"
                : "text-[var(--slate)] hover:bg-[var(--sidebar-hover)]"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <p className="text-[13px] text-[var(--muted)] py-8! text-center">
          No {filter} avatars available.
        </p>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3!">
          {list.map((a) => {
            const selected = form.musetalk_avatar_id === a.id;
            return (
              <button
                key={a.id}
                onClick={() => set("musetalk_avatar_id", a.id)}
                className={`relative rounded-xl overflow-hidden border-2 transition-all ${
                  selected
                    ? "border-[var(--violet)] ring-2 ring-[var(--violet-100)]"
                    : "border-transparent hover:border-[var(--line)]"
                }`}
              >
                <div className="aspect-[3/4] bg-[var(--line-soft)]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={a.preview_url}
                    alt={a.name}
                    className="w-full! h-full! object-cover"
                  />
                </div>
                {selected && (
                  <span
                    className="absolute top-1.5! right-1.5! w-5! h-5! rounded-full grid place-items-center text-white"
                    style={{ background: "var(--grad)" }}
                  >
                    <Check size={11} strokeWidth={3} />
                  </span>
                )}
                <span className="absolute bottom-1.5! left-1.5! text-[10px] font-semibold text-white bg-black/55 px-1.5! py-0.5! rounded">
                  {a.name}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function VoiceTab({ form, set, playing, togglePreview }: any) {
  const selectedVoice = CARTESIA_VOICES.find((v) => v.id === form.voice_id);
  return (
    <div>
      <SectionHead
        title="Voice settings"
        desc="Configure your agent's voice and language."
      />
      <div className="space-y-5!">
        <div>
          <Label>Language</Label>
          <div className="relative">
            <select
              value={form.language}
              onChange={(e) => set("language", e.target.value)}
              className="fld appearance-none px-3.5! py-2.5! pr-10!"
            >
              {LANGUAGES.map((l) => (
                <option key={l.value} value={l.value}>
                  {l.flag} {l.label}
                </option>
              ))}
            </select>
            <ChevronDown
              size={16}
              className="absolute right-3.5! top-1/2 -translate-y-1/2 pointer-events-none text-[var(--muted)]"
            />
          </div>
        </div>

        <div>
          <Label>Voice</Label>
          <div className="relative">
            <select
              value={form.voice_id}
              onChange={(e) => set("voice_id", e.target.value)}
              className="fld appearance-none px-3.5! py-2.5! pr-10!"
            >
              <option value="">Select a voice…</option>
              {CARTESIA_VOICES.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name} — {v.description}
                </option>
              ))}
            </select>
            <ChevronDown
              size={16}
              className="absolute right-3.5! top-1/2 -translate-y-1/2 pointer-events-none text-[var(--muted)]"
            />
          </div>
          {selectedVoice && (
            <button
              onClick={() => togglePreview(selectedVoice.id, selectedVoice.previewUrl)}
              className="mt-3! inline-flex items-center gap-2! text-[13px] font-semibold text-[var(--violet-700)] hover:text-[var(--violet-600)] transition-colors"
            >
              {playing === selectedVoice.id ? (
                <Pause size={14} fill="currentColor" />
              ) : (
                <Play size={14} fill="currentColor" />
              )}
              {playing === selectedVoice.id ? "Stop preview" : "Preview voice"}
            </button>
          )}
        </div>

        <div className="flex items-center justify-between gap-4! bg-white border border-[var(--line)] rounded-xl px-4! py-3.5!">
          <div>
            <p className="text-[13.5px] font-semibold text-[var(--ink)]">
              Pronunciation dictionary
            </p>
            <p className="text-[12px] text-[var(--muted)] mt-0.5!">
              Define how specific words, names, or acronyms are pronounced.
            </p>
          </div>
          <Toggle on={form.pronunciation} onChange={(v) => set("pronunciation", v)} />
        </div>
      </div>
    </div>
  );
}

function BehaviorTab({ form, set }: any) {
  const SYSTEM_TOOLS = [
    { name: "skip_turn", note: "Provided by AVAT" },
    { name: "end_call", note: "Provided by AVAT" },
  ];
  return (
    <div>
      <SectionHead
        title="Set your agent behavior"
        desc="Describe the desired tone, tool usage, and response style."
      />
      <div className="space-y-5!">
        <div>
          <Label>
            Agent role{" "}
            <span className="text-[var(--muted)] font-normal">(optional)</span>
          </Label>
          <input
            value={form.agent_role}
            onChange={(e) => set("agent_role", e.target.value)}
            placeholder="e.g. Customer success manager"
            className="fld px-3.5! py-2.5!"
          />
        </div>

        <div>
          <Label>Personality</Label>
          <div className="relative">
            <select
              value={form.personality}
              onChange={(e) => set("personality", e.target.value)}
              className="fld appearance-none px-3.5! py-2.5! pr-10!"
            >
              {PERSONALITIES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
            <ChevronDown
              size={16}
              className="absolute right-3.5! top-1/2 -translate-y-1/2 pointer-events-none text-[var(--muted)]"
            />
          </div>
        </div>

        <div>
          <Label>Agent prompt</Label>
          <textarea
            value={form.system_prompt}
            onChange={(e) => set("system_prompt", e.target.value)}
            rows={7}
            maxLength={20000}
            placeholder="Tell the agent who it is, how to talk, and its boundaries…"
            className="fld px-3.5! py-3! resize-y leading-relaxed"
          />
          <p className="text-right text-[11px] text-[var(--muted)] mt-1!">
            {form.system_prompt.length}/20000
          </p>
        </div>

        <div>
          <p className="text-[13px] font-semibold text-[var(--ink)] mb-2!">
            During conversation tools
          </p>
          <div className="space-y-2!">
            {SYSTEM_TOOLS.map((t) => (
              <div
                key={t.name}
                className="flex items-center justify-between bg-white border border-[var(--line)] rounded-xl px-4! py-3!"
              >
                <span className="flex items-center gap-2.5! text-[13.5px] font-medium text-[var(--ink)]">
                  <span className="w-7! h-7! rounded-lg grid place-items-center bg-[var(--violet-050)] text-[var(--violet-700)] border border-[var(--violet-100)]">
                    <Blocks size={14} />
                  </span>
                  {t.name}
                </span>
                <span className="text-[12px] text-[var(--muted)]">{t.note}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <Label>Model</Label>
          <div className="relative">
            <select
              value={`${form.llm_provider}:${form.llm_model}`}
              onChange={(e) => {
                const [provider, ...rest] = e.target.value.split(":");
                set("llm_provider", provider);
                set("llm_model", rest.join(":"));
              }}
              className="fld appearance-none px-3.5! py-2.5! pr-10!"
            >
              <option value="openai:gpt-4o">GPT-4o (recommended)</option>
              <option value="openai:gpt-4o-mini">GPT-4o mini</option>
              <option value="anthropic:claude-3-5-sonnet">Claude 3.5 Sonnet</option>
              <option value="anthropic:claude-3-5-haiku">Claude 3.5 Haiku</option>
            </select>
            <ChevronDown
              size={16}
              className="absolute right-3.5! top-1/2 -translate-y-1/2 pointer-events-none text-[var(--muted)]"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function KnowledgeTab({
  form,
  set,
  stagedFiles,
  setStagedFiles,
  stagedText,
  setStagedText,
  stagedUrl,
  setStagedUrl,
}: any) {
  const [mode, setMode] = useState<"upload" | "text" | "url">("upload");
  const fileRef = useRef<HTMLInputElement>(null);

  const addFiles = (files: FileList | null) => {
    if (!files) return;
    const next: StagedFile[] = Array.from(files).map((file) => {
      const okType = ALLOWED_EXT.some((ext) =>
        file.name.toLowerCase().endsWith(ext),
      );
      if (!okType) return { file, error: `Allowed: ${ALLOWED_EXT_LABEL}` };
      if (file.size > MAX_FILE_MB * 1024 * 1024)
        return { file, error: `Over ${MAX_FILE_MB} MB` };
      return { file };
    });
    setStagedFiles((prev: StagedFile[]) => [...prev, ...next]);
  };

  return (
    <div>
      <SectionHead
        title="Knowledge settings"
        desc="Choose whether the agent sticks to provided info or adds broader insight."
      />
      <div className="space-y-5!">
        <div>
          <Label>Answering mode</Label>
          <div className="relative">
            <select
              value={form.knowledge_mode}
              onChange={(e) => set("knowledge_mode", e.target.value)}
              className="fld appearance-none px-3.5! py-2.5! pr-10!"
            >
              <option value="hybrid">
                Hybrid — interpret facts conversationally
              </option>
              <option value="strict">Strict — answer only from knowledge</option>
            </select>
            <ChevronDown
              size={16}
              className="absolute right-3.5! top-1/2 -translate-y-1/2 pointer-events-none text-[var(--muted)]"
            />
          </div>
        </div>

        <div className="bg-white border border-[var(--line)] rounded-xl p-4!">
          <div className="flex items-center gap-2! mb-3!">
            <SlidersHorizontal size={15} className="text-[var(--violet-700)]" />
            <span className="text-[13px] font-semibold text-[var(--ink)]">
              Creativity level
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={1}
            step={0.1}
            value={form.creativity}
            onChange={(e) => set("creativity", parseFloat(e.target.value))}
            className="w-full! accent-[var(--violet)]"
          />
          <div className="flex justify-between text-[11px] text-[var(--muted)] mt-1!">
            <span>More predictable</span>
            <span>More diverse</span>
          </div>
        </div>

        <div>
          <p className="text-[13px] font-semibold text-[var(--ink)] mb-2!">
            Knowledge base
          </p>
          <div className="flex flex-wrap gap-2! mb-4!">
            {(
              [
                { key: "upload", label: "Upload files", icon: <Upload size={14} /> },
                { key: "text", label: "Paste text", icon: <Type size={14} /> },
                { key: "url", label: "Crawl website", icon: <Globe size={14} /> },
              ] as const
            ).map((m) => (
              <button
                key={m.key}
                onClick={() => setMode(m.key)}
                className={`flex items-center gap-2! px-3.5! py-2! rounded-lg text-[13px] font-semibold border transition-colors ${
                  mode === m.key
                    ? "bg-[var(--ink)] text-white border-[var(--ink)]"
                    : "bg-white text-[var(--slate)] border-[var(--line)] hover:bg-[var(--sidebar-hover)]"
                }`}
              >
                {m.icon} {m.label}
              </button>
            ))}
          </div>

          {mode === "upload" && (
            <div
              onClick={() => fileRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                addFiles(e.dataTransfer.files);
              }}
              className="border-2 border-dashed border-[var(--line)] rounded-2xl py-9! grid place-items-center text-center cursor-pointer hover:border-[var(--violet)] hover:bg-[var(--violet-050)] transition-all"
            >
              <Upload size={22} className="text-[var(--muted)] mb-2!" />
              <p className="text-[13px] font-semibold text-[var(--ink)]">
                Drag &amp; drop or click to browse
              </p>
              <p className="text-[11.5px] text-[var(--muted)] mt-0.5!">
                {ALLOWED_EXT_LABEL} · max {MAX_FILE_MB} MB
              </p>
              <input
                ref={fileRef}
                type="file"
                multiple
                hidden
                accept=".pdf,.txt,.md,.docx"
                onChange={(e) => addFiles(e.target.files)}
              />
            </div>
          )}

          {mode === "text" && (
            <textarea
              value={stagedText}
              onChange={(e) => setStagedText(e.target.value)}
              rows={7}
              placeholder="Paste key facts, FAQs, or guidelines your agent should know…"
              className="fld px-3.5! py-3! resize-y"
            />
          )}

          {mode === "url" && (
            <div className="relative">
              <Link2
                size={15}
                className="absolute left-3.5! top-1/2 -translate-y-1/2 text-[var(--muted)]"
              />
              <input
                value={stagedUrl}
                onChange={(e) => setStagedUrl(e.target.value)}
                placeholder="https://yourcompany.com"
                type="url"
                className="fld pl-10! pr-3.5! py-2.5!"
              />
              <p className="text-[11.5px] text-[var(--muted)] mt-2!">
                We read the sitemap, then follow same-site links (up to 60 pages).
                Crawling starts when you create the agent.
              </p>
            </div>
          )}

          {/* Staged files */}
          {stagedFiles.length > 0 && (
            <div className="space-y-2! mt-4!">
              {stagedFiles.map((sf: StagedFile, i: number) => (
                <div
                  key={i}
                  className={`flex items-center gap-3! px-3.5! py-2.5! rounded-xl border ${
                    sf.error
                      ? "bg-red-50 border-red-200"
                      : "bg-white border-[var(--line)]"
                  }`}
                >
                  <FileText size={15} className="text-[var(--muted)] shrink-0" />
                  <span className="flex-1 min-w-0 text-[13px] text-[var(--ink)] truncate">
                    {sf.file.name}
                  </span>
                  {sf.error ? (
                    <span className="text-[11.5px] text-red-600">{sf.error}</span>
                  ) : (
                    <span className="text-[11px] text-[var(--muted)]">
                      {(sf.file.size / 1024).toFixed(0)} KB
                    </span>
                  )}
                  <button
                    onClick={() =>
                      setStagedFiles((prev: StagedFile[]) =>
                        prev.filter((_, idx) => idx !== i),
                      )
                    }
                    className="w-6! h-6! grid place-items-center rounded-md text-[var(--muted)] hover:text-red-600 hover:bg-red-50 transition-colors shrink-0"
                  >
                    <X size={13} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <p className="flex items-center gap-1.5! text-[12px] text-[var(--muted)] mt-4!">
            <Info size={12} /> Knowledge is optional and indexed after the agent
            is created. You can add more later.
          </p>
        </div>
      </div>
    </div>
  );
}

function ConversationTab({ form, set }: any) {
  const [topicDraft, setTopicDraft] = useState("");
  const addTopic = () => {
    const t = topicDraft.trim();
    if (t && !form.topics.includes(t)) set("topics", [...form.topics, t]);
    setTopicDraft("");
  };
  return (
    <div>
      <SectionHead
        title="Conversation"
        desc="Fine-tune how the conversation runs."
      />
      <div className="space-y-5!">
        <Row
          title="Enable camera"
          desc="Enhance the interaction with live video input."
        >
          <Toggle on={form.enable_camera} onChange={(v) => set("enable_camera", v)} />
        </Row>

        <div>
          <Label>
            Topics to avoid{" "}
            <span className="text-[var(--muted)] font-normal">(optional)</span>
          </Label>
          <input
            value={topicDraft}
            onChange={(e) => setTopicDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addTopic();
              }
            }}
            placeholder="Type a topic and press Enter…"
            className="fld px-3.5! py-2.5!"
          />
          {form.topics.length > 0 && (
            <div className="flex flex-wrap gap-2! mt-2.5!">
              {form.topics.map((t: string) => (
                <span
                  key={t}
                  className="inline-flex items-center gap-1.5! text-[12px] font-medium text-[var(--slate)] bg-[var(--sidebar)] border border-[var(--line)] px-2.5! py-1! rounded-full"
                >
                  {t}
                  <button
                    onClick={() =>
                      set(
                        "topics",
                        form.topics.filter((x: string) => x !== t),
                      )
                    }
                    className="text-[var(--muted)] hover:text-red-600"
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <Row
          title="Limit response length"
          desc="Cap the maximum number of words per reply."
        >
          <Toggle
            on={form.max_words !== null}
            onChange={(v) => set("max_words", v ? 80 : null)}
          />
        </Row>
        {form.max_words !== null && (
          <div className="pl-1!">
            <input
              type="number"
              min={10}
              max={500}
              value={form.max_words}
              onChange={(e) => set("max_words", parseInt(e.target.value) || 0)}
              className="fld px-3.5! py-2! w-32!"
            />
            <span className="text-[12px] text-[var(--muted)] ml-2!">words</span>
          </div>
        )}

        <Row
          title="End-of-call feedback"
          desc="Show a rating screen to the user when the call ends."
        >
          <Toggle
            on={form.feedback_screen}
            onChange={(v) => set("feedback_screen", v)}
          />
        </Row>

        <div className="pt-2!">
          <p className="text-[13px] font-semibold text-[var(--ink)] mb-3!">
            Advanced
          </p>
          <div className="space-y-3!">
            <Row
              title="Agent memory"
              desc="Let this agent carry context across conversations."
            >
              <Toggle on={form.agent_memory} onChange={(v) => set("agent_memory", v)} />
            </Row>
            <Row
              title="Share memory across agents"
              desc="Make shared memory available to all agents when memory is on."
            >
              <Toggle on={form.share_memory} onChange={(v) => set("share_memory", v)} />
            </Row>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({
  title,
  desc,
  children,
}: {
  title: string;
  desc: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4! bg-white border border-[var(--line)] rounded-xl px-4! py-3.5!">
      <div className="min-w-0">
        <p className="text-[13.5px] font-semibold text-[var(--ink)]">{title}</p>
        <p className="text-[12px] text-[var(--muted)] mt-0.5!">{desc}</p>
      </div>
      {children}
    </div>
  );
}
/* eslint-enable @typescript-eslint/no-explicit-any */

// ── Live preview panel ───────────────────────────────────────────────────────
interface PMsg {
  id: string;
  from: "user" | "agent";
  text: string;
}
function AgentPreview({ name, avatarUrl }: { name: string; avatarUrl: string }) {
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const [draft, setDraft] = useState("");
  const greeting = `Hi! I'm ${name}. How can I help you?`;
  const [msgs, setMsgs] = useState<PMsg[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 9e9, behavior: "smooth" });
  }, [msgs]);

  const send = () => {
    const text = draft.trim();
    if (!text) return;
    setDraft("");
    setMsgs((m) => [
      ...m,
      { id: crypto.randomUUID(), from: "user", text },
      {
        id: crypto.randomUUID(),
        from: "agent",
        text: "Thanks! This is a preview — once you create me, I'll answer using my instructions and knowledge.",
      },
    ]);
  };

  return (
    <div className="hidden md:flex w-[420px]! xl:w-[460px]! shrink-0 border-l border-[var(--line)] bg-[var(--sidebar)] flex-col items-center justify-center px-6! py-8!">
      {/* device toggle */}
      <div className="inline-flex items-center gap-1! bg-white border border-[var(--line)] rounded-lg p-1! mb-4! shadow-[var(--shadow-sm)]">
        {(
          [
            { key: "desktop", icon: <Monitor size={15} /> },
            { key: "mobile", icon: <Smartphone size={15} /> },
          ] as const
        ).map((d) => (
          <button
            key={d.key}
            onClick={() => setDevice(d.key)}
            className={`w-9! h-8! grid place-items-center rounded-md transition-colors ${
              device === d.key
                ? "bg-[var(--ink)] text-white"
                : "text-[var(--muted)] hover:bg-[var(--sidebar-hover)]"
            }`}
          >
            {d.icon}
          </button>
        ))}
      </div>

      <div className="bg-[#141026] text-white text-[11.5px] font-medium px-3.5! py-2! rounded-lg mb-3! text-center max-w-[320px]!">
        You&apos;re in preview mode — sound and face animations won&apos;t show.
      </div>

      <div
        className={`w-full! bg-white rounded-2xl border border-[var(--line)] shadow-[var(--shadow-md)] overflow-hidden flex flex-col transition-all ${
          device === "mobile" ? "max-w-[300px]!" : "max-w-[380px]!"
        }`}
      >
        {/* avatar still */}
        <div className="relative aspect-[4/3] bg-[var(--line-soft)] overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={avatarUrl} alt={name} className="w-full! h-full! object-cover" />
          <div className="absolute bottom-2! left-2! flex items-center gap-1.5! text-[11px] font-semibold text-white bg-black/45 backdrop-blur px-2! py-1! rounded-lg">
            <Video size={12} /> AI
          </div>
        </div>
        {/* chat */}
        <div className="flex items-center justify-center px-4! py-2.5! border-y border-[var(--line)] text-[13px] font-semibold text-[var(--ink)]">
          Chat
        </div>
        <div ref={scrollRef} className="h-[180px]! overflow-y-auto px-4! py-3! space-y-2.5!">
          <div className="flex justify-start">
            <div className="max-w-[85%]! bg-[var(--sidebar)] text-[var(--ink)] text-[12.5px] leading-snug px-3! py-2! rounded-2xl rounded-bl-md">
              {greeting}
            </div>
          </div>
          {msgs.map((m) => (
            <div
              key={m.id}
              className={`flex ${m.from === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%]! text-[12.5px] leading-snug px-3! py-2! rounded-2xl ${
                  m.from === "user"
                    ? "text-white rounded-br-md"
                    : "bg-[var(--sidebar)] text-[var(--ink)] rounded-bl-md"
                }`}
                style={m.from === "user" ? { background: "var(--grad)" } : undefined}
              >
                {m.text}
              </div>
            </div>
          ))}
        </div>
        <div className="p-3! border-t border-[var(--line)]">
          <div className="flex items-center gap-2! bg-[var(--sidebar)] border border-[var(--line)] rounded-xl px-3! py-2! focus-within:border-[var(--violet)]">
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Type your message here…"
              className="flex-1 bg-transparent text-[12.5px] text-[var(--ink)] placeholder-[var(--muted)] outline-none"
            />
            <button
              onClick={send}
              disabled={!draft.trim()}
              className="w-7! h-7! grid place-items-center rounded-full text-white disabled:opacity-40 transition-opacity"
              style={{ background: "var(--grad)" }}
            >
              <Send size={13} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Embed screen ─────────────────────────────────────────────────────────────
function EmbedScreen({
  code,
  copied,
  onCopy,
  onDone,
}: {
  code: string;
  copied: boolean;
  onCopy: () => void;
  onDone: () => void;
}) {
  return (
    <div className="flex-1 min-h-0 overflow-y-auto px-6! py-10!">
      <div className="max-w-[720px]! mx-auto!">
        <div className="text-center mb-8!">
          <span
            className="w-14! h-14! rounded-2xl grid place-items-center text-white mx-auto! mb-4!"
            style={{ background: "var(--grad)" }}
          >
            <CheckCircle2 size={26} />
          </span>
          <h2 className="text-[22px] font-semibold text-[var(--ink)] tracking-tight">
            Your agent is live
          </h2>
          <p className="text-[13.5px] text-[var(--slate)] mt-1.5!">
            Drop this snippet into any site to embed the widget.
          </p>
        </div>

        <div className="bg-white border border-[var(--line)] rounded-2xl p-6! shadow-[var(--shadow-sm)]">
          <div className="flex items-center gap-2! mb-4! text-[var(--violet-700)]">
            <Code2 size={16} />
            <span className="text-[14px] font-semibold text-[var(--ink)]">
              Embed code
            </span>
          </div>
          <pre className="bg-[#141026] text-emerald-300 text-[12.5px] leading-relaxed rounded-xl p-4! overflow-x-auto whitespace-pre-wrap break-all mb-4!">
            {code}
          </pre>
          <button onClick={onCopy} className="btn-dark px-5! py-2.5! text-[13.5px]">
            <Copy size={15} /> {copied ? "Copied!" : "Copy embed code"}
          </button>
        </div>

        <div className="flex justify-end mt-6!">
          <button
            onClick={onDone}
            className="inline-flex items-center gap-2! bg-emerald-600 hover:bg-emerald-700 text-white px-6! py-2.5! rounded-xl text-[13.5px] font-semibold transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

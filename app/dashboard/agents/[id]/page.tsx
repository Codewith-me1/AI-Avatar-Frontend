"use client";

/**
 * Agent settings — the post-creation twin of the create wizard.
 *
 * Everything the wizard collects is editable here, because it all round-trips
 * through the API now (greeting, conversation starters, creativity, topics to
 * avoid, response cap, memory flags), instead of being baked into the prompt
 * where it could not be recovered.
 */

import React, { use, useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import {
  AlertCircle,
  Blocks,
  BookOpen,
  Check,
  ChevronDown,
  ChevronLeft,
  Code2,
  Copy,
  Eye,
  Image as ImageIcon,
  Info,
  Loader2,
  Mic,
  Pause,
  Play,
  Plug,
  Plus,
  Save,
  SlidersHorizontal,
  Sparkles,
  Trash2,
  User,
  Volume2,
  X,
} from "lucide-react";
import {
  deleteAgent as deleteAgentApi,
  getAgent,
  getEffectivePrompt,
  updateAgent,
} from "@/lib/api/agents";
import { avatarPreviewSrc, getCatalogue } from "@/lib/api/avatars";
import {
  CapabilitiesPanel,
  GoogleIntegrationCard,
} from "@/components/agent/CapabilitiesPanel";
import { MediaManager } from "@/components/agent/MediaManager";
import { ToolsPicker } from "@/components/agent/ToolsPicker";
import { KnowledgeManager } from "@/components/knowledge/KnowledgeManager";
import { useAgentStore } from "@/store";
import { useToast } from "@/components/widget/Toast";
import {
  ChipInput,
  CreativitySlider,
  GhostButton,
  Label,
  Modal,
  PrimaryButton,
  Row,
  Spinner,
  Toggle,
} from "@/components/console/ui";
import {
  CARTESIA_VOICES,
  LANGUAGES,
  MUSETALK_AVATARS,
  PERSONALITIES,
} from "@/lib/catalog";
import type {
  Agent,
  AgentUpdateInput,
  AvatarCatalogueItem,
  KnowledgeMode,
  Pronunciation,
} from "@/types";

const TABS = [
  "Avatar",
  "Voice",
  "Behavior",
  "Knowledge",
  "Conversation",
  "Media",
  "Tools",
  "Embed",
] as const;
type Tab = (typeof TABS)[number];

const TAB_ICONS: Record<Tab, React.ReactNode> = {
  Avatar: <User size={14} />,
  Voice: <Volume2 size={14} />,
  Behavior: <SlidersHorizontal size={14} />,
  Knowledge: <BookOpen size={14} />,
  Conversation: <Mic size={14} />,
  Media: <ImageIcon size={14} />,
  Tools: <Blocks size={14} />,
  Embed: <Code2 size={14} />,
};

interface SettingsForm {
  name: string;
  description: string;
  musetalk_avatar_id: string;
  language: string;
  voice_id: string;
  pronunciations: Pronunciation[];
  agent_role: string;
  personality: string;
  system_prompt: string;
  llm_provider: string;
  llm_model: string;
  creativity: number;
  knowledge_mode: KnowledgeMode;
  greeting: string;
  conversation_starters: string[];
  topics_to_avoid: string[];
  max_response_words: number | null;
  enable_camera: boolean;
  feedback_screen: boolean;
  agent_memory: boolean;
  share_memory: boolean;
  is_public: boolean;
}

const toForm = (a: Agent): SettingsForm => ({
  name: a.name ?? "",
  description: a.description ?? "",
  musetalk_avatar_id: a.musetalk_avatar_id || "ava",
  language: a.language || "en",
  voice_id: a.voice_id ?? "",
  pronunciations: (a.pronunciations as Pronunciation[]) ?? [],
  agent_role: a.agent_role ?? "",
  personality: a.personality ?? PERSONALITIES[0],
  system_prompt: a.system_prompt ?? "",
  llm_provider: a.llm_provider || "openai",
  llm_model: a.llm_model || "gpt-4o",
  creativity: typeof a.creativity === "number" ? a.creativity : 0.4,
  knowledge_mode: a.knowledge_mode || (a.restrict_to_knowledge ? "strict" : "hybrid"),
  greeting: a.greeting ?? "",
  conversation_starters: a.conversation_starters ?? [],
  topics_to_avoid: a.topics_to_avoid ?? [],
  max_response_words: a.max_response_words ?? null,
  enable_camera: a.enable_camera ?? true,
  feedback_screen: a.feedback_screen ?? false,
  agent_memory: a.agent_memory ?? false,
  share_memory: a.share_memory ?? false,
  is_public: a.is_public ?? true,
});

export default function AgentSettingsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { updateAgent: updateInStore, removeAgent } = useAgentStore();
  const { showToast } = useToast();

  const [agent, setAgent] = useState<Agent | null>(null);
  const [form, setForm] = useState<SettingsForm | null>(null);
  const [avatars, setAvatars] = useState<AvatarCatalogueItem[]>([]);
  const [tab, setTab] = useState<Tab>("Avatar");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAgent(id);
      setAgent(data);
      setForm(toForm(data));
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "This agent could not be loaded.",
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    getCatalogue().then(setAvatars).catch(() => setAvatars([]));
  }, []);

  const set = <K extends keyof SettingsForm>(k: K, v: SettingsForm[K]) =>
    setForm((p) => (p ? { ...p, [k]: v } : p));

  const dirty = useMemo(() => {
    if (!agent || !form) return false;
    return JSON.stringify(form) !== JSON.stringify(toForm(agent));
  }, [agent, form]);

  const save = async () => {
    if (!form) return;
    if (!form.name.trim()) {
      setTab("Avatar");
      setError("Agent name is required.");
      return;
    }
    if (form.system_prompt.trim().length < 10) {
      setTab("Behavior");
      setError("The agent prompt needs at least a sentence.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      // Explicit nulls matter: the API uses exclude_unset, so sending null is
      // how "no word cap" / "no topics to avoid" is actually cleared.
      const patch: AgentUpdateInput = {
        name: form.name.trim(),
        description: form.description.trim(),
        musetalk_avatar_id: form.musetalk_avatar_id,
        language: form.language,
        voice_id: form.voice_id,
        pronunciations: form.pronunciations.filter((p) => p.word && p.say_as).length
          ? form.pronunciations.filter((p) => p.word && p.say_as)
          : null,
        agent_role: form.agent_role.trim() || null,
        personality: form.personality,
        system_prompt: form.system_prompt.trim(),
        llm_provider: form.llm_provider,
        llm_model: form.llm_model,
        creativity: form.creativity,
        knowledge_mode: form.knowledge_mode,
        greeting: form.greeting.trim() || null,
        conversation_starters: form.conversation_starters.length
          ? form.conversation_starters
          : null,
        topics_to_avoid: form.topics_to_avoid.length ? form.topics_to_avoid : null,
        max_response_words: form.max_response_words,
        enable_camera: form.enable_camera,
        feedback_screen: form.feedback_screen,
        agent_memory: form.agent_memory,
        share_memory: form.share_memory,
        is_public: form.is_public,
      };
      const updated = await updateAgent(id, patch);
      setAgent(updated);
      setForm(toForm(updated));
      updateInStore(id, updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
      showToast({ type: "success", title: "Settings saved" });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save the changes.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteAgentApi(id);
      removeAgent(id);
      showToast({ type: "success", title: "Agent deleted" });
      router.push("/dashboard/agents");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Delete failed.");
      setDeleting(false);
      setShowDelete(false);
    }
  };

  if (loading) {
    return (
      <div className="grid place-items-center py-32! gap-4!">
        <Spinner />
        <span className="text-[13px] text-[var(--muted)]">
          Loading agent settings…
        </span>
      </div>
    );
  }

  if (!agent || !form) {
    return (
      <div className="p-8! md:p-10! max-w-[720px] mx-auto!">
        <div className="bg-white border border-red-200 rounded-2xl p-6! text-center">
          <AlertCircle size={22} className="text-red-500 mx-auto! mb-2!" />
          <p className="text-[15px] font-semibold text-[var(--ink)]">
            Agent unavailable
          </p>
          <p className="text-[13px] text-[var(--slate)] mt-1!">
            {error || "It may have been deleted."}
          </p>
          <Link
            href="/dashboard/agents"
            className="btn-dark px-4! py-2.5! text-[13.5px] mt-5! inline-flex"
          >
            Back to agents
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6! md:p-10! max-w-[1200px] mx-auto! w-full!">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-3! mb-6!">
        <Link href="/dashboard/agents">
          <span className="w-9! h-9! grid place-items-center rounded-lg border border-[var(--line)] bg-white text-[var(--slate)] hover:bg-[var(--sidebar-hover)] transition-colors">
            <ChevronLeft size={18} />
          </span>
        </Link>
        <div className="min-w-0">
          <h1 className="text-[20px] font-semibold text-[var(--ink)] tracking-tight truncate">
            {form.name || "Agent"}
          </h1>
          <p className="text-[12.5px] text-[var(--muted)] truncate">
            {form.description || "No description"} · runs at temp{" "}
            {agent.effective_temperature?.toFixed(2) ?? "—"}
          </p>
        </div>

        <div className="flex items-center gap-2! ml-auto">
          <Link href={`/dashboard/agents/${id}/test`}>
            <span className="inline-flex items-center gap-2! rounded-lg border border-[var(--line)] bg-white px-3.5! py-2.5! text-[13px] font-semibold text-[var(--slate)] hover:bg-[var(--sidebar-hover)] transition-colors">
              <Mic size={14} /> Test
            </span>
          </Link>
          <PrimaryButton onClick={save} loading={saving} disabled={!dirty}>
            {saved ? <Check size={15} /> : <Save size={15} />}
            {saved ? "Saved" : dirty ? "Save changes" : "Saved"}
          </PrimaryButton>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5! overflow-x-auto no-scrollbar border-b border-[var(--line)] mb-6! pb-[1px]!">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex items-center gap-2! px-3.5! py-2.5! text-[13.5px] font-semibold whitespace-nowrap border-b-2 transition-colors ${
              tab === t
                ? "text-[var(--violet-700)] border-[var(--violet)]"
                : "text-[var(--slate)] border-transparent hover:text-[var(--ink)]"
            }`}
          >
            {TAB_ICONS[t]} {t}
          </button>
        ))}
      </div>

      {error && (
        <div className="flex items-center gap-2! text-[13px] text-red-600 bg-red-50 border border-red-200 rounded-xl px-4! py-3! mb-6!">
          <AlertCircle size={15} className="shrink-0" /> {error}
          <button
            onClick={() => setError(null)}
            className="ml-auto text-[var(--muted)] hover:text-red-600"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {saved && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2! text-[13px] text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-4! py-3! mb-6!"
        >
          <Check size={15} /> Saved. Live sessions pick this up on their next
          start.
        </motion.div>
      )}

      <div className="bg-white border border-[var(--line)] rounded-2xl p-6! md:p-7! shadow-[var(--shadow-sm)]">
        {tab === "Avatar" && (
          <div className="space-y-5!">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4!">
              <div>
                <Label>Agent name</Label>
                <input
                  value={form.name}
                  onChange={(e) => set("name", e.target.value)}
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

            <div>
              <Label>Avatar</Label>
              <AvatarGrid
                avatars={avatars}
                selected={form.musetalk_avatar_id}
                onSelect={(v) => set("musetalk_avatar_id", v)}
              />
            </div>

            <Row
              title="Publicly embeddable"
              desc="Off takes the widget offline without deleting the agent."
            >
              <Toggle on={form.is_public} onChange={(v) => set("is_public", v)} />
            </Row>
          </div>
        )}

        {tab === "Voice" && (
          <VoiceSection form={form} set={set} />
        )}

        {tab === "Behavior" && (
          <div className="space-y-5!">
            <div>
              <Label optional>Agent role</Label>
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
                  {[form.personality, ...PERSONALITIES]
                    .filter((p, i, arr) => p && arr.indexOf(p) === i)
                    .map((p) => (
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
                rows={10}
                maxLength={20000}
                className="fld px-3.5! py-3! resize-y leading-relaxed"
              />
              <div className="flex items-center gap-2! mt-2!">
                <button
                  onClick={() => setShowPrompt(true)}
                  className="inline-flex items-center gap-1.5! text-[12.5px] font-semibold text-[var(--violet-700)] hover:text-[var(--violet-600)]"
                >
                  <Eye size={13} /> View the composed prompt
                </button>
                <span className="ml-auto text-[11px] text-[var(--muted)]">
                  {form.system_prompt.length}/20000
                </span>
              </div>
            </div>

            <CreativitySlider
              value={form.creativity}
              onChange={(v) => set("creativity", v)}
              temperature={agent.effective_temperature}
            />

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
                  <option value={`${form.llm_provider}:${form.llm_model}`}>
                    {form.llm_model} (current)
                  </option>
                  <option value="openai:gpt-4o">GPT-4o</option>
                  <option value="openai:gpt-4o-mini">GPT-4o mini</option>
                  <option value="anthropic:claude-3-5-sonnet">
                    Claude 3.5 Sonnet
                  </option>
                  <option value="anthropic:claude-3-5-haiku">
                    Claude 3.5 Haiku
                  </option>
                </select>
                <ChevronDown
                  size={16}
                  className="absolute right-3.5! top-1/2 -translate-y-1/2 pointer-events-none text-[var(--muted)]"
                />
              </div>
            </div>
          </div>
        )}

        {tab === "Knowledge" && (
          <KnowledgeManager
            agentId={id}
            knowledgeMode={form.knowledge_mode}
            onModeChange={(mode) => {
              set("knowledge_mode", mode);
              // The manager already persisted it — keep the baseline in step so
              // the Save button does not light up for a change we just saved.
              setAgent((a) =>
                a
                  ? { ...a, knowledge_mode: mode, restrict_to_knowledge: mode === "strict" }
                  : a,
              );
            }}
          />
        )}

        {tab === "Conversation" && (
          <div className="space-y-5!">
            <div>
              <Label optional>Greeting</Label>
              <textarea
                value={form.greeting}
                onChange={(e) => set("greeting", e.target.value)}
                rows={2}
                maxLength={500}
                placeholder={`Hi! I'm ${form.name}. How can I help you?`}
                className="fld px-3.5! py-2.5! resize-y"
              />
              <p className="text-[11.5px] text-[var(--muted)] mt-1!">
                The first thing the agent says, spoken and in chat.
              </p>
            </div>

            <div>
              <Label optional>Conversation starters</Label>
              <ChipInput
                values={form.conversation_starters}
                onChange={(v) => set("conversation_starters", v)}
                placeholder="Add a suggested question and press Enter…"
                max={4}
                maxLength={120}
              />
            </div>

            <div>
              <Label optional>Topics to avoid</Label>
              <ChipInput
                values={form.topics_to_avoid}
                onChange={(v) => set("topics_to_avoid", v)}
                placeholder="Type a topic and press Enter…"
                max={20}
                maxLength={80}
              />
            </div>

            <Row
              title="Limit response length"
              desc="Cap the maximum number of words per reply."
            >
              <Toggle
                on={form.max_response_words !== null}
                onChange={(v) => set("max_response_words", v ? 80 : null)}
              />
            </Row>
            {form.max_response_words !== null && (
              <div className="pl-1!">
                <input
                  type="number"
                  min={10}
                  max={500}
                  value={form.max_response_words}
                  onChange={(e) =>
                    set("max_response_words", parseInt(e.target.value) || 10)
                  }
                  className="fld px-3.5! py-2! w-32!"
                />
                <span className="text-[12px] text-[var(--muted)] ml-2!">
                  words (10–500)
                </span>
              </div>
            )}

            <Row title="Enable camera" desc="Allow live video input in the widget.">
              <Toggle
                on={form.enable_camera}
                onChange={(v) => set("enable_camera", v)}
              />
            </Row>
            <Row
              title="End-of-call feedback"
              desc="Show a rating screen when the call ends."
            >
              <Toggle
                on={form.feedback_screen}
                onChange={(v) => set("feedback_screen", v)}
              />
            </Row>
            <Row
              title="Agent memory"
              desc="Recall a returning visitor's earlier conversations with this agent."
            >
              <Toggle
                on={form.agent_memory}
                onChange={(v) => set("agent_memory", v)}
              />
            </Row>
            <Row
              title="Share memory across agents"
              desc="Widen that recall to every agent on your account."
            >
              <Toggle
                on={form.share_memory}
                onChange={(v) => set("share_memory", v)}
              />
            </Row>
          </div>
        )}

        {tab === "Media" && <MediaManager agentId={id} />}

        {tab === "Tools" && (
          <div className="divide-y divide-[var(--line)]">
            <section className="pb-8!">
              <h3 className="text-[15px] font-semibold text-[var(--ink)] flex items-center gap-2!">
                <Sparkles size={15} className="text-[var(--violet-700)]" /> Agent
                capabilities
              </h3>
              <p className="text-[12.5px] text-[var(--slate)] mt-1! mb-4!">
                What this agent can do for a visitor: capture a lead, book a
                meeting, hand over to a person.
              </p>
              <CapabilitiesPanel agentId={id} />
            </section>

            <section className="py-8!">
              <h3 className="text-[15px] font-semibold text-[var(--ink)] flex items-center gap-2!">
                <Blocks size={15} className="text-[var(--violet-700)]" /> Custom
                tools
              </h3>
              <p className="text-[12.5px] text-[var(--slate)] mt-1! mb-4!">
                Your own webhooks, and the call controls every agent gets.
              </p>
              <ToolsPicker agentId={id} />
            </section>

            <section className="pt-8!">
              <h3 className="text-[15px] font-semibold text-[var(--ink)] flex items-center gap-2!">
                <Plug size={15} className="text-[var(--violet-700)]" />{" "}
                Integrations
              </h3>
              <p className="text-[12.5px] text-[var(--slate)] mt-1! mb-4!">
                Connected once for the whole account.
              </p>
              <GoogleIntegrationCard agentId={id} />
            </section>
          </div>
        )}

        {tab === "Embed" && <EmbedSection agentId={id} isPublic={form.is_public} />}
      </div>

      {/* Danger zone */}
      <div className="bg-white border border-red-200 rounded-2xl p-6! shadow-[var(--shadow-sm)] mt-6!">
        <div className="flex flex-wrap items-center justify-between gap-4!">
          <div>
            <p className="text-[14px] font-semibold text-[var(--ink)] flex items-center gap-2!">
              <Trash2 size={15} className="text-red-600" /> Delete this agent
            </p>
            <p className="text-[13px] text-[var(--slate)] mt-1! max-w-lg!">
              Removes the agent, its knowledge base, media and conversation
              history. This cannot be undone.
            </p>
          </div>
          <button
            onClick={() => setShowDelete(true)}
            className="inline-flex items-center gap-2! rounded-lg bg-red-600 hover:bg-red-700 text-white px-5! py-2.5! text-[13px] font-semibold transition-colors"
          >
            <Trash2 size={15} /> Delete agent
          </button>
        </div>
      </div>

      {showPrompt && (
        <EffectivePromptModal agentId={id} onClose={() => setShowPrompt(false)} />
      )}

      {showDelete &&
        createPortal(
          <div className="fixed! inset-0! z-[9999] flex items-center justify-center bg-black/55 backdrop-blur-sm p-4!">
            <div className="w-full max-w-md! bg-white rounded-2xl shadow-2xl ring-1 ring-black/5 overflow-hidden">
              <div className="flex items-start gap-4! border-b border-[var(--line)] px-6! py-5!">
                <div className="w-11! h-11! shrink-0 grid place-items-center rounded-full bg-red-100 text-red-600">
                  <Trash2 size={18} />
                </div>
                <div>
                  <h3 className="text-[16px] font-semibold text-[var(--ink)]">
                    Delete {form.name}?
                  </h3>
                  <p className="text-[13px] text-[var(--slate)] mt-1!">
                    Anything embedding this agent will stop working immediately.
                  </p>
                </div>
              </div>
              <div className="flex justify-end gap-3! bg-[var(--sidebar)] px-6! py-4!">
                <GhostButton onClick={() => setShowDelete(false)} disabled={deleting}>
                  Cancel
                </GhostButton>
                <button
                  disabled={deleting}
                  onClick={handleDelete}
                  className="inline-flex items-center gap-2! rounded-lg bg-red-600 px-4! py-2.5! text-[13px] font-semibold text-white hover:bg-red-700 transition disabled:bg-red-400"
                >
                  {deleting && <Loader2 size={14} className="animate-spin" />}
                  {deleting ? "Deleting…" : "Delete agent"}
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}

// ── Sections ─────────────────────────────────────────────────────────────────

function AvatarGrid({
  avatars,
  selected,
  onSelect,
}: {
  avatars: AvatarCatalogueItem[];
  selected: string;
  onSelect: (id: string) => void;
}) {
  const pool = avatars.length
    ? avatars
    : MUSETALK_AVATARS.map((a) => ({ ...a, provider: "musetalk" as const }));

  return (
    <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-6 gap-3!">
      {pool.map((a) => {
        const active = a.id === selected;
        const src = avatarPreviewSrc(a.id, a.preview_url);
        return (
          <button
            key={`${a.provider}-${a.id}`}
            type="button"
            onClick={() => onSelect(a.id)}
            className={`relative rounded-xl overflow-hidden border-2 transition-all ${
              active
                ? "border-[var(--violet)] ring-2 ring-[var(--violet-100)]"
                : "border-transparent hover:border-[var(--line)]"
            }`}
          >
            <div className="aspect-[3/4] bg-[var(--line-soft)] grid place-items-center">
              {src ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={src}
                  alt={a.name}
                  className="w-full! h-full! object-cover"
                />
              ) : (
                <span className="text-[11px] font-semibold text-[var(--muted)]">
                  {a.name.slice(0, 2).toUpperCase()}
                </span>
              )}
            </div>
            {active && (
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
  );
}

function VoiceSection({
  form,
  set,
}: {
  form: SettingsForm;
  set: <K extends keyof SettingsForm>(k: K, v: SettingsForm[K]) => void;
}) {
  const [playing, setPlaying] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  useEffect(() => () => audioRef.current?.pause(), []);

  const selected = CARTESIA_VOICES.find((v) => v.id === form.voice_id);

  const toggle = () => {
    if (!selected) return;
    if (playing === selected.id) {
      audioRef.current?.pause();
      setPlaying(null);
      return;
    }
    audioRef.current?.pause();
    const audio = new Audio(selected.previewUrl.replace(/^\.?\/*/, "/"));
    audioRef.current = audio;
    setPlaying(selected.id);
    audio.play().catch(() => setPlaying(null));
    audio.onended = () => setPlaying(null);
    audio.onerror = () => setPlaying(null);
  };

  const setEntry = (index: number, patch: Partial<Pronunciation>) =>
    set(
      "pronunciations",
      form.pronunciations.map((p, i) => (i === index ? { ...p, ...patch } : p)),
    );

  return (
    <div className="space-y-5!">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4!">
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
          {selected && (
            <button
              onClick={toggle}
              className="mt-3! inline-flex items-center gap-2! text-[13px] font-semibold text-[var(--violet-700)] hover:text-[var(--violet-600)] transition-colors"
            >
              {playing === selected.id ? (
                <Pause size={14} fill="currentColor" />
              ) : (
                <Play size={14} fill="currentColor" />
              )}
              {playing === selected.id ? "Stop preview" : "Preview voice"}
            </button>
          )}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between gap-3! mb-2!">
          <Label optional>Pronunciation dictionary</Label>
          <button
            onClick={() =>
              set("pronunciations", [
                ...form.pronunciations,
                { word: "", say_as: "" },
              ])
            }
            className="inline-flex items-center gap-1.5! text-[12.5px] font-semibold text-[var(--violet-700)] hover:text-[var(--violet-600)]"
          >
            <Plus size={13} /> Add a word
          </button>
        </div>
        {form.pronunciations.length === 0 ? (
          <p className="text-[12.5px] text-[var(--muted)]">
            Add a word when the agent mispronounces a name, brand or acronym.
          </p>
        ) : (
          <div className="space-y-2!">
            {form.pronunciations.map((p, i) => (
              <div key={i} className="flex items-center gap-2!">
                <input
                  value={p.word}
                  onChange={(e) => setEntry(i, { word: e.target.value })}
                  placeholder="avatarx"
                  className="fld px-3.5! py-2!"
                />
                <span className="text-[12px] text-[var(--muted)] shrink-0">
                  say as
                </span>
                <input
                  value={p.say_as}
                  onChange={(e) => setEntry(i, { say_as: e.target.value })}
                  placeholder="ay-vat"
                  className="fld px-3.5! py-2!"
                />
                <button
                  onClick={() =>
                    set(
                      "pronunciations",
                      form.pronunciations.filter((_, idx) => idx !== i),
                    )
                  }
                  className="w-8! h-8! grid place-items-center rounded-lg text-[var(--muted)] hover:text-red-600 hover:bg-red-50 transition-colors shrink-0"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function EmbedSection({
  agentId,
  isPublic,
}: {
  agentId: string;
  isPublic: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const code = `<!-- avatarx embeddable widget -->
<script src="${origin}/components/widget/widget.js" async></script>
<script>
  window.VoiceAgentConfig = {
    agentId: "${agentId}",
    apiUrl: "${origin}"
  };
</script>`;

  return (
    <div>
      {!isPublic && (
        <p className="flex items-start gap-2! text-[12.5px] text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-3.5! py-3! mb-5!">
          <AlertCircle size={14} className="shrink-0 mt-0.5!" />
          This agent is not public, so the embedded widget will refuse to load.
          Turn on <span className="font-semibold">Publicly embeddable</span> in
          the Avatar tab.
        </p>
      )}
      <div className="flex items-start gap-3! bg-[var(--violet-050)] border border-[var(--violet-100)] rounded-xl p-4! mb-5!">
        <Info size={16} className="text-[var(--violet-700)] shrink-0 mt-0.5!" />
        <p className="text-[12.5px] text-[var(--slate)] leading-relaxed">
          Paste this just before the closing <code>&lt;/body&gt;</code> tag. The
          widget reads the agent&apos;s greeting, conversation starters and media
          from the API at load, so changes here reach embedded sites without a
          redeploy.
        </p>
      </div>
      <pre className="bg-[#141026] text-emerald-300 text-[12.5px] leading-relaxed rounded-xl p-4! overflow-x-auto whitespace-pre-wrap break-all mb-4!">
        {code}
      </pre>
      <button
        onClick={() => {
          navigator.clipboard.writeText(code);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }}
        className="btn-dark px-5! py-2.5! text-[13.5px]"
      >
        <Copy size={15} /> {copied ? "Copied!" : "Copy embed code"}
      </button>
    </div>
  );
}

function EffectivePromptModal({
  agentId,
  onClose,
}: {
  agentId: string;
  onClose: () => void;
}) {
  const [data, setData] = useState<{ system_prompt: string; temperature: number } | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getEffectivePrompt(agentId)
      .then(setData)
      .catch((e) =>
        setError(e instanceof Error ? e.message : "Could not load the prompt."),
      );
  }, [agentId]);

  return (
    <Modal
      wide
      title="Composed prompt"
      desc="Exactly what the live agent receives — your prompt plus role, personality, topics to avoid and the response cap."
      onClose={onClose}
      footer={<GhostButton onClick={onClose}>Close</GhostButton>}
    >
      {error ? (
        <p className="text-[13px] text-red-600">{error}</p>
      ) : !data ? (
        <div className="grid place-items-center py-12!">
          <Spinner />
        </div>
      ) : (
        <>
          <p className="text-[12px] text-[var(--muted)] mb-2!">
            Temperature {data.temperature.toFixed(2)}
          </p>
          <pre className="bg-[var(--sidebar)] border border-[var(--line)] rounded-xl p-4! text-[12.5px] leading-relaxed whitespace-pre-wrap max-h-[420px]! overflow-y-auto">
            {data.system_prompt}
          </pre>
        </>
      )}
    </Modal>
  );
}

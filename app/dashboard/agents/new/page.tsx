"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Sparkles,
  Cpu,
  Radio,
  AlignLeft,
  Info,
  HelpCircle,
} from "lucide-react";
import { motion } from "framer-motion";
import { apiClient } from "@/lib/api/client";
import { useAgentStore } from "@/store";
import type { Agent, AgentCreateInput } from "@/types";

const SYSTEM_PROMPT_TEMPLATES = [
  {
    name: "Customer Support",
    description: "Helpful, polite, and technical support specialist.",
    prompt:
      "You are Sarah, a warm and empathetic Customer Support voice agent. Your task is to help the user troubleshoot problems, answer billing questions, and assist in navigating our software. Always verify the customer's issues and answer concisely as this is a voice-to-voice conversation.",
  },
  {
    name: "Sales / Product Pitcher",
    description: "Highly convincing, energetic, and professional seller.",
    prompt:
      "You are Jordan, a confident and enthusiastic Sales Specialist. Keep the conversation engaging, highlight the product benefits (low latency, 3D avatars, custom knowledge base), and aim to secure a booking or demo meeting by the end of the conversation.",
  },
  {
    name: "Language Conversationalist",
    description: "Slow, clear speaking language tutor.",
    prompt:
      "You are Elena, a patient Spanish Tutor. Speak primarily in Spanish, using simple and clear vocabulary suitable for language learners. Periodically offer corrections or constructive tips to help the user practice their pronunciation and sentence structure.",
  },
];

export default function NewAgentPage() {
  const router = useRouter();
  const { addAgent } = useAgentStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<Omit<Agent, "id" | "slug">>({
    name: "",
    description: "",
    system_prompt: SYSTEM_PROMPT_TEMPLATES[0].prompt,
    language: "en-US",
    avatar_type: "waveform",
    avatar_url: "",
    llm_provider: "openai",
    llm_model: "gpt-4o",
    is_public: true,
    musetalk_avatar_id: "",
    is_active: true,
    avatar_id: "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const applyPromptTemplate = (prompt: string) => {
    setFormData((prev) => ({ ...prev, system_prompt: prompt }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      setError("Agent name is required");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const slug = formData.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const payload = {
      ...formData,
      slug,
    };

    try {
      // Attempt API request
      const response = await apiClient.post<Agent>("/api/agents/", payload);
      addAgent(response);
      router.push("/dashboard/agents");
    } catch (err) {
      console.warn(
        "API request failed, performing client-side mock creation",
        err,
      );
      // Simulate local creation
      const mockResponse: Agent = {
        ...payload,
        id: `mock-${crypto.randomUUID()}`,
      };
      addAgent(mockResponse);
      router.push("/dashboard/agents");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Back button */}
      <Link
        href="/dashboard/agents"
        className="inline-flex items-center gap-2 text-slate-500 hover:text-[#6d28d9] text-sm font-medium mb-6 transition-colors group"
      >
        <ArrowLeft
          size={16}
          className="transition-transform group-hover:-translate-x-1"
        />
        Back to agents
      </Link>

      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-[#ede9fe] border border-white/80 flex items-center justify-center text-[#6d28d9] shadow-sm">
          <Sparkles size={20} />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-[#6d28d9] to-slate-800">
            New Voice Agent
          </h1>
          <p className="text-slate-500 text-sm">
            Configure voice pipeline, LLM model settings, and prompts
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-600 text-sm mb-6 shadow-sm">
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Core Profile */}
        <FormSection title="Agent Profile" icon={<AlignLeft size={16} />}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#6d28d9] uppercase tracking-wider block">
                Agent Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g. Sarah Support"
                className="w-full px-4 py-3 bg-white/70 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 text-sm outline-none focus:border-[#a78bfa] focus:ring-2 focus:ring-[#ede9fe] transition-all"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-[#6d28d9] uppercase tracking-wider block">
                Description
              </label>
              <input
                type="text"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Short description of the agent's role"
                className="w-full px-4 py-3 bg-white/70 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 text-sm outline-none focus:border-[#a78bfa] focus:ring-2 focus:ring-[#ede9fe] transition-all"
              />
            </div>
          </div>
        </FormSection>

        {/* Model Setup */}
        <FormSection title="AI LLM Config" icon={<Cpu size={16} />}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#6d28d9] uppercase tracking-wider block">
                LLM Provider
              </label>
              <select
                name="llm_provider"
                value={formData.llm_provider}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-white/80 border border-slate-200 rounded-xl text-slate-800 text-sm outline-none focus:border-[#a78bfa] focus:ring-2 focus:ring-[#ede9fe] transition-all"
              >
                <option value="openai">OpenAI</option>
                <option value="anthropic">Anthropic</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-[#6d28d9] uppercase tracking-wider block">
                LLM Model
              </label>
              <select
                name="llm_model"
                value={formData.llm_model}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-white/80 border border-slate-200 rounded-xl text-slate-800 text-sm outline-none focus:border-[#a78bfa] focus:ring-2 focus:ring-[#ede9fe] transition-all"
              >
                {formData.llm_provider === "openai" ? (
                  <>
                    <option value="gpt-4o">gpt-4o (Recommended)</option>
                    <option value="gpt-4o-mini">gpt-4o-mini</option>
                    <option value="gpt-3.5-turbo">gpt-3.5-turbo</option>
                  </>
                ) : (
                  <>
                    <option value="claude-3-5-sonnet">claude-3-5-sonnet</option>
                    <option value="claude-3-haiku">claude-3-haiku</option>
                  </>
                )}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-[#6d28d9] uppercase tracking-wider block">
                Language
              </label>
              <select
                name="language"
                value={formData.language}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-white/80 border border-slate-200 rounded-xl text-slate-800 text-sm outline-none focus:border-[#a78bfa] focus:ring-2 focus:ring-[#ede9fe] transition-all"
              >
                <option value="en-US">English (United States)</option>
                <option value="es-ES">Spanish (Spain)</option>
                <option value="fr-FR">French (France)</option>
                <option value="de-DE">German (Germany)</option>
                <option value="ja-JP">Japanese (Japan)</option>
              </select>
            </div>
          </div>
        </FormSection>

        {/* Voice / Avatar Interface */}
        <FormSection
          title="Visual & Voice Representation"
          icon={<Radio size={16} />}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#6d28d9] uppercase tracking-wider block">
                Avatar Type
              </label>
              <select
                name="avatar_type"
                value={formData.avatar_type}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-white/80 border border-slate-200 rounded-xl text-slate-800 text-sm outline-none focus:border-[#a78bfa] focus:ring-2 focus:ring-[#ede9fe] transition-all"
              >
                <option value="waveform">Audio Waveform (Default)</option>
                <option value="readyplayerme">Ready Player Me (3D GLB)</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-[#6d28d9] uppercase tracking-wider block">
                Avatar GLB URL
                {formData.avatar_type === "readyplayerme" && (
                  <span className="text-[10px] text-[#6d28d9] ml-1.5 lowercase italic font-normal">
                    (.glb models supported)
                  </span>
                )}
              </label>
              <input
                type="text"
                name="avatar_url"
                value={formData.avatar_url}
                onChange={handleInputChange}
                disabled={formData.avatar_type !== "readyplayerme"}
                placeholder={
                  formData.avatar_type === "readyplayerme"
                    ? "https://models.readyplayer.me/your-model-id.glb"
                    : "Not applicable for waveforms"
                }
                className="w-full px-4 py-3 bg-white/70 disabled:bg-slate-100 disabled:text-slate-400 disabled:border-slate-200 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 text-sm outline-none focus:border-[#a78bfa] focus:ring-2 focus:ring-[#ede9fe] transition-all"
              />
            </div>
          </div>
        </FormSection>

        {/* System Prompt instructions */}
        <div className="glass-panel rounded-2xl p-6 shadow-sm border border-white/60">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-[#6d28d9] uppercase tracking-wider">
              Behavior & Prompt Settings
            </h3>
            <span className="text-xs text-[#6d28d9] font-bold flex items-center gap-1">
              <HelpCircle size={14} />
              Quick Templates
            </span>
          </div>

          {/* Quick template selection */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
            {SYSTEM_PROMPT_TEMPLATES.map((temp) => (
              <button
                key={temp.name}
                type="button"
                onClick={() => applyPromptTemplate(temp.prompt)}
                className="p-3 bg-white/50 hover:bg-[#ede9fe]/40 hover:border-[#a78bfa] text-left rounded-xl border border-slate-200/50 transition-all flex flex-col justify-between shadow-sm cursor-pointer"
              >
                <span className="text-xs font-bold text-[#6d28d9]">
                  {temp.name}
                </span>
                <span className="text-[10px] text-slate-500 mt-1">
                  {temp.description}
                </span>
              </button>
            ))}
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-[#6d28d9] uppercase tracking-wider block">
              System Instructions
            </label>
            <textarea
              name="system_prompt"
              value={formData.system_prompt}
              onChange={handleInputChange}
              rows={6}
              placeholder="Tell your bot who they are, how to talk, and what boundaries they have..."
              className="w-full px-4 py-3 bg-white/70 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 text-sm outline-none focus:border-[#a78bfa] focus:ring-2 focus:ring-[#ede9fe] transition-all resize-none leading-relaxed"
              required
            />
          </div>
        </div>

        {/* Publish / Status */}
        <div className="flex items-center gap-4 bg-white/60 border border-slate-200/60 p-4 rounded-xl shadow-sm">
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              name="is_active"
              checked={formData.is_active}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  is_active: e.target.checked,
                }))
              }
              className="w-4 h-4 rounded text-[#6d28d9] bg-white border-slate-300 focus:ring-[#a78bfa] focus:ring-offset-2"
            />
            <div>
              <p className="text-sm font-bold text-slate-800">Active Status</p>
              <p className="text-[11px] text-slate-500">
                Toggle whether this voice agent starts responding immediately.
              </p>
            </div>
          </label>
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <Link href="/dashboard/agents">
            <button
              type="button"
              className="px-6 py-3 bg-white/60 hover:bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-800 rounded-xl text-sm font-semibold transition-all cursor-pointer"
            >
              Cancel
            </button>
          </Link>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isSubmitting}
            className="px-8 py-3 bg-[#6d28d9] hover:bg-[#5b21b6] text-white rounded-xl text-sm font-bold shadow-md shadow-[#6d28d9]/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isSubmitting ? "Creating agent..." : "Create Agent"}
          </motion.button>
        </div>
      </form>
    </div>
  );
}

function FormSection({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="glass-panel rounded-2xl p-6 space-y-4 shadow-sm border border-white/60">
      <div className="flex items-center gap-2 border-b border-slate-200/50 pb-3">
        <span className="text-[#a78bfa]">{icon}</span>
        <h2 className="text-sm font-bold uppercase tracking-wider text-[#6d28d9]">
          {title}
        </h2>
      </div>
      {children}
    </div>
  );
}

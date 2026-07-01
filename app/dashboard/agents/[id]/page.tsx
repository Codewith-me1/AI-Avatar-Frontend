"use client";

import React, { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Cpu,
  Radio,
  AlignLeft,
  Info,
  HelpCircle,
  Code,
  Copy,
  Check,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { apiClient } from "@/lib/api/client";
import { useAgentStore } from "@/store";
import type { Agent } from "@/types";

export default function EditAgentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { updateAgent, agents } = useAgentStore();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [copied, setCopied] = useState(false);

  // Form State
  const [formData, setFormData] = useState<Omit<Agent, "id" | "slug">>({
    name: "",
    description: "",
    system_prompt: "",
    language: "en-US",
    avatar_type: "waveform",
    avatar_url: "",
    avatar_id: "",
    musetalk_avatar_id: "",

    llm_provider: "openai",
    llm_model: "gpt-4o",
    is_public: true,
    is_active: true,
  });

  useEffect(() => {
    loadAgent();
  }, [id]);

  const loadAgent = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // 1. Try fetching from backend API
      const data = await apiClient.get<Agent>(`/api/agents/${id}`);
      setFormData({
        name: data.name,
        description: data.description || "",
        system_prompt: data.system_prompt,
        language: data.language,
        avatar_type: data.avatar_type,
        avatar_url: data.avatar_url || "",
        avatar_id: data.avatar_id || "",
        musetalk_avatar_id: data.musetalk_avatar_id || "",
        llm_provider: data.llm_provider,
        llm_model: data.llm_model,
        is_public: data.is_public,
        is_active: data.is_active,
      });
    } catch (err) {
      console.warn("Failed to load agent from API, searching local store", err);
      // 2. Fall back to local store (for demo mode / offline support)
      const localAgent = agents.find((a) => a.id === id);
      if (localAgent) {
        setFormData({
          name: localAgent.name,
          description: localAgent.description || "",
          system_prompt: localAgent.system_prompt,
          language: localAgent.language,
          avatar_type: localAgent.avatar_type,
          avatar_url: localAgent.avatar_url || "",
          avatar_id: localAgent.avatar_id || "",
          musetalk_avatar_id: localAgent.musetalk_avatar_id || "",
          llm_provider: localAgent.llm_provider,
          llm_model: localAgent.llm_model,
          is_public: localAgent.is_public,
          is_active: localAgent.is_active,
        });
      } else {
        setError("Agent not found in registry.");
      }
    } finally {
      setIsLoading(false);
    }
  };

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      setError("Agent name is required");
      return;
    }

    setIsSaving(true);
    setError(null);
    setSuccess(false);

    const slug = formData.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const payload = {
      ...formData,
      slug,
    };

    try {
      // Try sending update to API
      const response = await apiClient.patch<Agent>(
        `/api/agents/${id}`,
        payload,
      );
      updateAgent(id, response);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.warn(
        "API patch failed, editing client-side mock agent instead",
        err,
      );
      // Update in Zustand store locally
      updateAgent(id, payload);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  // Embed script generator snippet
  const embedCode = `<!-- VoiceAgent Embeddable Assistant Widget -->
<script>
  window.VoiceAgentConfig = {
    agentId: "${id}",
    apiUrl: "${typeof window !== "undefined" ? window.location.origin : "http://localhost:3000"}"
  };
</script>
<script src="${typeof window !== "undefined" ? window.location.origin : "http://localhost:3000"}/components/widget/widget.js" async></script>`;

  const handleCopy = () => {
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-3 text-slate-400">
        <div className="w-10 h-10 border-4 border-[#424874] border-t-transparent rounded-full animate-spin" />
        <span className="text-sm font-semibold">Loading agent settings...</span>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      {/* Top Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-slate-500 hover:text-[#424874] text-sm font-medium transition-colors group"
        >
          <ArrowLeft
            size={16}
            className="transition-transform group-hover:-translate-x-1"
          />
          Back to dashboard
        </Link>

        <Link href={`/dashboard/agents/${id}/test`}>
          <button className="px-4 py-2 bg-[#DCD6F7] hover:bg-[#A6B1E1] text-[#424874] border border-[#A6B1E1]/40 text-xs font-bold rounded-xl transition-all cursor-pointer">
            Test Speech Mode
          </button>
        </Link>
      </div>

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#A6B1E1] to-[#424874] flex items-center justify-center text-white font-black text-xl shadow-md border border-white/80">
          {formData.name.slice(0, 2).toUpperCase()}
        </div>
        <div>
          <h1 className="text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-[#424874] to-slate-800">
            Configure Agent: {formData.name}
          </h1>
          <p className="text-slate-500 text-sm">
            Update model, voice characteristics, and system guidelines
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-600 text-sm shadow-sm">
          {error}
        </div>
      )}

      {success && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-600 text-sm font-medium shadow-sm"
        >
          Agent settings updated successfully!
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 columns - Settings Form */}
        <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-6">
          {/* Profile Section */}
          <FormSection title="Agent Info" icon={<AlignLeft size={16} />}>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#424874] uppercase tracking-wider block">
                  Agent Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Agent Name"
                  className="w-full px-4 py-3 bg-white/70 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 text-sm outline-none focus:border-[#A6B1E1] focus:ring-2 focus:ring-[#DCD6F7] transition-all"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#424874] uppercase tracking-wider block">
                  Description
                </label>
                <input
                  type="text"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Short description"
                  className="w-full px-4 py-3 bg-white/70 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 text-sm outline-none focus:border-[#A6B1E1] focus:ring-2 focus:ring-[#DCD6F7] transition-all"
                />
              </div>
            </div>
          </FormSection>

          {/* AI LLM Section */}
          <FormSection title="LLM Configuration" icon={<Cpu size={16} />}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#424874] uppercase tracking-wider block">
                  LLM Provider
                </label>
                <select
                  name="llm_provider"
                  value={formData.llm_provider}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white/80 border border-slate-200 rounded-xl text-slate-800 text-sm outline-none focus:border-[#A6B1E1] focus:ring-2 focus:ring-[#DCD6F7] transition-all"
                >
                  <option value="openai">OpenAI</option>
                  <option value="anthropic">Anthropic</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#424874] uppercase tracking-wider block">
                  LLM Model
                </label>
                <select
                  name="llm_model"
                  value={formData.llm_model}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white/80 border border-slate-200 rounded-xl text-slate-800 text-sm outline-none focus:border-[#A6B1E1] focus:ring-2 focus:ring-[#DCD6F7] transition-all"
                >
                  {formData.llm_provider === "openai" ? (
                    <>
                      <option value="gpt-4o">gpt-4o</option>
                      <option value="gpt-4o-mini">gpt-4o-mini</option>
                      <option value="gpt-3.5-turbo">gpt-3.5-turbo</option>
                    </>
                  ) : (
                    <>
                      <option value="claude-3-5-sonnet">
                        claude-3-5-sonnet
                      </option>
                      <option value="claude-3-haiku">claude-3-haiku</option>
                    </>
                  )}
                </select>
              </div>
            </div>
          </FormSection>

          {/* UI Representation */}
          <FormSection
            title="Voice & Visual Interface"
            icon={<Radio size={16} />}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#424874] uppercase tracking-wider block">
                  Avatar Type
                </label>
                <select
                  name="avatar_type"
                  value={formData.avatar_type}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white/80 border border-slate-200 rounded-xl text-slate-800 text-sm outline-none focus:border-[#A6B1E1] focus:ring-2 focus:ring-[#DCD6F7] transition-all"
                >
                  <option value="waveform">Waveform (Default)</option>
                  <option value="readyplayerme">
                    Ready Player Me (3D GLB)
                  </option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#424874] uppercase tracking-wider block">
                  Language
                </label>
                <select
                  name="language"
                  value={formData.language}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white/80 border border-slate-200 rounded-xl text-slate-800 text-sm outline-none focus:border-[#A6B1E1] focus:ring-2 focus:ring-[#DCD6F7] transition-all"
                >
                  <option value="en-US">English (US)</option>
                  <option value="es-ES">Spanish (Spain)</option>
                  <option value="fr-FR">French (France)</option>
                  <option value="de-DE">German (Germany)</option>
                </select>
              </div>
            </div>
            {formData.avatar_type === "readyplayerme" && (
              <div className="space-y-2 pt-2">
                <label className="text-xs font-bold text-[#424874] uppercase tracking-wider block">
                  Avatar GLB URL
                </label>
                <input
                  type="text"
                  name="avatar_url"
                  value={formData.avatar_url}
                  onChange={handleInputChange}
                  placeholder="https://models.readyplayer.me/your-avatar.glb"
                  className="w-full px-4 py-3 bg-white/70 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 text-sm outline-none focus:border-[#A6B1E1] focus:ring-2 focus:ring-[#DCD6F7] transition-all"
                />
              </div>
            )}
          </FormSection>

          {/* System Instructions */}
          <div className="glass-panel rounded-2xl p-6 space-y-4 shadow-sm border border-white/60">
            <h3 className="text-sm font-bold text-[#424874] uppercase tracking-wider">
              System Instructions
            </h3>
            <div className="space-y-2">
              <textarea
                name="system_prompt"
                value={formData.system_prompt}
                onChange={handleInputChange}
                rows={6}
                placeholder="Write system instructions..."
                className="w-full px-4 py-3 bg-white/70 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 text-sm outline-none focus:border-[#A6B1E1] focus:ring-2 focus:ring-[#DCD6F7] transition-all resize-none leading-relaxed"
                required
              />
            </div>
          </div>

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
                className="w-4 h-4 rounded text-[#424874] bg-white border-slate-300 focus:ring-[#A6B1E1] focus:ring-offset-2"
              />
              <div>
                <p className="text-sm font-bold text-slate-800">
                  Active Status
                </p>
                <p className="text-[11px] text-slate-500">
                  Toggle whether this voice agent is available for user calls.
                </p>
              </div>
            </label>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Link href="/dashboard">
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
              disabled={isSaving}
              className="px-8 py-3 bg-[#424874] hover:bg-[#353b61] text-white rounded-xl text-sm font-bold shadow-md shadow-[#424874]/10 transition-all disabled:opacity-50 cursor-pointer"
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </motion.button>
          </div>
        </form>

        {/* Right 1 column - Integration Widget Embed */}
        <div className="space-y-6">
          <div className="glass-panel rounded-2xl p-6 space-y-4 shadow-sm border border-white/60">
            <div className="flex items-center gap-2 text-[#424874]">
              <Code size={16} className="text-[#A6B1E1]" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#424874]">
                Embed Script
              </h3>
            </div>

            <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
              Copy and paste this script snippet before the closing{" "}
              <code className="text-[#424874] font-semibold">
                &lt;/body&gt;
              </code>{" "}
              tag on any website to embed the floatable voice assistant button.
            </p>

            <div className="relative bg-[#424874]/5 border border-slate-200/60 rounded-xl p-3.5 overflow-hidden">
              <pre className="text-[10px] text-[#424874] font-mono overflow-x-auto whitespace-pre-wrap select-all pr-8">
                {embedCode}
              </pre>
              <button
                onClick={handleCopy}
                className="absolute top-2.5 right-2.5 p-1.5 bg-white border border-slate-200 hover:bg-[#DCD6F7]/30 rounded-lg text-[#424874] transition-all shadow-sm cursor-pointer"
                title="Copy embed script"
              >
                {copied ? (
                  <Check size={12} className="text-emerald-500" />
                ) : (
                  <Copy size={12} />
                )}
              </button>
            </div>

            <div className="p-3 bg-[#DCD6F7]/50 border border-[#A6B1E1]/40 rounded-xl text-[10px] text-[#424874] flex items-start gap-2 leading-relaxed font-semibold">
              <Info size={14} className="flex-none mt-0.5" />
              <span>
                Note: The embed target requires browser permission for
                Microphone and audio output access.
              </span>
            </div>
          </div>
        </div>
      </div>
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
        <span className="text-[#A6B1E1]">{icon}</span>
        <h2 className="text-sm font-bold uppercase tracking-wider text-[#424874]">
          {title}
        </h2>
      </div>
      {children}
    </div>
  );
}

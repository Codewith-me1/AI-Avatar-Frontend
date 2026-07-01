"use client";

import React, { useState, useEffect } from "react";
import { Settings, Shield, Key, Eye, EyeOff, Save, Check, Volume2, Video, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";

export default function SettingsPage() {
  const [showKeys, setShowKeys] = useState<{ [key: string]: boolean }>({
    openai: false,
    anthropic: false,
    cartesia: false,
    liveavatar: false,
    livekitSecret: false,
  });

  const [keys, setKeys] = useState({
    openai: "",
    anthropic: "",
    cartesia: "",
    liveavatar: "",
    livekitUrl: "",
    livekitKey: "",
    livekitSecret: "",
    serverUrl: "http://localhost:8000",
  });

  const [saved, setSaved] = useState(false);

  // Load from localStorage in useEffect to avoid Next.js SSR hydration mismatches
  useEffect(() => {
    setKeys({
      openai: localStorage.getItem("voice_agent_openai_key") || "",
      anthropic: localStorage.getItem("voice_agent_anthropic_key") || "",
      cartesia: localStorage.getItem("voice_agent_cartesia_key") || "",
      liveavatar: localStorage.getItem("voice_agent_liveavatar_key") || "",
      livekitUrl: localStorage.getItem("voice_agent_livekit_url") || "",
      livekitKey: localStorage.getItem("voice_agent_livekit_key") || "",
      livekitSecret: localStorage.getItem("voice_agent_livekit_secret") || "",
      serverUrl: localStorage.getItem("voice_agent_server_url") || "http://localhost:8000",
    });
  }, []);

  const toggleKeyVisibility = (provider: string) => {
    setShowKeys((prev) => ({ ...prev, [provider]: !prev[provider] }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setKeys((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("voice_agent_openai_key", keys.openai);
    localStorage.setItem("voice_agent_anthropic_key", keys.anthropic);
    localStorage.setItem("voice_agent_cartesia_key", keys.cartesia);
    localStorage.setItem("voice_agent_liveavatar_key", keys.liveavatar);
    localStorage.setItem("voice_agent_livekit_url", keys.livekitUrl);
    localStorage.setItem("voice_agent_livekit_key", keys.livekitKey);
    localStorage.setItem("voice_agent_livekit_secret", keys.livekitSecret);
    localStorage.setItem("voice_agent_server_url", keys.serverUrl);

    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const resetToDefaults = () => {
    if (confirm("Are you sure you want to reset all settings to defaults?")) {
      const defaultState = {
        openai: "",
        anthropic: "",
        cartesia: "",
        liveavatar: "",
        livekitUrl: "",
        livekitKey: "",
        livekitSecret: "",
        serverUrl: "http://localhost:8000",
      };
      setKeys(defaultState);
      localStorage.setItem("voice_agent_openai_key", "");
      localStorage.setItem("voice_agent_anthropic_key", "");
      localStorage.setItem("voice_agent_cartesia_key", "");
      localStorage.setItem("voice_agent_liveavatar_key", "");
      localStorage.setItem("voice_agent_livekit_url", "");
      localStorage.setItem("voice_agent_livekit_key", "");
      localStorage.setItem("voice_agent_livekit_secret", "");
      localStorage.setItem("voice_agent_server_url", "http://localhost:8000");

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#DCD6F7] border border-white/80 flex items-center justify-center text-[#424874] shadow-sm">
            <Settings size={20} />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-[#424874] to-slate-800">
              Platform Settings
            </h1>
            <p className="text-slate-500 text-sm">Configure system-wide connections, service API keys, and endpoints</p>
          </div>
        </div>

        <button
          type="button"
          onClick={resetToDefaults}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-500 hover:text-red-600 hover:bg-red-50 border border-slate-200 hover:border-red-100 rounded-xl transition-all cursor-pointer"
        >
          <RefreshCw size={12} />
          Reset Defaults
        </button>
      </div>

      {saved && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-600 text-sm font-semibold flex items-center gap-2 shadow-sm"
        >
          <Check size={16} />
          Settings saved to local registry successfully!
        </motion.div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* API keys section */}
        <div className="glass-panel rounded-2xl p-6 space-y-6 shadow-sm border border-white/60">
          <div className="flex items-center gap-2 border-b border-slate-200/50 pb-3">
            <Key size={16} className="text-[#A6B1E1]" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#424874]">LLM Provider Keys</h2>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed font-semibold">
            Optional: Paste your keys below. Keys are stored locally inside your browser's <code className="text-[#424874] font-bold">localStorage</code> and passed dynamically per session.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* OpenAI API Key */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#424874] uppercase tracking-wider block">OpenAI Key</label>
              <div className="relative">
                <input
                  type={showKeys.openai ? "text" : "password"}
                  name="openai"
                  value={keys.openai}
                  onChange={handleInputChange}
                  placeholder="sk-proj-..."
                  className="w-full pl-4 pr-12 py-3 bg-white/70 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 text-sm outline-none focus:border-[#A6B1E1] focus:ring-2 focus:ring-[#DCD6F7] transition-all font-mono"
                />
                <button
                  type="button"
                  onClick={() => toggleKeyVisibility("openai")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-[#424874] transition-colors cursor-pointer"
                >
                  {showKeys.openai ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Anthropic API Key */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#424874] uppercase tracking-wider block">Anthropic Key</label>
              <div className="relative">
                <input
                  type={showKeys.anthropic ? "text" : "password"}
                  name="anthropic"
                  value={keys.anthropic}
                  onChange={handleInputChange}
                  placeholder="sk-ant-..."
                  className="w-full pl-4 pr-12 py-3 bg-white/70 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 text-sm outline-none focus:border-[#A6B1E1] focus:ring-2 focus:ring-[#DCD6F7] transition-all font-mono"
                />
                <button
                  type="button"
                  onClick={() => toggleKeyVisibility("anthropic")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-[#424874] transition-colors cursor-pointer"
                >
                  {showKeys.anthropic ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Voice and Video Credentials */}
        <div className="glass-panel rounded-2xl p-6 space-y-6 shadow-sm border border-white/60">
          <div className="flex items-center gap-2 border-b border-slate-200/50 pb-3">
            <Volume2 size={16} className="text-[#A6B1E1]" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#424874]">Voice & Avatar Integration</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Cartesia Key */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#424874] uppercase tracking-wider block">Cartesia API Key</label>
              <div className="relative">
                <input
                  type={showKeys.cartesia ? "text" : "password"}
                  name="cartesia"
                  value={keys.cartesia}
                  onChange={handleInputChange}
                  placeholder="sk_car_..."
                  className="w-full pl-4 pr-12 py-3 bg-white/70 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 text-sm outline-none focus:border-[#A6B1E1] focus:ring-2 focus:ring-[#DCD6F7] transition-all font-mono"
                />
                <button
                  type="button"
                  onClick={() => toggleKeyVisibility("cartesia")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-[#424874] transition-colors cursor-pointer"
                >
                  {showKeys.cartesia ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* LiveAvatar / HeyGen Key */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#424874] uppercase tracking-wider block">HeyGen / LiveAvatar API Key</label>
              <div className="relative">
                <input
                  type={showKeys.liveavatar ? "text" : "password"}
                  name="liveavatar"
                  value={keys.liveavatar}
                  onChange={handleInputChange}
                  placeholder="HeyGen API Key..."
                  className="w-full pl-4 pr-12 py-3 bg-white/70 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 text-sm outline-none focus:border-[#A6B1E1] focus:ring-2 focus:ring-[#DCD6F7] transition-all font-mono"
                />
                <button
                  type="button"
                  onClick={() => toggleKeyVisibility("liveavatar")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-[#424874] transition-colors cursor-pointer"
                >
                  {showKeys.liveavatar ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* LiveKit Cloud/Server Credentials */}
        <div className="glass-panel rounded-2xl p-6 space-y-6 shadow-sm border border-white/60">
          <div className="flex items-center gap-2 border-b border-slate-200/50 pb-3">
            <Video size={16} className="text-[#A6B1E1]" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#424874]">LiveKit Server (Realtime)</h2>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#424874] uppercase tracking-wider block">LiveKit URL</label>
              <input
                type="text"
                name="livekitUrl"
                value={keys.livekitUrl}
                onChange={handleInputChange}
                placeholder="wss://your-project.livekit.cloud"
                className="w-full px-4 py-3 bg-white/70 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 text-sm outline-none focus:border-[#A6B1E1] focus:ring-2 focus:ring-[#DCD6F7] transition-all font-mono"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#424874] uppercase tracking-wider block">LiveKit API Key</label>
                <input
                  type="text"
                  name="livekitKey"
                  value={keys.livekitKey}
                  onChange={handleInputChange}
                  placeholder="API..."
                  className="w-full px-4 py-3 bg-white/70 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 text-sm outline-none focus:border-[#A6B1E1] focus:ring-2 focus:ring-[#DCD6F7] transition-all font-mono"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-[#424874] uppercase tracking-wider block">LiveKit API Secret</label>
                <div className="relative">
                  <input
                    type={showKeys.livekitSecret ? "text" : "password"}
                    name="livekitSecret"
                    value={keys.livekitSecret}
                    onChange={handleInputChange}
                    placeholder="Secret..."
                    className="w-full pl-4 pr-12 py-3 bg-white/70 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 text-sm outline-none focus:border-[#A6B1E1] focus:ring-2 focus:ring-[#DCD6F7] transition-all font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => toggleKeyVisibility("livekitSecret")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-[#424874] transition-colors cursor-pointer"
                  >
                    {showKeys.livekitSecret ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Server environment */}
        <div className="glass-panel rounded-2xl p-6 space-y-6 shadow-sm border border-white/60">
          <div className="flex items-center gap-2 border-b border-slate-200/50 pb-3">
            <Shield size={16} className="text-[#A6B1E1]" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#424874]">System API Endpoint</h2>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-[#424874] uppercase tracking-wider block">Server URL</label>
            <input
              type="text"
              name="serverUrl"
              value={keys.serverUrl}
              onChange={handleInputChange}
              placeholder="http://localhost:8000"
              className="w-full px-4 py-3 bg-white/70 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 text-sm outline-none focus:border-[#A6B1E1] focus:ring-2 focus:ring-[#DCD6F7] transition-all font-mono"
              required
            />
          </div>
        </div>

        {/* Save button */}
        <div className="flex items-center justify-end pt-2">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            className="flex items-center gap-2 px-8 py-3 bg-[#424874] hover:bg-[#353b61] text-white rounded-xl text-sm font-bold shadow-md shadow-[#424874]/15 border border-white/20 transition-all cursor-pointer"
          >
            <Save size={16} />
            Save Settings
          </motion.button>
        </div>
      </form>
    </div>
  );
}

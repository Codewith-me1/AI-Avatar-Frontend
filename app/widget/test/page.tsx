"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  Mic,
  ArrowRight,
  Zap,
  Cpu,
  Globe,
  Activity,
  Terminal,
} from "lucide-react";
import { useEffect, useState } from "react";

export default function LandingPage() {
  const [pulseScale, setPulseScale] = useState(1);

  useEffect(() => {
    const interval = setInterval(() => {
      setPulseScale((prev) => (prev === 1 ? 1.06 : 1));
    }, 1500);

    return () => clearInterval(interval);
  }, []);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f8f9ff] text-slate-800 selection:bg-[#DCD6F7] selection:text-[#424874]">
      {/* Background */}
      <div className="pointer-events-none absolute left-[-10%] top-[-10%] h-[60vw] w-[60vw] rounded-full bg-[#DCD6F7]/30 blur-[150px]" />
      <div className="pointer-events-none absolute right-[-10%] top-[20%] h-[50vw] w-[50vw] rounded-full bg-[#A6B1E1]/20 blur-[150px]" />
      <div className="pointer-events-none absolute bottom-[-10%] left-[20%] h-[50vw] w-[50vw] rounded-full bg-[#F4EEFF]/40 blur-[150px]" />

      {/* Grid */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(66,72,116,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(66,72,116,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

      {/* HEADER */}
      <header className="relative z-20">
        <div className="mx-auto flex h-20 w-full  items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="group flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-[#A6B1E1] to-[#424874] shadow-lg shadow-[#424874]/10 transition-transform duration-300 group-hover:scale-105">
              <Mic size={18} className="text-white" />
            </div>

            <span className="bg-gradient-to-r from-[#424874] to-slate-900 bg-clip-text text-lg font-black tracking-tight text-transparent">
              VoiceAgent
            </span>
          </Link>

          <div className="flex items-center gap-3 sm:gap-5">
            <Link
              href="/docs"
              target="_blank"
              className="hidden text-sm font-semibold text-slate-500 transition-colors hover:text-slate-900 md:block"
            >
              Documentation
            </Link>

            <Link href="/dashboard">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className="flex h-11 items-center justify-center rounded-2xl border border-slate-200 bg-white/80 px-5 text-sm font-bold text-slate-800 shadow-sm backdrop-blur-md transition-all hover:border-slate-300 hover:bg-white"
              >
                Console Login
              </motion.button>
            </Link>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="relative z-10 mx-auto flex w-full  flex-col items-center gap-16 px-4 pb-24 pt-10 sm:px-6 md:pt-16 lg:flex-row lg:gap-20 lg:px-8 lg:pt-20">
        {/* LEFT */}
        <div className="flex w-full flex-1 flex-col items-center text-center lg:items-start lg:text-left">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-[#DCD6F7]/50 px-4 py-2 text-xs font-bold text-[#424874] shadow-sm backdrop-blur-md"
          >
            <Activity size={12} className="animate-pulse" />
            Next-Gen Realtime Voice Platform
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-6 max-w-3xl text-4xl font-black leading-[1.05] tracking-tight text-slate-900 sm:text-5xl md:text-6xl xl:text-7xl"
          >
            Conversational AI
            <span className="mt-2 block bg-gradient-to-r from-[#424874] via-[#A6B1E1] to-[#424874] bg-clip-text text-transparent">
              Reimagined in Realtime.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-6 max-w-2xl text-base leading-relaxed text-slate-500 sm:text-lg md:text-xl"
          >
            Connect advanced LLMs with low-latency WebRTC streams, customizable
            3D avatars, and private document knowledge bases. Deploy interactive
            bots in seconds.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-8 flex w-full flex-col gap-4 sm:w-auto sm:flex-row"
          >
            <Link href="/dashboard" className="w-full sm:w-auto">
              <motion.button
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
                className="flex min-h-[56px] w-full items-center justify-center gap-2 rounded-2xl border border-slate-700/10 bg-[#424874] px-8 py-4 text-base font-bold text-white shadow-xl shadow-[#424874]/15 transition-all hover:bg-[#323657]"
              >
                Launch Console
                <ArrowRight size={17} />
              </motion.button>
            </Link>

            <Link href="/docs" target="_blank" className="w-full sm:w-auto">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex min-h-[56px] w-full items-center justify-center rounded-2xl border border-slate-200 bg-white/70 px-8 py-4 text-base font-bold text-slate-700 shadow-sm backdrop-blur-md transition-all hover:bg-white"
              >
                Read Docs
              </motion.button>
            </Link>
          </motion.div>
        </div>

        {/* RIGHT */}
        <div className="flex w-full flex-1 items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative w-full max-w-[420px] overflow-hidden rounded-[36px] border border-white/70 bg-white/70 p-5 shadow-[0_20px_80px_rgba(0,0,0,0.08)] backdrop-blur-2xl sm:p-6"
          >
            {/* glare */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0" />

            {/* top bar */}
            <div className="mb-6 flex items-center justify-between border-b border-slate-200/50 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-3 w-3 items-center justify-center rounded-full bg-red-500/20">
                  <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-500" />
                </div>

                <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">
                  Live Preview
                </span>
              </div>

              <span className="rounded-full border border-[#DCD6F7]/40 bg-[#DCD6F7]/50 px-2 py-1 text-[10px] font-extrabold text-[#424874] shadow-sm">
                GPT-4o API
              </span>
            </div>

            {/* avatar */}
            <div className="flex flex-col items-center py-6">
              <motion.div
                animate={{ scale: pulseScale }}
                transition={{
                  duration: 1.5,
                  ease: "easeInOut",
                }}
                className="flex h-28 w-28 cursor-pointer items-center justify-center rounded-full border border-white/20 bg-gradient-to-br from-[#A6B1E1] to-[#424874] text-3xl font-black text-white shadow-2xl"
              >
                VA
              </motion.div>

              <h3 className="mt-5 text-lg font-extrabold text-[#424874]">
                Voice Assistant
              </h3>

              <p className="mt-1 text-xs font-semibold text-slate-400">
                Status: Ready to Talk
              </p>

              {/* Visualizer */}
              <div className="mt-7 flex h-12 w-full max-w-[220px] items-center justify-center gap-1.5">
                {[...Array(9)].map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{
                      height: [12, 12 + Math.sin(i) * 24, 12],
                    }}
                    transition={{
                      duration: 1.2 + (i % 3) * 0.2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="w-1.5 rounded-full bg-gradient-to-t from-[#A6B1E1] to-[#424874]"
                  />
                ))}
              </div>
            </div>

            {/* message */}
            <div className="mt-4 rounded-2xl border border-slate-200/50 bg-white/90 p-4 text-center text-[11px] italic leading-relaxed text-slate-600 shadow-inner">
              "Hi, I'm your voice agent. Click the console button to configure
              me with a custom prompt and your own database."
            </div>
          </motion.div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="relative z-10 border-t border-slate-200/60">
        <div className="mx-auto w-full  px-4 py-24 sm:px-6 lg:px-8">
          <div className="mx-auto mb-16 max-w-3xl text-center">
            <h2 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
              Engineered for Interactive Audio
            </h2>

            <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-slate-500 sm:text-lg">
              Everything you need to deploy natural, real-time voice
              conversations directly inside web applications.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
            <FeatureCard
              icon={<Zap className="text-[#424874]" size={20} />}
              title="Sub-500ms Pipeline"
              description="Built on native WebRTC and direct PCM binary streaming for near-zero latency, human-like voice response speeds."
            />

            <FeatureCard
              icon={<Cpu className="text-indigo-600" size={20} />}
              title="Advanced LLMs"
              description="Support for top-tier intelligence systems including GPT-4o, Claude, and custom system prompt engineering."
            />

            <FeatureCard
              icon={<Globe className="text-fuchsia-600" size={20} />}
              title="Immersive Avatars"
              description="Plug in full 3D Ready Player Me avatars with automatic lip-sync and realtime animation."
            />

            <FeatureCard
              icon={<Terminal className="text-emerald-600" size={20} />}
              title="Knowledge Bases"
              description="Upload PDFs, markdown, or URLs. Voice agents perform semantic search on private data accurately."
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 mx-auto w-full max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-[36px] border border-white/70 bg-white/80 p-8 shadow-[0_20px_80px_rgba(0,0,0,0.08)] backdrop-blur-xl sm:p-10 md:p-14">
          <div className="pointer-events-none absolute right-0 top-0 h-[200px] w-[200px] rounded-full bg-[#DCD6F7]/20 blur-[80px]" />
          <div className="pointer-events-none absolute bottom-0 left-0 h-[200px] w-[200px] rounded-full bg-[#A6B1E1]/15 blur-[80px]" />

          <div className="relative z-10 mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-black tracking-tight text-[#424874] sm:text-4xl">
              Ready to bring your bots to life?
            </h2>

            <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-slate-500">
              Create, configure, test, and publish custom-designed chatbot
              widgets in less than five minutes.
            </p>

            <div className="mt-8">
              <Link href="/dashboard">
                <motion.button
                  whileHover={{ scale: 1.03, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  className="rounded-2xl bg-[#424874] px-8 py-4 font-bold text-white shadow-xl shadow-[#424874]/15 transition-all hover:bg-[#323657]"
                >
                  Get Started for Free
                </motion.button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="relative z-10 border-t border-slate-200/50 px-4 py-6 text-center text-xs font-medium tracking-wide text-slate-400">
        &copy; {new Date().getFullYear()} VoiceAgent Platform. All rights
        reserved.
      </footer>
    </main>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="flex h-full flex-col rounded-3xl border border-white/80 bg-white/70 p-6 shadow-sm backdrop-blur-md"
    >
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200/50 bg-white shadow-sm">
        {icon}
      </div>

      <div className="mt-5 flex flex-1 flex-col">
        <h3 className="text-base font-black tracking-tight text-slate-900">
          {title}
        </h3>

        <p className="mt-2 text-sm leading-relaxed text-slate-500">
          {description}
        </p>
      </div>
    </motion.div>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  Sparkles,
  Menu,
  X,
  Play,
  Mic,
  Video,
  Globe,
  ShieldCheck,
  Zap,
  Cpu,
  BarChart3,
  Layers,
  MessageSquare,
  BookOpen,
  Check,
  Star,
  Twitter,
  Linkedin,
  Github,
  Terminal as TerminalIcon,
  Boxes,
  Workflow,
  ArrowUpRight,
  Plus,
  FileText,
  MousePointer2,
} from "lucide-react";
import { GradientBlinds } from "@/components/magicui/GradientBlinds";

/* ═══════════════════════════════════════════════════════════════
   AVAT Avatar — landing page
   Dark, AI-futuristic vibe (n8n-style): dotted grid, glow orbs,
   animated workflow node-graph, typing terminal, marquees,
   glowing bento + border-beam cards. Generous, clean spacing.
   Self-contained (scoped CSS + lucide icons only).
════════════════════════════════════════════════════════════════ */

const GlobalStyles = () => (
  <style>{`
    .lp {
      --bg: #08080c;
      --bg-2: #0c0c12;
      --panel: rgba(255,255,255,0.025);
      --panel-2: rgba(255,255,255,0.045);
      --border: rgba(255,255,255,0.08);
      --border-2: rgba(255,255,255,0.14);
      --text: #ecebf2;
      --muted: #9a99a8;
      --dim: #6b6a78;
      --violet: #8b5cf6;
      --violet-2: #a855f7;
      --fuchsia: #d946ef;
      --coral: #fb7185;
      --cyan: #22d3ee;
      --grad: linear-gradient(100deg, #8b5cf6 0%, #a855f7 35%, #d946ef 65%, #fb7185 100%);
      --grad-cool: linear-gradient(120deg, #22d3ee, #8b5cf6 55%, #d946ef);
      --font-display: 'Space Grotesk', system-ui, sans-serif;
      --font-body: 'Inter', system-ui, sans-serif;
      --r: 16px; --r-lg: 24px; --r-xl: 34px;
      --ease: cubic-bezier(0.22,1,0.36,1);

      position: relative;
      min-height: 100vh;
      background: var(--bg);
      color: var(--text);
      font-family: var(--font-body);
      line-height: 1.6;
      /* clip (not hidden) — 'hidden' would make .lp a scroll container and
         break position:sticky for the stacking cards. */
      overflow-x: clip;
      -webkit-font-smoothing: antialiased;
    }
    .lp * { box-sizing: border-box; }
    .lp h1,.lp h2,.lp h3,.lp h4 { font-family: var(--font-display); letter-spacing: -0.025em; color:#fff; }

    /* Ambient background: dotted grid + glow orbs */
    .lp-bg { position: fixed; inset: 0; z-index: 0; pointer-events: none; overflow: hidden; }
    .lp-dots {
      position: absolute; inset: 0;
      background-image: radial-gradient(circle, rgba(255,255,255,0.055) 1px, transparent 1px);
      background-size: 30px 30px;
      -webkit-mask-image: radial-gradient(ellipse 90% 60% at 50% 0%, #000 30%, transparent 78%);
      mask-image: radial-gradient(ellipse 90% 60% at 50% 0%, #000 30%, transparent 78%);
    }
    .lp-orb { position: absolute; border-radius: 50%; filter: blur(90px); opacity: 0.5; }
    .lp-orb.o1 { width: 620px; height: 620px; top: -220px; left: -120px; background: radial-gradient(circle, rgba(139,92,246,0.55), transparent 68%); animation: drift 16s var(--ease) infinite; }
    .lp-orb.o2 { width: 560px; height: 560px; top: -160px; right: -140px; background: radial-gradient(circle, rgba(217,70,239,0.4), transparent 68%); animation: drift 20s var(--ease) infinite reverse; }
    .lp-orb.o3 { width: 520px; height: 520px; top: 780px; left: 40%; background: radial-gradient(circle, rgba(34,211,238,0.22), transparent 70%); animation: drift 24s var(--ease) infinite; }

    .lp-inner { position: relative; z-index: 1; }

    /* Fractal-noise grain overlay — tuned for a dark surface (analog, paper-like
       feel without washing the dark theme out). */
    .grain {
      position: fixed; inset: 0; z-index: 60; pointer-events: none;
      opacity: 0.16; mix-blend-mode: soft-light;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
      background-size: 160px 160px;
    }
    @media (prefers-reduced-motion: no-preference) {
      .grain { animation: grainShift 8s steps(6) infinite; }
    }
    @keyframes grainShift {
      0%{ background-position: 0 0 } 20%{ background-position: -40px 20px }
      40%{ background-position: 30px -30px } 60%{ background-position: -20px 40px }
      80%{ background-position: 40px 10px } 100%{ background-position: 0 0 }
    }
    .wrap { width: 100%; max-width: 1200px; margin: 0 auto; padding: 0 28px; }
    @media (max-width:640px){ .wrap { padding: 0 18px; } }

    /* ── Buttons ── */
    .btn { display:inline-flex; align-items:center; gap:9px; font-weight:600; font-size:0.95rem;
      border:none; cursor:pointer; text-decoration:none; border-radius:999px; padding:0.85rem 1.5rem;
      transition: transform .3s var(--ease), box-shadow .3s var(--ease), background .3s; white-space:nowrap; }
    .btn-primary { position:relative; overflow:hidden; color:#fff; background: var(--grad);
      box-shadow: 0 8px 30px rgba(139,92,246,0.35); }
    .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 14px 44px rgba(168,85,247,0.5); }
    .btn-primary::after { content:""; position:absolute; top:0; left:-160%; width:55%; height:100%;
      background: linear-gradient(120deg, transparent, rgba(255,255,255,0.4), transparent);
      transform: skewX(-20deg); animation: shimmer 3.6s infinite; }
    .btn-ghost { color:#fff; background: rgba(255,255,255,0.04); border:1px solid var(--border-2); }
    .btn-ghost:hover { transform: translateY(-2px); background: rgba(255,255,255,0.08); }
    .btn-lg { padding: 1rem 1.7rem; font-size: 1rem; }

    .grad-text { background: var(--grad); -webkit-background-clip:text; background-clip:text; -webkit-text-fill-color:transparent; }

    /* Shiny pill badge */
    .pill { display:inline-flex; align-items:center; gap:8px; font-size:0.8rem; font-weight:500;
      padding:0.45rem 0.9rem 0.45rem 0.55rem; border-radius:999px;
      background: rgba(255,255,255,0.04); border:1px solid var(--border-2); color:#cfcede; }
    .pill .dot { width:22px; height:22px; border-radius:50%; background: var(--grad); display:grid; place-items:center; color:#fff; }
    .pill .shiny { background: linear-gradient(90deg,#9a99a8 30%,#fff 50%,#9a99a8 70%); background-size:200% 100%;
      -webkit-background-clip:text; background-clip:text; -webkit-text-fill-color:transparent; animation: shiny 4s linear infinite; }

    /* Gradient-border card (border beam) */
    .beam { position:relative; border-radius: var(--r-lg); background: var(--bg-2); }
    .beam::before { content:""; position:absolute; inset:0; border-radius:inherit; padding:1px;
      background: linear-gradient(135deg, rgba(139,92,246,0.65), rgba(34,211,238,0.4) 48%, rgba(217,70,239,0.55));
      -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
      -webkit-mask-composite: xor; mask-composite: exclude; pointer-events:none; }

    /* ── Keyframes ── */
    @keyframes drift { 0%,100%{ transform: translate(0,0) } 50%{ transform: translate(30px,40px) } }
    @keyframes shimmer { 0%{ left:-160% } 60%,100%{ left:160% } }
    @keyframes shiny { to { background-position: -200% 0; } }
    @keyframes spin { to { transform: rotate(360deg); } }
    @keyframes floaty { 0%,100%{ transform: translateY(0) } 50%{ transform: translateY(-12px) } }
    @keyframes dash { to { stroke-dashoffset: -22; } }
    @keyframes pulseGlow { 0%,100%{ opacity:.5 } 50%{ opacity:1 } }
    @keyframes marquee { from{ transform: translateX(0) } to{ transform: translateX(calc(-50% - 1rem)) } }
    @keyframes riseIn { from{ opacity:0; transform: translateY(30px) } to{ opacity:1; transform:none } }
    @keyframes blink { 0%,100%{ opacity:1 } 50%{ opacity:0 } }
    @keyframes nodeBob { 0%,100%{ transform: translate(-50%,-50%) } 50%{ transform: translate(-50%,calc(-50% - 6px)) } }

    .reveal { opacity:0; }
    .reveal.in { animation: riseIn .8s var(--ease) forwards; }
    .d1{ animation-delay:.06s } .d2{ animation-delay:.14s } .d3{ animation-delay:.22s }
    .d4{ animation-delay:.3s } .d5{ animation-delay:.38s } .d6{ animation-delay:.46s }
    @media (prefers-reduced-motion: reduce){ .lp *{ animation:none!important; transition:none!important } .reveal{ opacity:1!important } }

    /* ── Nav ── */
    /* Overlaid on the hero — no separate background. */
    .nav { position: absolute; top: 0; left: 0; right: 0; z-index: 50; }
    .nav-in { display:flex; align-items:center; justify-content:space-between; padding: 24px 10px; }
    .nav-logo { display:flex; align-items:center; gap:10px; font-family:var(--font-display); font-weight:700; font-size:1.05rem; color:#fff; text-decoration:none; }
    .nav-mark { width:34px; height:34px; border-radius:10px; background:var(--grad); display:grid; place-items:center; color:#fff; box-shadow:0 6px 18px rgba(139,92,246,.4); }
    .nav-links { display:flex; gap:4px; }
    .nav-links a { color:#c3c2d0; font-size:0.9rem; font-weight:500; text-decoration:none; padding:0.5rem 0.9rem; border-radius:999px; transition:.2s; }
    .nav-links a:hover { color:#fff; background: rgba(255,255,255,0.06); }
    .nav-right { display:flex; align-items:center; gap:10px; }
    .nav-signin { color:#d7d6e2; text-decoration:none; font-size:0.9rem; font-weight:600; padding:0.6rem 0.9rem; }
    .nav-signin:hover{ color:#fff; }
    .burger { display:none; width:42px; height:42px; border-radius:50%; background:rgba(255,255,255,0.06); border:1px solid var(--border-2); color:#fff; cursor:pointer; place-items:center; }
    @media (max-width:900px){ .nav-links{ display:none } .burger{ display:grid } .nav-signin{ display:none } }
    .sheet { position:fixed; inset:0; z-index:100; background:rgba(8,8,12,0.97); backdrop-filter:blur(14px);
      display:flex; flex-direction:column; align-items:center; justify-content:center; gap:1.4rem; }
    .sheet a { color:#fff; font-family:var(--font-display); font-size:1.6rem; font-weight:600; text-decoration:none; }
    .sheet-x { position:absolute; top:22px; right:22px; width:46px; height:46px; border-radius:50%; background:rgba(255,255,255,0.06); border:1px solid var(--border-2); color:#fff; display:grid; place-items:center; cursor:pointer; }

    /* ── Hero ── */
    .hero { padding: 104px 0 40px; text-align:center; }
    @media (max-width:640px){ .hero{ padding: 88px 0 24px } }
    .hero h1 { font-size: clamp(2.6rem, 6.4vw, 5rem); line-height:1.02; font-weight:600; margin: 26px 0 0; }
    .hero p.sub { max-width: 640px; margin: 22px auto 0; color: var(--muted); font-size: 1.12rem; }
    .hero-cta { display:flex; gap:0.9rem; justify-content:center; margin-top: 34px; flex-wrap:wrap; }
    .hero-trust { display:flex; gap:1.4rem; justify-content:center; margin-top:22px; flex-wrap:wrap; color:var(--dim); font-size:0.82rem; }
    .hero-trust span { display:flex; align-items:center; gap:6px; }
    .hero-trust .g { width:6px; height:6px; border-radius:50%; background: var(--cyan); box-shadow:0 0 8px var(--cyan); }

    /* ── Workflow canvas ── */
    .stage { margin-top: 60px; }
    .canvas-card { position:relative; padding: 8px; }
    .canvas { position:relative; width:100%; aspect-ratio: 16/9; border-radius: calc(var(--r-lg) - 2px);
      background:
        radial-gradient(ellipse at 50% 0%, rgba(139,92,246,0.14), transparent 60%),
        linear-gradient(180deg, #0b0b12, #090910);
      overflow:hidden; }
    .canvas .cdots { position:absolute; inset:0; background-image: radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px); background-size: 26px 26px; opacity:.6; }
    .beams { position:absolute; inset:0; width:100%; height:100%; }
    .beam-base { stroke: rgba(255,255,255,0.12); stroke-width:1.5; fill:none; vector-effect:non-scaling-stroke; }
    .beam-flow { stroke: url(#bg1); stroke-width:2; fill:none; vector-effect:non-scaling-stroke;
      stroke-dasharray: 7 11; animation: dash 1s linear infinite; filter: drop-shadow(0 0 5px rgba(168,85,247,0.7)); }
    .wf-node { position:absolute; transform: translate(-50%,-50%); width: clamp(96px, 16vw, 150px);
      background: rgba(20,20,28,0.92); border:1px solid var(--border-2); border-radius:14px; padding:12px;
      box-shadow: 0 12px 34px rgba(0,0,0,0.5); animation: nodeBob 6s var(--ease) infinite; }
    .wf-node .ic { width:30px; height:30px; border-radius:9px; display:grid; place-items:center; color:#fff; margin-bottom:8px; }
    .wf-node .lbl { font-size: clamp(0.7rem,1.4vw,0.86rem); font-weight:600; color:#fff; font-family:var(--font-display); }
    .wf-node .desc { font-size: 0.68rem; color: var(--dim); margin-top:2px; }
    .wf-node .tag { position:absolute; top:-8px; right:10px; font-size:0.56rem; font-weight:700; letter-spacing:.06em; text-transform:uppercase; padding:2px 7px; border-radius:99px; background:var(--grad); color:#fff; }

    /* floating terminal over the canvas */
    .term { position:absolute; right: -12px; bottom: -26px; width: min(360px, 78%); border-radius:14px;
      background: rgba(9,9,14,0.94); border:1px solid var(--border-2); box-shadow:0 24px 60px rgba(0,0,0,0.6);
      animation: floaty 7s var(--ease) infinite; overflow:hidden; }
    @media (max-width:720px){ .term{ position:static; width:100%; margin-top:14px; animation:none } }
    .term-bar { display:flex; align-items:center; gap:7px; padding:10px 12px; border-bottom:1px solid var(--border); }
    .term-bar i { width:11px; height:11px; border-radius:50%; display:block; }
    .term-bar .t { margin-left:8px; font-size:0.72rem; color:var(--dim); display:flex; align-items:center; gap:6px; }
    .term-body { padding:14px; font-family: var(--font-mono, ui-monospace, 'SF Mono', Menlo, monospace); font-size:0.78rem; line-height:1.75; min-height:120px; }
    .term-body .ln { white-space:pre-wrap; }
    .term-body .pr { color: var(--cyan); }
    .term-body .ok { color: #34d399; }
    .term-body .mut { color: var(--dim); }
    .cursor { display:inline-block; width:8px; height:15px; background:var(--cyan); vertical-align:-2px; margin-left:2px; animation: blink 1s steps(1) infinite; }

    /* ── Hero GradientBlinds background ── */
    .hero-shell { position: relative; }
    .hero-blinds { position: absolute; inset: 0; z-index: 0; opacity: 0.72; }
    .hero-scrim { position: absolute; inset: 0; z-index: 1; pointer-events: none;
      background:
        radial-gradient(115% 82% at 50% -10%, rgba(8,8,12,0.02), rgba(8,8,12,0.5) 55%, rgba(8,8,12,0.92) 88%),
        linear-gradient(180deg, rgba(8,8,12,0.12), rgba(8,8,12,0.28)); }
    .hero-shell > .wrap { position: relative; z-index: 2; }
    .hero-hint { display:inline-flex; align-items:center; gap:6px; margin-top:22px; font-size:0.7rem; letter-spacing:.12em; text-transform:uppercase; color: rgba(255,255,255,0.4); }

    /* ── Marquee ── */
    .marq { position:relative; display:flex; overflow:hidden; gap:1rem; -webkit-mask-image:linear-gradient(90deg,transparent,#000 12%,#000 88%,transparent); mask-image:linear-gradient(90deg,transparent,#000 12%,#000 88%,transparent); }
    .marq-track { display:flex; gap:1rem; flex-shrink:0; animation: marquee 26s linear infinite; }
    .marq-item { display:flex; align-items:center; gap:9px; padding:0.7rem 1.3rem; border-radius:12px; border:1px solid var(--border); background:rgba(255,255,255,0.02); color:#b9b8c6; font-family:var(--font-display); font-weight:600; white-space:nowrap; }
    .marq-item .mi { width:22px; height:22px; border-radius:6px; background: var(--grad); display:grid; place-items:center; color:#fff; }

    /* ── Sections ── */
    .section { padding: 100px 0; }
    @media (max-width:640px){ .section{ padding: 70px 0 } }
    .sec-head { max-width: 640px; margin: 0 auto 56px; text-align:center; }
    .sec-head h2 { font-size: clamp(2rem, 4.2vw, 3rem); font-weight:600; margin-top:16px; line-height:1.08; }
    .sec-head p { color: var(--muted); margin-top:14px; font-size:1.05rem; }
    .eyebrow2 { display:inline-flex; align-items:center; gap:7px; font-size:0.72rem; font-weight:600; letter-spacing:.14em; text-transform:uppercase; color:#c9b6ff; padding:0.35rem 0.8rem; border-radius:999px; background:rgba(139,92,246,0.12); border:1px solid rgba(139,92,246,0.28); }

    /* Bento */
    .bento { display:grid; grid-template-columns: repeat(6,1fr); gap:18px; }
    .cell { position:relative; overflow:hidden; grid-column: span 2; padding:28px; border-radius: var(--r-lg);
      background: linear-gradient(180deg, rgba(255,255,255,0.035), rgba(255,255,255,0.012)); border:1px solid var(--border);
      transition: transform .35s var(--ease), border-color .35s; }
    .cell:hover { transform: translateY(-4px); border-color: var(--border-2); }
    .cell.w3 { grid-column: span 3; }
    .cell.w4 { grid-column: span 4; }
    .cell .glow { position:absolute; width:220px; height:220px; border-radius:50%; filter:blur(70px); opacity:0; transition:opacity .4s; top:-40px; right:-40px; background:radial-gradient(circle,rgba(139,92,246,0.5),transparent 70%); }
    .cell:hover .glow { opacity:.7; }
    .cell .ic { width:46px; height:46px; border-radius:13px; display:grid; place-items:center; color:#fff; margin-bottom:16px; background:rgba(255,255,255,0.05); border:1px solid var(--border-2); }
    .cell h3 { font-size:1.15rem; font-weight:600; }
    .cell p { color:var(--muted); font-size:0.94rem; margin-top:8px; }
    .cell .pills { display:flex; flex-wrap:wrap; gap:8px; margin-top:16px; }
    .cell .p { font-size:0.74rem; color:#c9b6ff; padding:5px 11px; border-radius:999px; background:rgba(139,92,246,0.1); border:1px solid rgba(139,92,246,0.25); }
    @media (max-width:900px){ .bento{ grid-template-columns:1fr 1fr } .cell,.cell.w3,.cell.w4{ grid-column:span 1 } }
    @media (max-width:560px){ .bento{ grid-template-columns:1fr } }

    /* ── Integration method: sticky stacking cards ── */
    .stack { display:flex; flex-direction:column; gap: 26px; }
    .scard { position: sticky; border-radius: 32px; overflow:hidden; border:1px solid var(--border-2);
      background: linear-gradient(180deg, #10101a, #0b0b12); box-shadow: 0 -6px 44px rgba(0,0,0,0.5); }
    .scard-in { display:grid; grid-template-columns: 1fr 1fr; gap: 34px; padding: 46px; align-items:center; min-height: 360px; }
    .scard .kicker { display:flex; align-items:center; gap:12px; margin-bottom:16px; }
    .scard .num { width:44px; height:44px; border-radius:13px; display:grid; place-items:center; color:#fff; font-family:var(--font-display); font-weight:700; font-size:1.05rem; box-shadow:0 8px 22px rgba(0,0,0,0.4); }
    .scard .step-l { font-size:0.72rem; font-weight:600; letter-spacing:.14em; text-transform:uppercase; color:var(--muted); }
    .scard h3 { font-size: clamp(1.5rem, 3vw, 2.2rem); font-weight:600; line-height:1.1; }
    .scard p.sd { color: var(--muted); font-size:1rem; margin-top:14px; max-width:440px; }
    .scard .feats { display:flex; flex-direction:column; gap:10px; margin-top:20px; }
    .scard .feats span { display:flex; align-items:center; gap:9px; font-size:0.9rem; color:#cbcad6; }
    .scard .feats .fk { width:19px; height:19px; border-radius:50%; display:grid; place-items:center; color:#fff; flex-shrink:0; }
    .scard .visual { position:relative; }
    @media (max-width:820px){ .scard-in{ grid-template-columns:1fr; padding:28px } .scard .visual{ order:-1 } }

    .vpanel { background:#0a0a12; border:1px solid var(--border); border-radius:16px; padding:16px; }
    .vchip { display:flex; align-items:center; gap:11px; padding:11px 13px; border-radius:12px; background:rgba(255,255,255,0.028); border:1px solid var(--border); }
    .vchip + .vchip { margin-top:9px; }
    .vchip .vi { width:32px; height:32px; border-radius:9px; display:grid; place-items:center; color:#fff; flex-shrink:0; }
    .vchip .vt { font-size:0.86rem; color:#e7e6f0; font-weight:500; }
    .vchip .vs { font-size:0.72rem; color:var(--dim); margin-top:1px; }
    .vchip .vst { margin-left:auto; font-size:0.66rem; font-weight:600; color:#34d399; background:rgba(52,211,153,0.12); border:1px solid rgba(52,211,153,0.25); padding:3px 8px; border-radius:99px; }
    .codeblk { background:#0a0a12; border:1px solid var(--border); border-radius:16px; overflow:hidden; }
    .codeblk .cbar { display:flex; gap:6px; padding:11px 13px; border-bottom:1px solid var(--border); }
    .codeblk .cbar i { width:10px; height:10px; border-radius:50%; }
    .codeblk pre { margin:0; padding:16px; font-family:ui-monospace,'SF Mono',Menlo,monospace; font-size:0.76rem; line-height:1.75; color:#cbd5e1; overflow-x:auto; white-space:pre; }
    .codeblk .k { color:#c084fc } .codeblk .s { color:#5eead4 } .codeblk .c { color:#6b7280 }
    .vpersona { text-align:center; padding:24px 18px; }
    .vpersona .face { width:66px; height:66px; border-radius:50%; margin:0 auto 12px; display:grid; place-items:center; color:#fff; box-shadow:0 10px 30px rgba(139,92,246,0.4); }
    .vpersona .pw { display:flex; gap:8px; justify-content:center; flex-wrap:wrap; margin-top:12px; }
    .vpersona .pw span { font-size:0.74rem; color:#c9b6ff; padding:5px 11px; border-radius:999px; background:rgba(139,92,246,0.1); border:1px solid rgba(139,92,246,0.25); }

    /* Integrations */
    .integ { position:relative; height: 420px; max-width:760px; margin:0 auto; }
    .integ svg { position:absolute; inset:0; width:100%; height:100%; }
    .ihub { position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); width:96px; height:96px; border-radius:24px; background:var(--grad); display:grid; place-items:center; color:#fff; box-shadow:0 0 50px rgba(168,85,247,0.6); z-index:2; padding:6px; }
    .inode { position:absolute; transform:translate(-50%,-50%); width:64px; height:64px; border-radius:18px; padding:12px;
      background: linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02)); border:1px solid var(--border-2);
      display:grid; place-items:center; box-shadow:0 12px 30px rgba(0,0,0,0.5); z-index:2;
      transition: transform .3s var(--ease), border-color .3s; }
    .inode:hover { transform: translate(-50%,-50%) scale(1.09); border-color: rgba(255,255,255,0.28); }
    .inode .chip { width:100%; height:100%; border-radius:12px; display:grid; place-items:center; color:#fff; }
    @media (max-width:560px){ .integ{ height:340px } .inode{ width:56px; height:56px; padding:10px } }

    /* Stats */
    .stats { display:grid; grid-template-columns: repeat(4,1fr); gap:18px; }
    .stat { text-align:center; padding:34px 18px; border-radius:var(--r-lg); border:1px solid var(--border); background:rgba(255,255,255,0.02); }
    .stat .n { font-family:var(--font-display); font-size:clamp(2.2rem,4vw,3rem); font-weight:600; }
    .stat .l { color:var(--muted); font-size:0.9rem; margin-top:6px; }
    @media (max-width:720px){ .stats{ grid-template-columns:1fr 1fr } }

    /* Testimonials marquee */
    .tcard { width: 380px; flex-shrink:0; padding:26px; border-radius:var(--r-lg); border:1px solid var(--border); background:linear-gradient(180deg,rgba(255,255,255,0.035),rgba(255,255,255,0.01)); white-space:normal; }
    .tcard .q { color:#e7e6f0; font-size:0.98rem; line-height:1.6; }
    .tcard .who { display:flex; align-items:center; gap:12px; margin-top:18px; }
    .tcard .av { width:40px; height:40px; border-radius:50%; background:var(--grad); display:grid; place-items:center; color:#fff; font-weight:600; font-family:var(--font-display); font-size:0.8rem; }
    .tcard .nm { font-weight:600; font-size:0.9rem; color:#fff; }
    .tcard .rl { font-size:0.78rem; color:var(--dim); }

    /* Pricing */
    .pricing { display:grid; grid-template-columns: repeat(3,1fr); gap:18px; align-items:start; }
    .plan { position:relative; padding:32px; border-radius:var(--r-lg); border:1px solid var(--border); background:rgba(255,255,255,0.02); transition:transform .3s var(--ease); }
    .plan:hover{ transform:translateY(-4px); }
    .plan.pop { background: linear-gradient(180deg, rgba(139,92,246,0.14), rgba(255,255,255,0.02)); }
    .pbadge { position:absolute; top:-13px; left:50%; transform:translateX(-50%); background:var(--grad); color:#fff; font-size:0.68rem; font-weight:700; letter-spacing:.05em; padding:5px 14px; border-radius:999px; }
    .pname { font-family:var(--font-display); font-size:0.78rem; font-weight:600; letter-spacing:.12em; text-transform:uppercase; color:var(--muted); }
    .pprice { font-family:var(--font-display); font-size:2.6rem; font-weight:600; margin:12px 0 4px; }
    .pprice span { font-size:0.9rem; color:var(--dim); font-weight:400; }
    .pdesc { color:var(--muted); font-size:0.88rem; margin-bottom:22px; }
    .pfeat { list-style:none; display:flex; flex-direction:column; gap:11px; margin:0 0 26px; padding:0; }
    .pfeat li { display:flex; align-items:center; gap:10px; font-size:0.9rem; color:#cbcad6; }
    .pfeat .ck { width:18px; height:18px; border-radius:50%; background:rgba(139,92,246,0.18); border:1px solid rgba(139,92,246,0.4); display:grid; place-items:center; color:#c9b6ff; flex-shrink:0; }
    .plan .btn { width:100%; justify-content:center; }
    @media (max-width:900px){ .pricing{ grid-template-columns:1fr } }

    /* CTA */
    .cta-card { position:relative; overflow:hidden; text-align:center; padding:90px 28px; border-radius:var(--r-xl);
      background: radial-gradient(120% 140% at 50% 0%, rgba(139,92,246,0.35), transparent 60%), var(--bg-2); border:1px solid var(--border-2); }
    .cta-card h2 { font-size:clamp(2rem,5vw,3.4rem); font-weight:600; max-width:680px; margin:0 auto 14px; }
    .cta-card p { color:var(--muted); max-width:480px; margin:0 auto 30px; font-size:1.05rem; }
    .cta-actions{ display:flex; gap:1rem; justify-content:center; flex-wrap:wrap; }

    /* ── FAQ accordion ── */
    .faq { max-width: 760px; margin: 0 auto; display:flex; flex-direction:column; gap:14px; }
    .faq-item { border:1px solid var(--border); border-radius:16px; background: rgba(255,255,255,0.025); overflow:hidden; transition: border-color .3s, background .3s; }
    .faq-item.open { border-color: var(--border-2); background: rgba(255,255,255,0.04); }
    .faq-q { width:100%; display:flex; align-items:center; justify-content:space-between; gap:16px;
      padding:22px 24px; background:none; border:none; cursor:pointer; text-align:left;
      font-family:var(--font-display); font-size:1.02rem; font-weight:500; color:#fff; }
    .faq-plus { flex-shrink:0; width:30px; height:30px; border-radius:9px; display:grid; place-items:center;
      color:#c9b6ff; background:rgba(139,92,246,0.12); border:1px solid rgba(139,92,246,0.28);
      transition: transform .4s var(--ease), background .3s; }
    .faq-item.open .faq-plus { transform: rotate(45deg); background: var(--grad); color:#fff; border-color:transparent; }
    .faq-body { display:grid; grid-template-rows: 0fr; transition: grid-template-rows .5s ease-in-out; }
    .faq-item.open .faq-body { grid-template-rows: 1fr; }
    .faq-body > div { overflow:hidden; }
    .faq-body p { color: var(--muted); font-size:0.95rem; padding: 0 24px 24px; margin:0; }

    /* Footer */
    .foot { border-top:1px solid var(--border); padding:56px 0 34px; margin-top:40px; }
    .foot-top { display:grid; grid-template-columns:2fr repeat(4,1fr); gap:32px; }
    .foot .brand .logo { display:flex; align-items:center; gap:10px; font-family:var(--font-display); font-weight:700; color:#fff; }
    .foot .brand p { color:var(--dim); font-size:0.9rem; margin-top:12px; max-width:260px; }
    .foot .soc { display:flex; gap:8px; margin-top:16px; }
    .foot .soc a { width:38px; height:38px; border-radius:11px; border:1px solid var(--border); display:grid; place-items:center; color:var(--muted); background:rgba(255,255,255,0.02); transition:.2s; }
    .foot .soc a:hover { color:#fff; background:var(--grad); border-color:transparent; }
    .foot h4 { font-size:0.78rem; letter-spacing:.08em; text-transform:uppercase; color:#fff; margin-bottom:14px; }
    .foot ul { list-style:none; padding:0; display:flex; flex-direction:column; gap:9px; }
    .foot ul a { color:var(--muted); font-size:0.9rem; text-decoration:none; }
    .foot ul a:hover { color:#fff; }
    .foot-bot { display:flex; align-items:center; justify-content:space-between; margin-top:36px; padding-top:22px; border-top:1px solid var(--border); color:var(--dim); font-size:0.84rem; flex-wrap:wrap; gap:10px; }
    @media (max-width:820px){ .foot-top{ grid-template-columns:1fr 1fr } }
    @media (max-width:520px){ .foot-top{ grid-template-columns:1fr } .foot-bot{ flex-direction:column; align-items:flex-start } }
  `}</style>
);

function useReveal() {
  const ref = useRef<HTMLElement | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12 },
    );
    el.querySelectorAll(".reveal").forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, []);
  return ref;
}

/* ───────────────────────── NAV ───────────────────────── */
function Nav() {
  const [open, setOpen] = useState(false);
  const links = [
    { label: "Features", href: "#features" },
    { label: "How it works", href: "#how" },
    { label: "Integrations", href: "#integrations" },
    { label: "Pricing", href: "#pricing" },
    { label: "FAQ", href: "#faq" },
  ];
  return (
    <nav className="nav">
      <div className="wrap">
        <div className="nav-in">
          <a href="#" className="nav-logo">
            <span className="nav-mark">
              <Sparkles size={18} />
            </span>
            AVAT Avatar
          </a>
          <div className="nav-links">
            {links.map((l) => (
              <a key={l.label} href={l.href}>
                {l.label}
              </a>
            ))}
          </div>
          <div className="nav-right">
            <a href="/login" className="nav-signin">
              Sign in
            </a>
            <a href="/login" className="btn btn-primary">
              Get started <ArrowRight size={16} />
            </a>
            <button
              className="burger"
              onClick={() => setOpen(true)}
              aria-label="Menu"
            >
              <Menu size={20} />
            </button>
          </div>
        </div>
      </div>
      {open && (
        <div className="sheet">
          <button
            className="sheet-x"
            onClick={() => setOpen(false)}
            aria-label="Close"
          >
            <X size={22} />
          </button>
          {links.map((l) => (
            <a key={l.label} href={l.href} onClick={() => setOpen(false)}>
              {l.label}
            </a>
          ))}
          <a
            href="/login"
            className="btn btn-primary btn-lg"
            onClick={() => setOpen(false)}
          >
            Get started <ArrowRight size={16} />
          </a>
        </div>
      )}
    </nav>
  );
}

/* ─────────────────── WORKFLOW NODE-GRAPH ─────────────────── */
const NODES = [
  {
    x: 16,
    y: 24,
    ic: <MessageSquare size={15} />,
    c: "#8b5cf6",
    lbl: "Trigger",
    desc: "User speaks",
    tag: "in",
  },
  {
    x: 16,
    y: 76,
    ic: <BookOpen size={15} />,
    c: "#22d3ee",
    lbl: "Knowledge",
    desc: "RAG search",
  },
  {
    x: 50,
    y: 50,
    ic: <Cpu size={16} />,
    c: "#a855f7",
    lbl: "AI Core",
    desc: "Reason + plan",
    tag: "llm",
  },
  {
    x: 84,
    y: 24,
    ic: <Video size={15} />,
    c: "#d946ef",
    lbl: "Avatar",
    desc: "Lip-sync",
    tag: "out",
  },
  {
    x: 84,
    y: 76,
    ic: <Mic size={15} />,
    c: "#fb7185",
    lbl: "Voice",
    desc: "TTS stream",
  },
];
const PATHS = [
  "M20,27 C34,33 39,44 47,49",
  "M20,73 C34,67 39,56 47,51",
  "M53,49 C64,44 69,33 80,27",
  "M53,51 C64,56 69,67 80,73",
];

function WorkflowCanvas({ withTerminal = false }: { withTerminal?: boolean }) {
  return (
    <div className="beam canvas-card">
      <div className="canvas">
        <div className="cdots" />
        <svg className="beams" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <linearGradient id="bg1" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#22d3ee" />
              <stop offset="50%" stopColor="#8b5cf6" />
              <stop offset="100%" stopColor="#d946ef" />
            </linearGradient>
          </defs>
          {PATHS.map((d, i) => (
            <path key={`b${i}`} className="beam-base" d={d} />
          ))}
          {PATHS.map((d, i) => (
            <path
              key={`f${i}`}
              className="beam-flow"
              d={d}
              style={{ animationDelay: `${i * 0.25}s` }}
            />
          ))}
        </svg>
        {NODES.map((n) => (
          <div
            key={n.lbl}
            className="wf-node"
            style={{
              left: `${n.x}%`,
              top: `${n.y}%`,
              animationDelay: `${n.x * 0.03}s`,
            }}
          >
            {n.tag && <span className="tag">{n.tag}</span>}
            <span
              className="ic"
              style={{ background: n.c, boxShadow: `0 6px 18px ${n.c}66` }}
            >
              {n.ic}
            </span>
            <div className="lbl">{n.lbl}</div>
            <div className="desc">{n.desc}</div>
          </div>
        ))}
      </div>
      {withTerminal && <Terminal />}
    </div>
  );
}

/* ─────────────────────── TERMINAL ─────────────────────── */
const SCRIPT = [
  { t: "$ avat deploy --agent support", cls: "pr" },
  { t: "→ provisioning realtime pipeline…", cls: "mut" },
  { t: "✓ avatar streaming @ 24fps", cls: "ok" },
  { t: "✓ voice + lip-sync synced (412ms)", cls: "ok" },
  { t: "✓ live at avat.ai/support", cls: "ok" },
];

function Terminal() {
  const [lines, setLines] = useState<{ t: string; cls: string }[]>([]);
  const [typing, setTyping] = useState("");
  useEffect(() => {
    let li = 0;
    let ci = 0;
    let timer: ReturnType<typeof setTimeout>;
    const step = () => {
      if (li >= SCRIPT.length) {
        timer = setTimeout(() => {
          setLines([]);
          setTyping("");
          li = 0;
          ci = 0;
          step();
        }, 2600);
        return;
      }
      const cur = SCRIPT[li];
      if (ci <= cur.t.length) {
        setTyping(cur.t.slice(0, ci));
        ci++;
        timer = setTimeout(step, 26);
      } else {
        setLines((p) => [...p, cur]);
        setTyping("");
        li++;
        ci = 0;
        timer = setTimeout(step, 260);
      }
    };
    step();
    return () => clearTimeout(timer);
  }, []);
  const curCls = SCRIPT[lines.length]?.cls ?? "pr";
  return (
    <div className="term">
      <div className="term-bar">
        <i style={{ background: "#ff5f57" }} />
        <i style={{ background: "#febc2e" }} />
        <i style={{ background: "#28c840" }} />
        <span className="t">
          <TerminalIcon size={12} /> avat — cli
        </span>
      </div>
      <div className="term-body">
        {lines.map((l, i) => (
          <div key={i} className={`ln ${l.cls}`}>
            {l.t}
          </div>
        ))}
        <div className={`ln ${curCls}`}>
          {typing}
          <span className="cursor" />
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────── HERO ─────────────────────── */
function Hero() {
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setPaused(mq.matches);
    apply();
    mq.addEventListener?.("change", apply);
    return () => mq.removeEventListener?.("change", apply);
  }, []);
  return (
    <header className="hero-shell">
      {/* GradientBlinds as the atmospheric hero background */}
      <GradientBlinds
        className="hero-blinds"
        gradientColors={["#22d3ee", "#8b5cf6", "#d946ef", "#fb7185"]}
        angle={-18}
        noise={0.12}
        blindCount={26}
        blindMinWidth={42}
        spotlightRadius={0.78}
        spotlightSoftness={0.9}
        spotlightOpacity={0.7}
        mouseDampening={0.14}
        distortAmount={2}
        shineDirection="left"
        mixBlendMode="lighten"
        paused={paused}
      />
      <div className="hero-scrim" />
      <div className="wrap">
        <section className="hero">
          <span className="pill reveal in">
            <span className="dot">
              <Sparkles size={12} />
            </span>
            <span className="shiny">
              Realtime AI avatars · now with live voice
            </span>
          </span>
          <h1 className="reveal in d1">
            Build lifelike AI agents
            <br />
            <span className="grad-text">that talk back</span>
          </h1>
          <p className="sub reveal in d2">
            Design, connect, and deploy emotion-aware avatars on a visual canvas
            — voice, video, and knowledge wired together in minutes, not months.
          </p>
          <div className="hero-cta reveal in d3">
            <a href="/login" className="btn btn-primary btn-lg">
              Start building free <ArrowRight size={18} />
            </a>
            <a href="#how" className="btn btn-ghost btn-lg">
              <Play size={16} /> Watch demo
            </a>
          </div>
          <div className="hero-trust reveal in d4">
            <span>
              <span className="g" /> No credit card
            </span>
            <span>
              <span className="g" /> 14-day pro trial
            </span>
            <span>
              <span className="g" /> Deploy in one line
            </span>
          </div>
          <div className="hero-hint reveal in d5">
            <MousePointer2 size={11} /> Move your cursor — the background reacts
          </div>
        </section>
        <div className="stage reveal in d3">
          <WorkflowCanvas withTerminal />
        </div>
      </div>
    </header>
  );
}

/* ─────────────────── LOGO MARQUEE ─────────────────── */
function LogoMarquee() {
  const logos = [
    { n: "Shellframe", I: Layers },
    { n: "SmartFinder", I: Cpu },
    { n: "Zoomerr", I: Zap },
    { n: "Kontrastr", I: BarChart3 },
    { n: "WaveMarathon", I: Mic },
    { n: "Nebula", I: Boxes },
    { n: "Flowdesk", I: Workflow },
  ];
  const row = [...logos, ...logos];
  return (
    <div className="wrap" style={{ marginTop: 70 }}>
      <p
        style={{
          textAlign: "center",
          color: "var(--dim)",
          fontSize: "0.85rem",
          marginBottom: 22,
        }}
      >
        Powering conversation teams at fast-moving companies
      </p>
      <div className="marq">
        <div className="marq-track">
          {row.map((l, i) => (
            <div className="marq-item" key={i}>
              <span className="mi">
                <l.I size={13} />
              </span>
              {l.n}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────── BENTO FEATURES ─────────────────── */
function Features() {
  const ref = useReveal();
  return (
    <section className="section" id="features" ref={ref}>
      <div className="wrap">
        <div className="sec-head reveal">
          <span className="eyebrow2">
            <Sparkles size={11} /> Capabilities
          </span>
          <h2>Everything you need to ship visual conversations</h2>
          <p>
            Enterprise-grade avatars with the ergonomics of a no-code canvas.
          </p>
        </div>
        <div className="bento">
          <div className="cell w4 reveal">
            <div className="glow" />
            <div className="ic">
              <MessageSquare size={22} />
            </div>
            <h3>Conversational intelligence</h3>
            <p>
              Multi-turn dialogue with context memory, intent detection, and
              goal tracking — your avatar understands and drives the
              conversation forward.
            </p>
            <div className="pills">
              <span className="p">Intent detection</span>
              <span className="p">Sentiment</span>
              <span className="p">Context memory</span>
              <span className="p">Goal tracking</span>
            </div>
          </div>
          <div className="cell reveal d1">
            <div className="glow" />
            <div className="ic">
              <Zap size={22} />
            </div>
            <h3>Sub-500ms latency</h3>
            <p>
              Voice-to-video responses fast enough to feel human, on an
              optimized edge network.
            </p>
          </div>
          <div className="cell reveal d2">
            <div className="glow" />
            <div className="ic">
              <Globe size={22} />
            </div>
            <h3>60+ languages</h3>
            <p>
              Real-time translation and accurate lip-sync across regional
              dialects.
            </p>
          </div>
          <div className="cell reveal d3">
            <div className="glow" />
            <div className="ic">
              <Cpu size={22} />
            </div>
            <h3>Custom personas</h3>
            <p>
              Train on your brand voice and product docs. Ship with no-code
              workflows.
            </p>
          </div>
          <div className="cell reveal d4">
            <div className="glow" />
            <div className="ic">
              <ShieldCheck size={22} />
            </div>
            <h3>Enterprise security</h3>
            <p>
              SOC 2 Type II, end-to-end encryption, and zero-data-retention
              modes.
            </p>
          </div>
          <div className="cell w2 reveal d2" style={{ gridColumn: "span 2" }}>
            <div className="glow" />
            <div className="ic">
              <BarChart3 size={22} />
            </div>
            <h3>Deep analytics</h3>
            <p>
              Engagement, resolution rate, sentiment, and conversion funnels —
              live.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────── INTEGRATION METHOD — sticky stacking cards ─────────── */
function IntegrationMethod() {
  const ref = useReveal();
  const cards = [
    {
      color: "#8b5cf6",
      step: "Step 01",
      title: "Drop in one line",
      desc: "Paste a single script tag anywhere on your site. No SDK, no build step, no infrastructure to run.",
      feats: [
        { c: "#8b5cf6", t: "Works on any stack" },
        { c: "#22d3ee", t: "Loads async — zero jank" },
      ],
      visual: (
        <div className="codeblk">
          <div className="cbar">
            <i style={{ background: "#ff5f57" }} />
            <i style={{ background: "#febc2e" }} />
            <i style={{ background: "#28c840" }} />
          </div>
          <pre>
            <span className="c">{"// add before </body>"}</span>
            {"\n"}
            <span className="k">{"<script"}</span> src=
            <span className="s">{'"https://avat.ai/widget.js"'}</span>{" "}
            <span className="k">{"async></script>"}</span>
            {"\n"}
            <span className="k">{"<script>"}</span>
            {"\n  "}AVAT.<span className="s">init</span>
            {"({ agent: "}
            <span className="s">{'"support"'}</span>
            {" })"}
            {"\n"}
            <span className="k">{"</script>"}</span>
          </pre>
        </div>
      ),
    },
    {
      color: "#22d3ee",
      step: "Step 02",
      title: "Connect your knowledge",
      desc: "Upload docs, PDFs, and FAQs. The avatar indexes them and cites the right source mid-conversation.",
      feats: [
        { c: "#22d3ee", t: "Auto-chunked & embedded" },
        { c: "#8b5cf6", t: "Live re-indexing" },
      ],
      visual: (
        <div className="vpanel">
          {[
            {
              i: <FileText size={15} />,
              t: "product-handbook.pdf",
              s: "2.4 MB · 128 chunks",
              c: "#8b5cf6",
            },
            {
              i: <BookOpen size={15} />,
              t: "billing-faq.md",
              s: "36 KB · 22 chunks",
              c: "#22d3ee",
            },
            {
              i: <FileText size={15} />,
              t: "onboarding.docx",
              s: "540 KB · 61 chunks",
              c: "#d946ef",
            },
          ].map((d) => (
            <div className="vchip" key={d.t}>
              <span className="vi" style={{ background: d.c }}>
                {d.i}
              </span>
              <div>
                <div className="vt">{d.t}</div>
                <div className="vs">{d.s}</div>
              </div>
              <span className="vst">Ready</span>
            </div>
          ))}
        </div>
      ),
    },
    {
      color: "#d946ef",
      step: "Step 03",
      title: "Design the persona",
      desc: "Pick a face, a natural voice, and a personality. Tune the system prompt and you're ready to talk.",
      feats: [
        { c: "#d946ef", t: "60+ languages & voices" },
        { c: "#fb7185", t: "Real-time lip-sync" },
      ],
      visual: (
        <div className="vpanel vpersona">
          <div className="face" style={{ background: "var(--grad)" }}>
            <Video size={26} />
          </div>
          <div
            style={{
              fontWeight: 600,
              color: "#fff",
              fontFamily: "var(--font-display)",
            }}
          >
            Nova — Support
          </div>
          <div
            style={{ fontSize: "0.78rem", color: "var(--dim)", marginTop: 2 }}
          >
            Warm · concise · empathetic
          </div>
          <div className="pw">
            <span>Voice: Skylar</span>
            <span>English</span>
            <span>GPT-4o</span>
          </div>
        </div>
      ),
    },
    {
      color: "#fb7185",
      step: "Step 04",
      title: "Watch it wire together",
      desc: "Trigger, knowledge, reasoning, voice, and avatar connect into one realtime pipeline — live in seconds.",
      feats: [
        { c: "#fb7185", t: "Sub-500ms responses" },
        { c: "#34d399", t: "Deploy to web, app or kiosk" },
      ],
      visual: <WorkflowCanvas />,
    },
  ];
  return (
    <section className="section" id="how" ref={ref}>
      <div className="wrap">
        <div className="sec-head reveal">
          <span className="eyebrow2">
            <Workflow size={11} /> Integration method
          </span>
          <h2>Go live in four moves</h2>
          <p>Scroll through the deck — each step stacks on the last.</p>
        </div>
        <div className="stack">
          {cards.map((c, i) => (
            <div
              key={c.step}
              className="scard"
              style={{ top: `${100 + i * 14}px` }}
            >
              <div className="scard-in">
                <div>
                  <div className="kicker">
                    <span className="num" style={{ background: c.color }}>
                      {i + 1}
                    </span>
                    <span className="step-l">{c.step}</span>
                  </div>
                  <h3>{c.title}</h3>
                  <p className="sd">{c.desc}</p>
                  <div className="feats">
                    {c.feats.map((f) => (
                      <span key={f.t}>
                        <span className="fk" style={{ background: f.c }}>
                          <Check size={11} strokeWidth={3} />
                        </span>
                        {f.t}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="visual">{c.visual}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────── INTEGRATIONS BEAMS ─────────────────── */
function Integrations() {
  const ref = useReveal();
  // nodes around the hub (percent positions + accent color)
  const ring = [
    { x: 12, y: 20, I: MessageSquare, c: "#8b5cf6" },
    { x: 12, y: 80, I: BookOpen, c: "#22d3ee" },
    { x: 50, y: 8, I: Video, c: "#d946ef" },
    { x: 50, y: 92, I: Mic, c: "#fb7185" },
    { x: 88, y: 20, I: Globe, c: "#38bdf8" },
    { x: 88, y: 80, I: BarChart3, c: "#f59e0b" },
  ];
  return (
    <section className="section" id="integrations" ref={ref}>
      <div className="wrap">
        <div className="sec-head reveal">
          <span className="eyebrow2">
            <Boxes size={11} /> Integrations
          </span>
          <h2>Plug into your entire stack</h2>
          <p>
            Connect voice, video, knowledge, and analytics — data flows through
            one core.
          </p>
        </div>
        <div className="integ reveal d1">
          <svg viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <linearGradient id="ig" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#22d3ee" />
                <stop offset="100%" stopColor="#d946ef" />
              </linearGradient>
            </defs>
            {ring.map((n, i) => (
              <path
                key={`ib${i}`}
                d={`M${n.x},${n.y} L50,50`}
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="1.5"
                fill="none"
                vectorEffect="non-scaling-stroke"
              />
            ))}
            {ring.map((n, i) => (
              <path
                key={`if${i}`}
                d={`M${n.x},${n.y} L50,50`}
                stroke="url(#ig)"
                strokeWidth="2"
                fill="none"
                vectorEffect="non-scaling-stroke"
                strokeDasharray="6 10"
                style={{
                  animation: `dash 1s linear infinite`,
                  animationDelay: `${i * 0.2}s`,
                }}
              />
            ))}
          </svg>
          <div className="ihub">
            <Sparkles size={34} />
          </div>
          {ring.map((n, i) => (
            <div
              key={i}
              className="inode"
              style={{ left: `${n.x}%`, top: `${n.y}%` }}
            >
              <span
                className="chip"
                style={{
                  background: `linear-gradient(160deg, ${n.c}, ${n.c}99)`,
                  boxShadow: `0 6px 16px ${n.c}55`,
                }}
              >
                <n.I size={20} />
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────── STATS ─────────────────────── */
function Stats() {
  const ref = useReveal();
  const items = [
    { n: "12M+", l: "Conversations handled" },
    { n: "412ms", l: "Median response time" },
    { n: "60+", l: "Languages supported" },
    { n: "99.9%", l: "Uptime SLA" },
  ];
  return (
    <section className="section" ref={ref} style={{ paddingTop: 0 }}>
      <div className="wrap">
        <div className="stats">
          {items.map((s, i) => (
            <div key={s.l} className={`stat reveal d${i + 1}`}>
              <div className="n grad-text">{s.n}</div>
              <div className="l">{s.l}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────── TESTIMONIALS ─────────────────── */
function Testimonials() {
  const cards = [
    {
      q: "Switching to AI avatars cut our resolution time by 40% while lifting CSAT. Closest thing to a scalable human team.",
      n: "Sarah Jenkins",
      r: "VP Customer Success, TechFlow",
    },
    {
      q: "60-language support let us expand globally without hiring. Live in under a day.",
      n: "Ravi Mehta",
      r: "Head of CX, Growlio",
    },
    {
      q: "The analytics alone are worth it — we rebuilt our onboarding from conversation data.",
      n: "Camille Dubois",
      r: "PM, NexaCloud",
    },
    {
      q: "The node canvas made it click for our whole team. Non-engineers ship flows now.",
      n: "Tom Becker",
      r: "Ops Lead, Shellframe",
    },
  ];
  const row = [...cards, ...cards];
  return (
    <section className="section">
      <div className="wrap">
        <div className="sec-head reveal in">
          <span className="eyebrow2">
            <Star size={11} /> Loved by teams
          </span>
          <h2>Built for the teams behind every conversation</h2>
        </div>
      </div>
      <div className="marq">
        <div className="marq-track" style={{ animationDuration: "38s" }}>
          {row.map((c, i) => (
            <div className="tcard" key={i}>
              <div style={{ display: "flex", gap: 3, marginBottom: 12 }}>
                {Array(5)
                  .fill(0)
                  .map((_, j) => (
                    <Star key={j} size={14} fill="#fb7185" stroke="none" />
                  ))}
              </div>
              <div className="q">{c.q}</div>
              <div className="who">
                <div className="av">
                  {c.n
                    .split(" ")
                    .map((w) => w[0])
                    .join("")}
                </div>
                <div>
                  <div className="nm">{c.n}</div>
                  <div className="rl">{c.r}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────── PRICING ─────────────────────── */
function Pricing() {
  const ref = useReveal();
  const plans = [
    {
      name: "Starter",
      price: "$0",
      cta: "Start free",
      desc: "For trying things out.",
      feats: [
        "3 avatar deployments",
        "1,000 conversations/mo",
        "5 languages",
        "Community support",
      ],
    },
    {
      name: "Growth",
      price: "$79",
      cta: "Get started",
      desc: "For scaling teams.",
      pop: true,
      feats: [
        "Unlimited deployments",
        "50,000 conversations/mo",
        "30 languages",
        "Priority support",
        "Analytics dashboard",
        "Custom personas",
      ],
    },
    {
      name: "Enterprise",
      price: "Custom",
      cta: "Contact sales",
      desc: "For large organizations.",
      feats: [
        "Everything in Growth",
        "Unlimited conversations",
        "60+ languages",
        "SOC 2 / SSO / SLA",
        "Dedicated manager",
      ],
    },
  ];
  return (
    <section className="section" id="pricing" ref={ref}>
      <div className="wrap">
        <div className="sec-head reveal">
          <span className="eyebrow2">Pricing</span>
          <h2>Simple, transparent pricing</h2>
          <p>Start free. Scale as you grow.</p>
        </div>
        <div className="pricing">
          {plans.map((p, i) => {
            const inner = (
              <>
                {p.pop && <span className="pbadge">Most popular</span>}
                <div className="pname">{p.name}</div>
                <div
                  className="pprice grad-text"
                  style={
                    p.pop
                      ? undefined
                      : {
                          color: "#fff",
                          WebkitTextFillColor: "initial",
                          background: "none",
                        }
                  }
                >
                  {p.price}
                  <span>{p.price !== "Custom" ? "/mo" : ""}</span>
                </div>
                <div className="pdesc">{p.desc}</div>
                <ul className="pfeat">
                  {p.feats.map((f) => (
                    <li key={f}>
                      <span className="ck">
                        <Check size={11} strokeWidth={3} />
                      </span>
                      {f}
                    </li>
                  ))}
                </ul>
                <a
                  href="/login"
                  className={`btn ${p.pop ? "btn-primary" : "btn-ghost"}`}
                >
                  {p.cta} {p.pop && <ArrowRight size={15} />}
                </a>
              </>
            );
            return p.pop ? (
              <div key={p.name} className={`beam reveal d${i + 1}`}>
                <div
                  className="plan pop"
                  style={{ background: "var(--bg-2)", border: "none" }}
                >
                  {inner}
                </div>
              </div>
            ) : (
              <div key={p.name} className={`plan reveal d${i + 1}`}>
                {inner}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────── FAQ ─────────────────────── */
function FAQ() {
  const ref = useReveal();
  const [open, setOpen] = useState<number | null>(0);
  const items = [
    {
      q: "How fast can I get an avatar live?",
      a: "Most teams ship their first avatar in an afternoon. Design it on the canvas, connect your knowledge base, and deploy with a single line of embed code — no infrastructure to manage.",
    },
    {
      q: "Which languages and voices are supported?",
      a: "60+ languages with real-time translation and accurate lip-sync, plus a library of natural voices. You can also bring your own cloned voice via Cartesia.",
    },
    {
      q: "How low is the response latency?",
      a: "Voice-to-video responses run at a median of ~412ms on our optimized edge network, fast enough to feel like a real conversation.",
    },
    {
      q: "Is my data secure?",
      a: "Yes. We're SOC 2 Type II compliant with end-to-end encryption and optional zero-data-retention modes, so sensitive conversations never persist.",
    },
    {
      q: "Can I use my own LLM and knowledge base?",
      a: "Absolutely. Choose OpenAI or Anthropic models, upload PDFs, docs, and FAQs, and the avatar will cite your sources during conversations.",
    },
  ];
  return (
    <section className="section" id="faq" ref={ref}>
      <div className="wrap">
        <div className="sec-head reveal">
          <span className="eyebrow2">
            <MessageSquare size={11} /> FAQ
          </span>
          <h2>Questions, answered</h2>
          <p>Everything you need to know before you start building.</p>
        </div>
        <div className="faq reveal d1">
          {items.map((it, i) => {
            const isOpen = open === i;
            return (
              <div key={i} className={`faq-item ${isOpen ? "open" : ""}`}>
                <button
                  className="faq-q"
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                >
                  {it.q}
                  <span className="faq-plus">
                    <Plus size={16} />
                  </span>
                </button>
                <div className="faq-body">
                  <div>
                    <p>{it.a}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────── CTA ─────────────────────── */
function CTA() {
  return (
    <section className="section" style={{ paddingTop: 0 }}>
      <div className="wrap">
        <div className="cta-card reveal in">
          <h2>
            Ready to give your product{" "}
            <span className="grad-text">a face?</span>
          </h2>
          <p>
            Join thousands of teams building the next generation of customer
            conversations.
          </p>
          <div className="cta-actions">
            <a href="/login" className="btn btn-primary btn-lg">
              Start building free <ArrowRight size={16} />
            </a>
            <a href="#pricing" className="btn btn-ghost btn-lg">
              View pricing
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────── FOOTER ─────────────────────── */
function Footer() {
  const cols = [
    { h: "Product", l: ["Features", "Pricing", "Integrations", "Changelog"] },
    { h: "Developers", l: ["Docs", "API reference", "SDKs", "Status"] },
    { h: "Company", l: ["About", "Blog", "Careers", "Contact"] },
    { h: "Legal", l: ["Privacy", "Terms", "Security", "GDPR"] },
  ];
  return (
    <footer className="foot">
      <div className="wrap">
        <div className="foot-top">
          <div className="brand">
            <div className="logo">
              <span className="nav-mark">
                <Sparkles size={16} />
              </span>
              AVAT Avatar
            </div>
            <p>
              The platform for deploying emotion-aware AI avatars at enterprise
              scale.
            </p>
            <div className="soc">
              <a href="#" aria-label="Twitter">
                <Twitter size={15} />
              </a>
              <a href="#" aria-label="LinkedIn">
                <Linkedin size={15} />
              </a>
              <a href="#" aria-label="GitHub">
                <Github size={15} />
              </a>
            </div>
          </div>
          {cols.map((c) => (
            <div key={c.h}>
              <h4>{c.h}</h4>
              <ul>
                {c.l.map((x) => (
                  <li key={x}>
                    <a href="#">{x}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="foot-bot">
          <span>© 2026 AVAT Avatar Inc. All rights reserved.</span>
          <a
            href="/login"
            className="nav-signin"
            style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
          >
            Open dashboard <ArrowUpRight size={14} />
          </a>
        </div>
      </div>
    </footer>
  );
}

/* ─────────────────────── ROOT ─────────────────────── */
export default function LandingPage() {
  return (
    <div className="lp">
      <GlobalStyles />
      <div className="lp-bg">
        <div className="lp-dots" />
        <div className="lp-orb o1" />
        <div className="lp-orb o2" />
        <div className="lp-orb o3" />
      </div>
      <div className="lp-inner">
        <Nav />
        <Hero />
        <LogoMarquee />
        <Features />
        <IntegrationMethod />
        <Integrations />
        <Stats />
        <Testimonials />
        <Pricing />
        <FAQ />
        <CTA />
        <Footer />
      </div>
      <div className="grain" />
    </div>
  );
}

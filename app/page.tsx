"use client";

import { useState, useEffect, useRef } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  PlayCircle,
  Mic,
  Video,
  Globe,
  ShieldCheck,
  Menu,
  X,
  Plus,
  Pause,
  Check,
  Sparkles,
  Cpu,
  BarChart3,
  Layers,
  Headphones,
  MessageSquare,
  Zap,
  Star,
  Twitter,
  Linkedin,
  Github,
  Mail,
  LogIn,
  User,
} from "lucide-react";

/* ───────────────────────────────────────────────────────────
   GLOBAL STYLES
   Light theme. Outer gradient frame, inset blush card.
   Display: Clash-style geometric grotesk via "Space Grotesk".
   Body: "Inter". Accent: violet → coral.
─────────────────────────────────────────────────────────────*/
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;450;500;600;700&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --font-display: 'Space Grotesk', sans-serif;
      --font-body: 'Inter', sans-serif;

                      /* outer frame base */
      --blush: #fdeeec;                /* hero card bg */
      --paper: #ffffff;
      --ink: #16121f;                  /* near-black headings */
      --slate: #5b5670;                /* body text */
      --muted: #8b8699;                /* captions */
      --line: #ece7f0;                 /* hairlines */
      --line-soft: #f3eff6;

      --violet: #7c3aed;
      --violet-2: #9333ea;
      --coral: #fb7185;
      --orange: #f97316;

      --grad: linear-gradient(100deg, var(--violet) 0%, var(--violet-2) 38%, var(--coral) 78%, var(--orange) 100%);
      --grad-soft: linear-gradient(135deg, rgba(124,58,237,0.12), rgba(251,113,133,0.12));

      --r-sm: 12px;
      --r-md: 18px;
      --r-lg: 28px;
      --r-xl: 40px;
      --r-full: 9999px;

      --shadow-sm: 0 2px 8px rgba(22,18,31,0.05);
      --shadow-md: 0 12px 40px rgba(22,18,31,0.08);
      --shadow-lg: 0 30px 80px rgba(124,58,237,0.16);
      --ease: cubic-bezier(0.22, 1, 0.36, 1);
      --t: 0.4s var(--ease);
    }

    html { scroll-behavior: smooth; }
    body {
      font-family: var(--font-body);
      background: var(--frame);
      color: var(--ink);
      line-height: 1.6;
      -webkit-font-smoothing: antialiased;
      overflow-x: hidden;
    }

    ::selection { background: rgba(124,58,237,0.18); }
    ::-webkit-scrollbar { width: 9px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: rgba(124,58,237,0.35); border-radius: 99px; }

    .wrap { width: 100%; max-width: 1180px; margin: 0 auto; padding: 0 28px; }

    /* The outer gradient field */
    .frame {
      min-height: 100vh;

      padding: 14px;
    }
    @media (max-width: 640px){ .frame { padding: 7px; } }

    /* ── Buttons ── */
    .btn {
      display: inline-flex; align-items: center; gap: 10px;
      font-family: var(--font-body); font-weight: 600; font-size: 0.95rem;
      border: none; cursor: pointer; text-decoration: none;
      border-radius: var(--r-full); padding: 0.85rem 1.4rem;
      transition: transform var(--t), box-shadow var(--t), background var(--t);
      white-space: nowrap;
    }
    .btn-primary {
      background: var(--grad); color: #fff; padding-left: 0.5rem;
      box-shadow: 0 10px 30px rgba(124,58,237,0.3);
    }
    .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 16px 40px rgba(124,58,237,0.42); }
    .btn-primary .chip {
      width: 34px; height: 34px; border-radius: 50%;
      background: rgba(255,255,255,0.22);
      display: grid; place-items: center;
      transition: transform var(--t);
    }
    .btn-primary:hover .chip { transform: rotate(45deg); }
    .btn-ghost {
      background: var(--paper); color: var(--ink);
      border: 1px solid var(--line);
      box-shadow: var(--shadow-sm);
    }
    .btn-ghost:hover { transform: translateY(-2px); border-color: #ddd4e6; box-shadow: var(--shadow-md); }
    .btn-dark { background: var(--ink); color: #fff; }
    .btn-dark:hover { transform: translateY(-2px); background: #241d33; }
    .btn-lg { padding: 1rem 1.6rem; font-size: 1rem; }
    .btn-lg.btn-primary { padding-left: 0.55rem; }

    .grad-text {
      background: var(--grad);
      -webkit-background-clip: text; background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    /* ── Keyframes ── */
    @keyframes floaty { 0%,100%{ transform: translateY(0) } 50%{ transform: translateY(-14px) } }
    @keyframes floaty-sm { 0%,100%{ transform: translateY(0) } 50%{ transform: translateY(-8px) } }
    @keyframes riseIn { from{ opacity:0; transform: translateY(34px) } to{ opacity:1; transform:none } }
    @keyframes fadeIn { from{ opacity:0 } to{ opacity:1 } }
    @keyframes popIn { from{ opacity:0; transform: scale(0.92) } to{ opacity:1; transform: scale(1) } }
    @keyframes drawLine { to { stroke-dashoffset: 0; } }
    @keyframes marquee { from{ transform: translateX(0) } to{ transform: translateX(-50%) } }
    @keyframes eq { 0%,100%{ transform: scaleY(0.35) } 50%{ transform: scaleY(1) } }
    @keyframes ring { 0%{ box-shadow: 0 0 0 0 rgba(124,58,237,0.45) } 70%{ box-shadow: 0 0 0 14px rgba(124,58,237,0) } 100%{ box-shadow: 0 0 0 0 rgba(124,58,237,0) } }
    @keyframes blink { 0%,100%{ opacity:1 } 50%{ opacity:0.25 } }
    @keyframes spinSlow { to { transform: rotate(360deg); } }

    .reveal { opacity: 0; }
    .reveal.in { animation: riseIn 0.8s var(--ease) forwards; }
    .d1{ animation-delay: .08s } .d2{ animation-delay: .16s } .d3{ animation-delay: .24s }
    .d4{ animation-delay: .32s } .d5{ animation-delay: .4s } .d6{ animation-delay: .48s }

    @media (prefers-reduced-motion: reduce) {
      *, *::before, *::after { animation: none !important; transition: none !important; }
      .reveal { opacity: 1 !important; }
    }

    .eyebrow {
      display: inline-flex; align-items: center; gap: 8px;
      font-size: 0.72rem; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase;
      color: var(--violet);
      background: rgba(124,58,237,0.08);
      border: 1px solid rgba(124,58,237,0.16);
      padding: 0.4rem 0.85rem; border-radius: var(--r-full);
    }

    h1,h2,h3,h4 { font-family: var(--font-display); letter-spacing: -0.02em; }

    @media (max-width: 980px){ .hide-md { display: none !important; } }
    @media (max-width: 640px){ .wrap { padding: 0 18px; } }
  `}</style>
);

/* ── Scroll-reveal hook ── */
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
    el.querySelectorAll(".reveal").forEach((n: any) => io.observe(n));
    return () => io.disconnect();
  }, []);
  return ref;
}

/* ───────────────────────── NAVBAR ───────────────────────── */
function Navbar() {
  const [open, setOpen] = useState(false);
  const links = [
    { label: "How it works", href: "#how" },
    { label: "Use cases", href: "#features" },
    { label: "Features", href: "#features" },
    { label: "Pricing", href: "#pricing" },
    { label: "FAQ", href: "#faq" },
  ];
  return (
    <>
      <style>{`
        .nav { display:flex; align-items:center; justify-content:space-between; padding: 26px 36px 10px; }
        .nav-logo { display:flex; align-items:center; gap:10px; font-family:var(--font-display); font-weight:700; font-size:1.1rem; color:var(--ink); text-decoration:none; }
        .nav-mark { width:40px; height:40px; border-radius:13px; background:var(--ink); display:grid; place-items:center; color:#fff; }
        .nav-mark svg { animation: spinSlow 14s linear infinite; }
        .nav-center { display:flex; gap:6px; background:rgba(255,255,255,0.55); border:1px solid rgba(255,255,255,0.6); backdrop-filter: blur(12px); padding:6px; border-radius:var(--r-full); }
        .nav-center a { font-size:0.9rem; font-weight:500; color:#4a3f5e; text-decoration:none; padding:0.5rem 1rem; border-radius:var(--r-full); transition: var(--t); }
        .nav-center a:hover { background:#fff; color:var(--ink); box-shadow: var(--shadow-sm); }
        .nav-right { display:flex; align-items:center; gap:10px; }
        .nav-icon-btn { width:46px; height:46px; border-radius:50%; display:grid; place-items:center; cursor:pointer; text-decoration:none; transition: var(--t); }
        .nav-icon-btn.outline { background:rgba(255,255,255,0.4); border:1px solid rgba(255,255,255,0.7); color:#fff; }
        .nav-icon-btn.outline:hover { background:rgba(255,255,255,0.65); color:var(--ink); }
        .nav-icon-btn.solid { background:#fff; color:var(--ink); box-shadow: var(--shadow-sm); }
        .nav-icon-btn.solid:hover { transform: translateY(-2px); }
        .burger { display:none; width:46px; height:46px; border-radius:50%; background:#fff; border:none; cursor:pointer; place-items:center; color:var(--ink); }
        @media (max-width: 980px){ .nav-center { display:none; } .burger { display:grid; } .nav-icon-btn.outline { display:none; } }
        @media (max-width: 640px){ .nav { padding: 16px 14px 8px; } }
        .sheet { position:fixed; inset:0; z-index:200; background:rgba(253,238,236,0.98); backdrop-filter:blur(16px); display:flex; flex-direction:column; align-items:center; justify-content:center; gap:1.4rem; animation: fadeIn .2s ease; }
        .sheet a { font-family:var(--font-display); font-size:1.7rem; font-weight:600; color:var(--ink); text-decoration:none; }
        .sheet a:hover { color: var(--violet); }
        .sheet-close { position:absolute; top:22px; right:22px; background:#fff; border:none; border-radius:50%; width:48px; height:48px; display:grid; place-items:center; cursor:pointer; }
      `}</style>
      <nav className="nav">
        <a href="#" className="nav-logo">
          <span className="nav-mark">
            <Sparkles size={20} />
          </span>
          AVAT Avatar
        </a>
        <div className="nav-center">
          {links.map((l) => (
            <a key={l.label} href={l.href}>
              {l.label}
            </a>
          ))}
        </div>
        <div className="nav-right">
          <a href="/login" className="nav-icon-btn outline" aria-label="Sign in">
            <LogIn size={18} />
          </a>
          <a
            href="/dashboard"
            className="nav-icon-btn solid"
            aria-label="Dashboard"
          >
            <User size={18} />
          </a>
          <button
            className="burger"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>
        </div>
      </nav>
      {open && (
        <div className="sheet">
          <button
            className="sheet-close"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
          >
            <X size={22} />
          </button>
          {links.map((l) => (
            <a key={l.label} href={l.href} onClick={() => setOpen(false)}>
              {l.label}
            </a>
          ))}
          <a
            href="/dashboard"
            className="btn btn-primary btn-lg"
            onClick={() => setOpen(false)}
          >
            <span className="chip">
              <ArrowRight size={16} />
            </span>{" "}
            Open dashboard
          </a>
        </div>
      )}
    </>
  );
}

/* ─────────────────────── AVATAR TILE ────────────────────── */
function AvatarTile({
  src,
  ring,
  style,
  className,
}: {
  src: string;
  ring?: boolean;
  style: React.CSSProperties;
  className?: string;
}) {
  return (
    <div className={`av-tile ${className || ""}`} style={style}>
      <style>{`
        .av-tile { position:absolute; width:118px; height:118px; border-radius:24px; overflow:hidden; box-shadow: var(--shadow-md); border:3px solid #fff; }
        .av-tile.ring { border-color: var(--violet); box-shadow: 0 0 0 4px rgba(124,58,237,0.12), var(--shadow-md); }
        .av-tile img { width:100%; height:100%; object-fit:cover; display:block; }
        .av-ctrls { position:absolute; bottom:7px; left:7px; display:flex; gap:5px; }
        .av-ctrls span { width:22px; height:22px; border-radius:7px; background:rgba(22,18,31,0.55); backdrop-filter:blur(4px); display:grid; place-items:center; color:#fff; }
        @media (max-width: 980px){ .av-tile { width:92px; height:92px; border-radius:18px; } }
      `}</style>
      <img src={src} alt="" loading="lazy" />
      <div className="av-ctrls">
        <span>
          <Mic size={11} />
        </span>
        <span>
          <Video size={11} />
        </span>
      </div>
    </div>
  );
}

/* ───────────────────────── HERO ─────────────────────────── */
function Hero() {
  const transcript =
    "The only thing left is to get the final illustration, and";
  const [typed, setTyped] = useState("");
  useEffect(() => {
    let i = 0;
    const id = setInterval(() => {
      i++;
      setTyped(transcript.slice(0, i));
      if (i >= transcript.length) {
        clearInterval(id);
        setTimeout(() => {
          i = 0;
          setTyped("");
        }, 2600);
      }
    }, 55);
    return () => clearInterval(id);
  }, []);

  const faces = [
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=240&h=240&fit=crop&crop=faces",
    "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=240&h=240&fit=crop&crop=faces",
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=240&h=240&fit=crop&crop=faces",
    "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=240&h=240&fit=crop&crop=faces",
  ];

  return (
    <>
      <style>{`
        .hero-card {
          background: linear-gradient(180deg, var(--blush) 0%, #fdf3f1 60%, #ffffff 100%);
          border-radius: var(--r-xl);
          overflow: hidden;
          box-shadow: 0 40px 90px rgba(60,20,80,0.28);
        }
        .hero-main { display:grid; grid-template-columns: 1.02fr 1fr; gap: 30px; padding: 50px 36px 28px; align-items:center; }
        @media (max-width: 980px){ .hero-main { grid-template-columns: 1fr; padding: 28px 22px 20px; } }

        .hero-copy h1 { font-size: clamp(2.6rem, 5.6vw, 4.7rem); line-height: 1.02; font-weight: 600; color: var(--ink); }
        .hero-copy p.sub { margin-top: 1.4rem; max-width: 460px; color: var(--slate); font-size: 1.04rem; }
        .hero-ctas { display:flex; gap: 0.8rem; margin-top: 2rem; flex-wrap: wrap; }
        .hero-trust { display:flex; gap: 1.4rem; margin-top: 1.4rem; flex-wrap: wrap; }
        .hero-trust span { display:flex; align-items:center; gap:6px; font-size: 0.82rem; color: var(--muted); }
        .hero-trust .dot { width:5px; height:5px; border-radius:50%; background: var(--coral); }

        /* Right stage */
        .stage { position: relative; height: 460px; }
        @media (max-width: 980px){ .stage { height: 420px; margin-top: 8px; } }
        @media (max-width: 520px){ .stage { height: 380px; transform: scale(0.92); transform-origin: top center; } }

        .session {
          position:absolute; top: 8px; left: 50%; transform: translateX(-50%);
          width: 300px; background: var(--ink); border-radius: 22px; padding: 16px;
          box-shadow: 0 30px 70px rgba(22,18,31,0.4); color:#fff; z-index: 3;
          animation: floaty 6s var(--ease) infinite;
        }
        .session-head { display:flex; align-items:flex-start; justify-content:space-between; }
        .session-head h4 { font-size: 1.05rem; font-weight: 600; line-height: 1.2; }
        .session-menu { width:30px;height:30px;border-radius:50%;background:rgba(255,255,255,0.12); display:grid; place-items:center; color:#cfc8da; }
        .eq { display:flex; align-items:center; gap:3px; height:42px; margin: 16px 0 10px; }
        .eq i { width:3px; border-radius:3px; background: linear-gradient(180deg,#a78bfa,#fb7185); transform-origin:center; animation: eq 1s ease-in-out infinite; }
        .session-foot { display:flex; align-items:center; justify-content:space-between; border-top:1px solid rgba(255,255,255,0.1); padding-top:11px; }
        .session-time { display:flex; align-items:center; gap:6px; font-variant-numeric: tabular-nums; font-size:0.9rem; }
        .session-time .live { width:7px;height:7px;border-radius:50%;background:#4ade80; animation: blink 1.8s ease infinite; }
        .analysing { display:flex; align-items:center; gap:6px; font-size:0.8rem; color:#c4b5fd; }

        .rating {
          position:absolute; top: -6px; right: 4px; z-index: 5;
          background:#fff; border-radius: 14px; padding: 8px 12px; box-shadow: var(--shadow-md);
          animation: popIn .6s var(--ease) .8s both;
        }
        .rating .row { display:flex; align-items:center; gap:6px; }
        .rating .stars { display:flex; gap:1px; }
        .rating .score { font-family:var(--font-display); font-weight:600; font-size:0.82rem; }
        .rating .meta { font-size:0.64rem; color:var(--muted); margin-top:2px; }

        .bubble {
          position:absolute; z-index:4; background:#fff; border-radius:16px; padding:12px 14px;
          box-shadow: var(--shadow-lg); width: 250px;
          animation: popIn .6s var(--ease) 1.1s both;
        }
        .bubble.b1 { bottom: 96px; left: 50%; transform: translateX(-40%); }
        .bubble-top { display:flex; align-items:center; gap:8px; margin-bottom:6px; }
        .bubble-top img { width:24px;height:24px;border-radius:50%; object-fit:cover; }
        .tag { font-size:0.62rem; font-weight:600; padding:2px 7px; border-radius:99px; }
        .tag.name { background:#241d33; color:#fff; }
        .tag.time { background: var(--grad); color:#fff; }
        .bubble p { font-size:0.86rem; color:var(--ink); font-weight:500; line-height:1.4; }
        .caret { display:inline-block; width:2px; height:0.9em; background:var(--violet); vertical-align:-2px; margin-left:1px; animation: blink 0.9s steps(1) infinite; }

        .play-fab {
          position:absolute; bottom: 70px; left: 50%; transform: translateX(-50%); z-index: 6;
          width:54px;height:54px;border-radius:50%; background:var(--ink); color:#fff; border:none;
          display:grid; place-items:center; cursor:pointer; box-shadow: 0 14px 34px rgba(22,18,31,0.4);
          animation: ring 2.6s ease infinite;
        }

        .connector { position:absolute; inset:0; z-index:1; pointer-events:none; }
        .connector path { stroke: var(--violet); stroke-width:1.6; fill:none; stroke-dasharray: 5 6; opacity:0.45;
          stroke-dashoffset: 400; animation: drawLine 2s var(--ease) .4s forwards; }
        .node-plus { position:absolute; z-index:2; width:26px;height:26px;border-radius:50%; background:var(--grad); color:#fff; display:grid; place-items:center; box-shadow:0 6px 16px rgba(124,58,237,0.4); }

        /* Logo strip */
        .logo-band { background:#fff; border-top:1px solid var(--line-soft); padding: 22px 0; }
        .logo-promo { text-align:center; font-size:0.92rem; color:var(--slate); margin-bottom:18px; }
        .logo-promo b { color:var(--ink); }
        .logo-promo a { color:var(--violet); font-weight:600; text-decoration:none; display:inline-flex; align-items:center; gap:6px; }
        .logo-row { display:flex; align-items:center; justify-content:space-between; gap:24px; flex-wrap:wrap; }
        .logo-item { display:flex; align-items:center; gap:9px; font-family:var(--font-display); font-weight:600; font-size:1.05rem; color:#3b3450; opacity:0.7; transition: var(--t); }
        .logo-item:hover { opacity:1; }
        .logo-item .ic { width:26px;height:26px;border-radius:7px; background:var(--grad-soft); display:grid; place-items:center; color:var(--violet); }
        @media (max-width: 640px){ .logo-row { justify-content:center; gap:18px 28px; } }
      `}</style>

      <div className="hero-card">
        <Navbar />
        <div className="hero-main">
          {/* LEFT */}
          <div className="hero-copy">
            <h1 className="reveal in">
              <span className="grad-text">Lifelike avatars</span>
              <br />
              for real-time
              <br />
              conversations
            </h1>
            <p className="sub reveal in d1">
              AVAT Avatar gives your product a face that talks back — answering
              questions, guiding signups, and resolving support in real time, in
              any language.
            </p>
            <div className="hero-ctas reveal in d2">
              <a href="/dashboard" className="btn btn-primary btn-lg">
                <span className="chip">
                  <ArrowRight size={17} />
                </span>{" "}
                Start for free
              </a>
              <a href="#features" className="btn btn-ghost btn-lg">
                <PlayCircle size={18} /> Watch demo
              </a>
            </div>
            <div className="hero-trust reveal in d3">
              <span>
                <span className="dot" /> 14-day free trial
              </span>
              <span>
                <span className="dot" /> No credit card required
              </span>
              <span>
                <span className="dot" /> Cancel anytime
              </span>
            </div>
          </div>

          {/* RIGHT STAGE */}
          <div className="stage reveal in d2">
            {/* connectors */}
            <svg
              className="connector"
              viewBox="0 0 520 460"
              preserveAspectRatio="none"
            >
              <path d="M70,150 C150,150 150,200 250,210" />
              <path d="M460,150 C380,150 380,200 280,210" />
              <path d="M90,360 C170,360 200,300 250,250" />
            </svg>
            <span className="node-plus" style={{ top: 196, left: 232 }}>
              <Plus size={15} />
            </span>

            {/* floating avatar tiles */}
            <AvatarTile
              src={faces[0]}
              className="ring"
              style={{
                top: 70,
                left: 8,
                animation: "floaty 6.5s var(--ease) infinite",
              }}
            />
            <AvatarTile
              src={faces[1]}
              style={{
                top: 70,
                right: 8,
                animation: "floaty-sm 7s var(--ease) .6s infinite",
              }}
            />
            <AvatarTile
              src={faces[2]}
              style={{
                bottom: 24,
                left: 18,
                animation: "floaty 7.5s var(--ease) .3s infinite",
              }}
            />
            <AvatarTile
              src={faces[3]}
              style={{
                bottom: 24,
                right: 8,
                animation: "floaty-sm 6.8s var(--ease) .9s infinite",
              }}
            />

            {/* rating chip */}
            <div className="rating">
              <div className="row">
                <span className="stars">
                  {Array(5)
                    .fill(0)
                    .map((_, i) => (
                      <Star
                        key={i}
                        size={10}
                        fill="var(--coral)"
                        stroke="none"
                      />
                    ))}
                </span>
                <span className="score">5.0 / 5.0</span>
              </div>
              <div className="meta">#1 Rated · 6,000+ reviews</div>
            </div>

            {/* central session */}
            <div className="session">
              <div className="session-head">
                <h4>
                  End-of-Sprint
                  <br />
                  support session
                </h4>
                <span className="session-menu">
                  <Plus size={15} style={{ transform: "rotate(45deg)" }} />
                </span>
              </div>
              <div className="eq">
                {Array(28)
                  .fill(0)
                  .map((_, i) => (
                    <i
                      key={i}
                      style={{
                        height: `${8 + ((i * 37) % 30)}px`,
                        animationDelay: `${(i % 9) * 0.09}s`,
                        opacity: i > 17 ? 0.4 : 1,
                      }}
                    />
                  ))}
              </div>
              <div className="session-foot">
                <div className="session-time">
                  <span className="live" /> 00:05:39
                </div>
                <div className="analysing">
                  <Sparkles size={12} /> Analysing…
                </div>
              </div>
            </div>

            {/* live transcript bubble */}
            <div className="bubble b1">
              <div className="bubble-top">
                <img src={faces[0]} alt="" />
                <span className="tag name">Nova AI</span>
                <span className="tag time">↳ 05:45</span>
              </div>
              <p>
                {typed}
                <span className="caret" />
              </p>
            </div>

            <button className="play-fab" aria-label="Play session">
              <Pause size={18} fill="currentColor" />
            </button>
          </div>
        </div>

        {/* logo band */}
        <div className="logo-band">
          <div className="wrap">
            <p className="logo-promo reveal in d1">
              <b>Enjoy 50% off premium features</b> for your first 3 months — 21
              days remaining&nbsp;&nbsp;
              <a href="/dashboard">
                Start 14-day trial <ArrowRight size={14} />
              </a>
            </p>
            <div className="logo-row reveal in d2">
              {[
                { n: "Shells", I: Layers },
                { n: "SmartFinder", I: Cpu },
                { n: "Zoomerr", I: Zap },
                { n: "kontrastr", I: BarChart3 },
                { n: "WavesMarathon", I: Mic },
              ].map(({ n, I }) => (
                <div className="logo-item" key={n}>
                  <span className="ic">
                    <I size={15} />
                  </span>
                  {n}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/* ─────────────────────── FEATURES ───────────────────────── */
function Features() {
  const ref = useReveal();
  const features = [
    {
      icon: <MessageSquare size={22} />,
      title: "Conversational intelligence",
      desc: "Multi-turn dialogue with context memory and goal tracking — your avatar understands intent and drives the conversation forward.",
      span: 2,
      pills: [
        "Intent detection",
        "Sentiment",
        "Context memory",
        "Goal tracking",
      ],
    },
    {
      icon: <Zap size={22} />,
      title: "Sub-500ms latency",
      desc: "Voice-to-video responses fast enough to feel human, served from an optimized edge network.",
    },
    {
      icon: <Globe size={22} />,
      title: "60+ languages",
      desc: "Real-time translation and accurate lip-sync across 60+ languages and regional dialects.",
    },
    {
      icon: <ShieldCheck size={22} />,
      title: "Enterprise security",
      desc: "SOC 2 Type II, end-to-end encryption, and zero-data-retention modes keep every interaction private.",
      span: 2,
      accent: true,
    },
    {
      icon: <Cpu size={22} />,
      title: "Custom personas",
      desc: "Train on your brand voice and product docs. Ship in minutes with no-code workflows.",
    },
    {
      icon: <BarChart3 size={22} />,
      title: "Deep analytics",
      desc: "Engagement, resolution rate, sentiment, and conversion funnels in one live dashboard.",
    },
    {
      icon: <Layers size={22} />,
      title: "No-code builder",
      desc: "Drag-and-drop scenario editor to create, test, and ship flows without code.",
    },
    {
      icon: <Headphones size={22} />,
      title: "Omnichannel deploy",
      desc: "Embed on web, mobile, support portals, or kiosks from a single platform.",
    },
  ];
  return (
    <>
      <style>{`
        .section { padding: 96px 0; }
        .sec-head { text-align:center; max-width:620px; margin: 0 auto 56px; }
        .sec-head h2 { font-size: clamp(2rem, 4vw, 3rem); font-weight:600; color:var(--ink); margin-top:1rem; line-height:1.08; }
        .sec-head p { color: var(--slate); margin-top: 0.9rem; }
        .feat-grid { display:grid; grid-template-columns: repeat(3,1fr); gap: 18px; }
        .feat { background:#fff; border:1px solid var(--line); border-radius: var(--r-lg); padding: 30px; transition: var(--t); position:relative; overflow:hidden; }
        .feat:hover { transform: translateY(-5px); border-color:#e3d9ee; box-shadow: var(--shadow-md); }
        .feat.s2 { grid-column: span 2; }
        .feat.accent { background: var(--grad-soft); border-color: rgba(124,58,237,0.18); }
        .feat-ic { width:50px;height:50px;border-radius:15px; background: var(--grad); color:#fff; display:grid; place-items:center; margin-bottom:18px; box-shadow: 0 8px 22px rgba(124,58,237,0.28); }
        .feat h3 { font-size:1.15rem; font-weight:600; color:var(--ink); margin-bottom:8px; }
        .feat p { font-size:0.92rem; color:var(--slate); }
        .pills { display:flex; flex-wrap:wrap; gap:8px; margin-top:18px; }
        .pill { font-size:0.78rem; font-weight:500; padding:6px 12px; border-radius:99px; background:#faf6ff; border:1px solid var(--line); color:var(--violet); }
        @media (max-width: 900px){ .feat-grid { grid-template-columns: 1fr 1fr; } .feat.s2 { grid-column: span 2; } }
        @media (max-width: 620px){ .feat-grid { grid-template-columns: 1fr; } .feat.s2 { grid-column: span 1; } }
      `}</style>
      <section className="section" id="features" ref={ref}>
        <div className="wrap">
          <div className="sec-head reveal">
            <span className="eyebrow">
              <Sparkles size={11} /> Features
            </span>
            <h2>
              Everything you need to scale
              <br />
              visual conversations
            </h2>
            <p>
              Enterprise-grade AI avatars, deployed in minutes — not months.
            </p>
          </div>
          <div className="feat-grid">
            {features.map((f, i) => (
              <div
                key={i}
                className={`feat reveal d${(i % 3) + 1}${f.span === 2 ? " s2" : ""}${f.accent ? " accent" : ""}`}
              >
                <div className="feat-ic">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
                {f.pills && (
                  <div className="pills">
                    {f.pills.map((p) => (
                      <span className="pill" key={p}>
                        {p}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

/* ─────────────────────── HOW IT WORKS ───────────────────── */
function HowItWorks() {
  const ref = useReveal();
  const steps = [
    {
      n: "01",
      t: "Design your avatar",
      d: "Pick a face, voice, and personality with the no-code builder.",
    },
    {
      n: "02",
      t: "Train on your data",
      d: "Upload docs, FAQs, and scripts — it learns your product in minutes.",
    },
    {
      n: "03",
      t: "Configure flows",
      d: "Map scenarios, escalation triggers, and conversion goals.",
    },
    {
      n: "04",
      t: "Deploy everywhere",
      d: "Drop in one script tag and go live on web, app, or kiosk.",
    },
  ];
  return (
    <>
      <style>{`
        .how { padding: 96px 0; }
        .how-grid { display:grid; grid-template-columns: repeat(4,1fr); gap: 16px; margin-top: 52px; }
        .step { background:#fff; border:1px solid var(--line); border-radius: var(--r-lg); padding: 28px; position:relative; transition: var(--t); }
        .step:hover { transform: translateY(-5px); box-shadow: var(--shadow-md); border-color:#e3d9ee; }
        .step .num { font-family:var(--font-display); font-size:2.4rem; font-weight:600; line-height:1; background:var(--grad); -webkit-background-clip:text; background-clip:text; -webkit-text-fill-color:transparent; opacity:.85; }
        .step h3 { font-size:1.05rem; font-weight:600; color:var(--ink); margin:14px 0 8px; }
        .step p { font-size:0.9rem; color:var(--slate); }
        .step .arr { position:absolute; top:30px; right:22px; color:#d8cee6; }
        @media (max-width: 860px){ .how-grid { grid-template-columns: 1fr 1fr; } }
        @media (max-width: 460px){ .how-grid { grid-template-columns: 1fr; } }
      `}</style>
      <section className="how" id="how" ref={ref}>
        <div className="wrap">
          <div className="sec-head reveal">
            <span className="eyebrow">
              <Layers size={11} /> How it works
            </span>
            <h2>Live in four steps</h2>
          </div>
          <div className="how-grid">
            {steps.map((s, i) => (
              <div key={i} className={`step reveal d${i + 1}`}>
                {i < steps.length - 1 && (
                  <ArrowUpRight size={18} className="arr" />
                )}
                <span className="num">{s.n}</span>
                <h3>{s.t}</h3>
                <p>{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

/* ─────────────────────── TESTIMONIALS ───────────────────── */
function Testimonials() {
  const ref = useReveal();
  const cards = [
    {
      q: "Switching to AI avatars cut our support resolution time by 40% while lifting CSAT. It's the closest thing to a scalable human team.",
      n: "Sarah Jenkins",
      r: "VP Customer Success, TechFlow",
    },
    {
      q: "60-language support let us expand globally without hiring. CSAT up, costs down, live in under a day.",
      n: "Ravi Mehta",
      r: "Head of CX, Growlio",
    },
    {
      q: "The analytics alone are worth it — we rethought our entire onboarding funnel from conversation data we'd never had.",
      n: "Camille Dubois",
      r: "Product Manager, NexaCloud",
    },
  ];
  return (
    <>
      <style>{`
        .tst { padding: 96px 0; }
        .tst-grid { display:grid; grid-template-columns: repeat(3,1fr); gap: 18px; margin-top: 52px; }
        .tcard { background:#fff; border:1px solid var(--line); border-radius: var(--r-lg); padding: 30px; transition: var(--t); }
        .tcard:hover { transform: translateY(-5px); box-shadow: var(--shadow-md); border-color:#e3d9ee; }
        .tcard .stars { display:flex; gap:3px; margin-bottom:14px; }
        .tcard q { display:block; font-size:0.98rem; color:var(--ink); line-height:1.65; font-weight:450; quotes:none; }
        .tcard q::before, .tcard q::after { content:''; }
        .tauthor { display:flex; align-items:center; gap:12px; margin-top:20px; }
        .tav { width:42px;height:42px;border-radius:50%; background:var(--grad); color:#fff; display:grid; place-items:center; font-family:var(--font-display); font-weight:600; font-size:0.85rem; }
        .tn { font-weight:600; font-size:0.92rem; color:var(--ink); }
        .tr { font-size:0.8rem; color:var(--muted); }
        @media (max-width: 900px){ .tst-grid { grid-template-columns: 1fr; } }
      `}</style>
      <section className="tst" ref={ref}>
        <div className="wrap">
          <div className="sec-head reveal">
            <span className="eyebrow">
              <Star size={11} /> Testimonials
            </span>
            <h2>Loved by customer teams</h2>
          </div>
          <div className="tst-grid">
            {cards.map((c, i) => (
              <div key={i} className={`tcard reveal d${i + 1}`}>
                <div className="stars">
                  {Array(5)
                    .fill(0)
                    .map((_, j) => (
                      <Star
                        key={j}
                        size={15}
                        fill="var(--coral)"
                        stroke="none"
                      />
                    ))}
                </div>
                <q>{c.q}</q>
                <div className="tauthor">
                  <div className="tav">
                    {c.n
                      .split(" ")
                      .map((w) => w[0])
                      .join("")}
                  </div>
                  <div>
                    <div className="tn">{c.n}</div>
                    <div className="tr">{c.r}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

/* ─────────────────────── PRICING ────────────────────────── */
function Pricing() {
  const ref = useReveal();
  const plans = [
    {
      name: "Starter",
      price: "$0",
      desc: "Perfect for trying things out",
      cta: "Start free",
      features: [
        "3 avatar deployments",
        "1,000 conversations/mo",
        "5 languages",
        "Community support",
      ],
    },
    {
      name: "Growth",
      price: "$79",
      desc: "For scaling teams",
      cta: "Get started",
      popular: true,
      features: [
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
      desc: "For large organizations",
      cta: "Contact sales",
      features: [
        "Everything in Growth",
        "Unlimited conversations",
        "60+ languages",
        "SOC 2 / SSO / SLA",
        "Dedicated success manager",
        "Custom integrations",
      ],
    },
  ];
  return (
    <>
      <style>{`
        .pr { padding: 96px 0; }
        .pr-grid { display:grid; grid-template-columns: repeat(3,1fr); gap: 18px; margin-top: 52px; align-items:start; }
        .plan { background:#fff; border:1px solid var(--line); border-radius: var(--r-lg); padding: 32px; transition: var(--t); position:relative; }
        .plan:hover { transform: translateY(-4px); box-shadow: var(--shadow-md); }
        .plan.pop { border-color: transparent; background: var(--ink); color:#fff; box-shadow: var(--shadow-lg); }
        .plan.pop .pname, .plan.pop .pdesc { color:#cfc8da; }
        .plan.pop .pf { color:#e7e2ef; }
        .pop-badge { position:absolute; top:-13px; left:50%; transform:translateX(-50%); background:var(--grad); color:#fff; font-size:0.7rem; font-weight:700; letter-spacing:0.05em; padding:5px 14px; border-radius:99px; white-space:nowrap; }
        .pname { font-family:var(--font-display); font-size:0.78rem; font-weight:600; letter-spacing:0.12em; text-transform:uppercase; color:var(--muted); }
        .pprice { font-family:var(--font-display); font-size:2.6rem; font-weight:600; line-height:1; margin:14px 0 4px; }
        .pprice span { font-size:0.9rem; font-weight:400; color:var(--muted); }
        .pdesc { font-size:0.88rem; color:var(--slate); margin-bottom:22px; }
        .pfeatures { list-style:none; display:flex; flex-direction:column; gap:11px; margin-bottom:26px; }
        .pf { display:flex; align-items:center; gap:10px; font-size:0.9rem; color:var(--slate); }
        .pf .ck { width:18px;height:18px;border-radius:50%; background:var(--grad); color:#fff; display:grid; place-items:center; flex-shrink:0; }
        .plan .btn { width:100%; justify-content:center; }
        @media (max-width: 900px){ .pr-grid { grid-template-columns: 1fr; } }
      `}</style>
      <section className="pr" id="pricing" ref={ref}>
        <div className="wrap">
          <div className="sec-head reveal">
            <span className="eyebrow">Pricing</span>
            <h2>Simple, transparent pricing</h2>
            <p>Start free. Scale as you grow.</p>
          </div>
          <div className="pr-grid">
            {plans.map((p, i) => (
              <div
                key={i}
                className={`plan reveal d${i + 1}${p.popular ? " pop" : ""}`}
              >
                {p.popular && <span className="pop-badge">Most popular</span>}
                <div className="pname">{p.name}</div>
                <div className="pprice">
                  {p.price}
                  <span>{p.price !== "Custom" ? "/mo" : ""}</span>
                </div>
                <div className="pdesc">{p.desc}</div>
                <ul className="pfeatures">
                  {p.features.map((f) => (
                    <li className="pf" key={f}>
                      <span className="ck">
                        <Check size={11} strokeWidth={3} />
                      </span>
                      {f}
                    </li>
                  ))}
                </ul>
                <a
                  href="/dashboard"
                  className={`btn ${p.popular ? "btn-primary" : "btn-ghost"}`}
                >
                  {p.popular && (
                    <span className="chip">
                      <ArrowRight size={15} />
                    </span>
                  )}
                  {p.cta}
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

/* ─────────────────────── CTA + FOOTER ───────────────────── */
function CTA() {
  const ref = useReveal();
  return (
    <>
      <style>{`
        .cta { padding: 30px 14px; }
        .cta-card { position:relative; overflow:hidden; border-radius: var(--r-xl); padding: 80px 28px; text-align:center;
          background: radial-gradient(120% 140% at 50% 0%, #9333ea 0%, #b14bd8 45%, #f37a5e 100%); color:#fff; }
        .cta-card::after { content:""; position:absolute; inset:0; background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Ccircle cx='1' cy='1' r='1' fill='white' opacity='0.12'/%3E%3C/svg%3E"); }
        .cta-card h2 { position:relative; font-size: clamp(2rem,5vw,3.5rem); font-weight:600; max-width:680px; margin:0 auto 1rem; line-height:1.08; }
        .cta-card p { position:relative; color:rgba(255,255,255,0.85); max-width:480px; margin:0 auto 2.2rem; font-size:1.05rem; }
        .cta-actions { position:relative; display:flex; gap:1rem; justify-content:center; flex-wrap:wrap; }
        .cta-card .btn-primary { background:#fff; color:var(--ink); box-shadow:0 12px 34px rgba(0,0,0,0.2); }
        .cta-card .btn-primary .chip { background:rgba(22,18,31,0.08); color:var(--ink); }
        .cta-card .btn-ghost { background:rgba(255,255,255,0.12); border-color:rgba(255,255,255,0.3); color:#fff; }
        .cta-card .btn-ghost:hover { background:rgba(255,255,255,0.2); }
      `}</style>
      <section className="cta" ref={ref}>
        <div className="cta-card reveal">
          <h2>Ready to give your product a face?</h2>
          <p>
            Join thousands of teams building the next generation of customer
            conversations.
          </p>
          <div className="cta-actions">
            <a href="/dashboard" className="btn btn-primary btn-lg">
              <span className="chip">
                <ArrowRight size={16} />
              </span>{" "}
              Start for free
            </a>
            <a href="#" className="btn btn-ghost btn-lg">
              Book a demo
            </a>
          </div>
        </div>
      </section>
    </>
  );
}

function Footer() {
  const cols = [
    {
      h: "Product",
      l: ["Features", "Pricing", "Integrations", "Changelog", "Roadmap"],
    },
    {
      h: "Developers",
      l: ["Documentation", "API reference", "SDKs", "Open source", "Status"],
    },
    { h: "Company", l: ["About", "Blog", "Careers", "Press", "Contact"] },
    { h: "Legal", l: ["Privacy", "Terms", "Cookies", "Security", "GDPR"] },
  ];
  return (
    <>
      <style>{`
        .footer { padding: 14px; }
        .footer-card { background:#fff; border-radius: var(--r-xl); padding: 56px 36px 28px; }
        .ftop { display:grid; grid-template-columns: 2fr repeat(4,1fr); gap: 36px; padding-bottom: 36px; border-bottom:1px solid var(--line); }
        .fbrand .logo { display:flex; align-items:center; gap:10px; font-family:var(--font-display); font-weight:700; font-size:1.15rem; }
        .fbrand .logo .m { width:34px;height:34px;border-radius:11px; background:var(--ink); color:#fff; display:grid; place-items:center; }
        .fbrand p { font-size:0.9rem; color:var(--slate); margin-top:12px; max-width:240px; }
        .fsoc { display:flex; gap:8px; margin-top:18px; }
        .fsoc a { width:38px;height:38px;border-radius:11px; background:#faf6ff; border:1px solid var(--line); display:grid; place-items:center; color:var(--slate); transition:var(--t); }
        .fsoc a:hover { background:var(--grad); color:#fff; border-color:transparent; transform:translateY(-2px); }
        .fcol h4 { font-family:var(--font-display); font-size:0.8rem; font-weight:600; letter-spacing:0.08em; text-transform:uppercase; margin-bottom:14px; }
        .fcol ul { list-style:none; display:flex; flex-direction:column; gap:9px; }
        .fcol a { font-size:0.9rem; color:var(--slate); text-decoration:none; transition:color .2s; }
        .fcol a:hover { color:var(--violet); }
        .fbot { display:flex; align-items:center; justify-content:space-between; padding-top:24px; flex-wrap:wrap; gap:12px; }
        .fbot p { font-size:0.84rem; color:var(--muted); }
        .fbot .links { display:flex; gap:20px; }
        .fbot .links a { font-size:0.84rem; color:var(--muted); text-decoration:none; }
        .fbot .links a:hover { color:var(--ink); }
        @media (max-width: 900px){ .ftop { grid-template-columns: 1fr 1fr; } }
        @media (max-width: 560px){ .ftop { grid-template-columns: 1fr; } .fbot { flex-direction:column; align-items:flex-start; } }
      `}</style>
      <footer className="footer">
        <div className="footer-card">
          <div className="ftop">
            <div className="fbrand">
              <div className="logo">
                <span className="m">
                  <Sparkles size={17} />
                </span>{" "}
                AVAT Avatar
              </div>
              <p>
                The platform for deploying emotion-aware AI avatars at
                enterprise scale.
              </p>
              <div className="fsoc">
                <a href="#" aria-label="Twitter">
                  <Twitter size={15} />
                </a>
                <a href="#" aria-label="LinkedIn">
                  <Linkedin size={15} />
                </a>
                <a href="#" aria-label="GitHub">
                  <Github size={15} />
                </a>
                <a href="#" aria-label="Email">
                  <Mail size={15} />
                </a>
              </div>
            </div>
            {cols.map((c) => (
              <div className="fcol" key={c.h}>
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
          <div className="fbot">
            <p>© 2026 AVAT Avatar Inc. All rights reserved.</p>
            <div className="links">
              <a href="#">Privacy</a>
              <a href="#">Terms</a>
              <a href="#">Cookies</a>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}

/* ─────────────────────────── ROOT ───────────────────────── */
export default function App() {
  return (
    <div className="frame">
      <GlobalStyles />
      <style>{`
        .body-panel {
          background: linear-gradient(180deg, #ffffff 0%, #fdf6f8 100%);
          border-radius: var(--r-xl);
          margin-top: 14px;
          overflow: hidden;
        }
        .body-panel > section + section { border-top: 1px solid var(--line-soft); }
      `}</style>
      <Hero />
      <div className="body-panel">
        <Features />
        <HowItWorks />
        <Testimonials />
        <Pricing />
      </div>
      <CTA />
      <Footer />
    </div>
  );
}

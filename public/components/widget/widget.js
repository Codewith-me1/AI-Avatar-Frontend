



// (function () {
//   "use strict";

//   const config = window.VoiceAgentConfig || {};
//   const { agentId, apiUrl = "http://localhost:8000" } = config;

//   if (!agentId) {
//     console.warn("[VoiceAgent] agentId is missing in global setup parameters.");
//     return;
//   }

//   const sessionUserIdentity = `user_${Math.random().toString(36).substring(7)}`;
//   const targetRoomName = `room_${agentId}_${Date.now()}`;
//   let isOpen = false;
//   let iframeLoaded = false;
//   let iframeReady = false;

//   // 1. Inject Styles
//   const style = document.createElement("style");
//   style.textContent = `
//     .va-widget-container {
//       position: fixed;
//       bottom: 24px;
//       right: 24px;
//       z-index: 2147483647;
//       font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
//       display: flex;
//       flex-direction: column;
//       align-items: flex-end;
//     }

//     /* --- TOOLTIP --- */
//     .va-tooltip {
//       background: #0A0F35;
//       color: white;
//       padding: 10px 16px;
//       border-radius: 8px;
//       font-size: 14px;
//       font-weight: 600;
//       margin-bottom: 12px;
//       position: relative;
//       box-shadow: 0 4px 12px rgba(0,0,0,0.1);
//       transition: opacity 0.3s ease;
//       transform-origin: bottom center;
//     }
//     .va-tooltip::after {
//       content: "";
//       position: absolute;
//       bottom: -6px;
//       left: 50%;
//       transform: translateX(-50%);
//       border-width: 6px 6px 0;
//       border-style: solid;
//       border-color: #0A0F35 transparent transparent transparent;
//     }

//     /* --- PREVIEW CARD (Image 1) --- */
//     .va-preview-card {
//       width: 280px;
//       height: 200px;
//       background: #0A0F2C;
//       border-radius: 12px;
//       border: 3px solid #0A0F35;
//       overflow: hidden;
//       cursor: pointer;
//       box-shadow: 0 10px 30px rgba(0,0,0,0.2);
//       transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
//       display: flex;
//       flex-direction: column;
//       position: relative;
//     }
//     .va-preview-card:hover {
//       transform: translateY(-4px);
//       box-shadow: 0 14px 40px rgba(0,0,0,0.3);
//     }
//     .va-preview-image {
//       height: 60%;
//       width: 100%;
//       background-image: url('https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80'); /* Replace with your actual agent preview image */
//       background-size: cover;
//       background-position: center top;
//     }
//     .va-preview-caption {
//       height: 40%;
//       display: flex;
//       align-items: center;
//       justify-content: center;
//       color: white;
//       font-size: 13px;
//       font-weight: 500;
//     }

//     /* --- EXPANDED CARD (Image 2) --- */
//     .va-expanded-card {
//       position: absolute;
//       bottom: 0;
//       right: 0;
//       width: 400px;
//       height: 600px;
//       background: #050505;
//       border-radius: 16px;
//       border: 2px solid #1A1A2E;
//       box-shadow: 0 20px 50px rgba(0,0,0,0.5);
//       overflow: hidden;
//       opacity: 0;
//       pointer-events: none;
//       transform: scale(0.8) translateY(50px);
//       transform-origin: bottom right;
//       transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
//       display: flex;
//       flex-direction: column;
//     }
    
//     /* Widget Open State */
//     .va-widget-container.is-open .va-preview-card,
//     .va-widget-container.is-open .va-tooltip {
//       opacity: 0;
//       pointer-events: none;
//       transform: scale(0.8);
//     }
//     .va-widget-container.is-open .va-expanded-card {
//       opacity: 1;
//       pointer-events: auto;
//       transform: scale(1) translateY(0);
//     }

//     /* --- LOADING HUD (Matching Image 2) --- */
//     .va-loading-hud {
//       position: absolute;
//       inset: 0;
//       background: #050505;
//       z-index: 10;
//       display: flex;
//       flex-direction: column;
//       justify-content: space-between;
//       transition: opacity 0.5s ease;
//     }
    
//     /* Top Bar */
//     .va-top-bar {
//       display: flex;
//       justify-content: flex-end;
//       padding: 16px;
//       gap: 12px;
//     }
//     .va-hud-pill {
//       background: rgba(255,255,255,0.08);
//       border: 1px solid rgba(255,255,255,0.1);
//       border-radius: 8px;
//       display: flex;
//       align-items: center;
//       padding: 6px 10px;
//       color: white;
//       font-size: 12px;
//       font-weight: 600;
//       gap: 6px;
//     }
//     .va-close-btn {
//       background: transparent;
//       border: 1px solid rgba(255,255,255,0.1);
//       color: white;
//       border-radius: 8px;
//       width: 32px;
//       height: 32px;
//       cursor: pointer;
//       display: flex;
//       align-items: center;
//       justify-content: center;
//       transition: background 0.2s;
//     }
//     .va-close-btn:hover { background: rgba(255,255,255,0.1); }

//     /* Center Loading Dot */
//     .va-center-dot {
//       width: 16px;
//       height: 16px;
//       background: white;
//       border-radius: 50%;
//       align-self: center;
//       margin-top: -60px;
//       animation: va-pulse 1.5s infinite ease-in-out;
//     }
//     @keyframes va-pulse {
//       0% { transform: scale(0.8); opacity: 0.5; }
//       50% { transform: scale(1.2); opacity: 1; box-shadow: 0 0 15px rgba(255,255,255,0.5); }
//       100% { transform: scale(0.8); opacity: 0.5; }
//     }

//     /* Bottom Controls Placeholder */
//     .va-bottom-bar {
//       display: flex;
//       justify-content: center;
//       padding: 24px;
//     }
//     .va-controls-dock {
//       background: rgba(255,255,255,0.05);
//       border: 1px solid rgba(255,255,255,0.08);
//       border-radius: 30px;
//       padding: 8px;
//       display: flex;
//       gap: 12px;
//       align-items: center;
//     }
//     .va-hud-circle {
//       width: 44px;
//       height: 44px;
//       border-radius: 50%;
//       background: rgba(255,255,255,0.1);
//       display: flex;
//       align-items: center;
//       justify-content: center;
//     }
//     .va-hud-circle.red { background: #E11D48; }

//     /* Iframe */
//     .va-iframe {
//       width: 100%;
//       height: 100%;
//       border: none;
//       position: absolute;
//       inset: 0;
//       z-index: 5; /* Behind the loading HUD initially */
//     }
//   `;
//   document.head.appendChild(style);

//   // 2. Build DOM
//   const container = document.createElement("div");
//   container.className = "va-widget-container";
//   container.id = "vaWidgetContainer";

//   container.innerHTML = `
//     <div class="va-tooltip">Hello there! Need Help?</div>
//     <div class="va-preview-card" id="vaPreviewBtn">
//       <div class="va-preview-image"></div>
//       <div class="va-preview-caption">Hi! I'm here to assist you.</div>
//     </div>

//     <div class="va-expanded-card" id="vaExpandedCard">
     
      
//       <iframe class="va-iframe" id="vaIframe" allow="microphone; camera"></iframe>
//     </div>
//   `;
//   document.body.appendChild(container);

//   const widgetContainer = document.getElementById("vaWidgetContainer");
//   const previewBtn = document.getElementById("vaPreviewBtn");
//   const closeBtn = document.getElementById("vaCloseBtn");
//   const endCallFakeBtn = document.getElementById("vaEndCallFakeBtn");
//   const iframe = document.getElementById("vaIframe");
//   const loadingHud = document.getElementById("vaLoadingHud");

//   // 3. Logic & Interactions
//   function openWidget() {
//     isOpen = true;
//     widgetContainer.classList.add("is-open");

//     if (!iframeLoaded) {
//       // Connect to the React iframe silently in the background
//       const widgetUrl = `${apiUrl}/widget/${agentId}?room=${targetRoomName}&identity=${sessionUserIdentity}`;
//       iframe.src = widgetUrl;
//       iframeLoaded = true;

//       // Once the React app fully loads and mounts, crossfade the loading HUD out
//       iframe.onload = () => {
//         setTimeout(() => {
//           loadingHud.style.opacity = "0";
//           setTimeout(() => loadingHud.style.pointerEvents = "none", 500);
//         }, 800); // Give React an extra 800ms to mount the avatar 
//       };
//     }
//   }

//   function closeWidget() {
//     isOpen = false;
//     widgetContainer.classList.remove("is-open");
//   }
// // Listen for the iframe telling us to close
//   window.addEventListener("message", (event) => {
//     if (event.data && event.data.type === "VOICE_AGENT_CLOSE") {
//       closeWidget(); // This shrinks the expanded card back down
//     }
//   });
//   // Bind clicks
//   previewBtn.addEventListener("click", openWidget);
//   closeBtn.addEventListener("click", closeWidget);
//   endCallFakeBtn.addEventListener("click", closeWidget);

// })();

// (function () {
//   "use strict";

//   const config = window.VoiceAgentConfig || {};
//   const { agentId, apiUrl = "http://localhost:8000" } = config;

//   if (!agentId) {
//     console.warn("[VoiceAgent] agentId is missing in global setup parameters.");
//     return;
//   }

//   let sessionUserIdentity = `user_${Math.random().toString(36).substring(7)}`;
//   let targetRoomName      = `room_${agentId}_${Date.now()}`;
//   let isOpen       = false;
//   let iframeLoaded = false;
//   let micEnabled   = true;

//   // ── Live audio state (filled by postMessage from iframe) ──────────────────
//   // 8 normalised bars (0–1), smoothed
//   let liveBins     = new Float32Array(8).fill(0);
//   let isSpeaking   = false;
//   let waveRafId    = null;

//   // ── Styles ────────────────────────────────────────────────────────────────
//   const style = document.createElement("style");
//   style.textContent = `
//     .va-widget-container {
//       position: fixed;
//       bottom: 24px;
//       right: 24px;
//       z-index: 2147483647;
//       font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
//       display: flex;
//       flex-direction: column;
//       align-items: flex-end;
//     }

//     /* ── Banner (waveform version) ── */
//     .va-banner {
//       width: 220px;
//       height: 64px;
//       background: #0A0F2C;
//       border-radius: 40px;
//       border: 2px solid #1a2060;
//       overflow: hidden;
//       cursor: pointer;
//       box-shadow: 0 8px 28px rgba(0,0,0,0.35);
//       display: flex;
//       align-items: center;
//       justify-content: space-between;
//       padding: 0 18px;
//       gap: 12px;
//       transition: opacity 0.3s ease, transform 0.3s ease,
//                   box-shadow 0.3s ease, border-color 0.4s ease;
//       position: relative;
//     }
//     .va-banner:hover {
//       transform: translateY(-3px);
//       box-shadow: 0 12px 36px rgba(0,0,0,0.45);
//     }
//     .va-banner-dot {
//       width: 10px;
//       height: 10px;
//       border-radius: 50%;
//       background: #4ade80;
//       flex-shrink: 0;
//       box-shadow: 0 0 7px rgba(74,222,128,0.7);
//       animation: va-dot-pulse 2.2s infinite ease-in-out;
//     }
//     @keyframes va-dot-pulse {
//       0%, 100% { opacity: 1; transform: scale(1); }
//       50%       { opacity: 0.55; transform: scale(0.78); }
//     }
//     .va-banner canvas {
//       flex: 1;
//       height: 38px;
//       display: block;
//       border-radius: 4px;
//     }
//     .va-banner-label {
//       font-size: 11px;
//       font-weight: 700;
//       color: rgba(255,255,255,0.45);
//       letter-spacing: 0.06em;
//       text-transform: uppercase;
//       flex-shrink: 0;
//       white-space: nowrap;
//     }

//     /* ── Expanded Card ── */
//     .va-expanded-card {
//       position: absolute;
//       bottom: 0;
//       right: 0;
//       width: 400px;
//       height: 600px;
//       background: #050505;
//       border-radius: 16px;
//       border: 2px solid #1A1A2E;
//       box-shadow: 0 20px 50px rgba(0,0,0,0.5);
//       overflow: hidden;
//       opacity: 0;
//       pointer-events: none;
//       transform: scale(0.85) translateY(40px);
//       transform-origin: bottom right;
//       transition: opacity 0.35s cubic-bezier(0.16, 1, 0.3, 1),
//                   transform 0.35s cubic-bezier(0.16, 1, 0.3, 1);
//     }

//     /* Open state */
//     .va-widget-container.is-open .va-banner {
//       opacity: 0;
//       pointer-events: none;
//       transform: scale(0.85);
//     }
//     .va-widget-container.is-open .va-expanded-card {
//       opacity: 1;
//       pointer-events: auto;
//       transform: scale(1) translateY(0);
//     }

//     /* Top bar */
//     .va-top-bar {
//       position: absolute;
//       top: 0; left: 0; right: 0;
//       display: flex;
//       justify-content: space-between;
//       align-items: center;
//       padding: 14px 16px;
//       z-index: 30;
//       background: linear-gradient(to bottom, rgba(5,5,5,0.92) 55%, transparent);
//     }
//     .va-agent-label {
//       display: flex;
//       align-items: center;
//       gap: 8px;
//       color: white;
//       font-size: 13px;
//       font-weight: 600;
//     }
//     .va-status-dot {
//       width: 8px; height: 8px;
//       border-radius: 50%;
//       background: #6b7280;
//       flex-shrink: 0;
//       transition: background 0.3s ease, box-shadow 0.3s ease;
//     }
//     .va-status-dot.ready {
//       background: #22c55e;
//       box-shadow: 0 0 6px rgba(34,197,94,0.6);
//     }
//     .va-status-dot.loading {
//       background: #f59e0b;
//       animation: va-blink 1.2s infinite ease-in-out;
//     }
//     @keyframes va-blink {
//       0%, 100% { opacity: 1; }
//       50%       { opacity: 0.3; }
//     }
//     .va-close-btn {
//       background: rgba(255,255,255,0.08);
//       border: 1px solid rgba(255,255,255,0.12);
//       color: rgba(255,255,255,0.8);
//       border-radius: 8px;
//       width: 32px; height: 32px;
//       cursor: pointer;
//       display: flex;
//       align-items: center;
//       justify-content: center;
//       font-size: 16px;
//       line-height: 1;
//       transition: background 0.2s, color 0.2s;
//       font-family: inherit;
//     }
//     .va-close-btn:hover { background: rgba(255,255,255,0.18); color: white; }

//     /* Loading HUD */
//     .va-loading-hud {
//       position: absolute;
//       inset: 0;
//       background: #050505;
//       z-index: 20;
//       display: flex;
//       flex-direction: column;
//       align-items: center;
//       justify-content: center;
//       gap: 20px;
//       transition: opacity 0.5s ease;
//     }
//     .va-loading-ring {
//       width: 52px; height: 52px;
//       border: 2px solid rgba(255,255,255,0.08);
//       border-top-color: rgba(255,255,255,0.7);
//       border-radius: 50%;
//       animation: va-spin 1s linear infinite;
//     }
//     @keyframes va-spin { to { transform: rotate(360deg); } }
//     .va-loading-text {
//       color: rgba(255,255,255,0.45);
//       font-size: 13px;
//       font-weight: 500;
//       letter-spacing: 0.02em;
//     }

//     /* Bottom controls */
//     .va-bottom-bar {
//       position: absolute;
//       bottom: 0; left: 0; right: 0;
//       display: flex;
//       justify-content: center;
//       padding: 20px;
//       z-index: 30;
//       background: linear-gradient(to top, rgba(5,5,5,0.92) 55%, transparent);
//       opacity: 0;
//       pointer-events: none;
//       transition: opacity 0.4s ease;
//     }
//     .va-bottom-bar.visible { opacity: 1; pointer-events: auto; }
//     .va-controls-dock {
//       background: rgba(255,255,255,0.05);
//       border: 1px solid rgba(255,255,255,0.1);
//       border-radius: 50px;
//       padding: 8px 18px;
//       display: flex;
//       gap: 14px;
//       align-items: center;
//     }
//     .va-circle-btn {
//       width: 44px; height: 44px;
//       border-radius: 50%;
//       border: none;
//       cursor: pointer;
//       display: flex;
//       align-items: center;
//       justify-content: center;
//       transition: background 0.2s, transform 0.15s;
//       flex-shrink: 0;
//     }
//     .va-circle-btn:hover  { transform: scale(1.08); }
//     .va-circle-btn:active { transform: scale(0.94); }
//     .va-mic-btn { background: rgba(255,255,255,0.12); }
//     .va-mic-btn:hover { background: rgba(255,255,255,0.22); }
//     .va-mic-btn.muted {
//       background: rgba(239,68,68,0.18);
//       border: 1px solid rgba(239,68,68,0.35);
//     }
//     .va-mic-btn.muted:hover { background: rgba(239,68,68,0.30); }
//     .va-mic-btn svg { width: 18px; height: 18px; }
//     .va-btn-divider {
//       width: 1px; height: 24px;
//       background: rgba(255,255,255,0.1);
//       flex-shrink: 0;
//     }
//     .va-end-btn { background: #dc2626; }
//     .va-end-btn:hover { background: #b91c1c; }
//     .va-end-btn svg { width: 18px; height: 18px; fill: white; }

//     /* Iframe */
//     .va-iframe {
//       width: 100%; height: 100%;
//       border: none;
//       position: absolute;
//       inset: 0;
//       z-index: 10;
//     }
//   `;
//   document.head.appendChild(style);

//   // ── DOM ───────────────────────────────────────────────────────────────────
//   const container = document.createElement("div");
//   container.className = "va-widget-container";
//   container.id = "vaWidgetContainer";

//   container.innerHTML = `
//     <!-- Waveform banner replaces the old image card -->
//     <div class="va-banner" id="vaPreviewBtn" role="button" aria-label="Open voice assistant">
//       <span class="va-banner-dot"></span>
//       <canvas id="vaBannerCanvas"></canvas>
//       <span class="va-banner-label">Ask me</span>
//     </div>

//     <div class="va-expanded-card" id="vaExpandedCard">

//       <div class="va-top-bar">
//         <div class="va-agent-label">
//           <span class="va-status-dot loading" id="vaStatusDot"></span>
//           <span id="vaStatusLabel">Connecting…</span>
//         </div>
//         <button class="va-close-btn" id="vaCloseBtn" title="Close">✕</button>
//       </div>

//       <div class="va-loading-hud" id="vaLoadingHud">
//         <div class="va-loading-ring"></div>
//         <span class="va-loading-text" id="vaLoadingText">Starting session…</span>
//       </div>

  
//       <iframe class="va-iframe" id="vaIframe" allow="autoplay; microphone; camera; fullscreen"></iframe>

//       <div class="va-bottom-bar" id="vaBottomBar">
//         <div class="va-controls-dock">
//           <button class="va-circle-btn va-mic-btn" id="vaMicBtn" title="Toggle microphone">
//             <svg id="vaMicIcon" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
//               <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
//               <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
//               <line x1="12" y1="19" x2="12" y2="23"/>
//               <line x1="8"  y1="23" x2="16" y2="23"/>
//             </svg>
//           </button>
//           <div class="va-btn-divider"></div>
//           <button class="va-circle-btn va-end-btn" id="vaEndBtn" title="End call">
//             <svg viewBox="0 0 24 24" fill="white">
//               <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.32.57 3.58.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1C10.56 21 3 13.44 3 4c0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.26.2 2.47.57 3.58.11.35.03.74-.23 1.01L6.6 10.8z"/>
//             </svg>
//           </button>
//         </div>
//       </div>

//     </div>
//   `;

//   document.body.appendChild(container);

//   // ── Refs ──────────────────────────────────────────────────────────────────
//   const widgetContainer = document.getElementById("vaWidgetContainer");
//   const previewBtn      = document.getElementById("vaPreviewBtn");
//   const closeBtn        = document.getElementById("vaCloseBtn");
//   const endBtn          = document.getElementById("vaEndBtn");
//   const micBtn          = document.getElementById("vaMicBtn");
//   const micIcon         = document.getElementById("vaMicIcon");
//   const iframe          = document.getElementById("vaIframe");
//   const loadingHud      = document.getElementById("vaLoadingHud");
//   const loadingText     = document.getElementById("vaLoadingText");
//   const statusDot       = document.getElementById("vaStatusDot");
//   const statusLabel     = document.getElementById("vaStatusLabel");
//   const bottomBar       = document.getElementById("vaBottomBar");
//   const bannerCanvas    = document.getElementById("vaBannerCanvas");
//   const bannerCtx       = bannerCanvas.getContext("2d");

//   const NUM_BARS   = 8;
//   const IDLE_SPEED = 0.018; 
//   let   idlePhase  = 0;
//   let   displayBins = new Float32Array(NUM_BARS).fill(0);

//   function resizeBannerCanvas() {
//     const rect = bannerCanvas.getBoundingClientRect();
//     bannerCanvas.width  = rect.width  * devicePixelRatio;
//     bannerCanvas.height = rect.height * devicePixelRatio;
//   }

//   function drawBannerWaveform(ts) {
//     waveRafId = requestAnimationFrame(drawBannerWaveform);

//     resizeBannerCanvas();
//     const W = bannerCanvas.width;
//     const H = bannerCanvas.height;
//     bannerCtx.clearRect(0, 0, W, H);

//     const dpr       = devicePixelRatio;
//     const barCount  = NUM_BARS;
//     const gap       = 3 * dpr;
//     const barW      = (W - gap * (barCount - 1)) / barCount;
//     const minH      = 3 * dpr;
//     const maxH      = H * 0.88;

//     idlePhase += IDLE_SPEED;

//     for (let i = 0; i < barCount; i++) {
//       const idleTarget = 0.18 + 0.14 * Math.sin(idlePhase + i * 0.72);

//       const liveTarget   = isSpeaking ? liveBins[i] : idleTarget;
//       const smoothFactor = isSpeaking ? 0.28 : 0.12; 

//       displayBins[i] += (liveTarget - displayBins[i]) * smoothFactor;

//       const barH = minH + displayBins[i] * (maxH - minH);
//       const x    = i * (barW + gap);
//       const y    = (H - barH) / 2;

//       const speaking_alpha = isSpeaking ? Math.min(1, 0.55 + displayBins[i] * 0.9) : 0.38;
//       bannerCtx.fillStyle = isSpeaking
//         ? `rgba(99,230,220,${speaking_alpha})`
//         : `rgba(130,160,255,${speaking_alpha})`;

//       const radius = Math.min(barW / 2, barH / 2, 4 * dpr);
//       bannerCtx.beginPath();
//       bannerCtx.roundRect(x, y, barW, barH, radius);
//       bannerCtx.fill();
//     }
//   }

//   // Start the idle animation immediately (always running)
//   drawBannerWaveform();

//   // ── Loading text cycle ────────────────────────────────────────────────────
//   const loadingMessages = ["Starting session…", "Warming up the agent…", "Almost ready…"];
//   let loadingIdx      = 0;
//   let loadingInterval = null;

//   function startLoadingCycle() {
//     loadingIdx = 0;
//     loadingText.textContent = loadingMessages[0];
//     loadingInterval = setInterval(() => {
//       loadingIdx = (loadingIdx + 1) % loadingMessages.length;
//       loadingText.textContent = loadingMessages[loadingIdx];
//     }, 1800);
//   }
//   function stopLoadingCycle() {
//     clearInterval(loadingInterval);
//     loadingInterval = null;
//   }

//   // ── Reveal agent ──────────────────────────────────────────────────────────
//   function revealAgent() {
//     stopLoadingCycle();
//     loadingHud.style.opacity = "0";
//     setTimeout(() => { loadingHud.style.display = "none"; }, 500);
//     statusDot.classList.remove("loading");
//     statusDot.classList.add("ready");
//     statusLabel.textContent = "Connected";
//     bottomBar.classList.add("visible");
//   }

//   // ── Reset HUD ─────────────────────────────────────────────────────────────
//   const MIC_ON_SVG = `
//     <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
//     <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
//     <line x1="12" y1="19" x2="12" y2="23"/>
//     <line x1="8"  y1="23" x2="16" y2="23"/>
//   `;
//   const MIC_OFF_SVG = `
//     <line x1="1"  y1="1"  x2="23" y2="23"/>
//     <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"/>
//     <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"/>
//     <line x1="12" y1="19" x2="12" y2="23"/>
//     <line x1="8"  y1="23" x2="16" y2="23"/>
//   `;

//   function resetLoadingHud() {
//     loadingHud.style.display    = "flex";
//     loadingHud.style.opacity    = "1";
//     statusDot.classList.remove("ready");
//     statusDot.classList.add("loading");
//     statusLabel.textContent = "Connecting…";
//     bottomBar.classList.remove("visible");
//     micEnabled = true;
//     isSpeaking = false;
//     liveBins.fill(0);
//     micBtn.classList.remove("muted");
//     micIcon.innerHTML = MIC_ON_SVG;
//     micIcon.setAttribute("stroke", "white");
//   }

//   // ── Open ──────────────────────────────────────────────────────────────────
//   function openWidget() {
//     if (isOpen) return;
//     isOpen = true;
//     sessionUserIdentity = `user_${Math.random().toString(36).substring(7)}`;
//     targetRoomName      = `room_${agentId}_${Date.now()}`;
//     widgetContainer.classList.add("is-open");

//     if (!iframeLoaded) {
//       iframeLoaded = true;
//       startLoadingCycle();
//       const widgetUrl = `${apiUrl}/widget/${agentId}?room=${targetRoomName}&identity=${sessionUserIdentity}`;
//       iframe.src = widgetUrl;
//       iframe.addEventListener("load", () => {
//         setTimeout(revealAgent, 1000);
//       }, { once: true });
//     }
//   }

//   // ── Close ─────────────────────────────────────────────────────────────────
//   function closeWidget() {
//     if (!isOpen) return;
//     isOpen = false;
//     try { iframe.contentWindow.postMessage({ type: "VOICE_AGENT_DISCONNECT" }, "*"); } catch (_) {}
//     widgetContainer.classList.remove("is-open");
//     setTimeout(() => {
//       stopLoadingCycle();
//       iframe.src   = "";
//       iframeLoaded = false;
//       resetLoadingHud();
//       previewBtn.style.pointerEvents = "";
//     }, 420);
//   }

//   // ── Mic toggle ────────────────────────────────────────────────────────────
//   function toggleMic() {
//     micEnabled = !micEnabled;
//     if (micEnabled) {
//       micBtn.classList.remove("muted");
//       micIcon.innerHTML = MIC_ON_SVG;
//       micIcon.setAttribute("stroke", "white");
//     } else {
//       micBtn.classList.add("muted");
//       micIcon.innerHTML = MIC_OFF_SVG;
//       micIcon.setAttribute("stroke", "#f87171");
//     }
//     try {
//       iframe.contentWindow.postMessage({ type: "VOICE_AGENT_MIC_TOGGLE", enabled: micEnabled }, "*");
//     } catch (_) {}
//   }

//   // ── Event bindings ────────────────────────────────────────────────────────
//   previewBtn.addEventListener("click", openWidget);
//   closeBtn.addEventListener("click", closeWidget);
//   endBtn.addEventListener("click", closeWidget);
//   micBtn.addEventListener("click", toggleMic);

//   // ── Messages from iframe ──────────────────────────────────────────────────
//   window.addEventListener("message", (event) => {
//     if (!event.data || !event.data.type) return;

//     switch (event.data.type) {

//       case "VOICE_AGENT_CLOSE":
//         closeWidget();
//         break;

//       case "VOICE_AGENT_READY":
//         revealAgent();
//         break;

//       // Real-time frequency bins from the iframe's Web Audio AnalyserNode
//       // Expected shape: { type: "VOICE_AGENT_AUDIO_DATA", bins: number[8], speaking: boolean }
//       case "VOICE_AGENT_AUDIO_DATA": {
//         const { bins, speaking } = event.data;
//         isSpeaking = !!speaking;
//         if (Array.isArray(bins)) {
//           for (let i = 0; i < NUM_BARS; i++) {
//             // Normalise 0-255 byte values → 0-1; fall back gracefully if already 0-1
//             const raw = bins[i] !== undefined ? bins[i] : 0;
//             liveBins[i] = raw > 1 ? raw / 255 : raw;
//           }
//         }
//         break;
//       }

//       case "VOICE_AGENT_MIC_STATE":
//         micEnabled = !!event.data.enabled;
//         micBtn.classList.toggle("muted", !micEnabled);
//         micIcon.innerHTML = micEnabled ? MIC_ON_SVG : MIC_OFF_SVG;
//         micIcon.setAttribute("stroke", micEnabled ? "white" : "#f87171");
//         break;
//     }
//   });

// })();



// (function () {
//   "use strict";

//   const config = window.VoiceAgentConfig || {};
//   const { agentId, apiUrl = "http://localhost:8000" } = config;

//   // ── Idle video (hardcoded; per-embed override via config.idleVideoUrl) ──────
//   const IDLE_VIDEO_URL =
//     config.idleVideoUrl ||
//     "https://res.cloudinary.com/dk3pmujel/video/upload/v1781192124/idle_qrqtki.mp4";

//   // Text bits matching the mockups (overridable via config)
//   const BANNER_TITLE   = config.bannerTitle   || "Hello there! Need Help?";
//   const BANNER_CAPTION = config.bannerCaption || "Hi! I'm here to assist you.";

//   if (!agentId) {
//     console.warn("[VoiceAgent] agentId is missing in global setup parameters.");
//     return;
//   }

//   let sessionUserIdentity = `user_${Math.random().toString(36).substring(7)}`;
//   let targetRoomName      = `room_${agentId}_${Date.now()}`;
//   let isOpen       = false;
//   let iframeLoaded = false;
//   let micEnabled   = true;

//   const INK = "#1b1a4e"; // deep indigo from the mockups

//   const style = document.createElement("style");
//   style.textContent = `
//     .va-widget-container {
//       position: fixed;
//       bottom: 24px;
//       right: 24px;
//       z-index: 2147483647;
//       font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
//       display: flex;
//       flex-direction: column;
//       align-items: flex-end;
//     }

//     /* ─────────────────────────  BANNER (closed state)  ───────────────────── */
//     .va-banner {
//       width: 230px;
//       cursor: pointer;
//       display: flex;
//       flex-direction: column;
//       align-items: center;
//       transition: opacity 0.3s ease, transform 0.3s ease;
//       position: relative;
//     }
//     .va-banner:hover { transform: translateY(-3px); }

//     .va-banner-header {
//       background: ${INK};
//       color: #fff;
//       font-size: 13px;
//       font-weight: 700;
//       padding: 12px 20px;
//       border-radius: 14px;
//       box-shadow: 0 8px 22px rgba(27,26,78,0.30);
//       position: relative;
//       z-index: 2;
//       white-space: nowrap;
//     }
//     .va-banner-header::after {
//       content: "";
//       position: absolute;
//       bottom: -6px;
//       left: 50%;
//       transform: translateX(-50%) rotate(45deg);
//       width: 12px; height: 12px;
//       background: ${INK};
//       border-radius: 2px;
//     }

//     .va-banner-card {
//       margin-top: 10px;
//       width: 100%;
//       aspect-ratio: 1 / 1;
//       border-radius: 16px;
//       overflow: hidden;
//       position: relative;
//       box-shadow: 0 14px 34px rgba(0,0,0,0.22);
//       background: #11163a;
//     }
//     .va-banner-card video {
//       width: 100%; height: 100%;
//       object-fit: cover;
//       display: block;
//     }
//     .va-banner-caption {
//       position: absolute;
//       left: 0; right: 0; bottom: 0;
//       padding: 14px 14px 12px;
//       background: linear-gradient(to top, rgba(8,10,40,0.85), transparent);
//       color: #fff;
//       font-size: 12px;
//       font-weight: 600;
//       text-align: center;
//     }

//     /* ─────────────────────────  EXPANDED CARD  ──────────────────────────── */
//     .va-expanded-card {
//       position: absolute;
//       bottom: 0;
//       right: 0;
//       width: 480px;
//       height: 540px;
//       background: #050505;
//       border-radius: 18px;
//       border: 1px solid #1A1A2E;
//       box-shadow: 0 24px 60px rgba(0,0,0,0.55);
//       overflow: hidden;
//       opacity: 0;
//       pointer-events: none;
//       transform: scale(0.85) translateY(40px);
//       transform-origin: bottom right;
//       transition: opacity 0.35s cubic-bezier(0.16, 1, 0.3, 1),
//                   transform 0.35s cubic-bezier(0.16, 1, 0.3, 1);
//     }
//     @media (max-width: 540px), (max-height: 620px) {
//       .va-expanded-card {
//         width: calc(100vw - 32px);
//         height: calc(100vh - 120px);
//         max-width: 480px; max-height: 540px;
//       }
//     }

//     .va-widget-container.is-open .va-banner {
//       opacity: 0; pointer-events: none; transform: scale(0.85);
//     }
//     .va-widget-container.is-open .va-expanded-card {
//       opacity: 1; pointer-events: auto; transform: scale(1) translateY(0);
//     }

//     .va-close-btn {
//       position: absolute;
//       top: 12px; right: 12px;
//       background: rgba(0,0,0,0.45);
//       border: none;
//       color: #fff;
//       border-radius: 8px;
//       width: 30px; height: 30px;
//       cursor: pointer;
//       display: flex; align-items: center; justify-content: center;
//       font-size: 15px; line-height: 1;
//       z-index: 40;
//       transition: background 0.2s;
//     }
//     .va-close-btn:hover { background: rgba(0,0,0,0.7); }

//     /* top status pill (signal + live timer), shown only when connected */
//     .va-status-pill {
//       position: absolute;
//       top: 12px; right: 50px;
//       display: none;            /* shown via .visible when connected */
//       align-items: center;
//       gap: 6px;
//       z-index: 40;
//     }
//     .va-status-pill.visible { display: flex; }
//     .va-signal {
//       display: inline-flex; align-items: flex-end; gap: 2px;
//       background: rgba(0,0,0,0.45);
//       padding: 6px 8px;
//       border-radius: 8px;
//       height: 30px;
//       box-sizing: border-box;
//     }
//     .va-signal i {
//       width: 3px; background: #fff; border-radius: 1px; display: block;
//       opacity: 0.9;
//     }
//     .va-signal i:nth-child(1) { height: 5px; }
//     .va-signal i:nth-child(2) { height: 8px; }
//     .va-signal i:nth-child(3) { height: 11px; }
//     .va-timer {
//       display: inline-flex; align-items: center; gap: 6px;
//       background: rgba(0,0,0,0.55);
//       color: #fff;
//       font-size: 12px; font-weight: 600;
//       padding: 0 12px;
//       height: 30px;
//       border-radius: 8px;
//       font-variant-numeric: tabular-nums;
//     }
//     .va-timer-dot {
//       width: 7px; height: 7px; border-radius: 50%;
//       background: #ef4444;
//       animation: va-rec 1.4s infinite ease-in-out;
//     }
//     @keyframes va-rec { 0%,100% { opacity: 1; } 50% { opacity: 0.35; } }

//     .va-card-video {
//       position: absolute; inset: 0;
//       width: 100%; height: 100%;
//       object-fit: cover;
//       z-index: 0;
//     }

//     /* "Powered by" mark, bottom-right when connected */
//     .va-powered {
//       position: absolute;
//       right: 12px; bottom: 10px;
//       z-index: 31;
//       display: none;
//       align-items: center; gap: 5px;
//       color: rgba(255,255,255,0.8);
//       font-size: 9px; font-weight: 600;
//       letter-spacing: 0.04em;
//       text-shadow: 0 1px 3px rgba(0,0,0,0.6);
//       pointer-events: none;
//     }
//     .va-powered.visible { display: flex; }

//     /* ── Connecting overlay (matches 2nd mockup) ── */
//     .va-loading-hud {
//       position: absolute; inset: 0;
//       z-index: 20;
//       display: flex; align-items: center; justify-content: center;
//       transition: opacity 0.5s ease;
//     }
//     .va-loading-scrim {
//       position: absolute; inset: 0;
//       background: rgba(10,12,40,0.28);
//       z-index: 0;
//     }
//     .va-connect-card {
//       position: relative;
//       z-index: 1;
//       background: rgba(255,255,255,0.96);
//       border-radius: 16px;
//       padding: 28px 34px;
//       display: flex; flex-direction: column; align-items: center; gap: 12px;
//       box-shadow: 0 12px 40px rgba(0,0,0,0.25);
//       max-width: 78%;
//       text-align: center;
//     }
//     .va-loading-ring {
//       width: 40px; height: 40px;
//       border: 3px solid rgba(27,26,78,0.18);
//       border-top-color: ${INK};
//       border-radius: 50%;
//       animation: va-spin 0.9s linear infinite;
//     }
//     @keyframes va-spin { to { transform: rotate(360deg); } }
//     .va-connect-title {
//       color: ${INK};
//       font-size: 17px;
//       font-weight: 700;
//       margin-top: 2px;
//     }
//     .va-connect-sub {
//       color: #6b7280;
//       font-size: 12px;
//       font-weight: 500;
//     }

//     .va-iframe {
//       width: 100%; height: 100%;
//       border: none;
//       position: absolute; inset: 0;
//       z-index: 10;
//     }

//     .va-bottom-bar {
//       position: absolute;
//       bottom: 0; left: 0; right: 0;
//       display: flex; justify-content: center;
//       padding: 18px 20px 22px;
//       z-index: 30;
//       opacity: 0; pointer-events: none;
//       transition: opacity 0.4s ease;
//     }
//     .va-bottom-bar.visible { opacity: 1; pointer-events: auto; }
//     .va-controls-dock {
//       background: rgba(20,22,40,0.55);
//       backdrop-filter: blur(10px);
//       -webkit-backdrop-filter: blur(10px);
//       border: 1px solid rgba(255,255,255,0.10);
//       border-radius: 50px;
//       padding: 8px 12px;
//       display: flex; gap: 10px; align-items: center;
//       box-shadow: 0 8px 26px rgba(0,0,0,0.35);
//     }
//     .va-circle-btn {
//       width: 44px; height: 44px;
//       border-radius: 50%;
//       border: none; cursor: pointer;
//       display: flex; align-items: center; justify-content: center;
//       transition: background 0.2s, transform 0.15s;
//     }
//     .va-circle-btn:hover  { transform: scale(1.08); }
//     .va-circle-btn:active { transform: scale(0.94); }
//     /* neutral dark buttons (mic / speaker / captions) */
//     .va-tool-btn { background: rgba(40,42,60,0.9); }
//     .va-tool-btn:hover { background: rgba(60,62,84,0.95); }
//     .va-tool-btn svg { width: 18px; height: 18px; }
//     .va-mic-btn.muted {
//       background: rgba(239,68,68,0.85);
//     }
//     .va-tool-btn.off {           /* generic toggled-off (speaker/captions) */
//       background: rgba(239,68,68,0.30);
//       border: 1px solid rgba(239,68,68,0.45);
//     }
//     .va-btn-divider { width: 1px; height: 26px; background: rgba(255,255,255,0.16); margin: 0 2px; }
//     .va-end-btn { background: #e5342b; width: 48px; height: 48px; }
//     .va-end-btn:hover { background: #c81e15; }
//     .va-end-btn svg { width: 20px; height: 20px; fill: white; }
//   `;
//   document.head.appendChild(style);

//   const container = document.createElement("div");
//   container.className = "va-widget-container";
//   container.id = "vaWidgetContainer";
//   container.innerHTML = `
//     <div class="va-banner" id="vaPreviewBtn" role="button" aria-label="Open voice assistant">
//       <div class="va-banner-header">${BANNER_TITLE}</div>
//       <div class="va-banner-card">
//         <video id="vaBannerVideo" muted loop playsinline autoplay preload="auto"></video>
//         <div class="va-banner-caption">${BANNER_CAPTION}</div>
//       </div>
//     </div>

//     <div class="va-expanded-card" id="vaExpandedCard">
//       <div class="va-status-pill" id="vaStatusPill">
//         <span class="va-signal"><i></i><i></i><i></i></span>
//         <span class="va-timer"><span class="va-timer-dot"></span><span id="vaTimer">0:00</span></span>
//       </div>
//       <button class="va-close-btn" id="vaCloseBtn" title="Close">✕</button>

//       <video class="va-card-video" id="vaLoadingVideo" muted loop playsinline autoplay preload="auto"></video>

//       <div class="va-loading-hud" id="vaLoadingHud">
//         <div class="va-loading-scrim"></div>
//         <div class="va-connect-card">
//           <div class="va-loading-ring"></div>
//           <div class="va-connect-title">We are connecting</div>
//           <div class="va-connect-sub">Establishing secure connection…</div>
//         </div>
//       </div>

//       <iframe class="va-iframe" id="vaIframe" allow="autoplay; microphone; camera; fullscreen"></iframe>

//       <div class="va-powered" id="vaPowered">Powered by Gigatech Services</div>

//       <div class="va-bottom-bar" id="vaBottomBar">
//         <div class="va-controls-dock">
//           <button class="va-circle-btn va-tool-btn va-mic-btn" id="vaMicBtn" title="Toggle microphone">
//             <svg id="vaMicIcon" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
//               <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
//               <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
//               <line x1="12" y1="19" x2="12" y2="23"/>
//               <line x1="8"  y1="23" x2="16" y2="23"/>
//             </svg>
//           </button>
//           <button class="va-circle-btn va-tool-btn va-spk-btn" id="vaSpkBtn" title="Toggle speaker">
//             <svg id="vaSpkIcon" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
//               <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
//               <path d="M15.5 8.5a5 5 0 0 1 0 7"/>
//               <path d="M18.5 5.5a9 9 0 0 1 0 13"/>
//             </svg>
//           </button>
//           <button class="va-circle-btn va-tool-btn va-cap-btn" id="vaCapBtn" title="Captions / chat">
//             <svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
//               <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
//             </svg>
//           </button>
//           <div class="va-btn-divider"></div>
//           <button class="va-circle-btn va-end-btn" id="vaEndBtn" title="End call">
//             <svg viewBox="0 0 24 24" fill="white">
//               <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.32.57 3.58.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1C10.56 21 3 13.44 3 4c0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.26.2 2.47.57 3.58.11.35.03.74-.23 1.01L6.6 10.8z"/>
//             </svg>
//           </button>
//         </div>
//       </div>
//     </div>
//   `;
//   document.body.appendChild(container);

//   const widgetContainer = document.getElementById("vaWidgetContainer");
//   const previewBtn      = document.getElementById("vaPreviewBtn");
//   const closeBtn        = document.getElementById("vaCloseBtn");
//   const endBtn          = document.getElementById("vaEndBtn");
//   const micBtn          = document.getElementById("vaMicBtn");
//   const micIcon         = document.getElementById("vaMicIcon");
//   const iframe          = document.getElementById("vaIframe");
//   const loadingHud      = document.getElementById("vaLoadingHud");
//   const bottomBar       = document.getElementById("vaBottomBar");
//   const bannerVideo     = document.getElementById("vaBannerVideo");
//   const loadingVideo    = document.getElementById("vaLoadingVideo");
//   const statusPill      = document.getElementById("vaStatusPill");
//   const poweredMark     = document.getElementById("vaPowered");
//   const timerEl         = document.getElementById("vaTimer");
//   const spkBtn          = document.getElementById("vaSpkBtn");
//   const capBtn          = document.getElementById("vaCapBtn");

//   // call timer state
//   let callSeconds = 0;
//   let callTimerId = null;
//   let speakerOn   = true;
//   let captionsOn  = false;

//   function fmtTime(s) {
//     const m = Math.floor(s / 60);
//     const sec = String(s % 60).padStart(2, "0");
//     return `${m}:${sec}`;
//   }
//   function startCallTimer() {
//     callSeconds = 0;
//     timerEl.textContent = "0:00";
//     stopCallTimer();
//     callTimerId = setInterval(() => {
//       callSeconds += 1;
//       timerEl.textContent = fmtTime(callSeconds);
//     }, 1000);
//   }
//   function stopCallTimer() {
//     if (callTimerId) { clearInterval(callTimerId); callTimerId = null; }
//   }

//   function setupIdleVideo(el) {
//     el.src = IDLE_VIDEO_URL;
//     el.muted = true; el.loop = true; el.playsInline = true;
//     const tryPlay = () => el.play().catch(() => {});
//     el.addEventListener("loadeddata", tryPlay, { once: true });
//     tryPlay();
//   }
//   setupIdleVideo(bannerVideo);
//   setupIdleVideo(loadingVideo);

//   function revealAgent() {
//     loadingHud.style.opacity = "0";
//     setTimeout(() => { loadingHud.style.display = "none"; }, 500);
//     bottomBar.classList.add("visible");
//     statusPill.classList.add("visible");
//     poweredMark.classList.add("visible");
//     startCallTimer();
//   }

//   const MIC_ON_SVG = `
//     <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
//     <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
//     <line x1="12" y1="19" x2="12" y2="23"/>
//     <line x1="8"  y1="23" x2="16" y2="23"/>
//   `;
//   const MIC_OFF_SVG = `
//     <line x1="1"  y1="1"  x2="23" y2="23"/>
//     <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"/>
//     <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"/>
//     <line x1="12" y1="19" x2="12" y2="23"/>
//     <line x1="8"  y1="23" x2="16" y2="23"/>
//   `;

//   function resetLoadingHud() {
//     loadingHud.style.display = "flex";
//     loadingHud.style.opacity = "1";
//     bottomBar.classList.remove("visible");
//     statusPill.classList.remove("visible");
//     poweredMark.classList.remove("visible");
//     stopCallTimer();
//     micEnabled = true;
//     micBtn.classList.remove("muted");
//     micIcon.innerHTML = MIC_ON_SVG;
//     micIcon.setAttribute("stroke", "white");
//     speakerOn = true; captionsOn = false;
//     spkBtn.classList.remove("off");
//     capBtn.classList.remove("off");
//     try { loadingVideo.currentTime = 0; loadingVideo.play().catch(() => {}); } catch (_) {}
//   }

//   function openWidget() {
//     if (isOpen) return;
//     isOpen = true;
//     sessionUserIdentity = `user_${Math.random().toString(36).substring(7)}`;
//     targetRoomName      = `room_${agentId}_${Date.now()}`;
//     widgetContainer.classList.add("is-open");
//     if (!iframeLoaded) {
//       iframeLoaded = true;
//       const widgetUrl = `${apiUrl}/widget/${agentId}?room=${targetRoomName}&identity=${sessionUserIdentity}`;
//       iframe.src = widgetUrl;
//       iframe.addEventListener("load", () => { setTimeout(revealAgent, 1000); }, { once: true });
//     }
//   }

//   function closeWidget() {
//     if (!isOpen) return;
//     isOpen = false;
//     try { iframe.contentWindow.postMessage({ type: "VOICE_AGENT_DISCONNECT" }, "*"); } catch (_) {}
//     widgetContainer.classList.remove("is-open");
//     setTimeout(() => {
//       iframe.src = ""; iframeLoaded = false; resetLoadingHud();
//     }, 420);
//   }
//   const v = document.querySelector('video');
// console.log({
//   hasSrcObject: !!v?.srcObject,
//   tracks: v?.srcObject?.getTracks?.().map(t => `${t.kind}:${t.readyState}`),
//   paused: v?.paused,
//   readyState: v?.readyState,    // 0 = nothing loaded, 4 = playing
//   videoWidth: v?.videoWidth,    // 0 = no frames arriving
// });

//   function toggleMic() {
//     micEnabled = !micEnabled;
//     if (micEnabled) {
//       micBtn.classList.remove("muted");
//       micIcon.innerHTML = MIC_ON_SVG; micIcon.setAttribute("stroke", "white");
//     } else {
//       micBtn.classList.add("muted");
//       micIcon.innerHTML = MIC_OFF_SVG; micIcon.setAttribute("stroke", "#f87171");
//     }
//     try { iframe.contentWindow.postMessage({ type: "VOICE_AGENT_MIC_TOGGLE", enabled: micEnabled }, "*"); } catch (_) {}
//   }

//   function toggleSpeaker() {
//     speakerOn = !speakerOn;
//     spkBtn.classList.toggle("off", !speakerOn);
//     try { iframe.contentWindow.postMessage({ type: "VOICE_AGENT_SPEAKER_TOGGLE", enabled: speakerOn }, "*"); } catch (_) {}
//   }

//   function toggleCaptions() {
//     captionsOn = !captionsOn;
//     capBtn.classList.toggle("off", false);  // captions btn just signals; no red state
//     try { iframe.contentWindow.postMessage({ type: "VOICE_AGENT_CAPTIONS_TOGGLE", enabled: captionsOn }, "*"); } catch (_) {}
//   }

//   previewBtn.addEventListener("click", openWidget);
//   closeBtn.addEventListener("click", closeWidget);
//   endBtn.addEventListener("click", closeWidget);
//   micBtn.addEventListener("click", toggleMic);
//   spkBtn.addEventListener("click", toggleSpeaker);
//   capBtn.addEventListener("click", toggleCaptions);

//   window.addEventListener("message", (event) => {
//     if (!event.data || !event.data.type) return;
//     switch (event.data.type) {
//       case "VOICE_AGENT_CLOSE":  closeWidget();  break;
//       case "VOICE_AGENT_READY":  revealAgent();  break;
//       case "VOICE_AGENT_MIC_STATE":
//         micEnabled = !!event.data.enabled;
//         micBtn.classList.toggle("muted", !micEnabled);
//         micIcon.innerHTML = micEnabled ? MIC_ON_SVG : MIC_OFF_SVG;
//         micIcon.setAttribute("stroke", micEnabled ? "white" : "#f87171");
//         break;
//     }
//   });

// })();



// 003
// (function () {
//   "use strict";

//   const config = window.VoiceAgentConfig || {};
//   const { agentId, apiUrl = "http://localhost:8000" } = config;

//   // ── Idle video (hardcoded; per-embed override via config.idleVideoUrl) ──────
//   const IDLE_VIDEO_URL =
//     config.idleVideoUrl ||
//     "https://res.cloudinary.com/dk3pmujel/video/upload/v1781192124/idle_qrqtki.mp4";

//   // Text bits matching the mockups (overridable via config)
//   const BANNER_TITLE   = config.bannerTitle   || "Hello there! Need Help?";
//   const BANNER_CAPTION = config.bannerCaption || "Hi! I'm here to assist you.";

//   if (!agentId) {
//     console.warn("[VoiceAgent] agentId is missing in global setup parameters.");
//     return;
//   }

//   let sessionUserIdentity = `user_${Math.random().toString(36).substring(7)}`;
//   let targetRoomName      = `room_${agentId}_${Date.now()}`;
//   let isOpen       = false;
//   let iframeLoaded = false;
//   let micEnabled   = true;

//   const INK = "#1b1a4e"; // deep indigo from the mockups

//   const style = document.createElement("style");
//   style.textContent = `
//     .va-widget-container {
//       position: fixed !important;
//       bottom: 24px !important;
//       right: 24px !important;
//       z-index: 2147483647 !important;
//       font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
//       display: flex !important;
//       flex-direction: column !important;
//       align-items: flex-end !important;
//     }

//     /* ─────────────────────────  BANNER (closed state)  ───────────────────── */
//     .va-banner {
//       width: 230px !important;
//       cursor: pointer !important;
//       display: flex !important;
//       flex-direction: column !important;
//       align-items: center !important;
//       transition: opacity 0.3s ease, transform 0.3s ease !important;
//       position: relative !important;
//     }
//     .va-banner:hover { transform: translateY(-3px) !important; }

//     .va-banner-header {
//       background: ${INK} !important;
//       color: #fff !important;
//       font-size: 13px !important;
//       font-weight: 700 !important;
//       padding: 12px 20px !important;
//       border-radius: 14px !important;
//       box-shadow: 0 8px 22px rgba(27,26,78,0.30) !important;
//       position: relative !important;
//       z-index: 2 !important;
//       white-space: nowrap !important;
//     }
//     .va-banner-header::after {
//       content: "" !important;
//       position: absolute !important;
//       bottom: -6px !important;
//       left: 50% !important;
//       transform: translateX(-50%) rotate(45deg) !important;
//       width: 12px !important; height: 12px !important;
//       background: ${INK} !important;
//       border-radius: 2px !important;
//     }

//     .va-banner-card {
//       margin-top: 10px !important;
//       width: 100% !important;
//       aspect-ratio: 1 / 1 !important;
//       border-radius: 16px !important;
//       overflow: hidden !important;
//       position: relative !important;
//       box-shadow: 0 14px 34px rgba(0,0,0,0.22) !important;
//       background: #11163a !important;
//     }
//     .va-banner-card video {
//       width: 100% !important; height: 100% !important;
//       object-fit: cover !important;
//       display: block !important;
//     }
//     .va-banner-caption {
//       position: absolute !important;
//       left: 0 !important; right: 0 !important; bottom: 0 !important;
//       padding: 14px 14px 12px !important;
//       background: linear-gradient(to top, rgba(8,10,40,0.85), transparent) !important;
//       color: #fff !important;
//       font-size: 12px !important;
//       font-weight: 600 !important;
//       text-align: center !important;
//     }

//     /* ─────────────────────────  EXPANDED CARD  ──────────────────────────── */
//     .va-expanded-card {
//       position: absolute !important;
//       bottom: 0 !important;
//       right: 0 !important;
//       width: 480px !important;
//       height: 460px !important;
//       background: #050505 !important;
//       border-radius: 18px !important;
//       border: 1px solid #1A1A2E !important;
//       box-shadow: 0 24px 60px rgba(0,0,0,0.55) !important;
//       overflow: hidden !important;
//       opacity: 0 !important;
//       pointer-events: none !important;
//       transform: scale(0.85) translateY(40px) !important;
//       transform-origin: bottom right !important;
//       transition: opacity 0.35s cubic-bezier(0.16, 1, 0.3, 1),
//                   transform 0.35s cubic-bezier(0.16, 1, 0.3, 1) !important;
//     }
//     @media (max-width: 540px), (max-height: 620px) {
//       .va-expanded-card {
//         width: calc(100vw - 32px) !important;
//         height: calc(100vh - 120px) !important;
//         max-width: 480px !important; max-height: 540px !important;
//       }
//     }

//     .va-widget-container.is-open .va-banner {
//       opacity: 0 !important; pointer-events: none !important; transform: scale(0.85) !important;
//     }
//     .va-widget-container.is-open .va-expanded-card {
//       opacity: 1 !important; pointer-events: auto !important; transform: scale(1) translateY(0) !important;
//     }

//     .va-close-btn {
//       position: absolute !important;
//       top: 12px !important; right: 12px !important;
//       background: rgba(0,0,0,0.45) !important;
//       border: none !important;
//       color: #fff !important;
//       border-radius: 8px !important;
//       width: 30px !important; height: 30px !important;
//       cursor: pointer !important;
//       display: flex !important; align-items: center !important; justify-content: center !important;
//       font-size: 15px !important; line-height: 1 !important;
//       z-index: 40 !important;
//       transition: background 0.2s !important;
//     }
//     .va-close-btn:hover { background: rgba(0,0,0,0.7) !important; }

//     /* top status pill (signal + live timer), shown only when connected */
//     .va-status-pill {
//       position: absolute !important;
//       top: 12px !important; right: 50px !important;
//       display: none !important;            /* shown via .visible when connected */
//       align-items: center !important;
//       gap: 6px !important;
//       z-index: 40 !important;
//     }
//     .va-status-pill.visible { display: flex !important; }
//     .va-signal {
//       display: inline-flex !important; align-items: flex-end !important; gap: 2px !important;
//       background: rgba(0,0,0,0.45) !important;
//       padding: 6px 8px !important;
//       border-radius: 8px !important;
//       height: 30px !important;
//       box-sizing: border-box !important;
//     }
//     .va-signal i {
//       width: 3px !important; background: #fff !important; border-radius: 1px !important; display: block !important;
//       opacity: 0.9 !important;
//     }
//     .va-signal i:nth-child(1) { height: 5px !important; }
//     .va-signal i:nth-child(2) { height: 8px !important; }
//     .va-signal i:nth-child(3) { height: 11px !important; }
//     .va-timer {
//       display: inline-flex !important; align-items: center !important; gap: 6px !important;
//       background: rgba(0,0,0,0.55) !important;
//       color: #fff !important;
//       font-size: 12px !important; font-weight: 600 !important;
//       padding: 0 12px !important;
//       height: 30px !important;
//       border-radius: 8px !important;
//       font-variant-numeric: tabular-nums !important;
//     }
//     .va-timer-dot {
//       width: 7px !important; height: 7px !important; border-radius: 50% !important;
//       background: #ef4444 !important;
//       animation: va-rec 1.4s infinite ease-in-out !important;
//     }
//     @keyframes va-rec { 0%,100% { opacity: 1; } 50% { opacity: 0.35; } }

//     .va-card-video {
//       position: absolute !important; inset: 0 !important;
//       width: 100% !important; height: 100% !important;
//       object-fit: cover !important;
//       z-index: 0 !important;
//     }

//     /* "Powered by" mark, bottom-right when connected */
//     .va-powered {
//       position: absolute !important;
//       right: 12px !important; bottom: 10px !important;
//       z-index: 31 !important;
//       display: none !important;
//       align-items: center !important; gap: 5px !important;
//       color: rgba(255,255,255,0.8) !important;
//       font-size: 9px !important; font-weight: 600 !important;
//       letter-spacing: 0.04em !important;
//       text-shadow: 0 1px 3px rgba(0,0,0,0.6) !important;
//       pointer-events: none !important;
//     }
//     .va-powered.visible { display: flex !important; }

//     /* ── Connecting overlay (matches 2nd mockup) ── */
//     .va-loading-hud {
//       position: absolute !important; inset: 0 !important;
//       z-index: 20 !important;
//       display: flex !important; align-items: center !important; justify-content: center !important;
//       transition: opacity 0.5s ease !important;
//     }
//     .va-loading-scrim {
//       position: absolute !important; inset: 0 !important;
//       background: rgba(10,12,40,0.28) !important;
//       z-index: 0 !important;
//     }
//     .va-connect-card {
//       position: relative !important;
//       z-index: 1 !important;
//       background: rgba(255,255,255,0.96) !important;
//       border-radius: 16px !important;
//       padding: 28px 34px !important;
//       display: flex !important; flex-direction: column !important; align-items: center !important; gap: 12px !important;
//       box-shadow: 0 12px 40px rgba(0,0,0,0.25) !important;
//       max-width: 78% !important;
//       text-align: center !important;
//     }
//     .va-loading-ring {
//       width: 40px !important; height: 40px !important;
//       border: 3px solid rgba(27,26,78,0.18) !important;
//       border-top-color: ${INK} !important;
//       border-radius: 50% !important;
//       animation: va-spin 0.9s linear infinite !important;
//     }
//     @keyframes va-spin { to { transform: rotate(360deg); } }
//     .va-connect-title {
//       color: ${INK} !important;
//       font-size: 17px !important;
//       font-weight: 700 !important;
//       margin-top: 2px !important;
//     }
//     .va-connect-sub {
//       color: #6b7280 !important;
//       font-size: 12px !important;
//       font-weight: 500 !important;
//     }

//     .va-iframe {
//       width: 100% !important; height: 100% !important;
//       border: none !important;
//       position: absolute !important; inset: 0 !important;
//       z-index: 10 !important;
//     }

//     .va-bottom-bar {
//       position: absolute !important;
//       bottom: 0 !important; left: 0 !important; right: 0 !important;
//       display: flex !important; justify-content: center !important;
//       padding: 18px 20px 22px !important;
//       z-index: 30 !important;
//       opacity: 0 !important; pointer-events: none !important;
//       transition: opacity 0.4s ease !important;
//     }
//     .va-bottom-bar.visible { opacity: 1 !important; pointer-events: auto !important; }
//     .va-controls-dock {
//       background: rgba(20,22,40,0.55) !important;
//       backdrop-filter: blur(10px) !important;
//       -webkit-backdrop-filter: blur(10px) !important;
//       border: 1px solid rgba(255,255,255,0.10) !important;
//       border-radius: 50px !important;
//       padding: 8px 12px !important;
//       display: flex !important; gap: 10px !important; align-items: center !important;
//       box-shadow: 0 8px 26px rgba(0,0,0,0.35) !important;
//     }
//     .va-circle-btn {
//       width: 44px !important; height: 44px !important;
//       border-radius: 50% !important;
//       border: none !important; cursor: pointer !important;
//       display: flex !important; align-items: center !important; justify-content: center !important;
//       transition: background 0.2s, transform 0.15s !important;
//     }
//     .va-circle-btn:hover  { transform: scale(1.08) !important; }
//     .va-circle-btn:active { transform: scale(0.94) !important; }
//     /* neutral dark buttons (mic / speaker / captions) */
//     .va-tool-btn { background: rgba(40,42,60,0.9) !important; }
//     .va-tool-btn:hover { background: rgba(60,62,84,0.95) !important; }
//     .va-tool-btn svg { width: 18px !important; height: 18px !important; }
//     .va-mic-btn.muted {
//       background: rgba(239,68,68,0.85) !important;
//     }
//     .va-tool-btn.off {           /* generic toggled-off (speaker/captions) */
//       background: rgba(239,68,68,0.30) !important;
//       border: 1px solid rgba(239,68,68,0.45) !important;
//     }
//     .va-btn-divider { width: 1px !important; height: 26px !important; background: rgba(255,255,255,0.16) !important; margin: 0 2px !important; }
//     .va-end-btn { background: #e5342b !important; width: 48px !important; height: 48px !important; }
//     .va-end-btn:hover { background: #c81e15 !important; }
//     .va-end-btn svg { width: 20px !important; height: 20px !important; fill: white !important; }
//   `;
//   document.head.appendChild(style);

//   const container = document.createElement("div");
//   container.className = "va-widget-container";
//   container.id = "vaWidgetContainer";
//   container.innerHTML = `
//     <div class="va-banner" id="vaPreviewBtn" role="button" aria-label="Open voice assistant">
//       <div class="va-banner-header">${BANNER_TITLE}</div>
//       <div class="va-banner-card">
//         <video id="vaBannerVideo" muted loop playsinline autoplay preload="auto"></video>
//         <div class="va-banner-caption">${BANNER_CAPTION}</div>
//       </div>
//     </div>

//     <div class="va-expanded-card" id="vaExpandedCard">
//       <div class="va-status-pill" id="vaStatusPill">
//         <span class="va-signal"><i></i><i></i><i></i></span>
//         <span class="va-timer"><span class="va-timer-dot"></span><span id="vaTimer">0:00</span></span>
//       </div>
//       <button class="va-close-btn" id="vaCloseBtn" title="Close">✕</button>

//       <video class="va-card-video" id="vaLoadingVideo" muted loop playsinline autoplay preload="auto"></video>

//       <div class="va-loading-hud" id="vaLoadingHud">
//         <div class="va-loading-scrim"></div>
//         <div class="va-connect-card">
//           <div class="va-loading-ring"></div>
//           <div class="va-connect-title">We are connecting</div>
//           <div class="va-connect-sub">Establishing secure connection…</div>
//         </div>
//       </div>

//       <iframe class="va-iframe" id="vaIframe" allow="autoplay; microphone; camera; fullscreen"></iframe>

//       <div class="va-powered" id="vaPowered">Powered by Gigatech Services</div>

//       <div class="va-bottom-bar" id="vaBottomBar">
//         <div class="va-controls-dock">
//           <button class="va-circle-btn va-tool-btn va-mic-btn" id="vaMicBtn" title="Toggle microphone">
//             <svg id="vaMicIcon" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
//               <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
//               <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
//               <line x1="12" y1="19" x2="12" y2="23"/>
//               <line x1="8"  y1="23" x2="16" y2="23"/>
//             </svg>
//           </button>
//           <button class="va-circle-btn va-tool-btn va-spk-btn" id="vaSpkBtn" title="Toggle speaker">
//             <svg id="vaSpkIcon" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
//               <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
//               <path d="M15.5 8.5a5 5 0 0 1 0 7"/>
//               <path d="M18.5 5.5a9 9 0 0 1 0 13"/>
//             </svg>
//           </button>
//           <button class="va-circle-btn va-tool-btn va-cap-btn" id="vaCapBtn" title="Captions / chat">
//             <svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
//               <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
//             </svg>
//           </button>
//           <div class="va-btn-divider"></div>
//           <button class="va-circle-btn va-end-btn" id="vaEndBtn" title="End call">
//             <svg viewBox="0 0 24 24" fill="white">
//               <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.32.57 3.58.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1C10.56 21 3 13.44 3 4c0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.26.2 2.47.57 3.58.11.35.03.74-.23 1.01L6.6 10.8z"/>
//             </svg>
//           </button>
//         </div>
//       </div>
//     </div>
//   `;
//   document.body.appendChild(container);

//   const widgetContainer = document.getElementById("vaWidgetContainer");
//   const previewBtn      = document.getElementById("vaPreviewBtn");
//   const closeBtn        = document.getElementById("vaCloseBtn");
//   const endBtn          = document.getElementById("vaEndBtn");
//   const micBtn          = document.getElementById("vaMicBtn");
//   const micIcon         = document.getElementById("vaMicIcon");
//   const iframe          = document.getElementById("vaIframe");
//   const loadingHud      = document.getElementById("vaLoadingHud");
//   const bottomBar       = document.getElementById("vaBottomBar");
//   const bannerVideo     = document.getElementById("vaBannerVideo");
//   const loadingVideo    = document.getElementById("vaLoadingVideo");
//   const statusPill      = document.getElementById("vaStatusPill");
//   const poweredMark     = document.getElementById("vaPowered");
//   const timerEl         = document.getElementById("vaTimer");
//   const spkBtn          = document.getElementById("vaSpkBtn");
//   const capBtn          = document.getElementById("vaCapBtn");

//   // call timer state
//   let callSeconds = 0;
//   let callTimerId = null;
//   let speakerOn   = true;
//   let captionsOn  = false;

//   function fmtTime(s) {
//     const m = Math.floor(s / 60);
//     const sec = String(s % 60).padStart(2, "0");
//     return `${m}:${sec}`;
//   }
//   function startCallTimer() {
//     callSeconds = 0;
//     timerEl.textContent = "0:00";
//     stopCallTimer();
//     callTimerId = setInterval(() => {
//       callSeconds += 1;
//       timerEl.textContent = fmtTime(callSeconds);
//     }, 1000);
//   }
//   function stopCallTimer() {
//     if (callTimerId) { clearInterval(callTimerId); callTimerId = null; }
//   }

//   function setupIdleVideo(el) {
//     el.src = IDLE_VIDEO_URL;
//     el.muted = true; el.loop = true; el.playsInline = true;
//     const tryPlay = () => el.play().catch(() => {});
//     el.addEventListener("loadeddata", tryPlay, { once: true });
//     tryPlay();
//   }
//   setupIdleVideo(bannerVideo);
//   setupIdleVideo(loadingVideo);

//   function revealAgent() {
//     loadingHud.style.opacity = "0";
//     setTimeout(() => { loadingHud.style.display = "none"; }, 500);
//     bottomBar.classList.add("visible");
//     statusPill.classList.add("visible");
//     poweredMark.classList.add("visible");
//     startCallTimer();
//   }

//   const MIC_ON_SVG = `
//     <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
//     <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
//     <line x1="12" y1="19" x2="12" y2="23"/>
//     <line x1="8"  y1="23" x2="16" y2="23"/>
//   `;
//   const MIC_OFF_SVG = `
//     <line x1="1"  y1="1"  x2="23" y2="23"/>
//     <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"/>
//     <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"/>
//     <line x1="12" y1="19" x2="12" y2="23"/>
//     <line x1="8"  y1="23" x2="16" y2="23"/>
//   `;

//   function resetLoadingHud() {
//     loadingHud.style.display = "flex";
//     loadingHud.style.opacity = "1";
//     bottomBar.classList.remove("visible");
//     statusPill.classList.remove("visible");
//     poweredMark.classList.remove("visible");
//     stopCallTimer();
//     micEnabled = true;
//     micBtn.classList.remove("muted");
//     micIcon.innerHTML = MIC_ON_SVG;
//     micIcon.setAttribute("stroke", "white");
//     speakerOn = true; captionsOn = false;
//     spkBtn.classList.remove("off");
//     capBtn.classList.remove("off");
//     try { loadingVideo.currentTime = 0; loadingVideo.play().catch(() => {}); } catch (_) {}
//   }

//   function openWidget() {
//     if (isOpen) return;
//     isOpen = true;
//     sessionUserIdentity = `user_${Math.random().toString(36).substring(7)}`;
//     targetRoomName      = `room_${agentId}_${Date.now()}`;
//     widgetContainer.classList.add("is-open");
//     if (!iframeLoaded) {
//       iframeLoaded = true;
//       const widgetUrl = `${apiUrl}/widget/${agentId}?room=${targetRoomName}&identity=${sessionUserIdentity}`;
//       iframe.src = widgetUrl;
//       iframe.addEventListener("load", () => { setTimeout(revealAgent, 1000); }, { once: true });
//     }
//   }

//   function closeWidget() {
//     if (!isOpen) return;
//     isOpen = false;
//     try { iframe.contentWindow.postMessage({ type: "VOICE_AGENT_DISCONNECT" }, "*"); } catch (_) {}
//     widgetContainer.classList.remove("is-open");
//     setTimeout(() => {
//       iframe.src = ""; iframeLoaded = false; resetLoadingHud();
//     }, 420);
//   }
//   const v = document.querySelector('video');
// console.log({
//   hasSrcObject: !!v?.srcObject,
//   tracks: v?.srcObject?.getTracks?.().map(t => `${t.kind}:${t.readyState}`),
//   paused: v?.paused,
//   readyState: v?.readyState,    // 0 = nothing loaded, 4 = playing
//   videoWidth: v?.videoWidth,    // 0 = no frames arriving
// });

//   function toggleMic() {
//     micEnabled = !micEnabled;
//     if (micEnabled) {
//       micBtn.classList.remove("muted");
//       micIcon.innerHTML = MIC_ON_SVG; micIcon.setAttribute("stroke", "white");
//     } else {
//       micBtn.classList.add("muted");
//       micIcon.innerHTML = MIC_OFF_SVG; micIcon.setAttribute("stroke", "#f87171");
//     }
//     try { iframe.contentWindow.postMessage({ type: "VOICE_AGENT_MIC_TOGGLE", enabled: micEnabled }, "*"); } catch (_) {}
//   }

//   function toggleSpeaker() {
//     speakerOn = !speakerOn;
//     spkBtn.classList.toggle("off", !speakerOn);
//     try { iframe.contentWindow.postMessage({ type: "VOICE_AGENT_SPEAKER_TOGGLE", enabled: speakerOn }, "*"); } catch (_) {}
//   }

//   function toggleCaptions() {
//     captionsOn = !captionsOn;
//     capBtn.classList.toggle("off", false);  // captions btn just signals; no red state
//     try { iframe.contentWindow.postMessage({ type: "VOICE_AGENT_CAPTIONS_TOGGLE", enabled: captionsOn }, "*"); } catch (_) {}
//   }

//   previewBtn.addEventListener("click", openWidget);
//   closeBtn.addEventListener("click", closeWidget);
//   endBtn.addEventListener("click", closeWidget);
//   micBtn.addEventListener("click", toggleMic);
//   spkBtn.addEventListener("click", toggleSpeaker);
//   capBtn.addEventListener("click", toggleCaptions);

//   window.addEventListener("message", (event) => {
//     if (!event.data || !event.data.type) return;
//     switch (event.data.type) {
//       case "VOICE_AGENT_CLOSE":  closeWidget();  break;
//       case "VOICE_AGENT_READY":  revealAgent();  break;
//       case "VOICE_AGENT_MIC_STATE":
//         micEnabled = !!event.data.enabled;
//         micBtn.classList.toggle("muted", !micEnabled);
//         micIcon.innerHTML = micEnabled ? MIC_ON_SVG : MIC_OFF_SVG;
//         micIcon.setAttribute("stroke", micEnabled ? "white" : "#f87171");
//         break;
//     }
//   });

// })();



(function () {
  "use strict";

  const config = window.VoiceAgentConfig || {};
  const { agentId, apiUrl = "http://localhost:8000" } = config;

  // ── Idle video (hardcoded; per-embed override via config.idleVideoUrl) ──────
  const IDLE_VIDEO_URL =
    config.idleVideoUrl ||
    "https://res.cloudinary.com/dk3pmujel/video/upload/v1781192124/idle_qrqtki.mp4";

  // Text bits matching the mockups (overridable via config)
  const BANNER_TITLE   = config.bannerTitle   || "Hello there! Need Help?";
  const BANNER_CAPTION = config.bannerCaption || "Hi! I'm here to assist you.";

  if (!agentId) {
    console.warn("[VoiceAgent] agentId is missing in global setup parameters.");
    return;
  }

  let sessionUserIdentity = `user_${Math.random().toString(36).substring(7)}`;
  let targetRoomName      = `room_${agentId}_${Date.now()}`;
  let isOpen       = false;
  let iframeLoaded = false;
  let micEnabled   = true;

  const INK = "#1b1a4e"; // deep indigo from the mockups
  const SVGNS = "http://www.w3.org/2000/svg";

  const style = document.createElement("style");
  style.textContent = `
    .va-widget-container {
      position: fixed !important;
      bottom: 24px !important;
      right: 24px !important;
      z-index: 2147483647 !important;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
      display: flex !important;
      flex-direction: column !important;
      align-items: flex-end !important;
    }

    /* ─────────────────────────  BANNER (closed state)  ───────────────────── */
    .va-banner {
      width: 230px !important;
      cursor: pointer !important;
      display: flex !important;
      flex-direction: column !important;
      align-items: center !important;
      transition: opacity 0.3s ease, transform 0.3s ease !important;
      position: relative !important;
    }
    .va-banner:hover { transform: translateY(-3px) !important; }

    .va-banner-header {
      background: ${INK} !important;
      color: #fff !important;
      font-size: 13px !important;
      font-weight: 700 !important;
      padding: 12px 20px !important;
      border-radius: 14px !important;
      box-shadow: 0 8px 22px rgba(27,26,78,0.30) !important;
      position: relative !important;
      z-index: 2 !important;
      white-space: nowrap !important;
    }
    .va-banner-header::after {
      content: "" !important;
      position: absolute !important;
      bottom: -6px !important;
      left: 50% !important;
      transform: translateX(-50%) rotate(45deg) !important;
      width: 12px !important; height: 12px !important;
      background: ${INK} !important;
      border-radius: 2px !important;
    }

    .va-banner-card {
      margin-top: 10px !important;
      width: 100% !important;
      aspect-ratio: 1 / 1 !important;
      border-radius: 16px !important;
      overflow: hidden !important;
      position: relative !important;
      box-shadow: 0 14px 34px rgba(0,0,0,0.22) !important;
      background: #11163a !important;
    }
    .va-banner-card video {
      width: 100% !important; height: 100% !important;
      object-fit: cover !important;
      display: block !important;
    }
    .va-banner-caption {
      position: absolute !important;
      left: 0 !important; right: 0 !important; bottom: 0 !important;
      padding: 14px 14px 12px !important;
      background: linear-gradient(to top, rgba(8,10,40,0.85), transparent) !important;
      color: #fff !important;
      font-size: 12px !important;
      font-weight: 600 !important;
      text-align: center !important;
    }

    /* ─────────────────────────  EXPANDED CARD  ──────────────────────────── */
    .va-expanded-card {
      position: absolute !important;
      bottom: 0 !important;
      right: 0 !important;
      width: 480px !important;
      height: 460px !important;
      background: #050505 !important;
      border-radius: 18px !important;
      border: 1px solid #1A1A2E !important;
      box-shadow: 0 24px 60px rgba(0,0,0,0.55) !important;
      overflow: hidden !important;
      opacity: 0 !important;
      pointer-events: none !important;
      transform: scale(0.85) translateY(40px) !important;
      transform-origin: bottom right !important;
      transition: opacity 0.35s cubic-bezier(0.16, 1, 0.3, 1),
                  transform 0.35s cubic-bezier(0.16, 1, 0.3, 1) !important;
    }
    @media (max-width: 540px), (max-height: 620px) {
      .va-expanded-card {
        width: calc(100vw - 32px) !important;
        height: calc(100vh - 120px) !important;
        max-width: 480px !important; max-height: 540px !important;
      }
    }

    .va-widget-container.is-open .va-banner {
      opacity: 0 !important; pointer-events: none !important; transform: scale(0.85) !important;
    }
    .va-widget-container.is-open .va-expanded-card {
      opacity: 1 !important; pointer-events: auto !important; transform: scale(1) translateY(0) !important;
    }

    .va-close-btn {
      position: absolute !important;
      top: 12px !important; right: 12px !important;
      background: rgba(0,0,0,0.45) !important;
      border: none !important;
      color: #fff !important;
      border-radius: 8px !important;
      width: 30px !important; height: 30px !important;
      cursor: pointer !important;
      display: flex !important; align-items: center !important; justify-content: center !important;
      font-size: 15px !important; line-height: 1 !important;
      z-index: 40 !important;
      transition: background 0.2s !important;
    }
    .va-close-btn:hover { background: rgba(0,0,0,0.7) !important; }

    /* top status pill (signal + live timer), shown only when connected */
    .va-status-pill {
      position: absolute !important;
      top: 12px !important; right: 50px !important;
      display: none !important;            /* shown via .visible when connected */
      align-items: center !important;
      gap: 6px !important;
      z-index: 40 !important;
    }
    .va-status-pill.visible { display: flex !important; }
    .va-signal {
      display: inline-flex !important; align-items: flex-end !important; gap: 2px !important;
      background: rgba(0,0,0,0.45) !important;
      padding: 6px 8px !important;
      border-radius: 8px !important;
      height: 30px !important;
      box-sizing: border-box !important;
    }
    .va-signal i {
      width: 3px !important; background: #fff !important; border-radius: 1px !important; display: block !important;
      opacity: 0.9 !important;
    }
    .va-signal i:nth-child(1) { height: 5px !important; }
    .va-signal i:nth-child(2) { height: 8px !important; }
    .va-signal i:nth-child(3) { height: 11px !important; }
    .va-timer {
      display: inline-flex !important; align-items: center !important; gap: 6px !important;
      background: rgba(0,0,0,0.55) !important;
      color: #fff !important;
      font-size: 12px !important; font-weight: 600 !important;
      padding: 0 12px !important;
      height: 30px !important;
      border-radius: 8px !important;
      font-variant-numeric: tabular-nums !important;
    }
    .va-timer-dot {
      width: 7px !important; height: 7px !important; border-radius: 50% !important;
      background: #ef4444 !important;
      animation: va-rec 1.4s infinite ease-in-out !important;
    }
    @keyframes va-rec { 0%,100% { opacity: 1; } 50% { opacity: 0.35; } }

    .va-card-video {
      position: absolute !important; inset: 0 !important;
      width: 100% !important; height: 100% !important;
      object-fit: cover !important;
      z-index: 0 !important;
    }

    /* "Powered by" mark, bottom-right when connected */
    .va-powered {
      position: absolute !important;
      right: 12px !important; bottom: 10px !important;
      z-index: 31 !important;
      display: none !important;
      align-items: center !important; gap: 5px !important;
      color: rgba(255,255,255,0.8) !important;
      font-size: 9px !important; font-weight: 600 !important;
      letter-spacing: 0.04em !important;
      text-shadow: 0 1px 3px rgba(0,0,0,0.6) !important;
      pointer-events: none !important;
    }
    .va-powered.visible { display: flex !important; }

    /* ── Connecting overlay (matches 2nd mockup) ── */
    .va-loading-hud {
      position: absolute !important; inset: 0 !important;
      z-index: 20 !important;
      display: flex !important; align-items: center !important; justify-content: center !important;
      transition: opacity 0.5s ease !important;
    }
    .va-loading-scrim {
      position: absolute !important; inset: 0 !important;
      background: rgba(10,12,40,0.28) !important;
      z-index: 0 !important;
    }
    .va-connect-card {
      position: relative !important;
      z-index: 1 !important;
      background: rgba(255,255,255,0.96) !important;
      border-radius: 16px !important;
      padding: 28px 34px !important;
      display: flex !important; flex-direction: column !important; align-items: center !important; gap: 12px !important;
      box-shadow: 0 12px 40px rgba(0,0,0,0.25) !important;
      max-width: 78% !important;
      text-align: center !important;
    }
    .va-loading-ring {
      width: 40px !important; height: 40px !important;
      border: 3px solid rgba(27,26,78,0.18) !important;
      border-top-color: ${INK} !important;
      border-radius: 50% !important;
      animation: va-spin 0.9s linear infinite !important;
    }
    @keyframes va-spin { to { transform: rotate(360deg); } }
    .va-connect-title {
      color: ${INK} !important;
      font-size: 17px !important;
      font-weight: 700 !important;
      margin-top: 2px !important;
    }
    .va-connect-sub {
      color: #6b7280 !important;
      font-size: 12px !important;
      font-weight: 500 !important;
    }

    .va-iframe {
      width: 100% !important; height: 100% !important;
      border: none !important;
      position: absolute !important; inset: 0 !important;
      z-index: 10 !important;
    }

    .va-bottom-bar {
      position: absolute !important;
      bottom: 0 !important; left: 0 !important; right: 0 !important;
      display: flex !important; justify-content: center !important;
      padding: 18px 20px 22px !important;
      z-index: 30 !important;
      opacity: 0 !important; pointer-events: none !important;
      transition: opacity 0.4s ease !important;
    }
    .va-bottom-bar.visible { opacity: 1 !important; pointer-events: auto !important; }
    .va-controls-dock {
      background: rgba(20,22,40,0.55) !important;
      backdrop-filter: blur(10px) !important;
      -webkit-backdrop-filter: blur(10px) !important;
      border: 1px solid rgba(255,255,255,0.10) !important;
      border-radius: 50px !important;
      padding: 8px 12px !important;
      display: flex !important; gap: 10px !important; align-items: center !important;
      box-shadow: 0 8px 26px rgba(0,0,0,0.35) !important;
    }
    .va-circle-btn {
      width: 44px !important; height: 44px !important;
      border-radius: 50% !important;
      border: none !important; cursor: pointer !important;
      display: flex !important; align-items: center !important; justify-content: center !important;
      transition: background 0.2s, transform 0.15s !important;
    }
    .va-circle-btn:hover  { transform: scale(1.08) !important; }
    .va-circle-btn:active { transform: scale(0.94) !important; }
    /* neutral dark buttons (mic / speaker / captions) */
    .va-tool-btn { background: rgba(40,42,60,0.9) !important; }
    .va-tool-btn:hover { background: rgba(60,62,84,0.95) !important; }
    .va-tool-btn svg {
      width: 18px !important; height: 18px !important;
      display: block !important;
      max-width: none !important; max-height: none !important;
      fill: none !important;
      stroke: #fff !important;
      stroke-width: 2 !important;
      stroke-linecap: round !important;
      stroke-linejoin: round !important;
      overflow: visible !important;
      vertical-align: middle !important;
    }
    /* stroke icons: children must never be filled by host theme rules */
    .va-tool-btn svg path,
    .va-tool-btn svg line,
    .va-tool-btn svg polygon,
    .va-tool-btn svg polyline,
    .va-tool-btn svg circle {
      fill: none !important;
      stroke: inherit !important;
      stroke-width: 2 !important;
    }
    .va-mic-btn.muted {
      background: rgba(239,68,68,0.85) !important;
    }
    /* muted mic uses a reddish stroke */
    .va-mic-btn.muted svg,
    .va-mic-btn.muted svg path,
    .va-mic-btn.muted svg line {
      stroke: #f87171 !important;
    }
    .va-tool-btn.off {           /* generic toggled-off (speaker/captions) */
      background: rgba(239,68,68,0.30) !important;
      border: 1px solid rgba(239,68,68,0.45) !important;
    }
    .va-btn-divider { width: 1px !important; height: 26px !important; background: rgba(255,255,255,0.16) !important; margin: 0 2px !important; }
    .va-end-btn { background: #e5342b !important; width: 48px !important; height: 48px !important; }
    .va-end-btn:hover { background: #c81e15 !important; }
    /* end-call icon is a FILLED glyph, not a stroke icon */
    .va-end-btn svg {
      width: 20px !important; height: 20px !important;
      display: block !important;
      max-width: none !important; max-height: none !important;
      overflow: visible !important;
      vertical-align: middle !important;
    }
    .va-end-btn svg,
    .va-end-btn svg path {
      fill: #fff !important;
      stroke: none !important;
    }
  `;
  document.head.appendChild(style);

  const container = document.createElement("div");
  container.className = "va-widget-container";
  container.id = "vaWidgetContainer";
  container.innerHTML = `
    <div class="va-banner" id="vaPreviewBtn" role="button" aria-label="Open voice assistant">
      <div class="va-banner-header">${BANNER_TITLE}</div>
      <div class="va-banner-card">
        <video id="vaBannerVideo" muted loop playsinline autoplay preload="auto"></video>
        <div class="va-banner-caption">${BANNER_CAPTION}</div>
      </div>
    </div>

    <div class="va-expanded-card" id="vaExpandedCard">
      <div class="va-status-pill" id="vaStatusPill">
        <span class="va-signal"><i></i><i></i><i></i></span>
        <span class="va-timer"><span class="va-timer-dot"></span><span id="vaTimer">0:00</span></span>
      </div>
      <button class="va-close-btn" id="vaCloseBtn" title="Close">✕</button>

      <video class="va-card-video" id="vaLoadingVideo" muted loop playsinline autoplay preload="auto"></video>

      <div class="va-loading-hud" id="vaLoadingHud">
        <div class="va-loading-scrim"></div>
        <div class="va-connect-card">
          <div class="va-loading-ring"></div>
          <div class="va-connect-title">We are connecting</div>
          <div class="va-connect-sub">Establishing secure connection…</div>
        </div>
      </div>

      <iframe class="va-iframe" id="vaIframe" allow="autoplay; microphone; camera; fullscreen"></iframe>

      <div class="va-powered" id="vaPowered">Powered by Gigatech Services</div>

      <div class="va-bottom-bar" id="vaBottomBar">
        <div class="va-controls-dock">
          <button class="va-circle-btn va-tool-btn va-mic-btn" id="vaMicBtn" title="Toggle microphone">
            <svg id="vaMicIcon" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></svg>
          </button>
          <button class="va-circle-btn va-tool-btn va-spk-btn" id="vaSpkBtn" title="Toggle speaker">
            <svg id="vaSpkIcon" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
              <path d="M15.5 8.5a5 5 0 0 1 0 7"/>
              <path d="M18.5 5.5a9 9 0 0 1 0 13"/>
            </svg>
          </button>
          <button class="va-circle-btn va-tool-btn va-cap-btn" id="vaCapBtn" title="Captions / chat">
            <svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
          </button>
          <div class="va-btn-divider"></div>
          <button class="va-circle-btn va-end-btn" id="vaEndBtn" title="End call">
            <svg viewBox="0 0 24 24" fill="white">
              <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.32.57 3.58.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1C10.56 21 3 13.44 3 4c0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.26.2 2.47.57 3.58.11.35.03.74-.23 1.01L6.6 10.8z"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(container);

  const widgetContainer = document.getElementById("vaWidgetContainer");
  const previewBtn      = document.getElementById("vaPreviewBtn");
  const closeBtn        = document.getElementById("vaCloseBtn");
  const endBtn          = document.getElementById("vaEndBtn");
  const micBtn          = document.getElementById("vaMicBtn");
  const micIcon         = document.getElementById("vaMicIcon");
  const iframe          = document.getElementById("vaIframe");
  const loadingHud      = document.getElementById("vaLoadingHud");
  const bottomBar       = document.getElementById("vaBottomBar");
  const bannerVideo     = document.getElementById("vaBannerVideo");
  const loadingVideo    = document.getElementById("vaLoadingVideo");
  const statusPill      = document.getElementById("vaStatusPill");
  const poweredMark     = document.getElementById("vaPowered");
  const timerEl         = document.getElementById("vaTimer");
  const spkBtn          = document.getElementById("vaSpkBtn");
  const capBtn          = document.getElementById("vaCapBtn");

  // call timer state
  let callSeconds = 0;
  let callTimerId = null;
  let speakerOn   = true;
  let captionsOn  = false;

  // ── SVG icon builders (namespace-aware — fixes icons not rendering) ──────────
  const MIC_ON = [
    ["path", { d: "M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" }],
    ["path", { d: "M19 10v2a7 7 0 0 1-14 0v-2" }],
    ["line", { x1: "12", y1: "19", x2: "12", y2: "23" }],
    ["line", { x1: "8", y1: "23", x2: "16", y2: "23" }],
  ];
  const MIC_OFF = [
    ["line", { x1: "1", y1: "1", x2: "23", y2: "23" }],
    ["path", { d: "M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6" }],
    ["path", { d: "M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23" }],
    ["line", { x1: "12", y1: "19", x2: "12", y2: "23" }],
    ["line", { x1: "8", y1: "23", x2: "16", y2: "23" }],
  ];

  function buildSvg(paths) {
    const frag = document.createDocumentFragment();
    for (const [tag, attrs] of paths) {
      const el = document.createElementNS(SVGNS, tag);
      for (const k in attrs) el.setAttribute(k, attrs[k]);
      frag.appendChild(el);
    }
    return frag;
  }

  function setMicIcon(on) {
    while (micIcon.firstChild) micIcon.removeChild(micIcon.firstChild);
    micIcon.appendChild(buildSvg(on ? MIC_ON : MIC_OFF));
    // stroke color is driven by CSS (.va-mic-btn.muted svg) so it survives host themes
  }

  // initial paint
  setMicIcon(true);

  function fmtTime(s) {
    const m = Math.floor(s / 60);
    const sec = String(s % 60).padStart(2, "0");
    return `${m}:${sec}`;
  }
  function startCallTimer() {
    callSeconds = 0;
    timerEl.textContent = "0:00";
    stopCallTimer();
    callTimerId = setInterval(() => {
      callSeconds += 1;
      timerEl.textContent = fmtTime(callSeconds);
    }, 1000);
  }
  function stopCallTimer() {
    if (callTimerId) { clearInterval(callTimerId); callTimerId = null; }
  }

  function setupIdleVideo(el) {
    el.src = IDLE_VIDEO_URL;
    el.muted = true; el.loop = true; el.playsInline = true;
    const tryPlay = () => el.play().catch(() => {});
    el.addEventListener("loadeddata", tryPlay, { once: true });
    tryPlay();
  }
  setupIdleVideo(bannerVideo);
  setupIdleVideo(loadingVideo);

  function revealAgent() {
    loadingHud.style.opacity = "0";
    setTimeout(() => { loadingHud.style.display = "none"; }, 500);
    bottomBar.classList.add("visible");
    statusPill.classList.add("visible");
    poweredMark.classList.add("visible");
    startCallTimer();
  }

  function resetLoadingHud() {
    loadingHud.style.display = "flex";
    loadingHud.style.opacity = "1";
    bottomBar.classList.remove("visible");
    statusPill.classList.remove("visible");
    poweredMark.classList.remove("visible");
    stopCallTimer();
    micEnabled = true;
    micBtn.classList.remove("muted");
    setMicIcon(true);
    speakerOn = true; captionsOn = false;
    spkBtn.classList.remove("off");
    capBtn.classList.remove("off");
    try { loadingVideo.currentTime = 0; loadingVideo.play().catch(() => {}); } catch (_) {}
  }

  function openWidget() {
    if (isOpen) return;
    isOpen = true;
    sessionUserIdentity = `user_${Math.random().toString(36).substring(7)}`;
    targetRoomName      = `room_${agentId}_${Date.now()}`;
    widgetContainer.classList.add("is-open");
    if (!iframeLoaded) {
      iframeLoaded = true;
      const widgetUrl = `${apiUrl}/widget/${agentId}?room=${targetRoomName}&identity=${sessionUserIdentity}`;
      iframe.src = widgetUrl;
      iframe.addEventListener("load", () => { setTimeout(revealAgent, 1000); }, { once: true });
    }
  }

  function closeWidget() {
    if (!isOpen) return;
    isOpen = false;
    try { iframe.contentWindow.postMessage({ type: "VOICE_AGENT_DISCONNECT" }, "*"); } catch (_) {}
    widgetContainer.classList.remove("is-open");
    setTimeout(() => {
      iframe.src = ""; iframeLoaded = false; resetLoadingHud();
    }, 420);
  }

  function toggleMic() {
    micEnabled = !micEnabled;
    micBtn.classList.toggle("muted", !micEnabled);
    setMicIcon(micEnabled);
    try { iframe.contentWindow.postMessage({ type: "VOICE_AGENT_MIC_TOGGLE", enabled: micEnabled }, "*"); } catch (_) {}
  }

  function toggleSpeaker() {
    speakerOn = !speakerOn;
    spkBtn.classList.toggle("off", !speakerOn);
    try { iframe.contentWindow.postMessage({ type: "VOICE_AGENT_SPEAKER_TOGGLE", enabled: speakerOn }, "*"); } catch (_) {}
  }

  function toggleCaptions() {
    captionsOn = !captionsOn;
    capBtn.classList.toggle("off", false);  // captions btn just signals; no red state
    try { iframe.contentWindow.postMessage({ type: "VOICE_AGENT_CAPTIONS_TOGGLE", enabled: captionsOn }, "*"); } catch (_) {}
  }

  previewBtn.addEventListener("click", openWidget);
  closeBtn.addEventListener("click", closeWidget);
  endBtn.addEventListener("click", closeWidget);
  micBtn.addEventListener("click", toggleMic);
  spkBtn.addEventListener("click", toggleSpeaker);
  capBtn.addEventListener("click", toggleCaptions);

  window.addEventListener("message", (event) => {
    if (!event.data || !event.data.type) return;
    switch (event.data.type) {
      case "VOICE_AGENT_CLOSE":  closeWidget();  break;
      case "VOICE_AGENT_READY":  revealAgent();  break;
      case "VOICE_AGENT_MIC_STATE":
        micEnabled = !!event.data.enabled;
        micBtn.classList.toggle("muted", !micEnabled);
        setMicIcon(micEnabled);
        break;
    }
  });

})();
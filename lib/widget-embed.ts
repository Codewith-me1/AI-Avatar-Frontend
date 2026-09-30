/**
 * Loader for the embeddable widget (`public/components/widget/widget.js`).
 *
 * The script is an IIFE that reads `window.VoiceAgentConfig` the moment it
 * executes, so the config has to exist first. Setting it here and only then
 * appending the tag removes the race the plain HTML snippet has, where an
 * `async` loader could in principle run before the inline config script.
 *
 * Shared by the site widget on the landing page and the sandbox preview host.
 */

export interface VoiceAgentConfig {
  agentId: string;
  apiUrl: string;
  bannerTitle?: string;
  bannerCaption?: string;
  idleVideoUrl?: string;
}

declare global {
  interface Window {
    VoiceAgentConfig?: VoiceAgentConfig;
  }
}

export const WIDGET_SRC = "/components/widget/widget.js";

/** The element widget.js appends to the body. */
const CONTAINER_ID = "vaWidgetContainer";

/**
 * Mount the widget and return a cleanup function.
 *
 * Safe to call twice (React runs effects twice in development): a second call
 * with the same `scriptId` is a no-op. Cleanup removes the widget from the DOM
 * so client-side navigation away from the page it belongs to takes it with it.
 */
export function mountWidget(
  config: VoiceAgentConfig,
  scriptId: string,
  onError?: () => void,
): () => void {
  if (typeof window === "undefined") return () => {};
  if (document.getElementById(scriptId)) return () => {};

  window.VoiceAgentConfig = config;

  const script = document.createElement("script");
  script.id = scriptId;
  script.src = WIDGET_SRC;
  script.async = true;
  if (onError) script.onerror = onError;
  // Appended to the body, so it ends up exactly where the hand-written snippet
  // would sit: last thing before </body>.
  document.body.appendChild(script);

  return () => {
    document.getElementById(scriptId)?.remove();
    document.getElementById(CONTAINER_ID)?.remove();
    // The stylesheet it injected is left alone: it only targets .va-* elements,
    // which are gone, and re-mounting would just add it again.
  };
}

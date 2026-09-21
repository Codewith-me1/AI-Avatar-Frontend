"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  Blocks,
  Bot,
  CheckCircle2,
  ChevronDown,
  Info,
  Loader2,
  Pencil,
  Play,
  Plus,
  Search,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import {
  createTool,
  deleteTool,
  listTools,
  testTool,
  updateTool,
} from "@/lib/api/tools";
import { listAgents } from "@/lib/api/agents";
import { CapabilitiesPanel } from "@/components/agent/CapabilitiesPanel";
import { useToast } from "@/components/widget/Toast";
import {
  GhostButton,
  Label,
  Modal,
  PrimaryButton,
  Row,
  Spinner,
  Toggle,
} from "@/components/console/ui";
import type {
  Agent,
  ToolAuthType,
  ToolInput,
  ToolRow,
  ToolTestResult,
} from "@/types";

/** Remembers which agent the capability cards were last pointed at. */
const AGENT_KEY = "avat_tools_agent";

const METHODS = ["POST", "GET", "PUT", "PATCH", "DELETE"];

const AUTH_LABELS: Record<ToolAuthType, string> = {
  none: "No authentication",
  api_key: "API key header",
  bearer: "Bearer token",
  basic: "Basic auth",
};

const emptyDraft = (): ToolDraft => ({
  name: "",
  description: "",
  url: "",
  method: "POST",
  headersText: "",
  parametersText: `{\n  "type": "object",\n  "properties": {\n    "query": {\n      "type": "string",\n      "description": "What to look up"\n    }\n  },\n  "required": ["query"]\n}`,
  auth_type: "none",
  auth: { header: "X-API-Key", key: "", token: "", username: "", password: "" },
  timeout_seconds: 10,
  is_enabled: true,
});

interface ToolDraft {
  name: string;
  description: string;
  url: string;
  method: string;
  headersText: string;
  parametersText: string;
  auth_type: ToolAuthType;
  auth: { header: string; key: string; token: string; username: string; password: string };
  timeout_seconds: number;
  is_enabled: boolean;
}

export default function ToolsPage() {
  const { showToast } = useToast();
  const [tools, setTools] = useState<ToolRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [showInfo, setShowInfo] = useState(false);

  const [editing, setEditing] = useState<ToolRow | "new" | null>(null);
  const [testing, setTesting] = useState<ToolRow | null>(null);
  const [deleting, setDeleting] = useState<ToolRow | null>(null);

  // The capability tools (lead capture, appointments, handoff) are per-agent,
  // so the page needs to know which agent it is configuring.
  const [agents, setAgents] = useState<Agent[]>([]);
  const [agentId, setAgentId] = useState<string>("");
  const [agentsLoading, setAgentsLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      setTools(await listTools());
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : "Could not load tools.");
      setTools([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    listAgents()
      .then((list) => {
        const real = (list || []).filter((a) => !a.id.startsWith("demo-"));
        setAgents(real);
        let remembered = "";
        try {
          remembered = localStorage.getItem(AGENT_KEY) || "";
        } catch {
          /* storage unavailable */
        }
        setAgentId(
          real.some((a) => a.id === remembered) ? remembered : real[0]?.id || "",
        );
      })
      .catch(() => setAgents([]))
      .finally(() => setAgentsLoading(false));
  }, []);

  const selectAgent = (id: string) => {
    setAgentId(id);
    try {
      localStorage.setItem(AGENT_KEY, id);
    } catch {
      /* storage unavailable */
    }
  };

  const filtered = tools.filter(
    (t) =>
      t.name.toLowerCase().includes(query.toLowerCase()) ||
      (t.description || "").toLowerCase().includes(query.toLowerCase()),
  );

  const customCount = tools.filter((t) => t.type === "Custom").length;

  return (
    <div className="p-8! md:p-10! max-w-[1320px] mx-auto! w-full!">
      <div className="flex items-center justify-between gap-4! mb-2!">
        <h1 className="text-[24px] font-semibold text-[var(--ink)] tracking-tight">
          Tools
        </h1>
        <div className="flex items-center gap-2!">
          <button
            onClick={() => setShowInfo((v) => !v)}
            className="w-9! h-9! grid place-items-center rounded-lg border border-[var(--line)] bg-white text-[var(--muted)] hover:text-[var(--ink)] transition-colors"
            title="How tools work"
          >
            <Info size={16} />
          </button>
          <PrimaryButton onClick={() => setEditing("new")}>
            <Plus size={16} /> Add tool
          </PrimaryButton>
        </div>
      </div>
      <p className="text-[13px] text-[var(--slate)] mb-6!">
        Everything your agents can actually do mid-conversation — capture a
        lead, book a meeting, hand over to a person, or call your own webhook.
      </p>

      {showInfo && (
        <div className="flex items-start gap-3! bg-[var(--violet-050)] border border-[var(--violet-100)] rounded-2xl p-4! mb-6!">
          <Info size={18} className="text-[var(--violet-700)] shrink-0 mt-0.5!" />
          <div className="flex-1 text-[13px] text-[var(--slate)] leading-relaxed">
            <p className="font-semibold text-[var(--ink)] mb-0.5!">
              System tools are always on; custom tools are attached per agent
            </p>
            <code className="text-[12px]">end_call</code> and{" "}
            <code className="text-[12px]">skip_turn</code> are registered for
            every agent automatically. A custom tool is an HTTPS webhook the
            model can call — create it here, then switch it on for an agent from
            that agent&apos;s <span className="font-medium">Tools</span> tab. The
            URL must be public: requests to private or loopback addresses are
            refused, in a test run and in a live call alike.
          </div>
          <button
            onClick={() => setShowInfo(false)}
            className="w-7! h-7! grid place-items-center rounded-lg text-[var(--muted)] hover:bg-white transition-colors shrink-0"
          >
            <X size={15} />
          </button>
        </div>
      )}

      {/* ── Per-agent capabilities ─────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-3! mb-4!">
        <h2 className="text-[15px] font-semibold text-[var(--ink)] flex items-center gap-2!">
          <Sparkles size={15} className="text-[var(--violet-700)]" /> Agent
          capabilities
        </h2>
        {agents.length > 0 && (
          <div className="ml-auto flex items-center gap-2!">
            <span className="text-[12px] text-[var(--muted)]">Configuring</span>
            <div className="relative">
              <Bot
                size={14}
                className="absolute left-3! top-1/2 -translate-y-1/2 text-[var(--muted)] pointer-events-none"
              />
              <select
                value={agentId}
                onChange={(e) => selectAgent(e.target.value)}
                className="fld appearance-none pl-9! pr-9! py-2! text-[13px] w-[240px]!"
              >
                {agents.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={14}
                className="absolute right-3! top-1/2 -translate-y-1/2 text-[var(--muted)] pointer-events-none"
              />
            </div>
          </div>
        )}
      </div>

      {agentsLoading ? (
        <div className="grid place-items-center py-16! mb-8!">
          <Spinner />
        </div>
      ) : !agentId ? (
        <div className="bg-white border border-[var(--line)] rounded-2xl grid place-items-center text-center py-14! px-6! mb-10!">
          <span className="w-12! h-12! rounded-2xl grid place-items-center bg-[var(--violet-050)] text-[var(--violet-700)] border border-[var(--violet-100)] mb-3!">
            <Bot size={22} />
          </span>
          <p className="text-[15px] font-semibold text-[var(--ink)]">
            No agents yet
          </p>
          <p className="text-[13px] text-[var(--slate)] mt-1! max-w-[380px]!">
            Lead capture, appointments and human handoff are configured per
            agent. Create one and they show up here.
          </p>
          <Link
            href="/dashboard/agents?new=1"
            className="btn-dark px-4! py-2.5! text-[13.5px] mt-5!"
          >
            <Plus size={16} /> New agent
          </Link>
        </div>
      ) : (
        <div className="mb-10!">
          {/* Remount on agent change so every card refetches for that agent. */}
          <CapabilitiesPanel key={agentId} agentId={agentId} />
        </div>
      )}

      {/* ── Conversation tools ──────────────────────────────────────────── */}
      <h2 className="text-[15px] font-semibold text-[var(--ink)] flex items-center gap-2! mb-4!">
        <Blocks size={15} className="text-[var(--violet-700)]" /> Conversation
        tools
        <span className="text-[var(--muted)] font-normal">
          ({customCount} custom · 2 built in)
        </span>
      </h2>

      {loadError && (
        <div className="flex items-center gap-2! text-[13px] text-red-600 bg-red-50 border border-red-200 rounded-xl px-4! py-3! mb-6!">
          <AlertCircle size={15} className="shrink-0" /> {loadError}
          <button
            onClick={load}
            className="ml-auto font-semibold underline hover:no-underline"
          >
            Retry
          </button>
        </div>
      )}

      <div className="bg-white border border-[var(--line)] rounded-2xl shadow-[var(--shadow-sm)] overflow-hidden">
        <div className="p-3! border-b border-[var(--line)]">
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3.5! top-1/2 -translate-y-1/2 text-[var(--muted)]"
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search tools…"
              className="fld pl-10! pr-4! py-2.5!"
            />
          </div>
        </div>

        <div className="hidden md:grid grid-cols-[1.4fr_0.7fr_3fr_0.9fr_auto] gap-4! px-5! py-3! border-b border-[var(--line)] text-[11px] font-semibold text-[var(--muted)] uppercase tracking-wide">
          <span>Name</span>
          <span>Type</span>
          <span>Description</span>
          <span>Authentication</span>
          <span />
        </div>

        {loading ? (
          <div className="grid place-items-center py-16!">
            <Spinner />
          </div>
        ) : (
          filtered.map((t) => (
            <div
              key={t.id}
              className="grid grid-cols-1 md:grid-cols-[1.4fr_0.7fr_3fr_0.9fr_auto] gap-2! md:gap-4! px-5! py-4! border-b border-[var(--line)] last:border-0 hover:bg-[var(--sidebar-hover)]/50 transition-colors"
            >
              <span className="flex items-center gap-2.5! font-medium text-[var(--ink)] text-[14px] min-w-0">
                <span className="w-7! h-7! rounded-lg grid place-items-center bg-[var(--violet-050)] text-[var(--violet-700)] border border-[var(--violet-100)] shrink-0">
                  <Blocks size={14} />
                </span>
                <span className="truncate">{t.name}</span>
                {!t.is_enabled && (
                  <span className="text-[10.5px] font-semibold text-[var(--muted)] bg-[var(--line-soft)] border border-[var(--line)] px-1.5! py-0.5! rounded shrink-0">
                    OFF
                  </span>
                )}
              </span>
              <span className="flex items-center text-[13px] text-[var(--slate)]">
                <span className="inline-flex items-center text-[11.5px] font-medium text-[var(--slate)] bg-[var(--line-soft)] border border-[var(--line)] px-2! py-0.5! rounded-full">
                  {t.type}
                </span>
              </span>
              <span className="text-[13px] text-[var(--slate)] leading-snug line-clamp-2">
                {t.description}
                {t.type === "Custom" && t.url && (
                  <span className="block text-[11.5px] text-[var(--muted)] mt-0.5! truncate">
                    {t.method} {t.url}
                    {t.agent_count ? ` · on ${t.agent_count} agent(s)` : " · not attached yet"}
                  </span>
                )}
              </span>
              <span className="flex items-center text-[13px] text-[var(--slate)]">
                {t.authentication}
              </span>
              <span className="flex items-center justify-end gap-1!">
                {t.editable ? (
                  <>
                    <IconBtn title="Test" onClick={() => setTesting(t)}>
                      <Play size={14} />
                    </IconBtn>
                    <IconBtn title="Edit" onClick={() => setEditing(t)}>
                      <Pencil size={14} />
                    </IconBtn>
                    <IconBtn title="Delete" danger onClick={() => setDeleting(t)}>
                      <Trash2 size={14} />
                    </IconBtn>
                  </>
                ) : (
                  <span className="text-[11.5px] text-[var(--muted)] whitespace-nowrap">
                    Built in
                  </span>
                )}
              </span>
            </div>
          ))
        )}

        {!loading && filtered.length === 0 && (
          <p className="text-center text-[13px] text-[var(--muted)] py-10!">
            {query ? `No tools match “${query}”.` : "No tools yet."}
          </p>
        )}
      </div>

      {editing && (
        <ToolEditor
          tool={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={(verb) => {
            setEditing(null);
            showToast({ type: "success", title: `Tool ${verb}` });
            load();
          }}
        />
      )}

      {testing && <ToolTester tool={testing} onClose={() => setTesting(null)} />}

      {deleting && (
        <DeleteToolModal
          tool={deleting}
          onClose={() => setDeleting(null)}
          onDeleted={() => {
            setDeleting(null);
            showToast({ type: "success", title: "Tool deleted" });
            load();
          }}
        />
      )}
    </div>
  );
}

function IconBtn({
  children,
  title,
  danger,
  onClick,
}: {
  children: React.ReactNode;
  title: string;
  danger?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      title={title}
      onClick={onClick}
      className={`w-8! h-8! grid place-items-center rounded-lg text-[var(--muted)] border border-transparent hover:border-[var(--line)] hover:bg-white transition-colors ${
        danger ? "hover:text-red-600" : "hover:text-[var(--ink)]"
      }`}
    >
      {children}
    </button>
  );
}

// ── Create / edit ────────────────────────────────────────────────────────────

function ToolEditor({
  tool,
  onClose,
  onSaved,
}: {
  tool: ToolRow | null;
  onClose: () => void;
  onSaved: (verb: string) => void;
}) {
  const [draft, setDraft] = useState<ToolDraft>(() => {
    if (!tool) return emptyDraft();
    return {
      ...emptyDraft(),
      name: tool.name,
      description: tool.description,
      url: tool.url || "",
      method: tool.method || "POST",
      parametersText: tool.parameters
        ? JSON.stringify(tool.parameters, null, 2)
        : "",
      auth_type: tool.auth_type || "none",
      timeout_seconds: tool.timeout_seconds ?? 10,
      is_enabled: tool.is_enabled,
    };
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = <K extends keyof ToolDraft>(k: K, v: ToolDraft[K]) =>
    setDraft((p) => ({ ...p, [k]: v }));

  const parseJson = (text: string, field: string): Record<string, unknown> | null => {
    const trimmed = text.trim();
    if (!trimmed) return null;
    try {
      const parsed = JSON.parse(trimmed);
      if (typeof parsed !== "object" || Array.isArray(parsed) || parsed === null) {
        throw new Error("not an object");
      }
      return parsed as Record<string, unknown>;
    } catch {
      throw new Error(`${field} must be a JSON object.`);
    }
  };

  const authConfig = (): Record<string, string> | null => {
    switch (draft.auth_type) {
      case "bearer":
        return draft.auth.token ? { token: draft.auth.token } : null;
      case "api_key":
        return draft.auth.key
          ? { header: draft.auth.header || "X-API-Key", key: draft.auth.key }
          : null;
      case "basic":
        return draft.auth.username || draft.auth.password
          ? { username: draft.auth.username, password: draft.auth.password }
          : null;
      default:
        return null;
    }
  };

  const save = async () => {
    setError(null);
    let parameters: Record<string, unknown> | null;
    let headers: Record<string, unknown> | null;
    try {
      parameters = parseJson(draft.parametersText, "Parameters");
      headers = parseJson(draft.headersText, "Headers");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Invalid JSON.");
      return;
    }

    const credentials = authConfig();
    const payload: Partial<ToolInput> = {
      description: draft.description.trim(),
      url: draft.url.trim(),
      method: draft.method,
      parameters,
      headers: (headers as Record<string, string> | null) ?? null,
      auth_type: draft.auth_type,
      timeout_seconds: draft.timeout_seconds,
      is_enabled: draft.is_enabled,
    };
    // auth_config is write-only: only send it when the owner typed a new
    // credential, so an edit that leaves the field blank keeps the stored one.
    if (credentials) payload.auth_config = credentials;
    if (draft.auth_type === "none") payload.auth_config = null;

    setSaving(true);
    try {
      if (tool) {
        await updateTool(tool.id, payload);
        onSaved("updated");
      } else {
        await createTool({ ...(payload as ToolInput), name: draft.name.trim() });
        onSaved("created");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save the tool.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      wide
      title={tool ? `Edit ${tool.name}` : "Add a custom tool"}
      desc="The model decides when to call this from its description, so write it like an instruction."
      onClose={onClose}
      footer={
        <>
          <GhostButton onClick={onClose} disabled={saving}>
            Cancel
          </GhostButton>
          <PrimaryButton onClick={save} loading={saving}>
            {tool ? "Save changes" : "Create tool"}
          </PrimaryButton>
        </>
      }
    >
      {error && (
        <div className="flex items-start gap-2! text-[13px] text-red-600 bg-red-50 border border-red-200 rounded-xl px-4! py-3! mb-5!">
          <AlertCircle size={15} className="shrink-0 mt-0.5!" /> {error}
        </div>
      )}

      <div className="space-y-5!">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4!">
          <div>
            <Label>Name</Label>
            <input
              value={draft.name}
              disabled={!!tool}
              onChange={(e) =>
                set("name", e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "_"))
              }
              placeholder="check_order_status"
              className="fld px-3.5! py-2.5! disabled:bg-[var(--sidebar)] disabled:text-[var(--muted)]"
            />
            <p className="text-[11.5px] text-[var(--muted)] mt-1!">
              {tool
                ? "A tool's name is fixed — the model may already be prompted with it."
                : "snake_case, 3–49 characters."}
            </p>
          </div>
          <div>
            <Label>Request timeout</Label>
            <div className="flex items-center gap-2!">
              <input
                type="number"
                min={1}
                max={30}
                value={draft.timeout_seconds}
                onChange={(e) =>
                  set("timeout_seconds", Math.max(1, Math.min(30, +e.target.value || 10)))
                }
                className="fld px-3.5! py-2.5! w-24!"
              />
              <span className="text-[12.5px] text-[var(--muted)]">
                seconds (max 30)
              </span>
            </div>
          </div>
        </div>

        <div>
          <Label>Description</Label>
          <textarea
            value={draft.description}
            onChange={(e) => set("description", e.target.value)}
            rows={3}
            placeholder="Look up the status of a customer's order by order number. Call this whenever a caller asks where their order is."
            className="fld px-3.5! py-3! resize-y leading-relaxed"
          />
        </div>

        <div className="grid grid-cols-[110px_1fr] gap-3!">
          <div>
            <Label>Method</Label>
            <select
              value={draft.method}
              onChange={(e) => set("method", e.target.value)}
              className="fld px-3! py-2.5!"
            >
              {METHODS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label>Webhook URL</Label>
            <input
              value={draft.url}
              onChange={(e) => set("url", e.target.value)}
              placeholder="https://api.yourcompany.com/orders/status"
              className="fld px-3.5! py-2.5!"
            />
          </div>
        </div>

        <div>
          <Label>Authentication</Label>
          <select
            value={draft.auth_type}
            onChange={(e) => set("auth_type", e.target.value as ToolAuthType)}
            className="fld px-3.5! py-2.5!"
          >
            {(Object.keys(AUTH_LABELS) as ToolAuthType[]).map((k) => (
              <option key={k} value={k}>
                {AUTH_LABELS[k]}
              </option>
            ))}
          </select>

          {draft.auth_type !== "none" && (
            <div className="mt-3! grid grid-cols-1 sm:grid-cols-2 gap-3!">
              {draft.auth_type === "api_key" && (
                <>
                  <input
                    value={draft.auth.header}
                    onChange={(e) =>
                      set("auth", { ...draft.auth, header: e.target.value })
                    }
                    placeholder="Header name (X-API-Key)"
                    className="fld px-3.5! py-2.5!"
                  />
                  <input
                    type="password"
                    value={draft.auth.key}
                    onChange={(e) =>
                      set("auth", { ...draft.auth, key: e.target.value })
                    }
                    placeholder="API key"
                    className="fld px-3.5! py-2.5!"
                  />
                </>
              )}
              {draft.auth_type === "bearer" && (
                <input
                  type="password"
                  value={draft.auth.token}
                  onChange={(e) =>
                    set("auth", { ...draft.auth, token: e.target.value })
                  }
                  placeholder="Token"
                  className="fld px-3.5! py-2.5! sm:col-span-2"
                />
              )}
              {draft.auth_type === "basic" && (
                <>
                  <input
                    value={draft.auth.username}
                    onChange={(e) =>
                      set("auth", { ...draft.auth, username: e.target.value })
                    }
                    placeholder="Username"
                    className="fld px-3.5! py-2.5!"
                  />
                  <input
                    type="password"
                    value={draft.auth.password}
                    onChange={(e) =>
                      set("auth", { ...draft.auth, password: e.target.value })
                    }
                    placeholder="Password"
                    className="fld px-3.5! py-2.5!"
                  />
                </>
              )}
              <p className="sm:col-span-2 text-[11.5px] text-[var(--muted)]">
                Credentials are stored encrypted and never returned by the API.
                {tool?.has_credentials &&
                  " Leave blank to keep the ones already saved."}
              </p>
            </div>
          )}
        </div>

        <div>
          <Label optional>Parameters (JSON Schema)</Label>
          <textarea
            value={draft.parametersText}
            onChange={(e) => set("parametersText", e.target.value)}
            rows={8}
            spellCheck={false}
            placeholder='{"type":"object","properties":{}}'
            className="fld px-3.5! py-3! resize-y font-mono text-[12px] leading-relaxed"
          />
          <p className="text-[11.5px] text-[var(--muted)] mt-1!">
            What the model is allowed to send. Leave empty to accept no arguments.
          </p>
        </div>

        <div>
          <Label optional>Extra headers (JSON object)</Label>
          <textarea
            value={draft.headersText}
            onChange={(e) => set("headersText", e.target.value)}
            rows={3}
            spellCheck={false}
            placeholder='{"X-Tenant": "acme"}'
            className="fld px-3.5! py-3! resize-y font-mono text-[12px]"
          />
        </div>

        <Row
          title="Enabled"
          desc="Disabled tools stay configured but are never offered to the model."
        >
          <Toggle on={draft.is_enabled} onChange={(v) => set("is_enabled", v)} />
        </Row>
      </div>
    </Modal>
  );
}

// ── Test ─────────────────────────────────────────────────────────────────────

function ToolTester({ tool, onClose }: { tool: ToolRow; onClose: () => void }) {
  const [argsText, setArgsText] = useState("{}");
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<ToolTestResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const run = async () => {
    setError(null);
    setResult(null);
    let args: Record<string, unknown> = {};
    try {
      args = argsText.trim() ? JSON.parse(argsText) : {};
    } catch {
      setError("Arguments must be valid JSON.");
      return;
    }
    setRunning(true);
    try {
      setResult(await testTool(tool.id, args));
    } catch (e) {
      setError(e instanceof Error ? e.message : "The test call failed.");
    } finally {
      setRunning(false);
    }
  };

  return (
    <Modal
      wide
      title={`Test ${tool.name}`}
      desc={`${tool.method} ${tool.url} — runs through the same guards as a live call and saves nothing.`}
      onClose={onClose}
      footer={
        <>
          <GhostButton onClick={onClose}>Close</GhostButton>
          <PrimaryButton onClick={run} loading={running}>
            <Play size={14} /> Run test
          </PrimaryButton>
        </>
      }
    >
      <Label>Sample arguments</Label>
      <textarea
        value={argsText}
        onChange={(e) => setArgsText(e.target.value)}
        rows={5}
        spellCheck={false}
        className="fld px-3.5! py-3! resize-y font-mono text-[12px]"
      />

      {error && (
        <div className="flex items-start gap-2! text-[13px] text-red-600 bg-red-50 border border-red-200 rounded-xl px-4! py-3! mt-4!">
          <AlertCircle size={15} className="shrink-0 mt-0.5!" /> {error}
        </div>
      )}

      {result && (
        <div className="mt-5!">
          <div
            className={`flex items-center gap-2! text-[13px] font-semibold rounded-xl px-4! py-3! ${
              result.ok
                ? "text-emerald-700 bg-emerald-50 border border-emerald-200"
                : "text-red-600 bg-red-50 border border-red-200"
            }`}
          >
            {result.ok ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
            HTTP {result.status || 0} · {result.latency_ms ?? 0} ms
          </div>
          <pre className="mt-3! bg-[#141026] text-emerald-300 text-[12px] leading-relaxed rounded-xl p-4! overflow-x-auto whitespace-pre-wrap break-words max-h-[300px]! overflow-y-auto">
            {result.body || "(empty response)"}
          </pre>
        </div>
      )}
    </Modal>
  );
}

// ── Delete ───────────────────────────────────────────────────────────────────

function DeleteToolModal({
  tool,
  onClose,
  onDeleted,
}: {
  tool: ToolRow;
  onClose: () => void;
  onDeleted: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const go = async () => {
    setBusy(true);
    setError(null);
    try {
      await deleteTool(tool.id);
      onDeleted();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Delete failed.");
      setBusy(false);
    }
  };

  return (
    <Modal
      title={`Delete ${tool.name}?`}
      desc={
        tool.agent_count
          ? `This tool is attached to ${tool.agent_count} agent(s) and will be removed from them.`
          : "This removes the tool and its stored credentials."
      }
      onClose={onClose}
      footer={
        <>
          <GhostButton onClick={onClose} disabled={busy}>
            Cancel
          </GhostButton>
          <button
            onClick={go}
            disabled={busy}
            className="inline-flex items-center gap-2! rounded-lg bg-red-600 px-4! py-2.5! text-[13px] font-semibold text-white hover:bg-red-700 transition disabled:bg-red-400"
          >
            {busy && <Loader2 size={14} className="animate-spin" />}
            {busy ? "Deleting…" : "Delete tool"}
          </button>
        </>
      }
    >
      {error ? (
        <p className="text-[13px] text-red-600">{error}</p>
      ) : (
        <p className="text-[13px] text-[var(--slate)]">
          Agents mid-conversation keep the tool until their session ends.
        </p>
      )}
    </Modal>
  );
}

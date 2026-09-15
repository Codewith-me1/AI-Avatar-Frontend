"use client";

/**
 * Editable knowledge base for one agent.
 *
 * Used by the Knowledge page and by the agent settings page, so an owner can
 * fix a wrong answer wherever they happen to be. Saving a document's text
 * re-chunks and re-embeds it server-side (the old vectors are deleted first),
 * which is why editing here actually changes what the agent says.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  FileText,
  Globe,
  Loader2,
  Pencil,
  RefreshCw,
  Search,
  Trash2,
  Type,
  Upload,
} from "lucide-react";
import * as kb from "@/lib/api/knowledge";
import { updateAgent } from "@/lib/api/agents";
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
  Document,
  DocumentContent,
  KnowledgeBaseSummary,
  KnowledgeMode,
  KnowledgeSearchResult,
  KnowledgeSummary,
} from "@/types";

const ALLOWED_EXT = [".pdf", ".txt", ".md", ".docx"];
const MAX_FILE_MB = 20;
const BUSY_STATUS = new Set(["pending", "processing"]);

export function KnowledgeManager({
  agentId,
  knowledgeMode,
  onModeChange,
}: {
  agentId: string;
  /** Current answering mode, when the parent already has the agent loaded. */
  knowledgeMode?: KnowledgeMode;
  onModeChange?: (mode: KnowledgeMode) => void;
}) {
  const { showToast } = useToast();
  const [summary, setSummary] = useState<KnowledgeSummary | null>(null);
  const [activeKb, setActiveKb] = useState<string | null>(null);
  const [docs, setDocs] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [docsLoading, setDocsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [adding, setAdding] = useState<"upload" | "text" | "url" | null>(null);
  const [editingDoc, setEditingDoc] = useState<Document | null>(null);
  const [renaming, setRenaming] = useState<Document | null>(null);
  const [probe, setProbe] = useState(false);

  const loadSummary = useCallback(async () => {
    setError(null);
    try {
      const data = await kb.getSummary(agentId);
      setSummary(data);
      setActiveKb((current) => {
        if (current && data.kbs.some((k) => k.id === current)) return current;
        return data.kbs[0]?.id ?? null;
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load knowledge.");
    } finally {
      setLoading(false);
    }
  }, [agentId]);

  const loadDocs = useCallback(async () => {
    if (!activeKb) {
      setDocs([]);
      return;
    }
    setDocsLoading(true);
    try {
      setDocs(await kb.listDocuments(agentId, activeKb));
    } catch {
      setDocs([]);
    } finally {
      setDocsLoading(false);
    }
  }, [agentId, activeKb]);

  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  useEffect(() => {
    loadDocs();
  }, [loadDocs]);

  // Indexing and crawling are background jobs — poll while anything is in
  // flight so "Processing…" resolves without the owner reloading the page.
  const busy =
    docs.some((d) => BUSY_STATUS.has(d.status)) ||
    (summary?.kbs || []).some((k) => k.crawl_status && BUSY_STATUS.has(k.crawl_status));

  useEffect(() => {
    if (!busy) return;
    const timer = setInterval(() => {
      loadDocs();
      loadSummary();
    }, 4000);
    return () => clearInterval(timer);
  }, [busy, loadDocs, loadSummary]);

  const refresh = () => {
    loadSummary();
    loadDocs();
  };

  const setMode = async (mode: KnowledgeMode) => {
    onModeChange?.(mode);
    try {
      await updateAgent(agentId, { knowledge_mode: mode });
      setSummary((s) => (s ? { ...s, restrict_to_knowledge: mode === "strict" } : s));
      showToast({
        type: "success",
        title: mode === "strict" ? "Strict mode on" : "Hybrid mode on",
        message:
          mode === "strict"
            ? "The agent will answer only from its knowledge base."
            : "The agent may interpret beyond the knowledge base.",
      });
    } catch (e) {
      showToast({
        type: "error",
        title: "Could not change the mode",
        message: e instanceof Error ? e.message : "Try again.",
      });
    }
  };

  const strict = knowledgeMode
    ? knowledgeMode === "strict"
    : !!summary?.restrict_to_knowledge;

  if (loading) {
    return (
      <div className="grid place-items-center py-16!">
        <Spinner />
      </div>
    );
  }

  const activeMeta = summary?.kbs.find((k) => k.id === activeKb) || null;

  return (
    <div className="space-y-5!">
      {error && (
        <div className="flex items-center gap-2! text-[13px] text-red-600 bg-red-50 border border-red-200 rounded-xl px-4! py-3!">
          <AlertCircle size={15} className="shrink-0" /> {error}
        </div>
      )}

      {/* Totals + mode */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3!">
        <Stat label="Documents" value={summary?.total_documents ?? 0} />
        <Stat label="Indexed chunks" value={summary?.total_chunks ?? 0} />
        <Stat label="Sources" value={summary?.kbs.length ?? 0} />
      </div>

      <Row
        title="Answer only from this knowledge"
        desc={
          strict
            ? "Strict — the agent declines anything the knowledge base doesn't cover."
            : "Hybrid — the agent may interpret facts conversationally."
        }
      >
        <Toggle on={strict} onChange={(v) => setMode(v ? "strict" : "hybrid")} />
      </Row>

      {/* Add knowledge */}
      <div className="flex flex-wrap items-center gap-2!">
        <AddButton icon={<Upload size={14} />} onClick={() => setAdding("upload")}>
          Upload files
        </AddButton>
        <AddButton icon={<Type size={14} />} onClick={() => setAdding("text")}>
          Paste text
        </AddButton>
        <AddButton icon={<Globe size={14} />} onClick={() => setAdding("url")}>
          Crawl a website
        </AddButton>
        <button
          onClick={() => setProbe(true)}
          className="ml-auto inline-flex items-center gap-2! text-[13px] font-semibold text-[var(--violet-700)] hover:text-[var(--violet-600)] transition-colors"
        >
          <Search size={14} /> Test retrieval
        </button>
      </div>

      {/* Sources */}
      {(summary?.kbs.length ?? 0) === 0 ? (
        <div className="bg-white border border-[var(--line)] rounded-2xl grid place-items-center text-center py-14! px-6!">
          <span className="w-12! h-12! rounded-2xl grid place-items-center bg-[var(--violet-050)] text-[var(--violet-700)] border border-[var(--violet-100)] mb-3!">
            <FileText size={22} />
          </span>
          <p className="text-[15px] font-semibold text-[var(--ink)]">
            No knowledge yet
          </p>
          <p className="text-[13px] text-[var(--slate)] mt-1! max-w-[380px]!">
            Upload a document, paste your FAQs, or point the agent at your
            website. Everything you add here is editable afterwards.
          </p>
        </div>
      ) : (
        <>
          <div className="flex flex-wrap gap-2!">
            {summary!.kbs.map((k) => (
              <button
                key={k.id}
                onClick={() => setActiveKb(k.id)}
                className={`flex items-center gap-2! px-3.5! py-2! rounded-xl text-[13px] font-semibold border transition-colors ${
                  activeKb === k.id
                    ? "bg-[var(--ink)] text-white border-[var(--ink)]"
                    : "bg-white text-[var(--slate)] border-[var(--line)] hover:bg-[var(--sidebar-hover)]"
                }`}
              >
                {k.kb_type === "website" ? <Globe size={13} /> : <FileText size={13} />}
                <span className="truncate max-w-[180px]!">{k.name}</span>
                <span
                  className={`text-[11px] font-medium ${
                    activeKb === k.id ? "text-white/70" : "text-[var(--muted)]"
                  }`}
                >
                  {k.document_count}
                </span>
              </button>
            ))}
          </div>

          {activeMeta && (
            <KbPanel
              agentId={agentId}
              meta={activeMeta}
              docs={docs}
              loading={docsLoading}
              onRefresh={refresh}
              onEdit={setEditingDoc}
              onRename={setRenaming}
            />
          )}
        </>
      )}

      {adding && (
        <AddKnowledgeModal
          agentId={agentId}
          mode={adding}
          kbId={activeMeta?.kb_type === "upload" ? activeMeta.id : null}
          onClose={() => setAdding(null)}
          onDone={(message) => {
            setAdding(null);
            showToast({ type: "success", title: "Knowledge queued", message });
            refresh();
          }}
        />
      )}

      {editingDoc && activeKb && (
        <DocumentEditor
          agentId={agentId}
          kbId={activeKb}
          doc={editingDoc}
          onClose={() => setEditingDoc(null)}
          onSaved={() => {
            setEditingDoc(null);
            showToast({
              type: "success",
              title: "Document saved",
              message: "It's being re-indexed — answers update in a moment.",
            });
            refresh();
          }}
        />
      )}

      {renaming && activeKb && (
        <RenameModal
          agentId={agentId}
          kbId={activeKb}
          doc={renaming}
          onClose={() => setRenaming(null)}
          onSaved={() => {
            setRenaming(null);
            refresh();
          }}
        />
      )}

      {probe && (
        <RetrievalProbe agentId={agentId} onClose={() => setProbe(false)} />
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-white border border-[var(--line)] rounded-xl px-4! py-3!">
      <p className="text-[20px] font-semibold text-[var(--ink)] leading-tight">
        {value}
      </p>
      <p className="text-[12px] text-[var(--muted)] mt-0.5!">{label}</p>
    </div>
  );
}

function AddButton({
  children,
  icon,
  onClick,
}: {
  children: React.ReactNode;
  icon: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2! px-3.5! py-2! rounded-lg text-[13px] font-semibold bg-white text-[var(--slate)] border border-[var(--line)] hover:bg-[var(--sidebar-hover)] transition-colors"
    >
      {icon} {children}
    </button>
  );
}

// ── One knowledge base ───────────────────────────────────────────────────────

function KbPanel({
  agentId,
  meta,
  docs,
  loading,
  onRefresh,
  onEdit,
  onRename,
}: {
  agentId: string;
  meta: KnowledgeBaseSummary;
  docs: Document[];
  loading: boolean;
  onRefresh: () => void;
  onEdit: (d: Document) => void;
  onRename: (d: Document) => void;
}) {
  const { showToast } = useToast();
  const [working, setWorking] = useState<string | null>(null);

  const act = async (id: string, fn: () => Promise<unknown>, done: string) => {
    setWorking(id);
    try {
      await fn();
      showToast({ type: "success", title: done });
      onRefresh();
    } catch (e) {
      showToast({
        type: "error",
        title: "That didn't work",
        message: e instanceof Error ? e.message : "Try again.",
      });
    } finally {
      setWorking(null);
    }
  };

  return (
    <div className="bg-white border border-[var(--line)] rounded-2xl shadow-[var(--shadow-sm)] overflow-hidden">
      <div className="flex flex-wrap items-center gap-3! px-5! py-3.5! border-b border-[var(--line)]">
        <div className="min-w-0">
          <p className="text-[14px] font-semibold text-[var(--ink)] truncate">
            {meta.name}
          </p>
          <p className="text-[11.5px] text-[var(--muted)] truncate">
            {meta.kb_type === "website" ? meta.source_url : "Uploaded documents"}
            {meta.chunk_count ? ` · ${meta.chunk_count} chunks` : ""}
          </p>
        </div>
        <div className="ml-auto flex items-center gap-2!">
          {meta.crawl_status && <StatusPill status={meta.crawl_status} />}
          {meta.kb_type === "website" && (
            <button
              onClick={() =>
                act(`crawl-${meta.id}`, () => kb.recrawlWebsite(agentId, meta.id), "Re-crawl started")
              }
              disabled={working === `crawl-${meta.id}`}
              className="inline-flex items-center gap-1.5! text-[12.5px] font-semibold text-[var(--violet-700)] hover:text-[var(--violet-600)] disabled:opacity-50"
            >
              {working === `crawl-${meta.id}` ? (
                <Loader2 size={13} className="animate-spin" />
              ) : (
                <RefreshCw size={13} />
              )}
              Re-crawl
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="grid place-items-center py-12!">
          <Spinner />
        </div>
      ) : docs.length === 0 ? (
        <p className="text-center text-[13px] text-[var(--muted)] py-10!">
          This source has no documents yet.
        </p>
      ) : (
        docs.map((d) => (
          <div
            key={d.id}
            className="flex flex-wrap items-center gap-3! px-5! py-3.5! border-b border-[var(--line)] last:border-0 hover:bg-[var(--sidebar-hover)]/50 transition-colors"
          >
            <FileText size={15} className="text-[var(--muted)] shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-[13.5px] font-medium text-[var(--ink)] truncate">
                {d.filename}
              </p>
              <p className="text-[11.5px] text-[var(--muted)] truncate">
                {d.source_url
                  ? d.source_url
                  : d.file_size
                    ? `${(d.file_size / 1024).toFixed(0)} KB`
                    : "Text document"}
              </p>
            </div>
            <StatusPill status={d.status} />
            <div className="flex items-center gap-1!">
              <RowBtn title="Edit text" onClick={() => onEdit(d)}>
                <Pencil size={14} />
              </RowBtn>
              <RowBtn title="Rename" onClick={() => onRename(d)}>
                <Type size={14} />
              </RowBtn>
              <RowBtn
                title="Re-index"
                busy={working === d.id}
                onClick={() =>
                  act(d.id, () => kb.reindexDocument(agentId, meta.id, d.id), "Re-indexing")
                }
              >
                <RefreshCw size={14} />
              </RowBtn>
              <RowBtn
                title="Delete"
                danger
                busy={working === `del-${d.id}`}
                onClick={() =>
                  act(
                    `del-${d.id}`,
                    () => kb.deleteDocument(agentId, meta.id, d.id),
                    "Document deleted",
                  )
                }
              >
                <Trash2 size={14} />
              </RowBtn>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

function RowBtn({
  children,
  title,
  danger,
  busy,
  onClick,
}: {
  children: React.ReactNode;
  title: string;
  danger?: boolean;
  busy?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      title={title}
      onClick={onClick}
      disabled={busy}
      className={`w-8! h-8! grid place-items-center rounded-lg text-[var(--muted)] border border-transparent hover:border-[var(--line)] hover:bg-white transition-colors disabled:opacity-50 ${
        danger ? "hover:text-red-600" : "hover:text-[var(--ink)]"
      }`}
    >
      {busy ? <Loader2 size={13} className="animate-spin" /> : children}
    </button>
  );
}

function StatusPill({ status }: { status: string }) {
  const map: Record<string, { cls: string; icon: React.ReactNode; label: string }> = {
    ready: {
      cls: "text-emerald-700 bg-emerald-50 border-emerald-200",
      icon: <CheckCircle2 size={11} />,
      label: "Ready",
    },
    pending: {
      cls: "text-amber-700 bg-amber-50 border-amber-200",
      icon: <Clock size={11} />,
      label: "Queued",
    },
    processing: {
      cls: "text-amber-700 bg-amber-50 border-amber-200",
      icon: <Loader2 size={11} className="animate-spin" />,
      label: "Indexing",
    },
    error: {
      cls: "text-red-600 bg-red-50 border-red-200",
      icon: <AlertCircle size={11} />,
      label: "Failed",
    },
    failed: {
      cls: "text-red-600 bg-red-50 border-red-200",
      icon: <AlertCircle size={11} />,
      label: "Failed",
    },
  };
  const s = map[status] || {
    cls: "text-[var(--slate)] bg-[var(--line-soft)] border-[var(--line)]",
    icon: null,
    label: status,
  };
  return (
    <span
      className={`inline-flex items-center gap-1! text-[11px] font-semibold px-2! py-0.5! rounded-full border ${s.cls}`}
    >
      {s.icon} {s.label}
    </span>
  );
}

// ── Add knowledge ────────────────────────────────────────────────────────────

function AddKnowledgeModal({
  agentId,
  mode,
  kbId,
  onClose,
  onDone,
}: {
  agentId: string;
  mode: "upload" | "text" | "url";
  kbId: string | null;
  onClose: () => void;
  onDone: (message: string) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [text, setText] = useState("");
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [crawlSite, setCrawlSite] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pick = (list: FileList | null) => {
    if (!list) return;
    const next: File[] = [];
    for (const f of Array.from(list)) {
      if (!ALLOWED_EXT.some((e) => f.name.toLowerCase().endsWith(e))) {
        setError(`${f.name}: allowed types are PDF, TXT, MD, DOCX.`);
        continue;
      }
      if (f.size > MAX_FILE_MB * 1024 * 1024) {
        setError(`${f.name} is over ${MAX_FILE_MB} MB.`);
        continue;
      }
      next.push(f);
    }
    setFiles((prev) => [...prev, ...next]);
  };

  const submit = async () => {
    setBusy(true);
    setError(null);
    try {
      if (mode === "text") {
        if (!text.trim()) throw new Error("Paste some text first.");
        // bootstrap guarantees a default upload KB exists, then the text lands
        // as its own document so it can be edited later on its own.
        const target = kbId ?? (await kb.bootstrap(agentId, {})).kb_id;
        await kb.createTextDocument(
          agentId,
          target,
          (title.trim() || "Pasted notes").replace(/\.txt$/i, "") + ".txt",
          text,
        );
        onDone("Your text is being indexed.");
        return;
      }

      if (mode === "url") {
        if (!/^https?:\/\/.+\..+/.test(url.trim()))
          throw new Error("Enter a full URL, including https://");
        await kb.attachWebsite(agentId, url.trim(), {
          max_pages: crawlSite ? 50 : 1,
          max_depth: crawlSite ? 2 : 0,
        });
        onDone(
          crawlSite
            ? "Crawling the site — this can take a few minutes."
            : "Reading that page now.",
        );
        return;
      }

      if (!files.length) throw new Error("Choose at least one file.");
      const target = kbId ?? (await kb.bootstrap(agentId, {})).kb_id;
      const failures: string[] = [];
      for (const file of files) {
        try {
          await kb.uploadDocument(agentId, target, file);
        } catch (e) {
          failures.push(`${file.name}: ${e instanceof Error ? e.message : "failed"}`);
        }
      }
      if (failures.length === files.length) throw new Error(failures.join(" · "));
      onDone(
        failures.length
          ? `Uploaded ${files.length - failures.length} of ${files.length}. ${failures[0]}`
          : `Indexing ${files.length} file${files.length === 1 ? "" : "s"}.`,
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not add that.");
      setBusy(false);
    }
  };

  const titles = {
    upload: "Upload documents",
    text: "Paste text",
    url: "Crawl a website",
  };

  return (
    <Modal
      wide={mode === "text"}
      title={titles[mode]}
      desc="Everything you add is chunked, embedded, and editable afterwards."
      onClose={onClose}
      footer={
        <>
          <GhostButton onClick={onClose} disabled={busy}>
            Cancel
          </GhostButton>
          <PrimaryButton onClick={submit} loading={busy}>
            Add to knowledge
          </PrimaryButton>
        </>
      }
    >
      {mode === "upload" && (
        <>
          <div
            onClick={() => fileRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              pick(e.dataTransfer.files);
            }}
            className="border-2 border-dashed border-[var(--line)] rounded-2xl py-10! grid place-items-center text-center cursor-pointer hover:border-[var(--violet)] hover:bg-[var(--violet-050)] transition-all"
          >
            <Upload size={22} className="text-[var(--muted)] mb-2!" />
            <p className="text-[13px] font-semibold text-[var(--ink)]">
              Drag &amp; drop or click to browse
            </p>
            <p className="text-[11.5px] text-[var(--muted)] mt-0.5!">
              PDF, TXT, MD, DOCX · max {MAX_FILE_MB} MB each
            </p>
            <input
              ref={fileRef}
              type="file"
              multiple
              hidden
              accept=".pdf,.txt,.md,.docx"
              onChange={(e) => pick(e.target.files)}
            />
          </div>
          {files.length > 0 && (
            <div className="space-y-2! mt-4!">
              {files.map((f, i) => (
                <div
                  key={`${f.name}-${i}`}
                  className="flex items-center gap-3! px-3.5! py-2.5! rounded-xl border border-[var(--line)] bg-white"
                >
                  <FileText size={15} className="text-[var(--muted)] shrink-0" />
                  <span className="flex-1 min-w-0 text-[13px] text-[var(--ink)] truncate">
                    {f.name}
                  </span>
                  <span className="text-[11px] text-[var(--muted)]">
                    {(f.size / 1024).toFixed(0)} KB
                  </span>
                  <button
                    onClick={() => setFiles((p) => p.filter((_, idx) => idx !== i))}
                    className="text-[var(--muted)] hover:text-red-600"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {mode === "text" && (
        <>
          <Label optional>Title</Label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Pricing FAQ"
            className="fld px-3.5! py-2.5! mb-4!"
          />
          <Label>Text</Label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={12}
            placeholder="Paste key facts, FAQs, or guidelines your agent should know…"
            className="fld px-3.5! py-3! resize-y leading-relaxed"
          />
        </>
      )}

      {mode === "url" && (
        <>
          <Label>Website URL</Label>
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            type="url"
            placeholder="https://yourcompany.com/pricing"
            className="fld px-3.5! py-2.5!"
          />
          <label className="flex items-start gap-2.5! mt-4! cursor-pointer">
            <input
              type="checkbox"
              checked={crawlSite}
              onChange={(e) => setCrawlSite(e.target.checked)}
              className="mt-0.5! accent-[var(--violet)]"
            />
            <span className="text-[13px] text-[var(--slate)]">
              Follow links on the same site
              <span className="block text-[11.5px] text-[var(--muted)]">
                Up to 50 pages, 2 levels deep. Leave off to index just this page.
              </span>
            </span>
          </label>
        </>
      )}

      {error && (
        <p className="flex items-start gap-2! text-[13px] text-red-600 bg-red-50 border border-red-200 rounded-xl px-3.5! py-3! mt-4!">
          <AlertCircle size={15} className="shrink-0 mt-0.5!" /> {error}
        </p>
      )}
    </Modal>
  );
}

// ── Edit document text ───────────────────────────────────────────────────────

function DocumentEditor({
  agentId,
  kbId,
  doc,
  onClose,
  onSaved,
}: {
  agentId: string;
  kbId: string;
  doc: Document;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [content, setContent] = useState<DocumentContent | null>(null);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    kb.getDocumentContent(agentId, kbId, doc.id)
      .then((data) => {
        if (!alive) return;
        setContent(data);
        setText(data.content);
      })
      .catch((e) =>
        setError(e instanceof Error ? e.message : "Could not load the text."),
      );
    return () => {
      alive = false;
    };
  }, [agentId, kbId, doc.id]);

  const save = async () => {
    setBusy(true);
    setError(null);
    try {
      await kb.saveDocumentContent(agentId, kbId, doc.id, text);
      onSaved();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save.");
      setBusy(false);
    }
  };

  return (
    <Modal
      wide
      title={doc.filename}
      desc="Saving re-chunks and re-embeds this document, so the old text stops being retrievable."
      onClose={onClose}
      footer={
        <>
          <GhostButton onClick={onClose} disabled={busy}>
            Cancel
          </GhostButton>
          <PrimaryButton
            onClick={save}
            loading={busy}
            disabled={!content || text === content.content}
          >
            Save &amp; re-index
          </PrimaryButton>
        </>
      }
    >
      {!content && !error ? (
        <div className="grid place-items-center py-16!">
          <Spinner />
        </div>
      ) : (
        <>
          {content?.reconstructed && (
            <p className="flex items-start gap-2! text-[12.5px] text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-3.5! py-3! mb-4!">
              <AlertCircle size={14} className="shrink-0 mt-0.5!" />
              This text was rebuilt from the indexed chunks because the original
              was added before full text was stored — it may differ slightly
              from the source file. Saving replaces it with exactly what you see.
            </p>
          )}
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={18}
            spellCheck={false}
            className="fld px-3.5! py-3! resize-y leading-relaxed font-mono text-[12.5px]"
          />
          <p className="text-right text-[11px] text-[var(--muted)] mt-1!">
            {text.length.toLocaleString()} characters
          </p>
          {error && (
            <p className="flex items-start gap-2! text-[13px] text-red-600 bg-red-50 border border-red-200 rounded-xl px-3.5! py-3! mt-3!">
              <AlertCircle size={15} className="shrink-0 mt-0.5!" /> {error}
            </p>
          )}
        </>
      )}
    </Modal>
  );
}

function RenameModal({
  agentId,
  kbId,
  doc,
  onClose,
  onSaved,
}: {
  agentId: string;
  kbId: string;
  doc: Document;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState(doc.filename);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = async () => {
    setBusy(true);
    setError(null);
    try {
      await kb.renameDocument(agentId, kbId, doc.id, name.trim());
      onSaved();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not rename.");
      setBusy(false);
    }
  };

  return (
    <Modal
      title="Rename document"
      desc="The filename is metadata — renaming does not re-index anything."
      onClose={onClose}
      footer={
        <>
          <GhostButton onClick={onClose} disabled={busy}>
            Cancel
          </GhostButton>
          <PrimaryButton onClick={save} loading={busy} disabled={!name.trim()}>
            Rename
          </PrimaryButton>
        </>
      }
    >
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="fld px-3.5! py-2.5!"
      />
      {error && <p className="text-[13px] text-red-600 mt-3!">{error}</p>}
    </Modal>
  );
}

// ── Retrieval probe ──────────────────────────────────────────────────────────

function RetrievalProbe({
  agentId,
  onClose,
}: {
  agentId: string;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<KnowledgeSearchResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const run = async () => {
    if (!query.trim()) return;
    setBusy(true);
    setError(null);
    try {
      setResult(await kb.search(agentId, query.trim(), 5));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Search failed.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      wide
      title="Test retrieval"
      desc="Exactly the excerpts the agent would see for this question. If it isn't here, the agent doesn't have it."
      onClose={onClose}
      footer={
        <>
          <GhostButton onClick={onClose}>Close</GhostButton>
          <PrimaryButton onClick={run} loading={busy} disabled={!query.trim()}>
            <Search size={14} /> Search
          </PrimaryButton>
        </>
      }
    >
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && run()}
        placeholder="What are your opening hours?"
        className="fld px-3.5! py-2.5!"
      />

      {error && <p className="text-[13px] text-red-600 mt-3!">{error}</p>}

      {result && (
        <div className="mt-5! space-y-3!">
          <p className="text-[12.5px] text-[var(--muted)]">
            {result.count} match{result.count === 1 ? "" : "es"}
          </p>
          {result.results.map((r, i) => (
            <div
              key={i}
              className="bg-[var(--sidebar)] border border-[var(--line)] rounded-xl px-4! py-3!"
            >
              <div className="flex items-center gap-2! mb-1.5!">
                <span className="text-[11.5px] font-semibold text-[var(--ink)] truncate">
                  {r.source || "Untitled source"}
                </span>
                {r.score !== null && (
                  <span className="ml-auto text-[11px] text-[var(--muted)]">
                    score {Number(r.score).toFixed(3)}
                  </span>
                )}
              </div>
              <p className="text-[12.5px] text-[var(--slate)] leading-relaxed whitespace-pre-wrap line-clamp-6">
                {r.content}
              </p>
            </div>
          ))}
          {result.count === 0 && (
            <p className="text-[13px] text-[var(--slate)]">
              Nothing matched. In strict mode the agent would decline this
              question — add a document that covers it.
            </p>
          )}
        </div>
      )}
    </Modal>
  );
}

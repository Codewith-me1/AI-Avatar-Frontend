"use client";

/**
 * Media the agent can show in chat — flyers, business cards, price lists.
 *
 * Two flavours:
 *  - <MediaManager agentId> talks to the API directly (agent settings page).
 *  - <MediaStager> holds items in memory for the create wizard, where the agent
 *    does not exist yet; the wizard flushes them with `flushStagedMedia` right
 *    after the agent is created.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  FileText,
  Film,
  Image as ImageIcon,
  Link2,
  Loader2,
  Pencil,
  Plus,
  Star,
  Trash2,
  Upload,
} from "lucide-react";
import {
  addMediaLink,
  deleteMedia,
  listMedia,
  mediaSrc,
  updateMedia,
  uploadMedia,
} from "@/lib/api/agents";
import { useToast } from "@/components/widget/Toast";
import {
  ChipInput,
  GhostButton,
  Label,
  Modal,
  PrimaryButton,
  Row,
  Spinner,
  Toggle,
} from "@/components/console/ui";
import type { MediaItem, MediaKind } from "@/types";

const ACCEPT = ".png,.jpg,.jpeg,.webp,.gif,.svg,.pdf,.mp4,.webm";
const MAX_MB = 25;

export interface StagedMedia {
  key: string;
  file?: File;
  external_url?: string;
  title: string;
  description: string;
  trigger_keywords: string[];
  show_by_default: boolean;
}

// ── Live manager ─────────────────────────────────────────────────────────────

export function MediaManager({ agentId }: { agentId: string }) {
  const { showToast } = useToast();
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<MediaItem | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setItems(await listMedia(agentId));
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [agentId]);

  useEffect(() => {
    load();
  }, [load]);

  const remove = async (item: MediaItem) => {
    setBusyId(item.id);
    try {
      await deleteMedia(agentId, item.id);
      setItems((prev) => prev.filter((i) => i.id !== item.id));
      showToast({ type: "success", title: "Media removed" });
    } catch (e) {
      showToast({
        type: "error",
        title: "Could not remove it",
        message: e instanceof Error ? e.message : "Try again.",
      });
    } finally {
      setBusyId(null);
    }
  };

  const toggleDefault = async (item: MediaItem) => {
    setBusyId(item.id);
    try {
      const updated = await updateMedia(agentId, item.id, {
        show_by_default: !item.show_by_default,
      });
      setItems((prev) => prev.map((i) => (i.id === item.id ? updated : i)));
    } finally {
      setBusyId(null);
    }
  };

  if (loading) {
    return (
      <div className="grid place-items-center py-14!">
        <Spinner />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-3! mb-4!">
        <p className="text-[12.5px] text-[var(--muted)]">
          The agent shows one of these when a visitor asks for it. Items marked
          with a star are shown right after the greeting.
        </p>
        <PrimaryButton onClick={() => setAdding(true)} className="shrink-0">
          <Plus size={15} /> Add media
        </PrimaryButton>
      </div>

      {items.length === 0 ? (
        <div className="border-2 border-dashed border-[var(--line)] rounded-2xl py-12! grid place-items-center text-center">
          <span className="w-11! h-11! rounded-xl grid place-items-center bg-[var(--violet-050)] text-[var(--violet-700)] border border-[var(--violet-100)] mb-3!">
            <ImageIcon size={20} />
          </span>
          <p className="text-[14px] font-semibold text-[var(--ink)]">
            Nothing to show yet
          </p>
          <p className="text-[12.5px] text-[var(--slate)] mt-1! max-w-[360px]!">
            Add a flyer, business card, menu or price list and the agent can put
            it on screen mid-conversation.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3!">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex gap-3! bg-white border border-[var(--line)] rounded-xl p-3!"
            >
              <Thumb kind={item.kind} url={item.url} title={item.title} />
              <div className="min-w-0 flex-1">
                <div className="flex items-start gap-2!">
                  <p className="text-[13.5px] font-semibold text-[var(--ink)] truncate flex-1">
                    {item.title}
                  </p>
                  {item.show_by_default && (
                    <Star
                      size={13}
                      className="text-amber-500 shrink-0 mt-0.5!"
                      fill="currentColor"
                    />
                  )}
                </div>
                <p className="text-[11.5px] text-[var(--muted)] line-clamp-2 mt-0.5!">
                  {item.description || item.trigger_keywords.join(", ") || item.kind}
                </p>
                <div className="flex items-center gap-1! mt-2!">
                  <MiniBtn
                    title={item.show_by_default ? "Don't auto-show" : "Auto-show"}
                    busy={busyId === item.id}
                    onClick={() => toggleDefault(item)}
                  >
                    <Star size={13} />
                  </MiniBtn>
                  <MiniBtn title="Edit" onClick={() => setEditing(item)}>
                    <Pencil size={13} />
                  </MiniBtn>
                  <MiniBtn
                    title="Remove"
                    danger
                    busy={busyId === item.id}
                    onClick={() => remove(item)}
                  >
                    <Trash2 size={13} />
                  </MiniBtn>
                  <a
                    href={mediaSrc(item.url)}
                    target="_blank"
                    rel="noreferrer"
                    className="ml-auto text-[11.5px] font-semibold text-[var(--violet-700)] hover:text-[var(--violet-600)]"
                  >
                    Open
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {adding && (
        <MediaForm
          onClose={() => setAdding(false)}
          onSubmit={async (draft) => {
            if (draft.file) {
              await uploadMedia(agentId, {
                file: draft.file,
                title: draft.title,
                description: draft.description,
                trigger_keywords: draft.trigger_keywords,
                show_by_default: draft.show_by_default,
              });
            } else {
              await addMediaLink(agentId, {
                title: draft.title,
                external_url: draft.external_url!,
                description: draft.description,
                trigger_keywords: draft.trigger_keywords,
                show_by_default: draft.show_by_default,
              });
            }
            setAdding(false);
            showToast({ type: "success", title: "Media added" });
            load();
          }}
        />
      )}

      {editing && (
        <MediaForm
          existing={editing}
          onClose={() => setEditing(null)}
          onSubmit={async (draft) => {
            const updated = await updateMedia(agentId, editing.id, {
              title: draft.title,
              description: draft.description,
              trigger_keywords: draft.trigger_keywords,
              show_by_default: draft.show_by_default,
            });
            setItems((prev) =>
              prev.map((i) => (i.id === editing.id ? updated : i)),
            );
            setEditing(null);
            showToast({ type: "success", title: "Media updated" });
          }}
        />
      )}
    </div>
  );
}

// ── Wizard staging ───────────────────────────────────────────────────────────

export function MediaStager({
  items,
  onChange,
}: {
  items: StagedMedia[];
  onChange: (next: StagedMedia[]) => void;
}) {
  const [adding, setAdding] = useState(false);

  return (
    <div>
      <div className="flex items-center justify-between gap-3! mb-3!">
        <p className="text-[12.5px] text-[var(--muted)]">
          Flyers, business cards or price lists the agent can show on screen.
          Uploaded once the agent is created.
        </p>
        <GhostButton onClick={() => setAdding(true)} className="shrink-0 py-2!">
          <Plus size={15} /> Add media
        </GhostButton>
      </div>

      {items.length > 0 && (
        <div className="space-y-2!">
          {items.map((item) => (
            <div
              key={item.key}
              className="flex items-center gap-3! bg-white border border-[var(--line)] rounded-xl px-3.5! py-2.5!"
            >
              <Thumb
                kind={item.file ? kindForFile(item.file.name) : "link"}
                url={item.file ? "" : item.external_url || ""}
                title={item.title}
                small
                file={item.file}
              />
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-medium text-[var(--ink)] truncate">
                  {item.title}
                </p>
                <p className="text-[11.5px] text-[var(--muted)] truncate">
                  {item.file
                    ? `${(item.file.size / 1024).toFixed(0)} KB`
                    : item.external_url}
                  {item.show_by_default && " · shown at start"}
                </p>
              </div>
              <button
                onClick={() => onChange(items.filter((i) => i.key !== item.key))}
                className="w-7! h-7! grid place-items-center rounded-md text-[var(--muted)] hover:text-red-600 hover:bg-red-50 transition-colors shrink-0"
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>
      )}

      {adding && (
        <MediaForm
          onClose={() => setAdding(false)}
          onSubmit={async (draft) => {
            onChange([...items, { ...draft, key: crypto.randomUUID() }]);
            setAdding(false);
          }}
        />
      )}
    </div>
  );
}

/** Upload everything staged in the wizard. Returns the failures, if any. */
export async function flushStagedMedia(
  agentId: string,
  items: StagedMedia[],
): Promise<string[]> {
  const errors: string[] = [];
  for (const item of items) {
    try {
      if (item.file) {
        await uploadMedia(agentId, {
          file: item.file,
          title: item.title,
          description: item.description,
          trigger_keywords: item.trigger_keywords,
          show_by_default: item.show_by_default,
        });
      } else if (item.external_url) {
        await addMediaLink(agentId, {
          title: item.title,
          external_url: item.external_url,
          description: item.description,
          trigger_keywords: item.trigger_keywords,
          show_by_default: item.show_by_default,
        });
      }
    } catch (e) {
      errors.push(`${item.title}: ${e instanceof Error ? e.message : "upload failed"}`);
    }
  }
  return errors;
}

// ── Shared bits ──────────────────────────────────────────────────────────────

function kindForFile(name: string): MediaKind {
  const lower = name.toLowerCase();
  if (lower.endsWith(".pdf")) return "pdf";
  if (lower.endsWith(".mp4") || lower.endsWith(".webm")) return "video";
  return "image";
}

function Thumb({
  kind,
  url,
  title,
  small,
  file,
}: {
  kind: MediaKind;
  url: string;
  title: string;
  small?: boolean;
  file?: File;
}) {
  const [localUrl, setLocalUrl] = useState("");
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!file || kind !== "image") return;
    const objectUrl = URL.createObjectURL(file);
    setLocalUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file, kind]);

  const size = small ? "w-9! h-9!" : "w-16! h-16!";
  const src = localUrl || (url ? mediaSrc(url) : "");
  const showImage = kind === "image" && src && !failed;

  return (
    <div
      className={`${size} rounded-lg overflow-hidden bg-[var(--line-soft)] border border-[var(--line)] grid place-items-center shrink-0 text-[var(--muted)]`}
    >
      {showImage ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={src}
          alt={title}
          onError={() => setFailed(true)}
          className="w-full! h-full! object-cover"
        />
      ) : kind === "pdf" ? (
        <FileText size={small ? 14 : 20} />
      ) : kind === "video" ? (
        <Film size={small ? 14 : 20} />
      ) : kind === "link" ? (
        <Link2 size={small ? 14 : 20} />
      ) : (
        <ImageIcon size={small ? 14 : 20} />
      )}
    </div>
  );
}

function MiniBtn({
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
      className={`w-7! h-7! grid place-items-center rounded-md text-[var(--muted)] hover:bg-[var(--sidebar-hover)] transition-colors disabled:opacity-50 ${
        danger ? "hover:text-red-600" : "hover:text-[var(--ink)]"
      }`}
    >
      {busy ? <Loader2 size={12} className="animate-spin" /> : children}
    </button>
  );
}

function MediaForm({
  existing,
  onClose,
  onSubmit,
}: {
  existing?: MediaItem;
  onClose: () => void;
  onSubmit: (draft: Omit<StagedMedia, "key">) => Promise<void>;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [tab, setTab] = useState<"upload" | "link">(
    existing?.kind === "link" ? "link" : "upload",
  );
  const [file, setFile] = useState<File | null>(null);
  const [externalUrl, setExternalUrl] = useState(
    existing?.kind === "link" ? existing.url : "",
  );
  const [title, setTitle] = useState(existing?.title || "");
  const [description, setDescription] = useState(existing?.description || "");
  const [keywords, setKeywords] = useState<string[]>(
    existing?.trigger_keywords || [],
  );
  const [showByDefault, setShowByDefault] = useState(
    !!existing?.show_by_default,
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEdit = !!existing;

  const pick = (f: File | null) => {
    if (!f) return;
    if (f.size > MAX_MB * 1024 * 1024) {
      setError(`${f.name} is ${(f.size / 1048576).toFixed(1)} MB — limit is ${MAX_MB} MB.`);
      return;
    }
    setError(null);
    setFile(f);
    if (!title) setTitle(f.name.replace(/\.[^.]+$/, ""));
  };

  const submit = async () => {
    setError(null);
    if (!title.trim()) {
      setError("Give it a title — that's what the agent matches on.");
      return;
    }
    if (!isEdit && tab === "upload" && !file) {
      setError("Choose a file to upload.");
      return;
    }
    if (!isEdit && tab === "link" && !/^https?:\/\/.+/.test(externalUrl.trim())) {
      setError("Enter a full URL, including https://");
      return;
    }
    setBusy(true);
    try {
      await onSubmit({
        file: tab === "upload" && !isEdit ? file || undefined : undefined,
        external_url: tab === "link" && !isEdit ? externalUrl.trim() : undefined,
        title: title.trim(),
        description: description.trim(),
        trigger_keywords: keywords,
        show_by_default: showByDefault,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save.");
      setBusy(false);
    }
  };

  return (
    <Modal
      title={isEdit ? `Edit ${existing.title}` : "Add media"}
      desc="The title and keywords are how the agent decides this is the right thing to show."
      onClose={onClose}
      footer={
        <>
          <GhostButton onClick={onClose} disabled={busy}>
            Cancel
          </GhostButton>
          <PrimaryButton onClick={submit} loading={busy}>
            {isEdit ? "Save changes" : "Add media"}
          </PrimaryButton>
        </>
      }
    >
      {!isEdit && (
        <div className="inline-flex items-center gap-1! bg-[var(--sidebar)] border border-[var(--line)] rounded-xl p-1! mb-5!">
          {(
            [
              { key: "upload", label: "Upload a file" },
              { key: "link", label: "Link" },
            ] as const
          ).map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-3! py-1.5! rounded-lg text-[12.5px] font-semibold transition-colors ${
                tab === t.key
                  ? "bg-[var(--ink)] text-white"
                  : "text-[var(--slate)] hover:bg-[var(--sidebar-hover)]"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      )}

      {!isEdit && tab === "upload" && (
        <div
          onClick={() => fileRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            pick(e.dataTransfer.files?.[0] || null);
          }}
          className="border-2 border-dashed border-[var(--line)] rounded-2xl py-8! grid place-items-center text-center cursor-pointer hover:border-[var(--violet)] hover:bg-[var(--violet-050)] transition-all mb-5!"
        >
          <Upload size={20} className="text-[var(--muted)] mb-2!" />
          <p className="text-[13px] font-semibold text-[var(--ink)]">
            {file ? file.name : "Drag & drop or click to browse"}
          </p>
          <p className="text-[11.5px] text-[var(--muted)] mt-0.5!">
            Images, PDF, MP4 · max {MAX_MB} MB
          </p>
          <input
            ref={fileRef}
            type="file"
            hidden
            accept={ACCEPT}
            onChange={(e) => pick(e.target.files?.[0] || null)}
          />
        </div>
      )}

      {!isEdit && tab === "link" && (
        <div className="mb-5!">
          <Label>Link</Label>
          <input
            value={externalUrl}
            onChange={(e) => setExternalUrl(e.target.value)}
            placeholder="https://yourcompany.com/brochure.pdf"
            className="fld px-3.5! py-2.5!"
          />
        </div>
      )}

      <div className="space-y-4!">
        <div>
          <Label>Title</Label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Spring flyer"
            className="fld px-3.5! py-2.5!"
          />
        </div>
        <div>
          <Label optional>What is it?</Label>
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="This month's offers, valid to 30 June"
            className="fld px-3.5! py-2.5!"
          />
        </div>
        <div>
          <Label optional>Trigger keywords</Label>
          <ChipInput
            values={keywords}
            onChange={setKeywords}
            placeholder="flyer, offers, discount…"
            max={25}
            maxLength={80}
          />
        </div>
        <Row
          title="Show at the start"
          desc="Put this on screen right after the greeting, without being asked."
        >
          <Toggle on={showByDefault} onChange={setShowByDefault} />
        </Row>
      </div>

      {error && (
        <p className="flex items-start gap-2! text-[13px] text-red-600 bg-red-50 border border-red-200 rounded-xl px-3.5! py-3! mt-4!">
          <AlertCircle size={15} className="shrink-0 mt-0.5!" /> {error}
        </p>
      )}
    </Modal>
  );
}

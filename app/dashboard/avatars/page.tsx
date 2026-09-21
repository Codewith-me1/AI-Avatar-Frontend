"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  Check,
  Clock,
  Loader2,
  Lock,
  Plus,
  Sparkles,
  Trash2,
  Upload,
} from "lucide-react";
import {
  avatarPreviewSrc,
  createAvatar,
  deleteAvatar,
  getCatalogue,
  isOwnerOnlyPreview,
  listMyAvatars,
} from "@/lib/api/avatars";
import { useAuthedImage } from "@/hooks/useAuthedImage";
import { useToast } from "@/components/widget/Toast";
import {
  GhostButton,
  Label,
  Modal,
  PrimaryButton,
  Spinner,
} from "@/components/console/ui";
import type { AvatarCatalogueItem, CustomAvatar } from "@/types";

type Filter = "all" | "video" | "photo";

const ACCEPT = ".png,.jpg,.jpeg,.webp,.mp4,.webm";
const MAX_MB = 25;

/**
 * Bringing your own avatar is not finished: the server stores the upload but
 * has no preparation pipeline, so a video avatar comes back `failed`. The
 * upload UI below is complete and gated behind this one flag — flip it to true
 * once the backend can actually prepare an avatar.
 */
const CREATE_ENABLED = false;

export default function AvatarsPage() {
  const { showToast } = useToast();
  const [filter, setFilter] = useState<Filter>("all");
  const [catalogue, setCatalogue] = useState<AvatarCatalogueItem[]>([]);
  const [mine, setMine] = useState<CustomAvatar[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const notifyComingSoon = () =>
    showToast({
      type: "info",
      title: "Custom avatars are coming soon",
      message: "Pick one from the gallery below in the meantime.",
    });

  const load = useCallback(async () => {
    setLoading(true);
    const [cat, own] = await Promise.all([
      getCatalogue(),
      listMyAvatars().catch(() => [] as CustomAvatar[]),
    ]);
    setCatalogue(cat);
    setMine(own);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // A freshly uploaded avatar is prepared in the background — poll until every
  // row has settled so the card stops saying "Preparing…" on its own.
  const pending = mine.some((a) => a.status === "pending" || a.status === "processing");
  useEffect(() => {
    if (!pending) return;
    const timer = setInterval(async () => {
      try {
        setMine(await listMyAvatars());
      } catch {
        /* keep the last known state */
      }
    }, 4000);
    return () => clearInterval(timer);
  }, [pending]);

  // The owner's own uploads are rendered from /mine (they carry status), so
  // drop the copies the catalogue also returns to avoid showing them twice.
  const stock = catalogue.filter((a) => a.provider !== "custom");
  const visibleStock = stock.filter((a) => filter === "all" || a.kind === filter);
  const visibleMine = mine.filter((a) => filter === "all" || a.kind === filter);

  return (
    <div className="p-8! md:p-10! max-w-[1320px] mx-auto! w-full!">
      <div className="flex items-center justify-between gap-4! mb-2!">
        <h1 className="text-[24px] font-semibold text-[var(--ink)] tracking-tight flex items-center gap-2.5!">
          Avatars
          <span className="text-[10.5px] font-bold uppercase tracking-wide text-[var(--violet-700)] bg-[var(--violet-050)] border border-[var(--violet-100)] px-2! py-0.5! rounded-full">
            Coming soon
          </span>
        </h1>
        {CREATE_ENABLED ? (
          <PrimaryButton onClick={() => setCreating(true)}>
            <Plus size={16} /> Create Avatar
          </PrimaryButton>
        ) : (
          <button
            onClick={notifyComingSoon}
            className="inline-flex items-center gap-2! rounded-xl border border-[var(--line)] bg-white px-4! py-2.5! text-[13.5px] font-semibold text-[var(--muted)] cursor-not-allowed"
            title="Custom avatars are not available yet"
          >
            <Lock size={15} /> Create Avatar
          </button>
        )}
      </div>
      <p className="text-[13px] text-[var(--slate)] mb-5!">
        Choose a lifelike face for your agents. Every avatar streams live in the
        widget.
      </p>

      {!CREATE_ENABLED && (
        <div className="flex items-start gap-3! bg-[var(--violet-050)] border border-[var(--violet-100)] rounded-2xl px-4! py-3.5! mb-6!">
          <Sparkles
            size={17}
            className="text-[var(--violet-700)] shrink-0 mt-0.5!"
          />
          <div className="text-[13px] text-[var(--slate)] leading-relaxed">
            <p className="font-semibold text-[var(--ink)] mb-0.5!">
              Custom avatars are coming soon
            </p>
            Bringing your own face or clip isn&apos;t available yet. The gallery
            below is ready to use now — pick any of these from an agent&apos;s{" "}
            <span className="font-medium text-[var(--ink)]">Avatar</span> tab and
            it streams live in the widget.
          </div>
        </div>
      )}

      <div className="inline-flex items-center gap-1! bg-white border border-[var(--line)] rounded-xl p-1! mb-6! shadow-[var(--shadow-sm)]">
        {(
          [
            { key: "all", label: "All" },
            { key: "video", label: "Video Avatars" },
            { key: "photo", label: "Photo Avatars" },
          ] as const
        ).map((t) => (
          <button
            key={t.key}
            onClick={() => setFilter(t.key)}
            className={`px-3.5! py-1.5! rounded-lg text-[13px] font-semibold transition-colors ${
              filter === t.key
                ? "bg-[var(--ink)] text-white"
                : "text-[var(--slate)] hover:bg-[var(--sidebar-hover)]"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid place-items-center py-24!">
          <Spinner />
        </div>
      ) : (
        <>
          {visibleMine.length > 0 && (
            <>
              <h2 className="text-[15px] font-semibold text-[var(--ink)] mb-3.5!">
                Your avatars
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4! mb-10!">
                {visibleMine.map((a) => (
                  <MyAvatarCard
                    key={a.id}
                    avatar={a}
                    onDeleted={() => {
                      setMine((prev) => prev.filter((x) => x.id !== a.id));
                      showToast({ type: "success", title: "Avatar deleted" });
                    }}
                  />
                ))}
              </div>
            </>
          )}

          <h2 className="text-[15px] font-semibold text-[var(--ink)] mb-3.5!">
            Avatar gallery
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4!">
            <button
              onClick={CREATE_ENABLED ? () => setCreating(true) : notifyComingSoon}
              className={`group flex flex-col items-center justify-center gap-2! aspect-[3/4] rounded-2xl border-2 border-dashed transition-all ${
                CREATE_ENABLED
                  ? "border-[var(--line)] bg-white hover:border-[var(--violet)] hover:bg-[var(--violet-050)]"
                  : "border-[var(--line)] bg-[var(--sidebar)]/60 cursor-not-allowed"
              }`}
            >
              <span
                className={`w-11! h-11! rounded-full grid place-items-center transition-colors ${
                  CREATE_ENABLED
                    ? "bg-[var(--sidebar-hover)] text-[var(--muted)] group-hover:bg-white group-hover:text-[var(--violet-700)]"
                    : "bg-white text-[var(--muted)] border border-[var(--line)]"
                }`}
              >
                {CREATE_ENABLED ? <Plus size={20} /> : <Lock size={18} />}
              </span>
              <span className="text-[13px] font-semibold text-[var(--ink)]">
                Create Avatar
              </span>
              {!CREATE_ENABLED && (
                <span className="text-[10.5px] font-bold uppercase tracking-wide text-[var(--violet-700)] bg-[var(--violet-050)] border border-[var(--violet-100)] px-1.5! py-0.5! rounded">
                  Coming soon
                </span>
              )}
            </button>

            {visibleStock.map((a) => (
              <StockAvatarCard key={`${a.provider}-${a.id}`} avatar={a} />
            ))}
          </div>

          {visibleStock.length === 0 && visibleMine.length === 0 && (
            <div className="grid place-items-center py-16! text-center">
              <Check size={22} className="text-[var(--muted)] mb-2!" />
              <p className="text-[13px] text-[var(--muted)]">
                No avatars match this filter.
              </p>
            </div>
          )}
        </>
      )}

      {CREATE_ENABLED && creating && (
        <CreateAvatarModal
          onClose={() => setCreating(false)}
          onCreated={(created) => {
            setCreating(false);
            setMine((prev) => [created, ...prev]);
            showToast({
              type: "success",
              title: "Avatar uploaded",
              message: "We're preparing it now — the card updates when it's ready.",
            });
          }}
        />
      )}
    </div>
  );
}

// ── Cards ────────────────────────────────────────────────────────────────────

function Frame({
  children,
  badge,
  name,
  description,
  footer,
}: {
  children: React.ReactNode;
  badge: string;
  name: string;
  description?: string | null;
  footer?: React.ReactNode;
}) {
  return (
    <div className="group relative rounded-2xl overflow-hidden border border-[var(--line)] bg-white shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] transition-all">
      <div className="aspect-[3/4] bg-[var(--line-soft)] overflow-hidden">
        {children}
      </div>
      <span className="absolute top-2! left-2! text-[10px] font-bold text-white bg-black/55 backdrop-blur px-1.5! py-0.5! rounded-md">
        {badge}
      </span>
      {footer}
      <div className="p-3!">
        <p className="text-[13.5px] font-semibold text-[var(--ink)] leading-tight truncate">
          {name}
        </p>
        <p className="text-[11.5px] text-[var(--muted)] mt-0.5! truncate">
          {description || "—"}
        </p>
      </div>
    </div>
  );
}

function StockAvatarCard({ avatar }: { avatar: AvatarCatalogueItem }) {
  const [failed, setFailed] = useState(false);
  const src = avatarPreviewSrc(avatar.id, avatar.preview_url);

  return (
    <Frame
      badge={avatar.kind === "video" ? "VIDEO" : "PHOTO"}
      name={avatar.name}
      description={avatar.description}
    >
      {src && !failed ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={src}
          alt={avatar.name}
          onError={() => setFailed(true)}
          className="w-full! h-full! object-cover"
        />
      ) : (
        <div className="w-full! h-full! grid place-items-center text-[11px] font-semibold text-[var(--muted)]">
          {avatar.name.slice(0, 2).toUpperCase()}
        </div>
      )}
    </Frame>
  );
}

function MyAvatarCard({
  avatar,
  onDeleted,
}: {
  avatar: CustomAvatar;
  onDeleted: () => void;
}) {
  // Owner-only preview route: an <img> cannot authenticate, so fetch the blob.
  const authed = useAuthedImage(
    isOwnerOnlyPreview(avatar.preview_url) ? avatar.preview_url : null,
  );
  const src = isOwnerOnlyPreview(avatar.preview_url)
    ? authed
    : avatar.preview_url || "";
  const [busy, setBusy] = useState(false);

  const remove = async () => {
    setBusy(true);
    try {
      await deleteAvatar(avatar.id);
      onDeleted();
    } finally {
      setBusy(false);
    }
  };

  const status = avatar.status;

  return (
    <Frame
      badge={avatar.kind === "video" ? "VIDEO" : "PHOTO"}
      name={avatar.name}
      description={
        status === "ready"
          ? "Ready to use"
          : status === "failed"
            ? avatar.error || "Preparation failed"
            : "Preparing…"
      }
      footer={
        <>
          <span
            className={`absolute top-2! right-2! text-[10px] font-bold px-1.5! py-0.5! rounded-md backdrop-blur ${
              status === "ready"
                ? "bg-emerald-600/85 text-white"
                : status === "failed"
                  ? "bg-red-600/85 text-white"
                  : "bg-amber-500/85 text-white"
            }`}
          >
            {status === "ready" ? (
              <Check size={10} className="inline" />
            ) : status === "failed" ? (
              <AlertCircle size={10} className="inline" />
            ) : (
              <Clock size={10} className="inline" />
            )}
          </span>
          <button
            onClick={remove}
            disabled={busy}
            title="Delete avatar"
            className="absolute bottom-[68px]! right-2! w-8! h-8! grid place-items-center rounded-lg bg-white/90 backdrop-blur text-[var(--slate)] hover:text-red-600 shadow-sm opacity-0 group-hover:opacity-100 transition-all"
          >
            {busy ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
          </button>
        </>
      }
    >
      {src ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img src={src} alt={avatar.name} className="w-full! h-full! object-cover" />
      ) : (
        <div className="w-full! h-full! grid place-items-center text-[var(--muted)]">
          {status === "failed" ? (
            <AlertCircle size={20} />
          ) : (
            <Loader2 size={18} className="animate-spin" />
          )}
        </div>
      )}
    </Frame>
  );
}

// ── Upload ───────────────────────────────────────────────────────────────────

function CreateAvatarModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (a: CustomAvatar) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isVideo = !!file && /\.(mp4|webm)$/i.test(file.name);

  const pick = (f: File | null) => {
    setError(null);
    if (!f) return;
    if (f.size > MAX_MB * 1024 * 1024) {
      setError(`That file is ${(f.size / 1048576).toFixed(1)} MB — the limit is ${MAX_MB} MB.`);
      return;
    }
    setFile(f);
    if (!name) setName(f.name.replace(/\.[^.]+$/, ""));
  };

  const upload = async () => {
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      const created = await createAvatar(file, name.trim() || undefined, isVideo ? "video" : "photo");
      onCreated(created);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      title="Create an avatar"
      desc="Upload a portrait photo, or a short clip to build a video avatar from."
      onClose={onClose}
      footer={
        <>
          <GhostButton onClick={onClose} disabled={busy}>
            Cancel
          </GhostButton>
          <PrimaryButton onClick={upload} loading={busy} disabled={!file}>
            Upload avatar
          </PrimaryButton>
        </>
      }
    >
      <div
        onClick={() => fileRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          pick(e.dataTransfer.files?.[0] || null);
        }}
        className="border-2 border-dashed border-[var(--line)] rounded-2xl py-10! grid place-items-center text-center cursor-pointer hover:border-[var(--violet)] hover:bg-[var(--violet-050)] transition-all"
      >
        <Upload size={22} className="text-[var(--muted)] mb-2!" />
        <p className="text-[13px] font-semibold text-[var(--ink)]">
          {file ? file.name : "Drag & drop or click to browse"}
        </p>
        <p className="text-[11.5px] text-[var(--muted)] mt-0.5!">
          PNG, JPG, WEBP, MP4, WEBM · max {MAX_MB} MB
        </p>
        <input
          ref={fileRef}
          type="file"
          hidden
          accept={ACCEPT}
          onChange={(e) => pick(e.target.files?.[0] || null)}
        />
      </div>

      <div className="mt-5!">
        <Label>Avatar name</Label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Front desk — Priya"
          className="fld px-3.5! py-2.5!"
        />
      </div>

      {isVideo && (
        <p className="flex items-start gap-2! text-[12.5px] text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-3.5! py-3! mt-4!">
          <AlertCircle size={14} className="shrink-0 mt-0.5!" />
          Video avatar preparation isn&apos;t wired up on the server yet — this
          upload will be stored and marked failed with an explanation. Photo
          avatars go straight to ready.
        </p>
      )}

      {error && (
        <p className="flex items-start gap-2! text-[13px] text-red-600 bg-red-50 border border-red-200 rounded-xl px-3.5! py-3! mt-4!">
          <AlertCircle size={15} className="shrink-0 mt-0.5!" /> {error}
        </p>
      )}
    </Modal>
  );
}

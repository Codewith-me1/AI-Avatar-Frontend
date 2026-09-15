/**
 * Avatar catalogue and custom avatar uploads.
 *
 * `/catalogue` merges the MuseTalk renders, the LiveAvatar public list and the
 * owner's own uploads, and degrades to the static list when LiveAvatar is
 * unreachable — so the gallery never renders empty because of a third-party
 * timeout. `lib/catalog.ts` still holds the same MuseTalk entries as a
 * client-side fallback for when the API itself cannot be reached.
 */

import { apiClient } from "./client";
import { MUSETALK_AVATARS } from "@/lib/catalog";
import type { AvatarCatalogueItem, CustomAvatar } from "@/types";

export async function getCatalogue(): Promise<AvatarCatalogueItem[]> {
  try {
    const data = await apiClient.get<{ avatars: AvatarCatalogueItem[] }>(
      "/api/avatars/catalogue",
    );
    const avatars = (data?.avatars || []).filter((a) => a && a.id);
    if (avatars.length) return avatars;
  } catch {
    /* fall through to the bundled list */
  }
  return MUSETALK_AVATARS.map((a) => ({ ...a, provider: "musetalk" as const }));
}

export function listMyAvatars(): Promise<CustomAvatar[]> {
  return apiClient.get<CustomAvatar[]>("/api/avatars/mine");
}

export function createAvatar(
  file: File,
  name?: string,
  kind?: "photo" | "video",
): Promise<CustomAvatar> {
  const fd = new FormData();
  fd.append("file", file);
  if (name) fd.append("name", name);
  if (kind) fd.append("kind", kind);
  return apiClient.postForm<CustomAvatar>("/api/avatars/", fd);
}

export function deleteAvatar(avatarId: string): Promise<void> {
  return apiClient.delete(`/api/avatars/${avatarId}`);
}

/** Owner-only preview route — an <img> cannot authenticate against it. */
export function isOwnerOnlyPreview(url?: string | null): boolean {
  return !!url && url.startsWith("/api/avatars/");
}

const LOCAL_PREVIEWS = new Map(
  MUSETALK_AVATARS.map((a) => [a.id, a.preview_url] as const),
);

/**
 * Where to point an `<img>` for one avatar.
 *
 * Known MuseTalk ids resolve to the bundled asset first on purpose: the API
 * derives its preview filename from the avatar's display name, which does not
 * always match the file on disk (`Sidhart` vs `sidharth.png`), so trusting it
 * blindly renders a broken tile.
 *
 * Returns "" when there is nothing an <img> can load by itself — an owner-only
 * preview (use `useAuthedImage`) or no preview at all. Callers render initials.
 */
export function avatarPreviewSrc(id?: string, url?: string | null): string {
  const local = id ? LOCAL_PREVIEWS.get(id) : undefined;
  if (local) return local;
  if (!url) return "";
  if (/^(https?:|data:|blob:)/i.test(url)) return url;
  if (isOwnerOnlyPreview(url)) return "";
  // Anything else server-relative is a static asset served by this app
  // (/avatars/…), not by the API origin.
  return url;
}

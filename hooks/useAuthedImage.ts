"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api/client";

/**
 * Loads an owner-only image (e.g. a custom avatar preview) as a blob URL.
 *
 * An `<img src>` cannot send the Bearer header, and the API's session cookie is
 * third-party from this origin, so these assets have to be fetched in JS. The
 * blob URL is revoked on unmount / path change so a long session does not leak
 * every preview it has ever rendered.
 */
export function useAuthedImage(path?: string | null): string {
  const [src, setSrc] = useState("");

  useEffect(() => {
    if (!path) {
      setSrc("");
      return;
    }
    let revoked = false;
    let objectUrl: string | null = null;

    apiClient
      .objectUrl(path)
      .then((url) => {
        if (revoked) {
          URL.revokeObjectURL(url);
          return;
        }
        objectUrl = url;
        setSrc(url);
      })
      .catch(() => setSrc(""));

    return () => {
      revoked = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [path]);

  return src;
}

"use client";

import { useState } from "react";
import { Plus, Check } from "lucide-react";
import { MUSETALK_AVATARS } from "@/lib/catalog";
import { useToast } from "@/components/widget/Toast";

type Filter = "all" | "video" | "photo";

export default function AvatarsPage() {
  const [filter, setFilter] = useState<Filter>("all");
  const { showToast } = useToast();

  const list = MUSETALK_AVATARS.filter(
    (a) => filter === "all" || a.kind === filter,
  );

  return (
    <div className="p-8! md:p-10! max-w-[1320px] mx-auto! w-full!">
      <div className="flex items-center justify-between gap-4! mb-2!">
        <h1 className="text-[24px] font-semibold text-[var(--ink)] tracking-tight">
          Avatars
        </h1>
        <button
          onClick={() =>
            showToast({
              type: "info",
              title: "Bring your own avatar",
              message:
                "Custom avatar creation is handled by our team — reach out to add yours to the gallery.",
            })
          }
          className="btn-dark px-4! py-2.5! text-[13.5px]"
        >
          <Plus size={16} /> Create Avatar
        </button>
      </div>
      <p className="text-[13px] text-[var(--slate)] mb-6!">
        Choose a lifelike face for your agents. Every avatar streams live in the
        widget.
      </p>

      {/* Filter tabs */}
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

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4!">
        {/* Create tile */}
        <button
          onClick={() =>
            showToast({
              type: "info",
              title: "Bring your own avatar",
              message:
                "Custom avatar creation is handled by our team — reach out to add yours to the gallery.",
            })
          }
          className="group flex flex-col items-center justify-center gap-2! aspect-[3/4] rounded-2xl border-2 border-dashed border-[var(--line)] bg-white hover:border-[var(--violet)] hover:bg-[var(--violet-050)] transition-all"
        >
          <span className="w-11! h-11! rounded-full grid place-items-center bg-[var(--sidebar-hover)] text-[var(--muted)] group-hover:bg-white group-hover:text-[var(--violet-700)] transition-colors">
            <Plus size={20} />
          </span>
          <span className="text-[13px] font-semibold text-[var(--ink)]">
            Create Avatar
          </span>
        </button>

        {list.map((a) => (
          <div
            key={a.id}
            className="group relative rounded-2xl overflow-hidden border border-[var(--line)] bg-white shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] transition-all"
          >
            <div className="aspect-[3/4] bg-[var(--line-soft)] overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={a.preview_url}
                alt={a.name}
                className="w-full! h-full! object-cover"
              />
            </div>
            <span className="absolute top-2! left-2! text-[10px] font-bold text-white bg-black/55 backdrop-blur px-1.5! py-0.5! rounded-md">
              {a.kind === "video" ? "VIDEO" : "PHOTO"}
            </span>
            <div className="p-3!">
              <p className="text-[13.5px] font-semibold text-[var(--ink)] leading-tight truncate">
                {a.name}
              </p>
              <p className="text-[11.5px] text-[var(--muted)] mt-0.5! truncate">
                {a.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {list.length === 0 && (
        <div className="grid place-items-center py-16! text-center">
          <Check size={22} className="text-[var(--muted)] mb-2!" />
          <p className="text-[13px] text-[var(--muted)]">
            No avatars match this filter.
          </p>
        </div>
      )}
    </div>
  );
}

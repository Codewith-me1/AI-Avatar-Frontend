"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronDown, User } from "lucide-react";
import { AVATAR_OPTIONS, type AvatarOption } from "./Avatars";

interface AvatarPickerProps {
  selected: AvatarOption;
  onChange: (avatar: AvatarOption) => void;
  disabled?: boolean;
}

const STYLE_BADGE: Record<AvatarOption["style"], string> = {
  professional: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  casual: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  friendly: "bg-amber-500/20 text-amber-300 border-amber-500/30",
};

const GENDER_ICON: Record<AvatarOption["gender"], string> = {
  female: "♀",
  male: "♂",
};

export function AvatarPicker({
  selected,
  onChange,
  disabled,
}: AvatarPickerProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      {/* Trigger */}
      <button
        type="button"
        onClick={() => !disabled && setOpen((v) => !v)}
        disabled={disabled}
        className="
          w-full flex items-center gap-3 px-4 py-3
          bg-white/5 hover:bg-white/8 border border-white/10 hover:border-white/20
          rounded-xl transition-all text-left
          disabled:opacity-40 disabled:cursor-not-allowed
        "
      >
        <AvatarThumb avatar={selected} size="sm" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white">{selected.name}</p>
          <p className="text-xs text-white/40 truncate">
            {selected.description}
          </p>
        </div>
        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-white/40 flex-none"
        >
          <ChevronDown size={16} />
        </motion.div>
      </button>

      {/* Dropdown grid */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="
              absolute z-50 top-full mt-2 left-0 right-0
              bg-slate-900 border border-white/15 rounded-2xl
              shadow-2xl shadow-black/50 overflow-hidden p-3
            "
          >
            <p className="text-xs text-white/30 font-medium px-1 mb-2 uppercase tracking-wider">
              Choose Avatar
            </p>
            <div className="grid grid-cols-2 gap-2">
              {AVATAR_OPTIONS.map((avatar) => (
                <AvatarCard
                  key={avatar.id}
                  avatar={avatar}
                  isSelected={avatar.id === selected.id}
                  onClick={() => {
                    onChange(avatar);
                    setOpen(false);
                  }}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Backdrop */}
      {open && (
        <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
      )}
    </div>
  );
}

function AvatarCard({
  avatar,
  isSelected,
  onClick,
}: {
  avatar: AvatarOption;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <motion.button
      type="button"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={`
        relative flex flex-col items-center gap-2 p-3 rounded-xl
        border transition-all text-left cursor-pointer
        ${
          isSelected
            ? "border-violet-500/60 bg-violet-500/10"
            : "border-white/8 bg-white/3 hover:bg-white/6 hover:border-white/15"
        }
      `}
    >
      {/* Selected checkmark */}
      {isSelected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute top-2 right-2 w-4 h-4 bg-violet-500 rounded-full flex items-center justify-center"
        >
          <Check size={10} className="text-white" />
        </motion.div>
      )}

      <AvatarThumb avatar={avatar} size="md" />

      <div className="text-center w-full">
        <p className="text-xs font-semibold text-white leading-tight">
          {avatar.name}
          <span className="ml-1 text-white/30 font-normal">
            {GENDER_ICON[avatar.gender]}
          </span>
        </p>
        <p className="text-[10px] text-white/40 truncate mt-0.5">
          {avatar.description}
        </p>
      </div>

      <span
        className={`
          text-[9px] px-1.5 py-0.5 rounded border font-medium capitalize
          ${STYLE_BADGE[avatar.style]}
        `}
      >
        {avatar.style}
      </span>
    </motion.button>
  );
}

function AvatarThumb({
  avatar,
  size,
}: {
  avatar: AvatarOption;
  size: "sm" | "md";
}) {
  const dim = size === "sm" ? "w-9 h-9" : "w-14 h-14";
  const text = size === "sm" ? "text-sm" : "text-lg";

  return (
    <div
      className={`${dim} rounded-xl flex items-center justify-center flex-none overflow-hidden`}
      style={{ background: avatar.previewGradient }}
    >
      <User
        className={`${text} text-white/60`}
        size={size === "sm" ? 16 : 22}
      />
    </div>
  );
}

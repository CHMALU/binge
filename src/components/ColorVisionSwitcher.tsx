"use client";

import { useState } from "react";
import { IoEye, IoCheckmark } from "react-icons/io5";
import { cn } from "@/lib/utils";

export type ColorMode = "normal" | "red-green" | "blue-yellow" | "high-contrast";

export type ColorModeDict = {
  label: string;
  normal: string;
  redGreenSafe: string;
  blueYellowSafe: string;
  highContrast: string;
};

const STORAGE_KEY = "BINGE_CV_MODE";

const MODES: { value: ColorMode; dictKey: keyof ColorModeDict }[] = [
  { value: "normal", dictKey: "normal" },
  { value: "red-green", dictKey: "redGreenSafe" },
  { value: "blue-yellow", dictKey: "blueYellowSafe" },
  { value: "high-contrast", dictKey: "highContrast" },
];

function applyMode(mode: ColorMode) {
  if (mode === "normal") {
    document.documentElement.removeAttribute("data-cv-mode");
    localStorage.removeItem(STORAGE_KEY);
  } else {
    document.documentElement.setAttribute("data-cv-mode", mode);
    localStorage.setItem(STORAGE_KEY, mode);
  }
}

function readStoredMode(): ColorMode {
  if (typeof window === "undefined") return "normal";
  const stored = localStorage.getItem(STORAGE_KEY) as ColorMode | null;
  return stored && MODES.some((m) => m.value === stored) ? stored : "normal";
}

export default function ColorVisionSwitcher({ dict }: { dict: ColorModeDict }) {
  const [mode, setMode] = useState<ColorMode>(readStoredMode);
  const [open, setOpen] = useState(false);

  function selectMode(next: ColorMode) {
    setMode(next);
    setOpen(false);
    applyMode(next);
  }

  return (
    <div className="relative">
      <button
        aria-label={dict.label}
        onClick={() => setOpen((v) => !v)}
        className="flex items-center justify-center w-9 h-9 rounded-lg border transition-colors hover:bg-surface-card border-border text-fg"
      >
        <IoEye size={18} aria-hidden="true" />
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 top-full mt-2 z-50 min-w-[220px] rounded-xl overflow-hidden shadow-xl border bg-surface-raised border-border">
            {MODES.map(({ value, dictKey }) => {
              const isActive = mode === value;
              return (
                <button
                  key={value}
                  onClick={() => selectMode(value)}
                  aria-current={isActive ? "true" : undefined}
                  className={cn(
                    "w-full flex items-center justify-between gap-3 px-4 py-3 text-sm text-left transition-colors",
                    isActive
                      ? "bg-surface-card text-gold-400 font-semibold"
                      : "text-fg font-normal hover:bg-surface-card"
                  )}
                >
                  <span>{dict[dictKey]}</span>
                  {isActive && <IoCheckmark size={16} aria-hidden="true" />}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

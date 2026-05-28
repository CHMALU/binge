"use client";

import { useEffect, useState } from "react";
import { IoPlay, IoClose } from "react-icons/io5";

/**
 * Hero "Watch Trailer" button + YouTube lightbox. Renders nothing when the
 * title has no trailer (key is null) — the button is hidden rather than
 * leading to an empty modal.
 */
export default function HeroTrailer({
  trailerKey,
  title,
  watchLabel,
  trailerLabel,
  closeLabel,
}: {
  trailerKey: string | null;
  title: string;
  watchLabel: string;
  trailerLabel: string;
  closeLabel: string;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  if (!trailerKey) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="px-6 py-3.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all hover:-translate-y-0.5 bg-fg text-action-fg"
      >
        <IoPlay aria-hidden="true" /> {watchLabel}
      </button>

      {open && (
        <div className="fixed inset-0 z-[100] grid place-items-center p-6">
          <div
            className="absolute inset-0 bg-[rgba(5,5,8,0.82)] backdrop-blur-md"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <div className="relative w-full max-w-[680px] rounded-2xl border border-border bg-surface-raised overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-border">
              <div className="min-w-0">
                <p className="font-semibold text-fg truncate">{title}</p>
                <p className="text-xs text-fg-subtle">{trailerLabel}</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label={closeLabel}
                className="w-9 h-9 shrink-0 grid place-items-center rounded-full bg-surface-card text-fg transition-colors hover:bg-surface-hover"
              >
                <IoClose size={16} aria-hidden="true" />
              </button>
            </div>
            <div className="aspect-video bg-black">
              <iframe
                className="w-full h-full"
                src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&rel=0`}
                title={title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { IoStar, IoStarOutline, IoCheckmarkCircle, IoCloseCircle } from "react-icons/io5";
import type { Dictionary } from "@/app/[lang]/dictionaries";

type DetailDict = Dictionary["detail"];

type Props = {
  tmdbId: number;
  mediaType: "movie" | "tv";
  title: string;
  dict: DetailDict;
  isAuthed: boolean;
  lang: string;
  // Configurable mode (used by MarkWatchedButton): override defaults below.
  onSubmit?: (stars: number) => Promise<{ ok: boolean; error?: string }>;
  onSkip?: () => Promise<{ ok: boolean; error?: string }>;
  onSuccess?: () => void;
  triggerLabel?: string;
  triggerIcon?: React.ReactNode;
  triggerClassName?: string;
  dialogTitle?: string;
};

export default function RatingModal({
  tmdbId,
  mediaType,
  title,
  dict,
  isAuthed,
  lang,
  onSubmit,
  onSkip,
  onSuccess,
  triggerLabel,
  triggerIcon,
  triggerClassName,
  dialogTitle,
}: Props) {
  const [isRatingOpen, setIsRatingOpen] = useState(false);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [selectedRating, setSelectedRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ratingError, setRatingError] = useState("");
  const [ratingSuccess, setRatingSuccess] = useState("");

  if (!isAuthed) {
    return (
      <Link
        href={`/${lang}/login`}
        className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold border transition-all bg-surface-card border-border text-fg hover:bg-white/10"
      >
        <IoStar aria-hidden="true" />
        {dict.signInToRate}
      </Link>
    );
  }

  async function submitRating(stars: number) {
    try {
      setIsSubmitting(true);
      setRatingError("");
      setRatingSuccess("");

      let result: { ok: boolean; error?: string };

      if (onSubmit) {
        result = await onSubmit(stars);
      } else {
        const response = await fetch("/api/rating", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tmdbId, mediaType, stars }),
        });
        const data = await response.json();
        result = response.ok ? { ok: true } : { ok: false, error: data.error };
      }

      if (!result.ok) {
        setRatingError(result.error || dict.error);
        return;
      }

      setSelectedRating(stars);
      setRatingSuccess(dict.success);
      onSuccess?.();

      setTimeout(() => {
        setIsRatingOpen(false);
        setRatingSuccess("");
      }, 1000);
    } catch (error) {
      console.error(error);
      setRatingError(error instanceof Error ? error.message : dict.error);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleSkip() {
    if (!onSkip) return;
    try {
      setIsSubmitting(true);
      setRatingError("");
      const result = await onSkip();
      if (!result.ok) {
        setRatingError(result.error || dict.error);
        return;
      }
      onSuccess?.();
      closeModal();
    } catch (error) {
      console.error(error);
      setRatingError(error instanceof Error ? error.message : dict.error);
    } finally {
      setIsSubmitting(false);
    }
  }

  function closeModal() {
    setRatingError("");
    setRatingSuccess("");
    setSelectedRating(0);
    setHoveredStar(0);
    setIsRatingOpen(false);
  }

  return (
    <>
      <button
        onClick={() => setIsRatingOpen(true)}
        className={
          triggerClassName ??
          "w-full py-3 rounded-xl text-sm font-semibold border transition-all bg-surface-card border-border text-fg hover:bg-white/10"
        }
      >
        {triggerIcon}
        {triggerLabel ?? `${dict.rating} ${mediaType === "tv" ? dict.series : dict.movie}`}
      </button>

      {isRatingOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
          <div className="w-full max-w-md rounded-3xl border border-border bg-surface-raised p-8 shadow-2xl">
            <div className="mb-6 text-center">
              <h2 className="text-2xl font-bold mb-2">
                {dialogTitle ?? `${dict.rate} "${title}"`}
              </h2>
              <p className="text-sm text-fg-subtle">{dict.selectRating}</p>
            </div>

            <div className="flex items-center justify-center gap-3 mb-8">
              {[1, 2, 3, 4, 5].map((star) => {
                const active = star <= (hoveredStar || selectedRating);

                return (
                  <button
                    key={star}
                    onMouseEnter={() => setHoveredStar(star)}
                    onMouseLeave={() => setHoveredStar(0)}
                    onClick={() => setSelectedRating(star)}
                    className="transition-transform hover:scale-110"
                    aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
                  >
                    {active ? (
                      <IoStar size={42} className="text-gold-400" aria-hidden="true" />
                    ) : (
                      <IoStarOutline size={42} className="text-fg-subtle" aria-hidden="true" />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="min-h-[24px] mb-4 text-center">
              {ratingError && (
                <p className="text-sm font-medium text-fg inline-flex items-center gap-1.5 justify-center">
                  <IoCloseCircle aria-hidden="true" style={{ color: "var(--color-danger)" }} />
                  {ratingError}
                </p>
              )}

              {ratingSuccess && (
                <p className="text-sm font-medium text-fg inline-flex items-center gap-1.5 justify-center">
                  <IoCheckmarkCircle aria-hidden="true" style={{ color: "var(--color-success)" }} />
                  {ratingSuccess}
                </p>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={closeModal}
                className="flex-1 py-3 rounded-xl border border-border bg-surface-card"
              >
                {dict.cancel}
              </button>

              <button
                disabled={selectedRating < 1 || isSubmitting}
                onClick={() => submitRating(selectedRating)}
                className="flex-1 py-3 rounded-xl font-semibold bg-action text-action-fg disabled:opacity-50"
              >
                {isSubmitting ? dict.saving : dict.submit}
              </button>
            </div>

            {onSkip && (
              <button
                onClick={handleSkip}
                disabled={isSubmitting}
                className="mt-4 mx-auto block text-sm text-fg-muted hover:text-fg underline disabled:opacity-50"
              >
                {dict.skipRating}
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
}

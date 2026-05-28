"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { IoAdd, IoBookmark, IoCheckmarkCircle, IoCheckmarkCircleOutline } from "react-icons/io5";
import type { Dictionary } from "@/app/[lang]/dictionaries";

type WatchlistDict = Dictionary["watchlist"];

type Props = {
  tmdbId: number;
  mediaType: "movie" | "tv";
  isAuthed: boolean;
  lang: string;
  dict: WatchlistDict;
  initiallyInWatchlist?: boolean;
  initiallyWatched?: boolean;
  showAddToWatchlist?: boolean;
  showMarkWatched?: boolean;
};

const ICON_BUTTON_BASE =
  "w-8 h-8 rounded-full inline-flex items-center justify-center text-sm border backdrop-blur-sm transition-colors disabled:opacity-50";
const ICON_GREY = `${ICON_BUTTON_BASE} bg-white/15 border-white/20 text-white hover:bg-white/25`;
const ICON_GOLD = `${ICON_BUTTON_BASE} bg-action text-action-fg border-transparent hover:bg-action-hover`;

function stop(e: React.MouseEvent) {
  e.preventDefault();
  e.stopPropagation();
}

export default function CardActions({
  tmdbId,
  mediaType,
  isAuthed,
  lang,
  dict,
  initiallyInWatchlist = false,
  initiallyWatched = false,
  showAddToWatchlist = true,
  showMarkWatched = true,
}: Props) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [inWatchlist, setInWatchlist] = useState(initiallyInWatchlist);
  const [watched, setWatched] = useState(initiallyWatched);
  const [busy, setBusy] = useState(false);

  async function toggleWatchlist(e: React.MouseEvent) {
    stop(e);
    if (busy) return;
    if (!isAuthed) {
      router.push(`/${lang}/login`);
      return;
    }

    const target = !inWatchlist;
    setBusy(true);
    setInWatchlist(target);

    try {
      const res = await fetch("/api/watchlist", {
        method: target ? "POST" : "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tmdbId, mediaType }),
      });
      const okEvenIfDuplicate = target && res.status === 409;
      if (!res.ok && !okEvenIfDuplicate) {
        throw new Error("api failure");
      }
      toast.success(target ? dict.addedToast : dict.removedToast);
      startTransition(() => router.refresh());
    } catch {
      setInWatchlist(!target);
      toast.error(target ? dict.addError : dict.removeError);
    } finally {
      setBusy(false);
    }
  }

  async function toggleWatched(e: React.MouseEvent) {
    stop(e);
    if (busy) return;
    if (!isAuthed) {
      router.push(`/${lang}/login`);
      return;
    }

    const target = !watched;
    setBusy(true);
    setWatched(target);

    try {
      const res = await fetch("/api/watched", {
        method: target ? "POST" : "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tmdbId, mediaType }),
      });
      if (!res.ok) throw new Error("api failure");

      if (target) {
        // POST /api/watched also clears any matching WatchlistItem in a tx.
        // Reflect that here so the add-to-watchlist icon hides immediately.
        setInWatchlist(false);
      }
      toast.success(target ? dict.markedToast : dict.unmarkedToast);
      startTransition(() => router.refresh());
    } catch {
      setWatched(!target);
      toast.error(target ? dict.markedError : dict.unmarkError);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      {showAddToWatchlist && !watched && (
        <button
          type="button"
          onClick={toggleWatchlist}
          disabled={busy}
          aria-label={inWatchlist ? dict.inWatchlist : dict.addToWatchlist}
          title={inWatchlist ? dict.inWatchlist : dict.addToWatchlist}
          className={inWatchlist ? ICON_GOLD : ICON_GREY}
        >
          {inWatchlist ? <IoBookmark aria-hidden="true" /> : <IoAdd aria-hidden="true" />}
        </button>
      )}
      {showMarkWatched && (
        <button
          type="button"
          onClick={toggleWatched}
          disabled={busy}
          aria-label={watched ? dict.unmarkWatched : dict.markWatched}
          title={watched ? dict.unmarkWatched : dict.markWatched}
          className={watched ? ICON_GOLD : ICON_GREY}
        >
          {watched ? (
            <IoCheckmarkCircle aria-hidden="true" />
          ) : (
            <IoCheckmarkCircleOutline aria-hidden="true" />
          )}
        </button>
      )}
    </>
  );
}

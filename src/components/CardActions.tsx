"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { IoAdd, IoBookmark, IoCheckmarkCircle, IoCloseCircle, IoTrash } from "react-icons/io5";
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
  showRemoveFromWatchlist?: boolean;
  showUnmarkWatched?: boolean;
};

const ICON_BUTTON_BASE =
  "w-8 h-8 rounded-full inline-flex items-center justify-center text-sm border backdrop-blur-sm transition-colors disabled:opacity-50";
const ICON_DEFAULT = `${ICON_BUTTON_BASE} bg-white/15 border-white/20 text-white hover:bg-white/25`;
const ICON_ACTIVE = `${ICON_BUTTON_BASE} bg-action text-action-fg border-transparent`;
const ICON_DANGER = `${ICON_BUTTON_BASE} bg-red-500/80 border-red-400/30 text-white hover:bg-red-500`;

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
  showRemoveFromWatchlist = false,
  showUnmarkWatched = false,
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

  async function markWatched(e: React.MouseEvent) {
    stop(e);
    if (busy || watched) return;
    if (!isAuthed) {
      router.push(`/${lang}/login`);
      return;
    }

    setBusy(true);
    setWatched(true);

    try {
      const res = await fetch("/api/watched", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tmdbId, mediaType }),
      });
      if (!res.ok) throw new Error("api failure");

      setInWatchlist(false);
      toast.success(dict.markedToast);
      startTransition(() => router.refresh());
    } catch {
      setWatched(false);
      toast.error(dict.markedError);
    } finally {
      setBusy(false);
    }
  }

  async function unmarkWatched(e: React.MouseEvent) {
    stop(e);
    if (busy) return;

    setBusy(true);
    setWatched(false);

    try {
      const res = await fetch("/api/watched", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tmdbId, mediaType }),
      });
      if (!res.ok) throw new Error("api failure");
      toast.success(dict.unmarkedToast);
      startTransition(() => router.refresh());
    } catch {
      setWatched(true);
      toast.error(dict.unmarkError);
    } finally {
      setBusy(false);
    }
  }

  async function removeFromWatchlist(e: React.MouseEvent) {
    stop(e);
    if (busy) return;

    setBusy(true);

    try {
      const res = await fetch("/api/watchlist", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tmdbId, mediaType }),
      });
      if (!res.ok) throw new Error("api failure");
      toast.success(dict.removedToast);
      startTransition(() => router.refresh());
    } catch {
      toast.error(dict.removeError);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      {showAddToWatchlist && (
        <button
          type="button"
          onClick={toggleWatchlist}
          disabled={busy}
          aria-label={inWatchlist ? dict.inWatchlist : dict.addToWatchlist}
          title={inWatchlist ? dict.inWatchlist : dict.addToWatchlist}
          className={inWatchlist ? ICON_ACTIVE : ICON_DEFAULT}
        >
          {inWatchlist ? <IoBookmark aria-hidden="true" /> : <IoAdd aria-hidden="true" />}
        </button>
      )}
      {showMarkWatched && (
        <button
          type="button"
          onClick={markWatched}
          disabled={busy || watched}
          aria-label={dict.markWatched}
          title={dict.markWatched}
          className={watched ? ICON_ACTIVE : ICON_DEFAULT}
        >
          <IoCheckmarkCircle aria-hidden="true" />
        </button>
      )}
      {showUnmarkWatched && (
        <button
          type="button"
          onClick={unmarkWatched}
          disabled={busy}
          aria-label={dict.unmarkWatched}
          title={dict.unmarkWatched}
          className={ICON_DEFAULT}
        >
          <IoCloseCircle aria-hidden="true" />
        </button>
      )}
      {showRemoveFromWatchlist && (
        <button
          type="button"
          onClick={removeFromWatchlist}
          disabled={busy}
          aria-label={dict.remove}
          title={dict.remove}
          className={ICON_DANGER}
        >
          <IoTrash aria-hidden="true" />
        </button>
      )}
    </>
  );
}

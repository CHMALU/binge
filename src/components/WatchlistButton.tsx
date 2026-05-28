"use client";

import Link from "next/link";
import { useState } from "react";
import toast from "react-hot-toast";
import { IoAdd, IoBookmark, IoBookmarkOutline } from "react-icons/io5";
import type { AddWatchlistRequest, DeleteWatchlistRequest } from "@/types/watchlist";

export type WatchlistDict = {
  addToWatchlist: string;
  inWatchlist: string;
  signInToSave: string;
  addError: string;
  addedToast: string;
  removedToast: string;
  removeError: string;
  markedToast: string;
  markedError: string;
};

type Props = {
  tmdbId: number;
  mediaType: "movie" | "tv";
  lang: string;
  isAuthed: boolean;
  initiallyInWatchlist: boolean;
  t: WatchlistDict;
};

const baseClasses =
  "w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-colors";

export default function WatchlistButton({
  tmdbId,
  mediaType,
  lang,
  isAuthed,
  initiallyInWatchlist,
  t,
}: Props) {
  const [inWatchlist, setInWatchlist] = useState(initiallyInWatchlist);
  const [loading, setLoading] = useState(false);

  if (!isAuthed) {
    return (
      <Link
        href={`/${lang}/login`}
        className={`${baseClasses} border bg-surface-card border-border text-fg`}
      >
        <IoBookmarkOutline aria-hidden="true" />
        {t.signInToSave}
      </Link>
    );
  }

  async function handleAdd() {
    setLoading(true);
    try {
      const body: AddWatchlistRequest = { tmdbId, mediaType };
      const res = await fetch("/api/watchlist", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        setInWatchlist(true);
        toast.success(t.addedToast);
      } else {
        toast.error(t.addError);
      }
    } catch {
      toast.error(t.addError);
    } finally {
      setLoading(false);
    }
  }

  async function handleRemove() {
    setLoading(true);
    setInWatchlist(false);
    try {
      const body: DeleteWatchlistRequest = { tmdbId, mediaType };
      const res = await fetch("/api/watchlist", {
        method: "DELETE",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        toast.success(t.removedToast);
      } else {
        setInWatchlist(true);
        toast.error(t.removeError);
      }
    } catch {
      setInWatchlist(true);
      toast.error(t.removeError);
    } finally {
      setLoading(false);
    }
  }

  if (inWatchlist) {
    return (
      <button
        type="button"
        onClick={handleRemove}
        disabled={loading}
        className={`${baseClasses} bg-surface-card text-fg border border-border hover:bg-surface-hover disabled:opacity-60`}
      >
        <IoBookmark aria-hidden="true" />
        {t.inWatchlist}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleAdd}
      disabled={loading}
      className={`${baseClasses} bg-action text-action-fg disabled:opacity-60`}
    >
      <IoAdd aria-hidden="true" />
      {t.addToWatchlist}
    </button>
  );
}

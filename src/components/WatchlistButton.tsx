"use client";

import Link from "next/link";
import { useState } from "react";
import toast from "react-hot-toast";
import { IoAdd, IoBookmark, IoBookmarkOutline } from "react-icons/io5";
import type { AddWatchlistRequest } from "@/types/watchlist";

export type WatchlistDict = {
  addToWatchlist: string;
  inWatchlist: string;
  signInToSave: string;
  addError: string;
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

  if (inWatchlist) {
    return (
      <button
        type="button"
        disabled
        className={`${baseClasses} bg-surface-card text-fg-muted border border-border cursor-not-allowed`}
      >
        <IoBookmark aria-hidden="true" />
        {t.inWatchlist}
      </button>
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
      } else {
        toast.error(t.addError);
      }
    } catch {
      toast.error(t.addError);
    } finally {
      setLoading(false);
    }
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

"use client";

import { useState } from "react";
import WatchlistButton, { type WatchlistDict } from "@/components/WatchlistButton";
import MarkWatchedButton from "@/components/MarkWatchedButton";
import type { Dictionary } from "@/app/[lang]/dictionaries";

type DetailDict = Dictionary["detail"];

/**
 * Coordinates the watchlist + mark-watched buttons on the detail page so they
 * behave like the home cards: marking a title watched clears it from the
 * watchlist (the server does this in a transaction), so the watchlist button
 * is hidden once watched and reappears as "Add" after unmarking.
 */
export default function DetailActions({
  tmdbId,
  mediaType,
  lang,
  isAuthed,
  title,
  dict,
  watchlistDict,
  initiallyInWatchlist,
  initiallyWatched,
}: {
  tmdbId: number;
  mediaType: "movie" | "tv";
  lang: string;
  isAuthed: boolean;
  title: string;
  dict: DetailDict;
  watchlistDict: WatchlistDict;
  initiallyInWatchlist: boolean;
  initiallyWatched: boolean;
}) {
  const [watched, setWatched] = useState(initiallyWatched);

  return (
    <div className="flex flex-col gap-2.5 mt-6">
      {!watched && (
        <WatchlistButton
          tmdbId={tmdbId}
          mediaType={mediaType}
          lang={lang}
          isAuthed={isAuthed}
          initiallyInWatchlist={initiallyInWatchlist}
          t={watchlistDict}
        />
      )}
      <MarkWatchedButton
        tmdbId={tmdbId}
        mediaType={mediaType}
        title={title}
        isAuthed={isAuthed}
        lang={lang}
        dict={dict}
        watchlistDict={{
          markedToast: watchlistDict.markedToast,
          markedError: watchlistDict.markedError,
          unmarkedToast: watchlistDict.unmarkedToast,
          unmarkError: watchlistDict.unmarkError,
        }}
        initiallyWatched={watched}
        onWatchedChange={setWatched}
      />
    </div>
  );
}

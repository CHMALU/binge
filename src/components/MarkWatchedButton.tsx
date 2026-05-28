"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { IoCheckmarkCircle } from "react-icons/io5";
import RatingModal from "./RatingModal";
import type { Dictionary } from "@/app/[lang]/dictionaries";

type DetailDict = Dictionary["detail"];

type Props = {
  tmdbId: number;
  mediaType: "movie" | "tv";
  title: string;
  isAuthed: boolean;
  lang: string;
  dict: DetailDict;
  watchlistDict: {
    markedToast: string;
    markedError: string;
    unmarkedToast: string;
    unmarkError: string;
  };
  initiallyWatched?: boolean;
};

export default function MarkWatchedButton({
  tmdbId,
  mediaType,
  title,
  isAuthed,
  lang,
  dict,
  watchlistDict,
}: Props) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  async function postWatched(rating: number | null) {
    try {
      const res = await fetch("/api/watched", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tmdbId, mediaType, rating }),
      });
      if (!res.ok) {
        return { ok: false, error: watchlistDict.markedError };
      }
      return { ok: true };
    } catch {
      return { ok: false, error: watchlistDict.markedError };
    }
  }

  function onSuccess() {
    toast.success(watchlistDict.markedToast);
    startTransition(() => router.refresh());
  }

  return (
    <RatingModal
      tmdbId={tmdbId}
      mediaType={mediaType}
      title={title}
      dict={dict}
      isAuthed={isAuthed}
      lang={lang}
      onSubmit={(stars) => postWatched(stars)}
      onSkip={() => postWatched(null)}
      onSuccess={onSuccess}
      triggerLabel={dict.markWatched}
      triggerIcon={<IoCheckmarkCircle aria-hidden="true" className="me-2 inline-block align-middle" />}
      triggerClassName="w-full py-3 rounded-xl text-sm font-semibold border transition-all bg-surface-card border-border text-fg hover:bg-white/10 inline-flex items-center justify-center gap-2"
      dialogTitle={dict.howWouldYouRate}
    />
  );
}

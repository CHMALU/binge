"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { IoTrash } from "react-icons/io5";
import type { DeleteWatchlistRequest } from "@/types/watchlist";

type Props = {
  tmdbId: number;
  mediaType: "movie" | "tv";
  t: {
    remove: string;
    removedToast: string;
    removeError: string;
  };
};

export default function RemoveFromWatchlistButton({ tmdbId, mediaType, t }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    try {
      const body: DeleteWatchlistRequest = { tmdbId, mediaType };
      const res = await fetch("/api/watchlist", {
        method: "DELETE",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        toast.success(t.removedToast);
        router.refresh();
      } else {
        toast.error(t.removeError);
      }
    } catch {
      toast.error(t.removeError);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      aria-label={t.remove}
      className="absolute top-2 end-2 z-10 w-9 h-9 rounded-full bg-surface/80 backdrop-blur-md border border-border flex items-center justify-center text-fg hover:bg-surface-hover transition-colors disabled:opacity-50"
    >
      <IoTrash aria-hidden="true" size={16} />
    </button>
  );
}

// Shared API contract for US11 mark-as-watched.

export type WatchedItemDTO = {
  tmdbId: number;
  mediaType: "movie" | "tv";
  watchedAt: string; // ISO 8601
  rating: number | null;
};

export type MarkWatchedRequest = {
  tmdbId: number;
  mediaType: "movie" | "tv";
  rating?: number | null;
};

export type MarkWatchedResponse =
  | { success: true; item: WatchedItemDTO }
  | { error: string };

export type GetWatchedResponse =
  | { items: WatchedItemDTO[] }
  | { error: string };

export type UnmarkWatchedRequest = {
  tmdbId: number;
  mediaType: "movie" | "tv";
};

export type DeleteWatchedResponse =
  | { success: true }
  | { error: string };

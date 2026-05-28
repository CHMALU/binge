// Shared API contract for US9 (POST) and US10 (GET).
// Do not change without coordinating with the other US's branch.

export type WatchlistItemDTO = {
  tmdbId: number;
  mediaType: "movie" | "tv";
  addedAt: string; // ISO 8601
};

export type AddWatchlistRequest = {
  tmdbId: number;
  mediaType: "movie" | "tv";
};

export type AddWatchlistResponse =
  | { success: true; item: WatchlistItemDTO }
  | { error: string };

export type GetWatchlistResponse =
  | { items: WatchlistItemDTO[] }
  | { error: string };

export type DeleteWatchlistRequest = {
  tmdbId: number;
  mediaType: "movie" | "tv";
};

export type DeleteWatchlistResponse =
  | { success: true }
  | { error: string };

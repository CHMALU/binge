import { prisma } from "@/lib/prisma";

export type ItemMediaType = "movie" | "tv";

export function makeItemKey(tmdbId: number, mediaType: ItemMediaType): string {
  return `${mediaType}-${tmdbId}`;
}

export type UserItemSets = {
  watchlistKeys: Set<string>;
  watchedKeys: Set<string>;
};

export async function getUserItemSets(userId: string): Promise<UserItemSets> {
  const [watchlistRows, watchedRows] = await Promise.all([
    prisma.watchlistItem.findMany({
      where: { userId },
      select: { tmdbId: true, mediaType: true },
    }),
    prisma.watchedItem.findMany({
      where: { userId },
      select: { tmdbId: true, mediaType: true },
    }),
  ]);

  const watchlistKeys = new Set(
    watchlistRows.map((r) => makeItemKey(r.tmdbId, r.mediaType as ItemMediaType)),
  );
  const watchedKeys = new Set(
    watchedRows.map((r) => makeItemKey(r.tmdbId, r.mediaType as ItemMediaType)),
  );

  return { watchlistKeys, watchedKeys };
}

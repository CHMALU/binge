/**
 * @jest-environment node
 */

import { getUserItemSets, makeItemKey } from "./userSets";

jest.mock("@/lib/prisma", () => ({
  prisma: {
    watchlistItem: { findMany: jest.fn() },
    watchedItem: { findMany: jest.fn() },
  },
}));

import { prisma } from "@/lib/prisma";

const mockedWatchlist = (prisma as unknown as { watchlistItem: { findMany: jest.Mock } }).watchlistItem.findMany;
const mockedWatched = (prisma as unknown as { watchedItem: { findMany: jest.Mock } }).watchedItem.findMany;

describe("makeItemKey", () => {
  it("formats a key as `${mediaType}-${tmdbId}`", () => {
    expect(makeItemKey(27205, "movie")).toBe("movie-27205");
    expect(makeItemKey(1399, "tv")).toBe("tv-1399");
  });
});

describe("getUserItemSets", () => {
  beforeEach(() => jest.clearAllMocks());

  it("queries Prisma in parallel and returns two Sets keyed by mediaType-tmdbId", async () => {
    mockedWatchlist.mockResolvedValue([
      { tmdbId: 27205, mediaType: "movie" },
      { tmdbId: 1399, mediaType: "tv" },
    ]);
    mockedWatched.mockResolvedValue([
      { tmdbId: 999, mediaType: "movie" },
    ]);

    const { watchlistKeys, watchedKeys } = await getUserItemSets("user-1");

    expect(mockedWatchlist).toHaveBeenCalledWith({
      where: { userId: "user-1" },
      select: { tmdbId: true, mediaType: true },
    });
    expect(mockedWatched).toHaveBeenCalledWith({
      where: { userId: "user-1" },
      select: { tmdbId: true, mediaType: true },
    });

    expect(watchlistKeys.has("movie-27205")).toBe(true);
    expect(watchlistKeys.has("tv-1399")).toBe(true);
    expect(watchlistKeys.has("movie-999")).toBe(false);

    expect(watchedKeys.has("movie-999")).toBe(true);
    expect(watchedKeys.has("movie-27205")).toBe(false);
  });

  it("returns empty sets when the user has nothing on either list", async () => {
    mockedWatchlist.mockResolvedValue([]);
    mockedWatched.mockResolvedValue([]);

    const { watchlistKeys, watchedKeys } = await getUserItemSets("user-1");

    expect(watchlistKeys.size).toBe(0);
    expect(watchedKeys.size).toBe(0);
  });
});

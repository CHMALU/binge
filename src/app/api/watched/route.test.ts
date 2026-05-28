/**
 * @jest-environment node
 */

import { DELETE, GET, POST } from "./route";

jest.mock("@/auth", () => ({ auth: jest.fn() }));
jest.mock("@/lib/prisma", () => ({
  prisma: {
    watchedItem: { upsert: jest.fn(), findMany: jest.fn(), deleteMany: jest.fn() },
    watchlistItem: { deleteMany: jest.fn() },
    rating: { upsert: jest.fn() },
    $transaction: jest.fn(),
  },
}));

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const mockedAuth = auth as unknown as jest.Mock;
const mockedUpsertWatched = (prisma as unknown as { watchedItem: { upsert: jest.Mock } }).watchedItem.upsert;
const mockedFindManyWatched = (prisma as unknown as { watchedItem: { findMany: jest.Mock } }).watchedItem.findMany;
const mockedDeleteManyWatched = (prisma as unknown as { watchedItem: { deleteMany: jest.Mock } }).watchedItem.deleteMany;
const mockedDeleteManyWatchlist = (prisma as unknown as { watchlistItem: { deleteMany: jest.Mock } }).watchlistItem.deleteMany;
const mockedUpsertRating = (prisma as unknown as { rating: { upsert: jest.Mock } }).rating.upsert;
const mockedTransaction = (prisma as unknown as { $transaction: jest.Mock }).$transaction;

function makeRequest(body: unknown, method = "POST"): Request {
  return new Request("http://localhost/api/watched", {
    method,
    body: typeof body === "string" ? body : JSON.stringify(body),
    headers: { "content-type": "application/json" },
  });
}

function makeDeleteRequest(body: unknown): Request {
  return makeRequest(body, "DELETE");
}

describe("POST /api/watched", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // The DB ops return sentinel values so we can assert which array goes into $transaction.
    mockedUpsertWatched.mockReturnValue("upsert-watched-op");
    mockedDeleteManyWatchlist.mockReturnValue("delete-watchlist-op");
    mockedUpsertRating.mockReturnValue("upsert-rating-op");
  });

  it("returns 401 when there is no session", async () => {
    mockedAuth.mockResolvedValue(null);

    const res = await POST(makeRequest({ tmdbId: 1, mediaType: "movie" }) as never);

    expect(res.status).toBe(401);
    expect(mockedTransaction).not.toHaveBeenCalled();
  });

  it("returns 400 when the body is not valid JSON", async () => {
    mockedAuth.mockResolvedValue({ user: { id: "u-1" } });
    const req = new Request("http://localhost/api/watched", {
      method: "POST",
      body: "not-json",
      headers: { "content-type": "application/json" },
    });

    const res = await POST(req as never);

    expect(res.status).toBe(400);
    expect(mockedTransaction).not.toHaveBeenCalled();
  });

  it("returns 400 when mediaType is invalid", async () => {
    mockedAuth.mockResolvedValue({ user: { id: "u-1" } });

    const res = await POST(makeRequest({ tmdbId: 1, mediaType: "film" }) as never);

    expect(res.status).toBe(400);
    expect(mockedTransaction).not.toHaveBeenCalled();
  });

  it("returns 400 when tmdbId is not an integer", async () => {
    mockedAuth.mockResolvedValue({ user: { id: "u-1" } });

    const res = await POST(makeRequest({ tmdbId: "abc", mediaType: "movie" }) as never);

    expect(res.status).toBe(400);
    expect(mockedTransaction).not.toHaveBeenCalled();
  });

  it("returns 400 when rating is outside 1..5", async () => {
    mockedAuth.mockResolvedValue({ user: { id: "u-1" } });

    const res = await POST(makeRequest({ tmdbId: 1, mediaType: "movie", rating: 7 }) as never);

    expect(res.status).toBe(400);
    expect(mockedTransaction).not.toHaveBeenCalled();
  });

  it("returns 400 when rating is not an integer", async () => {
    mockedAuth.mockResolvedValue({ user: { id: "u-1" } });

    const res = await POST(makeRequest({ tmdbId: 1, mediaType: "movie", rating: "5" }) as never);

    expect(res.status).toBe(400);
    expect(mockedTransaction).not.toHaveBeenCalled();
  });

  it("returns 200 + item when marking WITHOUT rating; transaction has 2 ops, Rating untouched", async () => {
    mockedAuth.mockResolvedValue({ user: { id: "u-1" } });
    const watchedAt = new Date("2026-05-28T10:00:00.000Z");
    mockedTransaction.mockResolvedValue([
      { id: "w1", userId: "u-1", tmdbId: 27205, mediaType: "movie", watchedAt, rating: null },
      { count: 1 },
    ]);

    const res = await POST(makeRequest({ tmdbId: 27205, mediaType: "movie" }) as never);

    expect(res.status).toBe(200);

    expect(mockedUpsertWatched).toHaveBeenCalledWith({
      where: { userId_tmdbId_mediaType: { userId: "u-1", tmdbId: 27205, mediaType: "movie" } },
      update: { rating: null, watchedAt: expect.any(Date) },
      create: { userId: "u-1", tmdbId: 27205, mediaType: "movie", rating: null },
    });
    expect(mockedDeleteManyWatchlist).toHaveBeenCalledWith({
      where: { userId: "u-1", tmdbId: 27205, mediaType: "movie" },
    });
    expect(mockedUpsertRating).not.toHaveBeenCalled();
    expect(mockedTransaction).toHaveBeenCalledWith([
      "upsert-watched-op",
      "delete-watchlist-op",
    ]);

    const body = await res.json();
    expect(body).toEqual({
      success: true,
      item: {
        tmdbId: 27205,
        mediaType: "movie",
        watchedAt: watchedAt.toISOString(),
        rating: null,
      },
    });
  });

  it("returns 200 + item AND syncs rating to BOTH WatchedItem.rating + Rating.stars", async () => {
    mockedAuth.mockResolvedValue({ user: { id: "u-1" } });
    const watchedAt = new Date("2026-05-28T10:00:00.000Z");
    mockedTransaction.mockResolvedValue([
      { id: "w1", userId: "u-1", tmdbId: 1399, mediaType: "tv", watchedAt, rating: 5 },
      { count: 0 },
      { id: "r1", userId: "u-1", tmdbId: 1399, mediaType: "tv", stars: 5 },
    ]);

    const res = await POST(makeRequest({ tmdbId: 1399, mediaType: "tv", rating: 5 }) as never);

    expect(res.status).toBe(200);

    expect(mockedUpsertWatched).toHaveBeenCalledWith({
      where: { userId_tmdbId_mediaType: { userId: "u-1", tmdbId: 1399, mediaType: "tv" } },
      update: { rating: 5, watchedAt: expect.any(Date) },
      create: { userId: "u-1", tmdbId: 1399, mediaType: "tv", rating: 5 },
    });
    expect(mockedUpsertRating).toHaveBeenCalledWith({
      where: { userId_tmdbId_mediaType: { userId: "u-1", tmdbId: 1399, mediaType: "tv" } },
      update: { stars: 5 },
      create: { userId: "u-1", tmdbId: 1399, mediaType: "tv", stars: 5 },
    });
    expect(mockedTransaction).toHaveBeenCalledWith([
      "upsert-watched-op",
      "delete-watchlist-op",
      "upsert-rating-op",
    ]);

    const body = await res.json();
    expect(body.item.rating).toBe(5);
  });

  it("is idempotent: re-marking same title returns 200 (upsert semantics)", async () => {
    mockedAuth.mockResolvedValue({ user: { id: "u-1" } });
    const watchedAt = new Date("2026-05-28T11:00:00.000Z");
    mockedTransaction.mockResolvedValue([
      { id: "w1", userId: "u-1", tmdbId: 27205, mediaType: "movie", watchedAt, rating: 4 },
      { count: 0 }, // wasn't on the watchlist this time — that's fine
      { id: "r1", userId: "u-1", tmdbId: 27205, mediaType: "movie", stars: 4 },
    ]);

    const res = await POST(makeRequest({ tmdbId: 27205, mediaType: "movie", rating: 4 }) as never);

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
  });
});

describe("GET /api/watched", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns 401 when there is no session", async () => {
    mockedAuth.mockResolvedValue(null);

    const res = await GET();

    expect(res.status).toBe(401);
    expect(mockedFindManyWatched).not.toHaveBeenCalled();
  });

  it("returns empty items[] when the user has nothing watched", async () => {
    mockedAuth.mockResolvedValue({ user: { id: "u-1" } });
    mockedFindManyWatched.mockResolvedValue([]);

    const res = await GET();
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toEqual({ items: [] });
    expect(mockedFindManyWatched).toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId: "u-1" }, orderBy: { watchedAt: "desc" } }),
    );
  });

  it("returns watched items as DTOs sorted by watchedAt desc", async () => {
    const newer = new Date("2026-05-25T10:00:00.000Z");
    const older = new Date("2026-05-15T08:00:00.000Z");

    mockedAuth.mockResolvedValue({ user: { id: "u-1" } });
    mockedFindManyWatched.mockResolvedValue([
      { id: "w1", userId: "u-1", tmdbId: 27205, mediaType: "movie", watchedAt: newer, rating: 5 },
      { id: "w2", userId: "u-1", tmdbId: 1399, mediaType: "tv", watchedAt: older, rating: null },
    ]);

    const res = await GET();
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toEqual({
      items: [
        { tmdbId: 27205, mediaType: "movie", watchedAt: newer.toISOString(), rating: 5 },
        { tmdbId: 1399, mediaType: "tv", watchedAt: older.toISOString(), rating: null },
      ],
    });
  });
});

describe("DELETE /api/watched", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns 401 when there is no session", async () => {
    mockedAuth.mockResolvedValue(null);

    const res = await DELETE(makeDeleteRequest({ tmdbId: 1, mediaType: "movie" }) as never);

    expect(res.status).toBe(401);
    expect(mockedDeleteManyWatched).not.toHaveBeenCalled();
  });

  it("returns 400 when body is not valid JSON", async () => {
    mockedAuth.mockResolvedValue({ user: { id: "u-1" } });
    const req = new Request("http://localhost/api/watched", {
      method: "DELETE",
      body: "not-json",
      headers: { "content-type": "application/json" },
    });

    const res = await DELETE(req as never);

    expect(res.status).toBe(400);
    expect(mockedDeleteManyWatched).not.toHaveBeenCalled();
  });

  it("returns 400 when mediaType is invalid", async () => {
    mockedAuth.mockResolvedValue({ user: { id: "u-1" } });

    const res = await DELETE(makeDeleteRequest({ tmdbId: 1, mediaType: "film" }) as never);

    expect(res.status).toBe(400);
    expect(mockedDeleteManyWatched).not.toHaveBeenCalled();
  });

  it("returns 400 when tmdbId is missing", async () => {
    mockedAuth.mockResolvedValue({ user: { id: "u-1" } });

    const res = await DELETE(makeDeleteRequest({ mediaType: "movie" }) as never);

    expect(res.status).toBe(400);
    expect(mockedDeleteManyWatched).not.toHaveBeenCalled();
  });

  it("returns 200 + success and calls deleteMany with composite where on success", async () => {
    mockedAuth.mockResolvedValue({ user: { id: "u-1" } });
    mockedDeleteManyWatched.mockResolvedValue({ count: 1 });

    const res = await DELETE(makeDeleteRequest({ tmdbId: 27205, mediaType: "movie" }) as never);

    expect(res.status).toBe(200);
    expect(mockedDeleteManyWatched).toHaveBeenCalledWith({
      where: { userId: "u-1", tmdbId: 27205, mediaType: "movie" },
    });

    const body = await res.json();
    expect(body).toEqual({ success: true });
  });

  it("is idempotent: returns 200 when there was no row to delete (deleteMany count=0)", async () => {
    mockedAuth.mockResolvedValue({ user: { id: "u-1" } });
    mockedDeleteManyWatched.mockResolvedValue({ count: 0 });

    const res = await DELETE(makeDeleteRequest({ tmdbId: 999, mediaType: "movie" }) as never);

    expect(res.status).toBe(200);
  });
});

/**
 * @jest-environment node
 */

import { GET, POST } from "./route";

jest.mock("@/auth", () => ({ auth: jest.fn() }));
jest.mock("@/lib/prisma", () => ({
  prisma: {
    watchlistItem: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
  },
}));

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const mockedAuth = auth as unknown as jest.Mock;
const mockedCreate = (prisma as unknown as { watchlistItem: { create: jest.Mock } }).watchlistItem.create;
const mockedFindMany = (prisma as unknown as { watchlistItem: { findMany: jest.Mock } }).watchlistItem.findMany;

function makeRequest(body: unknown): Request {
  return new Request("http://localhost/api/watchlist", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "content-type": "application/json" },
  });
}

describe("POST /api/watchlist", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns 401 when no session is present", async () => {
    mockedAuth.mockResolvedValue(null);

    const res = await POST(makeRequest({ tmdbId: 1, mediaType: "movie" }) as never);

    expect(res.status).toBe(401);
    expect(mockedCreate).not.toHaveBeenCalled();
  });

  it("returns 201 with the created item on success", async () => {
    mockedAuth.mockResolvedValue({ user: { id: "user-1" } });
    mockedCreate.mockResolvedValue({
      id: "row-1",
      userId: "user-1",
      tmdbId: 27205,
      mediaType: "movie",
      addedAt: new Date("2026-05-27T12:00:00.000Z"),
    });

    const res = await POST(makeRequest({ tmdbId: 27205, mediaType: "movie" }) as never);

    expect(res.status).toBe(201);
    expect(mockedCreate).toHaveBeenCalledWith({ data: { userId: "user-1", tmdbId: 27205, mediaType: "movie" } });

    const body = await res.json();
    expect(body).toEqual({
      success: true,
      item: {
        tmdbId: 27205,
        mediaType: "movie",
        addedAt: "2026-05-27T12:00:00.000Z",
      },
    });
  });

  it("returns 409 when the item already exists (Prisma P2002)", async () => {
    mockedAuth.mockResolvedValue({ user: { id: "user-1" } });
    const dupe = Object.assign(new Error("unique constraint"), { code: "P2002" });
    mockedCreate.mockRejectedValue(dupe);

    const res = await POST(makeRequest({ tmdbId: 1, mediaType: "movie" }) as never);

    expect(res.status).toBe(409);
  });

  it("returns 400 when mediaType is invalid", async () => {
    mockedAuth.mockResolvedValue({ user: { id: "user-1" } });

    const res = await POST(makeRequest({ tmdbId: 1, mediaType: "foo" }) as never);

    expect(res.status).toBe(400);
    expect(mockedCreate).not.toHaveBeenCalled();
  });

  it("returns 400 when tmdbId is not an integer", async () => {
    mockedAuth.mockResolvedValue({ user: { id: "user-1" } });

    const res = await POST(makeRequest({ tmdbId: "abc", mediaType: "movie" }) as never);

    expect(res.status).toBe(400);
    expect(mockedCreate).not.toHaveBeenCalled();
  });
});

describe("GET /api/watchlist", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns 401 when there is no session", async () => {
    mockedAuth.mockResolvedValue(null);

    const res = await GET();

    expect(res.status).toBe(401);
    expect(mockedFindMany).not.toHaveBeenCalled();
  });

  it("returns 401 when session has no user id", async () => {
    mockedAuth.mockResolvedValue({ user: {} });

    const res = await GET();

    expect(res.status).toBe(401);
  });

  it("returns empty items array when the user has nothing on the list", async () => {
    mockedAuth.mockResolvedValue({ user: { id: "u-1" } });
    mockedFindMany.mockResolvedValue([]);

    const res = await GET();
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toEqual({ items: [] });
    expect(mockedFindMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId: "u-1" }, orderBy: { addedAt: "desc" } }),
    );
  });

  it("returns watchlist items sorted by addedAt desc as DTOs", async () => {
    const newer = new Date("2026-05-20T10:00:00.000Z");
    const older = new Date("2026-05-10T08:00:00.000Z");

    mockedAuth.mockResolvedValue({ user: { id: "u-1" } });
    mockedFindMany.mockResolvedValue([
      { id: "w1", userId: "u-1", tmdbId: 27205, mediaType: "movie", addedAt: newer },
      { id: "w2", userId: "u-1", tmdbId: 1399, mediaType: "tv", addedAt: older },
    ]);

    const res = await GET();
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toEqual({
      items: [
        { tmdbId: 27205, mediaType: "movie", addedAt: newer.toISOString() },
        { tmdbId: 1399, mediaType: "tv", addedAt: older.toISOString() },
      ],
    });
  });
});


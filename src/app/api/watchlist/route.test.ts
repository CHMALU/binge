/**
 * @jest-environment node
 */
import { GET } from "./route";

jest.mock("@/auth", () => ({ auth: jest.fn() }));
jest.mock("@/lib/prisma", () => ({
  prisma: { watchlistItem: { findMany: jest.fn() } },
}));

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const mockedAuth = auth as unknown as jest.Mock;
const mockedFindMany = prisma.watchlistItem.findMany as unknown as jest.Mock;

describe("GET /api/watchlist", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

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
      expect.objectContaining({
        where: { userId: "u-1" },
        orderBy: { addedAt: "desc" },
      }),
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

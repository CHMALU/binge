/**
 * @jest-environment node
 */
import { POST } from "./route";

jest.mock("@/auth", () => ({
  auth: jest.fn(),
}));

jest.mock("@/lib/prisma", () => ({
  prisma: {
    watchlistItem: {
      create: jest.fn(),
    },
  },
}));

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const mockedAuth = auth as unknown as jest.Mock;
const mockedCreate = (prisma as unknown as {
  watchlistItem: { create: jest.Mock };
}).watchlistItem.create;

function makeRequest(body: unknown): Request {
  return new Request("http://localhost/api/watchlist", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "content-type": "application/json" },
  });
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe("POST /api/watchlist", () => {
  it("returns 401 when no session is present", async () => {
    mockedAuth.mockResolvedValue(null);

    const res = await POST(
      makeRequest({ tmdbId: 1, mediaType: "movie" }) as never
    );

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

    const res = await POST(
      makeRequest({ tmdbId: 27205, mediaType: "movie" }) as never
    );

    expect(res.status).toBe(201);
    expect(mockedCreate).toHaveBeenCalledWith({
      data: { userId: "user-1", tmdbId: 27205, mediaType: "movie" },
    });

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
    const dupe = Object.assign(new Error("unique constraint"), {
      code: "P2002",
    });
    mockedCreate.mockRejectedValue(dupe);

    const res = await POST(
      makeRequest({ tmdbId: 1, mediaType: "movie" }) as never
    );

    expect(res.status).toBe(409);
  });

  it("returns 400 when mediaType is invalid", async () => {
    mockedAuth.mockResolvedValue({ user: { id: "user-1" } });

    const res = await POST(
      makeRequest({ tmdbId: 1, mediaType: "foo" }) as never
    );

    expect(res.status).toBe(400);
    expect(mockedCreate).not.toHaveBeenCalled();
  });

  it("returns 400 when tmdbId is not an integer", async () => {
    mockedAuth.mockResolvedValue({ user: { id: "user-1" } });

    const res = await POST(
      makeRequest({ tmdbId: "abc", mediaType: "movie" }) as never
    );

    expect(res.status).toBe(400);
    expect(mockedCreate).not.toHaveBeenCalled();
  });
});

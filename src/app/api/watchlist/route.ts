import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import type {
  AddWatchlistRequest,
  AddWatchlistResponse,
} from "@/types/watchlist";

function isValidBody(body: unknown): body is AddWatchlistRequest {
  if (!body || typeof body !== "object") return false;
  const { tmdbId, mediaType } = body as Record<string, unknown>;
  return (
    typeof tmdbId === "number" &&
    Number.isInteger(tmdbId) &&
    (mediaType === "movie" || mediaType === "tv")
  );
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json<AddWatchlistResponse>(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json<AddWatchlistResponse>(
      { error: "Invalid JSON" },
      { status: 400 }
    );
  }

  if (!isValidBody(body)) {
    return NextResponse.json<AddWatchlistResponse>(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }

  try {
    const item = await prisma.watchlistItem.create({
      data: {
        userId: session.user.id,
        tmdbId: body.tmdbId,
        mediaType: body.mediaType,
      },
    });

    return NextResponse.json<AddWatchlistResponse>(
      {
        success: true,
        item: {
          tmdbId: item.tmdbId,
          mediaType: item.mediaType as "movie" | "tv",
          addedAt: item.addedAt.toISOString(),
        },
      },
      { status: 201 }
    );
  } catch (err) {
    if ((err as { code?: string }).code === "P2002") {
      return NextResponse.json<AddWatchlistResponse>(
        { error: "Already in watchlist" },
        { status: 409 }
      );
    }
    throw err;
  }
}

import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import type {
  AddWatchlistRequest,
  AddWatchlistResponse,
  DeleteWatchlistResponse,
  GetWatchlistResponse,
  WatchlistItemDTO,
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

export async function DELETE(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json<DeleteWatchlistResponse>(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json<DeleteWatchlistResponse>(
      { error: "Invalid JSON" },
      { status: 400 }
    );
  }

  if (!isValidBody(body)) {
    return NextResponse.json<DeleteWatchlistResponse>(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }

  try {
    await prisma.watchlistItem.delete({
      where: {
        userId_tmdbId_mediaType: {
          userId: session.user.id,
          tmdbId: body.tmdbId,
          mediaType: body.mediaType,
        },
      },
    });

    return NextResponse.json<DeleteWatchlistResponse>({ success: true });
  } catch (err) {
    if ((err as { code?: string }).code === "P2025") {
      return NextResponse.json<DeleteWatchlistResponse>(
        { error: "Not in watchlist" },
        { status: 404 }
      );
    }
    throw err;
  }
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json<GetWatchlistResponse>(
      { error: "Unauthorized" },
      { status: 401 },
    );
  }

  const rows = await prisma.watchlistItem.findMany({
    where: { userId: session.user.id },
    orderBy: { addedAt: "desc" },
  });

  const items: WatchlistItemDTO[] = rows.map((row) => ({
    tmdbId: row.tmdbId,
    mediaType: row.mediaType,
    addedAt: row.addedAt.toISOString(),
  }));

  return NextResponse.json<GetWatchlistResponse>({ items });
}

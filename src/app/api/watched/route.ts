import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import type {
  GetWatchedResponse,
  MarkWatchedRequest,
  MarkWatchedResponse,
  WatchedItemDTO,
} from "@/types/watched";

function isValidBody(body: unknown): body is MarkWatchedRequest {
  if (!body || typeof body !== "object") return false;
  const { tmdbId, mediaType, rating } = body as Record<string, unknown>;
  if (typeof tmdbId !== "number" || !Number.isInteger(tmdbId)) return false;
  if (mediaType !== "movie" && mediaType !== "tv") return false;
  if (rating === undefined || rating === null) return true;
  return Number.isInteger(rating) && (rating as number) >= 1 && (rating as number) <= 5;
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json<MarkWatchedResponse>(
      { error: "Unauthorized" },
      { status: 401 },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json<MarkWatchedResponse>(
      { error: "Invalid JSON" },
      { status: 400 },
    );
  }

  if (!isValidBody(body)) {
    return NextResponse.json<MarkWatchedResponse>(
      { error: "Invalid request body" },
      { status: 400 },
    );
  }

  const userId = session.user.id;
  const { tmdbId, mediaType } = body;
  const rating = body.rating ?? null;
  const watchedAt = new Date();

  const ops: unknown[] = [
    prisma.watchedItem.upsert({
      where: { userId_tmdbId_mediaType: { userId, tmdbId, mediaType } },
      update: { rating, watchedAt },
      create: { userId, tmdbId, mediaType, rating },
    }),
    prisma.watchlistItem.deleteMany({
      where: { userId, tmdbId, mediaType },
    }),
  ];

  if (rating !== null) {
    ops.push(
      prisma.rating.upsert({
        where: { userId_tmdbId_mediaType: { userId, tmdbId, mediaType } },
        update: { stars: rating },
        create: { userId, tmdbId, mediaType, stars: rating },
      }),
    );
  }

  const results = await prisma.$transaction(ops as never);
  const watched = (results as Array<{ tmdbId: number; mediaType: string; watchedAt: Date; rating: number | null }>)[0];

  return NextResponse.json<MarkWatchedResponse>({
    success: true,
    item: {
      tmdbId: watched.tmdbId,
      mediaType: watched.mediaType as "movie" | "tv",
      watchedAt: watched.watchedAt.toISOString(),
      rating: watched.rating,
    },
  });
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json<GetWatchedResponse>(
      { error: "Unauthorized" },
      { status: 401 },
    );
  }

  const rows = await prisma.watchedItem.findMany({
    where: { userId: session.user.id },
    orderBy: { watchedAt: "desc" },
  });

  const items: WatchedItemDTO[] = rows.map((row) => ({
    tmdbId: row.tmdbId,
    mediaType: row.mediaType as "movie" | "tv",
    watchedAt: row.watchedAt.toISOString(),
    rating: row.rating,
  }));

  return NextResponse.json<GetWatchedResponse>({ items });
}

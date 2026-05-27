import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import type { GetWatchlistResponse, WatchlistItemDTO } from "@/types/watchlist";

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

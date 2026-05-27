import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

const MEDIA_TYPES = ["movie", "tv"] as const;

function isMediaType(value: unknown): value is (typeof MEDIA_TYPES)[number] {
  return typeof value === "string" && MEDIA_TYPES.includes(value as (typeof MEDIA_TYPES)[number]);
}

function isValidRatingInput(tmdbId: unknown, mediaType: unknown, stars: unknown) {
  return (
    Number.isInteger(tmdbId) &&
    Number(tmdbId) > 0 &&
    isMediaType(mediaType) &&
    Number.isInteger(stars) &&
    Number(stars) >= 1 &&
    Number(stars) <= 5
  );
}

export async function POST(req: Request) {
  const session = await auth();

  if (!session?.user?.email) {
    return Response.json(
      { error: "Not authenticated. Please log in to submit a rating." },
      { status: 401 }
    );
  }

  const body = await req.json();

  const { tmdbId, mediaType, stars } = body;

  if (!isValidRatingInput(tmdbId, mediaType, stars)) {
    return Response.json(
      { error: "Invalid rating" },
      { status: 400 }
    );
  }

  const userID = session.user.id;

  if (!userID) {
    return Response.json(
      { error: "No user found with the provided email." },
      { status: 404 }
    );
  }

  await prisma.rating.upsert({
    where: {
      userId_tmdbId_mediaType: {
        userId: userID,
        tmdbId,
        mediaType,
      },
    },
    update: {
      stars,
    },
    create: {
      userId: userID,
      tmdbId,
      mediaType,
      stars,
    },
  });
  return Response.json({ success: true });
}
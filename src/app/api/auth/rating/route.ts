import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";


export async function POST(req: Request) {
  const session = await auth();

  if (!session?.user?.email) {
    return Response.json(
      { error: "Not authenticated. Please log in to submit a rating."},
      { status: 401 }
    );
  }

  const body = await req.json();

  const { tmdbId, mediaType, stars } = body;

  if (stars < 1 || stars > 5) {
    return Response.json(
      { error: "Invalid rating"},
      { status: 400 }
    )
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email, },
  });

  if (!user) {
    return Response.json(
      { error: "No user found with the provided email."},
      { status: 404 }
    )
  }

  await prisma.rating.upsert({
    where: {
      userId_tmdbId_mediaType: {
        userId: user.id,
        tmdbId,
        mediaType,
      },
    },
    update: {
      stars,
    },
    create: {
      userId: user.id,
      tmdbId,
      mediaType,
      stars
    },
  });
  return Response.json({ success: true });
}
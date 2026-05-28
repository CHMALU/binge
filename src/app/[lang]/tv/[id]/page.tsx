import { notFound } from "next/navigation";
import MovieDetail from "@/components/MovieDetail";
import { getTvDetails, getProvidersForLocale } from "@/lib/tmdb";
import { getDictionary, hasLocale } from "../../dictionaries";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export default async function TvPage({
  params,
}: {
  params: Promise<{ lang: string; id: string }>;
}) {
  const { lang, id } = await params;
  if (!hasLocale(lang)) notFound();

  const numericId = Number(id);
  if (!Number.isInteger(numericId) || numericId <= 0) notFound();

  const [dict, detail, session] = await Promise.all([
    getDictionary(lang),
    getTvDetails(numericId, lang),
    auth(),
  ]);

  const providers = await getProvidersForLocale("tv", numericId, lang);

  const userId = session?.user?.id;
  const [inWatchlist, isWatched] = userId
    ? await Promise.all([
        prisma.watchlistItem.findUnique({
          where: {
            userId_tmdbId_mediaType: { userId, tmdbId: numericId, mediaType: "tv" },
          },
          select: { id: true },
        }).then(Boolean),
        prisma.watchedItem.findUnique({
          where: {
            userId_tmdbId_mediaType: { userId, tmdbId: numericId, mediaType: "tv" },
          },
          select: { id: true },
        }).then(Boolean),
      ])
    : [false, false];

  return (
    <MovieDetail
      detail={{ ...detail, media_type: "tv" }}
      lang={lang}
      dict={dict.detail}
      commonDict={dict.common}
      providers={providers}
      isAuthed={Boolean(userId)}
      inWatchlist={inWatchlist}
      isWatched={isWatched}
      watchlistDict={dict.watchlist}
    />
  );
}

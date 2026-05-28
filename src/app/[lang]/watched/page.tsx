import { notFound, redirect } from "next/navigation";
import { IoStar, IoStarOutline } from "react-icons/io5";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getMovieDetails, getTvDetails, type Movie, type MovieDetailData } from "@/lib/tmdb";
import { getDictionary, hasLocale } from "../dictionaries";
import Navbar from "@/components/Navbar";
import MovieCard from "@/components/MovieCard";
import CardActions from "@/components/CardActions";

type Props = { params: Promise<{ lang: string }> };

type WatchedRow = {
  tmdbId: number;
  mediaType: "movie" | "tv";
  watchedAt: Date;
  rating: number | null;
};

function toMovie(details: MovieDetailData, mediaType: "movie" | "tv"): Movie {
  return {
    id: details.id,
    title: details.title,
    name: details.name,
    poster_path: details.poster_path,
    backdrop_path: details.backdrop_path,
    vote_average: details.vote_average,
    release_date: details.release_date,
    first_air_date: details.first_air_date,
    media_type: mediaType,
    overview: details.overview,
  };
}

async function fetchDetails(row: WatchedRow, lang: string): Promise<Movie | null> {
  try {
    const details = row.mediaType === "movie"
      ? await getMovieDetails(row.tmdbId, lang)
      : await getTvDetails(row.tmdbId, lang);
    return toMovie(details, row.mediaType);
  } catch {
    return null;
  }
}

function Stars({ rating, label }: { rating: number; label: string }) {
  return (
    <div className="flex items-center gap-0.5 text-gold-400" aria-label={`${label}: ${rating}/5`}>
      {[1, 2, 3, 4, 5].map((star) => (
        star <= rating
          ? <IoStar key={star} aria-hidden="true" />
          : <IoStarOutline key={star} aria-hidden="true" />
      ))}
      <span className="ml-1 text-xs text-fg-subtle">{rating}/5</span>
    </div>
  );
}

export default async function WatchedPage({ params }: Props) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);

  const session = await auth();
  if (!session?.user?.id) redirect(`/${lang}/login`);

  const rows = await prisma.watchedItem.findMany({
    where: { userId: session.user.id },
    orderBy: { watchedAt: "desc" },
  });

  const movies = await Promise.all(rows.map((row) => fetchDetails(row, lang)));
  const dateFormatter = new Intl.DateTimeFormat(lang, { dateStyle: "medium" });

  return (
    <div className="bg-surface text-fg min-h-screen">
      <Navbar lang={lang} dict={dict.nav} commonDict={dict.common} colorModeDict={dict.a11y.colorMode} />

      <main className="max-w-[1440px] mx-auto px-6 xl:px-12 py-10">
        <h1 className="text-3xl font-extrabold font-poppins text-fg mb-8">
          {dict.watched.title}
        </h1>

        {rows.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-lg font-semibold text-fg mb-2">{dict.watched.empty}</p>
            <p className="text-sm text-fg-muted">{dict.watched.emptyHint}</p>
          </div>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-6">
            {rows.map((row, i) => {
              const movie = movies[i];
              if (!movie) return null;
              return (
                <div
                  key={`${row.mediaType}-${row.tmdbId}`}
                  data-testid="watched-row"
                  className="flex flex-col gap-2"
                >
                  <MovieCard
                    movie={movie}
                    lang={lang}
                    commonDict={dict.common}
                    actions={
                      <CardActions
                        tmdbId={row.tmdbId}
                        mediaType={row.mediaType}
                        isAuthed
                        lang={lang}
                        dict={dict.watchlist}
                        initiallyWatched
                        showAddToWatchlist
                        showMarkWatched={false}
                      />
                    }
                  />
                  {row.rating != null && (
                    <Stars rating={row.rating} label={dict.watched.yourRating} />
                  )}
                  <p className="text-xs text-fg-subtle px-1">
                    {dict.watched.watchedOn} {dateFormatter.format(row.watchedAt)}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

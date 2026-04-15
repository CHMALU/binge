import Image from "next/image";
import Link from "next/link";
import { getPosterUrl, type MovieDetailData } from "@/lib/tmdb";

interface MovieDetailProps {
  detail: MovieDetailData;
}

export default function MovieDetail({ detail }: MovieDetailProps) {
  const title = detail.title ?? detail.name ?? "No title";
  const originalTitle = detail.original_title ?? detail.original_name;
  const posterUrl = getPosterUrl(detail.poster_path, "w500");
  const backdropUrl = detail.backdrop_path
    ? `https://image.tmdb.org/t/p/w1280${detail.backdrop_path}`
    : null;
  const rating = detail.vote_average.toFixed(1);
  const releaseDate = detail.release_date ?? detail.first_air_date;
  const year = releaseDate ? new Date(releaseDate).getFullYear() : null;

  const runtime =
    detail.runtime ??
    (detail.episode_run_time && detail.episode_run_time.length > 0
      ? detail.episode_run_time[0]
      : detail.last_episode_to_air?.runtime ?? null);

  const isTv = detail.media_type === "tv";

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Backdrop */}
      {backdropUrl && (
        <div className="relative h-72 md:h-96 w-full">
          <Image
            src={backdropUrl}
            alt={title}
            fill
            sizes="100vw"
            className="object-cover opacity-40"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent" />
        </div>
      )}

      {/* Back link */}
      <div className={`px-6 py-4 ${backdropUrl ? "-mt-12 relative" : ""}`}>
        <Link href="/" className="text-sm text-zinc-400 hover:text-white transition-colors">
          ← Back
        </Link>
      </div>

      <div className="px-6 pb-16 flex flex-col md:flex-row gap-8 max-w-5xl mx-auto">
        {/* Poster */}
        <div className="w-48 md:w-64 shrink-0 mx-auto md:mx-0">
          <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-zinc-800 shadow-2xl">
            {posterUrl ? (
              <Image
                src={posterUrl}
                alt={title}
                fill
                sizes="(max-width: 768px) 192px, 256px"
                className="object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-zinc-500 text-sm">
                No poster
              </div>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="flex flex-col gap-4 min-w-0">
          <div>
            <h1 className="text-3xl font-bold">{title}</h1>
            {originalTitle && originalTitle !== title && (
              <p className="text-zinc-500 text-sm mt-1">{originalTitle}</p>
            )}
            {detail.tagline && (
              <p className="text-zinc-400 italic mt-1">{detail.tagline}</p>
            )}
          </div>

          {/* Meta row */}
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-zinc-400">
            {year && <span>{year}</span>}
            {runtime && <span>{runtime} min</span>}
            {isTv && detail.number_of_seasons && (
              <span>
                {detail.number_of_seasons} season{detail.number_of_seasons > 1 ? "s" : ""}
                {detail.number_of_episodes ? ` · ${detail.number_of_episodes} episodes` : ""}
              </span>
            )}
            {detail.status && (
              <span className={detail.status === "Returning Series" ? "text-green-400" : ""}>
                {detail.status}
              </span>
            )}
          </div>

          {/* Rating */}
          <div className="flex items-center gap-2">
            <span className="text-yellow-400 text-xl font-bold">★ <span>{rating}</span></span>
            {detail.vote_count && (
              <span className="text-zinc-500 text-sm">({detail.vote_count.toLocaleString()} votes)</span>
            )}
          </div>

          {/* Genres */}
          {detail.genres.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {detail.genres.map((genre) => (
                <span key={genre.id} className="px-3 py-1 rounded-full bg-zinc-800 text-sm">
                  {genre.name}
                </span>
              ))}
            </div>
          )}

          {/* Overview */}
          <p className="text-zinc-300 leading-relaxed">{detail.overview}</p>

          {/* TV: networks + created by */}
          {isTv && (
            <div className="flex flex-col gap-1 text-sm">
              {detail.networks && detail.networks.length > 0 && (
                <div className="flex gap-2 text-zinc-400">
                  <span className="text-zinc-500">Network:</span>
                  <span>{detail.networks.map((n) => n.name).join(", ")}</span>
                </div>
              )}
              {detail.created_by && detail.created_by.length > 0 && (
                <div className="flex gap-2 text-zinc-400">
                  <span className="text-zinc-500">Created by:</span>
                  <span>{detail.created_by.map((c) => c.name).join(", ")}</span>
                </div>
              )}
              {detail.last_air_date && (
                <div className="flex gap-2 text-zinc-400">
                  <span className="text-zinc-500">Last aired:</span>
                  <span>{detail.last_air_date}</span>
                </div>
              )}
            </div>
          )}

          {/* Movie: budget + revenue */}
          {!isTv && (detail.budget ?? 0) > 0 && (
            <div className="flex flex-col gap-1 text-sm">
              {(detail.budget ?? 0) > 0 && (
                <div className="flex gap-2 text-zinc-400">
                  <span className="text-zinc-500">Budget:</span>
                  <span>${(detail.budget!).toLocaleString()}</span>
                </div>
              )}
              {(detail.revenue ?? 0) > 0 && (
                <div className="flex gap-2 text-zinc-400">
                  <span className="text-zinc-500">Revenue:</span>
                  <span>${(detail.revenue!).toLocaleString()}</span>
                </div>
              )}
            </div>
          )}

          {/* Languages */}
          {detail.spoken_languages && detail.spoken_languages.length > 0 && (
            <div className="flex gap-2 text-sm text-zinc-400">
              <span className="text-zinc-500">Languages:</span>
              <span>{detail.spoken_languages.map((l) => l.english_name).join(", ")}</span>
            </div>
          )}

          {/* External links */}
          <div className="flex gap-3 mt-2">
            {detail.imdb_id && (
              <a
                href={`https://www.imdb.com/title/${detail.imdb_id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-lg bg-yellow-500 text-black text-sm font-semibold hover:bg-yellow-400 transition-colors"
              >
                IMDb
              </a>
            )}
            {detail.homepage && (
              <a
                href={detail.homepage}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-lg bg-zinc-800 text-white text-sm hover:bg-zinc-700 transition-colors"
              >
                Official site
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

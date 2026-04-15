import Image from "next/image";
import Link from "next/link";
import { getPosterUrl, type MovieDetailData } from "@/lib/tmdb";

interface MovieDetailProps {
  detail: MovieDetailData;
}

export default function MovieDetail({ detail }: MovieDetailProps) {
  const title = detail.title ?? detail.name ?? "No title";
  const posterUrl = getPosterUrl(detail.poster_path, "w500");
  const rating = detail.vote_average.toFixed(1);
  const releaseDate = detail.release_date ?? detail.first_air_date;
  const year = releaseDate ? new Date(releaseDate).getFullYear() : null;

  const runtime =
    detail.runtime ??
    (detail.episode_run_time && detail.episode_run_time.length > 0
      ? detail.episode_run_time[0]
      : null);

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="px-6 py-4">
        <Link href="/" className="text-sm text-zinc-400 hover:text-white transition-colors">
          ← Back
        </Link>
      </div>

      <div className="px-6 pb-12 flex flex-col md:flex-row gap-8 max-w-4xl mx-auto">
        <div className="w-full md:w-64 shrink-0">
          <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-zinc-800">
            {posterUrl ? (
              <Image
                src={posterUrl}
                alt={title}
                fill
                sizes="(max-width: 768px) 100vw, 256px"
                className="object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-zinc-500 text-sm">
                No poster
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <h1 className="text-3xl font-bold">{title}</h1>

          <div className="flex flex-wrap gap-3 text-sm text-zinc-400">
            {year && <span>{year}</span>}
            {runtime && <span>{runtime} min</span>}
            <span className="text-yellow-400 font-semibold">★ <span>{rating}</span></span>
          </div>

          {detail.genres.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {detail.genres.map((genre) => (
                <span
                  key={genre.id}
                  className="px-3 py-1 rounded-full bg-zinc-800 text-sm"
                >
                  {genre.name}
                </span>
              ))}
            </div>
          )}

          <p className="text-zinc-300 leading-relaxed">{detail.overview}</p>
        </div>
      </div>
    </div>
  );
}

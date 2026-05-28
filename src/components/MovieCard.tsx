import Image from "next/image";
import Link from "next/link";
import { IoPlay, IoAdd, IoStar } from "react-icons/io5";
import { getPosterUrl, type Movie } from "@/lib/tmdb";
import type { Dictionary } from "@/app/[lang]/dictionaries";

type CommonDict = Dictionary["common"];

export default function MovieCard({
  movie,
  lang = "en",
  commonDict,
  actions,
}: {
  movie: Movie;
  lang?: string;
  commonDict: CommonDict;
  actions?: React.ReactNode;
}) {
  const title = movie.title ?? movie.name ?? commonDict.noTitle;
  const posterUrl = getPosterUrl(movie.poster_path, "w300");
  const rating = movie.vote_average?.toFixed(1) ?? commonDict.notAvailable;
  const href = movie.media_type === "tv"
    ? `/${lang}/tv/${movie.id}`
    : `/${lang}/movie/${movie.id}`;
  const year = movie.release_date
    ? new Date(movie.release_date).getFullYear()
    : movie.first_air_date
      ? new Date(movie.first_air_date).getFullYear()
      : null;

  return (
    <Link
      href={href}
      className="flex-none w-[180px] rounded-xl overflow-hidden group transition-transform duration-300 hover:-translate-y-2 bg-surface-card border border-border"
    >
      <div className="relative aspect-[2/3] overflow-hidden bg-surface-hover">
        {posterUrl ? (
          <Image
            src={posterUrl}
            alt={title}
            fill
            sizes="180px"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-fg-subtle">
            {commonDict.noPoster}
          </div>
        )}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-end p-3 pointer-events-none"
          style={{ background: "linear-gradient(0deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.2) 50%, transparent 100%)" }}
        >
          <div className="flex gap-1.5 pointer-events-auto">
            {actions ?? (
              <>
                <div className="w-8 h-8 rounded-full inline-flex items-center justify-center text-sm font-bold bg-action text-action-fg">
                  <IoPlay aria-hidden="true" />
                </div>
                <div className="w-8 h-8 rounded-full inline-flex items-center justify-center text-sm border bg-white/15 border-white/20 text-white backdrop-blur-sm">
                  <IoAdd aria-hidden="true" />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      <div className="p-3 flex flex-col gap-1.5">
        <h3 className="text-sm font-semibold leading-snug truncate text-fg font-poppins">
          {title}
        </h3>
        <div className="flex items-center justify-between text-xs text-fg-subtle">
          <div className="flex items-center gap-1 font-semibold text-gold-400">
            <IoStar aria-hidden="true" />
            {rating}
          </div>
          {year && <span>{year}</span>}
        </div>
      </div>
    </Link>
  );
}

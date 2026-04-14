import Image from "next/image";
import { getPosterUrl, type Movie } from "@/lib/tmdb";

interface MovieCardProps {
  movie: Movie;
}

export default function MovieCard({ movie }: MovieCardProps) {
  const title = movie.title ?? movie.name ?? "Brak tytułu";
  const posterUrl = getPosterUrl(movie.poster_path, "w300");
  const rating = movie.vote_average.toFixed(1);

  return (
    <div className="flex flex-col rounded-xl overflow-hidden bg-zinc-900 shadow-md hover:scale-[1.02] transition-transform duration-200">
      <div className="relative aspect-[2/3] w-full bg-zinc-800">
        {posterUrl ? (
          <Image
            src={posterUrl}
            alt={title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-zinc-500 text-sm">
            Brak plakatu
          </div>
        )}
      </div>
      <div className="flex flex-col gap-1 p-3">
        <h3 className="text-sm font-medium text-white leading-snug line-clamp-2">{title}</h3>
        <div className="flex items-center gap-1 text-yellow-400 text-sm font-semibold">
          <span>★</span>
          <span>{rating}</span>
        </div>
      </div>
    </div>
  );
}

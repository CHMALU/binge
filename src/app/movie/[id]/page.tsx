import { notFound } from "next/navigation";
import MovieDetail from "@/components/MovieDetail";
import { getMovieDetails } from "@/lib/tmdb";

export default async function MoviePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const numericId = Number(id);

  if (!Number.isInteger(numericId) || numericId <= 0) {
    notFound();
  }

  const detail = await getMovieDetails(numericId);
  return <MovieDetail detail={{ ...detail, media_type: "movie" }} />;
}

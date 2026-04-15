import { notFound } from "next/navigation";
import MovieDetail from "@/components/MovieDetail";
import { getTvDetails } from "@/lib/tmdb";

export default async function TvPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const numericId = Number(id);

  if (!Number.isInteger(numericId) || numericId <= 0) {
    notFound();
  }

  const detail = await getTvDetails(numericId);
  return <MovieDetail detail={{ ...detail, media_type: "tv" }} />;
}

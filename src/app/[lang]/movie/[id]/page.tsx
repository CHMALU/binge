import { notFound } from "next/navigation";
import MovieDetail from "@/components/MovieDetail";
import { getMovieDetails } from "@/lib/tmdb";
import { getDictionary, hasLocale } from "../../dictionaries";

export default async function MoviePage({
  params,
}: {
  params: Promise<{ lang: string; id: string }>;
}) {
  const { lang, id } = await params;
  if (!hasLocale(lang)) notFound();

  const numericId = Number(id);
  if (!Number.isInteger(numericId) || numericId <= 0) notFound();

  const [dict, detail] = await Promise.all([
    getDictionary(lang),
    getMovieDetails(numericId, lang),
  ]);

  return <MovieDetail detail={{ ...detail, media_type: "movie" }} lang={lang} dict={dict.detail} />;
}

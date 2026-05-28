import MovieSwiper from "@/components/MovieSwiper";
import { getPopularMovies, getPopularSeries } from "@/lib/tmdb";
import Navbar from "@/components/Navbar";
import { getDictionary, hasLocale } from "../dictionaries";
import { notFound } from "next/navigation";

export default async function SwipeRouter({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();

  const [dict, movies, series] = await Promise.all([
    getDictionary(lang),
    getPopularMovies(),
    getPopularSeries(),
  ]);

  const all = movies.concat(series);

  return (
    <main>
      <Navbar lang={lang} dict={dict.nav} commonDict={dict.common} />
      <MovieSwiper movies={all} lang={lang} commonDict={dict.common} swipeDict={dict.swipe} />
    </main>
  );
}

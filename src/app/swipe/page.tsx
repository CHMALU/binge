import MovieSwiper from "@/components/MovieSwiper";
import { getPopularMovies, getPopularSeries } from "@/lib/tmdb";
import { main } from "framer-motion/client";

export default async function SwipeRouter() {
  const [movies, series] = await Promise.all([
    getPopularMovies(),
    getPopularSeries()
  ]);
  const all = movies.concat(series);

  return (
    <main className="">
      <MovieSwiper movies={all}/>
    </main>
  );
}
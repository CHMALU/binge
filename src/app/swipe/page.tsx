import MovieSwiper from "@/components/MovieSwiper";
import { getPopularMovies, getPopularSeries } from "@/lib/tmdb";
import Navbar from "@/components/Navbar";

export default async function SwipeRouter() {
  const [movies, series] = await Promise.all([
    getPopularMovies(),
    getPopularSeries()
  ]);
  const all = movies.concat(series);

  return (
    <main className="">
      <Navbar />
      <MovieSwiper movies={all}/>
    </main>
  );
}
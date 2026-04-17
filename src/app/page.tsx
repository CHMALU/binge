import Navbar from "@/components/Navbar";
import MovieCard from "@/components/MovieCard";
import FilterBar from "@/components/FilterBar";
import { getPopularMovies, getPopularSeries, getNowPlaying, getOnAir } from "@/lib/tmdb";
import type { Movie } from "@/lib/tmdb";
import Image from "next/image";

export default async function Home() {
  const [popularMovies, popularSeries, nowPlaying, onAir] = await Promise.all([
    getPopularMovies(),
    getPopularSeries(),
    getNowPlaying(),
    getOnAir(),
  ]);

  const hero = popularMovies[0];
  const backdropUrl = hero?.backdrop_path
    ? `https://image.tmdb.org/t/p/w1280${hero.backdrop_path}`
    : null;

  return (
    <div style={{ background: "var(--bg)", color: "var(--text)" }}>
      <Navbar />

      {hero && (
        <section
          className="relative overflow-hidden border-b"
          style={{ height: 580, borderColor: "var(--border)" }}
        >
          {backdropUrl && (
            <Image
              src={backdropUrl}
              alt=""
              fill
              sizes="100vw"
              className="object-cover object-center"
              style={{ filter: "saturate(1.1)" }}
              priority
            />
          )}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, transparent 0%, rgba(10,10,15,0.45) 50%, #0a0a0f 100%), linear-gradient(90deg, rgba(10,10,15,0.95) 0%, rgba(10,10,15,0.6) 40%, transparent 70%)",
            }}
          />
          <div className="relative z-10 max-w-[1440px] mx-auto px-6 xl:px-12 h-full flex flex-col justify-end pb-16">
            <div className="flex gap-2 mb-4">
              <span
                className="px-3 py-1 rounded-full text-[11px] font-bold tracking-widest uppercase"
                style={{ background: "var(--crimson)", color: "white" }}
              >
                ● Featured
              </span>
              <span
                className="px-3 py-1 rounded-full text-[11px] font-bold tracking-widest uppercase"
                style={{
                  background: "rgba(255,205,0,0.15)",
                  color: "var(--gold)",
                  border: "1px solid rgba(255,205,0,0.3)",
                }}
              >
                Top rated
              </span>
            </div>
            <h1
              className="text-5xl lg:text-7xl font-extrabold tracking-tight leading-none mb-3 max-w-2xl"
              style={{ fontFamily: "var(--font-poppins, inherit)" }}
            >
              {hero.title ?? hero.name}
            </h1>
            <div
              className="flex items-center gap-4 text-sm mb-3"
              style={{ color: "var(--text-muted)" }}
            >
              <span
                className="flex items-center gap-1.5 font-semibold"
                style={{ color: "var(--gold)" }}
              >
                ★ {hero.vote_average?.toFixed(1)}
              </span>
              {hero.release_date && (
                <span>{new Date(hero.release_date).getFullYear()}</span>
              )}
            </div>
            {hero.overview && (
              <p
                className="text-base max-w-lg mb-7 leading-relaxed"
                style={{ color: "var(--text-muted)" }}
              >
                {hero.overview.length > 200
                  ? hero.overview.slice(0, 200) + "…"
                  : hero.overview}
              </p>
            )}
            <div className="flex gap-3">
              <button
                className="px-6 py-3.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all hover:-translate-y-0.5"
                style={{ background: "var(--text)", color: "#000" }}
              >
                ▶ Watch Trailer
              </button>
              <a
                href={`/movie/${hero.id}`}
                className="px-6 py-3.5 rounded-xl font-semibold text-sm flex items-center gap-2 transition-all border"
                style={{
                  background: "rgba(255,255,255,0.1)",
                  backdropFilter: "blur(10px)",
                  borderColor: "rgba(255,255,255,0.15)",
                  color: "var(--text)",
                }}
              >
                ℹ More info
              </a>
            </div>
          </div>
        </section>
      )}

      <FilterBar />

      <div className="px-6 xl:px-12 max-w-[1440px] mx-auto py-10 flex flex-col gap-14">
        <Section title="Popular Movies" eyebrow="Trending now" movies={popularMovies.slice(0, 14)} />
        <Section title="Now in Cinemas" eyebrow="In theaters" movies={nowPlaying.slice(0, 14)} />
        <Section title="Popular Series" eyebrow="On everyone's list" movies={popularSeries.slice(0, 14)} />
        <Section title="Currently on TV" eyebrow="Airing now" movies={onAir.slice(0, 14)} />
      </div>
    </div>
  );
}

function Section({
  title,
  eyebrow,
  movies,
}: {
  title: string;
  eyebrow?: string;
  movies: Movie[];
}) {
  return (
    <section>
      <div className="flex items-end justify-between mb-5">
        <div>
          {eyebrow && (
            <div
              className="flex items-center gap-2 text-xs font-semibold tracking-widest uppercase mb-2"
              style={{ color: "var(--gold)" }}
            >
              <span
                className="inline-block w-6 h-0.5"
                style={{ background: "var(--gold)" }}
              />
              {eyebrow}
            </div>
          )}
          <h2
            className="text-2xl font-bold tracking-tight"
            style={{ fontFamily: "var(--font-poppins, inherit)" }}
          >
            {title}
          </h2>
        </div>
        <a
          href="#"
          className="flex items-center gap-1.5 text-sm font-medium px-3 py-2 rounded-lg border transition-colors"
          style={{ color: "var(--text-muted)", borderColor: "var(--border)" }}
        >
          See all →
        </a>
      </div>
      <div className="binge-rail">
        {movies.map((movie) => (
          <MovieCard key={movie.id} movie={movie} />
        ))}
      </div>
    </section>
  );
}

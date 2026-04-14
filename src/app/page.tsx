import MovieCard from "@/components/MovieCard";
import { getPopularMovies, getPopularSeries, getNowPlaying, getOnAir } from "@/lib/tmdb";

export default async function Home() {
  const [popularMovies, popularSeries, nowPlaying, onAir] = await Promise.all([
    getPopularMovies(),
    getPopularSeries(),
    getNowPlaying(),
    getOnAir(),
  ]);

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <header className="px-6 py-6 border-b border-zinc-800">
        <h1 className="text-2xl font-bold tracking-tight">Binge</h1>
        <p className="text-zinc-400 text-sm mt-1">Odkryj co warto obejrzeć</p>
      </header>

      <div className="px-6 py-8 flex flex-col gap-12">
        <Section title="Popularne filmy">
          {popularMovies.slice(0, 10).map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </Section>

        <Section title="Nowe w kinach">
          {nowPlaying.slice(0, 10).map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </Section>

        <Section title="Popularne seriale">
          {popularSeries.slice(0, 10).map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </Section>

        <Section title="Aktualnie w TV">
          {onAir.slice(0, 10).map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </Section>
      </div>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-lg font-semibold mb-4">{title}</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {children}
      </div>
    </section>
  );
}

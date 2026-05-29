import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import MovieCard from "@/components/MovieCard";
import CardActions from "@/components/CardActions";
import FilterBar from "@/components/FilterBar";
import HeroTrailer from "@/components/HeroTrailer";
import SwipeFab from "@/components/SwipeFab";
import { auth } from "@/auth";
import { getPopularMovies, getPopularSeries, getNowPlaying, getOnAir, getTrailerKey } from "@/lib/tmdb";
import type { Movie } from "@/lib/tmdb";
import { getUserItemSets, makeItemKey } from "@/lib/userSets";
import Image from "next/image";
import {
  IoStar,
  IoInformationCircleOutline,
  IoEllipse,
} from "react-icons/io5";
import { getDictionary, hasLocale, type Dictionary } from "./dictionaries";

export default async function Home({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();

  const [dict, popularMovies, popularSeries, nowPlaying, onAir, session] = await Promise.all([
    getDictionary(lang),
    getPopularMovies(lang),
    getPopularSeries(lang),
    getNowPlaying(lang),
    getOnAir(lang),
    auth(),
  ]);
  const userId = session?.user?.id;
  const isAuthed = !!userId;
  const { watchlistKeys, watchedKeys } = userId
    ? await getUserItemSets(userId)
    : { watchlistKeys: new Set<string>(), watchedKeys: new Set<string>() };

  const hero = popularMovies[0];
  const backdropUrl = hero?.backdrop_path
    ? `https://image.tmdb.org/t/p/w1280${hero.backdrop_path}`
    : null;
  const heroTrailerKey = hero ? await getTrailerKey("movie", hero.id, lang) : null;

  return (
    <div className="bg-surface text-fg">
      <Navbar lang={lang} dict={dict.nav} commonDict={dict.common} colorModeDict={dict.a11y.colorMode} />

      {hero && (
        <section className="relative overflow-hidden border-b border-border h-[580px]">
          {backdropUrl && (
            <Image
              src={backdropUrl}
              alt=""
              fill
              sizes="100vw"
              className="object-cover object-center saturate-[1.1]"
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
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-widest uppercase bg-accent text-white">
                <IoEllipse aria-hidden="true" size={8} /> {dict.hero.featured}
              </div>
              <div className="px-3 py-1 rounded-full text-[11px] font-bold tracking-widest uppercase text-gold-400 bg-gold-400/15 border border-gold-400/30">
                {dict.hero.topRated}
              </div>
            </div>
            <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight leading-none mb-3 max-w-2xl font-poppins">
              {hero.title ?? hero.name}
            </h1>
            <div className="flex items-center gap-4 text-sm mb-3 text-fg-muted">
              <div className="flex items-center gap-1.5 font-semibold text-gold-400">
                <IoStar aria-hidden="true" /> {hero.vote_average?.toFixed(1)}
              </div>
              {hero.release_date && (
                <span>{new Date(hero.release_date).getFullYear()}</span>
              )}
            </div>
            {hero.overview && (
              <p className="text-base max-w-lg mb-7 leading-relaxed text-fg-muted">
                {hero.overview.length > 200
                  ? hero.overview.slice(0, 200) + "…"
                  : hero.overview}
              </p>
            )}
            <div className="flex gap-3">
              <HeroTrailer
                trailerKey={heroTrailerKey}
                title={hero.title ?? hero.name ?? ""}
                watchLabel={dict.hero.watchTrailer}
                trailerLabel={dict.hero.trailerLabel}
                closeLabel={dict.common.close}
              />
              <a
                href={`/${lang}/movie/${hero.id}`}
                className="px-6 py-3.5 rounded-xl font-semibold text-sm flex items-center gap-2 transition-all border bg-white/10 border-white/15 text-fg backdrop-blur-md"
              >
                <IoInformationCircleOutline aria-hidden="true" /> {dict.hero.moreInfo}
              </a>
            </div>
          </div>
        </section>
      )}

      <FilterBar lang={lang} dict={dict.filter} commonDict={dict.common} />

      <div className="px-6 xl:px-12 max-w-[1440px] mx-auto py-10 flex flex-col gap-14">
        <Section
          title={dict.sections.popularMovies}
          eyebrow={dict.sections.popularMoviesEyebrow}
          movies={popularMovies.slice(0, 14)}
          count={popularMovies.length}
          titlesLabel={dict.sections.titles}
          lang={lang}
          commonDict={dict.common}
          watchlistDict={dict.watchlist}
          isAuthed={isAuthed}
          watchlistKeys={watchlistKeys}
          watchedKeys={watchedKeys}
        />
        <Section
          title={dict.sections.nowInCinemas}
          eyebrow={dict.sections.nowInCinemasEyebrow}
          movies={nowPlaying.slice(0, 14)}
          count={nowPlaying.length}
          titlesLabel={dict.sections.titles}
          lang={lang}
          commonDict={dict.common}
          watchlistDict={dict.watchlist}
          isAuthed={isAuthed}
          watchlistKeys={watchlistKeys}
          watchedKeys={watchedKeys}
        />
        <Section
          title={dict.sections.popularSeries}
          eyebrow={dict.sections.popularSeriesEyebrow}
          movies={popularSeries.slice(0, 14)}
          count={popularSeries.length}
          titlesLabel={dict.sections.titles}
          lang={lang}
          commonDict={dict.common}
          watchlistDict={dict.watchlist}
          isAuthed={isAuthed}
          watchlistKeys={watchlistKeys}
          watchedKeys={watchedKeys}
        />
        <Section
          title={dict.sections.currentlyOnTV}
          eyebrow={dict.sections.currentlyOnTVEyebrow}
          movies={onAir.slice(0, 14)}
          count={onAir.length}
          titlesLabel={dict.sections.titles}
          lang={lang}
          commonDict={dict.common}
          watchlistDict={dict.watchlist}
          isAuthed={isAuthed}
          watchlistKeys={watchlistKeys}
          watchedKeys={watchedKeys}
        />
      </div>

      <SwipeFab lang={lang} label={dict.nav.startSwiping} />
    </div>
  );
}

function Section({
  title,
  eyebrow,
  movies,
  count,
  titlesLabel,
  lang,
  commonDict,
  watchlistDict,
  isAuthed,
  watchlistKeys,
  watchedKeys,
}: {
  title: string;
  eyebrow?: string;
  movies: Movie[];
  count: number;
  titlesLabel: string;
  lang: string;
  commonDict: Dictionary["common"];
  watchlistDict: Dictionary["watchlist"];
  isAuthed: boolean;
  watchlistKeys: Set<string>;
  watchedKeys: Set<string>;
}) {
  return (
    <section>
      <div className="flex items-end justify-between mb-5">
        <div>
          {eyebrow && (
            <div className="flex items-center gap-2 text-xs font-semibold tracking-widest uppercase mb-2 text-gold-400">
              <span className="inline-block w-6 h-0.5 bg-gold-400" />
              {eyebrow}
            </div>
          )}
          <h2 className="text-2xl font-bold tracking-tight font-poppins">
            {title}
          </h2>
        </div>
        <span className="text-sm font-mono text-fg-subtle shrink-0">
          {count} {titlesLabel}
        </span>
      </div>
      <div className="binge-rail">
        {movies.map((movie) => {
          const mediaType = movie.media_type === "tv" ? "tv" : "movie";
          const key = makeItemKey(movie.id, mediaType);
          return (
            <MovieCard
              key={movie.id}
              movie={movie}
              lang={lang}
              commonDict={commonDict}
              actions={
                <CardActions
                  tmdbId={movie.id}
                  mediaType={mediaType}
                  isAuthed={isAuthed}
                  lang={lang}
                  dict={watchlistDict}
                  initiallyInWatchlist={watchlistKeys.has(key)}
                  initiallyWatched={watchedKeys.has(key)}
                />
              }
            />
          );
        })}
      </div>
    </section>
  );
}

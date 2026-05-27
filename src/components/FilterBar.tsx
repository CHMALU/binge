"use client";

import { useState, useEffect } from "react";
import { IoFilm, IoTv, IoClose } from "react-icons/io5";
import { getGenres, discoverMovies, discoverSeries } from "@/lib/tmdb";
import type { Genre, Movie } from "@/lib/tmdb";
import MovieCard from "@/components/MovieCard";
import { cn } from "@/lib/utils";
import type { Dictionary } from "@/app/[lang]/dictionaries";

type FilterDict = Dictionary["filter"];
type CommonDict = Dictionary["common"];

const YEARS = Array.from({ length: 30 }, (_, i) => String(new Date().getFullYear() - i));

const CHIP_BASE = "inline-flex items-center gap-2 px-4 py-2.5 rounded-full border text-[13px] transition-all whitespace-nowrap cursor-pointer";
const SELECT_CLASS = "px-3.5 py-2.5 rounded-full bg-surface-card border border-border text-fg-muted text-[13px] font-medium cursor-pointer outline-none appearance-none";

function chipClass(active: boolean): string {
  return cn(
    CHIP_BASE,
    active
      ? "bg-action border-action text-action-fg font-semibold"
      : "bg-surface-card border-border text-fg-muted font-medium hover:border-border-strong"
  );
}

export default function FilterBar({ lang, dict, commonDict }: { lang: string; dict: FilterDict; commonDict: CommonDict }) {
  const [mediaType, setMediaType] = useState<"movie" | "tv" | null>(null);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<string | null>(null);
  const [results, setResults] = useState<Movie[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!mediaType) return;
    getGenres(mediaType, lang).then((fetchedGenres) => {
      setGenres(fetchedGenres);
      setSelectedGenre(null);
    });
  }, [mediaType, lang]);

  useEffect(() => {
    if (!mediaType) {
      Promise.resolve().then(() => {
        setResults([]);
        setIsOpen(false);
      });
      return;
    }

    const params: Record<string, string> = {};
    if (selectedGenre) params["with_genres"] = selectedGenre;
    if (selectedYear) {
      if (mediaType === "movie") params["primary_release_year"] = selectedYear;
      else params["first_air_date_year"] = selectedYear;
    }

    const fetchData = async () => {
      setLoading(true);
      const fetch = mediaType === "movie" ? await discoverMovies(params, lang) : await discoverSeries(params, lang);
      setResults(fetch.slice(0, 10));
      setIsOpen(true);
      setLoading(false);
    };

    fetchData();

  }, [mediaType, selectedGenre, selectedYear, lang]);

  const hasFilter = mediaType !== null || selectedGenre !== null || selectedYear !== null;

  function reset() {
    setMediaType(null);
    setSelectedGenre(null);
    setSelectedYear(null);
    setIsOpen(false);
  }

  return (
    <div className="relative border-b border-border">
      <div className="max-w-[1440px] mx-auto px-6 xl:px-12 py-4">
        <div className="flex gap-2.5 flex-wrap items-center">
          <button className={chipClass(!mediaType)} onClick={reset}>
            {dict.all}
          </button>
          <button className={chipClass(mediaType === "movie")} onClick={() => setMediaType(mediaType === "movie" ? null : "movie")}>
            <IoFilm aria-hidden="true" /> {dict.movies}
          </button>
          <button className={chipClass(mediaType === "tv")} onClick={() => setMediaType(mediaType === "tv" ? null : "tv")}>
            <IoTv aria-hidden="true" /> {dict.series}
          </button>

          {genres.length > 0 && mediaType && (
            <>
              <span className="w-px h-5 self-center bg-border" />
              <select
                data-testid="genre"
                className={SELECT_CLASS}
                value={selectedGenre ?? ""}
                onChange={(e) => setSelectedGenre(e.target.value || null)}
              >
                <option value="">{dict.allGenres}</option>
                {genres.map((g) => (
                  <option key={g.id} value={String(g.id)}>{g.name}</option>
                ))}
              </select>
            </>
          )}

          {mediaType && (
            <select
              className={SELECT_CLASS}
              value={selectedYear ?? ""}
              onChange={(e) => setSelectedYear(e.target.value || null)}
            >
              <option value="">{dict.allYears}</option>
              {YEARS.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          )}

          {hasFilter && (
            <button
              data-testid="reset"
              className={chipClass(false)}
              onClick={reset}
            >
              <IoClose aria-hidden="true" /> {dict.reset}
            </button>
          )}
        </div>
      </div>

      {isOpen && (
        <div className="absolute top-[calc(100%+8px)] left-6 right-6 xl:left-12 xl:right-12 z-40 rounded-xl shadow-xl p-4 bg-surface-raised border border-border">
          {loading ? (
            <p className="text-sm text-center py-4 text-fg-muted">{dict.loading}</p>
          ) : results.length > 0 ? (
            <div className="binge-rail">
              {results.map((movie) => (
                <MovieCard key={movie.id} movie={movie} lang={lang} commonDict={commonDict} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-center py-4 text-fg-muted">{dict.noResults}</p>
          )}
        </div>
      )}
    </div>
  );
}

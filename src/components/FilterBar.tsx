"use client";

import { useState, useEffect } from "react";
import { getGenres, discoverMovies, discoverSeries } from "@/lib/tmdb";
import type { Genre, Movie } from "@/lib/tmdb";
import MovieCard from "@/components/MovieCard";

const YEARS = Array.from({ length: 30 }, (_, i) => String(new Date().getFullYear() - i));

export default function FilterBar() {
  const [mediaType, setMediaType] = useState<"movie" | "tv" | null>(null);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<string | null>(null);
  const [results, setResults] = useState<Movie[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Genres laden wenn mediaType sich ändert
  useEffect(() => {
    if (!mediaType) return;
    getGenres(mediaType).then(setGenres);
    setSelectedGenre(null);
  }, [mediaType]);

  // Suche ausführen wenn Filter sich ändern
  useEffect(() => {
    if (!mediaType) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    const params: Record<string, string> = {};
    if (selectedGenre) params["with_genres"] = selectedGenre;
    if (selectedYear) {
      if (mediaType === "movie") params["primary_release_year"] = selectedYear;
      else params["first_air_date_year"] = selectedYear;
    }

    setLoading(true);
    const fetch = mediaType === "movie" ? discoverMovies(params) : discoverSeries(params);
    fetch.then((data) => {
      setResults(data.slice(0, 10));
      setIsOpen(true);
      setLoading(false);
    });
  }, [mediaType, selectedGenre, selectedYear]);

  const btnClass = (active: boolean) =>
    `px-3 py-1.5 rounded-lg text-sm transition-colors ${
      active
        ? "bg-white text-zinc-900 font-semibold"
        : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
    }`;

  return (
    <div className="relative flex flex-col items-end gap-2">
      {/* Filter Buttons */}
      <div className="flex items-center gap-2 flex-wrap justify-end">
        {/* Movie / Series Toggle */}
        <button className={btnClass(mediaType === "movie")} onClick={() => setMediaType(mediaType === "movie" ? null : "movie")}>
          🎬 Movies
        </button>
        <button className={btnClass(mediaType === "tv")} onClick={() => setMediaType(mediaType === "tv" ? null : "tv")}>
          📺 Series
        </button>

        {/* Genre Dropdown */}
        {genres.length > 0 && (
          <select
            className="bg-zinc-800 text-zinc-300 text-sm rounded-lg px-3 py-1.5 outline-none"
            value={selectedGenre ?? ""}
            onChange={(e) => setSelectedGenre(e.target.value || null)}
          >
            <option value="" data-testid="genre">All Genres</option>
            {genres.map((g) => (
              <option key={g.id} value={String(g.id)}>{g.name}</option>
            ))}
          </select>
        )}

        {/* Year Dropdown */}
        {mediaType && (
          <select
            className="bg-zinc-800 text-zinc-300 text-sm rounded-lg px-3 py-1.5 outline-none"
            value={selectedYear ?? ""}
            onChange={(e) => setSelectedYear(e.target.value || null)}
          >
            <option value="Year">All Years</option>
            {YEARS.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        )}

        {/* Reset */}
        {(mediaType || selectedGenre || selectedYear) && (
          <button
            className="px-3 py-1.5 rounded-lg text-sm bg-zinc-700 text-zinc-400 hover:bg-zinc-600" data-testid="reset"
            onClick={() => { setMediaType(null); setSelectedGenre(null); setSelectedYear(null); setIsOpen(false); }}
          >
            ✕ Reset
          </button>
        )}
      </div>

      {/* Ergebnisse */}
      {isOpen && (
        <div className="absolute top-12 right-0 w-[600px] bg-zinc-900 border border-zinc-700 rounded-xl shadow-xl z-50 p-4">
          {loading ? (
            <p className="text-zinc-400 text-sm text-center py-4">Loading...</p>
          ) : results.length > 0 ? (
            <div className="grid grid-cols-5 gap-3">
              {results.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>
          ) : (
            <p className="text-zinc-400 text-sm text-center py-4">No results found.</p>
          )}
        </div>
      )}
    </div>
  );
}
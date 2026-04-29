"use client";

import { useState, useEffect } from "react";
import { getGenres, discoverMovies, discoverSeries } from "@/lib/tmdb";
import type { Genre, Movie } from "@/lib/tmdb";
import MovieCard from "@/components/MovieCard";

const YEARS = Array.from({ length: 30 }, (_, i) => String(new Date().getFullYear() - i));

function chipStyle(active: boolean): React.CSSProperties {
  return {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "10px 16px",
    borderRadius: 999,
    background: active ? "var(--gold)" : "var(--bg-card)",
    border: `1px solid ${active ? "var(--gold)" : "var(--border)"}`,
    color: active ? "#000" : "var(--text-muted)",
    fontWeight: active ? 600 : 500,
    fontSize: 13,
    cursor: "pointer",
    transition: "all 0.15s",
    whiteSpace: "nowrap",
  };
}

function selectStyle(): React.CSSProperties {
  return {
    padding: "10px 14px",
    borderRadius: 999,
    background: "var(--bg-card)",
    border: "1px solid var(--border)",
    color: "var(--text-muted)",
    fontSize: 13,
    fontWeight: 500,
    cursor: "pointer",
    outline: "none",
    appearance: "none" as const,
    WebkitAppearance: "none" as const,
  };
}

export default function FilterBar() {
  const [mediaType, setMediaType] = useState<"movie" | "tv" | null>(null);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<string | null>(null);
  const [results, setResults] = useState<Movie[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!mediaType) return;
    getGenres(mediaType).then((fetchedGenres) => {
      setGenres(fetchedGenres);
      setSelectedGenre(null);
    });
  }, [mediaType]);

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
      const fetch = mediaType === "movie" ? await discoverMovies(params) : await discoverSeries(params);
      setResults(fetch.slice(0, 10));
      setIsOpen(true);
      setLoading(false);
    };

    fetchData();

  }, [mediaType, selectedGenre, selectedYear]);

  const hasFilter = mediaType !== null || selectedGenre !== null || selectedYear !== null;

  return (
    <div className="relative border-b" style={{ borderColor: "var(--border)" }}>
      <div className="max-w-[1440px] mx-auto px-6 xl:px-12 py-4">
        <div className="flex gap-2.5 flex-wrap items-center">
          <button style={chipStyle(!mediaType)} onClick={() => { setMediaType(null); setSelectedGenre(null); setSelectedYear(null); setIsOpen(false); }}>
            All
          </button>
          <button style={chipStyle(mediaType === "movie")} onClick={() => setMediaType(mediaType === "movie" ? null : "movie")}>
            🎬 Movies
          </button>
          <button style={chipStyle(mediaType === "tv")} onClick={() => setMediaType(mediaType === "tv" ? null : "tv")}>
            📺 Series
          </button>

          {genres.length > 0 && mediaType && (
            <>
              <span className="w-px h-5 self-center" style={{ background: "var(--border)" }} />
              <select
                data-testid="genre"
                style={selectStyle()}
                value={selectedGenre ?? ""}
                onChange={(e) => setSelectedGenre(e.target.value || null)}
              >
                <option value="">All Genres</option>
                {genres.map((g) => (
                  <option key={g.id} value={String(g.id)}>{g.name}</option>
                ))}
              </select>
            </>
          )}

          {mediaType && (
            <select
              style={selectStyle()}
              value={selectedYear ?? ""}
              onChange={(e) => setSelectedYear(e.target.value || null)}
            >
              <option value="">All Years</option>
              {YEARS.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          )}

          {hasFilter && (
            <button
              data-testid="reset"
              style={chipStyle(false)}
              onClick={() => { setMediaType(null); setSelectedGenre(null); setSelectedYear(null); setIsOpen(false); }}
            >
              ✕ Reset
            </button>
          )}
        </div>
      </div>

      {isOpen && (
        <div
          className="absolute left-6 right-6 xl:left-12 xl:right-12 z-40 rounded-xl shadow-xl p-4"
          style={{ top: "calc(100% + 8px)", background: "var(--bg-elev)", border: "1px solid var(--border)" }}
        >
          {loading ? (
            <p className="text-sm text-center py-4" style={{ color: "var(--text-muted)" }}>Loading...</p>
          ) : results.length > 0 ? (
            <div className="binge-rail">
              {results.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-center py-4" style={{ color: "var(--text-muted)" }}>No results found.</p>
          )}
        </div>
      )}
    </div>
  );
}


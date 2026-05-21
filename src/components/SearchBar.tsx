"use client";
import { useState, useEffect, useRef } from "react";
import { LuCommand } from "react-icons/lu";
import { searchMovies } from "@/lib/tmdb";
import type { Movie } from "@/lib/tmdb";
import MovieCard from "@/components/MovieCard";

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Movie[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!query.trim()) {
      Promise.resolve().then(() => {
        setResults([]);
        setIsOpen(false);
      });
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      const data = await searchMovies(query);
      setResults(data.slice(0, 6));
      setIsOpen(true);
      setLoading(false);
    }, 400);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  return (
    <div className="relative w-full">
      <svg
        className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-fg-subtle"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.3-4.3" />
      </svg>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search movies & series..."
        className="w-full h-11 rounded-xl pl-10 pr-14 text-sm outline-none border transition-colors bg-surface-card border-border focus:border-action text-fg"
      />
      {loading && (
        <div className="absolute right-10 top-1/2 -translate-y-1/2 text-xs text-fg-subtle">
          ...
        </div>
      )}
      <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] px-1.5 py-0.5 rounded border pointer-events-none inline-flex items-center gap-0.5 bg-surface border-border text-fg-subtle font-[inherit]">

        <LuCommand aria-hidden="true" />K
      </kbd>
      {isOpen && results.length > 0 && (
        <div className="absolute top-12 left-0 w-[360px] rounded-xl shadow-xl z-50 p-3 bg-surface-raised border border-border">
          <div className="grid grid-cols-3 gap-2">
            {results.map((movie) => (
              <div key={movie.id} onClick={() => { setIsOpen(false); setQuery(""); }}>
                <MovieCard movie={movie} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

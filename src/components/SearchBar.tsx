"use client";

import { useState, useEffect, useRef } from "react";
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
      setResults([]);
      setIsOpen(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      const data = await searchMovies(query);
      setResults(data.slice(0, 6));
      setIsOpen(true);
      setLoading(false);
    }, 400); // wartet 400ms nach dem letzten Tastendruck

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  return (
    <div className="relative w-64">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search movies & series..."
        className="w-full bg-zinc-800 text-white text-sm rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-zinc-500 placeholder:text-zinc-500"
      />
      {loading && (
        <div className="absolute right-3 top-2.5 text-zinc-400 text-xs">...</div>
      )}
      {isOpen && results.length > 0 && (
        <div className="absolute top-10 right-0 w-80 bg-zinc-900 border border-zinc-700 rounded-xl shadow-xl z-50 p-3 grid grid-cols-3 gap-2">
          {results.map((movie) => (
            <div key={movie.id} onClick={() => { setIsOpen(false); setQuery(""); }}>
              <MovieCard movie={movie} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
const BASE_URL = "https://api.themoviedb.org/3";
const IMAGE_BASE_URL = "https://image.tmdb.org/t/p";

function apiKey() {
  const key = process.env.NEXT_PUBLIC_TMDB_API_KEY;
  if (!key) throw new Error("TMDB_API_KEY is not set");
  return key;
}

export function getPosterUrl(path: string | null, size: "w300" | "w500" | "original" = "w500") {
  if (!path) return null;
  return `${IMAGE_BASE_URL}/${size}${path}`;
}

const LOCALE_TO_TMDB: Record<string, string> = {
  en: "en-US",
  pl: "pl-PL",
  ar: "ar",
};

function tmdbLang(locale: string): string {
  return LOCALE_TO_TMDB[locale] ?? "en-US";
}

async function tmdbFetch<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
  const url = new URL(`${BASE_URL}${endpoint}`);
  url.searchParams.set("api_key", apiKey());
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }

  const res = await fetch(url.toString(), { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error(`TMDb error: ${res.status} ${res.statusText}`);
  return res.json() as Promise<T>;
}

export interface Movie {
  id: number;
  title?: string;
  name?: string;
  poster_path: string | null;
  backdrop_path?: string | null;
  vote_average: number | null;
  release_date?: string;
  first_air_date?: string;
  media_type?: "movie" | "tv";
  overview: string;
}

export interface Genre {
  id: number;
  name: string;
}

export interface MovieDetailData {
  id: number;
  title?: string;
  name?: string;
  original_title?: string;
  original_name?: string;
  overview: string;
  tagline?: string;
  runtime?: number;
  episode_run_time?: number[];
  genres: Genre[];
  vote_average: number;
  vote_count?: number;
  release_date?: string;
  first_air_date?: string;
  last_air_date?: string;
  poster_path: string | null;
  backdrop_path?: string | null;
  status?: string;
  homepage?: string;
  imdb_id?: string;
  budget?: number;
  revenue?: number;
  number_of_seasons?: number;
  number_of_episodes?: number;
  spoken_languages?: { english_name: string }[];
  production_companies?: { id: number; name: string; logo_path: string | null }[];
  networks?: { id: number; name: string }[];
  created_by?: { id: number; name: string }[];
  last_episode_to_air?: { runtime?: number };
  media_type?: "movie" | "tv";
}

interface TMDbListResponse {
  results: Movie[];
  total_pages: number;
  total_results: number;
}

export async function getPopularMovies(locale = "en"): Promise<Movie[]> {
  const data = await tmdbFetch<TMDbListResponse>("/movie/popular", { language: tmdbLang(locale) });
  return data.results ?? [];
}

export async function getPopularSeries(locale = "en"): Promise<Movie[]> {
  const data = await tmdbFetch<TMDbListResponse>("/tv/popular", { language: tmdbLang(locale) });
  return (data.results ?? []).map((m) => ({ ...m, media_type: "tv" as const }));
}

export async function getNowPlaying(locale = "en"): Promise<Movie[]> {
  const data = await tmdbFetch<TMDbListResponse>("/movie/now_playing", { language: tmdbLang(locale) });
  return data.results ?? [];
}

export async function getOnAir(locale = "en"): Promise<Movie[]> {
  const data = await tmdbFetch<TMDbListResponse>("/tv/on_the_air", { language: tmdbLang(locale) });
  return (data.results ?? []).map((m) => ({ ...m, media_type: "tv" as const }));
}

export async function getMovieDetails(id: number, locale = "en"): Promise<MovieDetailData> {
  return tmdbFetch<MovieDetailData>(`/movie/${id}`, { language: tmdbLang(locale) });
}

export async function getTvDetails(id: number, locale = "en"): Promise<MovieDetailData> {
  return tmdbFetch<MovieDetailData>(`/tv/${id}`, { language: tmdbLang(locale) });
}

export async function searchMovies(query: string, locale = "en"): Promise<Movie[]> {
  if (!query.trim()) return [];

  const data = await tmdbFetch<TMDbListResponse>("/search/multi", {
    query: encodeURIComponent(query),
    include_adult: "false",
    language: tmdbLang(locale),
  });

  return (data.results ?? []).filter(
    (item) => item.media_type === "movie" || item.media_type === "tv"
  );
}

export interface GenreListResponse {
  genres: Genre[];
}

export async function getGenres(type: "movie" | "tv" = "movie", locale = "en"): Promise<Genre[]> {
  const data = await tmdbFetch<GenreListResponse>(`/genre/${type}/list`, { language: tmdbLang(locale) });
  return data.genres;
}

export async function discoverMovies(params: Record<string, string>, locale = "en"): Promise<Movie[]> {
  const data = await tmdbFetch<TMDbListResponse>("/discover/movie", { ...params, language: tmdbLang(locale) });
  return data.results ?? [];
}

export async function discoverSeries(params: Record<string, string>, locale = "en"): Promise<Movie[]> {
  const data = await tmdbFetch<TMDbListResponse>("/discover/tv", { ...params, language: tmdbLang(locale) });
  return (data.results ?? []).map((m) => ({ ...m, media_type: "tv" as const }));
}

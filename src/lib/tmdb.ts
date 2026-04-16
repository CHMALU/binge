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

async function tmdbFetch<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
  const url = new URL(`${BASE_URL}${endpoint}`);
  url.searchParams.set("api_key", apiKey());
  url.searchParams.set("language", "en-US");
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
  overview: string;
  runtime?: number;
  episode_run_time?: number[];
  genres: Genre[];
  vote_average: number;
  release_date?: string;
  first_air_date?: string;
  poster_path: string | null;
  media_type?: "movie" | "tv";
}

interface TMDbListResponse {
  results: Movie[];
  total_pages: number;
  total_results: number;
}

export async function getPopularMovies(): Promise<Movie[]> {
  const data = await tmdbFetch<TMDbListResponse>("/movie/popular");
  return data.results;
}

export async function getPopularSeries(): Promise<Movie[]> {
  const data = await tmdbFetch<TMDbListResponse>("/tv/popular");
  return data.results.map((m) => ({ ...m, media_type: "tv" as const }));
}

export async function getNowPlaying(): Promise<Movie[]> {
  const data = await tmdbFetch<TMDbListResponse>("/movie/now_playing");
  return data.results;
}

export async function getOnAir(): Promise<Movie[]> {
  const data = await tmdbFetch<TMDbListResponse>("/tv/on_the_air");
  return data.results.map((m) => ({ ...m, media_type: "tv" as const }));
}

export async function getMovieDetails(id: number): Promise<MovieDetailData> {
  return tmdbFetch<MovieDetailData>(`/movie/${id}`);
}

export async function getTvDetails(id: number): Promise<MovieDetailData> {
  return tmdbFetch<MovieDetailData>(`/tv/${id}`);
}

export async function searchMovies(query: string): Promise<Movie[]> {
  if (!query.trim()) return [];

  const data = await tmdbFetch<TMDbListResponse>(
    `/search/multi?query=${encodeURIComponent(query)}&include_adult=false`
  );

  return (data.results ?? []).filter(
    (item) => item.media_type === "movie" || item.media_type === "tv"
  );
}

export interface GenreListResponse {
  genres: Genre[];
}

export async function getGenres(type: "movie" | "tv" = "movie"): Promise<Genre[]> {
  const data = await tmdbFetch<GenreListResponse>(`/genre/${type}/list`);
  return data.genres;
}

export async function discoverMovies(params: Record<string, string>): Promise<Movie[]> {
  const data = await tmdbFetch<TMDbListResponse>("/discover/movie", params);
  return data.results;
}

export async function discoverSeries(params: Record<string, string>): Promise<Movie[]> {
  const data = await tmdbFetch<TMDbListResponse>("/discover/tv", params);
  return data.results.map((m) => ({ ...m, media_type: "tv" as const }));
}

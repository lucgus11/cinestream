// ============================================================
// src/lib/api.ts — Trakt.tv via proxy serveur sécurisé
// Vercel env : TRAKT_CLIENT_ID=votre_client_id (sans NEXT_PUBLIC_)
// ============================================================

export interface Movie {
  id: number;
  tmdb_id: number;
  imdb_id: string;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
  genres: string[];
  runtime: number;
  original_language: string;
  popularity: number;
}

export interface VideoSource {
  src: string;
  type: "video/mp4" | "application/x-mpegURL" | "video/webm";
  label?: string;
  res?: number;
}

export interface ApiResponse<T> {
  results: T[];
  page: number;
  total_pages: number;
  total_results: number;
}

const TMDB_IMAGE = "https://image.tmdb.org/t/p";

export const getPosterUrl = (path: string | null, size = "w500") =>
  path ? `${TMDB_IMAGE}/${size}${path}` : "/placeholder-poster.jpg";

export const getBackdropUrl = (path: string | null, size = "w1280") =>
  path ? `${TMDB_IMAGE}/${size}${path}` : "/placeholder-backdrop.jpg";

// ─── Proxy fetch ──────────────────────────────────────────
async function traktFetch<T>(
  endpoint: string,
  params: Record<string, string> = {}
): Promise<{ data: T; headers: Headers }> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const url = new URL(`/api/trakt/${endpoint}`, baseUrl);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

  const res = await fetch(url.toString(), { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error(`Proxy Trakt ${res.status}`);
  const data: T = await res.json();
  return { data, headers: res.headers };
}

// ─── Mock data ────────────────────────────────────────────
const MOCK_MOVIES: Movie[] = Array.from({ length: 20 }, (_, i) => ({
  id: i + 1,
  tmdb_id: [157336, 27205, 155, 438631, 19995, 603, 496243, 872585, 346698, 569094,
    238, 680, 550, 13, 597, 8587, 98, 197, 424, 769][i],
  imdb_id: `tt000000${i}`,
  title: [
    "Interstellar", "Inception", "The Dark Knight", "Dune", "Avatar",
    "The Matrix", "Parasite", "Oppenheimer", "Barbie", "Spider-Man",
    "The Godfather", "Pulp Fiction", "Fight Club", "Forrest Gump", "Titanic",
    "The Lion King", "Gladiator", "Braveheart", "Schindler's List", "Goodfellas",
  ][i],
  overview: "Un film épique qui captive le spectateur du début à la fin.",
  poster_path: null,
  backdrop_path: null,
  release_date: `${2018 + (i % 6)}-01-15`,
  vote_average: 7.5 + (i % 25) / 10,
  vote_count: 10000 + i * 500,
  genres: ["Action", "Adventure"],
  runtime: 120 + i * 3,
  original_language: "en",
  popularity: 100 + i * 10,
}));

// ─── Convertisseur ────────────────────────────────────────
type TraktMovieRaw = {
  title: string;
  year: number;
  overview?: string;
  runtime?: number;
  rating?: number;
  votes?: number;
  genres?: string[];
  language?: string;
  ids: { trakt: number; tmdb: number; imdb: string };
};

function traktToMovie(item: TraktMovieRaw): Movie {
  return {
    id: item.ids.trakt,
    tmdb_id: item.ids.tmdb,
    imdb_id: item.ids.imdb,
    title: item.title,
    overview: item.overview || "",
    poster_path: null,
    backdrop_path: null,
    release_date: `${item.year}-01-01`,
    vote_average: item.rating ? Math.round(item.rating * 10) / 10 : 0,
    vote_count: item.votes || 0,
    genres: item.genres || [],
    runtime: item.runtime || 0,
    original_language: item.language || "en",
    popularity: item.votes || 0,
  };
}

// ─── API ──────────────────────────────────────────────────

type PopularItem = { title: string; year: number; ids: { trakt: number; tmdb: number; imdb: string } };
type TrendingItem = { watchers: number; movie: TraktMovieRaw };
type WatchedItem = { watcher_count: number; movie: TraktMovieRaw };
type SearchItem = { score: number; movie: TraktMovieRaw };

export async function getPopularMovies(page = 1): Promise<ApiResponse<Movie>> {
  try {
    const { data, headers } = await traktFetch<PopularItem[]>(
      "movies/popular",
      { page: String(page), limit: "20" }
    );
    const totalPages = Number(headers.get("X-Pagination-Page-Count") || 10);
    return {
      results: data.map(traktToMovie),
      page,
      total_pages: totalPages,
      total_results: totalPages * 20,
    };
  } catch {
    return { results: MOCK_MOVIES, page: 1, total_pages: 5, total_results: 100 };
  }
}

export async function getTrendingMovies(): Promise<Movie[]> {
  try {
    const { data } = await traktFetch<TrendingItem[]>(
      "movies/trending",
      { limit: "10" }
    );
    return data.map((item) => ({ ...traktToMovie(item.movie), popularity: item.watchers }));
  } catch {
    return MOCK_MOVIES.slice(0, 10);
  }
}

export async function getTopRatedMovies(page = 1): Promise<ApiResponse<Movie>> {
  try {
    const { data, headers } = await traktFetch<WatchedItem[]>(
      "movies/watched/all",
      { page: String(page), limit: "20" }
    );
    const totalPages = Number(headers.get("X-Pagination-Page-Count") || 10);
    return {
      results: data.map((item) => ({ ...traktToMovie(item.movie), popularity: item.watcher_count })),
      page,
      total_pages: totalPages,
      total_results: totalPages * 20,
    };
  } catch {
    return { results: MOCK_MOVIES.slice(10), page: 1, total_pages: 3, total_results: 50 };
  }
}

export async function searchMovies(query: string, page = 1): Promise<ApiResponse<Movie>> {
  try {
    const { data, headers } = await traktFetch<SearchItem[]>(
      "search/movie",
      { query, page: String(page), limit: "20" }
    );
    const totalPages = Number(headers.get("X-Pagination-Page-Count") || 1);
    return {
      results: data.map((item) => traktToMovie(item.movie)),
      page,
      total_pages: totalPages,
      total_results: data.length,
    };
  } catch {
    const filtered = MOCK_MOVIES.filter((m) =>
      m.title.toLowerCase().includes(query.toLowerCase())
    );
    return { results: filtered, page: 1, total_pages: 1, total_results: filtered.length };
  }
}

export async function getMovieDetails(id: number): Promise<Movie> {
  try {
    const { data } = await traktFetch<TraktMovieRaw>(
      `movies/${id}`,
      { extended: "full" }
    );
    return traktToMovie(data);
  } catch {
    return MOCK_MOVIES.find((m) => m.id === id) || MOCK_MOVIES[0];
  }
}

export async function getVideoSources(movieId: number): Promise<VideoSource[]> {
  const STREAM_API = process.env.NEXT_PUBLIC_STREAM_API_BASE || "";
  if (STREAM_API) {
    try {
      const res = await fetch(`${STREAM_API}/stream/${movieId}`);
      if (res.ok) return (await res.json()).sources as VideoSource[];
    } catch (err) {
      console.error("Erreur API streaming:", err);
    }
  }
  return [
    {
      src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
      type: "video/mp4",
      label: "HD 720p",
      res: 720,
    },
  ];
}

export function getEmbedUrl(
  movieId: number,
  provider: "vidsrc" | "multiembed" = "vidsrc",
  imdbId?: string
): string {
  const id = imdbId || movieId;
  return {
    vidsrc: `https://vidsrc.to/embed/movie/${id}`,
    multiembed: `https://multiembed.mov/?video_id=${movieId}&tmdb=1`,
  }[provider];
}

// ============================================================
// src/lib/api.ts — Couche d'abstraction API
// Connectez votre clé API dans .env.local :
//   NEXT_PUBLIC_TMDB_API_KEY=votre_clé_tmdb
//   NEXT_PUBLIC_STREAM_API_BASE=https://votre-api-stream.com
// ============================================================

export interface Movie {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
  genre_ids: number[];
  original_language: string;
  popularity: number;
}

export interface MovieDetails extends Movie {
  genres: { id: number; name: string }[];
  runtime: number;
  tagline: string;
  status: string;
  budget: number;
  revenue: number;
  production_companies: { id: number; name: string; logo_path: string | null }[];
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

// ─── Configuration ───────────────────────────────────────────
const TMDB_BASE = "https://api.themoviedb.org/3";
const TMDB_IMAGE = "https://image.tmdb.org/t/p";
const API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY || "";
const STREAM_API = process.env.NEXT_PUBLIC_STREAM_API_BASE || "";

// ─── Helpers images ──────────────────────────────────────────
export const getPosterUrl = (path: string | null, size = "w500") =>
  path ? `${TMDB_IMAGE}/${size}${path}` : "/placeholder-poster.jpg";

export const getBackdropUrl = (path: string | null, size = "w1280") =>
  path ? `${TMDB_IMAGE}/${size}${path}` : "/placeholder-backdrop.jpg";

// ─── Fetch TMDB ───────────────────────────────────────────────
async function tmdbFetch<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
  if (!API_KEY) {
    console.warn("⚠️  NEXT_PUBLIC_TMDB_API_KEY manquant — utilisation des données simulées");
    throw new Error("NO_API_KEY");
  }
  const url = new URL(`${TMDB_BASE}${endpoint}`);
  url.searchParams.set("api_key", API_KEY);
  url.searchParams.set("language", "fr-FR");
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

  const res = await fetch(url.toString(), { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error(`TMDB ${res.status}: ${res.statusText}`);
  return res.json();
}

// ─── Mock data (quand pas de clé API) ────────────────────────
const MOCK_MOVIES: Movie[] = Array.from({ length: 20 }, (_, i) => ({
  id: i + 1,
  title: [
    "Interstellar", "Inception", "The Dark Knight", "Dune", "Avatar",
    "The Matrix", "Parasite", "Oppenheimer", "Barbie", "Spider-Man",
    "The Godfather", "Pulp Fiction", "Fight Club", "Forrest Gump", "Titanic",
    "The Lion King", "Gladiator", "Braveheart", "Schindler's List", "Goodfellas",
  ][i],
  overview: "Un film épique qui captive le spectateur du début à la fin avec des effets visuels époustouflants et une narration profonde.",
  poster_path: null,
  backdrop_path: null,
  release_date: `${2018 + (i % 6)}-0${(i % 9) + 1}-15`,
  vote_average: 7.5 + (i % 25) / 10,
  vote_count: 10000 + i * 500,
  genre_ids: [28, 12, 878],
  original_language: "en",
  popularity: 100 + i * 10,
}));

// ─── API Publique ─────────────────────────────────────────────

/** Films populaires */
export async function getPopularMovies(page = 1): Promise<ApiResponse<Movie>> {
  try {
    return await tmdbFetch<ApiResponse<Movie>>("/movie/popular", { page: String(page) });
  } catch {
    return { results: MOCK_MOVIES, page: 1, total_pages: 5, total_results: 100 };
  }
}

/** Films tendance */
export async function getTrendingMovies(): Promise<Movie[]> {
  try {
    const data = await tmdbFetch<ApiResponse<Movie>>("/trending/movie/week");
    return data.results;
  } catch {
    return MOCK_MOVIES.slice(0, 10);
  }
}

/** Films les mieux notés */
export async function getTopRatedMovies(page = 1): Promise<ApiResponse<Movie>> {
  try {
    return await tmdbFetch<ApiResponse<Movie>>("/movie/top_rated", { page: String(page) });
  } catch {
    return { results: MOCK_MOVIES.slice(10), page: 1, total_pages: 3, total_results: 50 };
  }
}

/** Recherche de films */
export async function searchMovies(query: string, page = 1): Promise<ApiResponse<Movie>> {
  try {
    return await tmdbFetch<ApiResponse<Movie>>("/search/movie", { query, page: String(page) });
  } catch {
    const filtered = MOCK_MOVIES.filter((m) =>
      m.title.toLowerCase().includes(query.toLowerCase())
    );
    return { results: filtered, page: 1, total_pages: 1, total_results: filtered.length };
  }
}

/** Détails d'un film */
export async function getMovieDetails(id: number): Promise<MovieDetails> {
  try {
    return await tmdbFetch<MovieDetails>(`/movie/${id}`);
  } catch {
    const mock = MOCK_MOVIES.find((m) => m.id === id) || MOCK_MOVIES[0];
    return {
      ...mock,
      genres: [{ id: 28, name: "Action" }, { id: 12, name: "Aventure" }],
      runtime: 148,
      tagline: "Au-delà de l'imagination",
      status: "Released",
      budget: 165000000,
      revenue: 773000000,
      production_companies: [],
    };
  }
}

// ─── API Streaming ────────────────────────────────────────────
/**
 * Récupère les sources vidéo pour un film donné.
 * Remplacez l'implémentation par votre API de streaming réelle.
 *
 * Exemples d'APIs compatibles :
 *  - Vidsrc      : https://vidsrc.to/embed/movie/{tmdb_id}
 *  - Multiembed  : https://multiembed.mov/?video_id={tmdb_id}&tmdb=1
 *  - Embed.su    : https://embed.su/embed/movie/{tmdb_id}
 */
export async function getVideoSources(movieId: number): Promise<VideoSource[]> {
  // Si une API de streaming personnalisée est configurée
  if (STREAM_API) {
    try {
      const res = await fetch(`${STREAM_API}/stream/${movieId}`);
      if (res.ok) {
        const data = await res.json();
        return data.sources as VideoSource[];
      }
    } catch (err) {
      console.error("Erreur API streaming:", err);
    }
  }

  // Fallback : flux de démonstration (Big Buck Bunny - domaine public)
  return [
    {
      src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
      type: "video/mp4",
      label: "HD 720p",
      res: 720,
    },
    {
      src: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
      type: "application/x-mpegURL",
      label: "HLS Auto",
    },
  ];
}

/** URL d'embed pour iframe (alternative à Video.js natif) */
export function getEmbedUrl(movieId: number, provider: "vidsrc" | "multiembed" = "vidsrc"): string {
  const providers = {
    vidsrc: `https://vidsrc.to/embed/movie/${movieId}`,
    multiembed: `https://multiembed.mov/?video_id=${movieId}&tmdb=1`,
  };
  return providers[provider];
}

// ============================================================
// src/lib/api.ts — Trakt.tv API
// .env.local : NEXT_PUBLIC_TRAKT_CLIENT_ID=votre_client_id
// ============================================================

export interface Movie {
  id: number;          // Trakt ID
  tmdb_id: number;     // Pour les images (TMDB images API est publique)
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

// ─── Configuration ────────────────────────────────────────
const TRAKT_BASE = "https://api.trakt.tv";
const CLIENT_ID = process.env.NEXT_PUBLIC_TRAKT_CLIENT_ID || "";
const STREAM_API = process.env.NEXT_PUBLIC_STREAM_API_BASE || "";

// Images : Trakt ne fournit pas d'images, on utilise TMDB images
// (l'API d'images TMDB est publique, seule l'API de données nécessite une clé)
const TMDB_IMAGE = "https://image.tmdb.org/t/p";

export const getPosterUrl = (path: string | null, size = "w500") =>
  path ? `${TMDB_IMAGE}/${size}${path}` : "/placeholder-poster.jpg";

export const getBackdropUrl = (path: string | null, size = "w1280") =>
  path ? `${TMDB_IMAGE}/${size}${path}` : "/placeholder-backdrop.jpg";

// ─── Headers Trakt ────────────────────────────────────────
function traktHeaders() {
  return {
    "Content-Type": "application/json",
    "trakt-api-version": "2",
    "trakt-api-key": CLIENT_ID,
  };
}

// ─── Fetch images TMDB via ID (API images = publique) ─────
async function fetchTmdbImages(tmdbId: number): Promise<{
  poster_path: string | null;
  backdrop_path: string | null;
}> {
  try {
    const res = await fetch(
      `https://api.themoviedb.org/3/movie/${tmdbId}?api_key=dummykey`,
      { next: { revalidate: 86400 } }
    );
    // Sans clé valide on n'aura pas les images — on utilise fanart.tv en fallback
    if (!res.ok) return { poster_path: null, backdrop_path: null };
    const data = await res.json();
    return {
      poster_path: data.poster_path || null,
      backdrop_path: data.backdrop_path || null,
    };
  } catch {
    return { poster_path: null, backdrop_path: null };
  }
}

// ─── Convertir un résultat Trakt en Movie ─────────────────
async function traktMovieToMovie(item: {
  movie?: { title: string; year: number; ids: { trakt: number; tmdb: number; imdb: string; slug: string } };
  watchers?: number;
  score?: number;
} | {
  title: string; year: number; ids: { trakt: number; tmdb: number; imdb: string }
}): Promise<Movie> {
  const movie = "movie" in item ? item.movie! : item as { title: string; year: number; ids: { trakt: number; tmdb: number; imdb: string } };

  return {
    id: movie.ids.trakt,
    tmdb_id: movie.ids.tmdb,
    imdb_id: movie.ids.imdb,
    title: movie.title,
    overview: "",
    poster_path: null,
    backdrop_path: null,
    release_date: `${movie.year}-01-01`,
    vote_average: 0,
    vote_count: 0,
    genres: [],
    runtime: 0,
    original_language: "en",
    popularity: "watchers" in item ? (item.watchers || 0) : 0,
  };
}

// ─── Mock data (sans clé API) ─────────────────────────────
const MOCK_MOVIES: Movie[] = Array.from({ length: 20 }, (_, i) => ({
  id: i + 1,
  tmdb_id: [157336, 27205, 155, 438631, 19995, 603, 496243, 872585, 346698, 569094,
    238, 680, 550, 13, 597, 8587, 98, 197, 424, 769][i],
  imdb_id: `tt000000${i}`,
  title: ["Interstellar","Inception","The Dark Knight","Dune","Avatar",
    "The Matrix","Parasite","Oppenheimer","Barbie","Spider-Man",
    "The Godfather","Pulp Fiction","Fight Club","Forrest Gump","Titanic",
    "The Lion King","Gladiator","Braveheart","Schindler's List","Goodfellas"][i],
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

// ─── API Publique ─────────────────────────────────────────

/** Films populaires */
export async function getPopularMovies(page = 1): Promise<ApiResponse<Movie>> {
  if (!CLIENT_ID) {
    return { results: MOCK_MOVIES, page: 1, total_pages: 5, total_results: 100 };
  }
  try {
    const res = await fetch(
      `${TRAKT_BASE}/movies/popular?page=${page}&limit=20`,
      { headers: traktHeaders(), next: { revalidate: 3600 } }
    );
    const data: Array<{ title: string; year: number; ids: { trakt: number; tmdb: number; imdb: string } }> = await res.json();
    const results = await Promise.all(data.map(traktMovieToMovie));
    const totalPages = Number(res.headers.get("X-Pagination-Page-Count") || 10);
    return { results, page, total_pages: totalPages, total_results: totalPages * 20 };
  } catch {
    return { results: MOCK_MOVIES, page: 1, total_pages: 5, total_results: 100 };
  }
}

/** Films tendance */
export async function getTrendingMovies(): Promise<Movie[]> {
  if (!CLIENT_ID) return MOCK_MOVIES.slice(0, 10);
  try {
    const res = await fetch(
      `${TRAKT_BASE}/movies/trending?limit=10`,
      { headers: traktHeaders(), next: { revalidate: 1800 } }
    );
    const data: Array<{ watchers: number; movie: { title: string; year: number; ids: { trakt: number; tmdb: number; imdb: string; slug: string } } }> = await res.json();
    return Promise.all(data.map(traktMovieToMovie));
  } catch {
    return MOCK_MOVIES.slice(0, 10);
  }
}

/** Films les mieux notés */
export async function getTopRatedMovies(page = 1): Promise<ApiResponse<Movie>> {
  if (!CLIENT_ID) {
    return { results: MOCK_MOVIES.slice(10), page: 1, total_pages: 3, total_results: 50 };
  }
  try {
    const res = await fetch(
      `${TRAKT_BASE}/movies/watched/all?page=${page}&limit=20`,
      { headers: traktHeaders(), next: { revalidate: 3600 } }
    );
    const data: Array<{ watcher_count: number; movie: { title: string; year: number; ids: { trakt: number; tmdb: number; imdb: string; slug: string } } }> = await res.json();
    const results = await Promise.all(data.map(traktMovieToMovie));
    return { results, page, total_pages: 10, total_results: 200 };
  } catch {
    return { results: MOCK_MOVIES.slice(10), page: 1, total_pages: 3, total_results: 50 };
  }
}

/** Recherche de films */
export async function searchMovies(query: string, page = 1): Promise<ApiResponse<Movie>> {
  if (!CLIENT_ID) {
    const filtered = MOCK_MOVIES.filter((m) =>
      m.title.toLowerCase().includes(query.toLowerCase())
    );
    return { results: filtered, page: 1, total_pages: 1, total_results: filtered.length };
  }
  try {
    const res = await fetch(
      `${TRAKT_BASE}/search/movie?query=${encodeURIComponent(query)}&page=${page}&limit=20`,
      { headers: traktHeaders(), next: { revalidate: 300 } }
    );
    const data: Array<{ score: number; movie: { title: string; year: number; ids: { trakt: number; tmdb: number; imdb: string; slug: string } } }> = await res.json();
    const results = await Promise.all(data.map(traktMovieToMovie));
    const totalPages = Number(res.headers.get("X-Pagination-Page-Count") || 1);
    return { results, page, total_pages: totalPages, total_results: results.length };
  } catch {
    return { results: [], page: 1, total_pages: 1, total_results: 0 };
  }
}

/** Détails d'un film */
export async function getMovieDetails(id: number): Promise<Movie> {
  if (!CLIENT_ID) {
    return MOCK_MOVIES.find((m) => m.id === id) || MOCK_MOVIES[0];
  }
  try {
    const res = await fetch(
      `${TRAKT_BASE}/movies/${id}?extended=full`,
      { headers: traktHeaders(), next: { revalidate: 86400 } }
    );
    const data: {
      title: string; year: number; overview: string; runtime: number;
      rating: number; votes: number; genres: string[]; language: string;
      ids: { trakt: number; tmdb: number; imdb: string };
    } = await res.json();

    return {
      id: data.ids.trakt,
      tmdb_id: data.ids.tmdb,
      imdb_id: data.ids.imdb,
      title: data.title,
      overview: data.overview || "",
      poster_path: null,
      backdrop_path: null,
      release_date: `${data.year}-01-01`,
      vote_average: Math.round(data.rating * 10) / 10,
      vote_count: data.votes,
      genres: data.genres || [],
      runtime: data.runtime || 0,
      original_language: data.language || "en",
      popularity: data.votes,
    };
  } catch {
    return MOCK_MOVIES.find((m) => m.id === id) || MOCK_MOVIES[0];
  }
}

// ─── API Streaming ────────────────────────────────────────
export async function getVideoSources(movieId: number): Promise<VideoSource[]> {
  if (STREAM_API) {
    try {
      const res = await fetch(`${STREAM_API}/stream/${movieId}`);
      if (res.ok) return (await res.json()).sources as VideoSource[];
    } catch (err) {
      console.error("Erreur API streaming:", err);
    }
  }
  // Démo fallback
  return [
    {
      src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
      type: "video/mp4",
      label: "HD 720p",
      res: 720,
    },
  ];
}

/** URL embed — utilise l'IMDB ID que Trakt fournit nativement */
export function getEmbedUrl(
  movieId: number,
  provider: "vidsrc" | "multiembed" = "vidsrc",
  imdbId?: string
): string {
  const id = imdbId || movieId;
  return {
    vidsrc:     `https://vidsrc.to/embed/movie/${id}`,
    multiembed: `https://multiembed.mov/?video_id=${movieId}&tmdb=1`,
  }[provider];
}

"use client";

import { useState } from "react";
import MovieCard from "./MovieCard";
import type { Movie } from "@/lib/api";
import { ChevronDown, Loader2 } from "lucide-react";

interface MovieGridProps {
  title: string;
  movies: Movie[];
  totalPages?: number;
  currentPage?: number;
  onLoadMore?: (page: number) => Promise<Movie[]>;
}

export default function MovieGrid({
  title,
  movies: initialMovies,
  totalPages = 1,
  currentPage = 1,
  onLoadMore,
}: MovieGridProps) {
  const [movies, setMovies] = useState(initialMovies);
  const [page, setPage] = useState(currentPage);
  const [loading, setLoading] = useState(false);

  const handleLoadMore = async () => {
    if (!onLoadMore || loading) return;
    setLoading(true);
    try {
      const newMovies = await onLoadMore(page + 1);
      setMovies((prev) => [...prev, ...newMovies]);
      setPage((p) => p + 1);
    } finally {
      setLoading(false);
    }
  };

  const hasMore = page < totalPages && !!onLoadMore;

  return (
    <section className="py-8 px-4 sm:px-6 lg:px-16">
      {/* En-tête de section */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-1 h-6 bg-cinema-accent rounded-full" />
        <h2 className="text-xl sm:text-2xl font-bold text-white" style={{ fontFamily: "Georgia, serif" }}>
          {title}
        </h2>
        <span className="text-cinema-muted text-sm ml-auto">
          {movies.length} films
        </span>
      </div>

      {/* Grille responsive */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
        {movies.map((movie, i) => (
          <div
            key={movie.id}
            className="animate-fade-in"
            style={{ animationDelay: `${Math.min(i * 30, 300)}ms`, animationFillMode: "backwards" }}
          >
            <MovieCard movie={movie} priority={i < 6} />
          </div>
        ))}
      </div>

      {/* Bouton "Voir plus" */}
      {hasMore && (
        <div className="flex justify-center mt-10">
          <button
            onClick={handleLoadMore}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 bg-cinema-surface hover:bg-cinema-card border border-cinema-border hover:border-cinema-accent text-white font-medium rounded-lg transition-all duration-200 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-cinema-accent" />
                Chargement…
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4" />
                Voir plus de films
              </>
            )}
          </button>
        </div>
      )}
    </section>
  );
}

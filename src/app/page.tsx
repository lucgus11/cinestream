import { Suspense } from "react";
import { getPopularMovies, getTrendingMovies, getTopRatedMovies, searchMovies } from "@/lib/api";
import HeroSection from "@/components/HeroSection";
import MovieGrid from "@/components/MovieGrid";

interface PageProps {
  searchParams: { q?: string; category?: string };
}

// Squelette de chargement
function GridSkeleton({ title }: { title: string }) {
  return (
    <section className="py-8 px-4 sm:px-6 lg:px-16">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-1 h-6 bg-cinema-accent rounded-full" />
        <div className="h-7 w-48 bg-cinema-card rounded animate-pulse" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="aspect-[2/3] rounded-lg bg-shimmer bg-[length:700px_100%] animate-shimmer" />
        ))}
      </div>
    </section>
  );
}

export default async function HomePage({ searchParams }: PageProps) {
  const query = searchParams.q;
  const category = searchParams.category;

  // Fetch des données en parallèle
  const [trending, popular, topRated] = await Promise.all([
    getTrendingMovies(),
    getPopularMovies(1),
    getTopRatedMovies(1),
  ]);

  // Résultats de recherche
  let searchResults = null;
  if (query) {
    searchResults = await searchMovies(query);
  }

  return (
    <>
      {/* Hero (uniquement si pas de recherche) */}
      {!query && <HeroSection movies={trending} />}

      {/* Recherche */}
      {query && searchResults && (
        <div className="pt-24">
          <MovieGrid
            title={`Résultats pour "${query}" (${searchResults.total_results})`}
            movies={searchResults.results}
            totalPages={searchResults.total_pages}
          />
        </div>
      )}

      {/* Catégories principales */}
      {!query && (
        <div className="space-y-2">
          {/* Trending */}
          {(!category || category === "trending") && (
            <Suspense fallback={<GridSkeleton title="Tendances" />}>
              <MovieGrid
                title="🔥 Tendances cette semaine"
                movies={trending}
              />
            </Suspense>
          )}

          {/* Populaires */}
          {(!category || category === "popular") && (
            <Suspense fallback={<GridSkeleton title="Populaires" />}>
              <MovieGrid
                title="🎬 Films populaires"
                movies={popular.results}
                totalPages={popular.total_pages}
              />
            </Suspense>
          )}

          {/* Top Rated */}
          {(!category || category === "top_rated") && (
            <Suspense fallback={<GridSkeleton title="Les mieux notés" />}>
              <MovieGrid
                title="⭐ Les mieux notés"
                movies={topRated.results}
                totalPages={topRated.total_pages}
              />
            </Suspense>
          )}
        </div>
      )}
    </>
  );
}

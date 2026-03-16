import { getArchiveMovies, getArchiveRssFeed, SAFE_COLLECTIONS } from "@/lib/archive";
import ArchiveMovieCard from "@/components/ArchiveMovieCard";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Films Gratuits – Domaine Public",
  description: "Films du domaine public disponibles gratuitement via Archive.org",
};

export default async function ArchivePage() {
  const [featured, silent, noir] = await Promise.all([
    getArchiveMovies("feature_films", 1, 12),
    getArchiveMovies("silent_films", 1, 8),
    getArchiveMovies("film_noir", 1, 8),
  ]);

  return (
    <div className="min-h-screen bg-cinema-bg pt-20 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-1 h-8 bg-green-500 rounded-full" />
            <h1 className="text-3xl font-bold text-white" style={{ fontFamily: "Georgia, serif" }}>
              Films Gratuits
            </h1>
          </div>
          <p className="text-cinema-muted text-sm ml-4">
            Films du domaine public hébergés légalement sur{" "}
            <a href="https://archive.org" target="_blank" rel="noopener noreferrer" className="text-green-400 hover:underline">
              Archive.org
            </a>
          </p>
        </div>

        {/* Films classiques */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-1 h-5 bg-cinema-accent rounded-full" />
            <h2 className="text-xl font-bold text-white">🎬 Films Classiques</h2>
            <span className="text-cinema-muted text-sm ml-auto">{featured.total.toLocaleString()} films</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
            {featured.movies.map((movie) => (
              <ArchiveMovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        </section>

        {/* Films muets */}
        {silent.movies.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-1 h-5 bg-cinema-accent rounded-full" />
              <h2 className="text-xl font-bold text-white">🎥 Films Muets</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
              {silent.movies.map((movie) => (
                <ArchiveMovieCard key={movie.id} movie={movie} />
              ))}
            </div>
          </section>
        )}

        {/* Film Noir */}
        {noir.movies.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-1 h-5 bg-cinema-accent rounded-full" />
              <h2 className="text-xl font-bold text-white">🕵️ Film Noir</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
              {noir.movies.map((movie) => (
                <ArchiveMovieCard key={movie.id} movie={movie} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

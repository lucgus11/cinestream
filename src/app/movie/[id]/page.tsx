import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Star, Clock, Calendar, Play, ArrowLeft, TrendingUp } from "lucide-react";
import { getMovieDetails, getPosterUrl, getBackdropUrl } from "@/lib/api";

type PageProps = {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  try {
    const { id } = await params;
    const movie = await getMovieDetails(Number(id));
    return {
      title: movie.title,
      description: movie.overview,
    };
  } catch {
    return { title: "Film introuvable" };
  }
}

export default async function MoviePage({ params }: PageProps) {
  const { id } = await params;
  const movieId = Number(id);
  if (isNaN(movieId)) notFound();

  const movie = await getMovieDetails(movieId).catch(() => null);
  if (!movie) notFound();

  const posterUrl = getPosterUrl(movie.poster_path, "w500");
  const backdropUrl = getBackdropUrl(movie.backdrop_path);
  const year = movie.release_date ? new Date(movie.release_date).getFullYear() : "";
  const runtime = movie.runtime
    ? `${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}min`
    : null;

  return (
    <div className="min-h-screen bg-cinema-bg">
      {/* Backdrop en arrière-plan */}
      {movie.backdrop_path && (
        <div className="fixed inset-0 z-0 opacity-10">
          <Image src={backdropUrl} alt="" fill className="object-cover" priority />
          <div className="absolute inset-0 bg-cinema-bg/80" />
        </div>
      )}

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        {/* Retour */}
        <Link href="/" className="inline-flex items-center gap-2 text-cinema-muted hover:text-white mb-8 group transition-colors">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm">Retour au catalogue</span>
        </Link>

        <div className="flex flex-col sm:flex-row gap-8">
          {/* Affiche */}
          <div className="shrink-0 mx-auto sm:mx-0">
            <div className="relative w-52 aspect-[2/3] rounded-xl overflow-hidden shadow-2xl shadow-black/60">
              <Image
                src={posterUrl}
                alt={movie.title}
                fill
                className="object-cover"
                sizes="208px"
                priority
              />
            </div>
          </div>

          {/* Infos */}
          <div className="flex-1 min-w-0">
            <h1 className="text-3xl sm:text-4xl font-bold text-white leading-tight mb-2" style={{ fontFamily: "Georgia, serif" }}>
              {movie.title}
            </h1>

            {movie.tagline && (
              <p className="text-cinema-accent italic text-sm mb-4">{movie.tagline}</p>
            )}

            {/* Meta row */}
            <div className="flex flex-wrap items-center gap-4 mb-5">
              <div className="flex items-center gap-1.5">
                <Star className="w-4 h-4 text-cinema-gold fill-cinema-gold" />
                <span className="text-white font-semibold">{movie.vote_average.toFixed(1)}</span>
                <span className="text-cinema-muted text-sm">/ 10</span>
              </div>
              {runtime && (
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-cinema-muted" />
                  <span className="text-cinema-muted text-sm">{runtime}</span>
                </div>
              )}
              {year && (
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-cinema-muted" />
                  <span className="text-cinema-muted text-sm">{year}</span>
                </div>
              )}
              <div className="flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-cinema-muted" />
                <span className="text-cinema-muted text-sm">{movie.vote_count.toLocaleString()} votes</span>
              </div>
            </div>

            {/* Genres */}
            {movie.genres && movie.genres.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-5">
                {movie.genres.map((g) => (
                  <span key={g.id} className="px-3 py-1 bg-cinema-surface border border-cinema-border text-cinema-text text-xs rounded-full">
                    {g.name}
                  </span>
                ))}
              </div>
            )}

            {/* Synopsis */}
            <p className="text-cinema-muted leading-relaxed mb-6 text-sm sm:text-base">
              {movie.overview || "Aucune description disponible."}
            </p>

            {/* CTA */}
            <Link
              href={`/watch/${movie.id}`}
              className="inline-flex items-center gap-2 bg-cinema-accent hover:bg-cinema-accent-hover text-white font-semibold px-6 py-3 rounded-lg transition-all hover:scale-105 active:scale-95 shadow-lg shadow-cinema-accent/30"
            >
              <Play className="w-5 h-5 fill-white" />
              Regarder maintenant
            </Link>
          </div>
        </div>

        {/* Détails supplémentaires */}
        {(movie.budget > 0 || movie.revenue > 0 || movie.status) && (
          <div className="mt-12 grid grid-cols-2 sm:grid-cols-3 gap-4">
            {movie.status && (
              <div className="bg-cinema-surface border border-cinema-border rounded-xl p-4">
                <p className="text-cinema-muted text-xs uppercase tracking-widest mb-1">Statut</p>
                <p className="text-white font-semibold text-sm">{movie.status}</p>
              </div>
            )}
            {movie.budget > 0 && (
              <div className="bg-cinema-surface border border-cinema-border rounded-xl p-4">
                <p className="text-cinema-muted text-xs uppercase tracking-widest mb-1">Budget</p>
                <p className="text-white font-semibold text-sm">
                  ${(movie.budget / 1_000_000).toFixed(0)}M
                </p>
              </div>
            )}
            {movie.revenue > 0 && (
              <div className="bg-cinema-surface border border-cinema-border rounded-xl p-4">
                <p className="text-cinema-muted text-xs uppercase tracking-widest mb-1">Recettes</p>
                <p className="text-white font-semibold text-sm">
                  ${(movie.revenue / 1_000_000).toFixed(0)}M
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

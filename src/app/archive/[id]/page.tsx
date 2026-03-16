import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Clock, Calendar, Archive, ExternalLink } from "lucide-react";
import { getArchiveMovieDetails } from "@/lib/archive";
import VideoPlayer from "@/components/VideoPlayer";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const movie = await getArchiveMovieDetails(id).catch(() => null);
  return {
    title: movie ? movie.title + " – Gratuit" : "Film introuvable",
    description: movie?.description || "",
  };
}

export default async function ArchiveMoviePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const movie = await getArchiveMovieDetails(id).catch(() => null);
  if (!movie) notFound();

  const archiveUrl = "https://archive.org/details/" + movie.id;

  return (
    <div className="min-h-screen bg-cinema-bg pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

        <Link
          href="/archive"
          className="inline-flex items-center gap-2 text-cinema-muted hover:text-white mb-6 group transition-colors"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm">Films gratuits</span>
        </Link>

        <div className="grid lg:grid-cols-3 gap-8">

          <div className="lg:col-span-2 space-y-4">

            {movie.sources.length > 0 && (
              <VideoPlayer
                sources={movie.sources}
                poster={movie.poster_url ?? undefined}
                title={movie.title}
                className="shadow-2xl shadow-black/60"
              />
            )}

            {movie.sources.length === 0 && (
              <div className="aspect-video bg-cinema-surface rounded-lg flex items-center justify-center">
                <div className="text-center px-6">
                  <Archive className="w-12 h-12 text-cinema-muted mx-auto mb-3" />
                  <p className="text-cinema-muted text-sm mb-4">
                    Flux vidéo non disponible directement
                  </p>
                  
                    href={archiveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-cinema-accent text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-cinema-accent-hover transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Voir sur Archive.org</span>
                  </a>
                </div>
              </div>
            )}

            
              href={archiveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-green-400 hover:text-green-300 text-xs transition-colors"
            >
              <ExternalLink className="w-3 h-3" />
              <span>Voir la fiche complète sur Archive.org</span>
            </a>

          </div>

          <div className="space-y-5">

            <div>
              <div className="flex items-center gap-2 mb-2">
                <Archive className="w-4 h-4 text-green-500" />
                <span className="text-green-500 text-xs font-semibold uppercase tracking-wider">
                  Domaine Public Gratuit
                </span>
              </div>
              <h1
                className="text-2xl font-bold text-white leading-tight"
                style={{ fontFamily: "Georgia, serif" }}
              >
                {movie.title}
              </h1>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {movie.year && (
                <div className="bg-cinema-surface border border-cinema-border rounded-lg p-3 text-center">
                  <Calendar className="w-4 h-4 text-cinema-accent mx-auto mb-1" />
                  <p className="text-white font-bold text-sm">{movie.year}</p>
                  <p className="text-cinema-muted text-xs">Année</p>
                </div>
              )}
              {movie.runtime && (
                <div className="bg-cinema-surface border border-cinema-border rounded-lg p-3 text-center">
                  <Clock className="w-4 h-4 text-cinema-accent mx-auto mb-1" />
                  <p className="text-white font-bold text-sm">{movie.runtime} min</p>
                  <p className="text-cinema-muted text-xs">Durée</p>
                </div>
              )}
            </div>

            {movie.creator && (
              <div>
                <h3 className="text-cinema-muted text-xs uppercase tracking-widest mb-1 font-semibold">
                  Réalisateur
                </h3>
                <p className="text-white text-sm">{movie.creator}</p>
              </div>
            )}

            {movie.description && (
              <div>
                <h3 className="text-cinema-muted text-xs uppercase tracking-widest mb-2 font-semibold">
                  Synopsis
                </h3>
                <p className="text-cinema-muted text-sm leading-relaxed line-clamp-6">
                  {movie.description.replace(/<[^>]+>/g, "")}
                </p>
              </div>
            )}

            {movie.subject.length > 0 && (
              <div>
                <h3 className="text-cinema-muted text-xs uppercase tracking-widest mb-2 font-semibold">
                  Genres
                </h3>
                <div className="flex flex-wrap gap-2">
                  {movie.subject.slice(0, 6).map((s) => (
                    <span
                      key={s}
                      className="px-2.5 py-1 bg-cinema-surface border border-cinema-border text-cinema-text text-xs rounded-full"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {movie.sources.length > 0 && (
              <div>
                <h3 className="text-cinema-muted text-xs uppercase tracking-widest mb-2 font-semibold">
                  Qualités disponibles
                </h3>
                <div className="flex flex-wrap gap-2">
                  {movie.sources.map((s) => (
                    <span
                      key={s.src}
                      className="px-2.5 py-1 bg-green-900/30 border border-green-700/40 text-green-400 text-xs rounded-full"
                    >
                      {s.label}
                    </span>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Star, Clock, Calendar, Play, Monitor } from "lucide-react";
import type { MovieDetails, VideoSource } from "@/lib/api";
import VideoPlayer from "@/components/VideoPlayer";
import { getEmbedUrl } from "@/lib/api";

interface WatchClientProps {
  movie: MovieDetails;
  sources: VideoSource[];
  posterUrl: string;
}

type PlayerMode = "videojs" | "embed";

export default function WatchClient({ movie, sources, posterUrl }: WatchClientProps) {
  const [playerMode, setPlayerMode] = useState<PlayerMode>("videojs");
  const [isReady, setIsReady] = useState(false);

  const year = movie.release_date ? new Date(movie.release_date).getFullYear() : "";
  const runtime = movie.runtime
    ? `${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}min`
    : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      
      {/* Retour */}
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-cinema-muted hover:text-white transition-colors mb-6 group"
      >
        <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
        <span className="text-sm font-medium">Retour au catalogue</span>
      </Link>

      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Colonne principale : Player */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* Sélecteur de mode */}
          <div className="flex items-center gap-2">
            <span className="text-cinema-muted text-xs">Lecteur :</span>
            <div className="flex bg-cinema-surface border border-cinema-border rounded-lg p-1 gap-1">
              {(["videojs", "embed"] as PlayerMode[]).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setPlayerMode(mode)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                    playerMode === mode
                      ? "bg-cinema-accent text-white"
                      : "text-cinema-muted hover:text-white"
                  }`}
                >
                  {mode === "videojs" ? <Play className="w-3 h-3" /> : <Monitor className="w-3 h-3" />}
                  {mode === "videojs" ? "Video.js" : "Embed"}
                </button>
              ))}
            </div>
          </div>

          {/* Player Video.js */}
          {playerMode === "videojs" && (
            <VideoPlayer
              sources={sources}
              poster={posterUrl}
              title={movie.title}
              onReady={() => setIsReady(true)}
              className="shadow-2xl shadow-black/60"
            />
          )}

          {/* Player Embed (iframe) */}
          {playerMode === "embed" && (
            <div className="relative aspect-video w-full bg-black rounded-lg overflow-hidden shadow-2xl shadow-black/60">
              <iframe
                src={getEmbedUrl(movie.id, "vidsrc")}
                className="absolute inset-0 w-full h-full"
                allowFullScreen
                allow="autoplay; encrypted-media; picture-in-picture"
                referrerPolicy="origin"
                title={movie.title}
              />
            </div>
          )}

          {/* Aide touches clavier */}
          {playerMode === "videojs" && isReady && (
            <div className="flex flex-wrap gap-2">
              {[
                { key: "Espace / K", label: "Play/Pause" },
                { key: "← →", label: "±10 secondes" },
                { key: "↑ ↓", label: "Volume" },
                { key: "F", label: "Plein écran" },
                { key: "M", label: "Muet" },
              ].map(({ key, label }) => (
                <div key={key} className="flex items-center gap-1.5 bg-cinema-surface px-2.5 py-1.5 rounded-md border border-cinema-border">
                  <kbd className="font-mono text-cinema-accent text-xs">{key}</kbd>
                  <span className="text-cinema-muted text-xs">{label}</span>
                </div>
              ))}
            </div>
          )}

          {/* Description (mobile) */}
          <div className="lg:hidden">
            <h1 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: "Georgia, serif" }}>
              {movie.title}
            </h1>
            {movie.tagline && (
              <p className="text-cinema-accent text-sm italic mb-3">{movie.tagline}</p>
            )}
            <p className="text-cinema-muted text-sm leading-relaxed">{movie.overview}</p>
          </div>
        </div>

        {/* Colonne latérale : Infos film */}
        <div className="space-y-6">
          
          {/* Affiche + titre (desktop) */}
          <div className="hidden lg:flex gap-4">
            <div className="relative w-28 aspect-[2/3] rounded-lg overflow-hidden shrink-0 shadow-xl">
              <Image
                src={posterUrl}
                alt={movie.title}
                fill
                className="object-cover"
                sizes="112px"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold text-white leading-tight" style={{ fontFamily: "Georgia, serif" }}>
                {movie.title}
              </h1>
              {movie.tagline && (
                <p className="text-cinema-accent text-xs italic mt-1">{movie.tagline}</p>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-cinema-surface border border-cinema-border rounded-lg p-3 text-center">
              <Star className="w-4 h-4 text-cinema-gold fill-cinema-gold mx-auto mb-1" />
              <p className="text-white font-bold text-sm">{movie.vote_average.toFixed(1)}</p>
              <p className="text-cinema-muted text-xs">Note</p>
            </div>
            {runtime && (
              <div className="bg-cinema-surface border border-cinema-border rounded-lg p-3 text-center">
                <Clock className="w-4 h-4 text-cinema-accent mx-auto mb-1" />
                <p className="text-white font-bold text-sm">{runtime}</p>
                <p className="text-cinema-muted text-xs">Durée</p>
              </div>
            )}
            {year && (
              <div className="bg-cinema-surface border border-cinema-border rounded-lg p-3 text-center">
                <Calendar className="w-4 h-4 text-cinema-accent mx-auto mb-1" />
                <p className="text-white font-bold text-sm">{year}</p>
                <p className="text-cinema-muted text-xs">Année</p>
              </div>
            )}
          </div>

          {/* Genres */}
          {movie.genres && movie.genres.length > 0 && (
            <div>
              <h3 className="text-cinema-muted text-xs uppercase tracking-widest mb-2 font-semibold">Genres</h3>
              <div className="flex flex-wrap gap-2">
                {movie.genres.map((g) => (
                  <span key={g.id} className="px-2.5 py-1 bg-cinema-surface border border-cinema-border text-cinema-text text-xs rounded-full">
                    {g.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Synopsis (desktop) */}
          <div className="hidden lg:block">
            <h3 className="text-cinema-muted text-xs uppercase tracking-widest mb-2 font-semibold">Synopsis</h3>
            <p className="text-cinema-muted text-sm leading-relaxed">
              {movie.overview || "Aucune description disponible."}
            </p>
          </div>

          {/* Langue originale */}
          <div>
            <h3 className="text-cinema-muted text-xs uppercase tracking-widest mb-2 font-semibold">Langue originale</h3>
            <span className="uppercase text-xs font-bold text-white bg-cinema-surface border border-cinema-border px-2 py-1 rounded">
              {movie.original_language}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

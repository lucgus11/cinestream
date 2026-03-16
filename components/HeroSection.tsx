"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Play, Info, Star, ChevronLeft, ChevronRight } from "lucide-react";
import type { Movie } from "@/lib/api";
import { getBackdropUrl } from "@/lib/api";

interface HeroSectionProps {
  movies: Movie[];
}

export default function HeroSection({ movies }: HeroSectionProps) {
  const [current, setCurrent] = useState(0);
  const [transitioning, setTransitioning] = useState(false);

  const featured = movies.slice(0, 5);

  useEffect(() => {
    const timer = setInterval(() => goTo((current + 1) % featured.length), 7000);
    return () => clearInterval(timer);
  }, [current, featured.length]);

  const goTo = (index: number) => {
    if (transitioning) return;
    setTransitioning(true);
    setTimeout(() => {
      setCurrent(index);
      setTransitioning(false);
    }, 300);
  };

  const movie = featured[current];
  if (!movie) return null;

  const backdropUrl = getBackdropUrl(movie.backdrop_path);
  const year = movie.release_date ? new Date(movie.release_date).getFullYear() : "";

  return (
    <div className="relative w-full h-[70vh] min-h-[500px] max-h-[750px] overflow-hidden bg-cinema-bg">
      
      {/* Backdrop */}
      <div
        className={`absolute inset-0 transition-opacity duration-500 ${transitioning ? "opacity-0" : "opacity-100"}`}
      >
        {movie.backdrop_path ? (
          <Image
            src={backdropUrl}
            alt={movie.title}
            fill
            className="object-cover object-center"
            priority
            sizes="100vw"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-cinema-card via-cinema-surface to-cinema-bg" />
        )}
      </div>

      {/* Overlays */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-cinema-bg via-transparent to-black/30" />

      {/* Contenu */}
      <div
        className={`relative z-10 h-full flex flex-col justify-end pb-16 px-6 sm:px-10 lg:px-16 max-w-3xl transition-all duration-500 ${
          transitioning ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"
        }`}
      >
        {/* Badge */}
        <div className="flex items-center gap-2 mb-3">
          <span className="bg-cinema-accent text-white text-xs font-bold px-2 py-0.5 rounded uppercase tracking-wider">
            À la une
          </span>
          {year && (
            <span className="text-cinema-muted text-xs">{year}</span>
          )}
        </div>

        {/* Titre */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-3 leading-tight" style={{ fontFamily: "Georgia, serif", textShadow: "0 2px 20px rgba(0,0,0,0.8)" }}>
          {movie.title}
        </h1>

        {/* Meta */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 text-cinema-gold fill-cinema-gold" />
            <span className="text-white font-semibold text-sm">{movie.vote_average.toFixed(1)}</span>
          </div>
          <span className="text-cinema-muted text-sm">•</span>
          <span className="text-cinema-muted text-sm">{movie.vote_count.toLocaleString()} votes</span>
        </div>

        {/* Description */}
        <p className="text-cinema-muted text-sm sm:text-base leading-relaxed mb-6 line-clamp-2 sm:line-clamp-3 max-w-xl">
          {movie.overview || "Aucune description disponible."}
        </p>

        {/* Boutons */}
        <div className="flex flex-wrap gap-3">
          <Link
            href={`/watch/${movie.id}`}
            className="flex items-center gap-2 bg-cinema-accent hover:bg-cinema-accent-hover text-white font-semibold px-6 py-3 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg shadow-cinema-accent/30"
          >
            <Play className="w-5 h-5 fill-white" />
            Regarder maintenant
          </Link>
          <Link
            href={`/movie/${movie.id}`}
            className="flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white font-semibold px-6 py-3 rounded-lg transition-all duration-200 border border-white/20"
          >
            <Info className="w-5 h-5" />
            Plus d&apos;infos
          </Link>
        </div>
      </div>

      {/* Flèches navigation */}
      {featured.length > 1 && (
        <>
          <button
            onClick={() => goTo((current - 1 + featured.length) % featured.length)}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2 bg-black/50 hover:bg-black/80 text-white rounded-full transition-all duration-200 backdrop-blur-sm"
            aria-label="Précédent"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={() => goTo((current + 1) % featured.length)}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2 bg-black/50 hover:bg-black/80 text-white rounded-full transition-all duration-200 backdrop-blur-sm"
            aria-label="Suivant"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      {/* Indicateurs */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-1.5">
        {featured.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className={`h-1 rounded-full transition-all duration-300 ${
              i === current ? "w-6 bg-cinema-accent" : "w-1.5 bg-white/40 hover:bg-white/70"
            }`}
            aria-label={`Diapositive ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

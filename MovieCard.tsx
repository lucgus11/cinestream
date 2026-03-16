"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Star, Play, Info } from "lucide-react";
import type { Movie } from "@/lib/api";
import { getPosterUrl } from "@/lib/api";

interface MovieCardProps {
  movie: Movie;
  priority?: boolean;
}

export default function MovieCard({ movie, priority = false }: MovieCardProps) {
  const [hovered, setHovered] = useState(false);
  const [imgError, setImgError] = useState(false);

  const year = movie.release_date ? new Date(movie.release_date).getFullYear() : "—";
  const rating = movie.vote_average.toFixed(1);
  const posterUrl = imgError ? "/placeholder-poster.jpg" : getPosterUrl(movie.poster_path);

  return (
    <div
      className="group relative cursor-pointer"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Link href={`/watch/${movie.id}`} prefetch={false}>
        <div className="relative overflow-hidden rounded-lg bg-cinema-card transition-transform duration-300 group-hover:scale-105 group-hover:z-10 group-hover:shadow-2xl group-hover:shadow-black/80">
          
          {/* Affiche */}
          <div className="relative aspect-[2/3] w-full">
            <Image
              src={posterUrl}
              alt={movie.title}
              fill
              sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 200px"
              className="object-cover transition-all duration-500 group-hover:brightness-75"
              priority={priority}
              onError={() => setImgError(true)}
            />

            {/* Gradient bas */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            {/* Badge note */}
            <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/70 backdrop-blur-sm rounded-md px-1.5 py-0.5">
              <Star className="w-3 h-3 text-cinema-gold fill-cinema-gold" />
              <span className="text-xs font-bold text-white">{rating}</span>
            </div>

            {/* Overlay boutons au hover */}
            <div className={`absolute inset-0 flex flex-col items-center justify-end p-3 gap-2 transition-all duration-300 ${hovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`}>
              <button className="flex items-center gap-1.5 w-full justify-center bg-cinema-accent hover:bg-cinema-accent-hover text-white text-xs font-semibold py-2 rounded-md transition-colors animate-pulse-red">
                <Play className="w-3.5 h-3.5 fill-white" />
                Regarder
              </button>
              <Link
                href={`/movie/${movie.id}`}
                className="flex items-center gap-1.5 w-full justify-center bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white text-xs font-medium py-1.5 rounded-md transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                <Info className="w-3 h-3" />
                Détails
              </Link>
            </div>
          </div>

          {/* Infos sous l'affiche */}
          <div className="p-2.5">
            <h3 className="text-cinema-text text-xs font-semibold truncate leading-tight">{movie.title}</h3>
            <p className="text-cinema-muted text-xs mt-0.5">{year}</p>
          </div>
        </div>
      </Link>
    </div>
  );
}

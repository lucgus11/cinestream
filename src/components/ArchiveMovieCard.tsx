"use client";

import { useState } from "react";
import Link from "next/link";
import { Play, Star, Archive } from "lucide-react";
import type { ArchiveMovie } from "@/lib/archive";

interface Props {
  movie: ArchiveMovie;
}

export default function ArchiveMovieCard({ movie }: Props) {
  const [imgError, setImgError] = useState(false);

  return (
    <div className="group relative cursor-pointer">
      <Link href={`/archive/${movie.id}`}>
        <div className="relative overflow-hidden rounded-lg bg-cinema-card transition-transform duration-300 group-hover:scale-105 group-hover:shadow-2xl group-hover:shadow-black/80">

          {/* Affiche */}
          <div className="relative aspect-[2/3] w-full bg-cinema-surface flex items-center justify-center">
            {!imgError && movie.poster_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={movie.poster_url}
                alt={movie.title}
                className="w-full h-full object-cover transition-all duration-500 group-hover:brightness-75"
                onError={() => setImgError(true)}
              />
            ) : (
              <div className="flex flex-col items-center gap-2 p-4 text-center">
                <Archive className="w-10 h-10 text-cinema-muted" />
                <p className="text-cinema-muted text-xs">{movie.title}</p>
              </div>
            )}

            {/* Badge domaine public */}
            <div className="absolute top-2 left-2 bg-green-700/90 text-white text-xs font-bold px-1.5 py-0.5 rounded">
              Gratuit
            </div>

            {/* Année */}
            {movie.year && (
              <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded">
                {movie.year}
              </div>
            )}

            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="absolute inset-0 flex items-end p-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
              <button className="flex items-center gap-1.5 w-full justify-center bg-cinema-accent hover:bg-cinema-accent-hover text-white text-xs font-semibold py-2 rounded-md transition-colors">
                <Play className="w-3.5 h-3.5 fill-white" />
                Regarder
              </button>
            </div>
          </div>

          {/* Infos */}
          <div className="p-2.5">
            <h3 className="text-cinema-text text-xs font-semibold truncate leading-tight">
              {movie.title}
            </h3>
            <div className="flex items-center gap-1 mt-0.5">
              <Archive className="w-3 h-3 text-green-500" />
              <p className="text-green-500 text-xs">Archive.org</p>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}

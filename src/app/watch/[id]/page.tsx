import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Star, Clock, Calendar } from "lucide-react";
import { getMovieDetails, getVideoSources, getPosterUrl } from "@/lib/api";
import VideoPlayer from "@/components/VideoPlayer";

interface PageProps {
  params: { id: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  try {
    const movie = await getMovieDetails(Number(params.id));
    return {
      title: `${movie.title} – Regarder en streaming`,
      description: movie.overview,
      openGraph: {
        title: movie.title,
        description: movie.overview,
        images: movie.backdrop_path
          ? [`https://image.tmdb.org/t/p/w1280${movie.backdrop_path}`]
          : [],
      },
    };
  } catch {
    return { title: "Film introuvable" };
  }
}

// Composant client séparé pour le player (car il utilise des hooks)
import WatchClient from "./WatchClient";

export default async function WatchPage({ params }: PageProps) {
  const movieId = Number(params.id);
  if (isNaN(movieId)) notFound();

  const [movie, sources] = await Promise.all([
    getMovieDetails(movieId).catch(() => null),
    getVideoSources(movieId).catch(() => []),
  ]);

  if (!movie) notFound();

  const posterUrl = getPosterUrl(movie.poster_path, "w500");

  return (
    <div className="min-h-screen bg-cinema-bg pt-16">
      <WatchClient movie={movie} sources={sources} posterUrl={posterUrl} />
    </div>
  );
}

import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getMovieDetails, getVideoSources, getPosterUrl } from "@/lib/api";
import WatchClient from "./WatchClient";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  try {
    const { id } = await params;
    const movie = await getMovieDetails(Number(id));
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

export default async function WatchPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const movieId = Number(id);
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

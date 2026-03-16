import { NextRequest, NextResponse } from "next/server";

/**
 * Route API proxy pour les sources de streaming.
 * Permet de masquer les clés API côté serveur et d'éviter les problèmes CORS.
 *
 * GET /api/stream/[id]
 */

const STREAM_API = process.env.STREAM_API_BASE || ""; // Variable SERVEUR (sans NEXT_PUBLIC_)

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const movieId = Number(params.id);

  if (isNaN(movieId)) {
    return NextResponse.json({ error: "ID invalide" }, { status: 400 });
  }

  // Si API de streaming configurée côté serveur
  if (STREAM_API) {
    try {
      const res = await fetch(`${STREAM_API}/stream/${movieId}`, {
        headers: {
          Authorization: `Bearer ${process.env.STREAM_API_KEY || ""}`,
          "Content-Type": "application/json",
        },
        next: { revalidate: 300 }, // Cache 5 minutes
      });

      if (!res.ok) {
        throw new Error(`Stream API ${res.status}`);
      }

      const data = await res.json();
      return NextResponse.json(data, {
        headers: {
          "Cache-Control": "private, max-age=300",
        },
      });
    } catch (err) {
      console.error("Erreur API streaming:", err);
      // Fallback vers sources de démo
    }
  }

  // Sources de démonstration (Big Buck Bunny — domaine public)
  const demoSources = {
    sources: [
      {
        src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
        type: "video/mp4",
        label: "HD 720p",
        res: 720,
      },
      {
        src: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
        type: "application/x-mpegURL",
        label: "HLS Auto",
      },
    ],
    movieId,
    demo: true,
  };

  return NextResponse.json(demoSources, {
    headers: { "Cache-Control": "public, max-age=3600" },
  });
}

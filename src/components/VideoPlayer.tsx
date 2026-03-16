"use client";
import "video.js/dist/video-js.css";
import { useEffect, useRef, useState } from "react";
import type { VideoSource } from "@/lib/api";

// Video.js est importé dynamiquement pour éviter les erreurs SSR
// car il accède à `window` et `document` au chargement.

interface VideoPlayerProps {
  sources: VideoSource[];
  poster?: string;
  title?: string;
  onReady?: () => void;
  onError?: (error: string) => void;
  autoplay?: boolean;
  className?: string;
}

export default function VideoPlayer({
  sources,
  poster,
  title,
  onReady,
  onError,
  autoplay = false,
  className = "",
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<ReturnType<typeof import("video.js")["default"]> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    // Chargement dynamique de Video.js (client uniquement)
    let isMounted = true;

    const initPlayer = async () => {
      const videojs = (await import("video.js")).default;

      if (!videoRef.current || !isMounted) return;

      // Créer l'élément <video> dynamiquement
      const videoEl = document.createElement("video-js");
      videoEl.classList.add("vjs-big-play-centered", "vjs-fill");
      videoRef.current.appendChild(videoEl);

      const player = videojs(videoEl, {
        controls: true,
        autoplay: autoplay,
        preload: "auto",
        fluid: true,
        responsive: true,
        playbackRates: [0.5, 0.75, 1, 1.25, 1.5, 2],
        poster: poster,
        sources: sources,
        html5: {
          hls: {
            overrideNative: true,
            enableLowInitialPlaylist: true,
            smoothQualityChange: true,
            allowSeeksWithinUnsafeLiveWindow: true,
          },
          nativeVideoTracks: false,
          nativeAudioTracks: false,
          nativeTextTracks: false,
        },
        userActions: {
          hotkeys: true, // Raccourcis clavier activés
        },
        // Personnalisation des contrôles
        controlBar: {
          children: [
            "playToggle",
            "skipBackward",
            "skipForward",
            "volumePanel",
            "currentTimeDisplay",
            "timeDivider",
            "durationDisplay",
            "progressControl",
            "liveDisplay",
            "playbackRateMenuButton",
            "chaptersButton",
            "descriptionsButton",
            "subsCapsButton",
            "audioTrackButton",
            "pictureInPictureToggle",
            "fullscreenToggle",
          ],
        },
        skipButtons: {
          forward: 10,
          backward: 10,
        },
      });

      playerRef.current = player;

      // Événements
      player.on("ready", () => {
        if (isMounted) {
          setIsLoading(false);
          onReady?.();
        }
      });

      player.on("error", () => {
        const error = player.error();
        const msg = error?.message || "Erreur de lecture vidéo";
        if (isMounted) {
          setHasError(true);
          setIsLoading(false);
          setErrorMsg(msg);
          onError?.(msg);
        }
      });

      player.on("waiting", () => isMounted && setIsLoading(true));
      player.on("canplay", () => isMounted && setIsLoading(false));
      player.on("playing", () => isMounted && setIsLoading(false));

      // Keyboard shortcuts personnalisés
      document.addEventListener("keydown", handleKeydown);
    };

    const handleKeydown = (e: KeyboardEvent) => {
      const player = playerRef.current;
      if (!player) return;
      // Ne pas interférer si l'utilisateur est dans un input
      if ((e.target as HTMLElement).tagName === "INPUT") return;

      switch (e.key) {
        case " ":
        case "k":
          e.preventDefault();
          player.paused() ? player.play() : player.pause();
          break;
        case "ArrowRight":
          e.preventDefault();
          player.currentTime((player.currentTime() || 0) + 10);
          break;
        case "ArrowLeft":
          e.preventDefault();
          player.currentTime(Math.max((player.currentTime() || 0) - 10, 0));
          break;
        case "ArrowUp":
          e.preventDefault();
          player.volume(Math.min((player.volume() || 0) + 0.1, 1));
          break;
        case "ArrowDown":
          e.preventDefault();
          player.volume(Math.max((player.volume() || 0) - 0.1, 0));
          break;
        case "m":
          player.muted(!player.muted());
          break;
        case "f":
          e.preventDefault();
          player.isFullscreen() ? player.exitFullscreen() : player.requestFullscreen();
          break;
      }
    };

    initPlayer().catch(console.error);

    return () => {
      isMounted = false;
      document.removeEventListener("keydown", () => {});
      if (playerRef.current && !playerRef.current.isDisposed()) {
        playerRef.current.dispose();
        playerRef.current = null;
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Mise à jour des sources si elles changent
  useEffect(() => {
    const player = playerRef.current;
    if (player && !player.isDisposed() && sources.length > 0) {
      player.src(sources);
      if (poster) player.poster(poster);
    }
  }, [sources, poster]);

  return (
    <div className={`relative w-full bg-black rounded-lg overflow-hidden ${className}`}>
      {/* Titre overlay */}
      {title && (
        <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/80 to-transparent px-4 py-3 pointer-events-none">
          <p className="text-white text-sm font-medium truncate">{title}</p>
        </div>
      )}

      {/* Loading overlay */}
      {isLoading && !hasError && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/60">
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 border-4 border-cinema-accent border-t-transparent rounded-full animate-spin" />
            <p className="text-cinema-muted text-sm">Chargement…</p>
          </div>
        </div>
      )}

      {/* Error overlay */}
      {hasError && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/90">
          <div className="text-center px-6">
            <div className="text-5xl mb-4">⚠️</div>
            <p className="text-white font-semibold text-lg mb-2">Lecture impossible</p>
            <p className="text-cinema-muted text-sm mb-4">{errorMsg}</p>
            <button
              onClick={() => {
                setHasError(false);
                setIsLoading(true);
                playerRef.current?.load();
              }}
              className="px-4 py-2 bg-cinema-accent text-white rounded-lg text-sm hover:bg-cinema-accent-hover transition-colors"
            >
              Réessayer
            </button>
          </div>
        </div>
      )}

      {/* Conteneur Video.js */}
      <div
        ref={videoRef}
        data-vjs-player
        className="w-full aspect-video"
        style={{ minHeight: "200px" }}
      />

      {/* Aide raccourcis clavier */}
      <div className="hidden sm:flex absolute bottom-16 right-3 z-10 gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        {[
          { key: "Espace", label: "Play/Pause" },
          { key: "←→", label: "±10s" },
          { key: "F", label: "Plein écran" },
          { key: "M", label: "Muet" },
        ].map(({ key, label }) => (
          <div key={key} className="bg-black/60 backdrop-blur-sm rounded px-2 py-1 text-xs text-white">
            <kbd className="font-mono text-cinema-accent">{key}</kbd>
            <span className="ml-1 text-cinema-muted">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

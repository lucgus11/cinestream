import Link from "next/link";
import { Film, Home, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-cinema-bg flex flex-col items-center justify-center px-6 text-center">
      {/* Icône animée */}
      <div className="relative mb-8">
        <div className="w-24 h-24 bg-cinema-surface border border-cinema-border rounded-full flex items-center justify-center">
          <Film className="w-10 h-10 text-cinema-accent" />
        </div>
        <div className="absolute -top-2 -right-2 w-8 h-8 bg-cinema-accent rounded-full flex items-center justify-center text-white font-bold text-sm">
          ?
        </div>
      </div>

      {/* Code erreur */}
      <p className="text-7xl font-black text-cinema-accent/20 mb-2" style={{ fontFamily: "Georgia, serif" }}>
        404
      </p>

      <h1 className="text-2xl font-bold text-white mb-3" style={{ fontFamily: "Georgia, serif" }}>
        Film introuvable
      </h1>
      <p className="text-cinema-muted max-w-sm mb-8 text-sm leading-relaxed">
        La page que vous cherchez n&apos;existe pas ou a été déplacée. Retournez à l&apos;accueil pour découvrir notre catalogue.
      </p>

      {/* Actions */}
      <div className="flex flex-wrap gap-3 justify-center">
        <Link
          href="/"
          className="flex items-center gap-2 bg-cinema-accent hover:bg-cinema-accent-hover text-white font-semibold px-5 py-2.5 rounded-lg transition-all hover:scale-105"
        >
          <Home className="w-4 h-4" />
          Accueil
        </Link>
        <Link
          href="/?search=true"
          className="flex items-center gap-2 bg-cinema-surface border border-cinema-border hover:border-cinema-accent text-white font-medium px-5 py-2.5 rounded-lg transition-all"
        >
          <Search className="w-4 h-4" />
          Rechercher
        </Link>
      </div>
    </div>
  );
}

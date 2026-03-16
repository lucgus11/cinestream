"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Film, X, Menu } from "lucide-react";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  useEffect(() => {
    if (searchOpen) inputRef.current?.focus();
  }, [searchOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/?q=${encodeURIComponent(query.trim())}`);
      setSearchOpen(false);
      setQuery("");
    }
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-cinema-bg/95 backdrop-blur-md shadow-lg shadow-black/50"
          : "bg-gradient-to-b from-black/80 to-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group shrink-0">
            <div className="w-8 h-8 bg-cinema-accent rounded flex items-center justify-center group-hover:bg-cinema-accent-hover transition-colors">
              <Film className="w-4 h-4 text-white" />
            </div>
            <span
              className="text-xl font-bold tracking-tight text-white hidden sm:block"
              style={{ fontFamily: "Georgia, serif", letterSpacing: "-0.02em" }}
            >
              Cine<span className="text-cinema-accent">Stream</span>
            </span>
          </Link>

          {/* Nav liens (desktop) */}
          <div className="hidden md:flex items-center gap-6 text-sm">
            {[
              { href: "/", label: "Accueil" },
              { href: "/?category=trending", label: "Tendances" },
              { href: "/?category=top_rated", label: "Les mieux notés" },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-cinema-muted hover:text-white transition-colors font-medium"
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Actions droite */}
          <div className="flex items-center gap-2">
            
            {/* Barre de recherche */}
            {searchOpen ? (
              <form onSubmit={handleSearch} className="flex items-center">
                <div className="flex items-center bg-cinema-surface border border-cinema-border rounded-lg overflow-hidden animate-scale-in">
                  <Search className="w-4 h-4 text-cinema-muted ml-3 shrink-0" />
                  <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Titre, acteur, genre…"
                    className="bg-transparent text-white text-sm px-3 py-2 outline-none w-48 sm:w-64 placeholder:text-cinema-muted"
                  />
                  <button
                    type="button"
                    onClick={() => setSearchOpen(false)}
                    className="p-2 text-cinema-muted hover:text-white transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </form>
            ) : (
              <button
                onClick={() => setSearchOpen(true)}
                className="p-2 text-cinema-muted hover:text-white transition-colors rounded-lg hover:bg-white/10"
                aria-label="Rechercher"
              >
                <Search className="w-5 h-5" />
              </button>
            )}

            {/* Menu mobile */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 text-cinema-muted hover:text-white transition-colors rounded-lg hover:bg-white/10"
              aria-label="Menu"
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Menu mobile déroulant */}
      {menuOpen && (
        <div className="md:hidden bg-cinema-bg/98 backdrop-blur-md border-t border-cinema-border animate-slide-up">
          <div className="px-4 py-3 flex flex-col gap-1">
            {[
              { href: "/", label: "🏠 Accueil" },
              { href: "/?category=trending", label: "🔥 Tendances" },
              { href: "/?category=top_rated", label: "⭐ Les mieux notés" },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-cinema-muted hover:text-white py-2.5 px-3 rounded-lg hover:bg-white/10 transition-colors text-sm font-medium"
                onClick={() => setMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}

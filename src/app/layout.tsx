import type { Metadata, Viewport } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: {
    default: "CineStream – Films en Streaming",
    template: "%s | CineStream",
  },
  description: "Regardez vos films préférés en streaming haute qualité. Catalogue complet, lecteur HD, disponible en PWA.",
  keywords: ["streaming", "films", "cinéma", "regarder", "HD", "PWA"],
  authors: [{ name: "CineStream" }],
  creator: "CineStream",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "CineStream",
  },
  formatDetection: { telephone: false },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: "https://your-domain.vercel.app",
    siteName: "CineStream",
    title: "CineStream – Films en Streaming",
    description: "Regardez vos films préférés en streaming haute qualité.",
  },
  twitter: {
    card: "summary_large_image",
    title: "CineStream – Films en Streaming",
    description: "Regardez vos films préférés en streaming haute qualité.",
  },
};

export const viewport: Viewport = {
  themeColor: "#E50914",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className="scroll-smooth">
      <head>
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/icon-192x192.png" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className="bg-cinema-bg text-cinema-text font-body antialiased min-h-screen">
        <Navbar />
        <main>{children}</main>
        <footer className="border-t border-cinema-border mt-16 py-10 px-6 text-center">
          <p className="text-cinema-muted text-sm">
            © {new Date().getFullYear()} CineStream · Données fournies par{" "}
            <a href="https://www.themoviedb.org" target="_blank" rel="noopener noreferrer" className="text-cinema-accent hover:underline">
              TMDb
            </a>
          </p>
          <p className="text-cinema-muted/50 text-xs mt-1">
            Ce produit utilise l&apos;API TMDb mais n&apos;est pas approuvé ou certifié par TMDb.
          </p>
        </footer>
      </body>
    </html>
  );
}

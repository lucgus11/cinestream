// ============================================================
// src/lib/archive.ts — Films domaine public via Archive.org
// RSS + API JSON d'Internet Archive
// ============================================================

export interface ArchiveMovie {
  id: string;
  title: string;
  description: string;
  poster_url: string | null;
  video_url: string | null;
  hls_url: string | null;
  year: number | null;
  runtime: number | null;
  subject: string[];
  creator: string | null;
  source: "archive";
}

const ARCHIVE_BASE = "https://archive.org";

// ─── Collections de films domaine public (sans contenu +18) ─
const SAFE_COLLECTIONS = [
  "feature_films",          // Films complets classiques
  "silent_films",           // Films muets
  "classic_tv",             // TV classique
  "SciFi_Horror",           // SF et horreur classique
  "film_noir",              // Film noir
  "westerns",               // Westerns
  "comedy_films",           // Comédies classiques
  "short_films",            // Courts métrages
  "adventure_films",        // Films d'aventure
  "PublicDomainMovies",     // Domaine public général
];

// ─── Fetch liste de films d'une collection ────────────────
export async function getArchiveMovies(
  collection = "feature_films",
  page = 1,
  rows = 20
): Promise<{ movies: ArchiveMovie[]; total: number }> {
  const start = (page - 1) * rows;

  try {
    const query = encodeURIComponent(
      `collection:${collection} AND mediatype:movies AND -subject:"adult" AND -subject:"xxx" AND -subject:"pornography" AND -subject:"18+"`,
    );

    const url = `${ARCHIVE_BASE}/advancedsearch.php?q=${query}&fl[]=identifier,title,description,year,runtime,subject,creator,thumb&sort[]=downloads+desc&rows=${rows}&start=${start}&output=json`;

    const res = await fetch(url, { next: { revalidate: 3600 } });
    const data = await res.json();

    const movies: ArchiveMovie[] = (data.response?.docs || []).map(
      (doc: {
        identifier: string;
        title?: string;
        description?: string;
        year?: number;
        runtime?: number;
        subject?: string | string[];
        creator?: string;
        thumb?: string;
      }) => ({
        id: doc.identifier,
        title: doc.title || doc.identifier,
        description: Array.isArray(doc.description)
          ? doc.description[0]
          : doc.description || "",
        poster_url: doc.thumb
          ? `https://archive.org/services/img/${doc.identifier}`
          : null,
        video_url: null,
        hls_url: null,
        year: doc.year || null,
        runtime: doc.runtime ? parseInt(String(doc.runtime)) : null,
        subject: Array.isArray(doc.subject)
          ? doc.subject
          : doc.subject
          ? [doc.subject]
          : [],
        creator: Array.isArray(doc.creator) ? doc.creator[0] : doc.creator || null,
        source: "archive" as const,
      })
    );

    return {
      movies,
      total: data.response?.numFound || 0,
    };
  } catch (err) {
    console.error("Erreur Archive.org:", err);
    return { movies: [], total: 0 };
  }
}

// ─── Détails + sources vidéo d'un item ────────────────────
export async function getArchiveMovieDetails(
  identifier: string
): Promise<ArchiveMovie & { sources: { src: string; type: string; label: string }[] }> {
  const metaRes = await fetch(
    `${ARCHIVE_BASE}/metadata/${identifier}`,
    { next: { revalidate: 86400 } }
  );
  const meta = await metaRes.json();
  const item = meta.metadata || {};
  const files: Array<{
    name: string;
    format: string;
    size?: string;
    length?: string;
  }> = meta.files || [];

  // Filtrer les fichiers vidéo
  const videoFiles = files.filter((f) =>
    ["h.264", "mpeg4", "ogg video", "512kb mpeg4", "hd h.264"].includes(
      f.format?.toLowerCase()
    )
  );

  const hlsFile = files.find((f) =>
    f.name?.endsWith(".m3u8")
  );

  const sources = videoFiles
    .slice(0, 4)
    .map((f) => ({
      src: `https://archive.org/download/${identifier}/${encodeURIComponent(f.name)}`,
      type: "video/mp4" as const,
      label: f.format?.includes("HD") ? "HD" : f.format || "MP4",
    }));

  if (hlsFile) {
    sources.unshift({
      src: `https://archive.org/download/${identifier}/${encodeURIComponent(hlsFile.name)}`,
      type: "application/x-mpegURL" as const,
      label: "HLS Auto",
    });
  }

  // Fallback : lien de streaming direct Archive.org
  if (sources.length === 0) {
    sources.push({
      src: `https://archive.org/download/${identifier}/${identifier}.mp4`,
      type: "video/mp4" as const,
      label: "MP4",
    });
  }

  return {
    id: identifier,
    title: Array.isArray(item.title) ? item.title[0] : item.title || identifier,
    description: Array.isArray(item.description)
      ? item.description[0]
      : item.description || "",
    poster_url: `https://archive.org/services/img/${identifier}`,
    video_url: sources[0]?.src || null,
    hls_url: hlsFile
      ? `https://archive.org/download/${identifier}/${hlsFile.name}`
      : null,
    year: item.year ? parseInt(item.year) : null,
    runtime: item.runtime ? parseInt(item.runtime) : null,
    subject: Array.isArray(item.subject) ? item.subject : item.subject ? [item.subject] : [],
    creator: Array.isArray(item.creator) ? item.creator[0] : item.creator || null,
    source: "archive" as const,
    sources,
  };
}

// ─── RSS Feed d'une collection ────────────────────────────
export async function getArchiveRssFeed(
  collection = "feature_films",
  limit = 20
): Promise<ArchiveMovie[]> {
  try {
    const url = `${ARCHIVE_BASE}/services/collection-rss.php?collection=${collection}`;
    const res = await fetch(url, { next: { revalidate: 3600 } });
    const xml = await res.text();

    // Parse RSS XML manuellement (pas de lib externe nécessaire)
    const items = xml.match(/<item>([\s\S]*?)<\/item>/g) || [];

    return items.slice(0, limit).map((item) => {
      const get = (tag: string) => {
        const match = item.match(new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>|<${tag}[^>]*>([^<]*)<\\/${tag}>`));
        return match ? (match[1] || match[2] || "").trim() : "";
      };

      const link = get("link");
      const identifier = link.split("/details/")[1]?.split(/[/?#]/)[0] || "";
      const enclosureMatch = item.match(/url="([^"]+\.mp4[^"]*)"/);

      return {
        id: identifier,
        title: get("title"),
        description: get("description").replace(/<[^>]+>/g, "").slice(0, 300),
        poster_url: identifier
          ? `https://archive.org/services/img/${identifier}`
          : null,
        video_url: enclosureMatch?.[1] || null,
        hls_url: null,
        year: null,
        runtime: null,
        subject: [],
        creator: get("author") || null,
        source: "archive" as const,
      };
    });
  } catch (err) {
    console.error("Erreur RSS Archive:", err);
    return [];
  }
}

// ─── Recherche dans Archive.org ───────────────────────────
export async function searchArchiveMovies(
  query: string,
  page = 1
): Promise<{ movies: ArchiveMovie[]; total: number }> {
  const start = (page - 1) * 20;

  try {
    const safeQuery = encodeURIComponent(
      `(${query}) AND mediatype:movies AND -subject:"adult" AND -subject:"xxx" AND -subject:"pornography"`
    );

    const url = `${ARCHIVE_BASE}/advancedsearch.php?q=${safeQuery}&fl[]=identifier,title,description,year,subject,creator&sort[]=downloads+desc&rows=20&start=${start}&output=json`;

    const res = await fetch(url, { next: { revalidate: 300 } });
    const data = await res.json();

    const movies: ArchiveMovie[] = (data.response?.docs || []).map(
      (doc: { identifier: string; title?: string; description?: string; year?: number; subject?: string | string[]; creator?: string }) => ({
        id: doc.identifier,
        title: doc.title || doc.identifier,
        description: Array.isArray(doc.description)
          ? doc.description[0]
          : doc.description || "",
        poster_url: `https://archive.org/services/img/${doc.identifier}`,
        video_url: null,
        hls_url: null,
        year: doc.year || null,
        runtime: null,
        subject: Array.isArray(doc.subject)
          ? doc.subject
          : doc.subject ? [doc.subject] : [],
        creator: Array.isArray(doc.creator) ? doc.creator[0] : doc.creator || null,
        source: "archive" as const,
      })
    );

    return { movies, total: data.response?.numFound || 0 };
  } catch {
    return { movies: [], total: 0 };
  }
}

export { SAFE_COLLECTIONS };

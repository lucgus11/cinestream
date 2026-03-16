import { NextRequest, NextResponse } from "next/server";

const TRAKT_BASE = "https://api.trakt.tv";
const CLIENT_ID = process.env.TRAKT_CLIENT_ID || "";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  if (!CLIENT_ID) {
    return NextResponse.json({ error: "TRAKT_CLIENT_ID manquant" }, { status: 500 });
  }

  const { path } = await context.params;
  const endpoint = path.join("/");
  const { searchParams } = new URL(request.url);

  const url = new URL(`${TRAKT_BASE}/${endpoint}`);
  searchParams.forEach((value, key) => url.searchParams.set(key, value));

  try {
    const res = await fetch(url.toString(), {
      headers: {
        "Content-Type": "application/json",
        "trakt-api-version": "2",
        "trakt-api-key": CLIENT_ID,
      },
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `Trakt API ${res.status}` },
        { status: res.status }
      );
    }

    const data = await res.json();

    return NextResponse.json(data, {
      headers: {
        "X-Pagination-Page-Count": res.headers.get("X-Pagination-Page-Count") || "1",
        "X-Pagination-Item-Count": res.headers.get("X-Pagination-Item-Count") || "0",
        "Cache-Control": "public, s-maxage=3600",
      },
    });
  } catch (err) {
    console.error("Erreur proxy Trakt:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const artist = request.nextUrl.searchParams.get("artist");
  const title = request.nextUrl.searchParams.get("title");

  if (!artist || !title) {
    return NextResponse.json({ lyrics: "" });
  }

  try {
    const primary = await fetch(`https://api.lyrics.ovh/v1/${encodeURIComponent(artist)}/${encodeURIComponent(title)}`);
    if (primary.ok) {
      const primaryData = (await primary.json()) as { lyrics?: string };
      if (primaryData.lyrics) return NextResponse.json({ lyrics: primaryData.lyrics });
    }

    const fallback = await fetch(
      `https://lrclib.net/api/get?artist_name=${encodeURIComponent(artist)}&track_name=${encodeURIComponent(title)}`
    );
    if (fallback.ok) {
      const fallbackData = (await fallback.json()) as { plainLyrics?: string };
      return NextResponse.json({ lyrics: fallbackData.plainLyrics ?? "" });
    }

    return NextResponse.json({ lyrics: "" });
  } catch {
    return NextResponse.json({ lyrics: "" });
  }
}

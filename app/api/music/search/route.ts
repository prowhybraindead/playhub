import { NextRequest, NextResponse } from "next/server";
import { env } from "@/lib/env";
import { MusicTrack } from "@/types";

type ITunesTrack = {
  trackId: number;
  trackName: string;
  artistName: string;
  collectionName: string;
  artworkUrl100: string;
  previewUrl: string;
  trackTimeMillis: number;
  primaryGenreName: string;
};

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("query");
  // const mode = request.nextUrl.searchParams.get("mode") ?? "track"; // iTunes searches everything flexibly via `term`
  if (!query) return NextResponse.json({ tracks: [] as MusicTrack[] });

  const url = `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=song&limit=24`;

  try {
    const res = await fetch(url, { next: { revalidate: 600 } });
    if (!res.ok) return NextResponse.json({ tracks: [] as MusicTrack[] });
    const data = (await res.json()) as { results: ITunesTrack[] };
    
    // Map iTunes to MusicTrack schema
    const tracks: MusicTrack[] = (data.results ?? []).map((item) => ({
      idTrack: item.trackId.toString(),
      strTrack: item.trackName,
      strArtist: item.artistName,
      strAlbum: item.collectionName || item.trackName,
      strTrackThumb: item.artworkUrl100 ? item.artworkUrl100.replace("100x100bb", "600x600bb") : null,
      strMusicVid: item.previewUrl || null,
      intDuration: item.trackTimeMillis ? item.trackTimeMillis.toString() : null,
      strGenre: item.primaryGenreName || null
    }));

    return NextResponse.json({ tracks });
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : "Music search failed", tracks: [] as MusicTrack[] });
  }
}

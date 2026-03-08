import { NextRequest, NextResponse } from "next/server";
import youtubeSearchApi from "youtube-search-api";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q");

    if (!query) {
      return NextResponse.json({ error: "Missing query parameter 'q'" }, { status: 400 });
    }

    // Attempt to search on YouTube
    // By appending "official music video" we highly improve the chances
    // of getting the highest quality audio/video release.
    const searchResult = await youtubeSearchApi.GetListByKeyword(`${query} official music video`, false, 5, [{type: "video"}]);
    
    // items is an array of objects shaped { id, type, thumbnail, title, channelTitle... }
    const items = searchResult?.items;
    
    if (!items || items.length === 0) {
      return NextResponse.json({ error: "No video found" }, { status: 404 });
    }
    
    // Pick the first valid video result
    const videoId = items[0].id;
    
    return NextResponse.json({ videoId });
  } catch (error) {
    console.error("YouTube search error:", error);
    return NextResponse.json({ error: "Failed to search YouTube" }, { status: 500 });
  }
}

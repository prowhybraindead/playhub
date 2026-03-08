import { NextRequest, NextResponse } from "next/server";
import youtubeSearchApi from "youtube-search-api";
import { env } from "@/lib/env";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q");

    if (!query) {
      return NextResponse.json({ error: "Missing query parameter 'q'" }, { status: 400 });
    }

    const searchQuery = `${query} official music video`;
    let videoId: string | undefined;

    // 1. Dùng API chính thức nếu người dùng đã cấu hình YOUTUBE_API_KEY
    if (env.YOUTUBE_API_KEY) {
      try {
        const ytRes = await fetch(
          `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(searchQuery)}&type=video&maxResults=1&key=${env.YOUTUBE_API_KEY}`
        );
        if (ytRes.ok) {
          const ytData = await ytRes.json();
          if (ytData.items && ytData.items.length > 0) {
            videoId = ytData.items[0].id.videoId;
          }
        }
      } catch (err) {
        console.error("Official YouTube API error:", err);
        // Fallback to youtube-search-api on error
      }
    }

    // 2. Chuyển sang cào dữ liệu qua youtube-search-api nếu API key trống hoặc bị lỗi
    if (!videoId) {
      const searchResult = await youtubeSearchApi.GetListByKeyword(searchQuery, false, 5, [{type: "video"}]);
      const items = searchResult?.items;
      
      if (items && items.length > 0) {
        videoId = items[0].id;
      }
    }

    if (!videoId) {
      return NextResponse.json({ error: "No video found" }, { status: 404 });
    }
    
    return NextResponse.json({ videoId });
  } catch (error) {
    console.error("YouTube search error:", error);
    return NextResponse.json({ error: "Failed to search YouTube" }, { status: 500 });
  }
}

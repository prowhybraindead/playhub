import { NextRequest, NextResponse } from "next/server";
import { asArray, fetchJson } from "@/lib/external-api";

type Mode = "anime" | "manga" | "characters";

export async function GET(request: NextRequest) {
  const mode = (request.nextUrl.searchParams.get("mode") ?? "anime") as Mode;
  const query = request.nextUrl.searchParams.get("query")?.trim() ?? "";

  const safeMode: Mode = ["anime", "manga", "characters"].includes(mode) ? mode : "anime";

  try {
    if (!query) return NextResponse.json({ items: [] });

    const endpoint = safeMode === "characters" ? "characters" : safeMode;
    const data = await fetchJson<{ data?: Array<any> }>(
      `https://api.jikan.moe/v4/${endpoint}?q=${encodeURIComponent(query)}&limit=18`,
      1200
    );

    const items = asArray(data.data).map((item) => {
      if (safeMode === "characters") {
        const image = item.images?.jpg?.image_url ?? item.images?.webp?.image_url ?? null;
        return {
          id: String(item.mal_id),
          title: item.name ?? "Unknown",
          subtitle: item.nicknames?.slice(0, 2).join(", ") || "Anime character",
          image,
          description: item.about ?? "No biography available.",
          detail: {
            favorites: item.favorites ?? 0,
            url: item.url ?? ""
          }
        };
      }
      const image = item.images?.jpg?.large_image_url ?? item.images?.jpg?.image_url ?? null;
      return {
        id: String(item.mal_id),
        title: item.title ?? "Untitled",
        subtitle: `${safeMode === "anime" ? "Episodes" : "Chapters"}: ${item.episodes ?? item.chapters ?? "?"} • Score: ${item.score ?? "?"}`,
        image,
        description: item.synopsis ?? "No synopsis available.",
        detail: {
          status: item.status ?? "Unknown",
          rating: item.rating ?? "Unknown",
          year: item.year ?? item.published?.prop?.from?.year ?? "Unknown"
        }
      };
    });

    return NextResponse.json({ items });
  } catch (error) {
    return NextResponse.json({ items: [], message: error instanceof Error ? error.message : "Anime search failed" }, { status: 500 });
  }
}

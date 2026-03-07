import { NextRequest, NextResponse } from "next/server";
import { fetchJson } from "@/lib/external-api";

type MetSearch = { objectIDs?: number[] };
type MetObject = { objectID: number; title: string; artistDisplayName: string; primaryImageSmall: string; objectDate: string };
type AicSearch = { data?: Array<{ id: number; title: string; artist_title: string; image_id: string; date_display: string }> };

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("query")?.trim() || "ocean";
  try {
    const [metSearch, aicSearch] = await Promise.all([
      fetchJson<MetSearch>(`https://collectionapi.metmuseum.org/public/collection/v1/search?q=${encodeURIComponent(query)}&hasImages=true`, 3600),
      fetchJson<AicSearch>(
        `https://api.artic.edu/api/v1/artworks/search?q=${encodeURIComponent(query)}&fields=id,title,artist_title,image_id,date_display&limit=10`,
        3600
      )
    ]);

    const metIds = (metSearch.objectIDs ?? []).slice(0, 8);
    const metDetails = await Promise.all(
      metIds.map(async (id) => {
        const detail = await fetchJson<MetObject>(`https://collectionapi.metmuseum.org/public/collection/v1/objects/${id}`, 3600);
        return {
          id: `met-${detail.objectID}`,
          title: detail.title,
          subtitle: detail.artistDisplayName || "Unknown artist",
          image: detail.primaryImageSmall || null,
          description: `Date: ${detail.objectDate || "Unknown"} • Source: Metropolitan Museum`
        };
      })
    );

    const aicItems = (aicSearch.data ?? []).map((item) => ({
      id: `aic-${item.id}`,
      title: item.title,
      subtitle: item.artist_title || "Unknown artist",
      image: item.image_id ? `/api/image-proxy?url=${encodeURIComponent(`https://www.artic.edu/iiif/2/${item.image_id}/full/843,/0/default.jpg`)}` : null,
      description: `Date: ${item.date_display || "Unknown"} • Source: Art Institute of Chicago`
    }));

    return NextResponse.json({
      items: [...metDetails, ...aicItems].filter((item) => item.image).slice(0, 16),
      stockImage: `https://source.unsplash.com/featured/1600x900/?${encodeURIComponent(query)},art`
    });
  } catch (error) {
    return NextResponse.json({ items: [], stockImage: null, message: error instanceof Error ? error.message : "Art search failed" }, { status: 500 });
  }
}

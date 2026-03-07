import { SectionCardItem } from "@/types";

export async function getAnimeItems(): Promise<SectionCardItem[]> {
  try {
    const res = await fetch("https://api.jikan.moe/v4/anime?order_by=score&sort=desc&limit=18", { next: { revalidate: 3600 } });
    if (!res.ok) throw new Error("Jikan unavailable");
    const data = (await res.json()) as {
      data: Array<{ mal_id: number; title: string; synopsis?: string; images?: { jpg?: { image_url?: string } }; episodes?: number; score?: number }>;
    };
    return data.data.map((item) => ({
      id: String(item.mal_id),
      title: item.title,
      subtitle: `Episodes: ${item.episodes ?? "?"} • Score: ${item.score ?? "?"}`,
      image: item.images?.jpg?.image_url,
      description: item.synopsis ?? "No synopsis available.",
      extra: "Waifu.pics integration can be added as themed artwork in the next iteration."
    }));
  } catch {
    return [];
  }
}

export async function getBookItems(): Promise<SectionCardItem[]> {
  try {
    const res = await fetch("https://gutendex.com/books/?search=fantasy", { next: { revalidate: 3600 } });
    if (!res.ok) throw new Error("Gutendex unavailable");
    const data = (await res.json()) as {
      results: Array<{ id: number; title: string; authors?: Array<{ name: string }>; subjects?: string[]; summaries?: string[] }>;
    };
    return data.results.slice(0, 18).map((item) => ({
      id: String(item.id),
      title: item.title,
      subtitle: item.authors?.map((author) => author.name).join(", ") || "Unknown author",
      description: item.summaries?.[0] ?? item.subjects?.slice(0, 3).join(", ") ?? "No summary.",
      extra: `Subjects: ${item.subjects?.slice(0, 8).join(", ") ?? "N/A"}`
    }));
  } catch {
    return [];
  }
}

export async function getFantasyItems(): Promise<SectionCardItem[]> {
  try {
    const [swRes, gotRes] = await Promise.all([
      fetch("https://swapi.info/api/people", { next: { revalidate: 3600 } }),
      fetch("https://anapioficeandfire.com/api/characters?page=1&pageSize=20", { next: { revalidate: 3600 } })
    ]);
    const swData = swRes.ok ? ((await swRes.json()) as Array<{ name: string; gender: string; birth_year: string; height: string }>) : [];
    const gotData = gotRes.ok
      ? ((await gotRes.json()) as Array<{ url: string; name: string; culture: string; aliases: string[]; born: string }>)
      : [];

    const swItems = swData.slice(0, 10).map((item, index) => ({
      id: `sw-${index}`,
      title: item.name,
      subtitle: "Star Wars",
      description: `Gender: ${item.gender}, Birth year: ${item.birth_year}, Height: ${item.height}`,
      extra: "Powered by SWAPI"
    }));

    const gotItems = gotData
      .filter((item) => item.name)
      .slice(0, 10)
      .map((item) => ({
        id: item.url,
        title: item.name,
        subtitle: "A Song of Ice and Fire",
        description: `Culture: ${item.culture || "Unknown"} • Born: ${item.born || "Unknown"}`,
        extra: `Aliases: ${item.aliases?.filter(Boolean).join(", ") || "None"}`
      }));

    return [...swItems, ...gotItems];
  } catch {
    return [];
  }
}

export async function getArtItems(): Promise<SectionCardItem[]> {
  try {
    const searchRes = await fetch("https://collectionapi.metmuseum.org/public/collection/v1/search?q=ocean&hasImages=true", {
      next: { revalidate: 3600 }
    });
    if (!searchRes.ok) throw new Error("Met API unavailable");
    const searchData = (await searchRes.json()) as { objectIDs?: number[] };
    const ids = (searchData.objectIDs ?? []).slice(0, 12);

    const details = await Promise.all(
      ids.map(async (id) => {
        const detailRes = await fetch(`https://collectionapi.metmuseum.org/public/collection/v1/objects/${id}`, { next: { revalidate: 3600 } });
        if (!detailRes.ok) return null;
        const detail = (await detailRes.json()) as { objectID: number; title: string; artistDisplayName: string; primaryImageSmall: string; objectDate: string };
        return {
          id: String(detail.objectID),
          title: detail.title,
          subtitle: detail.artistDisplayName || "Unknown artist",
          image: detail.primaryImageSmall,
          description: `Created: ${detail.objectDate || "Unknown date"}`,
          extra: "Powered by The Metropolitan Museum of Art Collection API"
        } satisfies SectionCardItem;
      })
    );

    return details.filter(Boolean) as SectionCardItem[];
  } catch {
    return [];
  }
}

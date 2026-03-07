import { NextRequest, NextResponse } from "next/server";
import { asArray, fetchJson } from "@/lib/external-api";

type GutendexResponse = {
  results?: Array<{
    id: number;
    title: string;
    authors?: Array<{ name: string }>;
    subjects?: string[];
    summaries?: string[];
    formats?: Record<string, string>;
  }>;
};

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("query")?.trim() ?? "";
  try {
    const data = await fetchJson<GutendexResponse>(`https://gutendex.com/books/?search=${encodeURIComponent(query || "classic")}`, 1800);
    const items = asArray(data.results).slice(0, 18).map((item) => ({
      id: String(item.id),
      title: item.title,
      subtitle: item.authors?.map((author) => author.name).join(", ") || "Unknown author",
      description: item.summaries?.[0] ?? item.subjects?.slice(0, 4).join(", ") ?? "No summary available.",
      readUrl: item.formats?.["text/html"] ?? item.formats?.["text/html; charset=utf-8"] ?? item.formats?.["application/epub+zip"] ?? null
    }));
    return NextResponse.json({ items });
  } catch (error) {
    return NextResponse.json({ items: [], message: error instanceof Error ? error.message : "Book search failed" }, { status: 500 });
  }
}

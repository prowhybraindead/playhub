import { NextRequest, NextResponse } from "next/server";
import { fetchJson } from "@/lib/external-api";

type OpenLibraryResponse = {
  docs?: Array<{
    title?: string;
    author_name?: string[];
    first_publish_year?: number;
    subject?: string[];
    edition_key?: string[];
  }>;
};

export async function GET(request: NextRequest) {
  const title = request.nextUrl.searchParams.get("title")?.trim() ?? "";
  if (!title) return NextResponse.json({ detail: null });

  try {
    const data = await fetchJson<OpenLibraryResponse>(`https://openlibrary.org/search.json?title=${encodeURIComponent(title)}&limit=1`, 1800);
    const book = data.docs?.[0];
    if (!book) return NextResponse.json({ detail: null });
    const editionKey = book.edition_key?.[0] ?? "";
    return NextResponse.json({
      detail: {
        title: book.title ?? title,
        author: book.author_name?.join(", ") ?? "Unknown author",
        year: book.first_publish_year ?? "Unknown",
        subjects: book.subject?.slice(0, 8) ?? [],
        openLibraryUrl: editionKey ? `https://openlibrary.org/books/${editionKey}` : null
      }
    });
  } catch (error) {
    return NextResponse.json({ detail: null, message: error instanceof Error ? error.message : "Book detail failed" }, { status: 500 });
  }
}

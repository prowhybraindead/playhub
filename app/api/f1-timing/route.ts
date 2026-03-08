import { NextRequest, NextResponse } from "next/server";

const F1_BASE = "https://livetiming.formula1.com/static";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const path = searchParams.get("path"); // e.g. "2026/Index.json"

    if (!path) {
      return NextResponse.json({ error: "Missing path parameter" }, { status: 400 });
    }

    const url = `${F1_BASE}/${path}`;
    const response = await fetch(url, {
      headers: { "Accept": "application/json" },
      next: { revalidate: 10 } // Cache for 10 seconds (live data changes frequently)
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `F1 API returned ${response.status}`, url },
        { status: response.status }
      );
    }

    const contentType = response.headers.get("content-type") || "";
    let data;
    if (contentType.includes("json")) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    return NextResponse.json(data, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, s-maxage=10, stale-while-revalidate=30"
      }
    });
  } catch (error: any) {
    console.error("F1 Timing Proxy Error:", error);
    return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
  }
}

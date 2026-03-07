import { NextResponse } from "next/server";

type TraceResponse = {
  result?: Array<{
    anilist?: number;
    filename?: string;
    episode?: number;
    similarity?: number;
    image?: string;
    video?: string;
  }>;
};

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("image");
    if (!(file instanceof File)) {
      return NextResponse.json({ message: "Image file is required" }, { status: 400 });
    }

    const upload = new FormData();
    upload.set("image", file);
    const response = await fetch("https://api.trace.moe/search", {
      method: "POST",
      body: upload
    });
    if (!response.ok) {
      throw new Error("Trace.moe failed");
    }
    const data = (await response.json()) as TraceResponse;
    const top = data.result?.[0];
    if (!top) return NextResponse.json({ result: null });

    return NextResponse.json({
      result: {
        title: top.filename ?? "Unknown scene",
        episode: top.episode ?? null,
        similarity: top.similarity ?? 0,
        image: top.image ?? null,
        preview: top.video ?? null
      }
    });
  } catch (error) {
    return NextResponse.json({ result: null, message: error instanceof Error ? error.message : "Trace lookup failed" }, { status: 500 });
  }
}

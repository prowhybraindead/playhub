import { NextResponse } from "next/server";
import { fetchJson } from "@/lib/external-api";

type WaifuResponse = { url: string };
type QuoteResponse = { anime: string; character: string; quote: string };

export async function GET() {
  try {
    const [waifuRes, quoteRes] = await Promise.allSettled([
      fetchJson<WaifuResponse>("https://api.waifu.pics/sfw/waifu", 1800),
      fetchJson<QuoteResponse>("https://animechan.xyz/api/random", 600)
    ]);

    const waifuUrl = waifuRes.status === "fulfilled" ? waifuRes.value.url : "https://i.pinimg.com/736x/88/2c/fd/882cfdb0c1c873ec8de50a9df72efd72.jpg";
    const quoteText = quoteRes.status === "fulfilled" ? `${quoteRes.value.quote} — ${quoteRes.value.character} (${quoteRes.value.anime})` : "Never give up! — Naruto (Naruto)";

    return NextResponse.json({
      waifuImage: waifuUrl,
      quote: quoteText
    });
  } catch (error) {
    return NextResponse.json({ waifuImage: null, quote: "", message: error instanceof Error ? error.message : "Extras unavailable" }, { status: 500 });
  }
}

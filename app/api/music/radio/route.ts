import { NextResponse } from "next/server";
import { fetchJson } from "@/lib/external-api";

type RadioStation = {
  stationuuid: string;
  name: string;
  url_resolved: string;
  favicon: string;
  country: string;
  tags: string;
};

export async function GET() {
  try {
    const stations = await fetchJson<RadioStation[]>(
      "https://de1.api.radio-browser.info/json/stations/search?tag=pop&limit=24&hidebroken=true&order=votes&reverse=true",
      3600
    );
    return NextResponse.json({
      stations: stations.map((station) => ({
        id: station.stationuuid,
        name: station.name,
        streamUrl: station.url_resolved,
        image: station.favicon || null,
        country: station.country || "Global",
        tags: station.tags || "music"
      }))
    });
  } catch (error) {
    return NextResponse.json({ stations: [], message: error instanceof Error ? error.message : "Radio unavailable" }, { status: 500 });
  }
}

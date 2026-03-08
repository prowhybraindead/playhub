import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const driver_number = searchParams.get("driver_number");
    const session_key = searchParams.get("session_key") || "latest";

    if (!driver_number) {
      return NextResponse.json({ error: "Missing driver_number" }, { status: 400 });
    }

    const openF1Url = `https://api.openf1.org/v1/car_data?driver_number=${driver_number}&session_key=${session_key}`;
    console.log("Fetching F1 Telemetry:", openF1Url);
    
    const response = await fetch(openF1Url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      next: { revalidate: 0 } // Disable Next.js aggressive cache for live data
    });
    
    if (!response.ok) {
      console.error("OpenF1 API returned:", response.status, response.statusText);
      return NextResponse.json({ error: "Failed to fetch from OpenF1", details: response.statusText }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-store, max-age=0'
      }
    });
  } catch (error: any) {
    console.error("OpenF1 Proxy Error:", error);
    return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
  }
}

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
    
    // Fetch from OpenF1 server-side to bypass browser CORS
    const response = await fetch(openF1Url);
    
    if (!response.ok) {
      return NextResponse.json({ error: "Failed to fetch from OpenF1" }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("OpenF1 Proxy Error:", error);
    return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
  }
}

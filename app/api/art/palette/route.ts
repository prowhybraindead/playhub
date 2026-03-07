import { NextRequest, NextResponse } from "next/server";

function hexToRgb(hex: string) {
  const stripped = hex.replace("#", "");
  const value = parseInt(stripped, 16);
  return {
    r: (value >> 16) & 255,
    g: (value >> 8) & 255,
    b: value & 255
  };
}

function rgbToHex(r: number, g: number, b: number) {
  return `#${[r, g, b].map((value) => value.toString(16).padStart(2, "0")).join("")}`;
}

export async function GET(request: NextRequest) {
  const base = request.nextUrl.searchParams.get("base") ?? "#1ec9ff";
  const rgb = hexToRgb(base);

  const palette = [
    base,
    rgbToHex(Math.min(255, rgb.r + 28), Math.min(255, rgb.g + 24), Math.min(255, rgb.b + 22)),
    rgbToHex(Math.max(0, rgb.r - 30), Math.max(0, rgb.g - 26), Math.max(0, rgb.b - 20)),
    rgbToHex(Math.round((rgb.r + 255) / 2), Math.round((rgb.g + 255) / 2), Math.round((rgb.b + 255) / 2)),
    rgbToHex(Math.round((rgb.r + 20) / 2), Math.round((rgb.g + 20) / 2), Math.round((rgb.b + 20) / 2))
  ];

  return NextResponse.json({ palette });
}

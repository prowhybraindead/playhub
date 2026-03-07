import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase";

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const supabase = createServerSupabaseClient(cookieStore);
  await supabase.auth.signOut();
  return NextResponse.redirect(new URL("/auth", request.url), 303);
}

import { Suspense } from "react";
import { RaceLeaderboard } from "@/components/f1/race-leaderboard";
import { RaceCommentary } from "@/components/f1/race-commentary";
import { F1AIAssistant } from "@/components/f1/f1-ai-assistant";
import { RaceCountdown } from "@/components/f1/race-countdown";
import { createServerSupabaseClient } from "@/lib/supabase";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function Formula1Page() {
  const cookieStore = await cookies();
  const supabase = createServerSupabaseClient(cookieStore as any);
  
  const {
    data: { session }
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/auth");
  }

  return (
    <div className="flex h-full min-h-screen flex-col bg-slate-950 px-3 py-6 md:px-6">
      <div className="mx-auto w-full max-w-[1600px] space-y-4">
        {/* Header */}
        <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="flex items-center gap-3 text-2xl font-extrabold uppercase tracking-tight text-white md:text-4xl">
              <span className="text-red-500">F1</span> Live Timing
            </h1>
            <p className="text-xs font-medium text-slate-400">SignalR Data • AI Commentary • Real-Time Dashboard</p>
          </div>
          <RaceCountdown />
        </header>

        {/* 3-Panel Layout */}
        <main className="grid gap-4 lg:grid-cols-[1fr_380px] h-[calc(100vh-160px)]">
          {/* Panel 1 (Left): Full-Height Leaderboard */}
          <Suspense fallback={<div className="h-full w-full animate-pulse rounded-xl bg-slate-800/50" />}>
            <RaceLeaderboard />
          </Suspense>

          {/* Right Column: Commentary + AI Assistant */}
          <div className="flex flex-col gap-4 h-full min-h-0">
            {/* Panel 2 (Top Right): Commentary & Radio */}
            <div className="flex-1 min-h-0">
              <Suspense fallback={<div className="h-full w-full animate-pulse rounded-xl bg-slate-800/50" />}>
                <RaceCommentary />
              </Suspense>
            </div>

            {/* Panel 3 (Bottom Right): AI F1 Assistant */}
            <div className="flex-1 min-h-0">
              <Suspense fallback={<div className="h-full w-full animate-pulse rounded-xl bg-slate-800/50" />}>
                <F1AIAssistant />
              </Suspense>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

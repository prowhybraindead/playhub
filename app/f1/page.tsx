import { Suspense } from "react";
import { RaceCountdown } from "@/components/f1/race-countdown";
import { F1DashboardClient } from "@/components/f1/f1-dashboard-client";
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
              <span className="text-red-500">F1</span> History Hub
            </h1>
            <p className="text-xs font-medium text-slate-400">Past Race Results & AI Archives Analysis</p>
          </div>
          <RaceCountdown />
        </header>

        {/* Client-Side Dashboard Area containing Leaderboard & AI */}
        <Suspense fallback={<div className="h-[600px] w-full animate-pulse rounded-xl bg-slate-800/50" />}>
          <F1DashboardClient />
        </Suspense>
      </div>
    </div>
  );
}

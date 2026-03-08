import { Suspense } from "react";
import { TelemetryDashboard } from "@/components/f1/telemetry-dashboard";
import { LiveBroadcast } from "@/components/f1/live-broadcast";
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
    <div className="flex h-full min-h-screen flex-col bg-slate-950 px-4 py-8 md:px-8">
      <div className="mx-auto w-full max-w-7xl space-y-8">
        <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="flex items-center gap-3 text-3xl font-extrabold uppercase tracking-tight text-white md:text-5xl">
              <span className="text-red-500">F1</span> Telemetry
            </h1>
            <p className="text-sm font-medium text-slate-400">Advanced Realtime Data & Live Broadcast Hub</p>
          </div>
          <RaceCountdown />
        </header>

        <main className="grid gap-6 lg:grid-cols-2">
          {/* Left Column: Live Video & Live Timing */}
          <div className="flex flex-col gap-6">
            <LiveBroadcast />
          </div>

          {/* Right Column: Telemetry Visualizations */}
          <div className="flex flex-col gap-6">
            <Suspense fallback={<div className="h-[400px] w-full animate-pulse rounded-xl bg-slate-800/50" />}>
              <TelemetryDashboard />
            </Suspense>
          </div>
        </main>
      </div>
    </div>
  );
}

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
    <div className="flex h-full min-h-screen flex-col bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900 px-3 py-4 md:px-6 md:py-6">
      <div className="mx-auto w-full max-w-[1700px] space-y-4">
        {/* Header */}
        <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            {/* F1 Logo Accent */}
            <div className="hidden sm:flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-lg shadow-red-500/20 overflow-hidden shrink-0">
              <img src="https://www.google.com/s2/favicons?domain=formula1.com&sz=128" alt="F1 Logo" className="w-full h-full object-contain p-2" />
            </div>
            <div>
              <h1 className="flex items-center gap-2 text-xl font-extrabold uppercase tracking-tight text-white sm:text-2xl md:text-3xl">
                <span className="sm:hidden text-red-500">F1</span>
                <span className="hidden sm:inline text-red-500">Formula 1</span>
                <span className="text-white/90">History Hub</span>
              </h1>
              <p className="text-[10px] sm:text-xs font-medium text-slate-500">Race Archives • AI Analysis • Interactive Dashboard</p>
            </div>
          </div>
          <RaceCountdown />
        </header>

        {/* Client-Side Dashboard */}
        <Suspense fallback={<div className="h-[600px] w-full animate-pulse rounded-2xl bg-slate-800/30" />}>
          <F1DashboardClient />
        </Suspense>
      </div>
    </div>
  );
}

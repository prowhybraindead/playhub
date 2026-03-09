import { Suspense } from "react";
import { RaceCountdown } from "@/components/f1/race-countdown";
import { F1DashboardClient } from "@/components/f1/f1-dashboard-client";
import { Header } from "@/components/layout/header";
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
    <div className="flex h-full min-h-screen flex-col bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900">
      {/* site navbar */}
      <Header title="Formula 1" extra={<RaceCountdown />} />

      <div className="flex-1 px-3 py-4 md:px-6 md:py-6">
        <div className="mx-auto w-full max-w-[1700px] space-y-4">
          {/* Section intro */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* F1 Logo */}
              <a href="https://www.formula1.com" target="_blank" rel="noopener noreferrer" className="flex h-16 w-16 items-center justify-center rounded-xl bg-white shadow-lg shadow-red-500/20 overflow-hidden shrink-0 hover:shadow-red-500/40 transition-shadow">
                <img src="/f1-logos/formula1.svg" alt="Formula 1 Official Website" className="w-full h-full object-contain p-2" />
              </a>
              {/* TV360 Logo */}
              <a href="https://tv360.vn/tv/tv360-12" target="_blank" rel="noopener noreferrer" className="flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-lg shadow-blue-500/20 overflow-hidden shrink-0 hover:shadow-blue-500/40 transition-shadow">
                <img src="/f1-logos/tv360.svg" alt="TV360 - Formula 1 Broadcast" className="w-full h-full object-contain p-1" />
              </a>
            </div>
          </div>

          {/* Client-Side Dashboard */}
          <Suspense fallback={<div className="h-[600px] w-full animate-pulse rounded-2xl bg-slate-800/30" />}>
            <F1DashboardClient />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

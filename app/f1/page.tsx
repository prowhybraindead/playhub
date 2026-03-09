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
      <Header 
        leftContent={
          <div className="flex items-center gap-4">
            {/* F1 Logo */}
            <a href="https://www.formula1.com" target="_blank" rel="noopener noreferrer" className="flex h-16 w-16 items-center justify-center overflow-hidden shrink-0 hover:opacity-80 transition-opacity">
              <img src="/f1-logos/formula1.svg" alt="Formula 1 Official Website" className="w-full h-full object-contain" />
            </a>
            {/* Separator */}
            <div className="text-3xl font-light text-muted-foreground opacity-40">|</div>
            {/* TV360 Logo */}
            <a href="https://tv360.vn/tv/tv360-12?ch=10001&col=7808461&sect=LIVE&page=home_live&c=0" target="_blank" rel="noopener noreferrer" className="flex h-14 w-14 items-center justify-center overflow-hidden shrink-0 hover:opacity-80 transition-opacity">
              <img src="/f1-logos/tv360.svg" alt="TV360 - Formula 1 Broadcast" className="w-full h-full object-contain" />
            </a>
          </div>
        }
        extra={<RaceCountdown />}
      />

      <div className="flex-1 px-3 py-4 md:px-6 md:py-6">
        <div className="mx-auto w-full max-w-[1700px] space-y-4">
          {/* Client-Side Dashboard */}
          <Suspense fallback={<div className="h-[600px] w-full animate-pulse rounded-2xl bg-slate-800/30" />}>
            <F1DashboardClient />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

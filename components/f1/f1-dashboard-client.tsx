"use client";

import { useState, Suspense } from "react";
import { HistoricalLeaderboard } from "@/components/f1/historical-leaderboard";
import { F1AIAssistant } from "@/components/f1/f1-ai-assistant";

export function F1DashboardClient() {
  const [selectedRaceContext, setSelectedRaceContext] = useState<string>("");

  const handleRaceSelect = (raceName: string, year: string, round: string) => {
    setSelectedRaceContext(`Analyzing race: ${year} ${raceName} (Round ${round}). Please provide historical context, analysis, and answer user questions accurately about this specific event.`);
  };

  return (
    <main className="grid gap-4 lg:grid-cols-[1fr_400px] h-[calc(100vh-160px)] min-h-[600px]">
      {/* Panel 1 (Left): Full-Height Historical Leaderboard */}
      <Suspense fallback={<div className="h-full w-full animate-pulse rounded-xl bg-slate-800/50" />}>
        <HistoricalLeaderboard onRaceSelect={handleRaceSelect} />
      </Suspense>

      {/* Right Column: AI Assistant */}
      <div className="flex flex-col gap-4 h-full min-h-0">
        <Suspense fallback={<div className="h-full w-full animate-pulse rounded-xl bg-slate-800/50" />}>
          <F1AIAssistant historicalContext={selectedRaceContext} />
        </Suspense>
      </div>
    </main>
  );
}

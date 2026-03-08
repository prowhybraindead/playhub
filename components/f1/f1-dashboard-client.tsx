"use client";

import { useState, Suspense } from "react";
import { HistoricalLeaderboard } from "@/components/f1/historical-leaderboard";
import { F1AIAssistant } from "@/components/f1/f1-ai-assistant";

import { useTranslation } from "@/components/providers/i18n-provider";

export function F1DashboardClient() {
  const { locale } = useTranslation();
  const [selectedRaceContext, setSelectedRaceContext] = useState<string>("");

  const handleRaceSelect = (raceName: string, year: string, round: string) => {
    setSelectedRaceContext(`Analyzing race: ${year} ${raceName} (Round ${round}). Please provide historical context, analysis, and answer user questions accurately about this specific event.`);
  };

  return (
    <div className="flex flex-col lg:grid lg:grid-cols-[1fr_420px] gap-4 min-h-[500px] lg:h-[calc(100vh-200px)]">
      {/* Panel 1: Historical Leaderboard */}
      <div className="h-[60vh] lg:h-full min-h-[400px]">
        <Suspense fallback={<div className="h-full w-full animate-pulse rounded-2xl bg-slate-800/50" />}>
          <HistoricalLeaderboard onRaceSelect={handleRaceSelect} />
        </Suspense>
      </div>

      {/* Panel 2: AI Assistant */}
      <div className="h-[50vh] lg:h-full min-h-[350px]">
        <Suspense fallback={<div className="h-full w-full animate-pulse rounded-2xl bg-slate-800/50" />}>
          <F1AIAssistant historicalContext={selectedRaceContext} currentLanguage={locale} />
        </Suspense>
      </div>
    </div>
  );
}

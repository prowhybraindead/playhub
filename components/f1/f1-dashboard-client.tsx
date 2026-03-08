"use client";

import { useState, Suspense } from "react";
import { HistoricalLeaderboard } from "@/components/f1/historical-leaderboard";
import { F1AIAssistant } from "@/components/f1/f1-ai-assistant";
import { F1Drivers } from "@/components/f1/f1-drivers";
import { F1Circuits } from "@/components/f1/f1-circuits";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LayoutDashboard, Users, MapPin } from "lucide-react";

import { useTranslation } from "@/components/providers/i18n-provider";

export function F1DashboardClient() {
  const { locale } = useTranslation();
  const [selectedRaceContext, setSelectedRaceContext] = useState<string>("");

  const handleRaceSelect = (raceName: string, year: string, round: string) => {
    setSelectedRaceContext(`Analyzing race: ${year} ${raceName} (Round ${round}). Please provide historical context, analysis, and answer user questions accurately about this specific event.`);
  };

  return (
    <div className="w-full">
      <Tabs defaultValue="dashboard" className="w-full flex flex-col gap-4">
        <TabsList className="bg-slate-900/80 border border-slate-800/50 p-1.5 h-auto flex flex-wrap sm:flex-nowrap w-full lg:w-fit rounded-xl backdrop-blur-sm self-center sm:self-start mb-2">
          <TabsTrigger value="dashboard" className="text-xs sm:text-sm flex-1 sm:flex-none data-[state=active]:bg-red-600 data-[state=active]:text-white rounded-lg py-2 px-4 shadow-sm transition-all md:min-w-[140px]">
            <LayoutDashboard className="w-4 h-4 mr-2" />
            AI Dashboard
          </TabsTrigger>
          <TabsTrigger value="drivers" className="text-xs sm:text-sm flex-1 sm:flex-none data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-lg py-2 px-4 shadow-sm transition-all md:min-w-[140px]">
            <Users className="w-4 h-4 mr-2" />
            Drivers
          </TabsTrigger>
          <TabsTrigger value="circuits" className="text-xs sm:text-sm flex-1 sm:flex-none data-[state=active]:bg-emerald-600 data-[state=active]:text-white rounded-lg py-2 px-4 shadow-sm transition-all md:min-w-[140px]">
            <MapPin className="w-4 h-4 mr-2" />
            Circuits
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
          <div className="flex flex-col lg:grid lg:grid-cols-[1fr_420px] gap-4 min-h-[500px] lg:h-[calc(100vh-220px)]">
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
        </TabsContent>

        <TabsContent value="drivers" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
          <Suspense fallback={<div className="h-[500px] w-full animate-pulse rounded-2xl bg-slate-800/50" />}>
            <F1Drivers />
          </Suspense>
        </TabsContent>

        <TabsContent value="circuits" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
          <Suspense fallback={<div className="h-[500px] w-full animate-pulse rounded-2xl bg-slate-800/50" />}>
            <F1Circuits />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  );
}

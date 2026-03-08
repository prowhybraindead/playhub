"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { CalendarClock, MapPin, Loader2 } from "lucide-react";
import { useTranslation } from "@/components/providers/i18n-provider";

export function RaceCountdown() {
  const { t } = useTranslation();
  
  const [raceInfo, setRaceInfo] = useState<{
    date: Date | null;
    name: string;
    location: string;
  }>({
    date: null,
    name: "Loading...",
    location: "Loading..."
  });

  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchNextRace() {
      try {
        setIsLoading(true);
        const res = await fetch("https://api.jolpi.ca/ergast/f1/current/next.json");
        if (res.ok) {
          const data = await res.json();
          const nextRace = data.MRData?.RaceTable?.Races?.[0];
          if (nextRace) {
            const raceZuluString = `${nextRace.date}T${nextRace.time || "14:00:00Z"}`;
            setRaceInfo({
              date: new Date(raceZuluString),
              name: nextRace.raceName,
              location: `${nextRace.Circuit.Location.locality}, ${nextRace.Circuit.Location.country}`
            });
          }
        }
      } catch (e) {
        console.error("Failed to load next race info:", e);
        setRaceInfo({
          date: null,
          name: "Schedule Unavailable",
          location: "Check back later"
        });
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchNextRace();
  }, []);

  useEffect(() => {
    if (!raceInfo.date) return;

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = raceInfo.date!.getTime() - now;

      if (distance <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        clearInterval(timer);
        return;
      }

      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000)
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [raceInfo.date]);

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-slate-500 text-xs">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span>Loading schedule...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-5 rounded-2xl border border-red-500/15 bg-black/40 backdrop-blur-xl px-4 py-3 shadow-lg shadow-red-500/5">
      {/* Race Info */}
      <div className="flex flex-col gap-0.5 min-w-0">
        <Badge variant="outline" className="w-fit border-red-500/50 bg-red-500/10 text-red-400 text-[9px] uppercase tracking-wider font-bold px-2 py-0">
          {t("Next Race")}
        </Badge>
        <div className="flex items-center gap-1.5 text-white mt-1">
          <MapPin className="h-3 w-3 text-red-400 shrink-0" />
          <span className="font-bold text-xs sm:text-sm truncate max-w-[180px] sm:max-w-none">{raceInfo.name}</span>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] sm:text-xs text-slate-500">
          <CalendarClock className="h-3 w-3 shrink-0" />
          <span>{raceInfo.date ? raceInfo.date.toLocaleDateString('vi-VN') : "--/--/----"}</span>
          <span className="text-slate-700">•</span>
          <span className="truncate max-w-[120px] sm:max-w-[180px]">{raceInfo.location}</span>
        </div>
      </div>
      
      {/* Countdown Timer */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        <TimeUnit value={timeLeft.days} label={t("Days")} />
        <span className="text-lg font-bold text-red-500/60">:</span>
        <TimeUnit value={timeLeft.hours} label={t("Hrs")} />
        <span className="text-lg font-bold text-red-500/60">:</span>
        <TimeUnit value={timeLeft.minutes} label={t("Min")} />
        <span className="text-lg font-bold text-red-500/60">:</span>
        <TimeUnit value={timeLeft.seconds} label={t("Sec")} accent />
      </div>
    </div>
  );
}

function TimeUnit({ value, label, accent }: { value: number; label: string; accent?: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg bg-slate-900/80 border border-slate-800/50 px-2 py-1.5 min-w-[40px] sm:min-w-[46px] shadow-inner">
      <span className={`font-mono text-base sm:text-xl font-bold ${accent ? "text-red-400" : "text-white"}`}>
        {value.toString().padStart(2, '0')}
      </span>
      <span className="text-[8px] sm:text-[9px] font-semibold uppercase tracking-wider text-slate-500">
        {label}
      </span>
    </div>
  );
}

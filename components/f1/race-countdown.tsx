"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarClock, MapPin } from "lucide-react";
import { useTranslation } from "@/components/providers/i18n-provider";

export function RaceCountdown() {
  const { t } = useTranslation();
  // Upcoming race: Saudi Arabian Grand Prix 2026
  const nextRaceDate = new Date("2026-03-22T17:00:00Z"); 
  const raceName = "Saudi Arabian Grand Prix";
  const location = "Jeddah, Saudi Arabia";

  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = nextRaceDate.getTime() - now;

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
  }, [nextRaceDate]);

  return (
    <Card className="border-red-500/20 bg-black/60 backdrop-blur-md">
      <CardContent className="flex items-center gap-6 p-4">
        <div className="flex flex-col">
          <Badge variant="outline" className="w-fit border-red-500 bg-red-500/10 text-red-500">
            {t("Next Race")}
          </Badge>
          <div className="mt-2 flex items-center gap-2 text-white">
            <MapPin className="h-4 w-4 text-slate-400" />
            <span className="font-semibold">{raceName}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <CalendarClock className="h-3 w-3" />
            <span>{nextRaceDate.toLocaleDateString()}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <TimeUnit value={timeLeft.days} label={t("Days")} />
          <span className="text-2xl font-bold text-red-500">:</span>
          <TimeUnit value={timeLeft.hours} label={t("Hrs")} />
          <span className="text-2xl font-bold text-red-500">:</span>
          <TimeUnit value={timeLeft.minutes} label={t("Min")} />
          <span className="text-2xl font-bold text-red-500">:</span>
          <TimeUnit value={timeLeft.seconds} label={t("Sec")} />
        </div>
      </CardContent>
    </Card>
  );
}

function TimeUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg bg-slate-900/80 p-2 shadow-inner min-w-[50px]">
      <span className="font-mono text-2xl font-bold text-white">
        {value.toString().padStart(2, '0')}
      </span>
      <span className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
        {label}
      </span>
    </div>
  );
}

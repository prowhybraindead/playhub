"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { CalendarClock, MapPin, Loader2, Play, Square } from "lucide-react";
import { useTranslation } from "@/components/providers/i18n-provider";

type SessionType = "fp1" | "fp2" | "fp3" | "sq1" | "sq2" | "sq3" | "sprint" | "q1" | "q2" | "q3" | "race";
type SessionStatus = "upcoming" | "live" | "finished";

interface SessionInfo {
  session_key: number;
  session_name: string;
  date_start: string;
  date_end: string;
  session_type: SessionType;
  circuit_short_name: string;
  country_name: string;
  status?: SessionStatus;
}

export function RaceCountdown() {
  const { t } = useTranslation();
  
  const [sessionInfo, setSessionInfo] = useState<SessionInfo | null>(null);
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [sessionStatus, setSessionStatus] = useState<SessionStatus>("upcoming");

  useEffect(() => {
    async function fetchCurrentSession() {
      try {
        setIsLoading(true);
        
        // Get current/next session from OpenF1 API
        const sessionsRes = await fetch("https://api.openf1.org/v1/sessions?session_key=latest");
        if (sessionsRes.ok) {
          const sessions = await sessionsRes.json();
          if (sessions && sessions.length > 0) {
            const currentSession = sessions[0];
            setSessionInfo(currentSession);
            
            // Check if session is currently live
            const now = new Date();
            const sessionStart = new Date(currentSession.date_start);
            const sessionEnd = new Date(currentSession.date_end);
            
            if (now >= sessionStart && now <= sessionEnd) {
              setSessionStatus("live");
            } else if (now > sessionEnd) {
              setSessionStatus("finished");
            } else {
              setSessionStatus("upcoming");
            }
          }
        } else {
          // Fallback to Ergast API if OpenF1 fails
          await fetchNextRaceFallback();
        }
      } catch (e) {
        console.error("Failed to load session info:", e);
        await fetchNextRaceFallback();
      } finally {
        setIsLoading(false);
      }
    }
    
    async function fetchNextRaceFallback() {
      try {
        const res = await fetch("https://api.jolpi.ca/ergast/f1/current/next.json");
        if (res.ok) {
          const data = await res.json();
          const nextRace = data.MRData?.RaceTable?.Races?.[0];
          if (nextRace) {
            const raceZuluString = `${nextRace.date}T${nextRace.time || "14:00:00Z"}`;
            setSessionInfo({
              session_key: 0,
              session_name: nextRace.raceName,
              date_start: raceZuluString,
              date_end: raceZuluString,
              session_type: "race",
              circuit_short_name: nextRace.Circuit.circuitName,
              country_name: nextRace.Circuit.Location.country
            });
            setSessionStatus("upcoming");
          }
        }
      } catch (e) {
        console.error("Fallback API also failed:", e);
        setSessionInfo(null);
      }
    }
    
    fetchCurrentSession();
  }, []);

  useEffect(() => {
    if (!sessionInfo) return;

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const sessionStart = new Date(sessionInfo.date_start).getTime();
      const sessionEnd = new Date(sessionInfo.date_end).getTime();
      
      let targetTime: number;
      let isCountdown = true;
      
      if (sessionStatus === "live") {
        // Show time remaining in live session
        targetTime = sessionEnd;
        isCountdown = true;
      } else if (sessionStatus === "upcoming") {
        // Show time until session starts
        targetTime = sessionStart;
        isCountdown = true;
      } else {
        // Session finished, show time since end
        targetTime = sessionEnd;
        isCountdown = false;
      }
      
      const distance = isCountdown ? targetTime - now : now - targetTime;

      if (distance <= 0 && isCountdown) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        // Refresh session status
        if (sessionStatus === "upcoming") {
          setSessionStatus("live");
        } else if (sessionStatus === "live") {
          setSessionStatus("finished");
        }
        return;
      }

      setTimeLeft({
        days: Math.floor(Math.abs(distance) / (1000 * 60 * 60 * 24)),
        hours: Math.floor((Math.abs(distance) % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((Math.abs(distance) % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((Math.abs(distance) % (1000 * 60)) / 1000)
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [sessionInfo, sessionStatus]);

  const getSessionTypeLabel = (type: SessionType) => {
    const labels: Record<SessionType, string> = {
      fp1: "FP1",
      fp2: "FP2", 
      fp3: "FP3",
      sq1: "SQ1",
      sq2: "SQ2",
      sq3: "SQ3",
      sprint: "Sprint",
      q1: "Q1",
      q2: "Q2",
      q3: "Q3",
      race: "Race"
    };
    return labels[type] || type.toUpperCase();
  };

  const getStatusBadge = () => {
    switch (sessionStatus) {
      case "live":
        return (
          <Badge variant="outline" className="w-fit border-green-500/50 bg-green-500/10 text-green-400 text-[9px] uppercase tracking-wider font-bold px-2 py-0">
            <Play className="w-2.5 h-2.5 mr-1" />
            Live
          </Badge>
        );
      case "finished":
        return (
          <Badge variant="outline" className="w-fit border-gray-500/50 bg-gray-500/10 text-gray-400 text-[9px] uppercase tracking-wider font-bold px-2 py-0">
            <Square className="w-2.5 h-2.5 mr-1" />
            Ended
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="w-fit border-red-500/50 bg-red-500/10 text-red-400 text-[9px] uppercase tracking-wider font-bold px-2 py-0">
            {t("Next Race")}
          </Badge>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-slate-500 text-xs">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span>Loading schedule...</span>
      </div>
    );
  }

  if (!sessionInfo) {
    return (
      <div className="flex items-center gap-2 text-slate-500 text-xs">
        <span>Schedule unavailable</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-5 rounded-2xl border border-red-500/15 bg-black/40 backdrop-blur-xl px-4 py-3 shadow-lg shadow-red-500/5">
      {/* Session Info */}
      <div className="flex flex-col gap-0.5 min-w-0">
        <div className="flex items-center gap-2">
          {getStatusBadge()}
          <Badge variant="outline" className="w-fit border-blue-500/50 bg-blue-500/10 text-blue-400 text-[9px] uppercase tracking-wider font-bold px-2 py-0">
            {getSessionTypeLabel(sessionInfo.session_type)}
          </Badge>
        </div>
        <div className="flex items-center gap-1.5 text-white mt-1">
          <MapPin className="h-3 w-3 text-red-400 shrink-0" />
          <span className="font-bold text-xs sm:text-sm truncate max-w-[180px] sm:max-w-none">{sessionInfo.session_name}</span>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] sm:text-xs text-slate-500">
          <CalendarClock className="h-3 w-3 shrink-0" />
          <span>{new Date(sessionInfo.date_start).toLocaleDateString('vi-VN')}</span>
          <span className="text-slate-700">•</span>
          <span className="truncate max-w-[120px] sm:max-w-[180px]">{sessionInfo.circuit_short_name}, {sessionInfo.country_name}</span>
        </div>
      </div>
      
      {/* Timer */}
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

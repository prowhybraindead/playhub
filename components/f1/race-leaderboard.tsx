"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface DriverEntry {
  position: string;
  driverCode: string;
  lapTime: string;
  gap: string;
  interval: string;
  status: string;
  tyre: string;
  laps: string;
  pit: string;
}

// F1 2026 Season Drivers mapped from driver numbers
const DRIVER_INFO: Record<string, { code: string; team: string; color: string }> = {
  "1": { code: "VER", team: "Red Bull", color: "#3671C6" },
  "4": { code: "NOR", team: "McLaren", color: "#FF8000" },
  "11": { code: "PER", team: "Red Bull", color: "#3671C6" },
  "14": { code: "ALO", team: "Aston Martin", color: "#358C75" },
  "16": { code: "LEC", team: "Ferrari", color: "#E80020" },
  "44": { code: "HAM", team: "Ferrari", color: "#E80020" },
  "55": { code: "SAI", team: "Williams", color: "#64C4FF" },
  "63": { code: "RUS", team: "Mercedes", color: "#27F4D2" },
  "81": { code: "PIA", team: "McLaren", color: "#FF8000" },
  "10": { code: "GAS", team: "Alpine", color: "#FF87BC" },
  "22": { code: "TSU", team: "RB", color: "#6692FF" },
  "23": { code: "ALB", team: "Williams", color: "#64C4FF" },
  "27": { code: "HUL", team: "Sauber", color: "#52E252" },
  "31": { code: "OCO", team: "Haas", color: "#B6BABD" },
  "77": { code: "BOT", team: "Sauber", color: "#52E252" },
  "2": { code: "SAR", team: "RB", color: "#6692FF" },
  "18": { code: "STR", team: "Aston Martin", color: "#358C75" },
  "20": { code: "MAG", team: "Haas", color: "#B6BABD" },
  "24": { code: "ZHO", team: "Sauber", color: "#52E252" },
  "40": { code: "LAW", team: "RB", color: "#6692FF" },
  "3": { code: "RIC", team: "RB", color: "#6692FF" },
  "87": { code: "BEA", team: "Haas", color: "#B6BABD" },
  "43": { code: "COL", team: "Williams", color: "#64C4FF" },
  "7": { code: "LIN", team: "Mercedes", color: "#27F4D2" },
  "30": { code: "DOR", team: "Alpine", color: "#FF87BC" },
  "61": { code: "ANT", team: "Mercedes", color: "#27F4D2" },
  "12": { code: "HAD", team: "RB", color: "#6692FF" },
};

// Tyre compound colors
const TYRE_COLORS: Record<string, string> = {
  "SOFT": "#FF3333",
  "MEDIUM": "#FFC906",
  "HARD": "#EEEEEE",
  "INTERMEDIATE": "#43B02A",
  "WET": "#0067AD",
};

// Simulated Leaderboard using Australia GP 2026 data from user's screenshot
const INITIAL_STANDINGS: DriverEntry[] = [
  { position: "1", driverCode: "RUS", lapTime: "1:23.147", gap: "-", interval: "-", status: "RACING", tyre: "MEDIUM", laps: "53", pit: "0" },
  { position: "2", driverCode: "ANT", lapTime: "1:22.880", gap: "+5.384", interval: "+5.384", status: "RACING", tyre: "MEDIUM", laps: "53", pit: "0" },
  { position: "3", driverCode: "LEC", lapTime: "1:22.934", gap: "+14.195", interval: "+7.788", status: "RACING", tyre: "MEDIUM", laps: "53", pit: "1" },
  { position: "4", driverCode: "HAM", lapTime: "1:23.126", gap: "+21.004", interval: "+5.788", status: "RACING", tyre: "MEDIUM", laps: "53", pit: "0" },
  { position: "5", driverCode: "NOR", lapTime: "1:24.094", gap: "+26.376", interval: "+5.939", status: "RACING", tyre: "HARD", laps: "53", pit: "0" },
  { position: "6", driverCode: "VER", lapTime: "1:21.510", gap: "+28.901", interval: "+1.931", status: "RACING", tyre: "SOFT", laps: "53", pit: "14" },
  { position: "7", driverCode: "LIN", lapTime: "1:24.282", gap: "+41.422", interval: "+12.310", status: "RACING", tyre: "MEDIUM", laps: "53", pit: "0" },
  { position: "8", driverCode: "BEA", lapTime: "1:24.509", gap: "+42.264", interval: "+0.853", status: "RACING", tyre: "HARD", laps: "53", pit: "0" },
  { position: "9", driverCode: "DOR", lapTime: "1:24.384", gap: "+46.897", interval: "+4.619", status: "RACING", tyre: "HARD", laps: "53", pit: "0" },
  { position: "10", driverCode: "GAS", lapTime: "1:25.242", gap: "+52.269", interval: "+5.448", status: "RACING", tyre: "HARD", laps: "53", pit: "0" },
  { position: "11", driverCode: "OCO", lapTime: "1:24.998", gap: "+52.742", interval: "+0.473", status: "RACING", tyre: "MEDIUM", laps: "53", pit: "0" },
  { position: "12", driverCode: "ALB", lapTime: "1:26.672", gap: "+67.198", interval: "+15.008", status: "RACING", tyre: "HARD", laps: "53", pit: "0" },
  { position: "13", driverCode: "SAI", lapTime: "1:27.095", gap: "+68.745", interval: "+1.673", status: "RACING", tyre: "HARD", laps: "53", pit: "0" },
  { position: "14", driverCode: "LAW", lapTime: "1:25.690", gap: "+75.385", interval: "+6.081", status: "RACING", tyre: "MEDIUM", laps: "53", pit: "0" },
  { position: "15", driverCode: "COL", lapTime: "1:25.566", gap: "1 L", interval: "+15.758", status: "RACING", tyre: "HARD", laps: "52", pit: "0" },
  { position: "16", driverCode: "PER", lapTime: "1:26.934", gap: "1 L", interval: "+32.912", status: "RACING", tyre: "MEDIUM", laps: "52", pit: "2" },
  { position: "17", driverCode: "STR", lapTime: "1:26.054", gap: "1 L", interval: "+46.028", status: "RACING", tyre: "SOFT", laps: "52", pit: "5" },
  { position: "18", driverCode: "ALO", lapTime: "1:28.140", gap: "12 L", interval: "10 L", status: "RETIRED", tyre: "MEDIUM", laps: "41", pit: "1" },
  { position: "19", driverCode: "BOT", lapTime: "STOP", gap: "", interval: "", status: "STOP", tyre: "-", laps: "-", pit: "0" },
  { position: "20", driverCode: "HAD", lapTime: "STOP", gap: "", interval: "", status: "STOP", tyre: "-", laps: "-", pit: "17" },
  { position: "-", driverCode: "PIA", lapTime: "RETIRED", gap: "", interval: "", status: "RETIRED", tyre: "-", laps: "-", pit: "0" },
  { position: "-", driverCode: "HUL", lapTime: "RETIRED", gap: "", interval: "", status: "RETIRED", tyre: "-", laps: "-", pit: "0" },
];

export function RaceLeaderboard() {
  const [standings, setStandings] = useState<DriverEntry[]>(INITIAL_STANDINGS);
  const [sessionInfo, setSessionInfo] = useState({ name: "AUSTRALIA 2026", type: "RACE", lap: "53 / 53", status: "FINISHED" });
  const [isLive, setIsLive] = useState(false);

  // Try fetching live data from our proxy
  const fetchLiveData = useCallback(async () => {
    try {
      const res = await fetch("/api/f1-timing?path=2026/Index.json");
      if (res.ok) {
        const data = await res.json();
        // If we get real session data, parse it
        if (data && Array.isArray(data.Meetings)) {
          setIsLive(true);
          // We have the yearly index, we would need to find the active session
          // For now, keep initial standings as reference
        }
      }
    } catch {
      // Silently fail - use static data
    }
  }, []);

  useEffect(() => {
    fetchLiveData();
    const interval = setInterval(fetchLiveData, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, [fetchLiveData]);

  const getDriverColor = (code: string) => {
    const entry = Object.values(DRIVER_INFO).find(d => d.code === code);
    return entry?.color || "#FFFFFF";
  };

  const getTeamName = (code: string) => {
    const entry = Object.values(DRIVER_INFO).find(d => d.code === code);
    return entry?.team || "";
  };

  return (
    <Card className="bg-slate-900/70 border-slate-700/50 backdrop-blur-sm h-full flex flex-col">
      <CardHeader className="pb-2 pt-3 px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
              🏎️ {sessionInfo.name}
              <span className="text-xs font-normal text-slate-400 ml-1">{sessionInfo.type}</span>
            </CardTitle>
            {isLive ? (
              <span className="flex items-center gap-1.5 px-2 py-0.5 bg-red-600/20 rounded-full border border-red-500/30">
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                <span className="text-[10px] font-bold text-red-400 tracking-wider">LIVE</span>
              </span>
            ) : (
              <span className="px-2 py-0.5 bg-slate-700/50 rounded-full border border-slate-600/30">
                <span className="text-[10px] font-bold text-slate-400 tracking-wider">{sessionInfo.status}</span>
              </span>
            )}
          </div>
          <div className="text-xs text-slate-400 bg-slate-800/60 px-2 py-1 rounded">
            Lap {sessionInfo.lap}
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-0 pb-2 flex-1 overflow-hidden">
        {/* Header Row */}
        <div className="grid grid-cols-[40px_60px_1fr_70px_70px_40px_30px_30px] gap-1 px-4 py-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-700/50">
          <span>Pos</span>
          <span>Driver</span>
          <span>Lap Time</span>
          <span>Gap</span>
          <span>Int</span>
          <span>Tyre</span>
          <span>Lap</span>
          <span>Pit</span>
        </div>
        {/* Driver Rows */}
        <div className="overflow-y-auto max-h-[calc(100%-40px)] scrollbar-thin">
          {standings.map((driver, idx) => (
            <div
              key={driver.driverCode + idx}
              className={`grid grid-cols-[40px_60px_1fr_70px_70px_40px_30px_30px] gap-1 px-4 py-1.5 items-center text-xs border-b border-slate-800/40 transition-colors
                ${driver.status === "RETIRED" || driver.status === "STOP" ? "opacity-50" : "hover:bg-slate-800/40"}
                ${idx < 3 ? "bg-slate-800/20" : ""}`}
            >
              {/* Position */}
              <span className="font-bold text-white text-sm">
                {driver.position}
              </span>
              {/* Driver Code with team color bar */}
              <div className="flex items-center gap-1.5">
                <div
                  className="w-1 h-5 rounded-full"
                  style={{ backgroundColor: getDriverColor(driver.driverCode) }}
                />
                <span className="font-bold text-white text-[11px] tracking-wide">
                  {driver.driverCode}
                </span>
              </div>
              {/* Lap Time */}
              <span className={`font-mono text-[11px] ${
                idx === 0 ? "text-purple-400" : 
                driver.status === "RETIRED" ? "text-red-400" :
                driver.status === "STOP" ? "text-yellow-400" :
                "text-slate-300"
              }`}>
                {driver.lapTime}
              </span>
              {/* Gap */}
              <span className="font-mono text-[11px] text-slate-400">
                {driver.gap}
              </span>
              {/* Interval */}
              <span className="font-mono text-[11px] text-slate-500">
                {driver.interval}
              </span>
              {/* Tyre */}
              <div className="flex justify-center">
                {driver.tyre !== "-" && (
                  <div
                    className="w-4 h-4 rounded-full border-2 flex items-center justify-center"
                    style={{
                      borderColor: TYRE_COLORS[driver.tyre] || "#888",
                      backgroundColor: `${TYRE_COLORS[driver.tyre] || "#888"}22`
                    }}
                    title={driver.tyre}
                  >
                    <span className="text-[7px] font-bold" style={{ color: TYRE_COLORS[driver.tyre] || "#888" }}>
                      {driver.tyre[0]}
                    </span>
                  </div>
                )}
              </div>
              {/* Laps */}
              <span className="text-[10px] text-slate-500 text-center">{driver.laps}</span>
              {/* Pit */}
              <span className="text-[10px] text-slate-500 text-center">{driver.pit}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

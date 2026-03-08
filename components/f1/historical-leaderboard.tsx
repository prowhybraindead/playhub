"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Trophy, Timer, Flag, AlertCircle, Loader2, ChevronDown } from "lucide-react";

interface Race {
  round: string;
  raceName: string;
  date: string;
  time?: string;
  Circuit: {
    circuitName: string;
    Location: { locality: string; country: string; }
  };
}

interface RaceResult {
  number: string;
  position: string;
  points: string;
  Driver: {
    givenName: string;
    familyName: string;
    code: string;
  };
  Constructor: {
    name: string;
  };
  grid: string;
  laps: string;
  status: string;
  Time?: {
    millis: string;
    time: string;
  };
  FastestLap?: {
    rank: string;
    lap: string;
    Time: { time: string };
    AverageSpeed: { units: string; speed: string };
  };
}

// Map constructors to F1 brand colors
const teamColors: Record<string, string> = {
  "Mercedes": "#27F4D2",
  "Red Bull": "#3671C6",
  "Ferrari": "#E8002D",
  "McLaren": "#FF8000",
  "Aston Martin": "#229971",
  "Alpine F1 Team": "#0093cc",
  "Williams": "#64C4FF",
  "RB F1 Team": "#6692FF",
  "Kick Sauber": "#52E252",
  "Haas F1 Team": "#B6BABD",
  "AlphaTauri": "#5E8FAA",
  "Alfa Romeo": "#C92D4B",
  "Racing Point": "#F596C8",
  "Renault": "#FFF500",
};

const podiumEmojis: Record<string, string> = { "1": "🥇", "2": "🥈", "3": "🥉" };

export function HistoricalLeaderboard({ 
  onRaceSelect 
}: { 
  onRaceSelect?: (raceName: string, year: string, round: string) => void 
}) {
  const [selectedYear, setSelectedYear] = useState<string>("2024");
  const [selectedRound, setSelectedRound] = useState<string>("1");
  const years = Array.from({length: 10}, (_, i) => (new Date().getFullYear() - i).toString());
  
  const [races, setRaces] = useState<Race[]>([]);
  const [results, setResults] = useState<RaceResult[]>([]);
  const [isLoadingRaces, setIsLoadingRaces] = useState(false);
  const [isLoadingResults, setIsLoadingResults] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch races for the selected year
  useEffect(() => {
    async function fetchRaces() {
      setIsLoadingRaces(true);
      setError(null);
      try {
        const res = await fetch(`https://api.jolpi.ca/ergast/f1/${selectedYear}.json`);
        if (!res.ok) throw new Error("Failed to fetch calendar");
        const data = await res.json();
        const raceList = data.MRData.RaceTable.Races || [];
        setRaces(raceList);
        
        if (raceList.length > 0) {
           const roundExists = raceList.some((r: Race) => r.round === selectedRound);
           if (!roundExists) {
             setSelectedRound(raceList[0].round);
           }
        } else {
           setResults([]);
        }
      } catch (err: any) {
        setError("Error loading calendar data.");
        console.error(err);
      } finally {
        setIsLoadingRaces(false);
      }
    }
    fetchRaces();
  }, [selectedYear]);

  // Fetch results for the selected race
  useEffect(() => {
    async function fetchResults() {
      if (!selectedRound) return;
      setIsLoadingResults(true);
      setError(null);
      try {
        const res = await fetch(`https://api.jolpi.ca/ergast/f1/${selectedYear}/${selectedRound}/results.json`);
        if (!res.ok) throw new Error("Failed to fetch results");
        const data = await res.json();
        const raceData = data.MRData.RaceTable.Races[0];
        
        if (raceData?.Results) {
          setResults(raceData.Results);
          if (onRaceSelect && raceData.raceName) {
             onRaceSelect(raceData.raceName, selectedYear, selectedRound);
          }
        } else {
          setResults([]);
          if (onRaceSelect) {
             const upcomingRace = races.find(r => r.round === selectedRound);
             onRaceSelect(upcomingRace?.raceName || "Upcoming Race", selectedYear, selectedRound);
          }
        }
      } catch (err: any) {
        setError("Error loading race results.");
        console.error(err);
      } finally {
        setIsLoadingResults(false);
      }
    }
    fetchResults();
  }, [selectedYear, selectedRound, races]);

  const currentRace = races.find(r => r.round === selectedRound);

  return (
    <Card className="bg-slate-900/80 border-slate-800/50 backdrop-blur-sm flex flex-col h-full overflow-hidden shadow-2xl rounded-2xl">
      {/* Header */}
      <CardHeader className="border-b border-slate-800/50 bg-gradient-to-r from-slate-900/90 to-slate-800/50 p-3 sm:p-4 shrink-0 space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-yellow-500 to-amber-600 shadow-md">
              <Trophy className="w-4 h-4 text-white" />
            </div>
            <CardTitle className="text-sm sm:text-base font-bold text-white uppercase tracking-wider">
              Race Results
            </CardTitle>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Year Selector */}
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-[85px] sm:w-[100px] bg-slate-800/80 border-slate-700/50 text-white text-xs sm:text-sm h-8 sm:h-9 rounded-lg focus:ring-red-500/50">
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700 text-white">
                {years.map(year => (
                  <SelectItem key={year} value={year} className="text-xs sm:text-sm">{year}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Race Selector */}
            <Select 
              value={selectedRound} 
              onValueChange={setSelectedRound}
              disabled={isLoadingRaces || races.length === 0}
            >
              <SelectTrigger className="w-[160px] sm:w-[240px] md:w-[280px] bg-slate-800/80 border-slate-700/50 text-white text-xs sm:text-sm h-8 sm:h-9 rounded-lg focus:ring-red-500/50 truncate">
                <SelectValue placeholder="Select Race" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700 text-white max-h-[350px]">
                {races.map((r) => (
                  <SelectItem key={r.round} value={r.round} className="text-xs sm:text-sm">
                    R{r.round} • {r.raceName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Race Info Bar */}
        {currentRace && (
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] sm:text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              {currentRace.Circuit.circuitName}
            </span>
            <span className="flex items-center gap-1">
              <Flag className="w-3 h-3" />
              {currentRace.Circuit.Location.locality}, {currentRace.Circuit.Location.country}
            </span>
            <span className="flex items-center gap-1">
              <Timer className="w-3 h-3" />
              {new Date(currentRace.date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
            </span>
          </div>
        )}
      </CardHeader>

      {/* Content */}
      <CardContent className="p-0 flex-1 overflow-auto bg-slate-950/30">
        {error && (
          <div className="p-8 flex flex-col items-center justify-center text-center text-red-400 gap-3">
            <AlertCircle className="w-10 h-10 opacity-60" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {isLoadingResults ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 py-16">
            <Loader2 className="w-8 h-8 animate-spin text-red-500/60" />
            <p className="text-xs text-slate-500">Loading results...</p>
          </div>
        ) : results.length === 0 && !isLoadingRaces ? (
          <div className="p-12 sm:p-16 flex flex-col items-center justify-center text-center">
            <Flag className="w-12 h-12 mb-4 text-slate-700" />
            <h3 className="text-base font-semibold text-white mb-1">No Data Available</h3>
            <p className="text-xs text-slate-500 max-w-[250px]">Results for this session are not available yet. Try selecting a past race.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            {/* Table Header */}
            <div className="grid grid-cols-[44px_minmax(120px,2fr)_minmax(80px,1fr)_minmax(60px,80px)] sm:grid-cols-[44px_44px_minmax(140px,2fr)_minmax(100px,1.2fr)_minmax(80px,1fr)_60px] md:grid-cols-[44px_44px_minmax(160px,2fr)_minmax(120px,1.2fr)_minmax(90px,1fr)_60px_minmax(80px,1fr)] items-center px-3 sm:px-4 py-2.5 border-b border-slate-800/60 text-[9px] sm:text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-slate-900/80 sticky top-0 z-10">
              <div className="text-center">Pos</div>
              <div className="text-center hidden sm:block">No</div>
              <div>Driver</div>
              <div className="hidden sm:block">Team</div>
              <div className="text-right">Time</div>
              <div className="text-right">Pts</div>
              <div className="text-right hidden md:block">Status</div>
            </div>

            {/* Rows */}
            <div className="divide-y divide-slate-800/30">
              {results.map((result) => {
                const teamColor = teamColors[result.Constructor.name] || "#666";
                const isPodium = ["1", "2", "3"].includes(result.position);
                
                return (
                  <div 
                    key={result.position}
                    className={`grid grid-cols-[44px_minmax(120px,2fr)_minmax(80px,1fr)_minmax(60px,80px)] sm:grid-cols-[44px_44px_minmax(140px,2fr)_minmax(100px,1.2fr)_minmax(80px,1fr)_60px] md:grid-cols-[44px_44px_minmax(160px,2fr)_minmax(120px,1.2fr)_minmax(90px,1fr)_60px_minmax(80px,1fr)] items-center px-3 sm:px-4 py-2 sm:py-2.5 hover:bg-slate-800/40 transition-all duration-150 group ${isPodium ? "bg-slate-800/20" : ""}`}
                  >
                    {/* Position */}
                    <div className="text-center">
                      {isPodium ? (
                        <span className="text-base">{podiumEmojis[result.position]}</span>
                      ) : (
                        <span className="font-mono text-xs sm:text-sm font-bold text-slate-300">
                          {result.position}
                        </span>
                      )}
                    </div>
                    
                    {/* Number */}
                    <div className="text-center hidden sm:block">
                      <span className="font-mono text-[10px] text-slate-500 bg-slate-800/60 rounded px-1.5 py-0.5">
                        {result.number}
                      </span>
                    </div>

                    {/* Driver */}
                    <div className="flex items-center gap-2 min-w-0">
                      <div 
                        className="w-1 h-8 rounded-full shrink-0 group-hover:h-10 transition-all duration-200" 
                        style={{ backgroundColor: teamColor }}
                      />
                      <div className="flex flex-col min-w-0">
                        <span className="font-bold text-white text-xs sm:text-sm uppercase tracking-wide truncate">
                          <span className="hidden sm:inline text-[10px] sm:text-xs font-normal text-slate-400 capitalize mr-1">{result.Driver.givenName}</span>
                          {result.Driver.familyName}
                        </span>
                        <span className="text-[9px] text-slate-500 sm:hidden truncate">{result.Constructor.name}</span>
                      </div>
                    </div>

                    {/* Team */}
                    <div className="hidden sm:flex items-center gap-1.5 min-w-0">
                      <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: teamColor }} />
                      <span className="text-[10px] sm:text-xs text-slate-400 truncate">{result.Constructor.name}</span>
                    </div>

                    {/* Time */}
                    <div className="text-right font-mono text-[10px] sm:text-xs text-slate-300 truncate">
                      {result.status === "Finished" || result.status.includes("+") 
                        ? (result.Time?.time || result.status)
                        : <span className="text-red-400 font-semibold">{result.status}</span>}
                    </div>

                    {/* Points */}
                    <div className="text-right">
                      {result.points !== "0" ? (
                        <span className="font-bold text-emerald-400 text-xs sm:text-sm">+{result.points}</span>
                      ) : (
                        <span className="text-slate-600 text-xs">-</span>
                      )}
                    </div>

                    {/* Status */}
                    <div className="text-right hidden md:block">
                      <span className={`text-[10px] font-medium ${result.status === "Finished" ? "text-emerald-500/60" : "text-red-400/60"}`}>
                        {result.status === "Finished" ? "✓" : result.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

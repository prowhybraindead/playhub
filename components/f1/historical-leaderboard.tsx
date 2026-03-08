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
import { Trophy, Timer, Flag, AlertCircle } from "lucide-react";

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
  "Mercedes": "border-l-[#27F4D2]",
  "Red Bull": "border-l-[#3671C6]",
  "Ferrari": "border-l-[#E8002D]",
  "McLaren": "border-l-[#FF8000]",
  "Aston Martin": "border-l-[#229971]",
  "Alpine F1 Team": "border-l-[#0093cc]",
  "Williams": "border-l-[#64C4FF]",
  "RB F1 Team": "border-l-[#6692FF]",
  "Kick Sauber": "border-l-[#52E252]",
  "Haas F1 Team": "border-l-[#B6BABD]",
  // Fallbacks for older names
  "AlphaTauri": "border-l-[#5E8FAA]",
  "Alfa Romeo": "border-l-[#C92D4B]",
  "Racing Point": "border-l-[#F596C8]",
  "Renault": "border-l-[#FFF500]",
};

export function HistoricalLeaderboard({ 
  onRaceSelect 
}: { 
  onRaceSelect?: (raceName: string, year: string, round: string) => void 
}) {
  const [selectedYear, setSelectedYear] = useState<string>("2024");
  const [selectedRound, setSelectedRound] = useState<string>("1");
  const [years, setYears] = useState<string[]>(Array.from({length: 10}, (_, i) => (new Date().getFullYear() - i).toString())); // Last 10 years
  
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
        
        // Auto-select latest round if switching years and round not in list
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
          setResults([]); // Race hasn't happened yet
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
    <Card className="bg-slate-900 border-slate-800 flex flex-col h-full overflow-hidden shadow-2xl">
      <CardHeader className="border-b border-slate-800 bg-slate-900/50 p-4 shrink-0">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            <CardTitle className="text-xl font-bold text-white uppercase tracking-wider">
              Historical Race Results
            </CardTitle>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Year Selector */}
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-[100px] bg-slate-800 border-slate-700 text-white focus:ring-red-500">
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700 text-white">
                {years.map(year => (
                  <SelectItem key={year} value={year}>{year}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Race/Round Selector */}
            <Select 
              value={selectedRound} 
              onValueChange={setSelectedRound}
              disabled={isLoadingRaces || races.length === 0}
            >
              <SelectTrigger className="w-[200px] sm:w-[260px] bg-slate-800 border-slate-700 text-white focus:ring-red-500 truncate">
                <SelectValue placeholder="Select Race" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700 text-white max-h-[400px]">
                {races.map((r) => (
                  <SelectItem key={r.round} value={r.round}>
                    R{r.round} - {r.raceName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Selected Race Info */}
        {currentRace && (
          <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-red-500" />
              {currentRace.Circuit.circuitName}
            </span>
            <span className="flex items-center gap-1">
              <Flag className="w-3 h-3" />
              {currentRace.Circuit.Location.locality}, {currentRace.Circuit.Location.country}
            </span>
            <span className="flex items-center gap-1">
              <Timer className="w-3 h-3" />
              {new Date(currentRace.date).toLocaleDateString('vi-VN')}
            </span>
          </div>
        )}
      </CardHeader>

      <CardContent className="p-0 flex-1 overflow-auto bg-slate-950/50">
        {error && (
          <div className="p-8 flex flex-col items-center justify-center text-center text-red-400 gap-2">
            <AlertCircle className="w-8 h-8" />
            <p>{error}</p>
          </div>
        )}

        {isLoadingResults ? (
          <div className="flex flex-col p-4 gap-2">
            {[...Array({length: 10})].map((_, i) => (
              <div key={i} className="h-14 w-full bg-slate-800/50 animate-pulse rounded-md" />
            ))}
          </div>
        ) : results.length === 0 && !isLoadingRaces ? (
          <div className="p-16 flex flex-col items-center justify-center text-center text-slate-500">
            <Flag className="w-12 h-12 mb-4 opacity-20" />
            <h3 className="text-lg font-medium text-white mb-1">Race Not Started or No Data</h3>
            <p className="text-sm">Results for this session are not available yet.</p>
          </div>
        ) : (
          <div className="min-w-[600px]">
            {/* Table Header */}
            <div className="grid grid-cols-[60px_60px_2fr_1.5fr_1fr_1fr] md:grid-cols-[60px_60px_2fr_1.5fr_1fr_1fr_1fr] items-center px-4 py-3 border-b border-slate-800 text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest bg-slate-900 sticky top-0 z-10">
              <div className="text-center">Pos</div>
              <div className="text-center">No</div>
              <div>Driver</div>
              <div className="hidden sm:block">Constructor</div>
              <div className="text-right">Time / Gap</div>
              <div className="text-right">Pts</div>
              <div className="text-right hidden md:block">Status</div>
            </div>

            {/* List */}
            <div className="flex flex-col py-2">
              {results.map((result) => (
                <div 
                  key={result.position}
                  className="grid grid-cols-[60px_60px_2fr_1.5fr_1fr_1fr] md:grid-cols-[60px_60px_2fr_1.5fr_1fr_1fr_1fr] items-center px-4 py-2 hover:bg-slate-800/80 transition-colors border-b border-white/5 last:border-0 group"
                >
                  <div className="text-center font-mono text-sm font-bold text-white">
                    {result.position}
                  </div>
                  
                  <div className="text-center">
                    <Badge variant="outline" className="font-mono bg-slate-800/50 text-slate-300 border-slate-700">
                      {result.number}
                    </Badge>
                  </div>

                  <div className={`flex items-center gap-2 border-l-4 pl-3 py-1 ${teamColors[result.Constructor.name] || "border-l-slate-600"}`}>
                    <div className="flex flex-col">
                      <span className="font-bold text-white uppercase tracking-wide text-sm flex gap-1 items-baseline">
                        <span className="hidden sm:inline text-xs font-normal text-slate-400 capitalize">{result.Driver.givenName}</span>
                        {result.Driver.familyName}
                      </span>
                      <span className="text-[10px] text-slate-500 sm:hidden">{result.Constructor.name}</span>
                    </div>
                  </div>

                  <div className="hidden sm:block text-xs font-medium text-slate-400">
                    {result.Constructor.name}
                  </div>

                  <div className="text-right font-mono text-xs text-slate-300">
                    {result.status === "Finished" || result.status.includes("+") 
                      ? (result.Time?.time || result.status)
                      : <span className="text-red-400">{result.status}</span>}
                  </div>

                  <div className="text-right font-bold text-emerald-400 text-sm">
                    {result.points !== "0" ? `+${result.points}` : "-"}
                  </div>

                  <div className="text-right hidden md:block text-xs font-medium text-slate-500">
                    {result.status === "Finished" ? "Classified" : result.status}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

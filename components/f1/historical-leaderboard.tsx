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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Trophy, Timer, Flag, AlertCircle, Loader2, Users, Rocket } from "lucide-react";

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
    nationality: string;
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
}

interface DriverStanding {
  position: string;
  points: string;
  wins: string;
  Driver: {
    givenName: string;
    familyName: string;
    nationality: string;
  };
  Constructors: { name: string }[];
}

interface ConstructorStanding {
  position: string;
  points: string;
  wins: string;
  Constructor: {
    name: string;
    nationality: string;
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
  "Racing Bulls": "#6692FF",
  "Kick Sauber": "#52E252",
  "Haas F1 Team": "#B6BABD",
  "AlphaTauri": "#5E8FAA",
  "Alfa Romeo": "#C92D4B",
  "Racing Point": "#F596C8",
  "Renault": "#FFF500",
  "Cadillac F1 Team": "#D4AF37", // Gold/Black for Cadillac
};

const teamLogoUrls: Record<string, string> = {
  "Mercedes": "https://www.google.com/s2/favicons?domain=mercedesamgf1.com&sz=128",
  "Red Bull": "https://www.google.com/s2/favicons?domain=redbullracing.com&sz=128",
  "Ferrari": "https://www.google.com/s2/favicons?domain=ferrari.com&sz=128",
  "McLaren": "https://www.google.com/s2/favicons?domain=mclaren.com&sz=128",
  "Aston Martin": "https://www.google.com/s2/favicons?domain=astonmartinf1.com&sz=128",
  "Alpine F1 Team": "https://www.google.com/s2/favicons?domain=alpinecars.com&sz=128",
  "Williams": "https://www.google.com/s2/favicons?domain=williamsf1.com&sz=128",
  "Racing Bulls": "https://www.google.com/s2/favicons?domain=visacashapprb.com&sz=128",
  "Kick Sauber": "https://www.google.com/s2/favicons?domain=sauber-group.com&sz=128",
  "Haas F1 Team": "https://www.google.com/s2/favicons?domain=haasf1team.com&sz=128",
  "AlphaTauri": "https://www.google.com/s2/favicons?domain=scuderiaalphatauri.com&sz=128",
  "Alfa Romeo": "https://www.google.com/s2/favicons?domain=sauber-group.com&sz=128",
  "Racing Point": "https://www.google.com/s2/favicons?domain=astonmartinf1.com&sz=128",
  "Renault": "https://www.google.com/s2/favicons?domain=renaultgroup.com&sz=128",
  "Cadillac F1 Team": "https://www.google.com/s2/favicons?domain=cadillac.com&sz=128",
};

const podiumEmojis: Record<string, string> = { "1": "🥇", "2": "🥈", "3": "🥉" };

export function HistoricalLeaderboard({ 
  onRaceSelect 
}: { 
  onRaceSelect?: (raceName: string, year: string, round: string) => void 
}) {
  const [selectedYear, setSelectedYear] = useState<string>("2024");
  const [selectedRound, setSelectedRound] = useState<string>("1");
  const [activeTab, setActiveTab] = useState<string>("results");

  const years = Array.from({length: 10}, (_, i) => (new Date().getFullYear() - i).toString());
  
  const [races, setRaces] = useState<Race[]>([]);
  const [results, setResults] = useState<RaceResult[]>([]);
  const [driverStandings, setDriverStandings] = useState<DriverStanding[]>([]);
  const [constructorStandings, setConstructorStandings] = useState<ConstructorStanding[]>([]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch races calendar
  useEffect(() => {
    async function fetchCalendar() {
      try {
        const res = await fetch(`https://api.jolpi.ca/ergast/f1/${selectedYear}.json`);
        if (!res.ok) throw new Error("Failed to fetch calendar");
        const data = await res.json();
        const raceList = data.MRData.RaceTable.Races || [];
        setRaces(raceList);
        
        if (raceList.length > 0) {
           const roundExists = raceList.some((r: Race) => r.round === selectedRound);
           if (!roundExists) setSelectedRound(raceList[0].round);
        } else {
           setResults([]);
        }
      } catch (err: any) {
        console.error(err);
      }
    }
    fetchCalendar();
  }, [selectedYear]);

  // Fetch data based on active tab
  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      setError(null);
      try {
        if (activeTab === "results" && selectedRound) {
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
        } 
        else if (activeTab === "drivers") {
          const res = await fetch(`https://api.jolpi.ca/ergast/f1/${selectedYear}/driverStandings.json`);
          if (!res.ok) throw new Error("Failed to fetch driver standings");
          const data = await res.json();
          setDriverStandings(data.MRData.StandingsTable.StandingsLists[0]?.DriverStandings || []);
        } 
        else if (activeTab === "constructors") {
          const res = await fetch(`https://api.jolpi.ca/ergast/f1/${selectedYear}/constructorStandings.json`);
          if (!res.ok) throw new Error("Failed to fetch constructor standings");
          const data = await res.json();
          setConstructorStandings(data.MRData.StandingsTable.StandingsLists[0]?.ConstructorStandings || []);
        }
      } catch (err: any) {
        setError("Error loading championship data.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    if (races.length > 0) {
      fetchData();
    }
  }, [selectedYear, selectedRound, activeTab, races]);

  const currentRace = races.find(r => r.round === selectedRound);

  return (
    <Card className="bg-slate-900/80 border-slate-800/50 backdrop-blur-sm flex flex-col h-full overflow-hidden shadow-2xl rounded-2xl">
      <CardHeader className="border-b border-slate-800/50 bg-gradient-to-r from-slate-900/90 to-slate-800/50 p-3 sm:p-4 shrink-0 space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-yellow-500 to-amber-600 shadow-md">
              <Trophy className="w-4 h-4 text-white" />
            </div>
            <CardTitle className="text-sm sm:text-base font-bold text-white uppercase tracking-wider">
              {activeTab === "results" ? "Race Results" : activeTab === "drivers" ? "Driver Standings" : "Team Standings"}
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

            {/* Race Selector (Only visible on Results tab) */}
            {activeTab === "results" && (
              <Select 
                value={selectedRound} 
                onValueChange={setSelectedRound}
                disabled={races.length === 0}
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
            )}
          </div>
        </div>

        {/* Tabs and Info Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
            <TabsList className="bg-slate-800/60 border border-slate-700/50 p-1 h-9 flex w-full sm:w-auto">
              <TabsTrigger value="results" className="text-[10px] sm:text-xs data-[state=active]:bg-red-600 data-[state=active]:text-white flex-1 sm:flex-none">
                <Flag className="w-3 h-3 mr-1.5" /> Results
              </TabsTrigger>
              <TabsTrigger value="drivers" className="text-[10px] sm:text-xs data-[state=active]:bg-red-600 data-[state=active]:text-white flex-1 sm:flex-none">
                <Users className="w-3 h-3 mr-1.5" /> Drivers
              </TabsTrigger>
              <TabsTrigger value="constructors" className="text-[10px] sm:text-xs data-[state=active]:bg-red-600 data-[state=active]:text-white flex-1 sm:flex-none">
                <Rocket className="w-3 h-3 mr-1.5" /> Teams
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {activeTab === "results" && currentRace && (
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] sm:text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                {currentRace.Circuit.circuitName}
              </span>
              <span className="flex items-center gap-1">
                <Timer className="w-3 h-3" />
                {new Date(currentRace.date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
              </span>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-0 flex-1 overflow-auto bg-slate-950/30">
        {error ? (
          <div className="p-8 flex flex-col items-center justify-center text-center text-red-400 gap-3">
            <AlertCircle className="w-10 h-10 opacity-60" />
            <p className="text-sm">{error}</p>
          </div>
        ) : isLoading ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 py-16">
            <Loader2 className="w-8 h-8 animate-spin text-red-500/60" />
            <p className="text-xs text-slate-500">Loading data...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            
            {/* 1. RACE RESULTS TAB */}
            {activeTab === "results" && (
              <>
                {results.length === 0 ? (
                  <div className="p-12 sm:p-16 flex flex-col items-center justify-center text-center">
                    <Flag className="w-12 h-12 mb-4 text-slate-700" />
                    <h3 className="text-base font-semibold text-white mb-1">No Data Available</h3>
                    <p className="text-xs text-slate-500 max-w-[250px]">Results for this session are not available yet.</p>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-[44px_minmax(120px,2fr)_minmax(80px,1fr)_minmax(60px,80px)] sm:grid-cols-[44px_44px_minmax(140px,2fr)_minmax(100px,1.2fr)_minmax(80px,1fr)_60px] md:grid-cols-[44px_44px_minmax(160px,2fr)_minmax(120px,1.2fr)_minmax(90px,1fr)_60px_minmax(80px,1fr)] items-center px-3 sm:px-4 py-2.5 border-b border-slate-800/60 text-[9px] sm:text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-slate-900/80 sticky top-0 z-10">
                      <div className="text-center">Pos</div>
                      <div className="text-center hidden sm:block">No</div>
                      <div>Driver</div>
                      <div className="hidden sm:block">Team</div>
                      <div className="text-right">Time</div>
                      <div className="text-right">Pts</div>
                      <div className="text-right hidden md:block">Status</div>
                    </div>
                    <div className="divide-y divide-slate-800/30">
                      {results.map((result) => {
                        const teamName = result.Constructor.name;
                        const teamColor = teamColors[teamName] || "#666";
                        const teamLogo = teamLogoUrls[teamName];
                        const isPodium = ["1", "2", "3"].includes(result.position);
                        return (
                          <div key={result.position} className={`grid grid-cols-[44px_minmax(120px,2fr)_minmax(80px,1fr)_minmax(60px,80px)] sm:grid-cols-[44px_44px_minmax(140px,2fr)_minmax(100px,1.2fr)_minmax(80px,1fr)_60px] md:grid-cols-[44px_44px_minmax(160px,2fr)_minmax(120px,1.2fr)_minmax(90px,1fr)_60px_minmax(80px,1fr)] items-center px-3 sm:px-4 py-2 sm:py-2.5 hover:bg-slate-800/40 transition-all duration-150 group ${isPodium ? "bg-slate-800/20" : ""}`}>
                            <div className="text-center">{isPodium ? <span className="text-base">{podiumEmojis[result.position]}</span> : <span className="font-mono text-xs sm:text-sm font-bold text-slate-300">{result.position}</span>}</div>
                            <div className="text-center hidden sm:block"><span className="font-mono text-[10px] text-slate-500 bg-slate-800/60 rounded px-1.5 py-0.5">{result.number}</span></div>
                            <div className="flex items-center gap-2 min-w-0">
                              <div className="w-1 h-8 rounded-full shrink-0 group-hover:h-10 transition-all duration-200" style={{ backgroundColor: teamColor }} />
                              <div className="flex flex-col min-w-0">
                                <span className="font-bold text-white text-xs sm:text-sm uppercase tracking-wide truncate">
                                  <span className="hidden sm:inline text-[10px] sm:text-xs font-normal text-slate-400 capitalize mr-1">{result.Driver.givenName}</span>
                                  {result.Driver.familyName}
                                </span>
                                <span className="text-[9px] text-slate-500 sm:hidden truncate">{teamName}</span>
                              </div>
                            </div>
                            <div className="hidden sm:flex items-center gap-1.5 min-w-0">
                              {teamLogo ? (
                                <img src={teamLogo} alt={teamName} className="w-4 h-4 object-contain rounded-sm" />
                              ) : (
                                <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: teamColor }} />
                              )}
                              <span className="text-[10px] sm:text-xs text-slate-400 truncate">{teamName}</span>
                            </div>
                            <div className="text-right font-mono text-[10px] sm:text-xs text-slate-300 truncate">
                              {result.status === "Finished" || result.status.includes("+") ? (result.Time?.time || result.status) : <span className="text-red-400 font-semibold">{result.status}</span>}
                            </div>
                            <div className="text-right">
                              {result.points !== "0" ? <span className="font-bold text-emerald-400 text-xs sm:text-sm">+{result.points}</span> : <span className="text-slate-600 text-xs">-</span>}
                            </div>
                            <div className="text-right hidden md:block">
                              <span className={`text-[10px] font-medium ${result.status === "Finished" ? "text-emerald-500/60" : "text-red-400/60"}`}>
                                {result.status === "Finished" ? "✓" : result.status}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </>
            )}

            {/* 2. DRIVER STANDINGS TAB */}
            {activeTab === "drivers" && (
              <>
                {driverStandings.length === 0 ? (
                  <div className="p-12 sm:p-16 flex flex-col items-center justify-center text-center"><Users className="w-12 h-12 mb-4 text-slate-700" /><h3 className="text-base font-semibold text-white mb-1">No Data Available</h3></div>
                ) : (
                  <>
                    <div className="grid grid-cols-[44px_minmax(120px,2fr)_minmax(100px,1.2fr)_minmax(60px,80px)_minmax(60px,80px)] items-center px-4 py-2.5 border-b border-slate-800/60 text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-slate-900/80 sticky top-0 z-10">
                      <div className="text-center">Pos</div>
                      <div>Driver</div>
                      <div>Team</div>
                      <div className="text-right">Wins</div>
                      <div className="text-right">Pts</div>
                    </div>
                    <div className="divide-y divide-slate-800/30">
                      {driverStandings.map((std) => {
                        const teamName = std.Constructors[0]?.name || "Unknown";
                        const teamColor = teamColors[teamName] || "#666";
                        const teamLogo = teamLogoUrls[teamName];
                        const isTop3 = ["1", "2", "3"].includes(std.position);
                        return (
                          <div key={std.position} className={`grid grid-cols-[44px_minmax(120px,2fr)_minmax(100px,1.2fr)_minmax(60px,80px)_minmax(60px,80px)] items-center px-4 py-2.5 hover:bg-slate-800/40 transition-all duration-150 group ${isTop3 ? "bg-slate-800/20" : ""}`}>
                            <div className="text-center">{isTop3 ? <span className="text-base">{podiumEmojis[std.position]}</span> : <span className="font-mono text-sm font-bold text-slate-300">{std.position}</span>}</div>
                            <div className="flex items-center gap-2 min-w-0">
                              <div className="w-1 h-8 rounded-full shrink-0 group-hover:h-10 transition-all duration-200" style={{ backgroundColor: teamColor }} />
                              <div className="flex flex-col min-w-0">
                                <span className="font-bold text-white text-xs sm:text-sm uppercase tracking-wide truncate">
                                  <span className="hidden sm:inline text-xs font-normal text-slate-400 capitalize mr-1">{std.Driver.givenName}</span>{std.Driver.familyName}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5 min-w-0">
                              {teamLogo && <img src={teamLogo} alt={teamName} className="w-4 h-4 object-contain rounded-sm hidden sm:block" />}
                              <span className="text-[9px] sm:text-xs text-slate-400 truncate">{teamName}</span>
                            </div>
                            <div className="text-right font-mono text-xs text-slate-300">{std.wins}</div>
                            <div className="text-right font-bold text-emerald-400 text-sm">{std.points}</div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </>
            )}

            {/* 3. CONSTRUCTOR STANDINGS TAB */}
            {activeTab === "constructors" && (
              <>
                {constructorStandings.length === 0 ? (
                   <div className="p-12 sm:p-16 flex flex-col items-center justify-center text-center"><Rocket className="w-12 h-12 mb-4 text-slate-700" /><h3 className="text-base font-semibold text-white mb-1">No Data Available</h3></div>
                ) : (
                  <>
                    <div className="grid grid-cols-[44px_minmax(150px,2fr)_minmax(60px,80px)_minmax(60px,80px)] items-center px-4 py-2.5 border-b border-slate-800/60 text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-slate-900/80 sticky top-0 z-10">
                      <div className="text-center">Pos</div>
                      <div>Constructor</div>
                      <div className="text-right">Wins</div>
                      <div className="text-right">Pts</div>
                    </div>
                    <div className="divide-y divide-slate-800/30">
                      {constructorStandings.map((std) => {
                        const teamName = std.Constructor.name;
                        const teamColor = teamColors[teamName] || "#666";
                        const teamLogo = teamLogoUrls[teamName];
                        return (
                          <div key={std.position} className="grid grid-cols-[44px_minmax(150px,2fr)_minmax(60px,80px)_minmax(60px,80px)] items-center px-4 py-2.5 hover:bg-slate-800/40 transition-all duration-150 group">
                            <div className="text-center"><span className="font-mono text-sm font-bold text-slate-300">{std.position}</span></div>
                            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                              <div className="w-1.5 h-8 rounded-full shrink-0 group-hover:h-10 transition-all duration-200" style={{ backgroundColor: teamColor }} />
                              {teamLogo && <img src={teamLogo} alt={teamName} className="w-5 h-5 sm:w-6 sm:h-6 object-contain rounded-sm bg-white/10 p-0.5" />}
                              <span className="font-bold text-white text-xs sm:text-sm uppercase tracking-wide truncate">{teamName}</span>
                            </div>
                            <div className="text-right font-mono text-xs text-slate-300">{std.wins}</div>
                            <div className="text-right font-bold text-emerald-400 text-sm">{std.points}</div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </>
            )}

          </div>
        )}
      </CardContent>
    </Card>
  );
}

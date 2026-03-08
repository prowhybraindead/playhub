"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, AlertCircle, ExternalLink, Calendar, Users, MapPin } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Driver {
  driverId: string;
  permanentNumber?: string;
  code: string;
  url: string;
  givenName: string;
  familyName: string;
  dateOfBirth: string;
  nationality: string;
}

export function F1Drivers() {
  const [selectedYear, setSelectedYear] = useState<string>("2023");
  const years = Array.from({length: 75}, (_, i) => (new Date().getFullYear() - 1 - i).toString()); // up to last complete year for drivers
  
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDrivers() {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(`https://api.jolpi.ca/ergast/f1/${selectedYear}/drivers.json`);
        if (!res.ok) throw new Error("Failed to fetch drivers");
        const data = await res.json();
        setDrivers(data.MRData.DriverTable.Drivers || []);
      } catch (err: any) {
        setError("Error loading drivers data.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchDrivers();
  }, [selectedYear]);

  // Nationality to flag emoji helper (basic)
  const getFlagEmoji = (nationality: string) => {
    const map: Record<string, string> = {
      "British": "🇬🇧", "Dutch": "🇳🇱", "Mexican": "🇲🇽", "Spanish": "🇪🇸", 
      "Monegasque": "🇲🇨", "French": "🇫🇷", "German": "🇩🇪", "Australian": "🇦🇺",
      "Japanese": "🇯🇵", "Canadian": "🇨🇦", "Finnish": "🇫🇮", "Danish": "🇩🇰",
      "Chinese": "🇨🇳", "American": "🇺🇸", "Thai": "🇹🇭", "Italian": "🇮🇹",
      "Brazilian": "🇧🇷", "Russian": "🇷🇺", "Polish": "🇵🇱", "Argentine": "🇦🇷",
      "New Zealander": "🇳🇿", "Belgian": "🇧🇪", "Austrian": "🇦🇹", "Swiss": "🇨🇭",
      "Swedish": "🇸🇪", "Colombian": "🇨🇴"
    };
    return map[nationality] || "🏁";
  };

  return (
    <div className="flex flex-col h-full space-y-4">
      <Card className="bg-slate-900/80 border-slate-800/50 backdrop-blur-sm shadow-xl rounded-2xl shrink-0">
        <CardHeader className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/20">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold text-white tracking-wide">
                Drivers Grid
              </CardTitle>
              <p className="text-xs text-slate-400 mt-0.5">Historical roster of all participants</p>
            </div>
          </div>
           
           <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-[120px] bg-slate-800/80 border-slate-700/50 text-white font-medium h-10 rounded-xl focus:ring-blue-500/50">
              <Calendar className="w-4 h-4 mr-2 opacity-70" />
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700 text-white max-h-[300px]">
              {years.map(year => (
                <SelectItem key={year} value={year}>{year} Season</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardHeader>
      </Card>

      <div className="flex-1 min-h-[400px]">
        {error ? (
          <div className="p-8 flex flex-col items-center justify-center h-full text-center text-red-400 gap-3">
            <AlertCircle className="w-12 h-12 opacity-60" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        ) : isLoading ? (
          <div className="flex flex-col items-center justify-center h-full gap-4 py-20">
            <Loader2 className="w-10 h-10 animate-spin text-blue-500/60" />
            <p className="text-sm text-slate-400 animate-pulse">Loading {selectedYear} drivers roster...</p>
          </div>
        ) : drivers.length === 0 ? (
          <div className="p-12 flex flex-col items-center justify-center h-full text-center">
            <Users className="w-16 h-16 mb-4 text-slate-700" />
            <h3 className="text-lg font-semibold text-white mb-2">No Drivers Found</h3>
            <p className="text-sm text-slate-500 max-w-[300px]">No driver data is available for the {selectedYear} season.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-8">
            <AnimatePresence mode="popLayout">
              {drivers.map((driver, idx) => (
                <motion.div
                  key={driver.driverId}
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ delay: idx * 0.03, duration: 0.3, type: "spring" }}
                >
                  <Card className="bg-slate-900/60 border-slate-800/60 hover:bg-slate-800/60 hover:border-blue-500/30 transition-all duration-300 overflow-hidden group h-full flex flex-col items-start p-5 relative">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                      <span className="text-6xl font-black italic tracking-tighter text-white">
                        {driver.permanentNumber || driver.code || "F1"}
                      </span>
                    </div>

                    <div className="flex items-start justify-between w-full mb-4 z-10">
                      <div className="flex flex-col">
                        <span className="text-xs font-medium text-blue-400 uppercase tracking-wider mb-1">
                          {driver.code || "N/A"}
                        </span>
                        <h3 className="text-xl font-bold text-white leading-tight">
                          <span className="font-light text-slate-300 mr-1.5">{driver.givenName}</span>
                          <br className="hidden sm:block" />
                          <span className="uppercase">{driver.familyName}</span>
                        </h3>
                      </div>
                      <span className="text-2xl drop-shadow-md" title={driver.nationality}>
                        {getFlagEmoji(driver.nationality)}
                      </span>
                    </div>

                    <div className="mt-auto pt-4 space-y-2.5 w-full z-10 border-t border-slate-800/50">
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <MapPin className="w-3.5 h-3.5 opacity-70" />
                        <span>{driver.nationality}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <Calendar className="w-3.5 h-3.5 opacity-70" />
                        <span>DOB: {new Date(driver.dateOfBirth).toLocaleDateString()}</span>
                      </div>
                      <div className="pt-2">
                        <a 
                          href={driver.url} 
                          target="_blank" 
                          rel="noreferrer"
                          className="inline-flex items-center justify-center w-full gap-2 text-xs font-semibold text-white bg-slate-800 hover:bg-blue-600 px-3 py-2 rounded-lg transition-colors"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          View Profile
                        </a>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}

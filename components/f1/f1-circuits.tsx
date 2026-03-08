"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, AlertCircle, ExternalLink, Calendar, MapPin, Navigation } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Circuit {
  circuitId: string;
  url: string;
  circuitName: string;
  Location: {
    lat: string;
    long: string;
    locality: string;
    country: string;
  };
  imageUrl?: string;
}

export function F1Circuits() {
  const [selectedYear, setSelectedYear] = useState<string>("2023");
  const years = Array.from({length: 75}, (_, i) => (new Date().getFullYear() - 1 - i).toString());
  
  const [circuits, setCircuits] = useState<Circuit[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCircuits() {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(`https://api.jolpi.ca/ergast/f1/${selectedYear}/circuits.json`);
        if (!res.ok) throw new Error("Failed to fetch circuits");
        const data = await res.json();
        let rawCircuits = data.MRData.CircuitTable.Circuits || [];

        // Fetch Wikipedia Images
        const enhancedCircuits = await Promise.all(
          rawCircuits.map(async (circuit: Circuit) => {
             try {
               const titleMatch = circuit.url.match(/wiki\/(.+)$/);
               if (titleMatch && titleMatch[1]) {
                 const wikiRes = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${titleMatch[1]}`);
                 const wikiData = await wikiRes.json();
                 if (wikiData.thumbnail?.source) {
                    return { ...circuit, imageUrl: wikiData.thumbnail.source };
                 }
               }
             } catch (e) {
               console.error("Failed to fetch image for", circuit.circuitName);
             }
             return circuit;
          })
        );
        
        setCircuits(enhancedCircuits);
      } catch (err: any) {
        setError("Error loading circuits data.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchCircuits();
  }, [selectedYear]);

  // Nationality to flag emoji helper for circuits
  const getFlagEmoji = (country: string) => {
    const map: Record<string, string> = {
      "UK": "🇬🇧", "Netherlands": "🇳🇱", "Mexico": "🇲🇽", "Spain": "🇪🇸", 
      "Monaco": "🇲🇨", "France": "🇫🇷", "Germany": "🇩🇪", "Australia": "🇦🇺",
      "Japan": "🇯🇵", "Canada": "🇨🇦", "Finland": "🇫🇮", "China": "🇨🇳", 
      "USA": "🇺🇸", "United States": "🇺🇸", "Saudi Arabia": "🇸🇦", "Bahrain": "🇧🇭",
      "Italy": "🇮🇹", "Brazil": "🇧🇷", "Russia": "🇷🇺", "Austria": "🇦🇹",
      "Belgium": "🇧🇪", "Singapore": "🇸🇬", "Azerbaijan": "🇦🇿", "UAE": "🇦🇪",
      "Qatar": "🇶🇦", "Hungary": "🇭🇺", "Portugal": "🇵🇹", "Turkey": "🇹🇷",
      "Malaysia": "🇲🇾", "South Korea": "🇰🇷", "India": "🇮🇳", "Argentina": "🇦🇷"
    };
    return map[country] || "🏁";
  };

  return (
    <div className="flex flex-col h-full space-y-4">
      <Card className="bg-slate-900/80 border-slate-800/50 backdrop-blur-sm shadow-xl rounded-2xl shrink-0">
        <CardHeader className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/20">
              <MapPin className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold text-white tracking-wide">
                Circuits Explorer
              </CardTitle>
              <p className="text-xs text-slate-400 mt-0.5">Historical race tracks and destinations</p>
            </div>
          </div>
           
           <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-[120px] bg-slate-800/80 border-slate-700/50 text-white font-medium h-10 rounded-xl focus:ring-emerald-500/50">
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
            <Loader2 className="w-10 h-10 animate-spin text-emerald-500/60" />
            <p className="text-sm text-slate-400 animate-pulse">Loading {selectedYear} circuits data...</p>
          </div>
        ) : circuits.length === 0 ? (
          <div className="p-12 flex flex-col items-center justify-center h-full text-center">
            <MapPin className="w-16 h-16 mb-4 text-slate-700" />
            <h3 className="text-lg font-semibold text-white mb-2">No Circuits Found</h3>
            <p className="text-sm text-slate-500 max-w-[300px]">No circuit data is available for the {selectedYear} season.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-8">
            <AnimatePresence mode="popLayout">
              {circuits.map((circuit, idx) => (
                <motion.div
                  key={circuit.circuitId}
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ delay: idx * 0.03, duration: 0.3, type: "spring" }}
                >
                  <Card className="bg-slate-900/60 border-slate-800/60 hover:bg-slate-800/60 hover:border-emerald-500/30 transition-all duration-300 overflow-hidden group h-full flex flex-col p-5 relative">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                      <Navigation className="w-16 h-16 text-white" />
                    </div>

                    <div className="flex items-start justify-between w-full mb-4 z-10 gap-2">
                      <div className="flex items-center gap-3">
                        {circuit.imageUrl ? (
                          <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 border-2 border-slate-700/50 bg-slate-800">
                             {/* eslint-disable-next-line @next/next/no-img-element */}
                             <img src={circuit.imageUrl} alt={circuit.circuitName} className="w-full h-full object-cover" />
                          </div>
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-slate-800 shrink-0 border-2 border-slate-700/50 flex items-center justify-center">
                             <MapPin className="w-4 h-4 text-slate-500" />
                          </div>
                        )}
                        <div className="flex flex-col pr-2">
                          <span className="text-[10px] font-medium text-emerald-400 uppercase tracking-wider mb-1 line-clamp-1">
                            {circuit.Location.country}
                          </span>
                          <h3 className="text-base sm:text-sm font-bold text-white leading-tight line-clamp-2">
                            {circuit.circuitName}
                          </h3>
                        </div>
                      </div>
                      <span className="text-2xl drop-shadow-md shrink-0" title={circuit.Location.country}>
                        {getFlagEmoji(circuit.Location.country)}
                      </span>
                    </div>

                    <div className="mt-auto pt-4 space-y-2.5 w-full z-10 border-t border-slate-800/50">
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <MapPin className="w-3.5 h-3.5 opacity-70 shrink-0" />
                        <span className="truncate">{circuit.Location.locality}, {circuit.Location.country}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] sm:text-xs text-slate-500 font-mono">
                        <span>Lat {parseFloat(circuit.Location.lat).toFixed(4)}</span>
                        <span>•</span>
                        <span>Lng {parseFloat(circuit.Location.long).toFixed(4)}</span>
                      </div>
                      <div className="pt-2">
                        <a 
                          href={circuit.url} 
                          target="_blank" 
                          rel="noreferrer"
                          className="inline-flex items-center justify-center w-full gap-2 text-xs font-semibold text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 px-3 py-2.5 rounded-lg transition-colors border border-emerald-500/20"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          Circuit Info
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

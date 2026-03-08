"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface RaceMessage {
  id: string;
  time: string;
  category: "RC" | "STEWARD" | "FLAG" | "PIT" | "RADIO" | "GENERAL";
  message: string;
}

const CATEGORY_STYLES: Record<RaceMessage["category"], { bg: string; text: string; label: string }> = {
  RC: { bg: "bg-blue-500/20 border-blue-500/40", text: "text-blue-300", label: "Race Control" },
  STEWARD: { bg: "bg-orange-500/20 border-orange-500/40", text: "text-orange-300", label: "Stewards" },
  FLAG: { bg: "bg-yellow-500/20 border-yellow-500/40", text: "text-yellow-300", label: "Flag" },
  PIT: { bg: "bg-cyan-500/20 border-cyan-500/40", text: "text-cyan-300", label: "Pit" },
  RADIO: { bg: "bg-purple-500/20 border-purple-500/40", text: "text-purple-300", label: "Radio" },
  GENERAL: { bg: "bg-slate-500/20 border-slate-500/40", text: "text-slate-300", label: "Info" },
};

// Simulated messages based on Australia GP 2026 data from user's screenshot
const INITIAL_MESSAGES: RaceMessage[] = [
  { id: "1", time: "14:05", category: "FLAG", message: "🟢 GREEN FLAG - Race Start" },
  { id: "2", time: "14:08", category: "RC", message: "DRS ENABLED - Detection Zone Active" },
  { id: "3", time: "14:15", category: "PIT", message: "VER Box Box - Pit Stop (Soft → Medium)" },
  { id: "4", time: "14:22", category: "RADIO", message: "HAM: \"The car feels good, pace is strong\"" },
  { id: "5", time: "14:30", category: "RC", message: "VIRTUAL SAFETY CAR DEPLOYED" },
  { id: "6", time: "14:32", category: "PIT", message: "Multiple cars pitting under VSC" },
  { id: "7", time: "14:34", category: "RC", message: "VSC ENDING - Green in 10 seconds" },
  { id: "8", time: "14:40", category: "STEWARD", message: "Incident involving ALO - Under Investigation" },
  { id: "9", time: "14:45", category: "FLAG", message: "🟡 YELLOW FLAG - Sector 2 (PIA stopped on track)" },
  { id: "10", time: "14:46", category: "RC", message: "PIA has retired from the race - Mechanical failure" },
  { id: "11", time: "14:48", category: "FLAG", message: "🟢 GREEN FLAG - All sectors clear" },
  { id: "12", time: "14:52", category: "RADIO", message: "RUS: \"Incredible pace, keep pushing\"" },
  { id: "13", time: "14:55", category: "STEWARD", message: "HUL - 5 Second Time Penalty (Causing a collision)" },
  { id: "14", time: "14:58", category: "RC", message: "HUL has retired from the race" },
  { id: "15", time: "15:00", category: "PIT", message: "VER Box Box - Pit Stop 14 (Strategy gamble)" },
  { id: "16", time: "15:05", category: "RADIO", message: "VER: \"We need more pace, this isn't enough\"" },
  { id: "17", time: "15:10", category: "RC", message: "FASTEST LAP - VER 1:21.510 (Lap 48)" },
  { id: "18", time: "15:15", category: "FLAG", message: "🏁 CHEQUERED FLAG - RUS WINS THE AUSTRALIAN GRAND PRIX!" },
  { id: "19", time: "15:16", category: "RADIO", message: "RUS: \"YES! COME ON! What a race! Thank you team!\"" },
  { id: "20", time: "15:17", category: "RC", message: "Classification: P1 RUS, P2 ANT, P3 LEC" },
];

export function RaceCommentary() {
  const [messages, setMessages] = useState<RaceMessage[]>(INITIAL_MESSAGES);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <Card className="bg-slate-900/70 border-slate-700/50 backdrop-blur-sm h-full flex flex-col">
      <CardHeader className="pb-2 pt-3 px-4">
        <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
          📻 Race Commentary & Radio
          <span className="text-[10px] font-normal text-slate-500 ml-auto">{messages.length} messages</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="px-2 pb-2 flex-1 overflow-hidden">
        <div className="overflow-y-auto h-full space-y-1.5 pr-1 scrollbar-thin">
          {messages.map((msg) => {
            const style = CATEGORY_STYLES[msg.category];
            return (
              <div
                key={msg.id}
                className={`rounded border px-2.5 py-1.5 ${style.bg} transition-all hover:brightness-110`}
              >
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[9px] font-mono text-slate-500">{msg.time}</span>
                  <span className={`text-[9px] font-bold uppercase tracking-wider ${style.text}`}>
                    {style.label}
                  </span>
                </div>
                <p className="text-[11px] text-slate-200 leading-tight">{msg.message}</p>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>
      </CardContent>
    </Card>
  );
}

"use client";

import { useEffect, useState } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, ReferenceLine } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Activity, Gauge, Zap, AlertCircle } from "lucide-react";
import { useTranslation } from "@/components/providers/i18n-provider";
import { Button } from "@/components/ui/button";

type TelemetryData = {
  date: string;
  driver_number: number;
  rpm: number;
  speed: number;
  n_gear: number;
  throttle: number;
  brake: number;
  drs: number;
  timeLabel: string;
};

export function TelemetryDashboard() {
  const { t } = useTranslation();
  const [data, setData] = useState<TelemetryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [driver, setDriver] = useState<number>(1); // Default Max Verstappen
  const [error, setError] = useState<string | null>(null);

  // Poll OpenF1 API for live car telemetry data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        // Using session_key=latest to get the most recent active session data
        // Using our Next.js API proxy to bypass CORS
        const res = await fetch(`/api/openf1?driver_number=${driver}&session_key=latest`);
        if (!res.ok) throw new Error("Failed to fetch telemetry from proxy");
        
        const rawData = await res.json();
        
        // Take the latest 60 data points (assuming ~3hz sampling, this is about 20 seconds of data)
        const recentData = rawData.slice(-60).map((item: any, index: number) => {
          const d = new Date(item.date);
          return {
            ...item,
            timeLabel: `${d.getMinutes()}:${d.getSeconds().toString().padStart(2, '0')}.${d.getMilliseconds().toString().substring(0,2)}`
          };
        });
        
        setData(recentData);
      } catch (err: any) {
        console.error("Telemetry Error:", err);
        setError(t("Cannot connect to OpenF1 servers securely right now.") as string);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    // Refresh every 5 seconds since OpenF1 rate isn't perfectly live streaming WebSockets
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [driver, t]);

  const latestStats = data.length > 0 ? data[data.length - 1] : null;

  return (
    <Card className="flex flex-col border-slate-800 bg-slate-950 shadow-2xl h-full">
      <CardHeader className="border-b border-slate-800 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl text-slate-100 flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-500" />
              {t("Real-Time Telemetry")}
            </CardTitle>
            <CardDescription className="text-slate-400 font-mono mt-1 text-xs">openf1.org / car_data</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {[1, 4, 16, 44].map((num) => (
              <Button
                key={num}
                size="sm"
                variant={driver === num ? "default" : "outline"}
                className={`w-10 h-10 rounded-full font-black ${driver === num ? 'bg-red-600 text-white border-red-600 hover:bg-red-700' : 'bg-slate-900 text-slate-400 border-slate-700 hover:text-white'}`}
                onClick={() => setDriver(num)}
              >
                {num}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex flex-grow flex-col p-6 gap-6">
        {/* KPI Mini Dashboards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatBox icon={<Gauge className="text-blue-400 h-5 w-5" />} label={t("Speed")} value={latestStats?.speed ?? 0} unit="km/h" />
          <StatBox icon={<Zap className="text-yellow-400 h-5 w-5" />} label={t("RPM")} value={latestStats?.rpm ?? 0} unit="r/min" />
          <StatBox icon={<span className="font-black text-rose-500">G</span>} label={t("Gear")} value={latestStats?.n_gear ?? 0} unit="" />
          <StatBox icon={<span className="font-black text-emerald-400">T</span>} label={t("Throttle")} value={latestStats?.throttle ?? 0} unit="%" />
        </div>

        {error ? (
          <div className="flex h-full min-h-[250px] items-center justify-center flex-col text-slate-500">
             <AlertCircle className="h-10 w-10 mb-2 opacity-50" />
             <p>{error}</p>
          </div>
        ) : (
          <div className="flex-grow min-h-[300px] h-[300px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="speedGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="throttleGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis 
                  dataKey="timeLabel" 
                  stroke="#475569" 
                  fontSize={10} 
                  tickFormatter={(val) => val}
                  tickMargin={10}
                />
                <YAxis yAxisId="left" stroke="#3b82f6" fontSize={11} domain={[0, 350]} />
                <YAxis yAxisId="right" orientation="right" stroke="#10b981" fontSize={11} domain={[0, 100]} />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#0f172a", borderColor: "#1e293b", color: "#f8fafc", borderRadius: "8px" }}
                  itemStyle={{ fontSize: "12px", fontWeight: "bold" }}
                  labelStyle={{ fontSize: "11px", color: "#94a3b8", marginBottom: "4px" }}
                />
                
                <ReferenceLine yAxisId="right" y={100} stroke="#ef4444" strokeDasharray="3 3" opacity={0.3} />

                {/* Brake visualizer using small area */}
                <Area 
                  yAxisId="right"
                  type="stepAfter" 
                  dataKey="brake" 
                  name={t("Brake %") as string}
                  stroke="#ef4444" 
                  fill="#ef4444" 
                  fillOpacity={0.1}
                  strokeWidth={2}
                />

                <Area 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="throttle" 
                  name={t("Throttle %") as string}
                  stroke="#10b981" 
                  fill="url(#throttleGradient)" 
                  strokeWidth={2}
                />
                
                <Area 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="speed" 
                  name={t("Speed (km/h)") as string}
                  stroke="#3b82f6" 
                  fill="url(#speedGradient)" 
                  strokeWidth={3}
                  activeDot={{ r: 6, fill: "#3b82f6", stroke: "#0f172a", strokeWidth: 2 }}
                />

              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function StatBox({ icon, label, value, unit }: { icon: React.ReactNode, label: string, value: number, unit: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/50 p-3 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-white/5 to-transparent rounded-bl-full opacity-50" />
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-950 border border-slate-800 shadow-inner">
        {icon}
      </div>
      <div className="flex flex-col z-10">
        <span className="text-[10px] font-medium uppercase tracking-wider text-slate-500">{label}</span>
        <div className="flex items-baseline gap-1">
          <span className="text-xl font-black text-white font-mono">{Number(value).toFixed(0)}</span>
          <span className="text-[10px] font-bold text-slate-400 mb-1">{unit}</span>
        </div>
      </div>
    </div>
  )
}

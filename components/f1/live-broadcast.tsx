"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import Hls from "hls.js";
import * as dashjs from "dashjs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Play, Tv, Info } from "lucide-react";
import { useTranslation } from "@/components/providers/i18n-provider";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export function LiveBroadcast() {
  const { t } = useTranslation();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [streamUrl, setStreamUrl] = useState(""); 
  const [isPlaying, setIsPlaying] = useState(false);

  // Derive the actual playable URL. If it's an AceStream ID or acestream:// format, map it to the local Ace Engine proxy.
  const playableUrl = useMemo(() => {
    const trimmed = streamUrl.trim();
    if (!trimmed) return "";
    
    // Check if it's a raw 40-character AceStream hash or starts with acestream://
    const aceMatch = trimmed.match(/^(?:acestream:\/\/)?([a-fA-F0-9]{40})$/);
    if (aceMatch) {
      return `http://127.0.0.1:6878/ace/getstream?id=${aceMatch[1]}`;
    }
    
    return trimmed; // Otherwise, assume it's a valid remote URL or m3u8
  }, [streamUrl]);

  useEffect(() => {
    let hls: Hls | null = null;
    let dashPlayer: dashjs.MediaPlayerClass | null = null;

    if (videoRef.current && playableUrl) {
      if (playableUrl.includes(".m3u8")) {
        if (Hls.isSupported()) {
          hls = new Hls({ maxBufferLength: 30, maxMaxBufferLength: 60 });
          hls.loadSource(playableUrl);
          hls.attachMedia(videoRef.current);
          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            if (isPlaying) videoRef.current?.play();
          });
        } else {
          videoRef.current.src = playableUrl;
        }
      } else if (playableUrl.includes(".mpd")) {
        // Init Dash.js for TV360 MPEG-DASH standard
        dashPlayer = dashjs.MediaPlayer().create();
        dashPlayer.initialize(videoRef.current, playableUrl, isPlaying);
        
        // Suppress dash.js verbose logs in production if desired
        dashPlayer.updateSettings({
          debug: { logLevel: dashjs.Debug.LOG_LEVEL_NONE }
        });
      } else {
        // Fallback for MP4s or local AceStream HTTP proxy streams (MPEG-TS)
        videoRef.current.src = playableUrl;
        videoRef.current.addEventListener("loadedmetadata", () => {
          if (isPlaying) videoRef.current?.play().catch(e => console.log("Auto-play prevented", e));
        }, { once: true });
      }
    }

    return () => {
      if (hls) hls.destroy();
      if (dashPlayer) dashPlayer.reset();
    };
  }, [playableUrl]);

  const handlePlay = () => {
    if (videoRef.current && playableUrl) {
      videoRef.current.play().catch((e) => console.error("Video play failed:", e));
      setIsPlaying(true);
    }
  };

  return (
    <Card className="flex flex-col border-red-500/20 bg-black/40 backdrop-blur-xl h-full">
      <CardHeader className="border-b border-red-500/10 pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-xl text-white">
            <Tv className="h-5 w-5 text-red-500" />
            {t("Live Feed")}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-slate-500 cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs bg-slate-900 border-slate-700 text-slate-200 z-50">
                  <p>Paste an <b>M3U8</b> link, <b>.MPD</b> (DASH) link, or MP4 URL.</p>
                  <p className="mt-2 text-xs text-slate-400">- E.g. search Google: <i>"Sky Sports F1 m3u8 github url"</i> to find free pure web streams without AceStream.</p>
                  <p className="mt-1 text-xs text-rose-500 font-medium">Or paste an AceStream ID if you have the PC app running.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </CardTitle>
          <div className="flex max-w-sm items-center gap-2">
            <Input 
              value={streamUrl} 
              onChange={(e) => setStreamUrl(e.target.value)} 
              placeholder="Inject AceStream ID or M3U8 link..."
              className="h-8 border-slate-700 bg-slate-900/50 text-xs text-slate-300 w-[250px]"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-grow flex-col justify-center p-0 relative min-h-[300px] md:min-h-[400px]">
        {!isPlaying && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm">
            <Button 
              size="lg" 
              className="h-16 w-16 rounded-full border-4 border-red-500 bg-red-500/20 text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-[0_0_30px_rgba(239,68,68,0.5)] hover:scale-110"
              onClick={handlePlay}
            >
              <Play className="h-8 w-8 ml-1" />
            </Button>
            <p className="mt-4 font-mono text-sm tracking-widest text-slate-300">AWAITING FEED</p>
          </div>
        )}
        <video 
          ref={videoRef} 
          className="h-full w-full object-cover rounded-b-xl" 
          controls={isPlaying}
          autoPlay={false}
          muted={false}
        />
      </CardContent>
    </Card>
  );
}

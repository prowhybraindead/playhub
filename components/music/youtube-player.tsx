"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import dynamic from "next/dynamic";
import { X, Maximize2, Minimize2, Loader2, PlaySquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MusicTrack } from "@/types";
import { toast } from "sonner";
import { useTranslation } from "@/components/providers/i18n-provider";

// CRITICAL: react-player MUST be loaded client-side only. 
// SSR breaks the YouTube IFrame API initialization.
const ReactPlayer = dynamic(() => import("react-player"), { ssr: false }) as any;

export function YouTubePlayer({ track }: { track: MusicTrack | null }) {
  const { t } = useTranslation();
  const [videoId, setVideoId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Reset state when track changes
    setVideoId(null);
    setIsOpen(false);
  }, [track?.idTrack]);

  const loadVideo = async () => {
    if (!track) return;
    setIsLoading(true);
    setIsOpen(true);
    setIsMinimized(false);

    try {
      const query = `${track.strTrack} ${track.strArtist}`;
      const res = await fetch(`/api/music/youtube?q=${encodeURIComponent(query)}`);
      if (!res.ok) throw new Error(t("No video found for this track"));
      
      const data = await res.json();
      setVideoId(data.videoId);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("Failed to load video"));
      setIsOpen(false);
    } finally {
      setIsLoading(false);
    }
  };

  if (!track) return null;

  const floatingPlayer = (
    <div className={`fixed z-[9999] transition-all duration-300 shadow-2xl overflow-hidden bg-black border border-slate-700 rounded-xl
      ${isMinimized 
        ? "bottom-4 right-4 w-72 h-48 sm:w-80 sm:h-52" 
        : "bottom-4 right-4 md:right-8 md:bottom-8 w-[92vw] h-[30vh] md:w-[480px] md:h-[270px] lg:w-[560px] lg:h-[315px]"
      }
    `}>
      {/* Header Controls */}
      <div className="absolute top-0 right-0 left-0 bg-gradient-to-b from-black/90 to-transparent p-2 flex justify-between items-center z-10">
        <span className="text-white text-[10px] sm:text-xs font-medium px-2 truncate drop-shadow-md">
          🎵 {track.strTrack} — {track.strArtist}
        </span>
        <div className="flex gap-1 bg-black/60 rounded-lg p-0.5 backdrop-blur-sm">
          <button 
            onClick={() => setIsMinimized(!isMinimized)} 
            className="p-1.5 hover:bg-white/20 text-white rounded transition"
          >
            {isMinimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
          </button>
          <button 
            onClick={() => { setIsOpen(false); setVideoId(null); }} 
            className="p-1.5 hover:bg-red-500/80 text-white rounded transition"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Player Core */}
      <div className="w-full h-full relative">
        {videoId ? (
          <ReactPlayer
            url={`https://www.youtube.com/watch?v=${videoId}`}
            playing={true}
            controls={true}
            width="100%"
            height="100%"
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-2 bg-slate-900">
            <Loader2 className="w-6 h-6 animate-spin text-red-500" />
            <span className="text-xs font-medium">{t("Searching YouTube...")}</span>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      <Button 
        onClick={loadVideo} 
        disabled={isLoading || isOpen}
        className="w-full bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white shadow-lg shadow-red-600/20 rounded-xl"
      >
        {isLoading ? (
          <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> {t("Loading Video...")}</>
        ) : isOpen ? (
          <><PlaySquare className="w-4 h-4 mr-2" /> {t("Video Playing")}</>
        ) : (
          <><PlaySquare className="w-4 h-4 mr-2" /> {t("Play Official Video")}</>
        )}
      </Button>

      {isOpen && mounted && createPortal(floatingPlayer, document.body)}
    </>
  );
}

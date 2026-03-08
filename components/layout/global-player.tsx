"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import dynamic from "next/dynamic";
import { X, Maximize2, Minimize2, Loader2, Play, Pause, Volume2, VolumeX } from "lucide-react";
import { useGlobalPlayer } from "@/lib/stores/use-global-player";
import { useTranslation } from "@/components/providers/i18n-provider";

// CRITICAL: react-player MUST be loaded client-side only. 
// SSR breaks the YouTube IFrame API initialization.
const ReactPlayer = dynamic(() => import("react-player"), { ssr: false }) as any;

export function GlobalPlayer() {
  const { t } = useTranslation();
  const { 
    currentTrackId, currentTrackTitle, currentTrackAuthor,
    isPlaying, volume, isMiniPlayerVisible,
    play, pause, toggleMiniPlayer, setVolume, setTrack
  } = useGlobalPlayer();
  
  const [mounted, setMounted] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !currentTrackId || !isMiniPlayerVisible) return null;

  const handleClose = () => {
    setTrack({ id: "", title: "", author: "" }); // Clear track to unmount player completely
  };

  const floatingPlayer = (
    <div className={`fixed z-[9999] transition-all duration-300 shadow-2xl overflow-hidden bg-black/90 backdrop-blur-xl border border-white/10 rounded-xl
      ${isMinimized 
        ? "bottom-4 right-4 w-72 h-44 sm:w-80 sm:h-48" 
        : "bottom-4 right-4 md:right-8 md:bottom-8 w-[92vw] h-[30vh] md:w-[480px] md:h-[270px] lg:w-[560px] lg:h-[315px]"
      }
    `}>
      {/* Header Controls */}
      <div className="absolute top-0 right-0 left-0 bg-gradient-to-b from-black/90 to-transparent p-2 flex justify-between items-center z-20">
        <span className="text-white text-[10px] sm:text-xs font-medium px-2 truncate drop-shadow-md">
          🎵 {currentTrackTitle} — {currentTrackAuthor}
        </span>
        <div className="flex gap-1 bg-black/60 rounded-lg p-0.5 backdrop-blur-sm">
          <button 
            onClick={() => setIsMinimized(!isMinimized)} 
            className="p-1.5 hover:bg-white/20 text-white rounded transition"
          >
            {isMinimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
          </button>
          <button 
            onClick={handleClose} 
            className="p-1.5 hover:bg-red-500/80 text-white rounded transition"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Player Core */}
      <div className="w-full h-full relative group">
        <div className="absolute inset-0 pointer-events-none z-10 box-shadow-[inset_0_0_50px_rgba(0,0,0,0.8)] shadow-inner" />
        
        {/* Custom Audio Visualizer Overlay (Basic CSS version) */}
        {isPlaying && (
          <div className="absolute bottom-12 left-0 right-0 h-16 flex items-end justify-center gap-1 z-10 opacity-30 pointer-events-none">
            {[...Array(20)].map((_, i) => (
              <div 
                key={i} 
                className="w-1.5 bg-cyan-400 rounded-t-sm"
                style={{ 
                  height: `${Math.max(10, Math.random() * 100)}%`,
                  animation: `bounce ${0.5 + Math.random()}s infinite alternate ease-in-out` 
                }}
              />
            ))}
          </div>
        )}

        <ReactPlayer
          url={`https://www.youtube.com/watch?v=${currentTrackId}`}
          playing={isPlaying}
          controls={true}
          volume={isMuted ? 0 : volume}
          width="100%"
          height="100%"
          onPlay={play}
          onPause={pause}
          style={{ position: 'absolute', top: 0, left: 0 }}
          config={{
            youtube: {
              playerVars: { 
                showinfo: 0, 
                modestbranding: 1, 
                rel: 0,
                color: 'white'
              }
            }
          }}
        />
        
        {/* Custom Controls Overlay (visible on hover or pause) */}
        <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity z-20 ${!isPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} pointer-events-none`}>
           <div className="bg-black/60 backdrop-blur-md rounded-full p-4 pointer-events-auto flex items-center gap-4">
             <button
               onClick={() => setIsMuted(!isMuted)}
               className="text-white hover:text-cyan-400 transition"
             >
               {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
             </button>
             
             <button
               onClick={() => isPlaying ? pause() : play()}
               className="bg-white text-black p-3 rounded-full hover:bg-cyan-400 hover:text-white transition scale-110 shadow-[0_0_15px_rgba(255,255,255,0.5)]"
             >
               {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current" />}
             </button>
           </div>
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes bounce {
          0% { transform: scaleY(0.2); }
          100% { transform: scaleY(1); }
        }
      `}} />
    </div>
  );

  return createPortal(floatingPlayer, document.body);
}

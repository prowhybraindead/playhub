"use client";

import { useState } from "react";
import { Loader2, PlaySquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MusicTrack } from "@/types";
import { toast } from "sonner";
import { useTranslation } from "@/components/providers/i18n-provider";
import { useGlobalPlayer } from "@/lib/stores/use-global-player";

export function YouTubePlayer({ track }: { track: MusicTrack | null }) {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const { setTrack, currentTrackId } = useGlobalPlayer();

  const loadVideo = async () => {
    if (!track) return;
    setIsLoading(true);

    try {
      const query = `${track.strTrack} ${track.strArtist}`;
      const res = await fetch(`/api/music/youtube?q=${encodeURIComponent(query)}`);
      if (!res.ok) throw new Error(t("No video found for this track"));
      
      const data = await res.json();
      
      setTrack({
        id: data.videoId,
        title: track.strTrack || "Unknown Title",
        author: track.strArtist || "Unknown Artist",
        thumbnail: track.strTrackThumb || null,
      });

    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("Failed to load video"));
    } finally {
      setIsLoading(false);
    }
  };

  if (!track) return null;

  const isCurrentTrack = currentTrackId !== null; // Simplify check for UI

  return (
    <Button 
      onClick={loadVideo} 
      disabled={isLoading}
      className="w-full bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white shadow-lg shadow-red-600/20 rounded-xl"
    >
      {isLoading ? (
        <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> {t("Loading Video...")}</>
      ) : isCurrentTrack ? (
        <><PlaySquare className="w-4 h-4 mr-2" /> {t("Play Another Video")}</>
      ) : (
        <><PlaySquare className="w-4 h-4 mr-2" /> {t("Play Official Video")}</>
      )}
    </Button>
  );
}

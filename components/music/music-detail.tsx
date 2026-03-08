"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { MusicTrack } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LyricsExpandable } from "@/components/music/lyrics-expandable";
import { useTranslation } from "@/components/providers/i18n-provider";
import { YouTubePlayer } from "@/components/music/youtube-player";

export function MusicDetail({ track }: { track: MusicTrack | null }) {
  const { t } = useTranslation();
  const [lyrics, setLyrics] = useState("");
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLyrics("");
    setExpanded(false);
  }, [track?.idTrack]);

  const loadLyrics = async () => {
    if (!track) return;
    setLoading(true);
    try {
      const search = new URLSearchParams({
        artist: track.strArtist,
        title: track.strTrack
      });
      const res = await fetch(`/api/music/lyrics?${search.toString()}`);
      if (!res.ok) throw new Error(t("Unable to load lyrics"));
      const data = (await res.json()) as { lyrics: string };
      setLyrics(data.lyrics);
      setExpanded(true);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("Lyrics request failed"));
    } finally {
      setLoading(false);
    }
  };

  if (!track) {
    return (
      <Card className="sticky top-24">
        <CardContent className="p-6 text-sm text-muted-foreground">{t("Select a song card to view details and lyrics.")}</CardContent>
      </Card>
    );
  }

  return (
    <Card className="sticky top-24 overflow-hidden">
      <div className="relative h-56 w-full">
        <Image
          src={track.strTrackThumb ?? "https://images.unsplash.com/photo-1511379938547-c1f69419868d?q=80&w=1200&auto=format&fit=crop"}
          alt={track.strTrack}
          fill
          className="object-cover"
          sizes="(max-width: 1024px) 100vw, 30vw"
        />
      </div>
      <CardHeader>
        <CardTitle>{track.strTrack}</CardTitle>
        <p className="text-sm text-muted-foreground">
          {track.strArtist} • {track.strAlbum}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Play Video Button Component */}
        <YouTubePlayer track={track} />

        {loading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> {t("Loading lyrics...")}
          </div>
        ) : (
          <LyricsExpandable lyrics={lyrics} expanded={expanded} onToggle={lyrics ? () => setExpanded((prev) => !prev) : loadLyrics} />
        )}
      </CardContent>
    </Card>
  );
}

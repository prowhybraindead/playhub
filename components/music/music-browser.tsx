"use client";

import { useEffect, useState } from "react";
import { Radio } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MusicSearch } from "@/components/music/music-search";
import { useTranslation } from "@/components/providers/i18n-provider";
import { MusicCard } from "@/components/music/music-card";
import { MusicDetail } from "@/components/music/music-detail";
import { MusicTrack } from "@/types";

type RadioStation = {
  id: string;
  name: string;
  streamUrl: string;
  image: string | null;
  country: string;
  tags: string;
};

export function MusicBrowser() {
  const { t } = useTranslation();
  const [tracks, setTracks] = useState<MusicTrack[]>([]);
  const [selectedTrack, setSelectedTrack] = useState<MusicTrack | null>(null);
  const [stations, setStations] = useState<RadioStation[]>([]);
  const [playing, setPlaying] = useState<RadioStation | null>(null);

  const loadRadios = async () => {
    const response = await fetch("/api/music/radio");
    const data = (await response.json()) as { stations: RadioStation[] };
    setStations(data.stations ?? []);
  };

  useEffect(() => {
    void loadRadios();
  }, []);

  return (
    <div className="mx-auto grid w-full max-w-7xl gap-4 px-4 py-6 lg:grid-cols-[1fr_350px] md:px-8">
      <div className="space-y-4">
        <Card className="ocean-glow border-cyan-300/20 bg-gradient-to-r from-cyan-400/15 to-purple-500/15">
          <CardHeader>
            <CardTitle>{t("Music Discovery")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <MusicSearch
              onResult={(results) => {
                setTracks(results);
                setSelectedTrack(results[0] ?? null);
              }}
            />
            <div className="space-y-3 rounded-lg border border-border bg-background/50 p-3 text-sm text-muted-foreground">
              <p className="inline-flex items-center gap-1 text-cyan-100">
                <Radio className="h-4 w-4" />
                {t("Bonus: Nghe radio toàn cầu")}
              </p>
              <div className="grid gap-2 md:grid-cols-2">
                {stations.slice(0, 6).map((station) => (
                  <Button key={station.id} variant={playing?.id === station.id ? "default" : "ghost"} className="justify-start" onClick={() => setPlaying(station)}>
                    <span className="truncate">
                      {station.name} • {station.country}
                    </span>
                  </Button>
                ))}
              </div>
              {playing ? <audio controls className="w-full" src={playing.streamUrl} /> : null}
            </div>
          </CardContent>
        </Card>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {tracks.map((track) => (
            <MusicCard key={track.idTrack} track={track} onSelect={setSelectedTrack} />
          ))}
        </div>
      </div>
      <MusicDetail track={selectedTrack} />
    </div>
  );
}

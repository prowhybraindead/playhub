"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MusicTrack } from "@/types";
import { useTranslation } from "@/components/providers/i18n-provider";

interface MusicSearchProps {
  onResult: (tracks: MusicTrack[]) => void;
}

export function MusicSearch({ onResult }: MusicSearchProps) {
  const { t } = useTranslation();
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState<"track" | "artist">("track");
  const [loading, setLoading] = useState(false);

  const onSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const search = new URLSearchParams({ query, mode });
      const res = await fetch(`/api/music/search?${search.toString()}`);
      if (!res.ok) throw new Error(t("Could not fetch tracks"));
      const data = (await res.json()) as { tracks: MusicTrack[] };
      onResult(data.tracks);
      if (!data.tracks.length) toast.info(t("No tracks found"));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("Search failed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Button variant={mode === "track" ? "default" : "ghost"} size="sm" onClick={() => setMode("track")}>
          {t("Bài hát")}
        </Button>
        <Button variant={mode === "artist" ? "default" : "ghost"} size="sm" onClick={() => setMode("artist")}>
          {t("Nghệ sĩ")}
        </Button>
      </div>
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") onSearch();
            }}
            placeholder={mode === "artist" ? t("Tìm nghệ sĩ...") : t("Tìm bài hát...")}
            className="pl-9"
          />
        </div>
        <Button onClick={onSearch} disabled={loading}>
          {loading ? t("Đang tìm...") : t("Tìm")}
        </Button>
      </div>
    </div>
  );
}

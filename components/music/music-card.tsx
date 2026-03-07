import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MusicTrack } from "@/types";

interface MusicCardProps {
  track: MusicTrack;
  onSelect: (track: MusicTrack) => void;
}

export function MusicCard({ track, onSelect }: MusicCardProps) {
  return (
    <button type="button" onClick={() => onSelect(track)} className="text-left">
      <Card className="group h-full overflow-hidden transition hover:-translate-y-1 hover:border-cyan-300/50">
        <div className="relative h-40 w-full overflow-hidden">
          <Image
            src={track.strTrackThumb ?? "https://images.unsplash.com/photo-1511379938547-c1f69419868d?q=80&w=1200&auto=format&fit=crop"}
            alt={track.strTrack}
            fill
            className="object-cover transition duration-500 group-hover:scale-110"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        </div>
        <CardHeader>
          <CardTitle className="line-clamp-1 text-base">{track.strTrack}</CardTitle>
        </CardHeader>
        <CardContent className="pt-0 text-sm text-muted-foreground">
          <p className="line-clamp-1">{track.strArtist}</p>
          <p className="line-clamp-1">{track.strAlbum}</p>
        </CardContent>
      </Card>
    </button>
  );
}

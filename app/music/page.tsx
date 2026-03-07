import { Header } from "@/components/layout/header";
import { MusicBrowser } from "@/components/music/music-browser";

export default function MusicPage() {
  return (
    <>
      <Header title="Âm Nhạc" subtitle="Tìm bài hát hoặc nghệ sĩ, xem detail, lyrics có scroll và radio toàn cầu." />
      <MusicBrowser />
    </>
  );
}

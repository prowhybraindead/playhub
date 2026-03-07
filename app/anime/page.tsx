import { Header } from "@/components/layout/header";
import { AnimeExplorer } from "@/components/anime/anime-explorer";

export default function AnimePage() {
  return (
    <>
      <Header title="Anime & Manga" subtitle="Tìm anime/manga/nhân vật, waifu random, quote và trace scene từ ảnh." />
      <AnimeExplorer />
    </>
  );
}

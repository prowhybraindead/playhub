"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useTranslation } from "@/components/providers/i18n-provider";
import { motion } from "framer-motion";

type Mode = "anime" | "manga" | "characters";

type AnimeItem = {
  id: string;
  title: string;
  subtitle: string;
  image: string | null;
  description: string;
  detail?: Record<string, string | number>;
};

type TraceResult = {
  title: string;
  episode: number | null;
  similarity: number;
  image: string | null;
  preview: string | null;
};

const modes: Mode[] = ["anime", "manga", "characters"];

export function AnimeExplorer() {
  const { t } = useTranslation();
  const [mode, setMode] = useState<Mode>("anime");
  const [query, setQuery] = useState("naruto");
  const [items, setItems] = useState<AnimeItem[]>([]);
  const [selected, setSelected] = useState<AnimeItem | null>(null);
  const [waifuImage, setWaifuImage] = useState<string | null>(null);
  const [animeQuote, setAnimeQuote] = useState("");
  const [traceResult, setTraceResult] = useState<TraceResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const detailRows = useMemo(() => Object.entries(selected?.detail ?? {}), [selected?.detail]);

  const search = async () => {
    setLoading(true);
    try {
      const searchParams = new URLSearchParams({ mode, query });
      const response = await fetch(`/api/anime/search?${searchParams.toString()}`);
      if (!response.ok) throw new Error(t("Không thể tìm anime"));
      const data = (await response.json()) as { items: AnimeItem[] };
      setItems(data.items);
      setSelected(data.items[0] ?? null);
      if (!data.items.length) toast.info(t("Không có kết quả phù hợp"));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("Lỗi tìm anime"));
    } finally {
      setLoading(false);
    }
  };

  const loadExtras = async () => {
    try {
      const response = await fetch("/api/anime/extras");
      if (!response.ok) throw new Error(t("Không tải được waifu/quote"));
      const data = (await response.json()) as { waifuImage: string | null; quote: string };
      setWaifuImage(data.waifuImage);
      setAnimeQuote(data.quote);
    } catch {
      setWaifuImage(null);
      setAnimeQuote("");
    }
  };

  useEffect(() => {
    void search();
  }, [mode]);

  useEffect(() => {
    void loadExtras();
  }, []);

  const traceAnimeScene = async (file: File) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.set("image", file);
      const response = await fetch("/api/anime/trace", { method: "POST", body: formData });
      if (!response.ok) throw new Error(t("Không nhận diện được cảnh anime"));
      const data = (await response.json()) as { result: TraceResult | null };
      setTraceResult(data.result);
      if (!data.result) toast.info(t("Không tìm thấy cảnh phù hợp"));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("Trace anime thất bại"));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="mx-auto grid w-full max-w-7xl gap-4 px-4 py-6 lg:grid-cols-[1fr_360px] md:px-8">
      <div className="space-y-4">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <Card className="ocean-glow border-cyan-300/20 bg-gradient-to-r from-cyan-400/15 to-purple-500/15">
            <CardHeader>
              <CardTitle>{t("Anime & Manga Explorer")}</CardTitle>
              <CardDescription>{t("Tìm anime, manga hoặc nhân vật rồi xem detail ngay")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {modes.map((item) => (
                  <Button key={item} variant={mode === item ? "default" : "ghost"} size="sm" onClick={() => setMode(item)}>
                    {t(item)}
                  </Button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t("Tìm kiếm...")} />
                <Button onClick={search} disabled={loading} className="transition active:scale-95">
                  {loading ? t("Đang tìm...") : t("Tìm")}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {items.map((item, idx) => (
            <motion.button 
              key={`${item.id}-${idx}`} 
              type="button" 
              onClick={() => setSelected(item)} 
              className="text-left"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
            >
              <Card className="h-full overflow-hidden transition hover:-translate-y-1 hover:border-cyan-300/50">
                {item.image ? <img src={item.image} alt={item.title} className="h-44 w-full object-cover transition hover:scale-105" /> : null}
                <CardHeader>
                  <CardTitle className="line-clamp-1 text-base">{t(item.title)}</CardTitle>
                  <CardDescription className="line-clamp-1">{t(item.subtitle)}</CardDescription>
                </CardHeader>
              </Card>
            </motion.button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
          <Card>
            <CardHeader>
              <CardTitle>{t(selected?.title ?? "Chọn item")}</CardTitle>
              <CardDescription>{t(selected?.subtitle ?? "")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {selected?.image ? <img src={selected.image} alt={selected.title} className="h-56 w-full rounded-xl object-cover" /> : null}
              <p className="text-sm text-muted-foreground">{t(selected?.description ?? "Chọn anime/manga/character để xem info chi tiết.")}</p>
              {detailRows.length ? (
                <div className="rounded-xl border border-border bg-background/60 p-3 text-xs text-muted-foreground">
                  {detailRows.map(([key, value]) => (
                    <p key={key}>
                      <span className="font-semibold text-cyan-200">{t(key)}:</span> {t(String(value))}
                    </p>
                  ))}
                </div>
              ) : null}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: 0.2 }}>
          <Card>
            <CardHeader>
              <CardTitle>{t("Bonus Waifu + Quote")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {waifuImage ? <img src={waifuImage} alt="waifu" className="h-44 w-full rounded-xl object-cover transition hover:scale-[1.02]" /> : null}
              <p className="text-sm text-muted-foreground">{t(animeQuote || "Chưa tải được quote.")}</p>
              <Button variant="secondary" onClick={loadExtras} className="transition active:scale-95">
                {t("Đổi waifu + quote")}
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: 0.3 }}>
          <Card>
            <CardHeader>
              <CardTitle>{t("Trace Anime từ ảnh upload")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Input
                type="file"
                accept="image/*"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) void traceAnimeScene(file);
                }}
              />
              {uploading ? <p className="text-sm text-muted-foreground">{t("Đang nhận diện...")}</p> : null}
              {traceResult ? (
                <div className="space-y-2 rounded-xl border border-border bg-background/60 p-3">
                  <p className="text-sm font-medium">{t(traceResult.title)}</p>
                  <p className="text-xs text-muted-foreground">
                    {t("Episode")}: {traceResult.episode ?? "?"} • {t("Similarity")}: {(traceResult.similarity * 100).toFixed(2)}%
                  </p>
                  {traceResult.image ? <img src={traceResult.image} alt={traceResult.title} className="h-28 w-full rounded-lg object-cover" /> : null}
                  {traceResult.preview ? (
                    <a href={traceResult.preview} target="_blank" className="text-xs text-cyan-200 hover:underline" rel="noreferrer">
                      {t("Xem preview video")}
                    </a>
                  ) : null}
                </div>
              ) : null}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

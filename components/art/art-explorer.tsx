"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useTranslation } from "@/components/providers/i18n-provider";
import { motion } from "framer-motion";

type ArtItem = {
  id: string;
  title: string;
  subtitle: string;
  image: string | null;
  description: string;
};

export function ArtExplorer() {
  const { t } = useTranslation();
  const [query, setQuery] = useState("ocean");
  const [items, setItems] = useState<ArtItem[]>([]);
  const [selected, setSelected] = useState<ArtItem | null>(null);
  const [stockImage, setStockImage] = useState<string | null>(null);
  const [palette, setPalette] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const search = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ query });
      const response = await fetch(`/api/art/search?${params.toString()}`);
      if (!response.ok) throw new Error(t("Không thể tải gallery"));
      const data = (await response.json()) as { items: ArtItem[]; stockImage: string | null };
      setItems(data.items);
      setSelected(data.items[0] ?? null);
      setStockImage(data.stockImage);
      if (!data.items.length) toast.info(t("Không có tác phẩm phù hợp"));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("Lỗi tải gallery"));
    } finally {
      setLoading(false);
    }
  };

  const generatePalette = async (base: string) => {
    const params = new URLSearchParams({ base });
    const response = await fetch(`/api/art/palette?${params.toString()}`);
    const data = (await response.json()) as { palette: string[] };
    setPalette(data.palette);
  };

  useEffect(() => {
    void search();
    void generatePalette("#1ec9ff");
  }, []);

  return (
    <div className="mx-auto grid w-full max-w-7xl gap-4 px-4 py-6 lg:grid-cols-[1fr_360px] md:px-8">
      <div className="space-y-4">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <Card className="ocean-glow border-cyan-300/20 bg-gradient-to-r from-cyan-400/15 to-purple-500/15">
            <CardHeader>
              <CardTitle>{t("Nghệ thuật & Hình ảnh")}</CardTitle>
              <CardDescription>{t("Metropolitan Museum + Art Institute + stock image")}</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center gap-2">
              <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t("Tìm tác phẩm...")} />
              <Button onClick={search} disabled={loading} className="transition active:scale-95">
                {loading ? t("Đang tải...") : t("Tìm")}
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {items.map((item, i) => (
            <motion.button 
              key={item.id} 
              type="button" 
              onClick={() => setSelected(item)} 
              className="text-left"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="h-full overflow-hidden transition hover:-translate-y-1 hover:border-cyan-300/50">
                {item.image ? <img src={item.image} alt={item.title} className="h-40 w-full object-cover transition hover:scale-105" referrerPolicy="no-referrer" /> : null}
                <CardHeader>
                  <CardTitle className="line-clamp-2 text-base">{t(item.title)}</CardTitle>
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
              <CardTitle>{t(selected?.title ?? "Art detail")}</CardTitle>
              <CardDescription>{t(selected?.subtitle ?? "")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {selected?.image ? <img src={selected.image} alt={selected.title} className="h-52 w-full rounded-xl object-cover" referrerPolicy="no-referrer" /> : null}
              <p className="text-sm text-muted-foreground">{t(selected?.description ?? "Chọn một tác phẩm để xem detail.")}</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: 0.2 }}>
          <Card>
            <CardHeader>
              <CardTitle>{t("Bảng màu tự động")}</CardTitle>
            </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2">
              <Input
                type="color"
                defaultValue="#1ec9ff"
                onChange={(event) => {
                  void generatePalette(event.target.value);
                }}
                className="h-10 w-14 p-1"
              />
              <span className="text-xs text-muted-foreground">{t("Chọn màu gốc để sinh palette")}</span>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {palette.map((color) => (
                <div key={color} className="h-12 rounded-lg border border-border" style={{ backgroundColor: color }} title={color} />
              ))}
            </div>
          </CardContent>
        </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: 0.3 }}>
          <Card>
            <CardHeader>
              <CardTitle>{t("Ảnh stock theo chủ đề")}</CardTitle>
            </CardHeader>
            <CardContent>
              {stockImage ? <img src={stockImage} alt="stock" className="h-48 w-full rounded-xl object-cover transition hover:scale-[1.02]" referrerPolicy="no-referrer" /> : <p className="text-sm text-muted-foreground">{t("Chưa có ảnh.")}</p>}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

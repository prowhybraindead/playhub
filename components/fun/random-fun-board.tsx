"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "@/components/providers/i18n-provider";
import { motion } from "framer-motion";

type FunPayload = {
  pokemon?: { name: string; image: string | null };
  nasa?: { title: string; image: string | null; description: string };
  animals?: { cat: string | null; dog: string | null; fox: string | null };
  joke?: string;
  fact?: string;
};

export function RandomFunBoard() {
  const { t } = useTranslation();
  const [payload, setPayload] = useState<FunPayload>({});
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/fun/random");
      if (!response.ok) throw new Error(t("Không tải được random fun"));
      const data = (await response.json()) as FunPayload;
      setPayload(data);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("Lỗi random fun"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  return (
    <div className="mx-auto w-full max-w-7xl space-y-4 px-4 py-6 md:px-8">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <Card className="ocean-glow border-cyan-300/20 bg-gradient-to-r from-cyan-400/15 to-purple-500/15">
          <CardHeader>
            <CardTitle>{t("Random Fun")}</CardTitle>
            <CardDescription>{t("Pokémon, NASA, mèo/chó/cáo, joke và fact")}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={load} disabled={loading} className="transition hover:scale-105 active:scale-95">
              {loading ? t("Đang làm mới...") : t("Làm mới dữ liệu vui")}
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}>
          <Card className="h-full hover:border-cyan-300/40 transition">
            <CardHeader>
              <CardTitle>{t("Pokémon")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {payload.pokemon?.image ? <img src={payload.pokemon.image} alt={payload.pokemon.name} className="h-40 w-full rounded-xl object-contain bg-background/70" /> : null}
              <p className="text-sm text-muted-foreground">{t(payload.pokemon?.name ?? "No Pokémon")}</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.15 }}>
          <Card className="h-full hover:border-purple-300/40 transition">
            <CardHeader>
              <CardTitle>{t("NASA")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {payload.nasa?.image ? <img src={payload.nasa.image} alt={payload.nasa.title} className="h-40 w-full rounded-xl object-cover" /> : null}
              <p className="text-sm font-medium">{t(payload.nasa?.title ?? "NASA APOD")}</p>
              <p className="line-clamp-4 text-xs text-muted-foreground">{t(payload.nasa?.description ?? "")}</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}>
          <Card className="h-full hover:border-emerald-300/40 transition">
            <CardHeader>
              <CardTitle>{t("Animals")}</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2">
              {payload.animals?.cat ? <img src={payload.animals.cat} alt="cat" className="h-24 w-full rounded-xl object-cover hover:scale-[1.02] transition" /> : null}
              {payload.animals?.dog ? <img src={payload.animals.dog} alt="dog" className="h-24 w-full rounded-xl object-cover hover:scale-[1.02] transition" /> : null}
              {payload.animals?.fox ? <img src={payload.animals.fox} alt="fox" className="h-24 w-full rounded-xl object-cover hover:scale-[1.02] transition" /> : null}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <Card className="h-full transition hover:border-border/80">
            <CardHeader>
              <CardTitle>{t("Joke")}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{t(payload.joke ?? "No joke right now.")}</p>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="h-full transition hover:border-border/80">
            <CardHeader>
              <CardTitle>{t("Fact")}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{t(payload.fact ?? "No fact right now.")}</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

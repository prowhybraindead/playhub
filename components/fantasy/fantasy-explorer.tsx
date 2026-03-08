"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { FantasyCoWriter } from "@/components/fantasy/fantasy-cowriter";

type Universe = "starwars" | "got" | "lotr" | "dune";

type FantasyItem = {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  quote?: string;
  extra?: string;
};

const universes: Universe[] = ["starwars", "got", "lotr", "dune"];

export function FantasyExplorer() {
  const [universe, setUniverse] = useState<Universe>("starwars");
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<FantasyItem[]>([]);
  const [selected, setSelected] = useState<FantasyItem | null>(null);
  const [loading, setLoading] = useState(false);

  const subtitle = useMemo(() => {
    if (universe === "starwars") return "Star Wars";
    if (universe === "got") return "Game of Thrones";
    if (universe === "lotr") return "Lord of the Rings";
    return "Dune";
  }, [universe]);

  const search = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ universe, query });
      const response = await fetch(`/api/fantasy/search?${params.toString()}`);
      if (!response.ok) throw new Error("Không thể tải dữ liệu fantasy");
      const data = (await response.json()) as { items: FantasyItem[] };
      setItems(data.items);
      setSelected(data.items[0] ?? null);
      if (!data.items.length) toast.info("Không có nhân vật phù hợp");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Lỗi tải fantasy");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void search();
  }, [universe]);

  return (
    <div className="mx-auto grid w-full max-w-7xl gap-4 px-4 py-6 lg:grid-cols-[1fr_350px] md:px-8">
      <div className="space-y-4">
        <Card className="ocean-glow border-cyan-300/20 bg-gradient-to-r from-cyan-400/15 to-purple-500/15">
          <CardHeader>
            <CardTitle>Fantasy Universe</CardTitle>
            <CardDescription>Star Wars, Game of Thrones, LOTR, Dune</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {universes.map((item) => (
                <Button key={item} size="sm" variant={universe === item ? "default" : "ghost"} onClick={() => setUniverse(item)}>
                  {item}
                </Button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={`Tìm trong ${subtitle}...`} />
              <Button onClick={search} disabled={loading}>
                {loading ? "Đang tìm..." : "Tìm"}
              </Button>
            </div>
          </CardContent>
        </Card>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => (
            <button key={item.id} type="button" onClick={() => setSelected(item)} className="text-left">
              <Card className="h-full transition hover:-translate-y-1 hover:border-cyan-300/50">
                <CardHeader>
                  <CardTitle className="line-clamp-1 text-base">{item.title}</CardTitle>
                  <CardDescription>{item.subtitle}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="line-clamp-4 text-sm text-muted-foreground">{item.description}</p>
                </CardContent>
              </Card>
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-4">
        <Card className="sticky top-24 h-fit glass-card">
          <CardHeader>
            <CardTitle>{selected?.title ?? "Detail"}</CardTitle>
            <CardDescription>{selected?.subtitle}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">{selected?.description ?? "Chọn một nhân vật để xem chi tiết."}</p>
            {selected?.extra ? <p className="rounded-lg border border-border bg-background/60 p-3 text-xs text-muted-foreground">{selected.extra}</p> : null}
            {selected?.quote ? (
              <p className="rounded-lg border border-cyan-300/20 bg-cyan-300/10 p-3 text-sm text-cyan-100">{selected.quote}</p>
            ) : null}
          </CardContent>
        </Card>
        
        <div className="sticky top-[450px]">
           <FantasyCoWriter universe={universe} />
        </div>
      </div>
    </div>
  );
}

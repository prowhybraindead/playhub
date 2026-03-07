"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type BookItem = {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  readUrl: string | null;
};

type BookDetail = {
  title: string;
  author: string;
  year: number | string;
  subjects: string[];
  openLibraryUrl: string | null;
};

export function BooksExplorer() {
  const [query, setQuery] = useState("fantasy");
  const [items, setItems] = useState<BookItem[]>([]);
  const [selected, setSelected] = useState<BookItem | null>(null);
  const [detail, setDetail] = useState<BookDetail | null>(null);
  const [loading, setLoading] = useState(false);

  const search = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ query });
      const response = await fetch(`/api/books/search?${params.toString()}`);
      if (!response.ok) throw new Error("Không thể tìm sách");
      const data = (await response.json()) as { items: BookItem[] };
      setItems(data.items);
      const first = data.items[0] ?? null;
      setSelected(first);
      if (first) void loadDetail(first.title);
      if (!data.items.length) toast.info("Không có sách phù hợp");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Lỗi tìm sách");
    } finally {
      setLoading(false);
    }
  };

  const loadDetail = async (title: string) => {
    try {
      const params = new URLSearchParams({ title });
      const response = await fetch(`/api/books/detail?${params.toString()}`);
      if (!response.ok) throw new Error("Không thể tải chi tiết sách");
      const data = (await response.json()) as { detail: BookDetail | null };
      setDetail(data.detail);
    } catch {
      setDetail(null);
    }
  };

  useEffect(() => {
    void search();
  }, []);

  return (
    <div className="mx-auto grid w-full max-w-7xl gap-4 px-4 py-6 lg:grid-cols-[1fr_360px] md:px-8">
      <div className="space-y-4">
        <Card className="ocean-glow border-cyan-300/20 bg-gradient-to-r from-cyan-400/15 to-purple-500/15">
          <CardHeader>
            <CardTitle>Sách miễn phí từ Project Gutenberg</CardTitle>
            <CardDescription>Tìm và đọc trực tiếp với link mở nhanh</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center gap-2">
            <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tìm sách..." />
            <Button onClick={search} disabled={loading}>
              {loading ? "Đang tìm..." : "Tìm"}
            </Button>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              className="text-left"
              onClick={() => {
                setSelected(item);
                void loadDetail(item.title);
              }}
            >
              <Card className="h-full transition hover:-translate-y-1 hover:border-cyan-300/50">
                <CardHeader>
                  <CardTitle className="line-clamp-2 text-base">{item.title}</CardTitle>
                  <CardDescription className="line-clamp-1">{item.subtitle}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="line-clamp-4 text-sm text-muted-foreground">{item.description}</p>
                </CardContent>
              </Card>
            </button>
          ))}
        </div>
      </div>

      <Card className="sticky top-24 h-fit">
        <CardHeader>
          <CardTitle>{selected?.title ?? "Book detail"}</CardTitle>
          <CardDescription>{selected?.subtitle}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">{selected?.description ?? "Chọn một quyển sách để xem chi tiết."}</p>
          {detail ? (
            <div className="rounded-xl border border-border bg-background/60 p-3 text-xs text-muted-foreground">
              <p>Tác giả: {detail.author}</p>
              <p>Năm xuất bản: {detail.year}</p>
              <p>Chủ đề: {detail.subjects.slice(0, 5).join(", ") || "N/A"}</p>
            </div>
          ) : null}
          {selected?.readUrl ? (
            <a href={selected.readUrl} target="_blank" className="text-sm text-cyan-200 hover:underline" rel="noreferrer">
              Đọc trực tiếp trên Gutenberg
            </a>
          ) : null}
          {detail?.openLibraryUrl ? (
            <a href={detail.openLibraryUrl} target="_blank" className="text-sm text-cyan-200 hover:underline" rel="noreferrer">
              Mở trên Open Library
            </a>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}

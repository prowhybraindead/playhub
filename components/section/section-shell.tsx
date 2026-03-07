"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SectionCardItem } from "@/types";

interface SectionShellProps {
  title: string;
  description: string;
  items: SectionCardItem[];
}

export function SectionShell({ title, description, items }: SectionShellProps) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<SectionCardItem | null>(null);
  const [expanded, setExpanded] = useState(false);

  const filtered = useMemo(() => {
    if (!query.trim()) return items;
    const normalized = query.toLowerCase();
    return items.filter((item) => item.title.toLowerCase().includes(normalized) || item.subtitle?.toLowerCase().includes(normalized));
  }, [items, query]);

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6 md:px-8">
      <Card className="ocean-glow border-cyan-300/20 bg-gradient-to-r from-cyan-400/15 to-purple-500/15">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
            <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search..." className="pl-9" />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => {
              setSelected(item);
              setExpanded(false);
            }}
            className="text-left"
          >
            <Card className="group h-full overflow-hidden transition hover:-translate-y-1 hover:border-cyan-300/50">
              <CardHeader>
                <CardTitle className="line-clamp-1">{item.title}</CardTitle>
                <CardDescription className="line-clamp-1">{item.subtitle}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="line-clamp-3 text-sm text-muted-foreground">{item.description ?? "No description yet."}</p>
              </CardContent>
            </Card>
          </button>
        ))}
      </div>

      {selected ? (
        <Card className="border-cyan-300/30">
          <CardHeader>
            <CardTitle>{selected.title}</CardTitle>
            <CardDescription>{selected.subtitle}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">{selected.description}</p>
            <Button variant="secondary" onClick={() => setExpanded((prev) => !prev)}>
              {expanded ? "Hide Details" : "Show Details"}
            </Button>
            <motion.div initial={false} animate={{ height: expanded ? "auto" : 0, opacity: expanded ? 1 : 0 }} className="overflow-hidden">
              <div className="rounded-xl border border-border bg-background/80 p-3 text-sm text-muted-foreground">{selected.extra ?? "Coming soon with full API data."}</div>
            </motion.div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}

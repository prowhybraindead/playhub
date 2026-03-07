"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

interface LyricsExpandableProps {
  lyrics: string;
  expanded: boolean;
  onToggle: () => void;
}

export function LyricsExpandable({ lyrics, expanded, onToggle }: LyricsExpandableProps) {
  return (
    <div className="space-y-3">
      <Button onClick={onToggle} variant="secondary">
        {expanded ? "Hide Lyrics" : "Show Lyrics"}
      </Button>
      <motion.div initial={false} animate={{ height: expanded ? "auto" : 0, opacity: expanded ? 1 : 0 }} className="overflow-hidden">
        <pre className="max-h-72 overflow-auto whitespace-pre-wrap rounded-xl border border-border bg-background/80 p-4 text-sm text-muted-foreground">
          {lyrics || "No lyrics found for this song yet."}
        </pre>
      </motion.div>
    </div>
  );
}

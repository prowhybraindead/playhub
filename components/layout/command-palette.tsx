"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BookOpenText, Brush, Crown, MessageCircle, Music, Sparkles, Stars, TvMinimalPlay } from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const runCommand = (command: () => void) => {
    setOpen(false);
    command();
  };

  return (
    <>
      <div className="hidden items-center gap-2 rounded-full border border-cyan-300/30 bg-background/50 px-3 py-1.5 text-sm text-muted-foreground md:flex">
        <span>Press</span>
        <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
          <span className="text-xs">⌘</span>K
        </kbd>
        <span>to search</span>
      </div>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Search spaces..." className="bg-transparent border-0 ring-0 focus:ring-0" />
        <CommandList className="glass-panel-heavy">
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Spaces">
            <CommandItem onSelect={() => runCommand(() => router.push("/music"))}>
              <Music className="mr-2 h-4 w-4 text-cyan-400" />
              <span>Music</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push("/anime"))}>
              <TvMinimalPlay className="mr-2 h-4 w-4 text-purple-400" />
              <span>Anime & Manga</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push("/books"))}>
              <BookOpenText className="mr-2 h-4 w-4 text-emerald-400" />
              <span>Books</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push("/fantasy"))}>
              <Stars className="mr-2 h-4 w-4 text-yellow-400" />
              <span>Fantasy Universe</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push("/art"))}>
              <Brush className="mr-2 h-4 w-4 text-pink-400" />
              <span>Art & Images</span>
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Actions">
            <CommandItem onSelect={() => runCommand(() => router.push("/dashboard"))}>
              <Sparkles className="mr-2 h-4 w-4 text-cyan-200" />
              <span>Dashboard</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push("/chat"))}>
              <MessageCircle className="mr-2 h-4 w-4 text-blue-400" />
              <span>Chat</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push("/upgrade"))}>
              <Crown className="mr-2 h-4 w-4 text-yellow-500" />
              <span>Upgrade Plan</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}

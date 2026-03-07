"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/music", label: "Music" },
  { href: "/anime", label: "Anime & Manga" },
  { href: "/books", label: "Books" },
  { href: "/fantasy", label: "Fantasy" },
  { href: "/art", label: "Art" },
  { href: "/chat", label: "Chat" },
  { href: "/upgrade", label: "Upgrade" },
  { href: "/profile", label: "Profile" }
];

export function MobileSidebar() {
  const pathname = usePathname();
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogTitle>Dolphin Playhub</DialogTitle>
        <nav className="mt-2 space-y-2">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "block rounded-lg px-3 py-2 text-sm text-muted-foreground transition hover:bg-muted hover:text-foreground",
                pathname === link.href && "bg-muted text-foreground"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </DialogContent>
    </Dialog>
  );
}

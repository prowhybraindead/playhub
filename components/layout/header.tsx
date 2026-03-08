"use client";

import { useState, useRef, useEffect } from "react";
import { Waves, Globe, ChevronDown } from "lucide-react";
import { MobileSidebar } from "@/components/layout/mobile-sidebar";
import { CommandPalette } from "@/components/layout/command-palette";
import { useTranslation, Locale } from "@/components/providers/i18n-provider";

const LABELS: Record<Locale, string> = {
  en: "English",
  vi: "Tiếng Việt",
  ja: "日本語",
  ko: "한국어",
  zh: "中文",
  fr: "Français",
  es: "Español"
};

export function Header({ title, subtitle }: { title: string; subtitle?: string }) {
  const { t, locale, setLocale } = useTranslation();
  const [isLangOpen, setIsLangOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(event.target as Node)) {
        setIsLangOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="glass-panel-heavy px-4 py-4 md:px-8 border-b-0 sticky top-0 z-20">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between">
        <div className="flex items-center gap-3">
          <MobileSidebar />
          <div>
          <h1 className="text-xl font-semibold tracking-tight md:text-2xl">{t(title)}</h1>
          {subtitle ? <p className="text-sm text-muted-foreground">{t(subtitle)}</p> : null}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative" ref={langRef}>
            <button 
              type="button"
              onClick={() => setIsLangOpen(!isLangOpen)}
              className="flex items-center gap-2 rounded-full border border-cyan-300/30 bg-background/50 px-3 py-1.5 text-sm transition hover:bg-cyan-900/40 hover:text-cyan-200"
            >
              <Globe className="h-4 w-4" />
              <span className="font-medium uppercase">{locale}</span>
              <ChevronDown className={`h-3 w-3 transition-transform ${isLangOpen ? "rotate-180" : ""}`} />
            </button>
            
            {isLangOpen && (
              <div className="absolute right-0 top-full mt-2 w-40 origin-top-right rounded-xl border border-border/80 bg-background/95 p-1.5 shadow-xl shadow-cyan-900/20 backdrop-blur-md animate-in fade-in zoom-in-95">
                {(Object.keys(LABELS) as Locale[]).map((l) => (
                  <button
                    key={l}
                    type="button"
                    onClick={() => {
                      setLocale(l);
                      setIsLangOpen(false);
                    }}
                    className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-all ${
                      locale === l 
                        ? "bg-cyan-500/15 font-medium text-cyan-300" 
                        : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                    }`}
                  >
                    <span>{LABELS[l]}</span>
                    <span className="text-[10px] uppercase opacity-60">{l}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          
          <CommandPalette />
        </div>
      </div>
    </header>
  );
}

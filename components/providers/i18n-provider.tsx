"use client";

import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from "react";

export type Locale = "en" | "vi" | "ja" | "ko" | "zh" | "fr" | "es";

const LOCALE_PROMPT_NAMES: Record<Locale, string> = {
  en: "English",
  vi: "Vietnamese",
  ja: "Japanese",
  ko: "Korean",
  zh: "Simplified Chinese",
  fr: "French",
  es: "Spanish"
};

interface TranslationContextType {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (text: string) => string;
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

// A singleton outside React to handle batching and avoid render side-effects
class TranslationQueue {
  private queue: Set<string> = new Set();
  private timeout: NodeJS.Timeout | null = null;
  private onTranslationsReady: (locale: Locale, newTranslations: Record<string, string>) => void;
  
  constructor(callback: typeof this.onTranslationsReady) {
    this.onTranslationsReady = callback;
  }
  
  add(text: string, targetLocale: Locale) {
    if (!text || text.trim() === "") return;
    const key = `${targetLocale}|${text}`;
    if (this.queue.has(key)) return;
    
    this.queue.add(key);
    if (this.timeout) clearTimeout(this.timeout);
    this.timeout = setTimeout(() => this.flush(), 2000); // 2s batching
  }
  
  private async flush() {
    const items = Array.from(this.queue);
    this.queue.clear();
    if (items.length === 0) return;
    
    // Group by locale
    const byLocale: Record<string, string[]> = {};
    items.forEach(item => {
      const idx = item.indexOf('|');
      const loc = item.slice(0, idx);
      const text = item.slice(idx + 1);
      if (!byLocale[loc]) byLocale[loc] = [];
      byLocale[loc].push(text);
    });
    
    for (const loc of Object.keys(byLocale)) {
      const texts = byLocale[loc];
      const languageName = LOCALE_PROMPT_NAMES[loc as Locale] || "English";
      
      try {
        const res = await fetch("/api/translate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ texts, targetLanguage: languageName })
        });
        const data = await res.json();
        
        if (data.translations) {
          const newMap: Record<string, string> = {};
          texts.forEach((original, idx) => {
            newMap[original] = data.translations[idx] || original;
          });
          this.onTranslationsReady(loc as Locale, newMap);
        }
      } catch (e) {
         // silently fail, will retry when user sees it again
      }
    }
  }
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState<Locale>("vi");
  const [cache, setCache] = useState<Record<Locale, Record<string, string>>>({
    en: {},
    vi: {},
    ja: {},
    ko: {},
    zh: {},
    fr: {},
    es: {}
  });
  
  // Initialize from storage
  useEffect(() => {
    try {
      const savedLoc = localStorage.getItem("locale") as Locale;
      if (savedLoc && LOCALE_PROMPT_NAMES[savedLoc]) setLocale(savedLoc);
      
      const savedCache = localStorage.getItem("i18n_cache");
      if (savedCache) setCache(JSON.parse(savedCache));
    } catch(e) {}
  }, []);
  
  const handleTranslationsReady = useCallback((targetLocale: Locale, newTranslations: Record<string, string>) => {
    setCache(prev => {
      const updated = { ...prev[targetLocale], ...newTranslations };
      const nextState = { ...prev, [targetLocale]: updated };
      localStorage.setItem("i18n_cache", JSON.stringify(nextState));
      return nextState;
    });
  }, []);

  const queueManager = useRef(new TranslationQueue(handleTranslationsReady));

  // The synchronous `translate` function used in render
  const t = useCallback((text: string) => {
    if (!text || text.trim() === "") return text;
    
    if (cache[locale] && cache[locale][text]) {
      return cache[locale][text];
    }
    
    // It's missing, add to queue
    queueManager.current.add(text, locale);
    
    // Return original temporarily while fetching
    return text;
  }, [locale, cache]);

  // Persist locale change
  const handleSetLocale = (newLocale: Locale) => {
    setLocale(newLocale);
    localStorage.setItem("locale", newLocale);
  };

  return (
    <TranslationContext.Provider value={{ locale, setLocale: handleSetLocale, t }}>
      {children}
    </TranslationContext.Provider>
  );
}

export const useTranslation = () => {
  const ctx = useContext(TranslationContext);
  if (!ctx) throw new Error("useTranslation must be used within a I18nProvider");
  return ctx;
};

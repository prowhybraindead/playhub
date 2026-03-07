"use client";

import { ThemeProvider } from "next-themes";
import { AppToaster } from "@/components/ui/sonner";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      {children}
      <AppToaster />
    </ThemeProvider>
  );
}

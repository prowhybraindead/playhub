import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "@/components/layout/sidebar";
import { Providers } from "@/components/providers";
import { I18nProvider } from "@/components/providers/i18n-provider";
import { PageTransition } from "@/components/ui/page-transition";

export const metadata: Metadata = {
  title: "Dolphin Playhub",
  description: "Your personal ocean of fun"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>
          <I18nProvider>
            <Sidebar />
            <main className="min-h-screen md:ml-72">
              <PageTransition>{children}</PageTransition>
            </main>
          </I18nProvider>
        </Providers>
      </body>
    </html>
  );
}

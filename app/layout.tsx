import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "@/components/layout/sidebar";
import { Providers } from "@/components/providers";
import { I18nProvider } from "@/components/providers/i18n-provider";
import { PageTransition } from "@/components/ui/page-transition";
import { GlobalPlayer } from "@/components/layout/global-player";

export const metadata: Metadata = {
  title: "Dolphin Playhub",
  description: "Your personal ocean of fun",
  icons: {
    icon: [
      {
        url: `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1MTIgNTEyIj48cGF0aCBmaWxsPSIjMjJkM2VlIiBkPSJNMTIzLjIyIDQ3LjIzYzI5LjQ5OCAxNS4xNTIgNTUuMDI1IDM2LjA1IDU1LjUzIDY3LjM2NmMtOTMuNjIgODMuODY3LTgzLjg2MiAxNzkuMzU2LTk3LjAwMiAyNzAuMzRjLTY3LjY4IDU1LjU1Mi02Ny41NyA5MC45NDgtNjAuOSAxMDEuMjI3YzMuOTQuNzQzIDI5LjExLTI1Ljk0IDQ4LjMyNi0zMC4zOTdjMTQuMjMtNC4wOTQgMTIuMjg0LTE1Ljk5IDE2LjI3My0yNS4yNzVjMi40MzggMTQuNTUgNy4xNyAyMi42MTIgMTcuMTMzIDI1LjQ4NWMxMi44NzQgMy4zNiA0NC45MzIgMjguMTUgNTEuNTMgMjUuNTA0YzEuMzc0LTIwLjM4Mi0yNi4wMS02My44NTQtNDguMDI4LTkwLjA4N2M0MS4wMTItNjMuMjggODEuMzY1LTEzNi40NTggMjExLjE2Mi0yMDcuNzZjLTMuMjEtMy43MDYtNi4yMTYtNi40NS04LjgtNy45ODZsOS4xOTgtMTUuNDcyYzExLjYxNyA2LjkwNyAyMC41MjIgMTkuNTYgMjkuMjQ4IDM1LjAzM2M1OS45NCAxMC41MzIgMTEuNTI4IDIyLjY0NCAxNi45NiAzNS4xMTdjMTUuNjgyLTMyLjg3IDIyLjk4My02Ni40MDYgMTYuNDAyLTkwLjI1NGwxNy4zNS00Ljc4NmE4NyA4NyAwIDAgMSAxLjkzNyA4LjgzYzMzLjI5LTQuMjUzIDU1LjcxOC0xMy4wODMgODUuMTEtMjkuMzIyYzMuNzQ0LTIuMDY4IDE5LjA1NC0xMy4wMTItLjExNy0xNi4wM2MxMi42Mi05LjAxNyA3LjU0LTEyLjA2MyAxLjk3My0xNS4xNTJjLTYuNDg2LTMuNi0yMC4zMDItOC45NDgtMzUuNzU4LTguNTU2Yy0xMi4xMjQtMjcuODYzLTM5LjYzLTQ3Ljc3Mi04Mi4yMjUtNDcuNjk2Yy0yOC41MzIuMDUyLTYzLjg0MiA5LjA4Ni0xMDUuODI4IDMwLjY4OEMyMTcuODk1IDI3LjY0IDE2NC45MiAyMC40NjggMTIzLjIyIDQ3LjIzbTI4Ni45NDIgMjguNzRhOSA5IDAgMSAxIDAgMThhOSA5IDAgMCAxIDAtMTgiLz48L3N2Zz4=`,
        sizes: "any",
        type: "image/svg+xml"
      }
    ]
  }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>
          <I18nProvider>
            <Sidebar />
            <main className="min-h-screen md:ml-72 pb-[100px]">
              <PageTransition>{children}</PageTransition>
            </main>
            <GlobalPlayer />
          </I18nProvider>
        </Providers>
      </body>
    </html>
  );
}

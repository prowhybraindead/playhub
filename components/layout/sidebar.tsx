import Link from "next/link";
import { cookies } from "next/headers";
import { BookOpenText, Brush, Crown, LogOut, MessageCircle, Music, Sparkles, Stars, TvMinimalPlay, UserCircle2, Waves, Flag } from "lucide-react";
import { createServerSupabaseClient } from "@/lib/supabase";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { NeonBadge } from "@/components/layout/neon-badge";
import { SubscriptionPlan } from "@/types";
import { T } from "@/components/ui/t";
import { DolphinLogo } from "@/components/ui/dolphin-logo";

const navItems = [
  { href: "/music", label: "Music", icon: Music },
  { href: "/anime", label: "Anime & Manga", icon: TvMinimalPlay },
  { href: "/books", label: "Books", icon: BookOpenText },
  { href: "/f1", label: "Formula 1", icon: Flag },
  { href: "/fantasy", label: "Fantasy Universe", icon: Stars },
  { href: "/art", label: "Art & Images", icon: Brush },
  { href: "/dashboard", label: "Random Fun", icon: Sparkles },
  { href: "/chat", label: "Chat", icon: MessageCircle },
  { href: "/upgrade", label: "Upgrade", icon: Crown }
];

export async function Sidebar() {
  const cookieStore = await cookies();
  const supabase = createServerSupabaseClient(cookieStore);
  const {
    data: { user }
  } = await supabase.auth.getUser();

  const [{ data: profile }, { data: subscription }] = await Promise.all([
    user
      ? supabase.from("profiles").select("username,avatar_url,status").eq("id", user.id).maybeSingle()
      : Promise.resolve({ data: null }),
    user
      ? supabase.from("subscriptions").select("plan").eq("user_id", user.id).maybeSingle()
      : Promise.resolve({ data: null })
  ]);

  const plan = (subscription?.plan ?? "free") as SubscriptionPlan;

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 border-r border-border/60 bg-card/60 px-4 py-6 backdrop-blur md:flex md:flex-col">
      <Link href="/dashboard" className="mb-6 flex items-center gap-3 rounded-2xl border border-cyan-400/30 bg-cyan-950/40 p-3 shadow-[0_0_15px_rgba(34,211,238,0.15)] transition-all hover:shadow-[0_0_25px_rgba(34,211,238,0.3)] group">
        <div className="rounded-xl flex items-center justify-center p-1">
          <DolphinLogo className="h-8 w-8 text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)] group-hover:drop-shadow-[0_0_12px_rgba(34,211,238,1)] transition-all duration-300" />
        </div>
        <div>
          <p className="font-bold text-lg tracking-wide bg-gradient-to-r from-cyan-300 to-blue-500 bg-clip-text text-transparent drop-shadow-sm">Dolphin Playhub</p>
          <p className="text-xs text-cyan-200/70"><T>Your personal ocean of fun</T></p>
        </div>
      </Link>

      <nav className="flex-1 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="group flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-muted-foreground transition hover:bg-muted hover:text-foreground"
            >
              <Icon className="h-4 w-4 text-cyan-200 transition group-hover:text-cyan-100" />
              <span><T>{item.label}</T></span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-6 rounded-2xl border border-border/60 bg-background/70 p-3">
        <div className="mb-3 flex items-center gap-3">
          <Avatar>
            <AvatarImage src={profile?.avatar_url ?? undefined} />
            <AvatarFallback>{(profile?.username?.[0] ?? user?.email?.[0] ?? "U").toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{profile?.username ?? user?.email ?? "Guest"}</p>
            <p className="text-xs text-emerald-300">{profile?.status ?? "Online"}</p>
          </div>
        </div>
        <div className="mb-3">
          <NeonBadge plan={plan} />
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm">
            <Link href="/profile">
              <UserCircle2 className="mr-2 h-4 w-4" />
              <T>Profile</T>
            </Link>
          </Button>
          <form action="/auth/logout" method="post" className="flex-1">
            <Button variant="outline" size="sm" className="w-full" type="submit">
              <LogOut className="mr-2 h-4 w-4" />
              <T>Logout</T>
            </Button>
          </form>
        </div>
      </div>
    </aside>
  );
}

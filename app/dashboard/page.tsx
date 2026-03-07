import { cookies } from "next/headers";
import { Music2, Rocket, Sparkles, Waves } from "lucide-react";
import { Header } from "@/components/layout/header";
import { RandomFunBoard } from "@/components/fun/random-fun-board";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createServerSupabaseClient } from "@/lib/supabase";
import { T } from "@/components/ui/t";

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const supabase = createServerSupabaseClient(cookieStore);
  const {
    data: { user }
  } = await supabase.auth.getUser();

  return (
    <>
      <Header title="Random Fun" subtitle="Pokémon, NASA, pets, jokes và facts cập nhật ngẫu nhiên." />
      <div className="mx-auto grid w-full max-w-7xl gap-4 px-4 py-6 md:grid-cols-2 xl:grid-cols-4 md:px-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Waves className="h-5 w-5 text-cyan-300" />
              <T>Wave Energy</T>
            </CardTitle>
            <CardDescription><T>Daily fun score</T></CardDescription>
          </CardHeader>
          <CardContent className="text-3xl font-bold text-cyan-200">92%</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Music2 className="h-5 w-5 text-purple-300" />
              <T>Music Explorations</T>
            </CardTitle>
            <CardDescription><T>Tracks discovered today</T></CardDescription>
          </CardHeader>
          <CardContent className="text-3xl font-bold text-purple-200">18</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-cyan-300" />
              <T>Current Vibe</T>
            </CardTitle>
            <CardDescription><T>Ocean mode</T></CardDescription>
          </CardHeader>
          <CardContent className="text-xl font-semibold"><T>Neon Deep Sea</T></CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Rocket className="h-5 w-5 text-purple-300" />
              <T>Account</T>
            </CardTitle>
            <CardDescription><T>Signed in user</T></CardDescription>
          </CardHeader>
          <CardContent className="truncate text-sm text-muted-foreground">{user?.email ?? <T>Guest user</T>}</CardContent>
        </Card>
      </div>
      <RandomFunBoard />
    </>
  );
}

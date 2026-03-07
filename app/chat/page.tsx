import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Header } from "@/components/layout/header";
import { RealtimeChat } from "@/components/chat/realtime-chat";
import { createServerSupabaseClient } from "@/lib/supabase";

export default async function ChatPage({ searchParams }: { searchParams: Promise<{ room?: string }> }) {
  const cookieStore = await cookies();
  const params = await searchParams;
  const supabase = createServerSupabaseClient(cookieStore);
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth");

  return (
    <>
      <Header title="Realtime Chat" subtitle="Global hoặc room riêng với presence realtime." />
      <RealtimeChat userId={user.id} initialRoom={params.room ?? "global"} />
    </>
  );
}

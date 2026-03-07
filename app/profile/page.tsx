import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Header } from "@/components/layout/header";
import { ProfileEditor } from "@/components/profile/profile-editor";
import { createServerSupabaseClient } from "@/lib/supabase";

export default async function ProfilePage() {
  const cookieStore = await cookies();
  const supabase = createServerSupabaseClient(cookieStore);
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("username,bio,status,avatar_url,banner_url")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <>
      <Header title="Profile" subtitle="Craft your dolphin persona." />
      <ProfileEditor
        userId={user.id}
        initial={{
          username: profile?.username ?? "",
          bio: profile?.bio ?? "",
          status: profile?.status ?? "Exploring the deep ocean",
          avatar_url: profile?.avatar_url,
          banner_url: profile?.banner_url
        }}
      />
    </>
  );
}

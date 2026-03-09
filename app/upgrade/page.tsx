import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { Header } from "@/components/layout/header";
import { UpgradePage } from "@/components/subscription/upgrade-page";
import { getLocalizedPrice } from "@/lib/currency";
import { createServerSupabaseClient } from "@/lib/supabase";
import { SubscriptionPlan } from "@/types";

export default async function UpgradeRoutePage() {
  const cookieStore = await cookies();
  const supabase = createServerSupabaseClient(cookieStore);
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth");

  const headersList = await headers();
  const ip = headersList.get("x-forwarded-for")?.split(",")[0]?.trim() || headersList.get("x-real-ip");
  const countryHeader = headersList.get("x-vercel-ip-country") || headersList.get("cf-ipcountry");
  const clientInfo = { ip, countryHeader };

  const [{ data: current }, friend, neon] = await Promise.all([
    supabase.from("subscriptions").select("plan").eq("user_id", user.id).maybeSingle(),
    getLocalizedPrice(5, cookieStore, clientInfo),
    getLocalizedPrice(16, cookieStore, clientInfo)
  ]);

  return (
    <>
      <Header title="Upgrade" subtitle="Choose your fake subscription plan with local pricing." />
      <UpgradePage
        currentPlan={(current?.plan ?? "free") as SubscriptionPlan}
        prices={{
          dolphin_friend: friend,
          dolphin_neon: neon
        }}
      />
    </>
  );
}

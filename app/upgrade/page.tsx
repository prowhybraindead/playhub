import { cookies } from "next/headers";
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

  const [{ data: current }, friend, neon] = await Promise.all([
    supabase.from("subscriptions").select("plan").eq("user_id", user.id).maybeSingle(),
    getLocalizedPrice(10, cookieStore),
    getLocalizedPrice(28, cookieStore)
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

import { Badge } from "@/components/ui/badge";
import { SubscriptionPlan } from "@/types";

const planLabelMap: Record<SubscriptionPlan, string> = {
  free: "Free",
  dolphin_friend: "Dolphin Friend",
  dolphin_neon: "Dolphin Neon"
};

export function NeonBadge({ plan }: { plan: SubscriptionPlan }) {
  if (plan === "dolphin_neon") {
    return <Badge variant="neon">Neon</Badge>;
  }
  if (plan === "dolphin_friend") {
    return <Badge variant="secondary">Friend</Badge>;
  }
  return <Badge variant="outline">{planLabelMap[plan]}</Badge>;
}

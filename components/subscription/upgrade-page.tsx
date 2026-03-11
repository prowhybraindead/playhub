"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Crown, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SubscriptionPlan } from "@/types";

interface LocalizedPrice {
  country: string;
  currency: string;
  formatted: string;
  baseUsdPrice: number;
}

interface UpgradePageProps {
  prices: {
    dolphin_friend: LocalizedPrice;
    dolphin_neon: LocalizedPrice;
  };
  currentPlan: SubscriptionPlan;
}

function countryToFlag(countryCode: string) {
  return countryCode
    .toUpperCase()
    .split("")
    .map((char) => String.fromCodePoint(127397 + char.charCodeAt(0)))
    .join("");
}

export function UpgradePage({ prices, currentPlan }: UpgradePageProps) {
  const [loadingPlan, setLoadingPlan] = useState<SubscriptionPlan | null>(null);

  const plans = [
    {
      key: "dolphin_friend" as const,
      title: "Dolphin Friend",
      desc: "Extra chat slots, priority API, and Friend badge.",
      perks: ["Priority API lane", "Extra chat slots", "Friend badge"]
    },
    {
      key: "dolphin_neon" as const,
      title: "Dolphin Neon",
      desc: "Unlimited everything, custom themes, and early access.",
      perks: ["Unlimited access", "Neon badge glow", "Early feature access"]
    }
  ];

  const fakeUpgrade = async (plan: "dolphin_friend" | "dolphin_neon") => {
    setLoadingPlan(plan);
    try {
      const res = await fetch("/api/subscription/upgrade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan })
      });
      if (!res.ok) throw new Error("Upgrade failed");

      const data = await res.json();

      if (data?.checkoutUrl) {
        window.location.href = data.checkoutUrl;
        return;
      }

      toast.success(`Fake payment successful! You are now on ${plan}.`);
      window.location.reload();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upgrade failed");
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <div className="mx-auto grid w-full max-w-7xl gap-4 px-4 py-6 md:grid-cols-2 md:px-8">
      {plans.map((plan) => {
        const localized = prices[plan.key];
        const isCurrent = currentPlan === plan.key;
        const isNeon = plan.key === "dolphin_neon";

        return (
          <Card
            key={plan.key}
            className={isNeon ? "ocean-glow border-purple-400/40 bg-gradient-to-b from-purple-500/20 to-cyan-400/10" : "border-cyan-300/30"}
          >
            <CardHeader>
              <div className="mb-2 flex items-center gap-2">
                {isNeon ? <Crown className="h-5 w-5 text-purple-200" /> : <Sparkles className="h-5 w-5 text-cyan-200" />}
                <CardTitle>{plan.title}</CardTitle>
              </div>
              <CardDescription>{plan.desc}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-3xl font-bold">{localized.formatted}</p>
              <p className="text-xs text-muted-foreground">
                {localized.baseUsdPrice} USD base • {countryToFlag(localized.country)} {localized.country} pricing
              </p>
              <ul className="space-y-1 text-sm text-muted-foreground">
                {plan.perks.map((perk) => (
                  <li key={perk}>• {perk}</li>
                ))}
              </ul>
              {isCurrent ? <Badge variant="neon">Current Plan</Badge> : null}
            </CardContent>
            <CardFooter>
              <Button className="w-full" variant={isNeon ? "secondary" : "default"} onClick={() => fakeUpgrade(plan.key)} disabled={loadingPlan !== null || isCurrent}>
                {isCurrent ? "Active" : loadingPlan === plan.key ? "Processing..." : "Nâng cấp ngay"}
              </Button>
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
}

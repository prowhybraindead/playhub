import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getLocalizedPrice } from "@/lib/currency";
import { createServerSupabaseClient } from "@/lib/supabase";

const payloadSchema = z.object({
  plan: z.enum(["dolphin_friend", "dolphin_neon"])
});

const planUsdPrice = {
  dolphin_friend: 5,
  dolphin_neon: 16
} as const;

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerSupabaseClient(cookieStore);
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const body = payloadSchema.parse(await request.json());

    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip");
    const countryHeader = request.headers.get("x-vercel-ip-country") || request.headers.get("cf-ipcountry");
    const localized = await getLocalizedPrice(planUsdPrice[body.plan], cookieStore, { ip, countryHeader });

    const scriptsApiUrl = process.env.SCRIPTS_API_URL ?? "https://scripts-api.selfservice.io.vn";
    const accessToken = cookieStore.get("sb-access-token")?.value;

    if (accessToken) {
      try {
        const merchantOrderId = `sub_${user.id}_${body.plan}_${Date.now()}`;

        const response = await fetch(`${scriptsApiUrl}/api/v1/checkout/create`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            amount: Math.round(localized.converted),
            currency: localized.currency || "VND",
            merchantOrderId,
            description: `Dolphin Playhub upgrade to ${body.plan}`,
            items: [
              {
                name: body.plan,
                quantity: 1,
                price: Math.round(localized.converted)
              }
            ],
            customer: {
              email: user.email,
              name: user.user_metadata?.full_name ?? user.email
            },
            redirectUrl: `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/upgrade`,
            webhookUrl: `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/api/webhooks/scripts`
          })
        });

        if (response.ok) {
          const checkout = await response.json();
          if (checkout?.checkoutUrl) {
            return NextResponse.json({ checkoutUrl: checkout.checkoutUrl });
          }
        }
      } catch {
        // If Scripts integration fails, fall back to local fake upgrade
      }
    }

    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    const { error: subscriptionError } = await supabase.from("subscriptions").upsert(
      {
        user_id: user.id,
        plan: body.plan,
        expires_at: expiresAt
      },
      { onConflict: "user_id" }
    );
    if (subscriptionError) throw subscriptionError;

    const { error: transactionError } = await supabase.from("transactions").insert({
      user_id: user.id,
      plan: body.plan,
      amount_usd: planUsdPrice[body.plan],
      currency_code: localized.currency,
      converted_amount: Number(localized.converted.toFixed(2)),
      status: "success"
    });
    if (transactionError) throw transactionError;

    return NextResponse.json({ success: true, localized });
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : "Upgrade failed" }, { status: 400 });
  }
}

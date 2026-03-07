import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getLocalizedPrice } from "@/lib/currency";
import { createServerSupabaseClient } from "@/lib/supabase";

const payloadSchema = z.object({
  plan: z.enum(["dolphin_friend", "dolphin_neon"])
});

const planUsdPrice = {
  dolphin_friend: 10,
  dolphin_neon: 28
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
    const localized = await getLocalizedPrice(planUsdPrice[body.plan], cookieStore);
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

import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { createServiceSupabaseClient } from "@/lib/supabase";

export const runtime = "nodejs";

type ScriptsWebhookEvent = {
  id: string;
  type: string;
  timestamp: string;
  data: {
    transactionId: string;
    merchantOrderId: string;
    checkoutId: string;
    amount: number;
    currency: string;
    paymentMethod: string;
    status: string;
    completedAt?: string;
  };
};

function verifyWebhookSignature(payload: string, signature: string | null, secret: string) {
  if (!signature) return false;

  const hash = crypto.createHmac("sha256", secret).update(payload).digest("hex");
  return hash === signature;
}

export async function POST(req: NextRequest) {
  const secret = process.env.SCRIPTS_WEBHOOK_SECRET;

  if (!secret) {
    return NextResponse.json({ message: "Webhook secret not configured" }, { status: 500 });
  }

  const signature = req.headers.get("x-webhook-signature");
  const rawBody = await req.text();

  if (!verifyWebhookSignature(rawBody, signature, secret)) {
    return NextResponse.json({ message: "Invalid signature" }, { status: 401 });
  }

  let event: ScriptsWebhookEvent;

  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ message: "Invalid JSON payload" }, { status: 400 });
  }

  const cookieStore = {
    getAll: () => [],
    set: () => {}
  };

  const supabase = createServiceSupabaseClient(cookieStore);

  try {
    switch (event.type) {
      case "payment.success": {
        const { merchantOrderId, amount, currency } = event.data;

        if (!merchantOrderId.startsWith("sub_")) {
          break;
        }

        const parts = merchantOrderId.split("_");

        if (parts.length < 4) {
          break;
        }

        const userId = parts[1];
        const plan = parts[2] as "dolphin_friend" | "dolphin_neon";

        if (plan !== "dolphin_friend" && plan !== "dolphin_neon") {
          break;
        }

        const planUsdPrice: Record<"dolphin_friend" | "dolphin_neon", number> = {
          dolphin_friend: 5,
          dolphin_neon: 16
        };

        const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

        const { error: subscriptionError } = await supabase.from("subscriptions").upsert(
          {
            user_id: userId,
            plan,
            expires_at: expiresAt
          },
          { onConflict: "user_id" }
        );

        if (subscriptionError) {
          throw subscriptionError;
        }

        const { error: transactionError } = await supabase.from("transactions").insert({
          user_id: userId,
          plan,
          amount_usd: planUsdPrice[plan],
          currency_code: currency || "VND",
          converted_amount: amount,
          status: "success"
        });

        if (transactionError) {
          throw transactionError;
        }

        break;
      }

      default: {
        // Ignore other event types for now
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Webhook processing failed" },
      { status: 500 }
    );
  }
}


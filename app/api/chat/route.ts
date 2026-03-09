import { NextRequest, NextResponse } from "next/server";
import { env } from "@/lib/env";
import { createServerClient } from "@supabase/ssr";

export async function POST(req: NextRequest) {
  try {
    const { room_id, prompt } = await req.json();

    if (!room_id || !prompt) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!env.OPENROUTER_API_KEY_2) {
      return NextResponse.json({ error: "OPENROUTER_API_KEY_2 is not configured" }, { status: 500 });
    }

    // Quick instruction for the AI
    const systemInstruction = "You are a friendly, helpful, and concise chat companion inside a live chat room on the platform Dolphin Playhub. Respond directly to the user's prompt in the language they used. Keep it relatively short and conversational (1-3 small paragraphs max). You love discussing Formula 1 racing, F1 telemetry, motorsports, as well as anime, music, and art. You have expert knowledge on F1.";

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${env.OPENROUTER_API_KEY_2}`,
        "HTTP-Referer": env.NEXT_PUBLIC_APP_URL,
        "X-Title": "Dolphin Playhub",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "z-ai/glm-4.5-air:free",
        messages: [
          { role: "system", content: systemInstruction },
          { role: "user", content: prompt }
        ],
        temperature: 0.7,
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenRouter API Error:", errorText);
      return NextResponse.json({ error: "API Error", details: errorText }, { status: response.status });
    }

    const data = await response.json();
    const replyText = data.choices?.[0]?.message?.content || "Hello! I am your chat companion. I couldn't process your request right now.";

    // Create a service level client to bypass RLS for bot insertions
    let supabaseAdmin;
    if (env.SUPABASE_SERVICE_ROLE_KEY) {
      supabaseAdmin = createServerClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
        cookies: {
          getAll() {
            return [];
          },
          setAll() {}
        }
      });
    } else {
      throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY for bot messaging");
    }

    const { error } = await supabaseAdmin
      .from("chat_messages")
      .insert({
        user_id: null, // Indicates System/Bot message
        room_id,
        message: replyText
      });

    if (error) {
       console.error("Supabase insert error for chat bot:", error);
       throw error;
    }

    return NextResponse.json({ success: true, message: replyText });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json({ error: "Chat processing failed" }, { status: 500 });
  }
}

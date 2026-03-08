import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { env } from "@/lib/env";
import { createServerClient } from "@supabase/ssr";

export async function POST(req: NextRequest) {
  try {
    const { room_id, prompt } = await req.json();

    if (!room_id || !prompt) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!env.GEMINI_API_KEY) {
      return NextResponse.json({ error: "GEMINI_API_KEY is not configured" }, { status: 500 });
    }

    const ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
    
    // Quick instruction for Gemini
    const systemInstruction = "You are a friendly, helpful, and concise chat companion inside a live chat room on the platform Dolphin Playhub. Respond directly to the user's prompt in the language they used. Keep it relatively short and conversational (1-3 small paragraphs max). You love discussing anime, music, and art.";

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction,
      }
    });

    const replyText = response.text || "Hello! I am Gemini. I couldn't process your request right now.";

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

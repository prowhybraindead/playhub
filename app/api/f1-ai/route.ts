import { NextRequest, NextResponse } from "next/server";
import { env } from "@/lib/env";

export async function POST(req: NextRequest) {
  try {
    const { prompt, context } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: "Missing prompt" }, { status: 400 });
    }

    const systemPrompt = `You are an expert Formula 1 race commentator and analyst AI embedded in a live F1 dashboard application called "Dolphin Playhub". 

Your role:
- When given race context data (driver standings, lap times, pit stops), provide insightful, exciting commentary in the style of a professional F1 broadcast.
- Keep responses concise (2-4 sentences max) but impactful and informative.
- Use racing terminology naturally.
- If the user asks a specific question, answer it directly and accurately.
- Respond in the same language the user writes in (Vietnamese or English).
- Include relevant emoji sparingly for visual flair (🏎️ 🏁 🔴 🟢 etc.)

Current race context (if available):
${context || "No live race data available currently."}`;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "nvidia/nemotron-3-nano-30b-a3b:free",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt }
        ],
        max_tokens: 300
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("OpenRouter F1 AI Error:", response.status, errText);
      return NextResponse.json({ error: "AI request failed", details: errText }, { status: response.status });
    }

    const result = await response.json();
    const aiMessage = result.choices?.[0]?.message?.content || "No response from AI.";

    return NextResponse.json({ message: aiMessage });
  } catch (error: any) {
    console.error("F1 AI Route Error:", error);
    return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
  }
}

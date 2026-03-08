import { NextRequest, NextResponse } from "next/server";
import { env } from "@/lib/env";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { prompt, context } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: "Missing prompt" }, { status: 400 });
    }

    const systemInstruction = `You are an expert Formula 1 race commentator and analyst AI embedded in a live F1 dashboard application called "Dolphin Playhub". 

Your role:
- You have access to Google Search. You MUST search the web for the latest real-world Formula 1 news, schedules, and live race updates to answer questions or provide commentary.
- Provide insightful, exciting commentary in the style of a professional F1 broadcast.
- Keep responses concise (2-4 sentences max) but impactful and informative.
- Use racing terminology naturally.
- If the user asks a specific question, answer it directly and accurately.
- Respond in the same language the user writes in (Vietnamese or English).
- Include relevant emoji sparingly for visual flair (🏎️ 🏁 🔴 🟢 etc.)

Current Real-time Context:
${context || "No live race data available currently."}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: String(prompt),
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
        tools: [{ googleSearch: {} }],
      }
    });

    const aiMessage = response.text || "No response from AI.";

    return NextResponse.json({ message: aiMessage });
  } catch (error: any) {
    console.error("F1 AI Route Error:", error);
    return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
  }
}

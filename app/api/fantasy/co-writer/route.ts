import { NextRequest, NextResponse } from "next/server";
import { env } from "@/lib/env";

export async function POST(req: NextRequest) {
  try {
    const { prompt, storyContext, universe, language } = await req.json();
    const activeLanguage = language === "vi" ? "Vietnamese" : "English";

    if (!prompt) {
      return NextResponse.json({ error: "Missing prompt" }, { status: 400 });
    }

    const systemInstruction = `You are a creative co-writer AI embedded in an interactive fantasy application called "Dolphin Playhub".

Your task is to continue the story, add descriptive lore, or create dialogue based on the user's prompt. 
Universe focus: ${universe || "General Fantasy"}

Guidelines:
- Maintain the tone appropriate for the selected universe (e.g., dark and political for Game of Thrones, epic and sweeping for Lord of the Rings, sci-fi/mystical for Star Wars or Dune).
- Write 1-2 short paragraphs maximum. Be highly descriptive but punchy to keep the user engaged.
- If the user provides "storyContext", ensure your response naturally follows it.
- IMPORTANT: You MUST respond EXCLUSIVELY in ${activeLanguage}. Do not translate or mention the translation process, just output your final story continuation directly in ${activeLanguage}.

Previous Story Context:
${storyContext ? storyContext.slice(-1000) : "No previous context. This is the beginning of the tale."}`;

    // Priority list of models requested by the user for creative writing
    const fallbackModels = [
      "google/gemini-2.5-pro",
      "openai/gpt-4o-mini",
      "anthropic/claude-3.5-sonnet:beta"
    ];

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${env.OPENROUTER_API_KEY_1}`,
        "HTTP-Referer": env.NEXT_PUBLIC_APP_URL,
        "X-Title": "Dolphin Playhub - Fantasy Co-writer",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        models: fallbackModels, 
        messages: [
          { role: "system", content: systemInstruction },
          { role: "user", content: prompt }
        ],
        temperature: 0.85, // Higher temp for more creative writing
        max_tokens: 350
      })
    });

    if (!response.ok) {
        // Fallback to local / mock if openrouter fails
        return NextResponse.json({ message: "As the hero stepped forward, the magic faded. (Error: The AI scribe is currently resting)." });
    }

    const data = await response.json();
    const aiMessage = data.choices?.[0]?.message?.content || "The ink blurs on the page... [No response from AI]";

    return NextResponse.json({ message: aiMessage });
  } catch (error: any) {
    console.error("Fantasy Co-writer Route Error:", error);
    return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
  }
}

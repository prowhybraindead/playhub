import { NextRequest, NextResponse } from "next/server";
import { env } from "@/lib/env";

export async function POST(req: NextRequest) {
  try {
    const { prompt, context, language } = await req.json();
    const activeLanguage = language === "vi" ? "Vietnamese" : "English";

    if (!prompt) {
      return NextResponse.json({ error: "Missing prompt" }, { status: 400 });
    }

    // 1. Attempt to parse Year and Round from the context string
    // e.g., "Analyzing race: 2024 Chinese Grand Prix (Round 5)"
    let explicitRaceData = "";
    try {
      if (context && context.includes("Analyzing race:")) {
        const yearMatch = context.match(/(\d{4})/);
        const roundMatch = context.match(/Round (\d+)/);
        if (yearMatch && roundMatch) {
          const year = yearMatch[1];
          const round = roundMatch[1];
          
          // Fetch exact factual data from Jolpi/Ergast
          const f1Res = await fetch(`https://api.jolpi.ca/ergast/f1/${year}/${round}/results.json`);
          if (f1Res.ok) {
            const f1Data = await f1Res.json();
            const raceDetails = f1Data.MRData?.RaceTable?.Races?.[0];
            if (raceDetails) {
              // Simplify the data payload so the AI doesn't choke on token limits
              const simplifiedResults = raceDetails.Results?.map((r: any) => ({
                pos: r.position,
                driver: `${r.Driver.givenName} ${r.Driver.familyName}`,
                team: r.Constructor.name,
                points: r.points,
                status: r.status,
                grid: r.grid
              }));
              
              explicitRaceData = `
FACTUAL DATA OVERRIDE - YOU MUST USE THIS DATA TO ANSWER QUESTIONS:
Race: ${raceDetails.season} ${raceDetails.raceName}
Circuit: ${raceDetails.Circuit.circuitName}
Official Results (Top 10+):
${JSON.stringify(simplifiedResults?.slice(0, 15), null, 2)}
              `;
            }
          }
        }
      }
    } catch (e) {
      console.error("Failed to fetch grounding F1 data", e);
    }

    const systemInstruction = `You are an expert Formula 1 race commentator and analyst AI embedded in a live F1 dashboard application called "Dolphin Playhub". 

Your role:
- Provide insightful, exciting commentary in the style of a professional F1 broadcast.
- Keep responses concise (2-4 sentences max) but impactful and informative.
- Use racing terminology naturally.
- If the user asks a specific question about a race, YOU MUST answer it accurately based ONLY on the factual data provided below. Do not guess or hallucinate statistics.
- IMPORTANT LANGUAGE INSTRUCTION: You MUST respond EXCLUSIVELY in ${activeLanguage}. Do not translate or mention the translation process, just output your final answer directly in ${activeLanguage}.
- Include relevant emoji sparingly for visual flair (🏎️ 🏁 🔴 🟢 etc.)

User's current view: 
${context || "No specific race selected."}

${explicitRaceData}`;

    // Priority list of models requested by the user
    // OpenRouter supports passing an array of models for automatic fallback starting with the first
    // Note: OpenRouter API limits this array to a maximum of 3 items.
    const fallbackModels = [
      "z-ai/glm-4.5-air:free",
      "openai/gpt-oss-120b:free",
      "arcee-ai/trinity-large-preview:free"
    ];

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${env.OPENROUTER_API_KEY_1}`,
        "HTTP-Referer": env.NEXT_PUBLIC_APP_URL, // Optional, for including your app on openrouter.ai rankings.
        "X-Title": "Dolphin Playhub", // Optional. Shows in rankings on openrouter.ai.
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        models: fallbackModels, 
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
    const aiMessage = data.choices?.[0]?.message?.content || "No response from AI.";

    return NextResponse.json({ message: aiMessage });
  } catch (error: any) {
    console.error("F1 AI Route Error:", error);
    return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
  }
}

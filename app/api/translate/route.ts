import { NextRequest, NextResponse } from "next/server";
import { env } from "@/lib/env";
import { createClient } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const { texts, targetLanguage } = await req.json();

    if (!Array.isArray(texts) || texts.length === 0 || !targetLanguage) {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    if (!env.OPENROUTER_API_KEY) {
      // If no API key is set, log and return original texts
      console.warn("OPENROUTER_API_KEY is not set. Returning original texts.");
      return NextResponse.json({ translations: texts });
    }

    const supabase = await createClient();
    
    // Step 1: Check Database Cache
    const { data: cached } = await supabase
      .from("i18n_translations")
      .select("original_text, translated_text")
      .eq("target_language", targetLanguage)
      .in("original_text", texts);

    const cacheMap = new Map<string, string>();
    if (cached) {
      cached.forEach((row: { original_text: string; translated_text: string }) => {
        cacheMap.set(row.original_text, row.translated_text);
      });
    }

    const missingTexts: string[] = [];
    const missingIndices: number[] = [];
    
    texts.forEach((text: string, index: number) => {
      if (!cacheMap.has(text)) {
        missingTexts.push(text);
        missingIndices.push(index);
      }
    });

    // Array to hold the final translations, initialized with the original texts
    const finalTranslations = [...texts];

    // Populate final array with cached results
    texts.forEach((text: string, index: number) => {
      if (cacheMap.has(text)) {
        finalTranslations[index] = cacheMap.get(text)!;
      }
    });

    if (missingTexts.length === 0) {
      // All texts were in cache!
      console.log(`[i18n] Cache hit for all ${texts.length} texts (${targetLanguage})`);
      return NextResponse.json({ translations: finalTranslations });
    }

    console.log(`[i18n] Cache hit for ${texts.length - missingTexts.length}, fetching ${missingTexts.length} from OpenRouter Nemotron`);

    // Step 2: Fetch missing from OpenRouter (Nemotron)
    const prompt = `Translate the following JSON array of strings exactly into exactly ${targetLanguage}. 
Maintain the structure and do not translate technical terms, UI variables enclosed in brackets or Markdown formatting.
Strings to translate:
${JSON.stringify(missingTexts)}

Respond ONLY with a valid JSON array of strings matching the input length.`;

    const openRouterRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        "model": "nvidia/nemotron-3-nano-30b-a3b:free",
        "messages": [
          {
            "role": "user",
            "content": prompt
          }
        ]
      })
    });

    if (!openRouterRes.ok) {
      throw new Error(`OpenRouter API failed: ${openRouterRes.statusText}`);
    }

    const openRouterData = await openRouterRes.json();
    let outputText = openRouterData.choices?.[0]?.message?.content || "[]";
    
    // Sometimes models wrap JSON in markdown blocks like ```json ... ```
    if (outputText.startsWith("\`\`\`json")) {
       outputText = outputText.replace(/^\`\`\`json\s*/, "").replace(/\s*\`\`\`$/, "");
    } else if (outputText.startsWith("\`\`\`")) {
       outputText = outputText.replace(/^\`\`\`\s*/, "").replace(/\s*\`\`\`$/, "");
    }

    let translatedMissingTexts;
    try {
      translatedMissingTexts = JSON.parse(outputText);
    } catch (parseError) {
      console.error("Failed to parse OpenRouter response:", outputText);
      throw new Error("Translation output mismatch (Invalid JSON)");
    }

    if (!Array.isArray(translatedMissingTexts) || translatedMissingTexts.length !== missingTexts.length) {
      throw new Error("Translation output mismatch");
    }

    // Step 3: Map AI results back and save to Database Cache
    const newDbEntries: any[] = [];
    missingIndices.forEach((originalIndex, i) => {
      finalTranslations[originalIndex] = translatedMissingTexts[i];
      newDbEntries.push({
        original_text: missingTexts[i],
        translated_text: translatedMissingTexts[i],
        target_language: targetLanguage
      });
    });

    if (newDbEntries.length > 0) {
       // Insert new translations, ignore on conflict so we don't crash
       await supabase.from("i18n_translations").upsert(newDbEntries, { 
         onConflict: 'original_text,target_language',
         ignoreDuplicates: true 
       });
    }

    return NextResponse.json({ translations: finalTranslations });
  } catch (error) {
    console.error("Translation error:", error);
    return NextResponse.json({ error: "Translation failed" }, { status: 500 });
  }
}

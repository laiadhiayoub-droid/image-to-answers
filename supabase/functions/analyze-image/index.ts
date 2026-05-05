// deno-lint-ignore-file no-explicit-any
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `You are an expert image analysis assistant similar to Snippai. Analyze the provided image and extract structured data.

Return ONLY valid JSON (no markdown fences) with this exact shape:
{
  "description": "A concise analytical description of what the image contains (2-4 sentences).",
  "ocrText": "All visible text extracted from the image, preserving line breaks and formatting. If the image contains code, preserve indentation. Empty string if no text.",
  "isCode": boolean,
  "codeLanguage": "detected programming language or null",
  "latex": "LaTeX source for any math formula detected, or empty string",
  "tableMarkdown": "If a table is present, render it as a Markdown table. Empty string otherwise.",
  "tableJson": [ /* array of row objects if a table is present, else [] */ ],
  "colors": [ { "hex": "#RRGGBB", "name": "short descriptive name" } ]  // 3-6 dominant colors
}

Be accurate. If a field is not applicable, return empty string / empty array / false / null as specified.`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { imageBase64, mimeType, targetLanguage } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    if (targetLanguage && typeof targetLanguage === "object" && targetLanguage.translateText) {
      // Translation mode
      const { text, language } = targetLanguage;
      const tRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: `You are a professional translator. Translate the user's text to ${language}. Return only the translation, no commentary. Preserve code blocks and formatting.` },
            { role: "user", content: text },
          ],
        }),
      });
      if (!tRes.ok) {
        const errText = await tRes.text();
        return new Response(JSON.stringify({ error: errText }), { status: tRes.status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      const tData = await tRes.json();
      const translation = tData.choices?.[0]?.message?.content ?? "";
      return new Response(JSON.stringify({ translation }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (!imageBase64) throw new Error("imageBase64 is required");

    const dataUrl = `data:${mimeType || "image/png"};base64,${imageBase64}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: [
              { type: "text", text: "Analyze this image and return the JSON as specified." },
              { type: "image_url", image_url: { url: dataUrl } },
            ],
          },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("AI gateway error", response.status, errText);
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "تم تجاوز حد الاستخدام، حاول لاحقاً." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "نفدت أرصدة الذكاء الاصطناعي. يرجى إضافة رصيد." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      return new Response(JSON.stringify({ error: "AI gateway error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const data = await response.json();
    const content: string = data.choices?.[0]?.message?.content ?? "{}";
    let parsed: any;
    try {
      parsed = JSON.parse(content);
    } catch {
      const match = content.match(/\{[\s\S]*\}/);
      parsed = match ? JSON.parse(match[0]) : {};
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("analyze-image error", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

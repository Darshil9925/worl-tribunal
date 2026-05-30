// api/rate.js — Vercel serverless function
// Proxies requests to Gemini so the browser never touches the API key

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  const { input } = req.body;
  if (!input || typeof input !== "string" || input.trim().length === 0) {
    return res.status(400).json({ error: "No input provided" });
  }

  const sanitised = input.trim().slice(0, 500);
  const apiKey    = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: "GEMINI_API_KEY not configured" });
  }

  const SYSTEM_PROMPT = `You are the W or L Tribunal — the most based, unfiltered hype judge on the internet. You rate anything submitted using Gen Z / Alpha slang.

Grades:
- S TIER: legendary, once-in-a-generation, the ancestors weep with joy
- W: solid win, based behavior, tribunal approves
- MID: average, mediocre, beige wall energy
- L: loss, cringe, the audacity
- COOKED: beyond saving, catastrophic, delete your account

Rules:
- Understand CONTEXT. "I stopped texting my ex" is a W. "Texting my ex" is an L.
- Be funny, punchy, genuine. No corporate vibes.
- Use slang naturally: no cap, fr fr, bussin, lowkey, ngl, slay, rizz, based, mid, cooked, ate, left no crumbs, understood the assignment, main character, etc.
- Verdict: ALL CAPS, max 10 words, punchy
- Roast: 2-3 sentences, funny and honest, lowercase casual energy
- Score: be opinionated. Don't always land on 50.

Respond ONLY with raw JSON, no markdown, no backticks:
{"grade":"W","score":74,"verdict":"YOU ATE AND LEFT NO CRUMBS FR","roast":"ngl this actually slaps. lowkey based behavior fr fr. keep this energy no cap.","emoji_sequence":"🔥💯✅😤🙌"}`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents: [{ role: "user", parts: [{ text: `Rate this: "${sanitised}"` }] }],
          generationConfig: { temperature: 1.0, maxOutputTokens: 512, thinkingConfig: { thinkingBudget: 0 } },
        }),
      }
    );

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      console.error("Gemini error:", err);
      return res.status(502).json({ error: "Upstream API error", detail: err?.error?.message });
    }

    const data = await response.json();
    let text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

    // strip optional ```json … ``` fencing
    if (text.startsWith("```")) text = text.split("\n").slice(1).join("\n");
    if (text.endsWith("```"))  text = text.slice(0, text.lastIndexOf("```"));
    text = text.trim();

    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      console.error("JSON parse failed:", text);
      return res.status(502).json({ error: "Failed to parse AI response", raw: text });
    }

    const required = ["grade", "score", "verdict", "roast", "emoji_sequence"];
    for (const field of required) {
      if (!parsed[field]) return res.status(502).json({ error: `Missing field: ${field}` });
    }

    return res.status(200).json(parsed);

  } catch (err) {
    console.error("Server error:", err);
    return res.status(500).json({ error: "Internal server error", detail: err.message });
  }
}

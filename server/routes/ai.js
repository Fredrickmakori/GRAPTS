const express = require("express");
const router = express.Router();

// Simple helper to call OpenAI Chat Completions via fetch
const OPENAI_KEY = process.env.OPENAI_API_KEY;
const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";

if (!OPENAI_KEY) {
  console.warn(
    "Warning: OPENAI_API_KEY not set. AI endpoints will fail until it is configured."
  );
}

async function callOpenAI(messages, max_tokens = 500) {
  if (!OPENAI_KEY) throw new Error("OPENAI_API_KEY not configured");
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_KEY}`,
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      messages,
      temperature: 0.2,
      max_tokens,
    }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`OpenAI error: ${res.status} ${body}`);
  }
  const data = await res.json();
  return data;
}

// POST /api/ai/project-summary
// Body: { project: { ... } }
router.post("/project-summary", async (req, res) => {
  const { project } = req.body;
  if (!project) return res.status(400).json({ error: "project is required" });

  const prompt =
    `You are an expert analyst for Kenyan public projects. Given the following project JSON, return a JSON object with these keys:\n- "when": estimated implementation period or year (short string)\n- "why": short explanation of the purpose and objectives\n- "where": county or location and coordinates if present (string)\n- "category": one of ["national", "county", "ngo", "private", "other"]\n- "short_summary": a 1-2 sentence plain-language summary\n- "tags": an array of short tags (max 6)\nReturn ONLY valid JSON. Here is the project:\n` +
    JSON.stringify(project, null, 2);

  try {
    const openaiRes = await callOpenAI(
      [{ role: "user", content: prompt }],
      400
    );
    const content = openaiRes.choices?.[0]?.message?.content || "";
    // Try to parse JSON from response
    let parsed = null;
    try {
      parsed = JSON.parse(content);
    } catch (err) {
      // attempt to extract JSON substring
      const m = content.match(/\{[\s\S]*\}/);
      if (m) parsed = JSON.parse(m[0]);
    }
    if (!parsed)
      return res
        .status(500)
        .json({ error: "Could not parse OpenAI response", raw: content });
    return res.json({ result: parsed, raw: content });
  } catch (err) {
    console.error("AI summary error", err.message);
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/ai/classify
// Body: { project }
// Return: category classification and confidence
router.post("/classify", async (req, res) => {
  const { project } = req.body;
  if (!project) return res.status(400).json({ error: "project is required" });
  const prompt = `Classify the following Kenyan government project into one category: national, county, ngo, private, other. Respond with JSON: {"category":"...","confidence":0.0}. Project:\n${JSON.stringify(
    project
  )}`;
  try {
    const openaiRes = await callOpenAI(
      [{ role: "user", content: prompt }],
      150
    );
    const content = openaiRes.choices?.[0]?.message?.content || "";
    let parsed = null;
    try {
      parsed = JSON.parse(content);
    } catch (e) {
      const m = content.match(/\{[\s\S]*\}/);
      if (m) parsed = JSON.parse(m[0]);
    }
    if (!parsed)
      return res
        .status(500)
        .json({ error: "Could not parse OpenAI response", raw: content });
    return res.json({ result: parsed, raw: content });
  } catch (err) {
    console.error("AI classify error", err.message);
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;

// Streaming endpoint using the `ai` package (streamText). Accepts { prompt, model? }
router.post("/stream", async (req, res) => {
  const { prompt, model } = req.body;
  if (!prompt) return res.status(400).json({ error: "prompt is required" });

  try {
    // dynamic import to remain compatible with CommonJS project
    const mod = await import("ai");
    const { streamText } = mod;
    const result = streamText({
      model: model || process.env.OPENAI_MODEL || "openai/gpt-4.1",
      prompt,
    });

    let text = "";
    for await (const part of result.textStream) {
      // accumulate streamed parts; we don't stream to client here
      text += part;
    }

    const usage = await result.usage;
    const finishReason = await result.finishReason;

    return res.json({ text, usage, finishReason });
  } catch (err) {
    console.error("AI stream error", err);
    return res.status(500).json({ error: err.message });
  }
});

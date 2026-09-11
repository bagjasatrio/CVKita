export interface LLMRequestOptions {
  prompt: string;
  apiKey?: string;
  provider?: "gemini" | "openai" | "heuristic";
  systemInstruction?: string;
  temperature?: number;
}

export async function callLiveLLM(options: LLMRequestOptions): Promise<string> {
  const { prompt, apiKey, provider = "gemini", systemInstruction, temperature = 0.2 } = options;

  if (!apiKey) {
    throw new Error("No API key provided for live LLM execution.");
  }

  if (provider === "openai") {
    return callOpenAI({ prompt, apiKey, systemInstruction, temperature });
  }

  return callGemini({ prompt, apiKey, systemInstruction, temperature });
}

async function callGemini(options: {
  prompt: string;
  apiKey: string;
  systemInstruction?: string;
  temperature: number;
}): Promise<string> {
  const { prompt, apiKey, systemInstruction, temperature } = options;
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  const contents: any[] = [];
  if (systemInstruction) {
    contents.push({
      role: "user",
      parts: [{ text: `SYSTEM CONSTRAINTS:\n${systemInstruction}` }],
    });
  }
  contents.push({
    role: "user",
    parts: [{ text: prompt }],
  });

  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents,
      generationConfig: {
        temperature,
        responseMimeType: "application/json",
      },
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gemini API Error (${res.status}): ${errText}`);
  }

  const data = await res.json();
  const textOutput = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!textOutput) {
    throw new Error("Gemini returned empty candidate content.");
  }
  return textOutput;
}

async function callOpenAI(options: {
  prompt: string;
  apiKey: string;
  systemInstruction?: string;
  temperature: number;
}): Promise<string> {
  const { prompt, apiKey, systemInstruction, temperature } = options;
  const endpoint = "https://api.openai.com/v1/chat/completions";

  const messages: any[] = [];
  if (systemInstruction) {
    messages.push({ role: "system", content: systemInstruction });
  }
  messages.push({ role: "user", content: prompt });

  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages,
      temperature,
      response_format: { type: "json_object" },
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`OpenAI API Error (${res.status}): ${errText}`);
  }

  const data = await res.json();
  const textOutput = data?.choices?.[0]?.message?.content;
  if (!textOutput) {
    throw new Error("OpenAI returned empty message content.");
  }
  return textOutput;
}

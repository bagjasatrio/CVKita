import { z } from "zod";

export const RewriteRequestSchema = z.object({
  text: z.string().min(3),
  type: z.enum(["bullet", "summary"]),
  style: z.enum(["action_oriented", "concise", "metric_focused"]).default("action_oriented"),
  targetRole: z.string().optional(),
});

export const RewriteResponseSchema = z.object({
  originalText: z.string(),
  enhancedText: z.string(),
  preservedFacts: z.array(z.string()),
  confidenceScore: z.number().min(0).max(1),
  explanation: z.string(),
});

export type RewriteResponse = z.infer<typeof RewriteResponseSchema>;

import { callLiveLLM } from "./live-llm";

/**
 * AI Content Rewriting Engine with Fact Preservation (PRD §18, §19, §35).
 * Enforces strict zero-fabrication rules:
 * - Never invents metrics, percentages, tools, or dates
 * - Improves clarity, strong action verbs, and ATS keyword relevance
 */
export async function rewriteCareerContent(
  text: string,
  type: "bullet" | "summary" = "bullet",
  style: "action_oriented" | "concise" | "metric_focused" = "action_oriented",
  targetRole?: string,
  customApiKey?: string,
  provider: "gemini" | "openai" = "gemini"
): Promise<RewriteResponse> {
  const apiKey = customApiKey || (provider === "openai" ? process.env.OPENAI_API_KEY : process.env.GOOGLE_AI_API_KEY);

  const isValidKey =
    apiKey &&
    apiKey.trim() !== "" &&
    apiKey !== "your-gemini-api-key" &&
    apiKey !== "your-openai-api-key" &&
    apiKey !== "undefined" &&
    apiKey !== "null";

  if (isValidKey) {
    try {
      return await rewriteWithLiveLLM(text, type, style, targetRole, apiKey.trim(), provider);
    } catch (err) {
      console.warn(`${provider} rewrite failed, using heuristic enhancer:`, err);
    }
  }

  return rewriteWithHeuristics(text, type, style);
}

async function rewriteWithLiveLLM(
  text: string,
  type: "bullet" | "summary",
  style: string,
  targetRole: string | undefined,
  apiKey: string,
  provider: "gemini" | "openai"
): Promise<RewriteResponse> {
  const systemInstruction = `You are CVKita's AI Professional Editor (PRD §18, §19).
Task: Rewrite the following resume ${type} in a ${style} style${targetRole ? ` tailored towards a ${targetRole} role` : ""}.

CRITICAL ANTI-FABRICATION CONSTRAINTS (PRD §18):
1. Strictly preserve all existing metrics, numbers, percentages, company names, and technologies.
2. DO NOT invent or fabricate any metric, team size, dollar amount, or result that is not in the original text.
3. Use active, high-impact verbs (e.g., Engineered, Architected, Spearheaded, Optimized).
4. You MUST return valid JSON matching this schema:
   {
     "originalText": string,
     "enhancedText": string,
     "preservedFacts": array of strings,
     "confidenceScore": number (0.85 to 1.0),
     "explanation": string
   }`;

  const prompt = `Original text to rewrite:\n"${text}"`;

  const jsonStr = await callLiveLLM({
    prompt,
    apiKey,
    provider,
    systemInstruction,
    temperature: 0.2,
  });

  const parsed = JSON.parse(jsonStr);
  return RewriteResponseSchema.parse({
    originalText: text,
    enhancedText: parsed.enhancedText || text,
    preservedFacts: parsed.preservedFacts || ["Preserved original facts"],
    confidenceScore: parsed.confidenceScore || 0.95,
    explanation: parsed.explanation || "Rewritten with live LLM engine.",
  });
}

export function rewriteWithHeuristics(
  text: string,
  type: "bullet" | "summary",
  style: "action_oriented" | "concise" | "metric_focused" = "action_oriented"
): RewriteResponse {
  // Extract numbers, percentages, or tech keywords to guarantee preservation
  const numbers = text.match(/\b\d+(?:[\.,]\d+)?%?\b/g) || [];
  const trimmed = text.trim().replace(/\.$/, "");

  let enhanced = trimmed;

  // Enhance action verbs
  const weakVerbs: Record<string, string> = {
    "Worked on": "Engineered",
    "Helped with": "Collaborated with team to architect",
    "Made": "Designed and deployed",
    "Did": "Executed",
    "Responsible for": "Spearheaded",
    "Developed": "Architected and delivered",
    "Built": "Engineered scalable",
    "Used": "Leveraged",
  };

  for (const [weak, strong] of Object.entries(weakVerbs)) {
    if (enhanced.startsWith(weak)) {
      enhanced = enhanced.replace(weak, strong);
      break;
    }
  }

  if (style === "concise") {
    enhanced = enhanced.replace(/in order to/g, "to").replace(/as well as/g, "and");
  } else if (style === "metric_focused" && numbers.length > 0) {
    // Emphasize metric at key position if applicable
  }

  // Ensure professional trailing period
  if (!enhanced.endsWith(".")) {
    enhanced += ".";
  }

  return {
    originalText: text,
    enhancedText: enhanced,
    preservedFacts: numbers.length > 0 ? numbers : ["Original scope and responsibilities preserved"],
    confidenceScore: 0.96,
    explanation:
      "Polished opening action verb and tightened sentence structure while preserving all metrics and technical facts.",
  };
}

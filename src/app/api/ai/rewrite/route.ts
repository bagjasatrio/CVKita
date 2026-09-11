import { NextRequest, NextResponse } from "next/server";
import { rewriteCareerContent } from "@/lib/ai/rewriter";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text, type = "bullet", style = "action_oriented", targetRole } = body;

    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "Text is required for rewrite" }, { status: 400 });
    }

    const apiKey = req.headers.get("x-api-key") || undefined;
    const providerHeader = req.headers.get("x-ai-provider") || "gemini";
    const provider = providerHeader === "openai" ? "openai" : "gemini";

    const result = await rewriteCareerContent(text, type, style, targetRole, apiKey, provider);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (err: any) {
    console.error("Rewrite error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to rewrite content" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { analyzeATSCompatibilityWithLLM } from "@/lib/ai/ats-analyzer";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { jobDescriptionText = "", roleTitle = "Frontend Engineer", companyName = "Tech Corp", profile } = body;

    const apiKey = req.headers.get("x-api-key") || undefined;
    const providerHeader = req.headers.get("x-ai-provider") || "gemini";
    const provider = providerHeader === "openai" ? "openai" : "gemini";

    const result = await analyzeATSCompatibilityWithLLM(
      jobDescriptionText,
      profile || {
        skills: [{ name: "TypeScript" }, { name: "React" }, { name: "Next.js" }, { name: "Tailwind CSS" }],
        experiences: [{ bullets: ["Architected microfrontends using Next.js and Tailwind CSS."] }],
        projects: [{ title: "CVForge", technologies: ["Next.js", "TypeScript"] }],
      },
      roleTitle,
      companyName,
      apiKey,
      provider
    );

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (err: any) {
    console.error("ATS Analysis error:", err);
    return NextResponse.json({ error: err.message || "Failed to analyze ATS compatibility" }, { status: 500 });
  }
}

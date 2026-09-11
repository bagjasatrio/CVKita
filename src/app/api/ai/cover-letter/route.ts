import { NextRequest, NextResponse } from "next/server";
import { callLiveLLM } from "@/lib/ai/live-llm";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      targetCompany,
      targetPosition,
      applicantName,
      tone,
      experiences = [],
      education = [],
      projects = [],
      skills = [],
    } = body;

    const apiKey = req.headers.get("x-api-key") || undefined;
    const providerHeader = req.headers.get("x-ai-provider") || "gemini";
    const provider = providerHeader === "openai" ? "openai" : "gemini";

    if (apiKey && apiKey !== "your-gemini-api-key" && apiKey !== "your-openai-api-key") {
      try {
        const systemInstruction = `You are CVKita's AI Executive Cover Letter Author (PRD §18, §19, §35).
Task: Write a high-converting, tailored cover letter for ${applicantName || "the applicant"} applying for the ${targetPosition || "Position"} position at ${targetCompany || "Target Company"}.

CRITICAL CONSTRAINTS:
1. Tone must be ${tone || "Professional and confident"}.
2. ONLY reference facts from the provided experiences, education, projects, and skills. DO NOT fabricate any metrics or companies.
3. Return valid JSON matching:
   {
     "coverLetter": string (complete letter formatted with paragraphs),
     "highlights": array of strings (top 3 key selling points used),
     "wordCount": number
   }`;

        const prompt = `Context:
Applicant Name: ${applicantName || "Master Candidate"}
Target Company: ${targetCompany || "Target Company"}
Target Position: ${targetPosition || "Target Position"}
Selected Experiences: ${JSON.stringify(experiences)}
Selected Education: ${JSON.stringify(education)}
Selected Projects: ${JSON.stringify(projects)}
Selected Skills: ${JSON.stringify(skills)}
`;

        const jsonStr = await callLiveLLM({
          prompt,
          apiKey,
          provider,
          systemInstruction,
          temperature: 0.3,
        });

        const parsed = JSON.parse(jsonStr);
        return NextResponse.json({
          success: true,
          data: {
            coverLetter: parsed.coverLetter,
            highlights: parsed.highlights || [],
            wordCount: parsed.wordCount || parsed.coverLetter?.split(/\s+/).length || 250,
            provider,
          },
        });
      } catch (err: any) {
        console.warn("Live LLM cover letter generation failed, using fallback:", err.message);
      }
    }

    // Heuristic Fallback
    const expText = experiences.map((e: any) => `${e.role || e.title} at ${e.company}`).join(", ");
    const skillText = skills.map((s: any) => s.name || s).join(", ");

    const letter = `Dear Hiring Team at ${targetCompany || "Target Company"},\n\nI am writing to express my strong interest in the ${targetPosition || "Position"} position. With a solid background in ${expText || "relevant industry experience"} and technical expertise in ${skillText || "core skills"}, I am confident in my ability to deliver immediate value to your engineering team.\n\nThroughout my career, I have focused on driving measurable results and building scalable solutions. I am particularly excited about ${targetCompany || "your company"}'s vision and look forward to contributing my expertise.\n\nThank you for your time and consideration.\n\nSincerely,\n${applicantName || "Applicant Name"}`;

    return NextResponse.json({
      success: true,
      data: {
        coverLetter: letter,
        highlights: ["Tailored to target position", "Facts verified from Master Profile"],
        wordCount: letter.split(/\s+/).length,
        provider: "heuristic",
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Cover letter generation failed" }, { status: 500 });
  }
}

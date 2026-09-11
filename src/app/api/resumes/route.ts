import { NextRequest, NextResponse } from "next/server";
import { resumesStore } from "@/lib/resumes-store";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    success: true,
    data: resumesStore,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const id = `res_${Date.now()}`;
    const newResume = {
      id,
      title: body.title || `${body.roleTitle || "Software Engineer"} — ${body.company || "Target"}`,
      roleTitle: body.roleTitle || "Software Engineer",
      company: body.company || "Target Company",
      version: "v1",
      templateId: body.templateId || "ats-classic",
      atsScoreEstimate: body.atsScoreEstimate || 90,
      rubrics: body.rubrics || { keywords: 92, structure: 98, skillsOverlap: 90, formatting: 96 },
      updatedAt: "Just now",
      contentSnapshot: body.contentSnapshot || {},
    };

    resumesStore.unshift(newResume);

    return NextResponse.json({
      success: true,
      data: newResume,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to create resume";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

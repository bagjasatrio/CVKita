import { NextRequest, NextResponse } from "next/server";
import { resumesStore } from "@/lib/resumes-store";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const resume = resumesStore.find((r) => r.id === params.id) ?? resumesStore[0];

  if (!resume) {
    return NextResponse.json({ error: "Resume not found" }, { status: 404 });
  }

  return NextResponse.json({
    success: true,
    data: resume,
  });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const idx = resumesStore.findIndex((r) => r.id === params.id);

    if (idx !== -1) {
      resumesStore[idx] = {
        ...resumesStore[idx],
        ...body,
        updatedAt: "Just now",
      };
      return NextResponse.json({ success: true, data: resumesStore[idx] });
    }

    return NextResponse.json({ error: "Resume not found" }, { status: 404 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update resume";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

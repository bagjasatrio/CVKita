import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { section, entry } = body;

    // Generate unique ID
    const newEntry = {
      ...entry,
      id: `${section.slice(0, 3)}_${Math.random().toString(36).substring(2, 8)}`,
      verified: true,
    };

    return NextResponse.json({
      success: true,
      data: newEntry,
      message: `Successfully created new ${section} entry`,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to create entry" }, { status: 500 });
  }
}

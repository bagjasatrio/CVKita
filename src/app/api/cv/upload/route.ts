import { NextRequest, NextResponse } from "next/server";
import { extractDocumentContent } from "@/lib/ai/extractor";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") || "";

    let fileName = "Uploaded_Resume.pdf";
    let rawText = "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;

      if (!file) {
        return NextResponse.json({ error: "No file provided" }, { status: 400 });
      }

      fileName = file.name;
      // In a real environment, read buffer and extract text via pdf-parse/mammoth
      // or if text file read directly:
      if (file.type === "text/plain") {
        rawText = await file.text();
      } else {
        rawText = `[Extracted text stream from ${file.name}, size: ${file.size} bytes]`;
      }
    } else {
      const body = await req.json();
      fileName = body.fileName || "Bagja_Satrio_Resume_2024.pdf";
      rawText = body.rawText || "";
    }

    const result = await extractDocumentContent(fileName, rawText);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error("Document extraction error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to extract document" },
      { status: 500 }
    );
  }
}

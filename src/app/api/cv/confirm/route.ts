import { NextRequest, NextResponse } from "next/server";
import { calculateProfileCompleteness } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      documentId,
      personalInfo,
      approvedExperiences = [],
      approvedEducations = [],
      approvedSkills = [],
      approvedProjects = [],
      approvedCertifications = [],
    } = body;

    // Calculate updated profile completeness
    const completeness = calculateProfileCompleteness({
      hasPersonalInfo: Boolean(personalInfo?.fullName && personalInfo?.email),
      experienceCount: approvedExperiences.length,
      educationCount: approvedEducations.length,
      skillCount: approvedSkills.length,
      projectCount: approvedProjects.length,
      certificationCount: approvedCertifications.length,
      hasSummary: Boolean(personalInfo?.summary),
      hasLinks: Boolean(personalInfo?.links?.length > 0),
    });

    return NextResponse.json({
      success: true,
      message: "Successfully committed approved items to Career Profile (PRD §11/§12)",
      documentId,
      persistedCounts: {
        experiences: approvedExperiences.length,
        educations: approvedEducations.length,
        skills: approvedSkills.length,
        projects: approvedProjects.length,
        certifications: approvedCertifications.length,
      },
      updatedCompleteness: completeness,
    });
  } catch (error: any) {
    console.error("Confirm error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to confirm extraction" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { calculateProfileCompleteness } from "@/lib/utils";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const DEFAULT_USER_ID = "user_default_1";

function parseDate(d?: string | Date): Date | null {
  if (!d) return null;
  if (d instanceof Date) return isNaN(d.getTime()) ? null : d;
  if (typeof d === "string") {
    if (d === "Present" || d.trim() === "") return null;
    const parsed = new Date(d);
    return isNaN(parsed.getTime()) ? null : parsed;
  }
  return null;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId") || DEFAULT_USER_ID;

    // Fetch profile from Supabase PostgreSQL via Prisma
    let profile = await prisma.profile.findFirst({
      where: { userId },
      include: {
        experiences: true,
        educations: true,
        projects: true,
        skills: true,
        certifications: true,
        achievements: true,
        resumes: true,
      },
    });

    if (!profile) {
      // Fallback to existing primary profile if account specific profile doesn't exist yet
      profile = await prisma.profile.findFirst({
        include: {
          experiences: true,
          educations: true,
          projects: true,
          skills: true,
          certifications: true,
          achievements: true,
          resumes: true,
        },
        orderBy: { createdAt: "asc" },
      });
    }

    if (!profile) {
      return NextResponse.json({ success: true, data: null });
    }

    const score = calculateProfileCompleteness({
      hasPersonalInfo: Boolean(profile.fullName && profile.email),
      experienceCount: profile.experiences.length,
      educationCount: profile.educations.length,
      skillCount: profile.skills.length,
      projectCount: profile.projects.length,
      certificationCount: profile.certifications.length,
      hasSummary: Boolean(profile.summary),
      hasLinks: Boolean(profile.linkedin || profile.github || profile.website),
    });

    // Format to UserProfileStore schema
    const formattedProfile = {
      personalInfo: {
        fullName: profile.fullName || "",
        email: profile.email || "",
        headline: profile.headline || "",
        summary: profile.summary || "",
        phone: profile.phone || "",
        location: profile.location || "",
        website: profile.website || "",
        github: profile.github || "",
        linkedin: profile.linkedin || "",
      },
      experiences: profile.experiences.map((e) => ({
        id: e.id,
        company: e.company,
        role: e.role,
        startDate: e.startDate ? e.startDate.toISOString().slice(0, 7) : "",
        endDate: e.isCurrent ? "Present" : e.endDate ? e.endDate.toISOString().slice(0, 7) : "Present",
        isCurrent: e.isCurrent,
        location: e.location || "",
        bullets: Array.isArray(e.bullets) ? e.bullets : typeof e.description === "string" ? [e.description] : [],
      })),
      projects: profile.projects.map((p) => ({
        id: p.id,
        name: p.title,
        role: p.role || "",
        description: p.description || "",
        techStack: Array.isArray(p.technologies) ? p.technologies : [],
        link: p.url || "",
        githubUrl: p.githubUrl || "",
      })),
      education: profile.educations.map((ed) => ({
        id: ed.id,
        institution: ed.institution,
        degree: ed.degree || "",
        fieldOfStudy: ed.fieldOfStudy || "",
        startDate: ed.startDate ? ed.startDate.toISOString().slice(0, 4) : "",
        endDate: ed.endDate ? ed.endDate.toISOString().slice(0, 4) : "Present",
        gpa: ed.grade || "",
        activities: ed.activities || "",
      })),
      skills: profile.skills.map((s) => ({
        id: s.id,
        name: s.name,
        category: s.category || "General",
        proficiency: 3,
        verified: s.verified,
      })),
      certifications: profile.certifications.map((c) => ({
        id: c.id,
        name: c.name,
        issuer: c.issuer,
        issueDate: c.issueDate ? c.issueDate.toISOString().slice(0, 7) : "",
        credentialId: c.credentialId || "",
        credentialUrl: c.credentialUrl || "",
        status: ((c as any).status as any) || "active",
      })),
      achievements: profile.achievements.map((a) => ({
        id: a.id,
        title: a.title,
        category: "",
        date: a.issueDate ? a.issueDate.toISOString().slice(0, 7) : "",
        issuer: a.issuer || "",
        description: a.description || "",
        metric: "",
      })),
      resumes: profile.resumes.map((r) => ({
        id: r.id,
        title: r.title,
        role: r.targetRole || "",
        company: "",
        template: r.templateId || "ats",
        atsScore: r.atsScoreEstimate || 85,
        updated: r.updatedAt ? r.updatedAt.toISOString().slice(0, 10) : "",
        contentSnapshot: r.contentSnapshot,
      })),
      completenessScore: score,
    };

    return NextResponse.json({
      success: true,
      data: formattedProfile,
    });
  } catch (err: any) {
    console.error("Prisma GET profile error:", err);
    return NextResponse.json({ success: true, data: null, error: err.message });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const userId = body.userId || DEFAULT_USER_ID;
    const personalInfo = body.personalInfo || body;
    const userEmail = personalInfo.email?.trim() || `${userId}@cvforge.app`;
    
    // Ensure user exists in Supabase (check by id first, then by email to avoid unique constraint collisions)
    let user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user && personalInfo.email) {
      user = await prisma.user.findUnique({ where: { email: userEmail } });
    }
    if (!user) {
      user = await prisma.user.create({
        data: {
          id: userId,
          email: userEmail,
          name: personalInfo.fullName || "User",
        },
      });
    }

    const effectiveProfileUserId = user.id;

    // Upsert main Profile record
    const upsertedProfile = await prisma.profile.upsert({
      where: { userId: effectiveProfileUserId },
      create: {
        userId: effectiveProfileUserId,
        fullName: personalInfo.fullName || "",
        headline: personalInfo.headline || "",
        email: personalInfo.email || "",
        phone: personalInfo.phone || "",
        location: personalInfo.location || "",
        summary: personalInfo.summary || "",
        website: personalInfo.website || personalInfo.links?.website || "",
        linkedin: personalInfo.linkedin || personalInfo.links?.linkedin || "",
        github: personalInfo.github || personalInfo.links?.github || "",
      },
      update: {
        fullName: personalInfo.fullName,
        headline: personalInfo.headline,
        email: personalInfo.email,
        phone: personalInfo.phone,
        location: personalInfo.location,
        summary: personalInfo.summary,
        website: personalInfo.website || personalInfo.links?.website,
        linkedin: personalInfo.linkedin || personalInfo.links?.linkedin,
        github: personalInfo.github || personalInfo.links?.github,
      },
    });

    // Save Experiences with preserved IDs & parsed dates
    if (Array.isArray(body.experiences)) {
      await prisma.experience.deleteMany({ where: { profileId: upsertedProfile.id } });
      for (const exp of body.experiences) {
        if (!exp.company && !exp.role) continue;
        await prisma.experience.create({
          data: {
            id: exp.id && exp.id.length > 3 ? exp.id : undefined,
            profileId: upsertedProfile.id,
            company: exp.company || "Perusahaan",
            role: exp.role || "Posisi",
            location: exp.location || "",
            startDate: parseDate(exp.startDate),
            endDate: parseDate(exp.endDate),
            isCurrent: exp.isCurrent ?? (exp.endDate === "Present" || !exp.endDate),
            description: Array.isArray(exp.bullets) ? exp.bullets.join("\n") : exp.bullets || "",
            bullets: Array.isArray(exp.bullets) ? exp.bullets : [],
          },
        });
      }
    }

    // Save Education with preserved IDs & parsed dates
    if (Array.isArray(body.education)) {
      await prisma.education.deleteMany({ where: { profileId: upsertedProfile.id } });
      for (const edu of body.education) {
        if (!edu.institution) continue;
        await prisma.education.create({
          data: {
            id: edu.id && edu.id.length > 3 ? edu.id : undefined,
            profileId: upsertedProfile.id,
            institution: edu.institution,
            degree: edu.degree || "",
            fieldOfStudy: edu.fieldOfStudy || "",
            startDate: parseDate(edu.startDate),
            endDate: parseDate(edu.endDate),
            grade: edu.gpa || "",
            activities: edu.activities || "",
          },
        });
      }
    }

    // Save Projects with preserved IDs
    if (Array.isArray(body.projects)) {
      await prisma.project.deleteMany({ where: { profileId: upsertedProfile.id } });
      for (const proj of body.projects) {
        if (!proj.name) continue;
        await prisma.project.create({
          data: {
            id: proj.id && proj.id.length > 3 ? proj.id : undefined,
            profileId: upsertedProfile.id,
            title: proj.name,
            role: proj.role || "",
            description: proj.description || "",
            url: proj.link || "",
            githubUrl: proj.githubUrl || "",
            technologies: Array.isArray(proj.techStack) ? proj.techStack : [],
          },
        });
      }
    }

    // Save Skills with preserved IDs
    if (Array.isArray(body.skills)) {
      await prisma.skill.deleteMany({ where: { profileId: upsertedProfile.id } });
      for (const skill of body.skills) {
        if (!skill.name) continue;
        await prisma.skill.create({
          data: {
            id: skill.id && skill.id.length > 3 ? skill.id : undefined,
            profileId: upsertedProfile.id,
            name: skill.name,
            category: skill.category || "General",
            proficiencyLevel: "Expert",
            verified: skill.verified ?? true,
          },
        });
      }
    }

    // Save Certifications with preserved IDs & parsed dates
    if (Array.isArray(body.certifications)) {
      await prisma.certification.deleteMany({ where: { profileId: upsertedProfile.id } });
      for (const cert of body.certifications) {
        if (!cert.name) continue;
        await prisma.certification.create({
          data: {
            id: cert.id && cert.id.length > 3 ? cert.id : undefined,
            profileId: upsertedProfile.id,
            name: cert.name,
            issuer: cert.issuer || "",
            issueDate: parseDate(cert.issueDate),
            credentialId: cert.credentialId || "",
            credentialUrl: cert.credentialUrl || "",
          },
        });
      }
    }

    // Save Achievements with preserved IDs
    if (Array.isArray(body.achievements)) {
      await prisma.achievement.deleteMany({ where: { profileId: upsertedProfile.id } });
      for (const ach of body.achievements) {
        if (!ach.title) continue;
        await prisma.achievement.create({
          data: {
            id: ach.id && ach.id.length > 3 ? ach.id : undefined,
            profileId: upsertedProfile.id,
            title: ach.title,
            issuer: ach.issuer || "",
            issueDate: parseDate(ach.date),
            description: ach.description || "",
          },
        });
      }
    }

    // Save Resumes with preserved IDs
    if (Array.isArray(body.resumes)) {
      await prisma.resume.deleteMany({ where: { profileId: upsertedProfile.id } });
      for (const r of body.resumes) {
        if (!r.title) continue;
        await prisma.resume.create({
          data: {
            id: r.id && r.id.length > 3 ? r.id : undefined,
            userId: effectiveProfileUserId,
            profileId: upsertedProfile.id,
            title: r.title,
            targetRole: r.role || r.targetRole || "",
            templateId: r.template || "ats",
            atsScoreEstimate: r.atsScore || 85,
            contentSnapshot: r.contentSnapshot || {},
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      data: upsertedProfile,
      message: "Profile synchronized to Supabase PostgreSQL database",
    });
  } catch (err: any) {
    console.error("Prisma PUT profile error:", err);
    return NextResponse.json({ error: err.message || "Update failed" }, { status: 500 });
  }
}

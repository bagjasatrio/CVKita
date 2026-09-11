import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

export function calculateProfileCompleteness(profile: {
  hasPersonalInfo?: boolean;
  educationCount?: number;
  experienceCount?: number;
  projectCount?: number;
  skillCount?: number;
  certificationCount?: number;
  hasSummary?: boolean;
  hasLinks?: boolean;
}): number {
  // Follows PRD §42-47 completion weighting:
  // Personal Info 15%, Education 15%, Experience 20%, Projects 15%,
  // Skills 15%, Certifications 5%, Summary 10%, Links 5%
  let score = 0;
  if (profile.hasPersonalInfo) score += 15;
  if ((profile.educationCount ?? 0) > 0) score += 15;
  if ((profile.experienceCount ?? 0) > 0) score += 20;
  if ((profile.projectCount ?? 0) > 0) score += 15;
  if ((profile.skillCount ?? 0) >= 3) score += 15;
  else if ((profile.skillCount ?? 0) > 0) score += 8;
  if ((profile.certificationCount ?? 0) > 0) score += 5;
  if (profile.hasSummary) score += 10;
  if (profile.hasLinks) score += 5;
  return Math.min(100, score);
}

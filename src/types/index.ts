export type ConfidenceLevel = "high" | "medium" | "low";

export function getConfidenceLevel(score: number): ConfidenceLevel {
  if (score >= 0.9) return "high";
  if (score >= 0.75) return "medium";
  return "low";
}

export interface FactClaim {
  id: string;
  claimText: string;
  sourceIds: string[];
  confidenceScore: number;
  isVerified: boolean;
  status: "accepted" | "rejected" | "pending_review";
}

export interface ResumeContentSnapshot {
  personalInfo: {
    fullName: string;
    headline?: string;
    email: string;
    phone?: string;
    location?: string;
    website?: string;
    linkedin?: string;
    github?: string;
  };
  summary?: string;
  experiences: Array<{
    id: string;
    company: string;
    role: string;
    location?: string;
    startDate?: string;
    endDate?: string;
    isCurrent?: boolean;
    bullets: string[];
    sourceIds?: string[];
  }>;
  educations: Array<{
    id: string;
    institution: string;
    degree?: string;
    fieldOfStudy?: string;
    startDate?: string;
    endDate?: string;
    grade?: string;
    sourceIds?: string[];
  }>;
  skills: Array<{
    id: string;
    name: string;
    category?: string;
    level?: string;
    verified?: boolean;
  }>;
  projects: Array<{
    id: string;
    title: string;
    role?: string;
    technologies?: string[];
    bullets?: string[];
    url?: string;
    githubUrl?: string;
    sourceIds?: string[];
  }>;
  certifications: Array<{
    id: string;
    name: string;
    issuer: string;
    issueDate?: string;
    credentialId?: string;
    sourceIds?: string[];
  }>;
}

export interface JobMatchItem {
  skillOrRequirement: string;
  category: "required" | "preferred" | "keyword";
  status: "verified_match" | "possibly_related" | "missing" | "unsupported";
  matchedProfileItem?: {
    id: string;
    type: "skill" | "experience" | "project" | "certification";
    title: string;
  };
  notes?: string;
}

export interface ATSAnalysisResult {
  scoreEstimate: number; // 0-100 compatibility estimate
  keywordMatchRate: number; // percentage
  readabilityScore: number; // percentage
  formattingScore: number; // percentage
  strengths: string[];
  warnings: string[];
  missingKeywords: string[];
  recommendations: string[];
}

/**
 * In-memory resume store shared between API routes.
 * In production, this would be replaced by Prisma DB queries.
 */

export interface ResumeSnapshot {
  id: string;
  title: string;
  roleTitle: string;
  company: string;
  version: string;
  templateId: string;
  atsScoreEstimate: number;
  rubrics: { keywords: number; structure: number; skillsOverlap: number; formatting: number };
  updatedAt: string;
  contentSnapshot: Record<string, unknown>;
}

export const resumesStore: ResumeSnapshot[] = [];

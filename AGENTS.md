# AGENTS.md for CVForge

Based on my analysis of the `CVForge_PRD.md` repository, here is the compact instruction file. This covers the highest-signal facts an agent would need to avoid mistakes and ramp up quickly.

## Repository Overview

**CVForge** is an AI-powered career profile and resume generation platform. The core concept: users build a structured **Career Profile** once, then the system creates, improves, analyzes, and tailors multiple resumes from that profile.

**Key files:**
- `CVForge_PRD.md` - Complete product requirements document (2956 lines)
- No existing `AGENTS.md` - this file should be created fresh

## Development Commands

| Task | Command |
|------|---------|
| Install dependencies | `pnpm install` (or `npm install`) |
| Run development server | `pnpm dev` (Next.js app router) |
| Run type check | `pnpm typecheck` or `tsc --noEmit` |
| Run lint | `pnpm lint` |
| Run tests | `pnpm test` |
| Run build | `pnpm build` |
| Generate Prisma migrations | `pnpm prisma migrate make <name>` |
| Apply Prisma migrations | `pnpm prisma migrate deploy` |
| Seed/reset database | `pnpm prisma migrate reset` |
| Open Prisma Studio | `pnpm prisma studio` |

## Architecture & Structure

```
src/
├── app/              # Next.js app router pages & API routes
├── components/       # React components (shadcn/ui)
├── lib/              # Utility functions & helpers
├── hooks/            # Custom React hooks
├── styles/           # Tailwind CSS configuration
├── types/            # TypeScript type definitions
└── prisma/           # Database schema & migrations
```

**Database:** PostgreSQL via Prisma ORM

**Key tables (from Prisma schema):**
- `users` - authentication and basic info
- `profiles` - Career Profile (source of truth)
- `experiences`, `educations`, `projects`, `skills`, `certifications`, `achievements`
- `documents` - uploaded CVs, certificates, etc.
- `resumes` - generated resume versions
- `job_descriptions` - stored JDs
- `ai_generations` - audit trail of AI outputs

**API Routes (important):**
- `POST /api/auth/*` - authentication
- `POST /api/cv/upload` - CV import
- `POST /api/profiles` - profile CRUD
- `POST /api/resumes` - resume generation
- `POST /api/ats/*` - ATS analysis
- `POST /api/ai/*` - AI writing/rewrite/validation

## Critical Conventions

1. **Career Profile is the source of truth** (PRD §3.1) - Never treat a generated resume as the source. All AI operations must reference profile data.

2. **AI must not fabricate** (PRD §3.3, §18) - AI must not invent: employment, companies, job titles, certifications, skills, technologies, metrics, achievements, education, dates, or results unless user explicitly provides/confirms.

3. **User approval required** (PRD §3.4) - Important AI-extracted/generated information must be reviewable before becoming trusted Career Profile data. Show confidence scores. Low-confidence fields require user confirmation.

4. **Fact validation pipeline** (PRD §19) - Every AI-generated claim should have source references (`sourceIds`). Claims unsupported by source data should be rejected/ask user.

5. **Relevance ranking** (PRD §22) - When tailoring resumes, rank Career Profile items by: skill overlap, experience relevance, project relevance, keyword overlap, role similarity, recency. Must not permanently delete/alter profile data.

6. **ATS analyzer** (PRD §23) - Evaluates keyword match, structure, formatting, skills, experience, readability. Score 0-100 but present as "ATS compatibility estimate," NOT "guaranteed ATS score."

7. **PDF generation** (PRD §28) - Architecture: Resume JSON → React Template → HTML/CSS → Headless Chromium → PDF. Must be deterministic: same JSON → predictable document.

8. **DOCX export** (PRD §29) - Can be implemented after PDF if needed: Resume JSON → DOCX Renderer → DOCX.

9. **Document extraction pipeline** (PRD §36) - File upload → validation → object storage → document type detection → text extraction → LLM structured extraction → schema validation → confidence scoring → user review → career profile.

10. **AI service architecture** (PRD §35) - Modular interface with these methods:
   - `extractDocument(input: DocumentInput): Promise<ExtractionResult>`
   - `rewriteContent(input: RewriteInput): Promise<RewriteResult>`
   - `analyzeJob(input: JobAnalysisInput): Promise<JobAnalysisResult>`
   - `analyzeATS(input: ATSInput): Promise<ATSResult>`
   - `validateFacts(input: FactValidationInput): Promise<FactValidationResult>`
   - All return structured JSON outputs.

11. **Job description analyzer** (PRD §20) - Extracts: required skills, preferred skills, keywords, responsibilities, qualifications.

12. **Job matching** (PRD §21) - Compares profile requirements against JD. Distinguishes: verified match, possibly related, missing, unsupported. Never tell user they have a skill merely because AI thinks it's similar.

13. **Important UI conventions** (PRD §42-47):
   - Profile completion: `Personal Information 15%`, `Education 15%`, `Experience 20%`, `Projects 15%`, `Skills 15%`, `Certifications 5%`, `Summary 10%`, `Links 5%`
   - Navigation sidebar: Overview, Profile, Experience, Projects, Education, Skills, Certifications, Achievements, Documents, My Resumes, Job Matches, Settings
   - Landing page hero: "Build your career profile once. Generate the right resume for every opportunity."
   - CTA: "Upload My CV" and "Start From Scratch"

14. **File security** (PRD §42):
   - Validate MIME type and extension
   - Enforce file size limits
   - Store files outside public web root
   - Generate signed URLs when needed
   - Do not expose storage credentials

15. **Error handling** (PRD §41) - Every processing stage must have explicit failure state. Never silently create incomplete or fabricated data. Show user-friendly error messages.

16. **Privacy** (PRD §40):
   - Minimize stored data
   - Allow users to delete documents and career profile
   - Avoid logging full document contents
   - Use encrypted connections

## Testing Quirks

- Confidence scoring thresholds: `0.90-1.00` high, `0.75-0.89` medium, `0.00-0.74` low
- Low-confidence extraction requires user confirmation before saving to profile
- ATS score presented as compatibility estimate, not guarantee
- PDF generation must be deterministic (same JSON → same PDF)
- AI writing must retain source references via `sourceIds`
- Never silently replace user content - always show [Accept] [Reject] [Edit]

## Framework Quirks

- **Next.js 14+ with App Router** - Pages vs. server components awareness
- **Tailwind CSS v3/v4** - Config in `tailwind.config.ts`; design tokens in `src/styles/`
- **shadcn/ui** - Component library; components imported from `components/ui/`
- **Prisma ORM** - Schema in `prisma/schema.prisma`; migrations in `prisma/migrations/`
- **TypeScript** - Strict mode; types in `src/types/`
- **Supabase Auth** - Authentication (or Auth.js alternative)

## Common Gotchas

1. **AI fabrication detection** - The system has explicit forbidden behaviors (PRD §18). Any agent working with AI output must understand the fact-validation pipeline.

2. **Confidence score handling** - Extracted data below threshold `0.75` requires user confirmation. Agents must not auto-approve low-confidence fields.

3. **Source traceability** (PRD §32) - Every piece of Career Profile data should be traceable to `document_id` or `source_document_id`. Agents must preserve these references.

4. **Resume editor limitations** (PRD §27) - Editor is structured, NOT a graphic design tool. No Canva-style visual editing.

5. **Bulk import** (PRD §37) - System should not require N individual forms for N certificates. Uses queue + individual processing + deduplication.

6. **Job matching precision** (PRD §21) - TypeScript ⚠ vs React ✓ in the example shows the system must distinguish verified matches from possibly related items. Never overclaim.

7. **PDF template determinism** (PRD §28) - The renderer must be deterministic. Same Resume JSON should produce predictable document.

8. **Authentication ownership** (PRD §1733-1745) - Every query must enforce user ownership. Never allow `GET /api/resumes/:id` to return another user's resume.

This file should be placed at the repository root as `AGENTS.md`. Preserve all sections as-is since they contain verified, repo-specific guidance an agent would otherwise miss.
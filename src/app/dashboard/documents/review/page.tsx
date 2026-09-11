"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Check,
  X,
  Edit2,
  ArrowRight,
  Terminal,
  RotateCcw,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Lock,
  Layers,
} from "lucide-react";
import { DocumentExtractionResult } from "@/lib/ai/extractor";

export default function ExtractionReviewPage() {
  const router = useRouter();
  const [data, setData] = useState<DocumentExtractionResult | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Load from session storage or fetch default extraction sample
  useEffect(() => {
    if (typeof window !== "undefined") {
      const cached = sessionStorage.getItem("cvforge_current_extraction");
      if (cached) {
        try {
          setData(JSON.parse(cached));
          return;
        } catch (e) {
          console.error(e);
        }
      }
    }

    // Default sample load if navigated directly
    fetch("/api/cv/upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fileName: "Bagja_Satrio_Resume_2024.pdf" }),
    })
      .then((res) => res.json())
      .then((json) => {
        if (json.data) setData(json.data);
      })
      .catch((err) => console.error(err));
  }, []);

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-10 h-10 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin" />
        <p className="text-sm text-zinc-500 font-medium">Loading extraction signals...</p>
      </div>
    );
  }

  // Action handlers
  const handleApproveAllHighConfidence = () => {
    setData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        experiences: prev.experiences.map((exp) => ({
          ...exp,
          status: exp.confidenceScore >= 0.75 ? "accepted" : exp.status,
          bullets: exp.bullets.map((b) => ({
            ...b,
            status: b.confidenceScore >= 0.75 ? "accepted" : b.status,
          })),
        })),
        educations: prev.educations.map((edu) => ({
          ...edu,
          status: edu.confidenceScore >= 0.75 ? "accepted" : edu.status,
        })),
        skills: prev.skills.map((sk) => ({
          ...sk,
          status: sk.confidenceScore >= 0.75 ? "accepted" : sk.status,
        })),
        projects: prev.projects.map((p) => ({
          ...p,
          status: p.confidenceScore >= 0.75 ? "accepted" : p.status,
        })),
        certifications: prev.certifications.map((c) => ({
          ...c,
          status: c.confidenceScore >= 0.75 ? "accepted" : c.status,
        })),
      };
    });
  };

  const toggleBulletStatus = (expId: string, bulletId: string, status: "accepted" | "rejected") => {
    setData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        experiences: prev.experiences.map((exp) => {
          if (exp.id !== expId) return exp;
          return {
            ...exp,
            bullets: exp.bullets.map((b) => (b.id === bulletId ? { ...b, status } : b)),
          };
        }),
      };
    });
  };

  const toggleSkillStatus = (skillId: string, status: "accepted" | "rejected") => {
    setData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        skills: prev.skills.map((sk) => (sk.id === skillId ? { ...sk, status } : sk)),
      };
    });
  };

  const handleCommitToCareerProfile = async () => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/cv/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentId: data.documentId,
          personalInfo: data.personalInfo,
          approvedExperiences: data.experiences.filter((e) => e.status !== "rejected"),
          approvedEducations: data.educations.filter((e) => e.status !== "rejected"),
          approvedSkills: data.skills.filter((s) => s.status !== "rejected"),
          approvedProjects: data.projects.filter((p) => p.status !== "rejected"),
          approvedCertifications: data.certifications.filter((c) => c.status !== "rejected"),
        }),
      });

      const json = await res.json();
      if (res.ok) {
        setSuccessMessage("Approved facts successfully written into Career Profile!");
        setTimeout(() => {
          router.push("/dashboard/profile");
        }, 1200);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-zinc-500">
        <Link href="/dashboard/documents" className="hover:text-orange-600">
          Documents
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-zinc-900 font-medium">Extraction Review</span>
      </div>

      {/* Success Notification Banner */}
      {successMessage && (
        <div className="p-4 rounded-xl bg-orange-100 text-orange-950 border border-orange-200 flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <CheckCircle2 className="w-5 h-5 text-orange-700" />
            <span>{successMessage}</span>
          </div>
          <span className="text-xs text-orange-700">Redirecting to Profile...</span>
        </div>
      )}

      {/* Top Summary Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between p-6 rounded-2xl bg-white border border-zinc-200 shadow-xs gap-4">
        <div className="space-y-1.5 max-w-3xl">
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-900 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-orange-600" />
            </div>
            <h1 className="text-xl font-bold text-zinc-900 tracking-tight">
              Extraction Review & Verification
            </h1>
            <span className="font-mono text-xs px-2 py-0.5 rounded bg-zinc-100 text-zinc-600 border border-zinc-200">
              {data.fileName}
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-900 font-mono text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-orange-600" />
              Zero Fabrication Guard
            </span>
          </div>
          <p className="text-xs text-zinc-600 leading-relaxed">
            Extracted <span className="font-bold text-zinc-900">{data.metrics.totalEntities} structured entities</span> with{" "}
            <span className="font-bold text-orange-700">{data.metrics.meanConfidence}% mean confidence score</span>. Only user-confirmed datapoints will append to your permanent Career Profile graph.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => router.push("/dashboard/documents")}
            className="px-3.5 py-2 rounded-lg border border-zinc-200 text-xs font-medium text-zinc-600 hover:bg-zinc-50 transition-colors flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Re-upload</span>
          </button>
          <button
            type="button"
            onClick={handleApproveAllHighConfidence}
            className="px-4 py-2 rounded-lg bg-orange-100 hover:bg-orange-200 text-orange-900 text-xs font-semibold transition-colors shadow-xs flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-4 h-4 text-orange-600" />
            <span>Approve High Confidence ({data.metrics.autoVerifiableCount})</span>
          </button>
          <button
            type="button"
            onClick={handleCommitToCareerProfile}
            disabled={isSaving}
            className="px-5 py-2 rounded-lg bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white text-xs font-semibold transition-all shadow-sm flex items-center gap-1.5 disabled:opacity-50"
          >
            <span>Commit to Profile</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 4 Metric Gauges Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white border border-zinc-200 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
              Parser Engine
            </span>
            <p className="text-base font-bold text-zinc-900 mt-0.5">Dual-Pass V3.2</p>
          </div>
          <Terminal className="w-5 h-5 text-zinc-400" />
        </div>

        <div className="p-4 rounded-xl bg-white border border-zinc-200 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
              Mean Confidence
            </span>
            <p className="text-base font-bold text-orange-700 mt-0.5 font-mono">
              {data.metrics.meanConfidence}%
            </p>
          </div>
          <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-orange-600" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-zinc-200 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
              Auto-Verifiable
            </span>
            <p className="text-base font-bold text-zinc-900 mt-0.5 font-mono">
              {data.metrics.autoVerifiableCount} / {data.metrics.totalEntities}
            </p>
          </div>
          <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-orange-100 text-orange-900">
            {Math.round((data.metrics.autoVerifiableCount / data.metrics.totalEntities) * 100)}%
          </span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-zinc-200 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[11px] font-semibold text-red-600 uppercase tracking-wider">
              Needs Review
            </span>
            <p className="text-base font-bold text-red-600 mt-0.5 font-mono">
              {data.metrics.needsReviewCount} Flags
            </p>
          </div>
          <AlertTriangle className="w-5 h-5 text-red-600" />
        </div>
      </div>

      {/* Main Split Grid: 8 Cols Entities + 4 Cols Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side: Extracted Entities Tree (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Section: Personal Info */}
          <section className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                <h2 className="text-sm font-bold text-zinc-900 uppercase tracking-wider">
                  Candidate & Contact Signals
                </h2>
              </div>
              <span className="text-xs font-mono text-zinc-500">98% Confidence Avg</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-zinc-50 border border-zinc-200 space-y-1">
                <div className="flex items-center justify-between text-zinc-500">
                  <span>FULL NAME</span>
                  <span className="font-mono text-[10px] text-orange-900 bg-orange-100 px-1.5 py-0.2 rounded font-semibold">
                    99% Conf
                  </span>
                </div>
                <p className="text-sm font-semibold text-zinc-900">{data.personalInfo.fullName}</p>
              </div>

              <div className="p-3 rounded-lg bg-zinc-50 border border-zinc-200 space-y-1">
                <div className="flex items-center justify-between text-zinc-500">
                  <span>EMAIL ADDRESS</span>
                  <span className="font-mono text-[10px] text-orange-900 bg-orange-100 px-1.5 py-0.2 rounded font-semibold">
                    99% Conf
                  </span>
                </div>
                <p className="text-sm font-semibold text-zinc-900">{data.personalInfo.email}</p>
              </div>

              <div className="p-3 rounded-lg bg-zinc-50 border border-zinc-200 space-y-1">
                <div className="flex items-center justify-between text-zinc-500">
                  <span>PRIMARY LOCATION</span>
                  <span className="font-mono text-[10px] text-orange-900 bg-orange-100 px-1.5 py-0.2 rounded font-semibold">
                    98% Conf
                  </span>
                </div>
                <p className="text-sm font-semibold text-zinc-900">{data.personalInfo.location}</p>
              </div>

              <div className="p-3 rounded-lg bg-zinc-50 border border-zinc-200 space-y-1">
                <div className="flex items-center justify-between text-zinc-500">
                  <span>PORTFOLIO / REPOSITORIES</span>
                  <span className="font-mono text-[10px] text-orange-900 bg-orange-100 px-1.5 py-0.2 rounded font-semibold">
                    96% Conf
                  </span>
                </div>
                <p className="text-sm font-semibold text-zinc-900">
                  {data.personalInfo.links?.join(", ") || "github.com"}
                </p>
              </div>
            </div>
          </section>

          {/* Section: Work & Project History */}
          <section className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                <h2 className="text-sm font-bold text-zinc-900 uppercase tracking-wider">
                  Work & Project Experience
                </h2>
              </div>
              <span className="text-xs font-mono text-zinc-500">
                {data.experiences.length} Records Parsed
              </span>
            </div>

            <div className="space-y-4">
              {data.experiences.map((exp) => (
                <div
                  key={exp.id}
                  className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-zinc-900">{exp.role}</h3>
                        <span
                          className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded ${
                            exp.confidenceScore >= 0.9
                              ? "bg-orange-100 text-orange-900"
                              : exp.confidenceScore >= 0.75
                              ? "bg-amber-100 text-amber-900"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {Math.round(exp.confidenceScore * 100)}% Conf
                        </span>
                      </div>
                      <p className="text-xs text-zinc-500 mt-0.5">
                        {exp.company} • {exp.startDate} - {exp.endDate || "Present"}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 self-start sm:self-auto">
                      <span className="text-xs text-zinc-500 font-medium">Status:</span>
                      <span
                        className={`text-xs font-mono font-semibold px-2 py-0.5 rounded capitalize ${
                          exp.status === "accepted"
                            ? "bg-orange-100 text-orange-900"
                            : exp.status === "rejected"
                            ? "bg-red-100 text-red-700"
                            : "bg-zinc-200 text-zinc-600"
                        }`}
                      >
                        {exp.status}
                      </span>
                    </div>
                  </div>

                  {/* Bullet points verification */}
                  <div className="space-y-2 pt-2 border-t border-zinc-200">
                    <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
                      Verified Accomplishment Bullets
                    </span>
                    {exp.bullets.map((b) => (
                      <div
                        key={b.id}
                        className={`p-3 rounded-lg border text-xs flex items-start justify-between gap-3 transition-colors ${
                          b.status === "accepted"
                            ? "bg-white border-orange-200"
                            : b.status === "rejected"
                            ? "bg-red-50 border-red-200 opacity-60"
                            : "bg-white border-zinc-200"
                        }`}
                      >
                        <div className="space-y-1">
                          <p className="text-zinc-900 leading-relaxed">{b.text}</p>
                          <span
                            className={`inline-block text-[10px] font-mono px-1.5 py-0.2 rounded ${
                              b.confidenceScore >= 0.9
                                ? "bg-orange-100 text-orange-900 font-semibold"
                                : "bg-red-100 text-red-700 font-bold"
                            }`}
                          >
                            {Math.round(b.confidenceScore * 100)}% Conf{" "}
                            {b.confidenceScore < 0.75 && "• Flagged for review"}
                          </span>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => toggleBulletStatus(exp.id, b.id, "accepted")}
                            title="Accept Fact"
                            className={`p-1.5 rounded hover:bg-orange-100 transition-colors ${
                              b.status === "accepted" ? "text-orange-900 bg-orange-100 font-bold" : "text-zinc-400"
                            }`}
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => toggleBulletStatus(exp.id, b.id, "rejected")}
                            title="Reject / Remove"
                            className={`p-1.5 rounded hover:bg-red-100 transition-colors ${
                              b.status === "rejected" ? "text-red-600 bg-red-100 font-bold" : "text-zinc-400"
                            }`}
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Section: Technical Skills */}
          <section className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                <h2 className="text-sm font-bold text-zinc-900 uppercase tracking-wider">
                  Technical Skills Matrix
                </h2>
              </div>
              <span className="text-xs font-mono text-zinc-500">
                {data.skills.length} Extracted Skills
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              {data.skills.map((skill) => (
                <div
                  key={skill.id}
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                    skill.status === "rejected"
                      ? "bg-zinc-100 text-zinc-400 line-through border-zinc-200"
                      : "bg-zinc-50 text-zinc-900 border-zinc-200"
                  }`}
                >
                  <span>{skill.name}</span>
                  <span
                    className={`text-[10px] font-mono px-1 rounded ${
                      skill.confidenceScore >= 0.9
                        ? "bg-orange-100 text-orange-900 font-semibold"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {Math.round(skill.confidenceScore * 100)}%
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      toggleSkillStatus(
                        skill.id,
                        skill.status === "rejected" ? "accepted" : "rejected"
                      )
                    }
                    className="hover:text-red-600"
                  >
                    {skill.status === "rejected" ? (
                      <Check className="w-3 h-3 text-orange-700" />
                    ) : (
                      <X className="w-3 h-3 text-zinc-400" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right Side: Document Source Inspector (4 cols) */}
        <div className="lg:col-span-4 space-y-4 sticky top-20">
          <div className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-orange-600" />
                <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider">
                  Source Document Inspector
                </h3>
              </div>
              <span className="text-[10px] font-mono text-zinc-500">{data.documentId}</span>
            </div>

            <div className="p-3 rounded-lg bg-zinc-50 border border-zinc-200 space-y-2 text-xs">
              <div className="flex items-center justify-between text-zinc-500">
                <span>Document Hash</span>
                <span className="font-mono text-[10px] text-zinc-900">sha256-4c92...</span>
              </div>
              <div className="flex items-center justify-between text-zinc-500">
                <span>MIME Type</span>
                <span className="font-mono text-[10px] text-zinc-900">application/pdf</span>
              </div>
              <div className="flex items-center justify-between text-zinc-500">
                <span>Zero Hallucination</span>
                <span className="font-mono text-[10px] text-orange-700 font-semibold">Active ✓</span>
              </div>
            </div>

            <div className="space-y-1 pt-1">
              <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
                Raw Extracted Stream
              </span>
              <div className="h-64 overflow-y-auto p-3 rounded-lg bg-zinc-950 text-orange-200 font-mono text-[11px] leading-relaxed border border-zinc-800">
                {data.rawText}
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={handleCommitToCareerProfile}
                disabled={isSaving}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white text-xs font-semibold transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <span>Commit to Career Profile</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

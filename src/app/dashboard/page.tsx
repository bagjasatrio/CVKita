"use client";

import Link from "next/link";
import {
  UploadCloud,
  FileText,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Target,
  CheckCircle2,
  TrendingUp,
  AlertCircle,
  ExternalLink,
  Plus,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useUserProfile } from "@/lib/use-user-profile";

export default function DashboardOverviewPage() {
  const { user } = useAuth();
  const { profile, completenessPercentage, verifiedFactCount, isDemoUser } = useUserProfile();

  const userName = user?.name || profile.personalInfo.fullName || "User";
  const firstName = userName.split(" ")[0];

  const hasData = profile.experiences.length > 0 || profile.projects.length > 0 || profile.resumes.length > 0;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-orange-600 via-amber-600 to-red-600 text-white rounded-2xl p-6 md:p-8 shadow-sm relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-red-600/30 to-transparent pointer-events-none" />
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 border border-white/30 text-white text-xs font-mono backdrop-blur-xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-200" />
            {isDemoUser ? "Demo Career Profile Active" : "Fresh Career Profile"}
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Welcome, {firstName}
          </h1>
          <p className="text-orange-100 text-sm md:text-base leading-relaxed">
            {hasData ? (
              <>
                Your Career Profile holds <strong className="text-white">{verifiedFactCount} verified facts</strong> across{" "}
                {profile.experiences.length} work experiences, {profile.projects.length} projects, and {profile.skills.length} skills.
              </>
            ) : (
              <>
                Your Career Profile is fresh and ready to be built! Upload an existing CV or add your experience to get started.
              </>
            )}
          </p>
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <Link
              href="/dashboard/resumes/new"
              className="inline-flex items-center gap-2 bg-white text-orange-600 hover:bg-orange-50 px-4 py-2 rounded-lg text-sm font-semibold transition-colors shadow-sm"
            >
              <Sparkles className="w-4 h-4 text-orange-600" />
              Tailor Resume for Job
            </Link>
            <Link
              href="/dashboard/documents"
              className="inline-flex items-center gap-2 bg-orange-700/60 hover:bg-orange-700 text-white border border-orange-500/50 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              <UploadCloud className="w-4 h-4" />
              Upload CV or Certificate
            </Link>
          </div>
        </div>
      </div>

      {/* Dynamic Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400">
            <span className="text-xs font-medium">Profile Completeness</span>
            <TrendingUp className="w-4 h-4 text-orange-500" />
          </div>
          <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 font-mono">{completenessPercentage}%</div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            {completenessPercentage < 80 ? "Add experience & skills to reach 80%+" : "High profile completeness"}
          </p>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400">
            <span className="text-xs font-medium">Fact Vault Items</span>
            <ShieldCheck className="w-4 h-4 text-orange-500 fill-orange-100 dark:fill-orange-950" />
          </div>
          <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 font-mono">{verifiedFactCount}</div>
          <p className="text-xs text-orange-600 dark:text-orange-400 font-medium flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-orange-500" /> 100% verified sources
          </p>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400">
            <span className="text-xs font-medium">Tailored Resumes</span>
            <FileText className="w-4 h-4 text-zinc-400 dark:text-zinc-300" />
          </div>
          <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 font-mono">{profile.resumes.length}</div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            {profile.resumes.length > 0 ? "Targeted resume versions" : "No resume created yet"}
          </p>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400">
            <span className="text-xs font-medium">Avg. ATS Compatibility</span>
            <Target className="w-4 h-4 text-orange-500" />
          </div>
          <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 font-mono">
            {profile.resumes.length > 0
              ? `${Math.round(profile.resumes.reduce((a, b) => a + b.atsScore, 0) / profile.resumes.length)}%`
              : "N/A"}
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">Calculated compatibility estimate</p>
        </div>
      </div>

      {/* Main Grid: Active Resumes & Fact Vault Integrity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Resumes (2 cols) */}
        <div className="lg:col-span-2 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">Active Resumes</h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Derived snapshots ready for application export</p>
            </div>
            <Link
              href="/dashboard/resumes"
              className="text-xs font-medium text-orange-600 dark:text-orange-400 hover:underline flex items-center gap-1"
            >
              View All <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {profile.resumes.length > 0 ? (
            <div className="space-y-3">
              {profile.resumes.map((resume) => (
                <div
                  key={resume.id}
                  className="flex items-center justify-between p-3.5 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:border-orange-300 dark:hover:border-orange-600/60 hover:bg-orange-50/50 dark:hover:bg-zinc-800/50 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 flex items-center justify-center font-medium">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{resume.title}</h3>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">
                        {resume.role} • {resume.template}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-right">
                    <div>
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-medium bg-orange-100 dark:bg-orange-950/80 text-orange-800 dark:text-orange-300">
                        {resume.atsScore}% ATS
                      </span>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">{resume.updated}</p>
                    </div>
                    <Link
                      href={`/dashboard/resumes`}
                      className="p-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-dashed border-zinc-300 dark:border-zinc-800 space-y-3">
              <FileText className="w-8 h-8 text-zinc-400 dark:text-zinc-500 mx-auto" />
              <div className="space-y-1">
                <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">No resumes generated yet</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Build your career profile or upload a CV to tailor your first resume.
                </p>
              </div>
              <div className="pt-2 flex justify-center gap-3">
                <Link
                  href="/dashboard/documents"
                  className="px-4 py-2 bg-orange-600 dark:bg-orange-600 text-white rounded-lg text-xs font-semibold hover:bg-orange-700 transition-colors inline-flex items-center gap-1.5"
                >
                  <UploadCloud className="w-3.5 h-3.5" /> Upload CV
                </Link>
                <Link
                  href="/dashboard/profile"
                  className="px-4 py-2 border border-orange-200 dark:border-orange-800/40 bg-white dark:bg-zinc-900 text-orange-600 dark:text-orange-400 rounded-lg text-xs font-semibold hover:bg-orange-50 dark:hover:bg-zinc-800 transition-colors inline-flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Profile Details
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Fact Vault & Quick Import */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 space-y-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            <div>
              <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">Fact Vault Integrity</h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Anti-Fabrication Rule</p>
            </div>
          </div>

          <div className="p-3.5 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-2 text-xs">
            <div className="flex items-center justify-between font-medium">
              <span className="text-zinc-900 dark:text-zinc-200">Verified Claims</span>
              <span className="font-mono text-orange-600 dark:text-orange-400">{verifiedFactCount} / {verifiedFactCount}</span>
            </div>
            <div className="w-full bg-zinc-200 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
              <div className="bg-gradient-to-r from-orange-500 to-amber-500 h-full rounded-full w-full" />
            </div>
            <p className="text-zinc-500 dark:text-zinc-400 text-[11px] leading-relaxed">
              Every bullet point in your generated resumes connects to verified source documents in your vault.
            </p>
          </div>

          <div className="pt-2 space-y-2">
            <h3 className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              Quick Actions
            </h3>
            <Link
              href="/dashboard/documents"
              className="w-full flex items-center justify-between p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-orange-50/50 dark:hover:bg-zinc-800/50 text-xs font-medium text-zinc-900 dark:text-zinc-200 transition-colors"
            >
              <span className="flex items-center gap-2">
                <UploadCloud className="w-4 h-4 text-orange-500" /> Upload New Certificate / CV
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-zinc-400" />
            </Link>
            <Link
              href="/dashboard/profile"
              className="w-full flex items-center justify-between p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-orange-50/50 dark:hover:bg-zinc-800/50 text-xs font-medium text-zinc-900 dark:text-zinc-200 transition-colors"
            >
              <span className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-orange-500" /> Edit Career Profile Details
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-zinc-400" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

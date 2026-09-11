"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  GitCompare,
  History,
  ShieldCheck,
  Lock,
  Copy,
  Download,
  CheckCircle2,
  TrendingUp,
  Sliders,
  RotateCcw,
  Sparkles,
  FileText,
  Layers,
  Code,
  Tag,
  Check,
  AlertCircle,
} from "lucide-react";

interface VersionSnapshot {
  version: string;
  label: string;
  atsScore: number;
  wordCount: number;
  updatedAt: string;
  summary: string;
  tagline: string;
  isHead?: boolean;
}

const VERSIONS: VersionSnapshot[] = [
  {
    version: "V4",
    label: "Active Head",
    atsScore: 91,
    wordCount: 498,
    updatedAt: "Today, 14:20",
    summary: "Tailored to INP & Webpack to Vite migration",
    tagline: "Target: Staff UI Eng, Core Experience",
    isHead: true,
  },
  {
    version: "V3",
    label: "Baseline",
    atsScore: 84,
    wordCount: 512,
    updatedAt: "Yesterday, 09:15",
    summary: "Added AWS Certified Solutions Architect proof & LCP metrics",
    tagline: "Target: Senior Frontend Engineer",
  },
  {
    version: "V2",
    label: "Draft",
    atsScore: 78,
    wordCount: 530,
    updatedAt: "3 days ago",
    summary: "Initial Stripe JD keyword alignment & summary restructure",
    tagline: "Draft resume iteration",
  },
  {
    version: "V1",
    label: "Seed",
    atsScore: 68,
    wordCount: 580,
    updatedAt: "Sep 01, 2024",
    summary: "Raw imported CV data snapshot via PDF parser",
    tagline: "Raw Master Profile import",
  },
];

export default function ResumeDiffPage() {
  const params = useParams();
  const router = useRouter();
  const resumeId = (params?.id as string) || "1";

  const [headVersion, setHeadVersion] = useState<string>("V4");
  const [baseVersion, setBaseVersion] = useState<string>("V3");
  const [diffMode, setDiffMode] = useState<"split" | "unified">("split");
  const [showLineage, setShowLineage] = useState(false);
  const [rollbackSuccess, setRollbackSuccess] = useState(false);

  const handleRollback = () => {
    setRollbackSuccess(true);
    setTimeout(() => {
      setRollbackSuccess(false);
      setHeadVersion(baseVersion);
    }, 1500);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Navigation Breadcrumb & Page Header */}
      <div className="bg-white dark:bg-[#1b2220] rounded-xl p-5 border border-[#e1e3e2] dark:border-[#242c2a] shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-mono text-[#727976] dark:text-[#8c9390]">
              <Link href="/dashboard/resumes" className="hover:text-orange-600 transition-colors">
                Resumes
              </Link>
              <span>/</span>
              <Link href={`/dashboard/resumes/${resumeId}`} className="hover:text-orange-600 transition-colors">
                Frontend Developer (Stripe)
              </Link>
              <span>/</span>
              <span className="text-orange-950 dark:text-orange-300 font-semibold">Version History & ATS Diff</span>
            </div>
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <h1 className="text-xl font-bold text-[#191c1c] dark:text-white flex items-center gap-2">
                <GitCompare className="w-5 h-5 text-orange-600 dark:text-orange-400" /> Version Comparison Engine
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-orange-100 dark:bg-orange-950 text-orange-950 dark:text-orange-300 text-xs font-mono font-semibold border border-orange-200 dark:border-orange-900">
                Active Base: {headVersion} (ATS Score: 91/100)
              </span>
            </div>
          </div>

          {/* Action Cluster */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => alert("Forked version as a new independent resume snapshot.")}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#f8faf9] dark:bg-[#121816] border border-[#c1c8c5] dark:border-[#242c2a] text-[#191c1c] dark:text-zinc-200 hover:bg-[#edeeee] dark:hover:bg-[#1b2220] text-xs font-medium transition-colors"
            >
              <Copy className="w-4 h-4 text-[#4c6079] dark:text-zinc-400" /> Fork as New Resume
            </button>
            <button
              type="button"
              onClick={() => alert("Exporting ATS-optimized PDF snapshot...")}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#f8faf9] dark:bg-[#121816] border border-[#c1c8c5] dark:border-[#242c2a] text-[#191c1c] dark:text-zinc-200 hover:bg-[#edeeee] dark:hover:bg-[#1b2220] text-xs font-medium transition-colors"
            >
              <Download className="w-4 h-4 text-[#4c6079] dark:text-zinc-400" /> Export ATS PDF
            </button>
            <Link
              href={`/dashboard/resumes/${resumeId}`}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-orange-600 dark:bg-orange-500 text-white hover:bg-orange-700 dark:hover:bg-orange-400 text-xs font-semibold transition-colors shadow-xs"
            >
              <ArrowLeft className="w-4 h-4" /> Back to ATS Studio
            </Link>
          </div>
        </div>
      </div>

      {/* Main Grid Viewport */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: Timeline & Snapshots (4 Cols) */}
        <section className="lg:col-span-4 space-y-5">
          {/* Immutable Snapshot Rule Card (PRD §50) */}
          <div className="bg-white dark:bg-[#1b2220] rounded-xl border border-[#e1e3e2] dark:border-[#242c2a] p-5 space-y-3 shadow-sm">
            <div className="flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-orange-600 dark:text-orange-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-orange-950 dark:text-orange-300">Immutable Snapshot Rule</h3>
                <p className="text-xs text-[#727976] dark:text-[#a0aaa5] leading-relaxed">
                  Tailored modifications and lineage rollbacks are isolated within this variant. The underlying{" "}
                  <strong className="text-[#191c1c] dark:text-white font-semibold">Master Career Profile</strong> remains strictly immutable.
                </p>
              </div>
            </div>
            <div className="pt-2 border-t border-[#edeeee] dark:border-[#242c2a] flex items-center justify-between text-[11px] font-mono text-[#727976] dark:text-[#a0aaa5]">
              <span>Canonical SHA: <code className="text-orange-950 dark:text-orange-300">8f21ca9e</code></span>
              <span className="text-orange-950 dark:text-orange-300 font-semibold flex items-center gap-1">
                <Lock className="w-3 h-3 text-orange-600 dark:text-orange-400" /> Master Synced
              </span>
            </div>
          </div>

          {/* Timeline Checkpoints */}
          <div className="bg-white dark:bg-[#1b2220] rounded-xl border border-[#e1e3e2] dark:border-[#242c2a] p-5 space-y-4 shadow-sm">
            <div className="flex items-center justify-between pb-2 border-b border-[#edeeee] dark:border-[#242c2a]">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                <h3 className="text-sm font-bold text-[#191c1c] dark:text-white">Version Checkpoints</h3>
              </div>
              <span className="text-[11px] font-mono text-[#727976] dark:text-[#a0aaa5] bg-[#f8faf9] dark:bg-[#121816] px-2 py-0.5 rounded border border-[#edeeee] dark:border-[#242c2a]">
                {VERSIONS.length} snapshots
              </span>
            </div>

            <div className="space-y-3">
              {VERSIONS.map((ver) => {
                const isCurrentHead = headVersion === ver.version;
                const isCurrentBase = baseVersion === ver.version;

                return (
                  <div
                    key={ver.version}
                    onClick={() => {
                      if (ver.version !== headVersion) {
                        setBaseVersion(ver.version);
                      }
                    }}
                    className={`p-3.5 rounded-lg border text-xs cursor-pointer transition-all ${
                      isCurrentHead
                        ? "bg-orange-50/50 dark:bg-orange-950/30 border-orange-500 ring-1 ring-orange-500"
                        : isCurrentBase
                        ? "bg-[#f8faf9] dark:bg-[#121816] border-[#4c6079]"
                        : "bg-white dark:bg-[#1b2220] border-[#edeeee] dark:border-[#242c2a] hover:border-[#c1c8c5]"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-sm text-orange-950 dark:text-orange-400">{ver.version}</span>
                        {ver.isHead && (
                          <span className="px-1.5 py-0.5 rounded bg-orange-100 dark:bg-orange-950 text-orange-950 dark:text-orange-300 font-mono text-[10px] font-bold uppercase">
                            Active Head
                          </span>
                        )}
                        {isCurrentBase && (
                          <span className="px-1.5 py-0.5 rounded bg-[#eef3f8] dark:bg-zinc-800 text-[#4c6079] dark:text-zinc-300 font-mono text-[10px] font-bold uppercase">
                            Comparing Baseline
                          </span>
                        )}
                      </div>
                      <span className="font-mono font-bold text-xs text-orange-950 dark:text-orange-400 flex items-center gap-1">
                        <TrendingUp className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" /> {ver.atsScore}/100
                      </span>
                    </div>

                    <p className="text-xs font-semibold text-[#191c1c] dark:text-white mt-1">{ver.summary}</p>
                    <p className="text-[11px] text-[#727976] dark:text-[#a0aaa5] mt-0.5">{ver.tagline}</p>

                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#edeeee] dark:border-[#242c2a] font-mono text-[10px] text-[#727976] dark:text-[#a0aaa5]">
                      <span>{ver.updatedAt} • {ver.wordCount} words</span>
                      <span className="text-orange-950 dark:text-orange-400 font-semibold">
                        {isCurrentHead ? "Candidate" : isCurrentBase ? "Baseline" : "Click to Compare"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* JD Keyword Heatmap */}
          <div className="bg-white dark:bg-[#1b2220] rounded-xl border border-[#e1e3e2] dark:border-[#242c2a] p-5 space-y-3 shadow-sm">
            <div className="flex items-center justify-between pb-2 border-b border-[#edeeee] dark:border-[#242c2a]">
              <h3 className="text-xs font-bold font-mono text-orange-950 dark:text-orange-400 uppercase tracking-wider">
                Stripe JD Keyword Match
              </h3>
              <span className="text-xs font-mono text-orange-600 dark:text-orange-400 font-bold">+18% vs V1</span>
            </div>
            <div className="flex flex-wrap gap-1.5 text-xs font-mono">
              {[
                "Interaction to Next Paint (INP)",
                "Webpack to Vite",
                "Payment Gateway SDK",
                "TypeScript Strict Mode",
              ].map((kw) => (
                <span key={kw} className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-orange-100 dark:bg-orange-950/60 text-orange-950 dark:text-orange-300 font-medium border border-orange-200 dark:border-orange-900">
                  <CheckCircle2 className="w-3 h-3 text-orange-600 dark:text-orange-400" /> {kw}
                </span>
              ))}
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#f8faf9] dark:bg-[#121816] border border-[#edeeee] dark:border-[#242c2a] text-[#727976] dark:text-[#a0aaa5]">
                + Distributed Tracing
              </span>
            </div>
          </div>
        </section>

        {/* RIGHT MAIN WORKSPACE: Side-by-Side Diff Viewer (8 Cols) */}
        <section className="lg:col-span-8 space-y-5">
          {/* Controls & Quantitative Delta Cards */}
          <div className="bg-white dark:bg-[#1b2220] rounded-xl border border-[#e1e3e2] dark:border-[#242c2a] p-5 space-y-4 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#edeeee] dark:border-[#242c2a]">
              <div className="flex items-center gap-2 text-xs font-mono">
                <span className="px-2.5 py-1 rounded bg-[#f8faf9] dark:bg-[#121816] border border-[#c1c8c5] dark:border-[#242c2a] font-semibold text-[#191c1c] dark:text-white">
                  Comparing: {baseVersion} → {headVersion}
                </span>
                <span className="text-[#727976] dark:text-[#a0aaa5] hidden sm:inline">• Performance & ATS Alignment</span>
              </div>

              {/* Toggles */}
              <div className="flex items-center gap-2">
                <div className="inline-flex p-0.5 rounded-lg bg-[#f8faf9] dark:bg-[#121816] border border-[#edeeee] dark:border-[#242c2a] text-xs font-mono">
                  <button
                    type="button"
                    onClick={() => setDiffMode("split")}
                    className={`px-3 py-1 rounded-md font-medium transition-colors ${
                      diffMode === "split" ? "bg-white dark:bg-[#1b2220] text-orange-950 dark:text-orange-300 shadow-xs font-bold" : "text-[#727976] dark:text-[#8c9390] hover:text-[#191c1c]"
                    }`}
                  >
                    Split View
                  </button>
                  <button
                    type="button"
                    onClick={() => setDiffMode("unified")}
                    className={`px-3 py-1 rounded-md font-medium transition-colors ${
                      diffMode === "unified" ? "bg-white dark:bg-[#1b2220] text-orange-950 dark:text-orange-300 shadow-xs font-bold" : "text-[#727976] dark:text-[#8c9390] hover:text-[#191c1c]"
                    }`}
                  >
                    Unified
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setShowLineage(!showLineage)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-mono flex items-center gap-1.5 border transition-colors ${
                    showLineage
                      ? "bg-orange-100 dark:bg-orange-950 text-orange-950 dark:text-orange-300 border-orange-500 font-bold"
                      : "bg-[#f8faf9] dark:bg-[#121816] text-[#727976] dark:text-zinc-400 border-[#c1c8c5] dark:border-[#242c2a] hover:text-[#191c1c]"
                  }`}
                >
                  <Code className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" /> Lineage
                </button>

                <button
                  type="button"
                  onClick={handleRollback}
                  className="px-3 py-1.5 rounded-lg bg-[#f8faf9] dark:bg-[#121816] hover:bg-[#ffdad6] dark:hover:bg-red-950/50 text-[#ba1a1a] dark:text-red-400 border border-[#ffdad6] dark:border-red-900/50 text-xs font-mono font-medium transition-colors flex items-center gap-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Rollback to {baseVersion}
                </button>
              </div>
            </div>

            {rollbackSuccess && (
              <div className="bg-orange-100 dark:bg-orange-950/80 text-orange-950 dark:text-orange-300 p-3 rounded-lg text-xs font-mono font-bold flex items-center gap-2 border border-orange-200 dark:border-orange-800">
                <Check className="w-4 h-4 text-orange-600 dark:text-orange-400" /> Successfully rolled back Active Head to {baseVersion}!
              </div>
            )}

            {/* Quantitative Delta Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-3.5 rounded-lg bg-[#f8faf9] dark:bg-[#121816] border border-[#edeeee] dark:border-[#242c2a] space-y-1">
                <div className="flex justify-between items-center text-[10px] font-mono uppercase text-[#727976] dark:text-[#8c9390]">
                  <span>ATS Score Shift</span>
                  <span className="text-orange-950 dark:text-orange-300 font-bold bg-orange-100 dark:bg-orange-950 px-1.5 py-0.5 rounded border border-orange-200 dark:border-orange-900">+7 pts</span>
                </div>
                <div className="flex items-baseline gap-2 pt-1">
                  <span className="text-2xl font-bold font-mono text-orange-600 dark:text-orange-400">91</span>
                  <span className="text-xs text-[#727976] dark:text-[#8c9390]">from 84</span>
                </div>
                <div className="w-full h-1.5 bg-[#e1e3e2] dark:bg-zinc-800 rounded-full overflow-hidden mt-1">
                  <div className="h-full bg-orange-600 dark:bg-orange-500 rounded-full" style={{ width: "91%" }} />
                </div>
              </div>

              <div className="p-3.5 rounded-lg bg-[#f8faf9] dark:bg-[#121816] border border-[#edeeee] dark:border-[#242c2a] space-y-1">
                <div className="flex justify-between items-center text-[10px] font-mono uppercase text-[#727976] dark:text-[#8c9390]">
                  <span>JD Token Alignment</span>
                  <span className="text-orange-950 dark:text-orange-300 font-bold bg-orange-100 dark:bg-orange-950 px-1.5 py-0.5 rounded border border-orange-200 dark:border-orange-900">+4 Critical</span>
                </div>
                <div className="flex items-baseline gap-2 pt-1">
                  <span className="text-2xl font-bold font-mono text-orange-600 dark:text-orange-400">18 / 20</span>
                  <span className="text-xs text-[#727976] dark:text-[#8c9390]">tokens</span>
                </div>
                <p className="text-[10px] font-mono text-[#727976] dark:text-[#8c9390] truncate pt-0.5">Zero fluff; tech-stack aligned</p>
              </div>

              <div className="p-3.5 rounded-lg bg-[#f8faf9] dark:bg-[#121816] border border-[#edeeee] dark:border-[#242c2a] space-y-1">
                <div className="flex justify-between items-center text-[10px] font-mono uppercase text-[#727976] dark:text-[#8c9390]">
                  <span>Verbosity Optimization</span>
                  <span className="text-[#4c6079] dark:text-zinc-300 font-bold bg-[#eef3f8] dark:bg-zinc-800 px-1.5 py-0.5 rounded">-14 words</span>
                </div>
                <div className="flex items-baseline gap-2 pt-1">
                  <span className="text-2xl font-bold font-mono text-[#191c1c] dark:text-white">498</span>
                  <span className="text-xs text-[#727976] dark:text-[#8c9390]">sweet spot (450–520)</span>
                </div>
                <p className="text-[10px] font-mono text-[#727976] dark:text-[#8c9390] truncate pt-0.5">Optimal 1-page scanning density</p>
              </div>
            </div>
          </div>

          {/* Side-by-Side Diff Canvas */}
          <div className="bg-white dark:bg-[#1b2220] rounded-xl border border-[#e1e3e2] dark:border-[#242c2a] shadow-sm overflow-hidden space-y-0">
            {/* Column Headers */}
            <div className="grid grid-cols-1 md:grid-cols-2 bg-[#f8faf9] dark:bg-[#121816] px-5 py-3 border-b border-[#edeeee] dark:border-[#242c2a] text-xs font-mono">
              <div className="flex items-center justify-between pr-4 border-r border-[#edeeee] dark:border-[#242c2a]">
                <span className="font-bold text-[#4c6079] dark:text-zinc-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#4c6079]"></span> {baseVersion} (PREVIOUS BASELINE)
                </span>
                <span className="text-[#727976] dark:text-[#8c9390] text-[11px]">Yesterday 09:15</span>
              </div>
              <div className="flex items-center justify-between pl-4 pt-2 md:pt-0">
                <span className="font-bold text-orange-950 dark:text-orange-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-orange-600 dark:bg-orange-500"></span> {headVersion} (ACTIVE CANDIDATE)
                </span>
                <span className="text-orange-950 dark:text-orange-400 text-[11px] font-semibold">Today 14:20</span>
              </div>
            </div>

            {/* Section 1: Summary Diff */}
            <div className="p-5 space-y-3 border-b border-[#edeeee] dark:border-[#242c2a]">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-mono font-bold text-orange-950 dark:text-orange-400 uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-orange-600 dark:text-orange-400" /> 01. Professional Summary Diff
                </h4>
                <span className="text-[10px] font-mono bg-[#f8faf9] dark:bg-[#121816] px-2 py-0.5 rounded border border-[#edeeee] dark:border-[#242c2a] text-[#727976] dark:text-[#8c9390]">
                  Target: Stripe Connect Infra
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {/* Left Baseline */}
                <div className="p-3.5 bg-[#f8faf9] dark:bg-[#121816] rounded-lg border border-[#edeeee] dark:border-[#242c2a] space-y-2">
                  <p className="text-[#444746] dark:text-[#a0a3a2] leading-relaxed">
                    Frontend Software Engineer with 6+ years of experience delivering scalable web applications using React and TypeScript. Led UI architecture for consumer-facing dashboards and managed cloud deployment architectures on AWS.
                  </p>
                  {showLineage && (
                    <div className="pt-2 border-t border-[#edeeee] dark:border-[#242c2a] font-mono text-[10px] text-[#727976] dark:text-[#8c9390]">
                      Lineage: <code className="bg-[#edeeee] dark:bg-zinc-800 px-1 rounded text-[#4c6079] dark:text-zinc-300">[MCP_PROFILE_SUM_V2]</code>
                    </div>
                  )}
                </div>

                {/* Right Active Candidate */}
                <div className="p-3.5 bg-orange-50/40 dark:bg-orange-950/30 rounded-lg border border-orange-200 dark:border-orange-900 space-y-2">
                  <p className="text-[#191c1c] dark:text-white leading-relaxed">
                    Frontend Systems Engineer with 6+ years specializing in{" "}
                    <span className="bg-orange-100 dark:bg-orange-950 font-semibold text-orange-950 dark:text-orange-300 px-1 rounded">high-throughput payment flows</span>, low-latency client state architectures, and React/TypeScript. Proven record migrating monolithic enterprise frontends to Vite, driving{" "}
                    <span className="bg-orange-100 dark:bg-orange-950 font-semibold text-orange-950 dark:text-orange-300 px-1 rounded">sub-150ms INP metrics</span> across multi-tenant checkouts.
                  </p>
                  {showLineage && (
                    <div className="pt-2 border-t border-orange-200 dark:border-orange-900 font-mono text-[10px] text-orange-950 dark:text-orange-300 font-semibold">
                      Proof Tag: <code className="bg-orange-100 dark:bg-orange-950 px-1 rounded text-orange-950 dark:text-orange-300">[MCP_CLAIM_SYS_04]</code>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Section 2: Experience Bullets Diff */}
            <div className="p-5 space-y-3 border-b border-[#edeeee] dark:border-[#242c2a] bg-[#f8faf9]/50 dark:bg-[#121816]/50">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-mono font-bold text-orange-950 dark:text-orange-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-orange-600 dark:text-orange-400" /> 02. Experience Bullets & Proof Lineage
                </h4>
                <span className="text-[10px] font-mono text-[#727976] dark:text-[#8c9390]">Role: Lead Frontend Engineer @ CloudScale Inc</span>
              </div>

              {/* Bullet Pair 1 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 bg-[#ffdad6]/30 dark:bg-red-950/20 rounded-lg border border-[#ffdad6] dark:border-red-900/50 space-y-2">
                  <p className="text-[#ba1a1a] dark:text-red-400 line-through leading-relaxed">
                    Responsible for speeding up webpack compilation build times and improving client performance for the engineering team.
                  </p>
                  <span className="text-[10px] font-mono text-[#ba1a1a] dark:text-red-400 italic block">Vague phrasing (Flagged: Missing metrics)</span>
                </div>

                <div className="p-3.5 bg-orange-50/40 dark:bg-orange-950/30 rounded-lg border border-orange-200 dark:border-orange-900 space-y-2">
                  <p className="text-[#191c1c] dark:text-white leading-relaxed">
                    Spearheaded enterprise migration from Webpack 4 to{" "}
                    <span className="bg-orange-100 dark:bg-orange-950 font-semibold text-orange-950 dark:text-orange-300 px-1 rounded">Vite + ESBuild</span> across 42 repositories, reducing local dev server startup from 78s to{" "}
                    <span className="bg-orange-100 dark:bg-orange-950 font-semibold text-orange-950 dark:text-orange-300 px-1 rounded">1.4s (55x speedup)</span> and CI deployment bundle time by 41%.
                  </p>
                  <div className="flex items-center justify-between pt-1 font-mono text-[10px]">
                    <span className="text-orange-950 dark:text-orange-300 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-orange-600 dark:text-orange-400" /> Verified with Fact Vault
                    </span>
                    {showLineage && <span className="bg-orange-100 dark:bg-orange-950 text-orange-950 dark:text-orange-300 px-1.5 py-0.5 rounded font-bold">[Proof: EXP_001]</span>}
                  </div>
                </div>
              </div>

              {/* Bullet Pair 2 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 bg-white dark:bg-[#1b2220] rounded-lg border border-[#edeeee] dark:border-[#242c2a] space-y-2">
                  <p className="text-[#444746] dark:text-[#a0a3a2] leading-relaxed">
                    Designed and launched web billing and card processing UI widgets used by over 100,000 active merchant customers.
                  </p>
                </div>

                <div className="p-3.5 bg-orange-50/40 dark:bg-orange-950/30 rounded-lg border border-orange-200 dark:border-orange-900 space-y-2">
                  <p className="text-[#191c1c] dark:text-white leading-relaxed">
                    Engineered PCI-compliant iframe payment orchestration SDK adopting{" "}
                    <span className="bg-orange-100 dark:bg-orange-950 font-semibold text-orange-950 dark:text-orange-300 px-1 rounded">Web Components & Shadow DOM</span>, cutting client runtime payload by 38kB and ensuring zero third-party script leakage.
                  </p>
                  <div className="flex items-center justify-between pt-1 font-mono text-[10px]">
                    <span className="text-orange-950 dark:text-orange-300 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-orange-600 dark:text-orange-400" /> Vault ID #984
                    </span>
                    {showLineage && <span className="bg-orange-100 dark:bg-orange-950 text-orange-950 dark:text-orange-300 px-1.5 py-0.5 rounded font-bold">[Proof: EXP_002_VITE]</span>}
                  </div>
                </div>
              </div>
            </div>

            {/* Section 3: Skills Taxonomy Diff */}
            <div className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-mono font-bold text-orange-950 dark:text-orange-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Tag className="w-4 h-4 text-orange-600 dark:text-orange-400" /> 03. Skills Matrix & Taxonomy Alignment
                </h4>
                <span className="text-[10px] font-mono text-[#727976] dark:text-[#8c9390]">Categorization & Clustering</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                {/* Previous */}
                <div className="p-3.5 bg-[#f8faf9] dark:bg-[#121816] rounded-lg border border-[#edeeee] dark:border-[#242c2a] space-y-2">
                  <span className="text-[10px] uppercase font-bold text-[#727976] dark:text-[#8c9390]">Previous Keyword Grouping (V3)</span>
                  <div className="flex flex-wrap gap-1.5">
                    {["JavaScript (ES6+)", "React 18", "AWS Architecture", "HTML/CSS", "Jest / Cypress"].map((s) => (
                      <span key={s} className="px-2 py-0.5 rounded bg-white dark:bg-[#1b2220] border border-[#c1c8c5] dark:border-[#242c2a] text-[#444746] dark:text-[#a0a3a2]">
                        {s}
                      </span>
                    ))}
                    <span className="px-2 py-0.5 rounded bg-[#ffdad6] dark:bg-red-950/60 border border-[#ffdad6] dark:border-red-900/50 text-[#ba1a1a] dark:text-red-400 line-through">
                      Webpack Config
                    </span>
                  </div>
                </div>

                {/* Clustered V4 */}
                <div className="p-3.5 bg-orange-50/40 dark:bg-orange-950/30 rounded-lg border border-orange-200 dark:border-orange-900 space-y-2">
                  <span className="text-[10px] uppercase font-bold text-orange-950 dark:text-orange-400">Stripe JD Precision Clustered (V4)</span>
                  <div className="flex flex-wrap gap-1.5">
                    {["TypeScript (Strict)", "Web Performance & INP", "Vite / ESBuild Tooling"].map((s) => (
                      <span key={s} className="px-2 py-0.5 rounded bg-orange-600 dark:bg-orange-500 text-white font-bold">
                        {s}
                      </span>
                    ))}
                    {["Payment SDKs", "Browser Isolation & Iframes", "React Concurrency", "State Machines (XState)"].map((s) => (
                      <span key={s} className="px-2 py-0.5 rounded bg-orange-100 dark:bg-orange-950 text-orange-950 dark:text-orange-300 font-semibold border border-orange-200 dark:border-orange-900">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Audit Footer */}
            <div className="p-4 bg-[#f8faf9] dark:bg-[#121816] border-t border-[#edeeee] dark:border-[#242c2a] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono text-[#727976] dark:text-[#8c9390]">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                <span>All claims verifiable via Master Fact Vault hashes. No hallucinations detected.</span>
              </div>
              <div className="flex items-center gap-2">
                <span>Compare against:</span>
                <select
                  value={baseVersion}
                  onChange={(e) => setBaseVersion(e.target.value)}
                  className="px-2 py-1 bg-white dark:bg-[#1b2220] border border-[#c1c8c5] dark:border-[#242c2a] rounded text-xs text-[#191c1c] dark:text-zinc-100 font-semibold cursor-pointer"
                >
                  <option value="V3" className="dark:bg-[#1b2220]">Version 3 (Yesterday, 09:15)</option>
                  <option value="V2" className="dark:bg-[#1b2220]">Version 2 (3 days ago)</option>
                  <option value="V1" className="dark:bg-[#1b2220]">Version 1 (Original imported snapshot)</option>
                </select>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

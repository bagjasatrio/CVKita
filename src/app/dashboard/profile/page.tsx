"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Sparkles,
  Plus,
  Code2,
  Terminal,
  Globe,
  Share2,
  Mail,
  Edit2,
  Trash2,
  CheckCircle2,
  ExternalLink,
  MapPin,
  FileText,
} from "lucide-react";
import { AIRewriteModal } from "@/components/profile/ai-rewrite-modal";
import { EntryModal } from "@/components/profile/entry-modal";
import { useAuth } from "@/lib/auth-context";
import { useUserProfile } from "@/lib/use-user-profile";

export default function MasterCareerProfilePage() {
  const { user } = useAuth();
  const { profile: userStoreProfile, saveProfile, completenessPercentage } = useUserProfile();

  const [profile, setProfile] = useState<any>(null);

  // Sync local profile state with userStoreProfile
  useEffect(() => {
    setProfile({
      fullName: userStoreProfile.personalInfo.fullName || user?.name || "Career Builder",
      email: userStoreProfile.personalInfo.email || user?.email || "",
      headline: userStoreProfile.personalInfo.headline || "",
      summary: userStoreProfile.personalInfo.summary || "",
      location: userStoreProfile.personalInfo.location || "Not specified",
      pronouns: "they/them",
      links: {
        github: userStoreProfile.personalInfo.github || "",
        linkedin: userStoreProfile.personalInfo.linkedin || "",
        website: userStoreProfile.personalInfo.website || "",
      },
      experiences: userStoreProfile.experiences || [],
      projects: userStoreProfile.projects || [],
      skills: userStoreProfile.skills || [],
      educations: userStoreProfile.education || [],
      certifications: userStoreProfile.certifications || [],
      achievements: userStoreProfile.achievements || [],
    });
  }, [userStoreProfile, user]);

  // Modals state
  const [rewriteModal, setRewriteModal] = useState<{
    isOpen: boolean;
    text: string;
    targetType: "summary" | "bullet";
    expId?: string;
    bulletIdx?: number;
  }>({ isOpen: false, text: "", targetType: "summary" });

  const [entryModal, setEntryModal] = useState<{
    isOpen: boolean;
    section: "experience" | "education" | "project" | "skill" | "certification" | "identity" | "summary";
    initialData?: any;
    editIndex?: number;
  }>({ isOpen: false, section: "experience" });

  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importText, setImportText] = useState("");

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-3">
        <div className="w-10 h-10 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin" />
        <p className="text-xs text-slate-500 dark:text-zinc-400">Loading Master Career Profile...</p>
      </div>
    );
  }

  // Save profile helper
  const updateProfileData = (updated: any) => {
    setProfile(updated);
    saveProfile({
      ...userStoreProfile,
      personalInfo: {
        ...userStoreProfile.personalInfo,
        fullName: updated.fullName,
        email: updated.email,
        headline: updated.headline,
        summary: updated.summary,
        location: updated.location,
        github: updated.links?.github || "",
        linkedin: updated.links?.linkedin || "",
        website: updated.links?.website || "",
      },
      experiences: updated.experiences || [],
      projects: updated.projects || [],
      skills: updated.skills || [],
      education: updated.educations || [],
      certifications: updated.certifications || [],
      achievements: updated.achievements || [],
    });
  };

  const handleExportJSON = () => {
    const blob = new Blob([JSON.stringify(profile, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `CVForge_Career_Profile_${(profile.fullName || "User").replace(/\s+/g, "_")}.json`;
    a.click();
  };

  const handleImportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!importText.trim()) return;
    try {
      const parsed = JSON.parse(importText);
      const updated = {
        ...profile,
        fullName: parsed.fullName || parsed.name || profile.fullName,
        email: parsed.email || profile.email,
        headline: parsed.headline || parsed.title || profile.headline,
        summary: parsed.summary || parsed.bio || profile.summary,
        location: parsed.location || profile.location,
        experiences: Array.isArray(parsed.experiences) ? [...parsed.experiences, ...profile.experiences] : profile.experiences,
        projects: Array.isArray(parsed.projects) ? [...parsed.projects, ...profile.projects] : profile.projects,
        skills: Array.isArray(parsed.skills) ? [...parsed.skills.map((s: any, i: number) => ({ id: `sk_imp_${i}`, name: typeof s === 'string' ? s : s.name, category: 'Imported', verified: true })), ...profile.skills] : profile.skills,
      };
      updateProfileData(updated);
      setIsImportModalOpen(false);
      setImportText("");
    } catch (err) {
      alert("Format JSON tidak valid. Pastikan input berupa JSON LinkedIn / GitHub / CVForge profile.");
    }
  };

  const handleRewriteAccept = (enhancedText: string) => {
    if (rewriteModal.targetType === "summary") {
      updateProfileData({ ...profile, summary: enhancedText });
    } else if (rewriteModal.targetType === "bullet" && rewriteModal.expId !== undefined && rewriteModal.bulletIdx !== undefined) {
      const updatedExps = profile.experiences.map((exp: any) => {
        if (exp.id !== rewriteModal.expId) return exp;
        const newBullets = [...exp.bullets];
        newBullets[rewriteModal.bulletIdx!] = enhancedText;
        return { ...exp, bullets: newBullets };
      });
      updateProfileData({ ...profile, experiences: updatedExps });
    }
  };

  const handleSaveEntry = (data: any) => {
    if (entryModal.section === "identity") {
      updateProfileData({
        ...profile,
        fullName: data.fullName,
        headline: data.headline,
        email: data.email,
        location: data.location,
        links: {
          ...profile.links,
          github: data.github !== undefined ? data.github : profile.links?.github,
          linkedin: data.linkedin !== undefined ? data.linkedin : profile.links?.linkedin,
          website: data.website !== undefined ? data.website : profile.links?.website,
        },
      });
    } else if (entryModal.section === "summary") {
      updateProfileData({
        ...profile,
        summary: data.summary,
      });
    } else if (entryModal.section === "experience") {
      const exps = [...(profile.experiences || [])];
      if (entryModal.initialData?.id) {
        const idx = exps.findIndex((e) => e.id === entryModal.initialData.id);
        if (idx !== -1) exps[idx] = { ...exps[idx], ...data };
      } else {
        exps.unshift({
          ...data,
          id: `exp_${Date.now()}`,
          verified: true,
          sourceDocument: "Manual Entry (Verified)",
          bullets: Array.isArray(data.bullets)
            ? data.bullets
            : typeof data.bullets === "string"
            ? data.bullets.split("\n").filter(Boolean)
            : ["Key responsibility and achievement."],
        });
      }
      updateProfileData({ ...profile, experiences: exps });
    } else if (entryModal.section === "skill") {
      const skills = [...(profile.skills || [])];
      if (entryModal.initialData?.id) {
        const idx = skills.findIndex((s) => s.id === entryModal.initialData.id);
        if (idx !== -1) skills[idx] = { ...skills[idx], ...data };
      } else {
        skills.push({
          id: `sk_${Date.now()}`,
          name: data.name,
          category: data.category || "General",
          level: data.level || "Verified",
          verified: true,
        });
      }
      updateProfileData({ ...profile, skills });
    } else if (entryModal.section === "project") {
      const projs = [...(profile.projects || [])];
      if (entryModal.initialData?.id) {
        const idx = projs.findIndex((p) => p.id === entryModal.initialData.id);
        if (idx !== -1) projs[idx] = { ...projs[idx], ...data };
      } else {
        projs.unshift({
          ...data,
          id: `proj_${Date.now()}`,
          technologies: Array.isArray(data.technologies)
            ? data.technologies
            : typeof data.technologies === "string"
            ? data.technologies.split(",").map((s: string) => s.trim())
            : ["TypeScript"],
          verified: true,
        });
      }
      updateProfileData({ ...profile, projects: projs });
    } else if (entryModal.section === "education") {
      const edus = [...(profile.educations || [])];
      if (entryModal.initialData?.id) {
        const idx = edus.findIndex((e) => e.id === entryModal.initialData.id);
        if (idx !== -1) edus[idx] = { ...edus[idx], ...data };
      } else {
        edus.unshift({ ...data, id: `edu_${Date.now()}`, verified: true });
      }
      updateProfileData({ ...profile, educations: edus });
    } else if (entryModal.section === "certification") {
      const certs = [...(profile.certifications || [])];
      if (entryModal.initialData?.id) {
        const idx = certs.findIndex((c) => c.id === entryModal.initialData.id);
        if (idx !== -1) certs[idx] = { ...certs[idx], ...data };
      } else {
        certs.unshift({ ...data, id: `cert_${Date.now()}`, verified: true });
      }
      updateProfileData({ ...profile, certifications: certs });
    }
  };

  const handleDeleteExperience = (id: string) => {
    updateProfileData({
      ...profile,
      experiences: (profile.experiences || []).filter((e: any) => e.id !== id),
    });
  };

  const handleDeleteSkill = (id: string) => {
    updateProfileData({
      ...profile,
      skills: (profile.skills || []).filter((s: any) => s.id !== id),
    });
  };

  const handleDeleteProject = (id: string) => {
    updateProfileData({
      ...profile,
      projects: (profile.projects || []).filter((p: any) => p.id !== id),
    });
  };

  const handleDeleteEducation = (id: string) => {
    updateProfileData({
      ...profile,
      educations: (profile.educations || []).filter((e: any) => e.id !== id),
    });
  };

  const handleDeleteCertification = (id: string) => {
    updateProfileData({
      ...profile,
      certifications: (profile.certifications || []).filter((c: any) => c.id !== id),
    });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-16">
      {/* Control Bar / Header */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-zinc-800">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
              <span>Profile Engine</span>
              <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-zinc-700" />
              <span className="text-orange-600 dark:text-orange-400 font-semibold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-orange-500" /> Verified Source of Truth
              </span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-slate-900 dark:text-white mt-1">
              Master Career Profile
            </h1>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 max-w-3xl leading-relaxed">
              All tailored resumes are derived projection views of this profile. Updates made here automatically sync to all prospective versions without altering locked PDF exports.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 self-start lg:self-center">
            <button
              type="button"
              onClick={handleExportJSON}
              className="px-3.5 py-2 rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-200 hover:bg-slate-200 dark:hover:bg-zinc-700 transition-colors text-xs font-semibold flex items-center gap-1.5 shadow-2xs"
            >
              <Code2 className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-400" />
              <span>Export JSON</span>
            </button>
            <button
              type="button"
              onClick={() => setIsImportModalOpen(true)}
              className="px-3.5 py-2 rounded-lg bg-orange-500/10 dark:bg-orange-500/20 text-orange-700 dark:text-orange-300 border border-orange-500/30 hover:bg-orange-500/20 transition-colors text-xs font-semibold flex items-center gap-1.5 shadow-2xs"
            >
              <Share2 className="w-3.5 h-3.5 text-orange-500" />
              <span>Import GitHub / LinkedIn</span>
            </button>
            <button
              type="button"
              onClick={() => setEntryModal({ isOpen: true, section: "experience" })}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Plus className="w-4 h-4 text-orange-100" />
              <span>Add Entry</span>
            </button>
          </div>
        </div>

        {/* Telemetry & Health Tracker */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* Circular Progress Gauge */}
            <div className="relative w-12 h-12 shrink-0 flex items-center justify-center">
              <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-100 dark:text-zinc-800"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3.5"
                />
                <path
                  className="text-orange-500"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeDasharray={`${completenessPercentage}, 100`}
                  strokeLinecap="round"
                  strokeWidth="3.5"
                />
              </svg>
              <span className="absolute font-mono text-xs font-bold text-slate-900 dark:text-zinc-100">
                {completenessPercentage}%
              </span>
            </div>

            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-900 dark:text-zinc-100">Master Readiness Rating</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20 uppercase">
                  {completenessPercentage >= 80 ? "High Fidelity" : "In Progress"}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                All metrics strictly grounded in primary PDF documents in your Fact Vault.
              </p>
            </div>
          </div>

          {/* Jump Navigation Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto py-1">
            <a href="#personal-info" className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-xs font-medium text-slate-700 dark:text-zinc-300 whitespace-nowrap transition-colors">
              Identity
            </a>
            <a href="#experience" className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-xs font-medium text-slate-700 dark:text-zinc-300 whitespace-nowrap transition-colors">
              Experience ({profile.experiences.length})
            </a>
            <a href="#projects" className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-xs font-medium text-slate-700 dark:text-zinc-300 whitespace-nowrap transition-colors">
              Projects ({profile.projects.length})
            </a>
            <a href="#skills" className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-xs font-medium text-slate-700 dark:text-zinc-300 whitespace-nowrap transition-colors">
              Skills ({profile.skills.length})
            </a>
            <a href="#education" className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-xs font-medium text-slate-700 dark:text-zinc-300 whitespace-nowrap transition-colors">
              Education ({profile.educations.length})
            </a>
          </div>
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Heavy Canvas */}
        <div className="lg:col-span-8 space-y-6">
          {/* SECTION 1: Personal & Contact Identity */}
          <section id="personal-info" className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                <h2 className="text-sm font-bold text-slate-900 dark:text-zinc-100 uppercase tracking-wider">
                  Identity & Digital Anchors
                </h2>
              </div>
              <button
                type="button"
                onClick={() =>
                  setEntryModal({
                    isOpen: true,
                    section: "identity",
                    initialData: {
                      fullName: profile.fullName,
                      headline: profile.headline,
                      email: profile.email,
                      location: profile.location,
                      github: profile.links?.github || "",
                      linkedin: profile.links?.linkedin || "",
                      website: profile.links?.website || "",
                    },
                  })
                }
                className="text-xs font-semibold text-orange-600 dark:text-orange-400 hover:underline flex items-center gap-1"
              >
                <Edit2 className="w-3.5 h-3.5" /> Edit Identity
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <span className="font-semibold text-slate-400 dark:text-zinc-500 uppercase text-[10px]">Full Legal Name</span>
                <p className="text-sm font-bold text-slate-900 dark:text-zinc-100 mt-0.5">{profile.fullName || "Not specified"}</p>
              </div>
              <div>
                <span className="font-semibold text-slate-400 dark:text-zinc-500 uppercase text-[10px]">Designation</span>
                <p className="text-sm font-bold text-slate-900 dark:text-zinc-100 mt-0.5">{profile.headline || "Add your target role title..."}</p>
              </div>
              <div>
                <span className="font-semibold text-slate-400 dark:text-zinc-500 uppercase text-[10px]">Primary Base</span>
                <p className="text-sm font-bold text-slate-900 dark:text-zinc-100 mt-0.5 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500" /> {profile.location || "Not specified"}
                </p>
              </div>
            </div>

            {/* Digital Anchors */}
            <div className="pt-2 flex flex-wrap items-center gap-2 text-xs">
              {profile.email && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300">
                  <Mail className="w-3.5 h-3.5 text-orange-500" />
                  <span>{profile.email}</span>
                </span>
              )}
              {profile.links?.github && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300">
                  <Terminal className="w-3.5 h-3.5 text-orange-500" />
                  <span>{profile.links.github}</span>
                </span>
              )}
              {profile.links?.linkedin && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300">
                  <Share2 className="w-3.5 h-3.5 text-orange-500" />
                  <span>{profile.links.linkedin}</span>
                </span>
              )}
              {profile.links?.website && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300">
                  <Globe className="w-3.5 h-3.5 text-orange-500" />
                  <span>{profile.links.website}</span>
                </span>
              )}
            </div>
          </section>

          {/* SECTION 2: Professional Synthesis */}
          <section className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                <h2 className="text-sm font-bold text-slate-900 dark:text-zinc-100 uppercase tracking-wider">
                  Verified Professional Synthesis
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setEntryModal({
                      isOpen: true,
                      section: "summary",
                      initialData: { summary: profile.summary || "" },
                    })
                  }
                  className="text-xs font-semibold text-orange-600 dark:text-orange-400 hover:underline flex items-center gap-1"
                >
                  <Edit2 className="w-3.5 h-3.5" /> Edit Summary
                </button>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50/80 dark:bg-zinc-950/60 border border-slate-200/80 dark:border-zinc-800 text-xs text-slate-700 dark:text-zinc-300 leading-relaxed">
              {profile.summary || "No professional summary added yet. Click Edit Summary or AI Content Polish to write a summary."}
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() =>
                  setRewriteModal({
                    isOpen: true,
                    text: profile.summary || "",
                    targetType: "summary",
                  })
                }
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-orange-500/10 dark:bg-orange-500/20 text-orange-700 dark:text-orange-300 border border-orange-500/30 hover:bg-orange-500/20 text-xs font-semibold transition-colors shadow-2xs"
              >
                <Sparkles className="w-3.5 h-3.5 text-orange-500" />
                <span>AI Content Polish</span>
              </button>
            </div>
          </section>

          {/* SECTION 3: Work Experience */}
          <section id="experience" className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                <h2 className="text-sm font-bold text-slate-900 dark:text-zinc-100 uppercase tracking-wider">
                  Work Experience ({profile.experiences.length})
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setEntryModal({ isOpen: true, section: "experience" })}
                className="text-xs font-semibold text-orange-600 dark:text-orange-400 hover:underline flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Experience
              </button>
            </div>

            {profile.experiences.length > 0 ? (
              <div className="space-y-4">
                {profile.experiences.map((exp: any) => (
                  <div key={exp.id} className="p-4 rounded-xl bg-slate-50/80 dark:bg-zinc-950/60 border border-slate-200/80 dark:border-zinc-800 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">{exp.role}</h3>
                          <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20">
                            Verified
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                          {exp.company} • {exp.startDate} - {exp.endDate} • {exp.location}
                        </p>
                      </div>

                      <div className="flex items-center gap-1 self-start sm:self-auto">
                        <button
                          type="button"
                          onClick={() =>
                            setEntryModal({
                              isOpen: true,
                              section: "experience",
                              initialData: exp,
                            })
                          }
                          className="p-1.5 rounded-md hover:bg-slate-200 dark:hover:bg-zinc-800 text-slate-500 dark:text-zinc-400 transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteExperience(exp.id)}
                          className="p-1.5 rounded-md hover:bg-red-500/10 text-red-500 dark:text-red-400 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-slate-200/60 dark:border-zinc-800">
                      {(exp.bullets || []).map((bullet: string, bIdx: number) => (
                        <div
                          key={bIdx}
                          className="p-2.5 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs flex items-start justify-between gap-3 group"
                        >
                          <p className="text-slate-800 dark:text-zinc-200 leading-relaxed flex-1">{bullet}</p>
                          <button
                            type="button"
                            onClick={() =>
                              setRewriteModal({
                                isOpen: true,
                                text: bullet,
                                targetType: "bullet",
                                expId: exp.id,
                                bulletIdx: bIdx,
                              })
                            }
                            className="p-1 rounded text-orange-600 dark:text-orange-400 hover:bg-orange-500/10 transition-colors shrink-0"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center bg-slate-50/50 dark:bg-zinc-950/40 rounded-xl border border-dashed border-slate-200 dark:border-zinc-800 space-y-2">
                <p className="text-xs text-slate-500 dark:text-zinc-400">No work experience added yet.</p>
                <button
                  type="button"
                  onClick={() => setEntryModal({ isOpen: true, section: "experience" })}
                  className="px-3 py-1.5 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white text-xs font-semibold rounded-lg"
                >
                  + Add Your First Work Experience
                </button>
              </div>
            )}
          </section>

          {/* SECTION 4: Projects */}
          <section id="projects" className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                <h2 className="text-sm font-bold text-slate-900 dark:text-zinc-100 uppercase tracking-wider">
                  Featured Projects ({profile.projects?.length || 0})
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setEntryModal({ isOpen: true, section: "project" })}
                className="text-xs font-semibold text-orange-600 dark:text-orange-400 hover:underline flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Project
              </button>
            </div>

            {profile.projects?.length > 0 ? (
              <div className="space-y-4">
                {profile.projects.map((proj: any) => (
                  <div key={proj.id} className="p-4 rounded-xl bg-slate-50/80 dark:bg-zinc-950/60 border border-slate-200/80 dark:border-zinc-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">{proj.title}</h3>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setEntryModal({ isOpen: true, section: "project", initialData: proj })}
                          className="p-1.5 rounded-md hover:bg-slate-200 dark:hover:bg-zinc-800 text-slate-500 dark:text-zinc-400 transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteProject(proj.id)}
                          className="p-1.5 rounded-md hover:bg-red-500/10 text-red-500 dark:text-red-400 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    {proj.description && <p className="text-xs text-slate-600 dark:text-zinc-300 leading-relaxed">{proj.description}</p>}
                    {proj.technologies && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {(Array.isArray(proj.technologies) ? proj.technologies : [proj.technologies]).map((tech: string, idx: number) => (
                          <span key={idx} className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-200/70 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300">
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 dark:text-zinc-400">No projects listed. Click Add Project to highlight your portfolio.</p>
            )}
          </section>

          {/* SECTION 5: Education */}
          <section id="education" className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                <h2 className="text-sm font-bold text-slate-900 dark:text-zinc-100 uppercase tracking-wider">
                  Education ({profile.educations?.length || 0})
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setEntryModal({ isOpen: true, section: "education" })}
                className="text-xs font-semibold text-orange-600 dark:text-orange-400 hover:underline flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Education
              </button>
            </div>

            {profile.educations?.length > 0 ? (
              <div className="space-y-3">
                {profile.educations.map((edu: any) => (
                  <div key={edu.id} className="p-3.5 rounded-xl bg-slate-50/80 dark:bg-zinc-950/60 border border-slate-200/80 dark:border-zinc-800 flex items-center justify-between text-xs">
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-zinc-100">{edu.institution}</h3>
                      <p className="text-slate-500 dark:text-zinc-400">{edu.degree} {edu.fieldOfStudy ? `• ${edu.fieldOfStudy}` : ""} ({edu.startDate || ""} - {edu.endDate || ""})</p>
                      {edu.grade && <span className="text-[11px] font-mono text-orange-600 dark:text-orange-400">GPA: {edu.grade}</span>}
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setEntryModal({ isOpen: true, section: "education", initialData: edu })}
                        className="p-1.5 rounded-md hover:bg-slate-200 dark:hover:bg-zinc-800 text-slate-500 dark:text-zinc-400 transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteEducation(edu.id)}
                        className="p-1.5 rounded-md hover:bg-red-500/10 text-red-500 dark:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 dark:text-zinc-400">No education history added yet.</p>
            )}
          </section>

          {/* SECTION 6: Skills */}
          <section id="skills" className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                <h2 className="text-sm font-bold text-slate-900 dark:text-zinc-100 uppercase tracking-wider">
                  Technical Skills ({profile.skills.length})
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setEntryModal({ isOpen: true, section: "skill" })}
                className="text-xs font-semibold text-orange-600 dark:text-orange-400 hover:underline flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Skill
              </button>
            </div>

            {profile.skills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {profile.skills.map((s: any) => (
                  <div
                    key={s.id}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-xs font-medium text-slate-800 dark:text-zinc-200"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-orange-500" />
                    <span>{s.name}</span>
                    <button
                      type="button"
                      onClick={() => setEntryModal({ isOpen: true, section: "skill", initialData: s })}
                      className="text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteSkill(s.id)}
                      className="text-slate-400 dark:text-zinc-500 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 dark:text-zinc-400">No skills recorded. Click Add Skill to list your technologies.</p>
            )}
          </section>

          {/* SECTION 7: Certifications */}
          <section id="certifications" className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                <h2 className="text-sm font-bold text-slate-900 dark:text-zinc-100 uppercase tracking-wider">
                  Certifications ({profile.certifications?.length || 0})
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setEntryModal({ isOpen: true, section: "certification" })}
                className="text-xs font-semibold text-orange-600 dark:text-orange-400 hover:underline flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Certification
              </button>
            </div>

            {profile.certifications?.length > 0 ? (
              <div className="space-y-3">
                {profile.certifications.map((cert: any) => (
                  <div key={cert.id} className="p-3.5 rounded-xl bg-slate-50/80 dark:bg-zinc-950/60 border border-slate-200/80 dark:border-zinc-800 flex items-center justify-between text-xs">
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-zinc-100">{cert.name}</h3>
                      <p className="text-slate-500 dark:text-zinc-400">{cert.issuer} {cert.issueDate ? `• ${cert.issueDate}` : ""}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setEntryModal({ isOpen: true, section: "certification", initialData: cert })}
                        className="p-1.5 rounded-md hover:bg-slate-200 dark:hover:bg-zinc-800 text-slate-500 dark:text-zinc-400 transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteCertification(cert.id)}
                        className="p-1.5 rounded-md hover:bg-red-500/10 text-red-500 dark:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 dark:text-zinc-400">No certifications added yet.</p>
            )}
          </section>
        </div>

        {/* Right Inspector */}
        <div className="lg:col-span-4 space-y-6 sticky top-20">
          <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-slate-900 dark:text-zinc-100 uppercase tracking-wider">
              Profile Completeness Breakdown
            </h3>
            <div className="space-y-2 text-xs">
              {[
                { label: "Personal Information", weight: 15, done: Boolean(profile.fullName && profile.email) },
                { label: "Work Experience", weight: 20, done: profile.experiences.length > 0 },
                { label: "Education History", weight: 15, done: profile.educations.length > 0 },
                { label: "Project Portfolio", weight: 15, done: profile.projects.length > 0 },
                { label: "Technical Skills", weight: 15, done: profile.skills.length >= 3 },
                { label: "Summary Synthesis", weight: 10, done: Boolean(profile.summary) },
                { label: "Certifications", weight: 5, done: profile.certifications.length > 0 },
                { label: "Digital Anchors / Links", weight: 5, done: Boolean(profile.links?.github || profile.links?.linkedin) },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs py-1 border-b border-slate-100 dark:border-zinc-800/80 last:border-0">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className={`w-3.5 h-3.5 ${item.done ? "text-orange-500" : "text-slate-300 dark:text-zinc-700"}`} />
                    <span className={item.done ? "text-slate-900 dark:text-zinc-100 font-medium" : "text-slate-400 dark:text-zinc-500"}>
                      {item.label}
                    </span>
                  </span>
                  <span className="font-mono text-[11px] text-slate-400 dark:text-zinc-500">{item.weight}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Modals */}
      <AIRewriteModal
        isOpen={rewriteModal.isOpen}
        onClose={() => setRewriteModal((prev) => ({ ...prev, isOpen: false }))}
        originalText={rewriteModal.text}
        type={rewriteModal.targetType}
        onAccept={handleRewriteAccept}
      />

      <EntryModal
        isOpen={entryModal.isOpen}
        onClose={() => setEntryModal((prev) => ({ ...prev, isOpen: false }))}
        section={entryModal.section}
        initialData={entryModal.initialData}
        onSave={handleSaveEntry}
      />

      {/* Modal Import GitHub / LinkedIn JSON */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white dark:bg-zinc-900 rounded-xl max-w-lg w-full p-6 shadow-xl space-y-4 border border-slate-200 dark:border-zinc-800">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-zinc-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                <Share2 className="w-4 h-4 text-orange-600 dark:text-orange-400" /> Import Profile Data (GitHub / LinkedIn JSON)
              </h3>
              <button type="button" onClick={() => setIsImportModalOpen(false)} className="text-slate-400 hover:text-slate-900 dark:hover:text-white">✕</button>
            </div>
            <form onSubmit={handleImportSubmit} className="space-y-3">
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Tempelkan skema JSON data profil karier dari ekspor LinkedIn atau GitHub API untuk digabungkan secara otomatis ke Master Profile Anda.
              </p>
              <textarea
                rows={7}
                required
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                placeholder='{\n  "name": "John Doe",\n  "skills": ["TypeScript", "React"],\n  "experiences": [...] \n}'
                className="w-full p-3 border border-slate-200 dark:border-zinc-800 rounded-lg text-xs font-mono focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-zinc-950 text-slate-900 dark:text-zinc-100"
              />
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setIsImportModalOpen(false)} className="px-4 py-2 text-xs font-medium text-slate-500 dark:text-zinc-400">Batal</button>
                <button type="submit" className="px-4 py-2 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white rounded-lg text-xs font-semibold">Gabungkan ke Master Profile</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

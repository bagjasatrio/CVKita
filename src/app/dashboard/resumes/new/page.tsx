"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  User,
  Briefcase,
  GraduationCap,
  FileText,
  Award,
  CheckCircle2,
  Plus,
  Trash2,
  ChevronRight,
  ChevronLeft,
  Printer,
  Sparkles,
  Globe,
  Check,
  FileSearch,
  RotateCcw,
  Save,
  FolderGit2,
  ArrowLeft,
  X,
  Trophy,
  LayoutTemplate,
  Home,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import { useUserProfile } from "@/lib/use-user-profile";
import { MonthYearPicker } from "@/components/ui/month-year-picker";
import { GlassConfirmModal } from "@/components/ui/glass-confirm-modal";
import { exportResumeToDocx } from "@/lib/export-docx";

const STEPS = [
  { id: 1, name: "Informasi Pribadi", icon: User },
  { id: 2, name: "Pengalaman Kerja", icon: Briefcase },
  { id: 3, name: "Project", icon: FolderGit2 },
  { id: 4, name: "Pendidikan", icon: GraduationCap },
  { id: 5, name: "Keahlian", icon: Sparkles },
  { id: 6, name: "Ringkasan Profil", icon: FileText },
  { id: 7, name: "Data Pendukung & Prestasi", icon: Award },
  { id: 8, name: "Selesai & Ekspor", icon: CheckCircle2 },
];

export default function NewResumePage() {
  const router = useRouter();
  const { profile, saveProfile } = useUserProfile();

  const [currentStep, setCurrentStep] = useState(1);
  const [template, setTemplate] = useState("ats");
  const [cvLanguage, setCvLanguage] = useState<"id" | "en">("id");
  const [isDraftRestored, setIsDraftRestored] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const [mobileTab, setMobileTab] = useState<"form" | "preview">("form");
  const [aiEnhancingExpId, setAiEnhancingExpId] = useState<string | null>(null);

  // State for sleek GlassConfirmModal dialog
  const [confirmModalState, setConfirmModalState] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    confirmText: string;
    variant?: "danger" | "warning" | "info";
    action: () => void;
  }>({
    isOpen: false,
    title: "",
    description: "",
    confirmText: "Ya, Lanjutkan",
    variant: "danger",
    action: () => {},
  });

  const SECTION_TITLES = {
    id: {
      summary: "RINGKASAN PROFIL",
      experience: "PENGALAMAN KERJA",
      projects: "PROJECT",
      education: "PENDIDIKAN",
      skills: "KETERAMPILAN",
      languages: "PENGUASAAN BAHASA",
      certifications: "SERTIFIKASI & LISENSI",
      achievements: "PRESTASI & PENGHARGAAN",
    },
    en: {
      summary: "PROFILE SUMMARY",
      experience: "WORK EXPERIENCE",
      projects: "PROJECTS",
      education: "EDUCATION",
      skills: "SKILLS",
      languages: "LANGUAGES",
      certifications: "CERTIFICATIONS & LICENSES",
      achievements: "HONORS & ACHIEVEMENTS",
    },
  };

  // Form States (Starts 100% empty)
  const [personalInfo, setPersonalInfo] = useState({
    targetRole: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    linkedin: "",
    portfolioUrl: "",
    postalCode: "",
    cityState: "",
    fullAddress: "",
    country: "",
  });

  const [experiences, setExperiences] = useState<any[]>([]);
  const [education, setEducation] = useState<any[]>([]);
  const [skills, setSkills] = useState<any[]>([]);
  const [useCategories, setUseCategories] = useState(true);
  const [summary, setSummary] = useState("");
  const [certifications, setCertifications] = useState<any[]>([]);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [languages, setLanguages] = useState<{ id: string; name: string; level: string; included?: boolean }[]>([]);

  const searchParams = useSearchParams();
  const isFresh = searchParams?.get("fresh") === "true" || searchParams?.get("reset") === "true";

  // Load autosaved draft from localStorage on mount if not fresh
  useEffect(() => {
    try {
      if (isFresh) {
        localStorage.removeItem("cvforge_resume_builder_draft");
      }
      const savedDraft = !isFresh ? localStorage.getItem("cvforge_resume_builder_draft") : null;
      if (savedDraft) {
        const draft = JSON.parse(savedDraft);
        if (draft.personalInfo) setPersonalInfo(draft.personalInfo);
        if (draft.experiences) setExperiences(draft.experiences);
        if (draft.education) setEducation(draft.education);
        if (draft.skills) setSkills(draft.skills);
        if (typeof draft.useCategories === "boolean") setUseCategories(draft.useCategories);
        if (draft.summary) setSummary(draft.summary);
        if (draft.certifications) setCertifications(draft.certifications);
        if (draft.achievements) setAchievements(draft.achievements);
        if (draft.projects) setProjects(draft.projects);
        if (draft.languages) setLanguages(draft.languages);
        if (draft.template) setTemplate(draft.template);
        if (draft.cvLanguage) setCvLanguage(draft.cvLanguage);
        if (draft.currentStep) setCurrentStep(draft.currentStep);
        setIsDraftRestored(true);
      }
    } catch (e) {
      console.error("Failed to load CV draft", e);
    }

    const timer = setTimeout(() => {
      setIsHydrated(true);
    }, 150);

    return () => clearTimeout(timer);
  }, [isFresh]);

  // Autosave draft to localStorage on state changes
  useEffect(() => {
    if (!isHydrated) return;
    const draft = {
      personalInfo,
      experiences,
      education,
      skills,
      useCategories,
      summary,
      certifications,
      achievements,
      projects,
      languages,
      template,
      cvLanguage,
      currentStep,
      updatedAt: new Date().toISOString(),
    };
    try {
      localStorage.setItem("cvforge_resume_builder_draft", JSON.stringify(draft));
    } catch (e) {
      console.error("Failed to autosave CV draft", e);
    }
  }, [isHydrated, personalInfo, experiences, education, skills, summary, certifications, achievements, projects, languages, template, cvLanguage, currentStep]);

  // Derived full name & data check
  const fullName = `${personalInfo.firstName} ${personalInfo.lastName}`.trim() || "";
  const hasAnyData = Boolean(
    fullName ||
    personalInfo.targetRole ||
    personalInfo.email ||
    summary ||
    experiences.length > 0 ||
    projects.length > 0 ||
    education.length > 0 ||
    skills.length > 0 ||
    languages.length > 0 ||
    certifications.length > 0 ||
    achievements.length > 0
  );

  // Dynamic Template Styles
  const getTemplateStyles = () => {
    switch (template) {
      case "modern":
        return {
          container: "font-sans text-[#191c1c]",
          headerAlign: "text-left border-l-4 border-orange-500 pl-3 py-1 bg-orange-50/80 rounded-r-lg",
          nameText: "text-base font-extrabold tracking-tight uppercase text-orange-950",
          roleText: "text-[11px] font-bold tracking-wider uppercase text-orange-600",
          contactText: "text-[9.5px] text-[#4c6079] flex flex-wrap gap-x-2 gap-y-0.5 mt-1 font-sans",
          sectionHeader: "border-b-2 border-orange-500 pb-0.5 mb-1",
          sectionTitle: "text-[11px] font-bold uppercase tracking-wider text-orange-900 flex items-center gap-1.5",
        };
      case "executive":
        return {
          container: "font-serif text-[#1e293b]",
          headerAlign: "text-center pb-1.5 border-b-2 border-double border-slate-900",
          nameText: "text-lg font-bold tracking-widest uppercase text-slate-900",
          roleText: "text-[10px] font-semibold tracking-widest uppercase text-[#475569] mt-0.5",
          contactText: "text-[9.5px] text-[#475569] flex flex-wrap items-center justify-center gap-x-2 gap-y-0.5 mt-1 font-sans",
          sectionHeader: "border-b-2 border-slate-900 pb-0.5 mb-1 text-center",
          sectionTitle: "text-[11px] font-bold uppercase tracking-widest text-slate-900",
        };
      case "tech":
        return {
          container: "font-mono text-[#0f172a]",
          headerAlign: "text-left border-b-2 border-indigo-600 pb-1.5",
          nameText: "text-base font-black tracking-tight text-indigo-950",
          roleText: "text-[10.5px] font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded inline-block mt-0.5 border border-indigo-200",
          contactText: "text-[9px] text-[#64748b] flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-1.5 font-mono",
          sectionHeader: "border-b-2 border-indigo-600 pb-0.5 mb-1",
          sectionTitle: "text-[10.5px] font-mono font-bold uppercase tracking-wider text-indigo-900",
        };
      case "ats":
      default:
        return {
          container: "font-sans text-[#191c1c]",
          headerAlign: "text-center pb-1",
          nameText: "text-sm font-bold tracking-tight uppercase text-black",
          roleText: "text-[10px] font-medium tracking-wider uppercase text-[#4c6079]",
          contactText: "flex flex-wrap items-center justify-center gap-x-1.5 gap-y-0.5 text-[9.5px] text-[#4c6079] leading-tight font-sans",
          sectionHeader: "border-b-2 border-black pb-0.5 mb-1",
          sectionTitle: "text-[10.5px] font-bold uppercase tracking-wider text-black",
        };
    }
  };

  const tStyle = getTemplateStyles();

  // Handlers for Projects
  const addProject = () => {
    setProjects((prev) => [
      ...prev,
      { id: `proj_${Date.now()}`, name: "", role: "", link: "", startDate: "", endDate: "", bullets: "", included: true },
    ]);
  };
  const updateProject = (id: string, field: string, val: any) => {
    setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, [field]: val } : p)));
  };
  const removeProject = (id: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
  };

  // Handlers for Certifications
  const addCert = () => {
    setCertifications((prev) => [
      ...prev,
      { id: `cert_${Date.now()}`, name: "", issuer: "", issueDate: "", included: true },
    ]);
  };
  const updateCert = (id: string, field: string, val: any) => {
    setCertifications((prev) => prev.map((c) => (c.id === id ? { ...c, [field]: val } : c)));
  };
  const removeCert = (id: string) => {
    setCertifications((prev) => prev.filter((c) => c.id !== id));
  };

  // Handlers for Achievements
  const addAchievement = () => {
    setAchievements((prev) => [
      ...prev,
      { id: `ach_${Date.now()}`, title: "", issuer: "", date: "", impact: "", description: "", included: true },
    ]);
  };
  const updateAchievement = (id: string, field: string, val: any) => {
    setAchievements((prev) => prev.map((a) => (a.id === id ? { ...a, [field]: val } : a)));
  };
  const removeAchievement = (id: string) => {
    setAchievements((prev) => prev.filter((a) => a.id !== id));
  };

  // AI Enhancement Handler for Experience Bullets
  const handleEnhanceExpBullets = async (expId: string, bulletsText: string, roleTitle: string) => {
    setAiEnhancingExpId(expId);
    try {
      const res = await fetch("/api/ai/rewrite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: bulletsText || roleTitle || "Software Engineer", type: "bullet", style: "action_oriented" }),
      });
      const data = await res.json();
      if (data.success && data.data?.enhancedText) {
        updateExp(expId, "bullets", data.data.enhancedText);
      }
    } catch (e) {
      console.error("AI enhancement failed", e);
    } finally {
      setAiEnhancingExpId(null);
    }
  };

  // Reset / Clear Draft
  const clearDraft = () => {
    setConfirmModalState({
      isOpen: true,
      title: "Hapus Draf CV?",
      description: "Apakah Anda yakin ingin menghapus draf ini dan mulai dari awal? Seluruh data draf yang telah diisi akan dibersihkan.",
      confirmText: "Ya, Hapus Draf",
      variant: "danger",
      action: () => {
        try {
          localStorage.removeItem("cvforge_resume_builder_draft");
        } catch (e) {}
        setPersonalInfo({
          targetRole: "",
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
          linkedin: "",
          portfolioUrl: "",
          postalCode: "",
          cityState: "",
          fullAddress: "",
          country: "",
        });
        setExperiences([]);
        setEducation([]);
        setSkills([]);
        setSummary("");
        setCertifications([]);
        setAchievements([]);
        setProjects([]);
        setLanguages([]);
        setCurrentStep(1);
        setIsDraftRestored(false);
      },
    });
  };

  const handlePromptCancelCreation = () => {
    setConfirmModalState({
      isOpen: true,
      title: "Batalkan Pembuatan CV?",
      description: "Apakah Anda yakin ingin membatalkan pembuatan CV ini dan kembali ke daftar resumes? Draf yang belum tersimpan akan dibatalkan.",
      confirmText: "Ya, Batalkan Buat CV",
      variant: "warning",
      action: () => {
        try {
          localStorage.removeItem("cvforge_resume_builder_draft");
        } catch (e) {}
        router.push("/dashboard/resumes");
      },
    });
  };

  // Function to optionally import data from Master Profile on demand
  const importFromProfile = () => {
    if (!profile) return;
    const nameParts = (profile.personalInfo.fullName || "").split(" ");
    const fName = profile.personalInfo.firstName || nameParts[0] || "";
    const lName = profile.personalInfo.lastName || nameParts.slice(1).join(" ") || "";

    setPersonalInfo({
      targetRole: profile.personalInfo.targetRole || profile.personalInfo.headline || "",
      firstName: fName,
      lastName: lName,
      email: profile.personalInfo.email || "",
      phone: profile.personalInfo.phone || "",
      linkedin: profile.personalInfo.linkedin || "",
      portfolioUrl: profile.personalInfo.website || profile.personalInfo.portfolioUrl || "",
      postalCode: profile.personalInfo.postalCode || "",
      cityState: profile.personalInfo.location || profile.personalInfo.cityState || "",
      fullAddress: profile.personalInfo.fullAddress || "",
      country: profile.personalInfo.country || "",
    });

    if (profile.experiences?.length) {
      setExperiences(
        profile.experiences.map((e) => ({
          id: e.id,
          company: e.company,
          role: e.role,
          startDate: e.startDate,
          endDate: e.endDate,
          isCurrent: e.isCurrent,
          location: e.location,
          bullets: Array.isArray(e.bullets) ? e.bullets.join("\n") : e.bullets || "",
          included: true,
        }))
      );
    }

    if (profile.education?.length) {
      setEducation(
        profile.education.map((edu) => ({
          id: edu.id,
          institution: edu.institution,
          degree: edu.degree,
          fieldOfStudy: edu.fieldOfStudy,
          startDate: edu.startDate,
          endDate: edu.endDate,
          gpa: edu.gpa || "",
          included: true,
        }))
      );
    }

    if (profile.skills?.length) {
      setSkills(
        profile.skills.map((s) => ({ id: s.id, name: s.name, level: s.proficiency > 2 ? "Advanced" : "Intermediate", category: s.category || "Core Development" }))
      );
    }

    if (profile.personalInfo.summary) setSummary(profile.personalInfo.summary);
    if (profile.certifications?.length) setCertifications(profile.certifications.map((c: any) => ({ ...c, included: true })));
    if (profile.achievements?.length) setAchievements(profile.achievements.map((a: any) => ({ ...a, included: true })));
    if (profile.projects?.length) setProjects(profile.projects.map((p: any) => ({ ...p, included: true })));
    if (profile.languages?.length) setLanguages(profile.languages.map((l: any) => ({ ...l, included: true })));
  };

  // Handlers for dynamic lists
  const addExperience = () => {
    setExperiences((prev) => [
      ...prev,
      { id: `exp_${Date.now()}`, company: "", role: "", startDate: "", endDate: "", isCurrent: false, location: "", bullets: "", included: true },
    ]);
  };
  const updateExp = (id: string, field: string, val: any) => {
    setExperiences((prev) => prev.map((e) => (e.id === id ? { ...e, [field]: val } : e)));
  };
  const removeExp = (id: string) => {
    setExperiences((prev) => prev.filter((e) => e.id !== id));
  };

  const addEdu = () => {
    setEducation((prev) => [
      ...prev,
      { id: `edu_${Date.now()}`, institution: "", degree: "", fieldOfStudy: "", startDate: "", endDate: "", gpa: "", included: true },
    ]);
  };
  const updateEdu = (id: string, field: string, val: any) => {
    setEducation((prev) => prev.map((e) => (e.id === id ? { ...e, [field]: val } : e)));
  };
  const removeEdu = (id: string) => {
    setEducation((prev) => prev.filter((e) => e.id !== id));
  };

  const [categories, setCategories] = useState<string[]>([
    "Core Development",
    "Database & Backend",
    "DevOps & Tools",
    "AI & Automation",
  ]);
  const [newCategoryInput, setNewCategoryInput] = useState("");

  const groupSkillsByCategory = (skillsList: any[]) => {
    const groups: { [key: string]: string[] } = {};
    skillsList.forEach((s) => {
      const name = typeof s === "string" ? s : s.name;
      if (!name) return;
      const cat = (typeof s === "object" && s.category && s.category.trim()) ? s.category.trim() : "Core Development";
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(name);
    });
    return Object.entries(groups).map(([category, items]) => ({ category, items }));
  };

  const addCategory = () => {
    if (!newCategoryInput.trim()) return;
    const catName = newCategoryInput.trim();
    if (!categories.includes(catName)) {
      setCategories((prev) => [...prev, catName]);
    }
    setNewCategoryInput("");
  };

  const removeCategory = (catName: string) => {
    if (categories.length <= 1) return;
    const nextCategories = categories.filter((c) => c !== catName);
    setCategories(nextCategories);
    const fallbackCat = nextCategories[0] || "Core Development";
    setSkills((prev) => prev.map((s) => (s.category === catName ? { ...s, category: fallbackCat } : s)));
  };

  const addSkill = (categoryName?: string) => {
    const targetCategory = categoryName || categories[0] || "Core Development";
    setSkills((prev) => [
      ...prev,
      { id: `sk_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`, name: "", category: targetCategory },
    ]);
  };
  const updateSkillName = (id: string, name: string) => {
    setSkills((prev) => prev.map((s) => (s.id === id ? { ...s, name } : s)));
  };
  const updateSkillCategory = (id: string, category: string) => {
    setSkills((prev) => prev.map((s) => (s.id === id ? { ...s, category } : s)));
  };
  const removeSkill = (id: string) => setSkills((prev) => prev.filter((s) => s.id !== id));

  const [newLangInput, setNewLangInput] = useState("");
  const [newLangLevel, setNewLangLevel] = useState("Fasih");

  const LANGUAGE_LEVEL_OPTIONS = {
    id: [
      { value: "Bahasa Asli", label: "Bahasa Asli" },
      { value: "Fasih", label: "Fasih" },
      { value: "Mahir", label: "Mahir" },
      { value: "Menengah", label: "Menengah" },
      { value: "Rendah", label: "Rendah" },
    ],
    en: [
      { value: "Native", label: "Native" },
      { value: "Fluent", label: "Fluent" },
      { value: "Advanced", label: "Advanced" },
      { value: "Intermediate", label: "Intermediate" },
      { value: "Elementary", label: "Elementary" },
    ],
  };

  const formatLanguageLevel = (level: string, lang: "id" | "en") => {
    if (!level || level === "Working Proficiency") return "";
    if (level === "Bahasa Asli" || level === "Penutur Asli" || level === "Native") return lang === "en" ? "Native" : "Bahasa Asli";
    if (level === "Fasih" || level === "Fluent") return lang === "en" ? "Fluent" : "Fasih";
    if (level === "Mahir" || level === "Advanced") return lang === "en" ? "Advanced" : "Mahir";
    if (level === "Menengah" || level === "Intermediate") return lang === "en" ? "Intermediate" : "Menengah";
    if (level === "Rendah" || level === "Pemula" || level === "Elementary") return lang === "en" ? "Elementary" : "Rendah";
    return level;
  };

  const addLanguage = () => {
    if (!newLangInput.trim()) return;
    setLanguages((prev) => [...prev, { id: `lang_${Date.now()}`, name: newLangInput.trim(), level: newLangLevel, included: true }]);
    setNewLangInput("");
  };
  const updateLanguageLevel = (id: string, level: string) => {
    setLanguages((prev) => prev.map((l) => (l.id === id ? { ...l, level } : l)));
  };
  const removeLanguage = (id: string) => setLanguages((prev) => prev.filter((l) => l.id !== id));

  const handlePrint = () => {
    window.print();
  };

  const handleExportDocx = () => {
    exportResumeToDocx({
      fullName,
      personalInfo,
      summary,
      validExperiences: experiences.filter((e) => e.included !== false),
      validProjects: projects.filter((p) => p.included !== false),
      validEducation: education.filter((e) => e.included !== false),
      validSkills: skills.filter((s) => s.included !== false),
      validCertifications: certifications.filter((c) => c.included !== false),
      validLanguages: languages.filter((l) => l.included !== false),
    });
  };

  const handleSaveCV = () => {
    const resumeId = `res_${Date.now()}`;
    const newResume = {
      id: resumeId,
      title: `${personalInfo.targetRole || "CV"} — ${fullName || "Tanpa Nama"}`,
      role: personalInfo.targetRole || "General",
      company: "Target Company",
      template,
      atsScore: 90,
      updated: "Just now",
      contentSnapshot: {
        template,
        fullName,
        personalInfo,
        summary,
        experiences,
        education,
        skills,
        useCategories,
        certifications,
        achievements,
        projects,
        languages,
      },
    };

    try {
      localStorage.removeItem("cvforge_resume_builder_draft");
    } catch (e) {}

    saveProfile({
      ...profile,
      resumes: [newResume, ...(profile.resumes || [])],
      certifications: certifications.length > 0 ? certifications : profile.certifications,
      achievements: achievements.length > 0 ? achievements : profile.achievements,
      languages: languages.length > 0 ? languages : profile.languages,
    });

    router.push("/dashboard/resumes");
  };

  return (
    <div className="min-h-screen bg-[#f8faf9] flex flex-col font-sans">
      {/* Sticky Top Header Bar with Back & Controls */}
      <div className="bg-white dark:bg-[#1b2220] border-b border-[#e1e3e2] dark:border-[#242c2a] px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3 print:hidden transition-colors">
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/dashboard/resumes"
            className="p-1.5 sm:p-2 rounded-lg border border-[#e1e3e2] dark:border-[#242c2a] text-[#727976] dark:text-[#8c9390] hover:bg-[#f2f4f3] dark:hover:bg-[#1b2220] hover:text-[#191c1c] transition-colors flex items-center gap-1"
            title="Kembali ke Daftar Resumes"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-xs font-semibold sm:hidden">Kembali</span>
          </Link>
          <div>
            <h1 className="text-xs sm:text-sm font-bold text-[#191c1c] dark:text-[#e1e3e2]">Buat CV Baru</h1>
            <p className="text-[10px] sm:text-[11px] text-[#727976] dark:text-[#8c9390]">Langkah {currentStep} dari 8 — {STEPS.find(s => s.id === currentStep)?.name}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Template Switcher Dropdown */}
          <div className="hidden sm:flex items-center gap-1.5 border border-[#e1e3e2] dark:border-[#242c2a] rounded-xl px-2.5 py-1 bg-[#f8faf9] dark:bg-[#121816]">
            <LayoutTemplate className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" />
            <select
              value={template}
              onChange={(e) => setTemplate(e.target.value)}
              className="bg-transparent dark:bg-[#121816] text-xs font-bold text-slate-900 dark:text-zinc-100 focus:outline-none cursor-pointer pr-1"
              title="Pilih Layout Template CV"
            >
              <option value="ats" className="dark:bg-[#1b2220] dark:text-zinc-100">ATS Classic (Mono)</option>
              <option value="modern" className="dark:bg-[#1b2220] dark:text-zinc-100">Modern Clean (Sunset Orange)</option>
              <option value="executive" className="dark:bg-[#1b2220] dark:text-zinc-100">Executive Minimalist (Navy)</option>
              <option value="tech" className="dark:bg-[#1b2220] dark:text-zinc-100">Tech Developer (Indigo)</option>
            </select>
          </div>

          <button
            type="button"
            onClick={handleExportDocx}
            className="hidden md:inline-flex items-center gap-1.5 bg-white dark:bg-[#121816] border border-[#c1c8c5] dark:border-[#242c2a] text-slate-900 dark:text-zinc-200 px-3 py-1.5 rounded-xl text-xs font-semibold hover:bg-[#f8faf9] dark:hover:bg-[#1b2220] transition-colors"
            title="Download Word Document"
          >
            <FileText className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" />
            <span>DOCX</span>
          </button>

          <button
            type="button"
            onClick={handlePromptCancelCreation}
            className="inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-xl border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/60 text-xs font-semibold transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            <span className="hidden xs:inline sm:inline">Batalkan Buat CV</span>
            <span className="xs:hidden sm:hidden">Batal</span>
          </button>
        </div>
      </div>

      {/* Top Stepper Ribbon & Language Toggle */}
      <div className="bg-white dark:bg-[#1b2220] border-b border-[#e1e3e2] dark:border-[#242c2a] px-4 sm:px-6 py-2.5 shadow-xs print:hidden transition-colors">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center overflow-x-auto gap-2 py-1 scrollbar-none">
            {STEPS.map((s, idx) => {
              const isActive = currentStep === s.id;
              const isCompleted = currentStep > s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => setCurrentStep(s.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 ${
                    isActive
                      ? "bg-orange-600 text-white shadow-sm"
                      : isCompleted
                      ? "bg-orange-100 text-orange-950 hover:bg-orange-200"
                      : "bg-[#f2f4f3] text-[#727976] hover:bg-[#e7e8e8]"
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-[11px] ${
                      isActive
                        ? "bg-orange-100 text-orange-950"
                        : isCompleted
                        ? "bg-orange-600 text-white"
                        : "bg-[#e1e3e2] text-[#727976]"
                    }`}
                  >
                    {isCompleted ? <Check className="w-3.5 h-3.5" /> : s.id}
                  </div>
                  <span>{s.name}</span>
                  {idx < STEPS.length - 1 && (
                    <ChevronRight className="w-3.5 h-3.5 opacity-40 ml-1" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Language Selector & Draft Status Indicator */}
          <div className="flex items-center gap-2 shrink-0">
            {hasAnyData && (
              <div className="flex items-center gap-1.5 bg-orange-50 dark:bg-orange-950/60 border border-orange-200 dark:border-orange-900/50 px-2.5 py-1 rounded-xl text-[11px] text-orange-700 dark:text-orange-300 font-semibold">
                <Save className="w-3 h-3 text-orange-600 dark:text-orange-400 animate-pulse" />
                <span className="hidden sm:inline">Draf tersimpan</span>
                <button
                  type="button"
                  onClick={clearDraft}
                  className="ml-1 p-0.5 rounded hover:bg-orange-100 text-orange-600 hover:text-red-700 transition-colors"
                  title="Reset & Hapus Draf"
                >
                  <RotateCcw className="w-3 h-3" />
                </button>
              </div>
            )}

            <div className="flex items-center gap-1 border border-[#e1e3e2] rounded-xl p-1 bg-[#f8faf9]">
              <button
                type="button"
                onClick={() => setCvLanguage("id")}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  cvLanguage === "id"
                    ? "bg-orange-600 text-white shadow-xs"
                    : "text-[#727976] hover:text-[#191c1c]"
                }`}
              >
                🇮🇩 ID
              </button>
              <button
                type="button"
                onClick={() => setCvLanguage("en")}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  cvLanguage === "en"
                    ? "bg-orange-600 text-white shadow-xs"
                    : "text-[#727976] hover:text-[#191c1c]"
                }`}
              >
                🇬🇧 EN
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile View Switcher */}
      <div className="lg:hidden px-4 pt-3 flex items-center justify-center print:hidden">
        <div className="flex items-center gap-1 bg-[#edeeee] p-1 rounded-xl w-full max-w-sm">
          <button
            type="button"
            onClick={() => setMobileTab("form")}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              mobileTab === "form"
                ? "bg-orange-600 text-white shadow-xs"
                : "text-[#727976] hover:text-[#191c1c]"
            }`}
          >
            <FileText className="w-3.5 h-3.5" /> Form Editor
          </button>
          <button
            type="button"
            onClick={() => setMobileTab("preview")}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              mobileTab === "preview"
                ? "bg-orange-600 text-white shadow-xs"
                : "text-[#727976] hover:text-[#191c1c]"
            }`}
          >
            <FileSearch className="w-3.5 h-3.5" /> Pratinjau Live
          </button>
        </div>
      </div>

      {/* Main Workspace (Split Screen: Form Left vs Canvas Right) */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Interactive Form Controls (6 Cols) */}
        <div className={`lg:col-span-6 bg-white border border-[#e1e3e2] rounded-2xl p-4 sm:p-6 shadow-xs space-y-6 print:hidden ${
          mobileTab === "preview" ? "hidden lg:block" : "block"
        }`}>
          {/* STEP 1: Informasi Pribadi */}
          {currentStep === 1 && (
            <div className="space-y-4 animate-in fade-in">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h2 className="text-xl font-bold text-[#191c1c]">Informasi Pribadi</h2>
                  <p className="text-xs text-[#727976] mt-0.5">
                    Masukkan informasi dasar dan kontak agar rekruter mudah menghubungi Anda.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={importFromProfile}
                  className="inline-flex items-center gap-1.5 text-xs text-orange-950 bg-orange-100 hover:bg-orange-200 px-3 py-1.5 rounded-lg font-semibold transition-colors shrink-0"
                  title="Isi otomatis dari Master Profile"
                >
                  <Sparkles className="w-3.5 h-3.5" /> Import dari Profil
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-medium text-[#191c1c] mb-1">Posisi Pekerjaan Target</label>
                  <input
                    type="text"
                    value={personalInfo.targetRole}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, targetRole: e.target.value })}
                    placeholder="Misal: Frontend Developer, Marketing Specialist, HR Officer"
                    className="w-full px-3.5 py-2 rounded-lg border border-[#e1e3e2] bg-[#f8faf9] text-sm text-[#191c1c] focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-[#191c1c] mb-1">Nama Depan</label>
                    <input
                      type="text"
                      value={personalInfo.firstName}
                      onChange={(e) => setPersonalInfo({ ...personalInfo, firstName: e.target.value })}
                      placeholder="Misal: Bagja"
                      className="w-full px-3.5 py-2 rounded-lg border border-[#e1e3e2] bg-[#f8faf9] text-sm text-[#191c1c] focus:outline-none focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-[#191c1c] mb-1">Nama Belakang</label>
                    <input
                      type="text"
                      value={personalInfo.lastName}
                      onChange={(e) => setPersonalInfo({ ...personalInfo, lastName: e.target.value })}
                      placeholder="Misal: Satrio"
                      className="w-full px-3.5 py-2 rounded-lg border border-[#e1e3e2] bg-[#f8faf9] text-sm text-[#191c1c] focus:outline-none focus:border-orange-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-[#191c1c] mb-1">Email</label>
                    <input
                      type="email"
                      value={personalInfo.email}
                      onChange={(e) => setPersonalInfo({ ...personalInfo, email: e.target.value })}
                      placeholder="nama@domain.com"
                      className="w-full px-3.5 py-2 rounded-lg border border-[#e1e3e2] bg-[#f8faf9] text-sm text-[#191c1c] focus:outline-none focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-[#191c1c] mb-1">Nomor Telepon</label>
                    <input
                      type="text"
                      value={personalInfo.phone}
                      onChange={(e) => setPersonalInfo({ ...personalInfo, phone: e.target.value })}
                      placeholder="+62 812 3456 7890"
                      className="w-full px-3.5 py-2 rounded-lg border border-[#e1e3e2] bg-[#f8faf9] text-sm text-[#191c1c] focus:outline-none focus:border-orange-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-[#191c1c] mb-1">URL LinkedIn</label>
                    <input
                      type="text"
                      value={personalInfo.linkedin}
                      onChange={(e) => setPersonalInfo({ ...personalInfo, linkedin: e.target.value })}
                      placeholder="linkedin.com/in/username"
                      className="w-full px-3.5 py-2 rounded-lg border border-[#e1e3e2] bg-[#f8faf9] text-sm text-[#191c1c] focus:outline-none focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-[#191c1c] mb-1">URL Portofolio / Website</label>
                    <input
                      type="text"
                      value={personalInfo.portfolioUrl}
                      onChange={(e) => setPersonalInfo({ ...personalInfo, portfolioUrl: e.target.value })}
                      placeholder="portfolio.dev"
                      className="w-full px-3.5 py-2 rounded-lg border border-[#e1e3e2] bg-[#f8faf9] text-sm text-[#191c1c] focus:outline-none focus:border-orange-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-[#191c1c] mb-1">Kota, Provinsi</label>
                    <input
                      type="text"
                      value={personalInfo.cityState}
                      onChange={(e) => setPersonalInfo({ ...personalInfo, cityState: e.target.value })}
                      placeholder="Bandung, Jawa Barat"
                      className="w-full px-3.5 py-2 rounded-lg border border-[#e1e3e2] bg-[#f8faf9] text-sm text-[#191c1c] focus:outline-none focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-[#191c1c] mb-1">Kode Pos</label>
                    <input
                      type="text"
                      value={personalInfo.postalCode}
                      onChange={(e) => setPersonalInfo({ ...personalInfo, postalCode: e.target.value })}
                      placeholder="40132"
                      className="w-full px-3.5 py-2 rounded-lg border border-[#e1e3e2] bg-[#f8faf9] text-sm text-[#191c1c] focus:outline-none focus:border-orange-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-medium text-[#191c1c] mb-1">Alamat Lengkap</label>
                  <input
                    type="text"
                    value={personalInfo.fullAddress}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, fullAddress: e.target.value })}
                    placeholder="Jl. Ganesha No. 10"
                    className="w-full px-3.5 py-2 rounded-lg border border-[#e1e3e2] bg-[#f8faf9] text-sm text-[#191c1c] focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block font-medium text-[#191c1c] mb-1">Negara</label>
                  <input
                    type="text"
                    value={personalInfo.country}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, country: e.target.value })}
                    placeholder="Indonesia"
                    className="w-full px-3.5 py-2 rounded-lg border border-[#e1e3e2] bg-[#f8faf9] text-sm text-[#191c1c] focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Pengalaman Kerja */}
          {currentStep === 2 && (
            <div className="space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-[#191c1c]">Pengalaman Kerja</h2>
                  <p className="text-xs text-[#727976] mt-0.5">
                    Tuliskan riwayat pekerjaan Anda secara berurutan.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={addExperience}
                  className="inline-flex items-center gap-1.5 bg-orange-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-orange-700"
                >
                  <Plus className="w-3.5 h-3.5" /> Tambah
                </button>
              </div>

              {experiences.length === 0 ? (
                <div className="text-center py-10 border border-dashed border-[#c4c7c6] rounded-xl p-6 space-y-2">
                  <Briefcase className="w-8 h-8 mx-auto text-orange-400" />
                  <p className="text-xs font-semibold text-[#191c1c]">Belum ada pengalaman kerja</p>
                  <button
                    type="button"
                    onClick={addExperience}
                    className="inline-flex items-center gap-1.5 bg-orange-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium"
                  >
                    <Plus className="w-3.5 h-3.5" /> Tambah Pengalaman
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {experiences.map((exp, idx) => (
                    <div key={exp.id} className="p-4 rounded-xl border border-[#e1e3e2] bg-[#f8faf9] space-y-3 text-xs relative">
                      <div className="flex items-center justify-between border-b border-[#e1e3e2] pb-2">
                        <span className="font-bold text-slate-900">Pengalaman #{idx + 1}</span>
                        <div className="flex items-center gap-3">
                          <label className="flex items-center gap-1.5 text-xs text-zinc-900 cursor-pointer font-medium select-none">
                            <input
                              type="checkbox"
                              checked={exp.included !== false}
                              onChange={(e) => updateExp(exp.id, "included", e.target.checked)}
                              className="rounded text-orange-600 focus:ring-orange-500"
                            />
                            Tampilkan di CV
                          </label>
                          <button onClick={() => removeExp(exp.id)} className="text-red-500 hover:text-red-700">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block font-medium mb-1">Posisi Pekerjaan</label>
                          <input
                            value={exp.role}
                            onChange={(e) => updateExp(exp.id, "role", e.target.value)}
                            placeholder="Misal: Marketing Executive"
                            className="w-full px-3 py-1.5 rounded-lg border border-[#e1e3e2] bg-white text-xs"
                          />
                        </div>
                        <div>
                          <label className="block font-medium mb-1">Nama Perusahaan</label>
                          <input
                            value={exp.company}
                            onChange={(e) => updateExp(exp.id, "company", e.target.value)}
                            placeholder="Misal: PT Nusantara"
                            className="w-full px-3 py-1.5 rounded-lg border border-[#e1e3e2] bg-white text-xs"
                          />
                        </div>
                      </div>

                      <div className="pt-1">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-end">
                          <MonthYearPicker
                            label="Tanggal Mulai"
                            value={exp.startDate}
                            onChange={(val) => updateExp(exp.id, "startDate", val)}
                          />
                          <MonthYearPicker
                            label="Tanggal Selesai"
                            value={exp.endDate}
                            onChange={(val) => updateExp(exp.id, "endDate", val)}
                            allowPresent={true}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block font-medium">Poin Tanggung Jawab (1 baris per poin)</label>
                          <button
                            type="button"
                            disabled={aiEnhancingExpId === exp.id}
                            onClick={() =>
                              handleEnhanceExpBullets(
                                exp.id,
                                Array.isArray(exp.bullets) ? exp.bullets.join("\n") : exp.bullets || "",
                                exp.role
                              )
                            }
                            className="inline-flex items-center gap-1 text-[11px] text-orange-950 bg-orange-100 hover:bg-orange-200 border border-transparent px-2 py-0.5 rounded font-semibold transition-colors disabled:opacity-50"
                          >
                            <Sparkles className="w-3 h-3 text-orange-600" />
                            {aiEnhancingExpId === exp.id ? "Peningkat AI..." : "✨ Polish with AI"}
                          </button>
                        </div>
                        <textarea
                          rows={3}
                          value={Array.isArray(exp.bullets) ? exp.bullets.join("\n") : exp.bullets || ""}
                          onChange={(e) => updateExp(exp.id, "bullets", e.target.value)}
                          placeholder="Tuliskan pencapaian dan tanggung jawab utama..."
                          className="w-full p-2.5 rounded-lg border border-[#e1e3e2] bg-white text-xs resize-none"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* STEP 3: Project */}
          {currentStep === 3 && (
            <div className="space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-[#191c1c]">Project</h2>
                  <p className="text-xs text-[#727976] mt-0.5">
                    Tuliskan proyek-proyek penting yang telah Anda kerjakan.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={addProject}
                  className="inline-flex items-center gap-1.5 bg-orange-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-orange-700"
                >
                  <Plus className="w-3.5 h-3.5" /> Tambah
                </button>
              </div>

              {projects.length === 0 ? (
                <div className="text-center py-10 border border-dashed border-[#c4c7c6] rounded-xl p-6 space-y-2">
                  <FolderGit2 className="w-8 h-8 mx-auto text-orange-400" />
                  <p className="text-xs font-semibold text-[#191c1c]">Belum ada proyek ditambahkan</p>
                  <button
                    type="button"
                    onClick={addProject}
                    className="inline-flex items-center gap-1.5 bg-orange-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium"
                  >
                    <Plus className="w-3.5 h-3.5" /> Tambah Proyek
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {projects.map((proj, idx) => (
                    <div key={proj.id} className="p-4 rounded-xl border border-[#e1e3e2] bg-[#f8faf9] space-y-3 text-xs">
                      <div className="flex items-center justify-between border-b border-[#e1e3e2] pb-2">
                        <span className="font-bold text-slate-900">Proyek #{idx + 1}</span>
                        <div className="flex items-center gap-3">
                          <label className="flex items-center gap-1.5 text-xs text-zinc-900 cursor-pointer font-medium select-none">
                            <input
                              type="checkbox"
                              checked={proj.included !== false}
                              onChange={(e) => updateProject(proj.id, "included", e.target.checked)}
                              className="rounded text-orange-600 focus:ring-orange-500"
                            />
                            Tampilkan di CV
                          </label>
                          <button onClick={() => removeProject(proj.id)} className="text-red-500 hover:text-red-700">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block font-medium mb-1">Nama Proyek</label>
                          <input
                            type="text"
                            value={proj.name || ""}
                            onChange={(e) => updateProject(proj.id, "name", e.target.value)}
                            placeholder="Misal: Website E-Commerce"
                            className="w-full px-3 py-1.5 rounded-lg border border-[#e1e3e2] bg-white text-xs"
                          />
                        </div>
                        <div>
                          <label className="block font-medium mb-1">Peran / Posisi</label>
                          <input
                            type="text"
                            value={proj.role || ""}
                            onChange={(e) => updateProject(proj.id, "role", e.target.value)}
                            placeholder="Misal: Fullstack Developer"
                            className="w-full px-3 py-1.5 rounded-lg border border-[#e1e3e2] bg-white text-xs"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block font-medium mb-1">Link Proyek / Demo (Opsional)</label>
                          <input
                            type="text"
                            value={proj.link || ""}
                            onChange={(e) => updateProject(proj.id, "link", e.target.value)}
                            placeholder="https://github.com/..."
                            className="w-full px-3 py-1.5 rounded-lg border border-[#e1e3e2] bg-white text-xs"
                          />
                        </div>
                        <div>
                          <label className="block font-medium mb-1">Periode Proyek</label>
                          <input
                            type="text"
                            value={`${proj.startDate || ""} ${proj.endDate ? `- ${proj.endDate}` : ""}`.trim()}
                            onChange={(e) => {
                              const [s, eVal] = e.target.value.split("-");
                              updateProject(proj.id, "startDate", s?.trim() || "");
                              updateProject(proj.id, "endDate", eVal?.trim() || "");
                            }}
                            placeholder="2024 - 2025"
                            className="w-full px-3 py-1.5 rounded-lg border border-[#e1e3e2] bg-white text-xs"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block font-medium mb-1">Deskripsi / Poin Hasil (1 baris per poin)</label>
                        <textarea
                          rows={3}
                          value={Array.isArray(proj.bullets) ? proj.bullets.join("\n") : proj.bullets || ""}
                          onChange={(e) => updateProject(proj.id, "bullets", e.target.value)}
                          placeholder="Tuliskan pencapaian dan teknologi yang digunakan..."
                          className="w-full p-2.5 rounded-lg border border-[#e1e3e2] bg-white text-xs resize-none"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* STEP 4: Pendidikan */}
          {currentStep === 4 && (
            <div className="space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-[#191c1c]">Pendidikan</h2>
                  <p className="text-xs text-[#727976] mt-0.5">
                    Latar belakang akademis dan kualifikasi Anda.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={addEdu}
                  className="inline-flex items-center gap-1.5 bg-orange-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-orange-700"
                >
                  <Plus className="w-3.5 h-3.5" /> Tambah
                </button>
              </div>

              {education.length === 0 ? (
                <div className="text-center py-10 border border-dashed border-[#c4c7c6] rounded-xl p-6 space-y-2">
                  <GraduationCap className="w-8 h-8 mx-auto text-orange-400" />
                  <p className="text-xs font-semibold text-[#191c1c]">Belum ada data pendidikan</p>
                  <button
                    type="button"
                    onClick={addEdu}
                    className="inline-flex items-center gap-1.5 bg-orange-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium"
                  >
                    <Plus className="w-3.5 h-3.5" /> Tambah Pendidikan
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {education.map((edu, idx) => (
                    <div key={edu.id} className="p-4 rounded-xl border border-[#e1e3e2] bg-[#f8faf9] space-y-3 text-xs">
                      <div className="flex items-center justify-between border-b border-[#e1e3e2] pb-2">
                        <span className="font-bold text-slate-900">Pendidikan #{idx + 1}</span>
                        <div className="flex items-center gap-3">
                          <label className="flex items-center gap-1.5 text-xs text-zinc-900 cursor-pointer font-medium select-none">
                            <input
                              type="checkbox"
                              checked={edu.included !== false}
                              onChange={(e) => updateEdu(edu.id, "included", e.target.checked)}
                              className="rounded text-orange-600 focus:ring-orange-500"
                            />
                            Tampilkan di CV
                          </label>
                          <button onClick={() => removeEdu(edu.id)} className="text-red-500 hover:text-red-700">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block font-medium mb-1">Nama Institusi / Universitas</label>
                          <input
                            value={edu.institution}
                            onChange={(e) => updateEdu(edu.id, "institution", e.target.value)}
                            placeholder="Misal: Universitas Indonesia"
                            className="w-full px-3 py-1.5 rounded-lg border border-[#e1e3e2] bg-white text-xs"
                          />
                        </div>
                        <div>
                          <label className="block font-medium mb-1">Gelar / Tingkat</label>
                          <input
                            value={edu.degree}
                            onChange={(e) => updateEdu(edu.id, "degree", e.target.value)}
                            placeholder="Misal: Sarjana Ekonomi / S1"
                            className="w-full px-3 py-1.5 rounded-lg border border-[#e1e3e2] bg-white text-xs"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className="block font-medium mb-1">Jurusan</label>
                          <input
                            value={edu.fieldOfStudy}
                            onChange={(e) => updateEdu(edu.id, "fieldOfStudy", e.target.value)}
                            placeholder="Manajemen"
                            className="w-full px-3 py-1.5 rounded-lg border border-[#e1e3e2] bg-white text-xs"
                          />
                        </div>
                        <div>
                          <label className="block font-medium mb-1">IPK / Grade</label>
                          <input
                            value={edu.gpa}
                            onChange={(e) => updateEdu(edu.id, "gpa", e.target.value)}
                            placeholder="3.85 / 4.00"
                            className="w-full px-3 py-1.5 rounded-lg border border-[#e1e3e2] bg-white text-xs"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                        <MonthYearPicker
                          label="Bulan & Tahun Mulai"
                          value={edu.startDate || ""}
                          onChange={(val) => updateEdu(edu.id, "startDate", val)}
                        />
                        <MonthYearPicker
                          label="Bulan & Tahun Selesai / Lulus"
                          value={edu.endDate || ""}
                          onChange={(val) => updateEdu(edu.id, "endDate", val)}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* STEP 5: Keahlian */}
          {currentStep === 5 && (
            <div className="space-y-4 text-xs animate-in fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-[#191c1c]">Keahlian & Keterampilan</h2>
                  <p className="text-xs text-[#727976] mt-0.5">
                    Pilih apakah ingin mengelompokkan keahlian berdasarkan kategori atau daftar polos.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => addSkill()}
                  className="inline-flex items-center gap-1 text-xs text-orange-950 bg-orange-100 hover:bg-orange-200 px-3 py-1.5 rounded-lg font-semibold transition-colors shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" /> Tambah Keahlian
                </button>
              </div>

              {/* Mode Switcher */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-[#f2f4f3] p-2 rounded-xl border border-[#e1e3e2] gap-2">
                <span className="font-semibold text-[#191c1c] text-xs">Sistem Pengelompokan:</span>
                <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-[#e1e3e2] w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => setUseCategories(true)}
                    className={`flex-1 sm:flex-initial px-3 py-1 rounded-md text-xs font-bold transition-all ${
                      useCategories
                        ? "bg-orange-600 text-white shadow-xs"
                        : "text-[#727976] hover:text-[#191c1c]"
                    }`}
                  >
                    🏷️ Dengan Kategori
                  </button>
                  <button
                    type="button"
                    onClick={() => setUseCategories(false)}
                    className={`flex-1 sm:flex-initial px-3 py-1 rounded-md text-xs font-bold transition-all ${
                      !useCategories
                        ? "bg-orange-600 text-white shadow-xs"
                        : "text-[#727976] hover:text-[#191c1c]"
                    }`}
                  >
                    📋 Tanpa Kategori
                  </button>
                </div>
              </div>

              {/* Seksi Kelola Kategori */}
              {useCategories && (
                <div className="p-3 bg-[#f2f4f3] rounded-xl border border-[#e1e3e2] space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-xs">Kelola Kategori</span>
                    <span className="text-[11px] text-[#727976]">Tambah/hapus kategori sesuai kebutuhan</span>
                  </div>

                  <div className="flex flex-wrap gap-1.5 items-center">
                    {categories.map((cat) => (
                      <span
                        key={cat}
                        className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-lg bg-white border border-[#e1e3e2] text-slate-900 font-semibold"
                      >
                        <span>{cat}</span>
                        {categories.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeCategory(cat)}
                            className="text-[#727976] hover:text-red-600 ml-0.5"
                            title={`Hapus kategori ${cat}`}
                          >
                            ×
                          </button>
                        )}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="text"
                      value={newCategoryInput}
                      onChange={(e) => setNewCategoryInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addCategory();
                        }
                      }}
                      placeholder="Nama kategori baru (misal: Soft Skills)..."
                      className="flex-1 bg-white px-3 py-1.5 border border-[#e1e3e2] rounded-lg text-xs focus:outline-none focus:border-orange-500"
                    />
                    <button
                      type="button"
                      onClick={addCategory}
                      className="bg-orange-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-orange-700 shrink-0"
                    >
                      + Kategori
                    </button>
                  </div>
                </div>
              )}

              {skills.length === 0 ? (
                <div className="text-center py-6 border border-dashed border-[#e1e3e2] rounded-xl text-[#727976]">
                  Belum ada keahlian diset. Klik "+ Tambah Keahlian" di atas.
                </div>
              ) : (
                <div className="space-y-2">
                  {skills.map((s) => (
                    <div key={s.id} className="grid grid-cols-12 gap-2 items-center bg-[#f8faf9] border border-[#e1e3e2] p-2 rounded-lg">
                      {useCategories && (
                        <div className="col-span-5 sm:col-span-5">
                          <select
                            value={s.category || categories[0] || "Core Development"}
                            onChange={(e) => updateSkillCategory(s.id, e.target.value)}
                            className="w-full bg-white px-2.5 py-1.5 border border-[#e1e3e2] rounded text-xs font-semibold text-slate-900 focus:outline-none"
                          >
                            <option value="Tanpa Kategori">Tanpa Kategori</option>
                            {categories.map((c) => (
                              <option key={c} value={c}>
                                {c}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}

                      <div className={useCategories ? "col-span-6 sm:col-span-6" : "col-span-11"}>
                        <input
                          type="text"
                          value={s.name}
                          onChange={(e) => updateSkillName(s.id, e.target.value)}
                          placeholder="Nama skill / teknologi (misal: HTML5)"
                          className="w-full bg-white px-2.5 py-1.5 border border-[#e1e3e2] rounded text-xs focus:outline-none"
                        />
                      </div>

                      <div className="col-span-1 text-center">
                        <button
                          type="button"
                          onClick={() => removeSkill(s.id)}
                          className="text-[#727976] hover:text-red-600 p-1 transition-colors"
                          title="Hapus Skill"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* STEP 6: Ringkasan Profil */}
          {currentStep === 6 && (
            <div className="space-y-4 animate-in fade-in">
              <div>
                <h2 className="text-xl font-bold text-[#191c1c]">Ringkasan Profil</h2>
                <p className="text-xs text-[#727976] mt-0.5">
                  Tuliskan ringkasan profesional singkat 3-4 kalimat tentang pengalaman dan keunggulan Anda.
                </p>
              </div>

              <textarea
                rows={6}
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="Tuliskan ringkasan profil profesional Anda..."
                className="w-full p-3.5 rounded-xl border border-[#e1e3e2] bg-[#f8faf9] text-xs leading-relaxed text-[#191c1c] resize-none focus:outline-none focus:border-orange-500"
              />

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() =>
                    setSummary(
                      `Professional ${personalInfo.targetRole || "Specialist"} berpengalaman dalam memimpin proyek, optimasi alur kerja, dan kolaborasi lintas tim dengan hasil terukur.`
                    )
                  }
                  className="inline-flex items-center gap-1.5 text-xs text-orange-950 bg-orange-100 px-3 py-1.5 rounded-lg font-semibold hover:bg-orange-200"
                >
                  <Sparkles className="w-3.5 h-3.5" /> Template Summary Otomatis
                </button>
              </div>
            </div>
          )}

          {/* STEP 7: Data Pendukung & Prestasi (Certifications, Achievements, Languages) */}
          {currentStep === 7 && (
            <div className="space-y-6 animate-in fade-in">
              <div>
                <h2 className="text-xl font-bold text-[#191c1c]">Data Pendukung & Prestasi</h2>
                <p className="text-xs text-[#727976] mt-0.5">
                  Kelola Sertifikasi, Prestasi & Penghargaan, serta Penguasaan Bahasa.
                </p>
              </div>

              {/* 1. Sertifikasi & Lisensi */}
              <div className="space-y-3 p-4 rounded-xl border border-[#e1e3e2] bg-[#f8faf9]">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#191c1c] flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-orange-600" /> Sertifikasi & Lisensi
                  </label>
                  <button
                    type="button"
                    onClick={addCert}
                    className="inline-flex items-center gap-1 text-xs text-orange-950 bg-orange-100 hover:bg-orange-200 px-2.5 py-1 rounded-lg font-semibold"
                  >
                    <Plus className="w-3.5 h-3.5" /> Tambah Sertifikat
                  </button>
                </div>

                {certifications.length === 0 ? (
                  <p className="text-xs text-[#727976] italic">Belum ada sertifikasi ditambahkan.</p>
                ) : (
                  <div className="space-y-3">
                    {certifications.map((c, idx) => (
                      <div key={c.id} className="p-3 rounded-lg bg-white border border-[#e1e3e2] space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900">Sertifikat #{idx + 1}</span>
                          <button onClick={() => removeCert(c.id)} className="text-red-500 hover:text-red-700">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <input
                          type="text"
                          value={c.name || ""}
                          onChange={(e) => updateCert(c.id, "name", e.target.value)}
                          placeholder="Nama Sertifikasi (Misal: AWS Solution Architect)"
                          className="w-full px-3 py-1.5 rounded-lg border border-[#e1e3e2] text-xs bg-[#f8faf9]"
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            value={c.issuer || ""}
                            onChange={(e) => updateCert(c.id, "issuer", e.target.value)}
                            placeholder="Penerbit (Amazon Web Services)"
                            className="w-full px-3 py-1.5 rounded-lg border border-[#e1e3e2] text-xs bg-[#f8faf9]"
                          />
                          <input
                            type="text"
                            value={c.issueDate || ""}
                            onChange={(e) => updateCert(c.id, "issueDate", e.target.value)}
                            placeholder="Periode (Mei 2025)"
                            className="w-full px-3 py-1.5 rounded-lg border border-[#e1e3e2] text-xs bg-[#f8faf9]"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 2. Prestasi & Penghargaan */}
              <div className="space-y-3 p-4 rounded-xl border border-[#e1e3e2] bg-[#f8faf9]">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#191c1c] flex items-center gap-1.5">
                    <Trophy className="w-4 h-4 text-orange-600" /> Prestasi & Penghargaan
                  </label>
                  <button
                    type="button"
                    onClick={addAchievement}
                    className="inline-flex items-center gap-1 text-xs text-orange-950 bg-orange-100 hover:bg-orange-200 px-2.5 py-1 rounded-lg font-semibold"
                  >
                    <Plus className="w-3.5 h-3.5" /> Tambah Prestasi
                  </button>
                </div>

                {achievements.length === 0 ? (
                  <p className="text-xs text-[#727976] italic">Belum ada data prestasi ditambahkan.</p>
                ) : (
                  <div className="space-y-3">
                    {achievements.map((ach, idx) => (
                      <div key={ach.id} className="p-3 rounded-lg bg-white border border-[#e1e3e2] space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900">Prestasi #{idx + 1}</span>
                          <button onClick={() => removeAchievement(ach.id)} className="text-red-500 hover:text-red-700">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <input
                          type="text"
                          value={ach.title || ""}
                          onChange={(e) => updateAchievement(ach.id, "title", e.target.value)}
                          placeholder="Judul Prestasi (Misal: Juara 1 UI/UX National Competition)"
                          className="w-full px-3 py-1.5 rounded-lg border border-[#e1e3e2] text-xs bg-[#f8faf9]"
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            value={ach.issuer || ""}
                            onChange={(e) => updateAchievement(ach.id, "issuer", e.target.value)}
                            placeholder="Penyelenggara (Kemendikbudristek)"
                            className="w-full px-3 py-1.5 rounded-lg border border-[#e1e3e2] text-xs bg-[#f8faf9]"
                          />
                          <input
                            type="text"
                            value={ach.date || ""}
                            onChange={(e) => updateAchievement(ach.id, "date", e.target.value)}
                            placeholder="Tahun (2024)"
                            className="w-full px-3 py-1.5 rounded-lg border border-[#e1e3e2] text-xs bg-[#f8faf9]"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 3. Penguasaan Bahasa */}
              <div className="space-y-3 p-4 rounded-xl border border-[#e1e3e2] bg-[#f8faf9]">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#191c1c] flex items-center gap-1.5">
                  <Globe className="w-4 h-4 text-orange-600" /> Bahasa yang Dikuasai & Tingkatan
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                  <input
                    type="text"
                    value={newLangInput}
                    onChange={(e) => setNewLangInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") addLanguage(); }}
                    placeholder="Nama Bahasa (Misal: Bahasa Indonesia, English)..."
                    className="sm:col-span-6 px-3 py-1.5 rounded-lg border border-[#e1e3e2] text-xs bg-white"
                  />
                  <select
                    value={newLangLevel}
                    onChange={(e) => setNewLangLevel(e.target.value)}
                    className="sm:col-span-4 px-3 py-1.5 rounded-lg border border-[#e1e3e2] text-xs bg-white"
                  >
                    {LANGUAGE_LEVEL_OPTIONS[cvLanguage].map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <button onClick={addLanguage} className="sm:col-span-2 bg-orange-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-orange-700">
                    Tambah
                  </button>
                </div>

                {languages.length === 0 ? (
                  <p className="text-xs text-[#727976] italic">Belum ada penguasaan bahasa ditambahkan.</p>
                ) : (
                  <div className="space-y-2 pt-1">
                    {languages.map((l) => (
                      <div key={l.id} className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-[#e1e3e2] text-xs">
                        <div className="flex items-center gap-2">
                          <Globe className="w-3.5 h-3.5 text-orange-600" />
                          <span className="font-semibold text-[#191c1c]">{l.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <select
                            value={formatLanguageLevel(l.level, cvLanguage)}
                            onChange={(e) => updateLanguageLevel(l.id, e.target.value)}
                            className="px-2 py-1 rounded-lg border border-[#e1e3e2] text-xs bg-[#f8faf9] text-[#191c1c]"
                          >
                            {LANGUAGE_LEVEL_OPTIONS[cvLanguage].map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                          <button onClick={() => removeLanguage(l.id)} className="text-[#727976] hover:text-red-500 p-1">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 8: Selesai & Ekspor */}
          {currentStep === 8 && (
            <div className="space-y-6 animate-in fade-in">
              <div>
                <h2 className="text-xl font-bold text-[#191c1c]">CV Siap & Di-Tailor!</h2>
                <p className="text-xs text-[#727976] mt-0.5">
                  Pilih template tata letak dan ekspor CV Anda ke format PDF atau DOCX.
                </p>
              </div>

              {/* Template Selectors Grid */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: "ats", name: "ATS Classic", desc: "Single column paling kompatibel dengan filter rekruter." },
                  { id: "modern", name: "Modern Clean", desc: "Tampilan bersih dengan pembatas seksi Sunset Orange." },
                  { id: "executive", name: "Executive Minimal", desc: "Tata letak rapat khusus untuk profesional senior." },
                  { id: "tech", name: "Tech Developer", desc: "Tata letak modern khusus teknis & pengembang software." },
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTemplate(t.id)}
                    className={`p-3.5 rounded-xl border text-left transition-all ${
                      template === t.id
                        ? "border-orange-500 bg-orange-50/50 ring-1 ring-orange-500"
                        : "border-[#e1e3e2] bg-[#f8faf9]"
                    }`}
                  >
                    <p className="text-xs font-bold text-[#191c1c]">{t.name}</p>
                    <p className="text-[11px] text-[#727976] mt-1">{t.desc}</p>
                  </button>
                ))}
              </div>

              <div className="flex flex-col gap-3 pt-4 border-t border-[#edeeee]">
                <button
                  type="button"
                  onClick={handleSaveCV}
                  className="w-full py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4 text-white" />
                  <span>Simpan ke Dashboard My Resumes</span>
                </button>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={handleExportDocx}
                    className="py-2.5 border border-[#e1e3e2] bg-white hover:bg-[#f2f4f3] text-[#191c1c] rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
                  >
                    <FileText className="w-4 h-4 text-orange-600" />
                    <span>Export Word (DOCX)</span>
                  </button>
                  <button
                    type="button"
                    onClick={handlePrint}
                    className="py-2.5 border border-[#e1e3e2] bg-white hover:bg-[#f2f4f3] text-[#191c1c] rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
                  >
                    <Printer className="w-4 h-4 text-orange-600" />
                    <span>Cetak / PDF</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Form Bottom Navigation Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-[#edeeee]">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={() => setCurrentStep(currentStep - 1)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-[#e1e3e2] text-xs font-semibold text-[#727976] hover:bg-[#f8faf9]"
              >
                <ChevronLeft className="w-4 h-4" /> Kembali
              </button>
            ) : (
              <button
                type="button"
                onClick={handlePromptCancelCreation}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 text-xs font-semibold transition-colors"
              >
                <X className="w-3.5 h-3.5" /> Batalkan Buat CV
              </button>
            )}

            {currentStep < 8 ? (
              <button
                type="button"
                onClick={() => setCurrentStep(currentStep + 1)}
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold transition-colors shadow-sm"
              >
                <span>Selanjutnya</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : null}
          </div>
        </div>

        {/* RIGHT COLUMN: Live Real-time CV Preview Canvas (6 Cols) */}
        <div className={`lg:col-span-6 sticky top-24 print:col-span-12 print:static print:w-full print:m-0 print:p-0 cv-print-container ${
          mobileTab === "form" ? "hidden lg:block" : "block"
        }`}>
          <div className={`cv-print-canvas bg-white rounded-2xl border border-[#e1e3e2] shadow-md p-6 mx-auto ${tStyle.container} print:p-0 print:m-0 print:max-w-none print:shadow-none print:border-none print:rounded-none`}>
            {!hasAnyData ? (
              <div className="flex flex-col items-center justify-center min-h-[500px] text-center space-y-3 text-[#727976]">
                <FileSearch className="w-12 h-12 text-orange-300" />
                <h3 className="text-sm font-bold text-[#191c1c]">Pratinjau CV Real-time</h3>
                <p className="text-xs max-w-xs">
                  Isi form di sebelah kiri untuk melihat kanvas dokumen CV ter-update secara otomatis.
                </p>
              </div>
            ) : (
              <div className="space-y-2 text-[#191c1c]">
                {/* Dynamic Header Canvas */}
                <div className={`pb-1 space-y-0.5 ${tStyle.headerAlign}`}>
                  <h1 className={tStyle.nameText}>
                    {fullName || "NAMA ANDA"}
                  </h1>
                  {personalInfo.targetRole && (
                    <p className={tStyle.roleText}>
                      {personalInfo.targetRole}
                    </p>
                  )}
                  <div className={tStyle.contactText}>
                    {[personalInfo.fullAddress, personalInfo.cityState, personalInfo.postalCode, personalInfo.country].filter(Boolean).length > 0 && (
                      <span>
                        {[personalInfo.fullAddress, personalInfo.cityState, personalInfo.postalCode, personalInfo.country].filter(Boolean).join(", ")}
                      </span>
                    )}
                    {personalInfo.email && (
                      <>
                        {[personalInfo.fullAddress, personalInfo.cityState, personalInfo.postalCode, personalInfo.country].filter(Boolean).length > 0 && (
                          <span className="opacity-40">|</span>
                        )}
                        <span>{personalInfo.email}</span>
                      </>
                    )}
                    {personalInfo.phone && (
                      <>
                        {(personalInfo.email || [personalInfo.fullAddress, personalInfo.cityState, personalInfo.postalCode, personalInfo.country].filter(Boolean).length > 0) && (
                          <span className="opacity-40">|</span>
                        )}
                        <span>{personalInfo.phone}</span>
                      </>
                    )}
                    {personalInfo.linkedin && (
                      <>
                        <span className="opacity-40">|</span>
                        <span>{personalInfo.linkedin}</span>
                      </>
                    )}
                    {personalInfo.portfolioUrl && (
                      <>
                        <span className="opacity-40">|</span>
                        <span>{personalInfo.portfolioUrl}</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Profile Summary */}
                {summary && (
                  <div className="py-0.5 space-y-0.5">
                    <div className={tStyle.sectionHeader}>
                      <h2 className={tStyle.sectionTitle}>
                        {SECTION_TITLES[cvLanguage].summary}
                      </h2>
                    </div>
                    <p className="text-[10.5px] leading-snug text-[#191c1c]">{summary}</p>
                  </div>
                )}

                {/* Work Experience */}
                {experiences.filter((e) => e.included !== false).length > 0 && (
                  <div className="py-0.5 space-y-1">
                    <div className={tStyle.sectionHeader}>
                      <h2 className={tStyle.sectionTitle}>
                        {SECTION_TITLES[cvLanguage].experience}
                      </h2>
                    </div>
                    <div className="space-y-1.5">
                      {experiences.filter((e) => e.included !== false).map((exp) => (
                        <div key={exp.id} className="text-[10.5px] space-y-0.5">
                          <div className="flex items-center justify-between font-bold text-[#191c1c]">
                            <span>{exp.role || "Posisi"} {exp.company ? `— ${exp.company}` : ""}</span>
                            {(exp.startDate || exp.endDate) && (
                              <span className="font-mono text-[10px] text-[#191c1c] font-normal">
                                {exp.startDate} {exp.endDate ? `– ${exp.endDate}` : ""}
                              </span>
                            )}
                          </div>
                          {exp.location && (
                            <p className="text-[10px] text-[#4c6079] italic">{exp.location}</p>
                          )}
                          {exp.bullets && (
                            <ul className="list-disc list-outside ml-3.5 space-y-0.5 text-[#191c1c] leading-snug pt-0.5">
                              {(Array.isArray(exp.bullets)
                                ? exp.bullets
                                : typeof exp.bullets === "string"
                                ? exp.bullets.split("\n")
                                : []
                              )
                                .filter(Boolean)
                                .map((b: string, idx: number) => (
                                  <li key={idx}>{b}</li>
                                ))}
                            </ul>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Projects & Portfolio */}
                {projects.filter((p) => p.included !== false).length > 0 && (
                  <div className="py-0.5 space-y-1">
                    <div className={tStyle.sectionHeader}>
                      <h2 className={tStyle.sectionTitle}>
                        {SECTION_TITLES[cvLanguage].projects}
                      </h2>
                    </div>
                    <div className="space-y-1.5">
                      {projects.filter((p) => p.included !== false).map((proj) => (
                        <div key={proj.id} className="text-[10.5px] space-y-0.5">
                          <div className="flex items-center justify-between font-bold text-[#191c1c]">
                            <span>
                              {proj.name || "Nama Proyek"}{" "}
                              {proj.role ? <span className="font-normal text-[#4c6079]">({proj.role})</span> : null}
                            </span>
                            {(proj.startDate || proj.endDate) && (
                              <span className="font-mono text-[10px] text-[#191c1c] font-normal">
                                {proj.startDate} {proj.endDate ? `– ${proj.endDate}` : ""}
                              </span>
                            )}
                          </div>
                          {proj.link && (
                            <p className="text-[10px] text-[#4c6079] italic">{proj.link}</p>
                          )}
                          {proj.bullets && (
                            <ul className="list-disc list-outside ml-3.5 space-y-0.5 text-[#191c1c] leading-snug pt-0.5">
                              {(Array.isArray(proj.bullets)
                                ? proj.bullets
                                : typeof proj.bullets === "string"
                                ? proj.bullets.split("\n")
                                : []
                              )
                                .filter(Boolean)
                                .map((b: string, idx: number) => (
                                  <li key={idx}>{b}</li>
                                ))}
                            </ul>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Education */}
                {education.filter((e) => e.included !== false).length > 0 && (
                  <div className="py-0.5 space-y-1">
                    <div className={tStyle.sectionHeader}>
                      <h2 className={tStyle.sectionTitle}>
                        {SECTION_TITLES[cvLanguage].education}
                      </h2>
                    </div>
                    <div className="space-y-1.5">
                      {education.filter((e) => e.included !== false).map((edu) => (
                        <div key={edu.id} className="flex items-center justify-between text-[10.5px]">
                          <div>
                            <p className="font-bold text-[#191c1c]">{edu.degree}{edu.fieldOfStudy ? ` ${edu.fieldOfStudy}` : ""}</p>
                            <p className="text-[#4c6079] italic text-[10px]">{edu.institution}</p>
                          </div>
                          <div className="text-right font-mono text-[10px] text-[#191c1c]">
                            {(edu.startDate || edu.endDate) && (
                              <p>
                                {edu.startDate} {edu.endDate ? `– ${edu.endDate}` : ""}
                              </p>
                            )}
                            {edu.gpa && <p className="font-semibold text-orange-950">GPA: {edu.gpa}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Skills */}
                {skills.length > 0 && (
                  <div className="py-0.5 space-y-0.5">
                    <div className={tStyle.sectionHeader}>
                      <h2 className={tStyle.sectionTitle}>
                        {SECTION_TITLES[cvLanguage].skills}
                      </h2>
                    </div>
                    {useCategories ? (
                      <div className="space-y-0.5 text-[10.5px] leading-snug text-[#191c1c]">
                        {groupSkillsByCategory(skills).map((group, idx) => (
                          <p key={idx} className="text-[10.5px] leading-snug text-[#191c1c]">
                            {group.category && group.category !== "Tanpa Kategori" ? (
                              <span className="font-bold text-[#191c1c]">{group.category}: </span>
                            ) : null}
                            {group.items.join(" • ")}
                          </p>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[10.5px] leading-snug text-[#191c1c]">
                        {skills.map((s) => (typeof s === "string" ? s : s.name)).filter(Boolean).join(" • ")}
                      </p>
                    )}
                  </div>
                )}

                {/* Languages */}
                {languages.filter((l) => l.included !== false).length > 0 && (
                  <div className="py-0.5 space-y-0.5">
                    <div className={tStyle.sectionHeader}>
                      <h2 className={tStyle.sectionTitle}>
                        {SECTION_TITLES[cvLanguage].languages}
                      </h2>
                    </div>
                    <p className="text-[10.5px] leading-snug text-[#191c1c]">
                      {languages.filter((l) => l.included !== false).map((l) => {
                        const formattedLevel = formatLanguageLevel(l.level, cvLanguage);
                        return formattedLevel ? `${l.name} (${formattedLevel})` : l.name;
                      }).join(" • ")}
                    </p>
                  </div>
                )}

                {/* Certifications */}
                {certifications.filter((c) => c.included !== false).length > 0 && (
                  <div className="py-0.5 space-y-0.5">
                    <div className={tStyle.sectionHeader}>
                      <h2 className={tStyle.sectionTitle}>
                        {SECTION_TITLES[cvLanguage].certifications}
                      </h2>
                    </div>
                    <div className="space-y-1">
                      {certifications.filter((c) => c.included !== false).map((cert) => (
                        <div key={cert.id} className="flex items-center justify-between text-[10.5px]">
                          <div>
                            <p className="font-bold text-[#191c1c]">{cert.name}</p>
                            {cert.issuer && <p className="text-[#4c6079] italic text-[10px]">{cert.issuer}</p>}
                          </div>
                          {cert.issueDate && (
                            <p className="font-mono text-[10px] text-[#191c1c]">
                              {cert.issueDate} {cert.expiryDate ? `– ${cert.expiryDate}` : ""}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Achievements */}
                {achievements.filter((a) => a.included !== false).length > 0 && (
                  <div className="py-0.5 space-y-0.5">
                    <div className={tStyle.sectionHeader}>
                      <h2 className={tStyle.sectionTitle}>
                        {SECTION_TITLES[cvLanguage].achievements}
                      </h2>
                    </div>
                    <div className="space-y-1">
                      {achievements.filter((a) => a.included !== false).map((ach) => (
                        <div key={ach.id} className="text-[10.5px] space-y-0.5">
                          <div className="flex items-center justify-between font-bold text-[#191c1c]">
                            <span>{ach.title} {ach.issuer ? <span className="font-normal text-[#4c6079]">({ach.issuer})</span> : null}</span>
                            {ach.date && <span className="font-mono text-[10px] text-[#191c1c] font-normal">{ach.date}</span>}
                          </div>
                          {ach.impact && <p className="text-[10px] font-semibold text-orange-950">{ach.impact}</p>}
                          {ach.description && <p className="text-[10px] text-[#4c6079] leading-snug">{ach.description}</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <GlassConfirmModal
        isOpen={confirmModalState.isOpen}
        title={confirmModalState.title}
        description={confirmModalState.description}
        confirmText={confirmModalState.confirmText}
        variant={confirmModalState.variant}
        onConfirm={() => {
          confirmModalState.action();
          setConfirmModalState((prev) => ({ ...prev, isOpen: false }));
        }}
        onCancel={() => setConfirmModalState((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}

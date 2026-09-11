"use client";
// CVForge Resume Studio Page

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Printer,
  Globe,
  ArrowLeft,
  FileSearch,
  FileText,
  User,
  Briefcase,
  GraduationCap,
  Cpu,
  Award,
  FolderGit2,
  Plus,
  Trash2,
  Save,
  CheckCircle2,
  Sparkles,
  Trophy,
  ShieldCheck,
  Home,
  LayoutTemplate,
} from "lucide-react";
import { useUserProfile } from "@/lib/use-user-profile";
import { useAuth } from "@/lib/auth-context";
import { exportResumeToDocx } from "@/lib/export-docx";

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

export default function ResumeStudioPage({ params }: { params: { id: string } }) {
  const { profile, saveProfile } = useUserProfile();
  const { user } = useAuth();
  const [resume, setResume] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [cvLanguage, setCvLanguage] = useState<"id" | "en">("id");
  const [mobileTab, setMobileTab] = useState<"form" | "preview">("form");
  const [activeFormTab, setActiveFormTab] = useState<"personal" | "experience" | "projects" | "education" | "skills" | "certifications" | "achievements" | "languages">("personal");
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isAtsDrawerOpen, setIsAtsDrawerOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("ats");

  const SECTION_TITLES = {
    id: {
      summary: "RINGKASAN PROFIL",
      experience: "PENGALAMAN KERJA",
      projects: "PROJECT",
      education: "PENDIDIKAN",
      skills: "KETERAMPILAN",
      languages: "PENGUASAAN BAHASA",
      certifications: "SERTIFIKASI",
      achievements: "PRESTASI & PENGHARGAAN",
    },
    en: {
      summary: "PROFILE SUMMARY",
      experience: "WORK EXPERIENCE",
      projects: "PROJECTS",
      education: "EDUCATION",
      skills: "SKILLS",
      languages: "LANGUAGES",
      certifications: "CERTIFICATIONS",
      achievements: "ACHIEVEMENTS",
    },
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
  const [projects, setProjects] = useState<any[]>([]);
  const [skills, setSkills] = useState<any[]>([]);
  const [useCategories, setUseCategories] = useState(true);
  const [categories, setCategories] = useState<string[]>([
    "Core Development",
    "Database & Backend",
    "DevOps & Tools",
    "AI & Automation",
  ]);
  const [newCategoryInput, setNewCategoryInput] = useState("");
  const [summary, setSummary] = useState("");
  const [languages, setLanguages] = useState<any[]>([]);
  const [certifications, setCertifications] = useState<any[]>([]);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [aiEnhancingExpId, setAiEnhancingExpId] = useState<string | null>(null);

  const handleEnhanceExpBullets = async (expId: string, currentBulletsStr: string, role?: string) => {
    if (!currentBulletsStr.trim()) return;
    setAiEnhancingExpId(expId);

    const userId = user?.id || "";
    const provider = (localStorage.getItem(userId ? `cvforge_ai_provider_${userId}` : "cvforge_ai_provider") as any) || "gemini";
    const geminiKey = localStorage.getItem(userId ? `cvforge_gemini_key_${userId}` : "cvforge_gemini_key") || "";
    const openaiKey = localStorage.getItem(userId ? `cvforge_openai_key_${userId}` : "cvforge_openai_key") || "";
    const activeKey = provider === "openai" ? openaiKey : geminiKey;

    try {
      const res = await fetch("/api/ai/rewrite", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(activeKey ? { "x-api-key": activeKey, "x-ai-provider": provider } : {}),
        },
        body: JSON.stringify({
          text: currentBulletsStr,
          type: "bullet",
          style: "action_oriented",
          targetRole: role,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success && data.data?.enhancedText) {
        setExperiences((prev) =>
          prev.map((e) => (e.id === expId ? { ...e, bullets: data.data.enhancedText } : e))
        );
      }
    } catch (err) {
      console.warn("AI rewrite request failed:", err);
    } finally {
      setAiEnhancingExpId(null);
    }
  };

  useEffect(() => {
    // Helper to extract unique categories from snapshot
    const updateCategoriesFromSkills = (skillsArr: any[]) => {
      if (!Array.isArray(skillsArr)) return;
      const extracted = skillsArr
        .map((s: any) => (typeof s === "object" && s.category ? s.category.trim() : ""))
        .filter(Boolean);
      if (extracted.length > 0) {
        setCategories((prev) => Array.from(new Set([...prev, ...extracted])));
      }
    };

    // 1. Resolve from user's saved local profile resumes
    const localResume = profile?.resumes?.find((r: any) => r.id === params.id);
    if (localResume) {
      setResume(localResume);
      if (localResume.template || (localResume as any).templateId) {
        setSelectedTemplate(localResume.template || (localResume as any).templateId);
      }
      const snap = localResume.contentSnapshot;
      if (snap) {
        if (snap.template) setSelectedTemplate(snap.template);
        if (snap.personalInfo) setPersonalInfo(snap.personalInfo);
        if (snap.fullName && !snap.personalInfo?.firstName) {
          const parts = snap.fullName.split(" ");
          setPersonalInfo((p) => ({
            ...p,
            firstName: parts[0] || "",
            lastName: parts.slice(1).join(" ") || "",
          }));
        }
        if (snap.summary) setSummary(snap.summary);

        // Synchronize Experiences with Master Profile bullets
        const masterExperiences = profile?.experiences || [];
        const rawSnapExperiences = snap.experiences || [];
        let mergedExperiences = rawSnapExperiences.map((exp: any) => {
          const masterMatch = masterExperiences.find(
            (m: any) =>
              (Boolean(m.id && exp.id) && m.id === exp.id) ||
              (Boolean(m.company && exp.company && m.role && exp.role) &&
                m.company?.toLowerCase().trim() === (exp.company || "").toLowerCase().trim() &&
                m.role?.toLowerCase().trim() === (exp.role || "").toLowerCase().trim())
          );
          if (masterMatch) {
            const bulletsStr = Array.isArray(masterMatch.bullets)
              ? masterMatch.bullets.join("\n")
              : masterMatch.bullets || "";
            return {
              ...exp,
              id: masterMatch.id || exp.id,
              company: masterMatch.company || exp.company,
              role: masterMatch.role || exp.role,
              location: masterMatch.location || exp.location,
              startDate: masterMatch.startDate || exp.startDate,
              endDate: masterMatch.endDate || exp.endDate,
              bullets: bulletsStr || exp.bullets,
            };
          }
          return exp;
        });

        masterExperiences.forEach((m: any) => {
          const exists = mergedExperiences.some(
            (e: any) =>
              (Boolean(e.id && m.id) && e.id === m.id) ||
              (Boolean(e.company && m.company && e.role && m.role) &&
                e.company?.toLowerCase().trim() === m.company?.toLowerCase().trim() &&
                e.role?.toLowerCase().trim() === m.role?.toLowerCase().trim())
          );
          if (!exists) {
            const bulletsStr = Array.isArray(m.bullets)
              ? m.bullets.join("\n")
              : m.bullets || "";
            mergedExperiences.push({
              id: m.id,
              company: m.company,
              role: m.role,
              location: m.location,
              startDate: m.startDate,
              endDate: m.endDate,
              bullets: bulletsStr,
            });
          }
        });

        setExperiences(mergedExperiences.length > 0 ? mergedExperiences : rawSnapExperiences);

        // Projects sync
        const masterProjects = profile?.projects || [];
        const rawSnapProjects = snap.projects || [];
        const mergedProjects = [...rawSnapProjects];
        masterProjects.forEach((m: any) => {
          const exists = mergedProjects.some(
            (p: any) => p.id === m.id || (p.name || "").toLowerCase().trim() === m.name?.toLowerCase().trim()
          );
          if (!exists) {
            mergedProjects.push({
              id: m.id,
              name: m.name,
              role: m.role,
              bullets: m.description,
              techStack: m.techStack,
              link: m.link,
            });
          }
        });
        setProjects(mergedProjects);

        if (snap.education?.length) setEducation(snap.education);
        if (typeof snap.useCategories === "boolean") setUseCategories(snap.useCategories);
        if (snap.skills?.length) {
          const mapped = snap.skills.map((s: any, idx: number) => ({
            id: s.id || `s_${idx}`,
            name: typeof s === "string" ? s : s.name || "",
            category: typeof s === "object" && s.category ? s.category : "Core Development",
          }));
          setSkills(mapped);
        }

        // Sync languages
        const masterLanguages = profile?.languages || [];
        const rawSnapLanguages = snap.languages || [];
        const mergedLanguages = [...rawSnapLanguages];
        masterLanguages.forEach((m: any) => {
          const exists = mergedLanguages.some(
            (l: any) => l.id === m.id || (l.name || "").toLowerCase().trim() === (m.name || "").toLowerCase().trim()
          );
          if (!exists) {
            mergedLanguages.push({
              id: m.id || `lang_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
              name: m.name,
              level: m.level || "Native / Bilingual",
            });
          }
        });
        setLanguages(mergedLanguages.length > 0 ? mergedLanguages : rawSnapLanguages);

        // Sync certifications
        const masterCerts = profile?.certifications || [];
        const rawSnapCerts = snap.certifications || [];
        const mergedCerts = [...rawSnapCerts];
        masterCerts.forEach((m: any) => {
          const exists = mergedCerts.some(
            (c: any) => c.id === m.id || (c.name || "").toLowerCase().trim() === (m.name || "").toLowerCase().trim()
          );
          if (!exists) {
            mergedCerts.push({
              id: m.id,
              name: m.name,
              issuer: m.issuer,
              issueDate: m.issueDate,
              expiryDate: m.expiryDate,
            });
          }
        });
        setCertifications(mergedCerts.length > 0 ? mergedCerts : rawSnapCerts);

        // Sync achievements
        const masterAchievements = profile?.achievements || [];
        const rawSnapAchievements = snap.achievements || [];
        const mergedAchievements = [...rawSnapAchievements];
        masterAchievements.forEach((m: any) => {
          const exists = mergedAchievements.some(
            (a: any) => a.id === m.id || (a.title || "").toLowerCase().trim() === (m.title || "").toLowerCase().trim()
          );
          if (!exists) {
            mergedAchievements.push({
              id: m.id,
              title: m.title,
              issuer: m.issuer,
              date: m.date,
              impact: m.impact || m.metric,
              description: m.description,
            });
          }
        });
        setAchievements(mergedAchievements.length > 0 ? mergedAchievements : rawSnapAchievements);
      }
      setIsLoading(false);
      return;
    }

    // 2. Fallback to API route for demo resumes
    fetch(`/api/resumes/${params.id}`)
      .then((res) => res.json())
      .then((json) => {
        if (json.data) {
          setResume(json.data);
          const snap = json.data.contentSnapshot;
          if (snap) {
            if (snap.personalInfo) setPersonalInfo(snap.personalInfo);
            if (snap.fullName && !snap.personalInfo?.firstName) {
              const parts = snap.fullName.split(" ");
              setPersonalInfo((p) => ({ ...p, firstName: parts[0] || "", lastName: parts.slice(1).join(" ") || "" }));
            }
            if (snap.summary) setSummary(snap.summary);
            if (snap.experiences?.length) setExperiences(snap.experiences);
            if (snap.education?.length) setEducation(snap.education);
            if (snap.projects?.length) setProjects(snap.projects);
            if (typeof snap.useCategories === "boolean") setUseCategories(snap.useCategories);
            if (snap.skills?.length) {
              const mapped = snap.skills.map((s: any, idx: number) => ({
                id: s.id || `s_${idx}`,
                name: typeof s === "string" ? s : s.name || "",
                category: typeof s === "object" && s.category ? s.category : "Core Development",
              }));
              setSkills(mapped);
              updateCategoriesFromSkills(mapped);
            }
            if (snap.languages?.length) setLanguages(snap.languages);
            if (snap.certifications?.length) setCertifications(snap.certifications);
            if (snap.achievements?.length) setAchievements(snap.achievements);
          }
        }
      })
      .catch((e) => console.error(e))
      .finally(() => setIsLoading(false));
  }, [params.id, profile?.resumes]);

  const fullName = `${personalInfo.firstName} ${personalInfo.lastName}`.trim() || "";

  // Group skills by category for canvas rendering & editor display
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

  // Handlers for experience list
  const addExperience = () => {
    setExperiences((prev) => [
      ...prev,
      { id: `exp_${Date.now()}`, company: "", role: "", startDate: "", endDate: "", isCurrent: false, location: "", bullets: "" },
    ]);
  };
  const updateExp = (id: string, field: string, val: any) => {
    setExperiences((prev) => prev.map((e) => (e.id === id ? { ...e, [field]: val } : e)));
  };
  const removeExp = (id: string) => {
    setExperiences((prev) => prev.filter((e) => e.id !== id));
  };

  // Handlers for projects list
  const addProject = () => {
    setProjects((prev) => [
      ...prev,
      { id: `proj_${Date.now()}`, name: "", role: "", link: "", startDate: "", endDate: "", bullets: "" },
    ]);
  };
  const updateProject = (id: string, field: string, val: any) => {
    setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, [field]: val } : p)));
  };
  const removeProject = (id: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
  };

  // Handlers for education list
  const addEdu = () => {
    setEducation((prev) => [
      ...prev,
      { id: `edu_${Date.now()}`, institution: "", degree: "", fieldOfStudy: "", startDate: "", endDate: "", gpa: "" },
    ]);
  };
  const updateEdu = (id: string, field: string, val: any) => {
    setEducation((prev) => prev.map((e) => (e.id === id ? { ...e, [field]: val } : e)));
  };
  const removeEdu = (id: string) => {
    setEducation((prev) => prev.filter((e) => e.id !== id));
  };

  // Category management handlers
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

  // Handlers for skill list with category selection support
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
  const removeSkill = (id: string) => {
    setSkills((prev) => prev.filter((s) => s.id !== id));
  };

  // Handlers for languages list
  const addLanguage = () => {
    setLanguages((prev) => [...prev, { id: `lang_${Date.now()}`, name: "", level: "Fasih" }]);
  };
  const updateLanguage = (id: string, field: string, val: string) => {
    setLanguages((prev) => prev.map((l) => (l.id === id ? { ...l, [field]: val } : l)));
  };
  const removeLanguage = (id: string) => {
    setLanguages((prev) => prev.filter((l) => l.id !== id));
  };

  // Handlers for certifications list
  const addCert = () => {
    setCertifications((prev) => [...prev, { id: `cert_${Date.now()}`, name: "", issuer: "", issueDate: "", expiryDate: "" }]);
  };
  const updateCert = (id: string, field: string, val: string) => {
    setCertifications((prev) => prev.map((c) => (c.id === id ? { ...c, [field]: val } : c)));
  };
  const removeCert = (id: string) => {
    setCertifications((prev) => prev.filter((c) => c.id !== id));
  };

  // Handlers for achievements list
  const addAchievement = () => {
    setAchievements((prev) => [
      ...prev,
      { id: `ach_${Date.now()}`, title: "", issuer: "", date: "", impact: "", description: "" },
    ]);
  };
  const updateAchievement = (id: string, field: string, val: string) => {
    setAchievements((prev) => prev.map((a) => (a.id === id ? { ...a, [field]: val } : a)));
  };
  const removeAchievement = (id: string) => {
    setAchievements((prev) => prev.filter((a) => a.id !== id));
  };

  const handleSaveCV = () => {
    const updatedResume = {
      ...resume,
      id: params.id,
      title: `${personalInfo.targetRole || "CV"} — ${fullName || "Tanpa Nama"}`,
      role: personalInfo.targetRole || "General",
      template: selectedTemplate,
      updated: "Just now",
      contentSnapshot: {
        template: selectedTemplate,
        fullName,
        personalInfo,
        summary,
        experiences,
        education,
        projects,
        skills,
        useCategories,
        languages,
        certifications,
        achievements,
      },
    };

    const existingResumes = profile.resumes || [];
    const idx = existingResumes.findIndex((r: any) => r.id === params.id);
    let newResumesList = [];
    if (idx !== -1) {
      newResumesList = [...existingResumes];
      newResumesList[idx] = updatedResume;
    } else {
      newResumesList = [updatedResume, ...existingResumes];
    }

    saveProfile({
      ...profile,
      resumes: newResumesList,
      certifications: certifications.length > 0 ? certifications : profile.certifications,
      achievements: achievements.length > 0 ? achievements : profile.achievements,
      languages: languages.length > 0 ? languages : profile.languages,
    });

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handlePrint = () => {
    window.print();
  };

  const validExperiences = experiences.filter(
    (e) => e.included !== false && (e.role?.trim() || e.company?.trim())
  );
  const validProjects = projects.filter(
    (p) => p.included !== false && (p.name?.trim() || p.role?.trim())
  );
  const validEducation = education.filter(
    (e) => e.included !== false && (e.degree?.trim() || e.institution?.trim())
  );
  const validSkills = skills.filter(
    (s) => s.included !== false && (typeof s === "string" ? s.trim() : s.name?.trim())
  );
  const validCertifications = certifications.filter(
    (c) => c.included !== false && c.name?.trim()
  );
  const validAchievements = achievements.filter(
    (a) => a.included !== false && a.title?.trim()
  );
  const validLanguages = languages.filter(
    (l) => l.included !== false && l.name?.trim()
  );

  const handleExportDocx = () => {
    exportResumeToDocx({
      fullName,
      personalInfo,
      summary,
      validExperiences,
      validProjects,
      validEducation,
      validSkills,
      validCertifications,
      validLanguages,
    });
  };

  const hasAnyData = Boolean(
    fullName ||
    personalInfo.targetRole ||
    personalInfo.email ||
    summary ||
    validExperiences.length > 0 ||
    validProjects.length > 0 ||
    validEducation.length > 0 ||
    validSkills.length > 0 ||
    validLanguages.length > 0 ||
    validCertifications.length > 0 ||
    validAchievements.length > 0
  );

  const getTemplateStyles = () => {
    switch (selectedTemplate) {
      case "modern":
        return {
          container: "font-sans text-[#191c1c]",
          headerAlign: "text-left border-l-4 border-black pl-3 py-1 bg-slate-50/80 rounded-r-lg",
          nameText: "text-base font-extrabold tracking-tight uppercase text-black",
          roleText: "text-[11px] font-bold tracking-wider uppercase text-black",
          contactText: "text-[9.5px] text-[#4c6079] flex flex-wrap gap-x-2 gap-y-0.5 mt-1 font-sans",
          sectionHeader: "border-b-2 border-black pb-0.5 mb-1",
          sectionTitle: "text-[11px] font-bold uppercase tracking-wider text-black flex items-center gap-1.5",
        };
      case "executive":
        return {
          container: "font-serif text-[#1e293b]",
          headerAlign: "text-center pb-1.5 border-b-2 border-double border-black",
          nameText: "text-lg font-bold tracking-widest uppercase text-black",
          roleText: "text-[10px] font-semibold tracking-widest uppercase text-[#475569] mt-0.5",
          contactText: "text-[9.5px] text-[#475569] flex flex-wrap items-center justify-center gap-x-2 gap-y-0.5 mt-1 font-sans",
          sectionHeader: "border-b-2 border-black pb-0.5 mb-1 text-center",
          sectionTitle: "text-[11px] font-bold uppercase tracking-widest text-black",
        };
      case "tech":
        return {
          container: "font-mono text-[#0f172a]",
          headerAlign: "text-left border-b-2 border-black pb-1.5",
          nameText: "text-base font-black tracking-tight text-black",
          roleText: "text-[10.5px] font-mono font-bold text-black bg-[#eff6ff] px-2 py-0.5 rounded inline-block mt-0.5 border border-black",
          contactText: "text-[9px] text-[#64748b] flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-1.5 font-mono",
          sectionHeader: "border-b-2 border-black pb-0.5 mb-1",
          sectionTitle: "text-[10.5px] font-mono font-bold uppercase tracking-wider text-black",
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f8faf9] dark:bg-[#121816] flex items-center justify-center font-sans">
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-3">
          <div className="w-10 h-10 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin" />
          <p className="text-xs text-[#727976]">Loading CV Studio...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8faf9] dark:bg-[#121816] flex flex-col font-sans">
      {/* Top Bar with Back, Save & Print */}
      <div className="bg-white dark:bg-[#1b2220] border-b border-[#e1e3e2] dark:border-[#242c2a] px-4 sm:px-6 py-3 flex items-center justify-between print:hidden transition-colors">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/resumes"
            className="px-2.5 py-1.5 rounded-lg border border-[#e1e3e2] dark:border-[#242c2a] text-[#727976] dark:text-[#8c9390] hover:bg-[#f2f4f3] dark:hover:bg-[#121816] hover:text-[#191c1c] dark:hover:text-zinc-100 text-xs font-semibold flex items-center gap-1 transition-colors"
            title="Kembali ke Daftar Resumes"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden xs:inline">Kembali</span>
          </Link>
          <Link
            href="/"
            className="px-2.5 py-1.5 rounded-lg border border-[#e1e3e2] dark:border-[#242c2a] text-orange-950 dark:text-orange-400 bg-[#f8faf9] dark:bg-[#121816] hover:bg-[#edeeee] dark:hover:bg-[#1b2220] text-xs font-semibold flex items-center gap-1.5 transition-colors"
            title="Kembali ke Landing Page Utama"
          >
            <Home className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" />
            <span className="hidden sm:inline">Landing Page</span>
          </Link>
          <div>
            <h1 className="text-sm font-bold text-[#191c1c] dark:text-zinc-100">{resume?.title || "CV Studio Editor"}</h1>
            <p className="text-[11px] text-[#727976] dark:text-zinc-400">Live Real-time Side-by-Side Editor</p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Save Status Indicator */}
          {saveSuccess && (
            <span className="hidden sm:inline-flex items-center gap-1 text-xs text-orange-800 dark:text-orange-300 font-semibold bg-orange-50 dark:bg-orange-950/40 px-2.5 py-1 rounded-lg border border-orange-200 dark:border-orange-800/50">
              <CheckCircle2 className="w-3.5 h-3.5" /> Tersimpan!
            </span>
          )}

          <button
            type="button"
            onClick={handleSaveCV}
            className="inline-flex items-center gap-1.5 bg-orange-600 dark:bg-orange-500 text-white hover:bg-orange-700 dark:hover:bg-orange-400 px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-colors shadow-xs"
          >
            <Save className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Simpan Perubahan</span><span className="sm:hidden">Simpan</span>
          </button>

          {/* Multi-Template Selector (PRD §28) */}
          <div className="flex items-center gap-1.5 border border-[#e1e3e2] dark:border-[#242c2a] rounded-xl px-2.5 py-1 bg-[#f8faf9] dark:bg-[#121816]">
            <LayoutTemplate className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" />
            <select
              value={selectedTemplate}
              onChange={(e) => setSelectedTemplate(e.target.value)}
              className="bg-transparent dark:bg-[#121816] text-xs font-bold text-slate-900 dark:text-zinc-100 focus:outline-none cursor-pointer pr-1"
              title="Pilih Layout Template CV"
            >
              <option value="ats" className="dark:bg-[#1b2220] dark:text-zinc-100">ATS Classic (Mono)</option>
              <option value="modern" className="dark:bg-[#1b2220] dark:text-zinc-100">Modern Clean (Sunset Orange)</option>
              <option value="executive" className="dark:bg-[#1b2220] dark:text-zinc-100">Executive Minimalist (Navy)</option>
              <option value="tech" className="dark:bg-[#1b2220] dark:text-zinc-100">Tech Developer (Indigo)</option>
            </select>
          </div>

          {/* Language Selector */}
          <div className="flex items-center gap-1 border border-[#e1e3e2] dark:border-[#242c2a] rounded-xl p-1 bg-[#f8faf9] dark:bg-[#121816]">
            <button
              type="button"
              onClick={() => setCvLanguage("id")}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                cvLanguage === "id"
                  ? "bg-orange-600 dark:bg-orange-500 text-white shadow-xs"
                  : "text-[#727976] dark:text-zinc-400 hover:text-[#191c1c] dark:hover:text-zinc-100"
              }`}
            >
              ID
            </button>
            <button
              type="button"
              onClick={() => setCvLanguage("en")}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                cvLanguage === "en"
                  ? "bg-orange-600 dark:bg-orange-500 text-white shadow-xs"
                  : "text-[#727976] dark:text-zinc-400 hover:text-[#191c1c] dark:hover:text-zinc-100"
              }`}
            >
              EN
            </button>
          </div>

          <button
            type="button"
            onClick={handleExportDocx}
            className="inline-flex items-center gap-1.5 bg-white dark:bg-[#121816] border border-[#c1c8c5] dark:border-[#242c2a] text-slate-900 dark:text-zinc-200 px-3 py-2 rounded-xl text-xs font-semibold hover:bg-[#f8faf9] dark:hover:bg-[#1b2220] transition-colors"
            title="Download Word Document"
          >
            <FileText className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" /> <span className="hidden sm:inline">Export DOCX</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 bg-gradient-to-r from-orange-600 to-red-600 text-white px-3 sm:px-4 py-2 rounded-xl text-xs font-semibold hover:from-orange-700 hover:to-red-700 shadow-xs"
          >
            <Printer className="w-3.5 h-3.5 text-white" /> <span className="hidden sm:inline">Cetak / Download PDF</span>
          </button>
        </div>
      </div>

      {/* Mobile View Switcher (Form vs Live Preview - Visible only on < lg screens) */}
      <div className="lg:hidden px-4 pt-3 flex items-center justify-center print:hidden">
        <div className="flex items-center gap-1 bg-[#edeeee] dark:bg-[#121816] border border-transparent dark:border-[#242c2a] p-1 rounded-xl w-full max-w-sm">
          <button
            type="button"
            onClick={() => setMobileTab("form")}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              mobileTab === "form"
                ? "bg-orange-600 dark:bg-orange-500 text-white shadow-xs"
                : "text-[#727976] dark:text-zinc-400 hover:text-[#191c1c] dark:hover:text-zinc-100"
            }`}
          >
            <FileText className="w-3.5 h-3.5" /> Form Editor
          </button>
          <button
            type="button"
            onClick={() => setMobileTab("preview")}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              mobileTab === "preview"
                ? "bg-orange-600 dark:bg-orange-500 text-white shadow-xs"
                : "text-[#727976] dark:text-zinc-400 hover:text-[#191c1c] dark:hover:text-zinc-100"
            }`}
          >
            <FileSearch className="w-3.5 h-3.5" /> Pratinjau Live
          </button>
        </div>
      </div>

      {/* Main Workspace (Form Left 50% vs Live Preview Right 50%) */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Interactive Form Controls (6 Cols) */}
        <div
          className={`lg:col-span-6 bg-white dark:bg-[#1b2220] border border-[#e1e3e2] dark:border-[#242c2a] rounded-2xl p-4 sm:p-6 shadow-xs space-y-5 print:hidden ${
            mobileTab === "preview" ? "hidden lg:block" : "block"
          }`}
        >
          {/* Section Navigation Tabs (Matched 1:1 with Sidebar CAREER CORE) */}
          <div className="flex items-center gap-1 border-b border-[#edeeee] dark:border-[#242c2a] pb-3 overflow-x-auto scrollbar-none">
            {[
              { id: "personal", name: "Profile", icon: User },
              { id: "experience", name: "Experience", icon: Briefcase },
              { id: "projects", name: "Projects", icon: FolderGit2 },
              { id: "education", name: "Education", icon: GraduationCap },
              { id: "skills", name: "Skills", icon: Sparkles },
              { id: "certifications", name: "Certifications", icon: Award },
              { id: "achievements", name: "Achievements", icon: Trophy },
              { id: "languages", name: "Languages", icon: Globe },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeFormTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveFormTab(tab.id as any)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 transition-colors ${
                    isActive
                      ? "bg-orange-600 dark:bg-orange-500 text-white"
                      : "text-[#727976] dark:text-zinc-400 hover:bg-[#f2f4f3] dark:hover:bg-[#121816] hover:text-[#191c1c] dark:hover:text-zinc-100"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </div>

          {/* Career Profile Source Protection Status Banner */}
          <div className="bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-900/50 p-2.5 rounded-xl flex items-center justify-between text-xs text-orange-900 dark:text-orange-300">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-orange-600 dark:text-orange-400 shrink-0" />
              <span className="font-bold">Proteksi Filter Data:</span>
              <span className="text-orange-800 dark:text-orange-300/90">Hanya data terpilih & valid yang masuk ke kanvas CV ini.</span>
            </div>
            <span className="text-[10px] font-mono bg-orange-100 dark:bg-orange-900/60 text-orange-950 dark:text-orange-200 px-2 py-0.5 rounded font-bold shrink-0">
              {validExperiences.length + validProjects.length + validEducation.length + validCertifications.length + validAchievements.length + validLanguages.length} Active Items
            </span>
          </div>

          {/* TAB 1: Informasi Pribadi & Ringkasan */}
          {activeFormTab === "personal" && (
            <div className="space-y-3.5 text-xs animate-in fade-in">
              <h2 className="text-base font-bold text-[#191c1c] dark:text-zinc-100">Informasi Pribadi & Kontak</h2>
              <div>
                <label className="block font-medium text-[#191c1c] dark:text-zinc-200 mb-1">Posisi Pekerjaan Target</label>
                <input
                  type="text"
                  value={personalInfo.targetRole}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, targetRole: e.target.value })}
                  placeholder="Misal: Frontend Developer, Marketing Officer"
                  className="w-full px-3 py-2 rounded-lg border border-[#e1e3e2] dark:border-[#242c2a] bg-[#f8faf9] dark:bg-[#121816] text-[#191c1c] dark:text-zinc-100 text-xs focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-[#191c1c] dark:text-zinc-200 mb-1">Nama Depan</label>
                  <input
                    type="text"
                    value={personalInfo.firstName}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, firstName: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-[#e1e3e2] dark:border-[#242c2a] bg-[#f8faf9] dark:bg-[#121816] text-[#191c1c] dark:text-zinc-100 text-xs focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block font-medium text-[#191c1c] dark:text-zinc-200 mb-1">Nama Belakang</label>
                  <input
                    type="text"
                    value={personalInfo.lastName}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, lastName: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-[#e1e3e2] dark:border-[#242c2a] bg-[#f8faf9] dark:bg-[#121816] text-[#191c1c] dark:text-zinc-100 text-xs focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-[#191c1c] dark:text-zinc-200 mb-1">Email</label>
                  <input
                    type="email"
                    value={personalInfo.email}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-[#e1e3e2] dark:border-[#242c2a] bg-[#f8faf9] dark:bg-[#121816] text-[#191c1c] dark:text-zinc-100 text-xs focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block font-medium text-[#191c1c] dark:text-zinc-200 mb-1">No. HP / WhatsApp</label>
                  <input
                    type="text"
                    value={personalInfo.phone}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-[#e1e3e2] dark:border-[#242c2a] bg-[#f8faf9] dark:bg-[#121816] text-[#191c1c] dark:text-zinc-100 text-xs focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-[#191c1c] dark:text-zinc-200 mb-1">Alamat Domisili</label>
                <input
                  type="text"
                  value={personalInfo.fullAddress}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, fullAddress: e.target.value })}
                  placeholder="Kota, Provinsi, Indonesia"
                  className="w-full px-3 py-2 rounded-lg border border-[#e1e3e2] dark:border-[#242c2a] bg-[#f8faf9] dark:bg-[#121816] text-[#191c1c] dark:text-zinc-100 text-xs focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-[#191c1c] dark:text-zinc-200 mb-1">URL LinkedIn</label>
                  <input
                    type="text"
                    value={personalInfo.linkedin}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, linkedin: e.target.value })}
                    placeholder="linkedin.com/in/username"
                    className="w-full px-3 py-2 rounded-lg border border-[#e1e3e2] dark:border-[#242c2a] bg-[#f8faf9] dark:bg-[#121816] text-[#191c1c] dark:text-zinc-100 text-xs focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block font-medium text-[#191c1c] dark:text-zinc-200 mb-1">URL Portofolio / GitHub</label>
                  <input
                    type="text"
                    value={personalInfo.portfolioUrl}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, portfolioUrl: e.target.value })}
                    placeholder="github.com/username"
                    className="w-full px-3 py-2 rounded-lg border border-[#e1e3e2] dark:border-[#242c2a] bg-[#f8faf9] dark:bg-[#121816] text-[#191c1c] dark:text-zinc-100 text-xs focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-[#191c1c] dark:text-zinc-200 mb-1">Ringkasan Profil</label>
                <textarea
                  rows={4}
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="Tuliskan ringkasan kualifikasi singkat profesional Anda..."
                  className="w-full p-3 rounded-lg border border-[#e1e3e2] dark:border-[#242c2a] bg-[#f8faf9] dark:bg-[#121816] text-[#191c1c] dark:text-zinc-100 text-xs resize-none focus:outline-none focus:border-orange-500"
                />
              </div>
            </div>
          )}

          {/* TAB 2: Pengalaman Kerja */}
          {activeFormTab === "experience" && (
            <div className="space-y-4 text-xs animate-in fade-in">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-[#191c1c] dark:text-zinc-100">Pengalaman Kerja</h2>
                <button
                  type="button"
                  onClick={addExperience}
                  className="inline-flex items-center gap-1 text-xs text-orange-950 dark:text-orange-300 bg-orange-100 dark:bg-orange-950/60 hover:bg-orange-200 dark:hover:bg-orange-900/80 border border-transparent dark:border-orange-800/50 px-2.5 py-1 rounded-lg font-semibold transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" /> Tambah Pengalaman
                </button>
              </div>

              {experiences.length === 0 ? (
                <div className="text-center py-6 border border-dashed border-[#e1e3e2] dark:border-[#242c2a] rounded-xl text-[#727976] dark:text-zinc-400">
                  Belum ada pengalaman kerja. Klik "+ Tambah Pengalaman" di atas.
                </div>
              ) : (
                <div className="space-y-4">
                  {experiences.map((exp, idx) => (
                    <div key={exp.id} className="p-3.5 rounded-xl border border-[#e1e3e2] dark:border-[#242c2a] bg-[#f8faf9] dark:bg-[#121816] space-y-3 relative">
                      <div className="flex items-center justify-between border-b border-[#e1e3e2] dark:border-[#242c2a] pb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 dark:text-orange-400">Pengalaman #{idx + 1}</span>
                          {!(exp.role?.trim() || exp.company?.trim()) ? (
                            <span className="text-[10px] font-semibold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-800/50">
                              ⚠️ Belum Lengkap
                            </span>
                          ) : (
                            <span className="text-[10px] font-semibold text-orange-700 dark:text-orange-300 bg-orange-50 dark:bg-orange-950/50 px-2 py-0.5 rounded border border-orange-200 dark:border-orange-800/50">
                              ✓ Verified
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          <label className="flex items-center gap-1.5 text-xs text-zinc-900 dark:text-zinc-300 cursor-pointer font-medium select-none">
                            <input
                              type="checkbox"
                              checked={exp.included !== false}
                              onChange={(e) => updateExp(exp.id, "included", e.target.checked)}
                              className="rounded text-orange-600 dark:text-orange-500 focus:ring-orange-500 dark:bg-[#1b2220] dark:border-[#242c2a]"
                            />
                            Tampilkan di CV
                          </label>
                          <button
                            type="button"
                            onClick={() => removeExp(exp.id)}
                            className="text-[#727976] dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-400 p-1 transition-colors"
                            title="Hapus"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block font-medium text-[#191c1c] dark:text-zinc-200 mb-1">Posisi / Jabatan</label>
                          <input
                            type="text"
                            value={exp.role}
                            onChange={(e) => updateExp(exp.id, "role", e.target.value)}
                            placeholder="Misal: Web Developer"
                            className="w-full px-3 py-1.5 border border-[#e1e3e2] dark:border-[#242c2a] rounded-lg bg-white dark:bg-[#1b2220] text-[#191c1c] dark:text-zinc-100 text-xs focus:outline-none focus:border-orange-500"
                          />
                        </div>
                        <div>
                          <label className="block font-medium text-[#191c1c] dark:text-zinc-200 mb-1">Nama Perusahaan</label>
                          <input
                            type="text"
                            value={exp.company}
                            onChange={(e) => updateExp(exp.id, "company", e.target.value)}
                            placeholder="Misal: Dinas Komunikasi"
                            className="w-full px-3 py-1.5 border border-[#e1e3e2] dark:border-[#242c2a] rounded-lg bg-white dark:bg-[#1b2220] text-[#191c1c] dark:text-zinc-100 text-xs focus:outline-none focus:border-orange-500"
                          />
                        </div>
                        <div>
                          <label className="block font-medium text-[#191c1c] dark:text-zinc-200 mb-1">Lokasi / Mode Kerja</label>
                          <select
                            value={
                              ["Remote", "Hybrid", "On-site", "Jakarta, Indonesia", "Semarang, Indonesia", "Surabaya, Indonesia", "Bandung, Indonesia", "Yogyakarta, Indonesia"].includes(exp.location || "")
                                ? exp.location
                                : "custom"
                            }
                            onChange={(e) => {
                              if (e.target.value === "custom") {
                                updateExp(exp.id, "location", "");
                              } else {
                                updateExp(exp.id, "location", e.target.value);
                              }
                            }}
                            className="w-full px-3 py-1.5 border border-[#e1e3e2] dark:border-[#242c2a] rounded-lg bg-white dark:bg-[#1b2220] text-xs text-[#191c1c] dark:text-zinc-100 focus:outline-none focus:border-orange-500"
                          >
                            <option value="Remote">Remote</option>
                            <option value="Hybrid">Hybrid</option>
                            <option value="On-site">On-site</option>
                            <option value="Jakarta, Indonesia">Jakarta, Indonesia</option>
                            <option value="Semarang, Indonesia">Semarang, Indonesia</option>
                            <option value="Surabaya, Indonesia">Surabaya, Indonesia</option>
                            <option value="Bandung, Indonesia">Bandung, Indonesia</option>
                            <option value="Yogyakarta, Indonesia">Yogyakarta, Indonesia</option>
                            <option value="custom">Tulis Lokasi Kustom / Kota Lain...</option>
                          </select>
                          {(!["Remote", "Hybrid", "On-site", "Jakarta, Indonesia", "Semarang, Indonesia", "Surabaya, Indonesia", "Bandung, Indonesia", "Yogyakarta, Indonesia"].includes(exp.location || "")) && (
                            <input
                              type="text"
                              autoFocus
                              placeholder="Ketik nama kota/lokasi kustom..."
                              value={exp.location || ""}
                              onChange={(e) => updateExp(exp.id, "location", e.target.value)}
                              className="w-full px-3 py-1.5 border border-[#e1e3e2] dark:border-[#242c2a] rounded-lg bg-white dark:bg-[#1b2220] text-xs text-[#191c1c] dark:text-zinc-100 mt-1.5 focus:outline-none focus:border-orange-500"
                            />
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block font-medium text-[#191c1c] dark:text-zinc-200 mb-1">Periode Mulai</label>
                          <input
                            type="text"
                            value={exp.startDate}
                            onChange={(e) => updateExp(exp.id, "startDate", e.target.value)}
                            placeholder="Juli 2025"
                            className="w-full px-3 py-1.5 border border-[#e1e3e2] dark:border-[#242c2a] rounded-lg bg-white dark:bg-[#1b2220] text-[#191c1c] dark:text-zinc-100 text-xs focus:outline-none focus:border-orange-500"
                          />
                        </div>
                        <div>
                          <label className="block font-medium text-[#191c1c] dark:text-zinc-200 mb-1">Periode Selesai</label>
                          <input
                            type="text"
                            value={exp.endDate}
                            onChange={(e) => updateExp(exp.id, "endDate", e.target.value)}
                            placeholder="Agustus 2025 / Sekarang"
                            className="w-full px-3 py-1.5 border border-[#e1e3e2] dark:border-[#242c2a] rounded-lg bg-white dark:bg-[#1b2220] text-[#191c1c] dark:text-zinc-100 text-xs focus:outline-none focus:border-orange-500"
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block font-medium text-[#191c1c] dark:text-zinc-200">Poin Tanggung Jawab (1 Poin Per Baris)</label>
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
                            className="inline-flex items-center gap-1 text-[11px] text-orange-950 dark:text-orange-300 bg-orange-100 dark:bg-orange-950/60 hover:bg-orange-200 dark:hover:bg-orange-900/80 border border-transparent dark:border-orange-800/50 px-2 py-0.5 rounded font-semibold transition-colors disabled:opacity-50"
                          >
                            <Sparkles className="w-3 h-3 text-orange-600 dark:text-orange-400" />
                            {aiEnhancingExpId === exp.id ? "Peningkat AI..." : "✨ Polish with AI"}
                          </button>
                        </div>
                        <textarea
                          rows={3}
                          value={Array.isArray(exp.bullets) ? exp.bullets.join("\n") : exp.bullets || ""}
                          onChange={(e) => updateExp(exp.id, "bullets", e.target.value)}
                          placeholder="Tuliskan tugas dan kontribusi Anda..."
                          className="w-full p-2.5 border border-[#e1e3e2] dark:border-[#242c2a] rounded-lg bg-white dark:bg-[#1b2220] text-[#191c1c] dark:text-zinc-100 text-xs resize-none focus:outline-none focus:border-orange-500"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Project */}
          {activeFormTab === "projects" && (
            <div className="space-y-4 text-xs animate-in fade-in">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-[#191c1c] dark:text-zinc-100">Project</h2>
                <button
                  type="button"
                  onClick={addProject}
                  className="inline-flex items-center gap-1 text-xs text-orange-950 dark:text-orange-300 bg-orange-100 dark:bg-orange-950/60 hover:bg-orange-200 dark:hover:bg-orange-900/80 border border-transparent dark:border-orange-800/50 px-2.5 py-1 rounded-lg font-semibold transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" /> Tambah Project
                </button>
              </div>

              {projects.length === 0 ? (
                <div className="text-center py-6 border border-dashed border-[#e1e3e2] dark:border-[#242c2a] rounded-xl text-[#727976] dark:text-zinc-400">
                  Belum ada project. Klik "+ Tambah Project" di atas.
                </div>
              ) : (
                <div className="space-y-4">
                  {projects.map((proj, idx) => (
                    <div key={proj.id} className="p-3.5 rounded-xl border border-[#e1e3e2] dark:border-[#242c2a] bg-[#f8faf9] dark:bg-[#121816] space-y-3 relative">
                      <div className="flex items-center justify-between border-b border-[#e1e3e2] dark:border-[#242c2a] pb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 dark:text-orange-400">Proyek #{idx + 1}</span>
                          {!(proj.name?.trim() || proj.role?.trim()) ? (
                            <span className="text-[10px] font-semibold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-800/50">
                              ⚠️ Belum Lengkap
                            </span>
                          ) : (
                            <span className="text-[10px] font-semibold text-orange-700 dark:text-orange-300 bg-orange-50 dark:bg-orange-950/50 px-2 py-0.5 rounded border border-orange-200 dark:border-orange-800/50">
                              ✓ Verified
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          <label className="flex items-center gap-1.5 text-xs text-zinc-900 dark:text-zinc-300 cursor-pointer font-medium select-none">
                            <input
                              type="checkbox"
                              checked={proj.included !== false}
                              onChange={(e) => updateProject(proj.id, "included", e.target.checked)}
                              className="rounded text-orange-600 dark:text-orange-500 focus:ring-orange-500 dark:bg-[#1b2220] dark:border-[#242c2a]"
                            />
                            Tampilkan di CV
                          </label>
                          <button
                            type="button"
                            onClick={() => removeProject(proj.id)}
                            className="text-[#727976] dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-400 p-1 transition-colors"
                            title="Hapus"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block font-medium text-[#191c1c] dark:text-zinc-200 mb-1">Nama Proyek</label>
                          <input
                            type="text"
                            value={proj.name || ""}
                            onChange={(e) => updateProject(proj.id, "name", e.target.value)}
                            placeholder="Misal: System E-Commerce"
                            className="w-full px-3 py-1.5 border border-[#e1e3e2] dark:border-[#242c2a] rounded-lg bg-white dark:bg-[#1b2220] text-[#191c1c] dark:text-zinc-100 text-xs focus:outline-none focus:border-orange-500"
                          />
                        </div>
                        <div>
                          <label className="block font-medium text-[#191c1c] dark:text-zinc-200 mb-1">Peran / Posisi dalam Proyek</label>
                          <input
                            type="text"
                            value={proj.role || ""}
                            onChange={(e) => updateProject(proj.id, "role", e.target.value)}
                            placeholder="Misal: Lead Developer"
                            className="w-full px-3 py-1.5 border border-[#e1e3e2] dark:border-[#242c2a] rounded-lg bg-white dark:bg-[#1b2220] text-[#191c1c] dark:text-zinc-100 text-xs focus:outline-none focus:border-orange-500"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block font-medium text-[#191c1c] dark:text-zinc-200 mb-1">Link Proyek / Demo (Opsional)</label>
                          <input
                            type="text"
                            value={proj.link || ""}
                            onChange={(e) => updateProject(proj.id, "link", e.target.value)}
                            placeholder="https://github.com/..."
                            className="w-full px-3 py-1.5 border border-[#e1e3e2] dark:border-[#242c2a] rounded-lg bg-white dark:bg-[#1b2220] text-[#191c1c] dark:text-zinc-100 text-xs focus:outline-none focus:border-orange-500"
                          />
                        </div>
                        <div>
                          <label className="block font-medium text-[#191c1c] dark:text-zinc-200 mb-1">Periode Proyek</label>
                          <input
                            type="text"
                            value={`${proj.startDate || ""} ${proj.endDate ? `- ${proj.endDate}` : ""}`.trim()}
                            onChange={(e) => {
                              const [s, eVal] = e.target.value.split("-");
                              updateProject(proj.id, "startDate", s?.trim() || "");
                              updateProject(proj.id, "endDate", eVal?.trim() || "");
                            }}
                            placeholder="2024 - 2025"
                            className="w-full px-3 py-1.5 border border-[#e1e3e2] dark:border-[#242c2a] rounded-lg bg-white dark:bg-[#1b2220] text-[#191c1c] dark:text-zinc-100 text-xs focus:outline-none focus:border-orange-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block font-medium text-[#191c1c] dark:text-zinc-200 mb-1">Deskripsi / Poin Kontribusi (1 Poin Per Baris)</label>
                        <textarea
                          rows={3}
                          value={Array.isArray(proj.bullets) ? proj.bullets.join("\n") : proj.bullets || ""}
                          onChange={(e) => updateProject(proj.id, "bullets", e.target.value)}
                          placeholder="Deskripsikan fitur, tantangan, atau hasil pencapaian proyek..."
                          className="w-full p-2.5 border border-[#e1e3e2] dark:border-[#242c2a] rounded-lg bg-white dark:bg-[#1b2220] text-[#191c1c] dark:text-zinc-100 text-xs resize-none focus:outline-none focus:border-orange-500"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Pendidikan */}
          {activeFormTab === "education" && (
            <div className="space-y-4 text-xs animate-in fade-in">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-[#191c1c] dark:text-zinc-100">Riwayat Pendidikan</h2>
                <button
                  type="button"
                  onClick={addEdu}
                  className="inline-flex items-center gap-1 text-xs text-orange-950 dark:text-orange-300 bg-orange-100 dark:bg-orange-950/60 hover:bg-orange-200 dark:hover:bg-orange-900/80 border border-transparent dark:border-orange-800/50 px-2.5 py-1 rounded-lg font-semibold transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" /> Tambah Pendidikan
                </button>
              </div>

              {education.length === 0 ? (
                <div className="text-center py-6 border border-dashed border-[#e1e3e2] dark:border-[#242c2a] rounded-xl text-[#727976] dark:text-zinc-400">
                  Belum ada riwayat pendidikan. Klik "+ Tambah Pendidikan" di atas.
                </div>
              ) : (
                <div className="space-y-4">
                  {education.map((edu, idx) => (
                    <div key={edu.id} className="p-3.5 rounded-xl border border-[#e1e3e2] dark:border-[#242c2a] bg-[#f8faf9] dark:bg-[#121816] space-y-3">
                      <div className="flex items-center justify-between border-b border-[#e1e3e2] dark:border-[#242c2a] pb-2">
                        <span className="font-bold text-slate-900 dark:text-orange-400">Pendidikan #{idx + 1}</span>
                        <button
                          type="button"
                          onClick={() => removeEdu(edu.id)}
                          className="text-[#727976] dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-400 p-1 transition-colors"
                          title="Hapus"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block font-medium text-[#191c1c] dark:text-zinc-200 mb-1">Gelar / Tingkat</label>
                          <input
                            type="text"
                            value={edu.degree}
                            onChange={(e) => updateEdu(edu.id, "degree", e.target.value)}
                            placeholder="S1 / SMA / SMK"
                            className="w-full px-3 py-1.5 border border-[#e1e3e2] dark:border-[#242c2a] rounded-lg bg-white dark:bg-[#1b2220] text-[#191c1c] dark:text-zinc-100 text-xs focus:outline-none focus:border-orange-500"
                          />
                        </div>
                        <div>
                          <label className="block font-medium text-[#191c1c] dark:text-zinc-200 mb-1">Nama Sekolah / Universitas</label>
                          <input
                            type="text"
                            value={edu.institution}
                            onChange={(e) => updateEdu(edu.id, "institution", e.target.value)}
                            placeholder="Universitas Dian Nuswantoro"
                            className="w-full px-3 py-1.5 border border-[#e1e3e2] dark:border-[#242c2a] rounded-lg bg-white dark:bg-[#1b2220] text-[#191c1c] dark:text-zinc-100 text-xs focus:outline-none focus:border-orange-500"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className="block font-medium text-[#191c1c] dark:text-zinc-200 mb-1">Jurusan / Program</label>
                          <input
                            type="text"
                            value={edu.fieldOfStudy}
                            onChange={(e) => updateEdu(edu.id, "fieldOfStudy", e.target.value)}
                            placeholder="Teknik Informatika"
                            className="w-full px-3 py-1.5 border border-[#e1e3e2] dark:border-[#242c2a] rounded-lg bg-white dark:bg-[#1b2220] text-[#191c1c] dark:text-zinc-100 text-xs focus:outline-none focus:border-orange-500"
                          />
                        </div>
                        <div>
                          <label className="block font-medium text-[#191c1c] dark:text-zinc-200 mb-1">Tahun Masuk - Lulus</label>
                          <input
                            type="text"
                            value={`${edu.startDate || ""} - ${edu.endDate || ""}`.trim()}
                            onChange={(e) => {
                              const [s, eVal] = e.target.value.split("-");
                              updateEdu(edu.id, "startDate", s?.trim() || "");
                              updateEdu(edu.id, "endDate", eVal?.trim() || "");
                            }}
                            placeholder="2022 - 2026"
                            className="w-full px-3 py-1.5 border border-[#e1e3e2] dark:border-[#242c2a] rounded-lg bg-white dark:bg-[#1b2220] text-[#191c1c] dark:text-zinc-100 text-xs focus:outline-none focus:border-orange-500"
                          />
                        </div>
                        <div>
                          <label className="block font-medium text-[#191c1c] dark:text-zinc-200 mb-1">IPK / Nilai (Optional)</label>
                          <input
                            type="text"
                            value={edu.gpa || ""}
                            onChange={(e) => updateEdu(edu.id, "gpa", e.target.value)}
                            placeholder="3.75"
                            className="w-full px-3 py-1.5 border border-[#e1e3e2] dark:border-[#242c2a] rounded-lg bg-white dark:bg-[#1b2220] text-[#191c1c] dark:text-zinc-100 text-xs focus:outline-none focus:border-orange-500"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: Keahlian */}
          {activeFormTab === "skills" && (
            <div className="space-y-4 text-xs animate-in fade-in">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-[#191c1c] dark:text-zinc-100">Keahlian & Keterampilan</h2>
                <button
                  type="button"
                  onClick={() => addSkill()}
                  className="inline-flex items-center gap-1 text-xs text-orange-950 dark:text-orange-300 bg-orange-100 dark:bg-orange-950/60 hover:bg-orange-200 dark:hover:bg-orange-900/80 border border-transparent dark:border-orange-800/50 px-2.5 py-1 rounded-lg font-semibold transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" /> Tambah Keahlian
                </button>
              </div>

              {/* Mode Switcher: Dengan Kategori vs Tanpa Kategori */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-[#f2f4f3] dark:bg-[#121816] p-2 rounded-xl border border-[#e1e3e2] dark:border-[#242c2a] gap-2">
                <span className="font-semibold text-[#191c1c] dark:text-zinc-200 text-xs">Sistem Pengelompokan:</span>
                <div className="flex items-center gap-1 bg-white dark:bg-[#1b2220] p-1 rounded-lg border border-[#e1e3e2] dark:border-[#242c2a] w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => setUseCategories(true)}
                    className={`flex-1 sm:flex-initial px-3 py-1 rounded-md text-xs font-bold transition-all ${
                      useCategories
                        ? "bg-orange-600 dark:bg-orange-500 text-white shadow-xs"
                        : "text-[#727976] dark:text-zinc-400 hover:text-[#191c1c] dark:hover:text-zinc-100"
                    }`}
                  >
                    🏷️ Dengan Kategori
                  </button>
                  <button
                    type="button"
                    onClick={() => setUseCategories(false)}
                    className={`flex-1 sm:flex-initial px-3 py-1 rounded-md text-xs font-bold transition-all ${
                      !useCategories
                        ? "bg-orange-600 dark:bg-orange-500 text-white shadow-xs"
                        : "text-[#727976] dark:text-zinc-400 hover:text-[#191c1c] dark:hover:text-zinc-100"
                    }`}
                  >
                    📋 Tanpa Kategori
                  </button>
                </div>
              </div>

              {/* Seksi Kelola Kategori (Hanya tampil jika useCategories === true) */}
              {useCategories && (
                <div className="p-3 bg-[#f2f4f3] dark:bg-[#121816] rounded-xl border border-[#e1e3e2] dark:border-[#242c2a] space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-orange-600 dark:text-orange-400 text-xs">Kelola Kategori</span>
                    <span className="text-[11px] text-[#727976] dark:text-zinc-400">Tambah/hapus kategori sesuai kebutuhan</span>
                  </div>

                  <div className="flex flex-wrap gap-1.5 items-center">
                    {categories.map((cat) => (
                      <span
                        key={cat}
                        className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-lg bg-white dark:bg-[#1b2220] border border-[#e1e3e2] dark:border-[#242c2a] text-zinc-900 dark:text-zinc-200 font-semibold"
                      >
                        <span>{cat}</span>
                        {categories.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeCategory(cat)}
                            className="text-[#727976] dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-400 ml-0.5"
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
                      className="flex-1 bg-white dark:bg-[#1b2220] px-3 py-1.5 border border-[#e1e3e2] dark:border-[#242c2a] rounded-lg text-xs text-[#191c1c] dark:text-zinc-100 focus:outline-none focus:border-orange-500"
                    />
                    <button
                      type="button"
                      onClick={addCategory}
                      className="bg-orange-600 dark:bg-orange-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-orange-700 dark:hover:bg-orange-400 shrink-0"
                    >
                      + Kategori
                    </button>
                  </div>
                </div>
              )}

              {skills.length === 0 ? (
                <div className="text-center py-6 border border-dashed border-[#e1e3e2] dark:border-[#242c2a] rounded-xl text-[#727976] dark:text-zinc-400">
                  Belum ada keahlian diset. Klik "+ Tambah Keahlian" di atas.
                </div>
              ) : (
                <div className="space-y-2">
                  {skills.map((s) => (
                    <div key={s.id} className="grid grid-cols-12 gap-2 items-center bg-[#f8faf9] dark:bg-[#121816] border border-[#e1e3e2] dark:border-[#242c2a] p-2 rounded-lg">
                      {/* Selection Dropdown for Categories (Only if useCategories is true) */}
                      {useCategories && (
                        <div className="col-span-5 sm:col-span-5">
                          <select
                            value={s.category || categories[0] || "Core Development"}
                            onChange={(e) => updateSkillCategory(s.id, e.target.value)}
                            className="w-full bg-white dark:bg-[#1b2220] px-2.5 py-1.5 border border-[#e1e3e2] dark:border-[#242c2a] rounded text-xs font-semibold text-slate-900 dark:text-zinc-100 focus:outline-none"
                          >
                            <option value="Tanpa Kategori" className="dark:bg-[#1b2220] dark:text-zinc-100">Tanpa Kategori</option>
                            {categories.map((c) => (
                              <option key={c} value={c} className="dark:bg-[#1b2220] dark:text-zinc-100">
                                {c}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}

                      {/* Skill Name Input */}
                      <div className={useCategories ? "col-span-6 sm:col-span-6" : "col-span-11"}>
                        <input
                          type="text"
                          value={s.name}
                          onChange={(e) => updateSkillName(s.id, e.target.value)}
                          placeholder="Nama skill / teknologi (misal: HTML5)"
                          className="w-full bg-white dark:bg-[#1b2220] px-2.5 py-1.5 border border-[#e1e3e2] dark:border-[#242c2a] rounded text-xs text-[#191c1c] dark:text-zinc-100 focus:outline-none"
                        />
                      </div>

                      {/* Delete Skill Button */}
                      <div className="col-span-1 text-center">
                        <button
                          type="button"
                          onClick={() => removeSkill(s.id)}
                          className="text-[#727976] dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-400 p-1 transition-colors"
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

          {/* TAB 6: Sertifikasi */}
          {activeFormTab === "certifications" && (
            <div className="space-y-4 text-xs animate-in fade-in">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-[#191c1c] dark:text-zinc-100">Sertifikasi & Lisensi</h2>
                <button
                  type="button"
                  onClick={addCert}
                  className="inline-flex items-center gap-1 text-xs text-orange-950 dark:text-orange-300 bg-orange-100 dark:bg-orange-950/60 hover:bg-orange-200 dark:hover:bg-orange-900/80 border border-transparent dark:border-orange-800/50 px-2.5 py-1 rounded-lg font-semibold transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" /> Tambah Sertifikat
                </button>
              </div>

              {certifications.length === 0 ? (
                <div className="text-center py-6 border border-dashed border-[#e1e3e2] dark:border-[#242c2a] rounded-xl text-[#727976] dark:text-zinc-400">
                  Belum ada data sertifikasi. Klik "+ Tambah Sertifikat" di atas.
                </div>
              ) : (
                <div className="space-y-3">
                  {certifications.map((c, idx) => (
                    <div key={c.id} className="p-3.5 rounded-xl border border-[#e1e3e2] dark:border-[#242c2a] bg-[#f8faf9] dark:bg-[#121816] space-y-3">
                      <div className="flex items-center justify-between border-b border-[#e1e3e2] dark:border-[#242c2a] pb-2">
                        <span className="font-bold text-slate-900 dark:text-orange-400">Sertifikat #{idx + 1}</span>
                        <button
                          type="button"
                          onClick={() => removeCert(c.id)}
                          className="text-[#727976] dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-400 p-1 transition-colors"
                          title="Hapus"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="space-y-2">
                        <div>
                          <label className="block font-medium text-[#191c1c] dark:text-zinc-200 mb-1">Nama Sertifikasi / Lisensi</label>
                          <input
                            type="text"
                            value={c.name || ""}
                            onChange={(e) => updateCert(c.id, "name", e.target.value)}
                            placeholder="Misal: AWS Certified Solutions Architect"
                            className="w-full px-3 py-1.5 border border-[#e1e3e2] dark:border-[#242c2a] rounded-lg bg-white dark:bg-[#1b2220] text-[#191c1c] dark:text-zinc-100 text-xs focus:outline-none focus:border-orange-500"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block font-medium text-[#191c1c] dark:text-zinc-200 mb-1">Penerbit / Organisasi</label>
                            <input
                              type="text"
                              value={c.issuer || ""}
                              onChange={(e) => updateCert(c.id, "issuer", e.target.value)}
                              placeholder="Misal: Amazon Web Services"
                              className="w-full px-3 py-1.5 border border-[#e1e3e2] dark:border-[#242c2a] rounded-lg bg-white dark:bg-[#1b2220] text-[#191c1c] dark:text-zinc-100 text-xs focus:outline-none focus:border-orange-500"
                            />
                          </div>
                          <div>
                            <label className="block font-medium text-[#191c1c] dark:text-zinc-200 mb-1">Periode / Tanggal Terbit</label>
                            <input
                              type="text"
                              value={c.issueDate || ""}
                              onChange={(e) => updateCert(c.id, "issueDate", e.target.value)}
                              placeholder="Misal: Mei 2025"
                              className="w-full px-3 py-1.5 border border-[#e1e3e2] dark:border-[#242c2a] rounded-lg bg-white dark:bg-[#1b2220] text-[#191c1c] dark:text-zinc-100 text-xs focus:outline-none focus:border-orange-500"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 7: Prestasi & Penghargaan */}
          {activeFormTab === "achievements" && (
            <div className="space-y-4 text-xs animate-in fade-in">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-[#191c1c] dark:text-zinc-100">Prestasi & Penghargaan</h2>
                <button
                  type="button"
                  onClick={addAchievement}
                  className="inline-flex items-center gap-1 text-xs text-orange-950 dark:text-orange-300 bg-orange-100 dark:bg-orange-950/60 hover:bg-orange-200 dark:hover:bg-orange-900/80 border border-transparent dark:border-orange-800/50 px-2.5 py-1 rounded-lg font-semibold transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" /> Tambah Prestasi
                </button>
              </div>

              {achievements.length === 0 ? (
                <div className="text-center py-6 border border-dashed border-[#e1e3e2] dark:border-[#242c2a] rounded-xl text-[#727976] dark:text-zinc-400">
                  Belum ada data prestasi. Klik "+ Tambah Prestasi" di atas.
                </div>
              ) : (
                <div className="space-y-3">
                  {achievements.map((ach, idx) => (
                    <div key={ach.id} className="p-3.5 rounded-xl border border-[#e1e3e2] dark:border-[#242c2a] bg-[#f8faf9] dark:bg-[#121816] space-y-3">
                      <div className="flex items-center justify-between border-b border-[#e1e3e2] dark:border-[#242c2a] pb-2">
                        <span className="font-bold text-slate-900 dark:text-orange-400">Prestasi #{idx + 1}</span>
                        <button
                          type="button"
                          onClick={() => removeAchievement(ach.id)}
                          className="text-[#727976] dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-400 p-1 transition-colors"
                          title="Hapus"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="space-y-2">
                        <div>
                          <label className="block font-medium text-[#191c1c] dark:text-zinc-200 mb-1">Judul / Nama Prestasi</label>
                          <input
                            type="text"
                            value={ach.title || ""}
                            onChange={(e) => updateAchievement(ach.id, "title", e.target.value)}
                            placeholder="Misal: Juara 1 Gemastik UI/UX Competition"
                            className="w-full px-3 py-1.5 border border-[#e1e3e2] dark:border-[#242c2a] rounded-lg bg-white dark:bg-[#1b2220] text-[#191c1c] dark:text-zinc-100 text-xs focus:outline-none focus:border-orange-500"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block font-medium text-[#191c1c] dark:text-zinc-200 mb-1">Penyelenggara / Institusi</label>
                            <input
                              type="text"
                              value={ach.issuer || ""}
                              onChange={(e) => updateAchievement(ach.id, "issuer", e.target.value)}
                              placeholder="Misal: Kemendikbudristek"
                              className="w-full px-3 py-1.5 border border-[#e1e3e2] dark:border-[#242c2a] rounded-lg bg-white dark:bg-[#1b2220] text-[#191c1c] dark:text-zinc-100 text-xs focus:outline-none focus:border-orange-500"
                            />
                          </div>
                          <div>
                            <label className="block font-medium text-[#191c1c] dark:text-zinc-200 mb-1">Tahun / Tanggal</label>
                            <input
                              type="text"
                              value={ach.date || ""}
                              onChange={(e) => updateAchievement(ach.id, "date", e.target.value)}
                              placeholder="Misal: 2024"
                              className="w-full px-3 py-1.5 border border-[#e1e3e2] dark:border-[#242c2a] rounded-lg bg-white dark:bg-[#1b2220] text-[#191c1c] dark:text-zinc-100 text-xs focus:outline-none focus:border-orange-500"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block font-medium text-[#191c1c] dark:text-zinc-200 mb-1">Dampak / Metrik (Opsional)</label>
                          <input
                            type="text"
                            value={ach.impact || ach.metric || ""}
                            onChange={(e) => updateAchievement(ach.id, "impact", e.target.value)}
                            placeholder="Misal: Peringkat Top 1% dari 500+ Tim"
                            className="w-full px-3 py-1.5 border border-[#e1e3e2] dark:border-[#242c2a] rounded-lg bg-white dark:bg-[#1b2220] text-[#191c1c] dark:text-zinc-100 text-xs focus:outline-none focus:border-orange-500"
                          />
                        </div>
                        <div>
                          <label className="block font-medium text-[#191c1c] dark:text-zinc-200 mb-1">Deskripsi Singkat</label>
                          <textarea
                            rows={2}
                            value={ach.description || ""}
                            onChange={(e) => updateAchievement(ach.id, "description", e.target.value)}
                            placeholder="Jelaskan secara singkat latar belakang dan kontribusi Anda..."
                            className="w-full p-2 border border-[#e1e3e2] dark:border-[#242c2a] rounded-lg bg-white dark:bg-[#1b2220] text-[#191c1c] dark:text-zinc-100 text-xs resize-none focus:outline-none focus:border-orange-500"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 8: Bahasa */}
          {activeFormTab === "languages" && (
            <div className="space-y-4 text-xs animate-in fade-in">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-[#191c1c] dark:text-zinc-100">Penguasaan Bahasa</h2>
                <button
                  type="button"
                  onClick={addLanguage}
                  className="inline-flex items-center gap-1 text-xs text-orange-950 dark:text-orange-300 bg-orange-100 dark:bg-orange-950/60 hover:bg-orange-200 dark:hover:bg-orange-900/80 border border-transparent dark:border-orange-800/50 px-2.5 py-1 rounded-lg font-semibold transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" /> Tambah Bahasa
                </button>
              </div>

              {languages.length === 0 ? (
                <div className="text-center py-6 border border-dashed border-[#e1e3e2] dark:border-[#242c2a] rounded-xl text-[#727976] dark:text-zinc-400">
                  Belum ada data penguasaan bahasa. Klik "+ Tambah Bahasa" di atas.
                </div>
              ) : (
                <div className="space-y-2">
                  {languages.map((l) => (
                    <div key={l.id} className="grid grid-cols-12 gap-2 items-center bg-[#f8faf9] dark:bg-[#121816] border border-[#e1e3e2] dark:border-[#242c2a] p-2.5 rounded-lg">
                      <div className="col-span-6">
                        <input
                          type="text"
                          value={l.name}
                          onChange={(e) => updateLanguage(l.id, "name", e.target.value)}
                          placeholder="Misal: Bahasa Indonesia"
                          className="w-full bg-white dark:bg-[#1b2220] px-2.5 py-1.5 border border-[#e1e3e2] dark:border-[#242c2a] rounded text-xs text-[#191c1c] dark:text-zinc-100 focus:outline-none focus:border-orange-500"
                        />
                      </div>
                      <div className="col-span-5">
                        <select
                          value={l.level}
                          onChange={(e) => updateLanguage(l.id, "level", e.target.value)}
                          className="w-full bg-white dark:bg-[#1b2220] px-2.5 py-1.5 border border-[#e1e3e2] dark:border-[#242c2a] rounded text-xs text-[#191c1c] dark:text-zinc-100 focus:outline-none focus:border-orange-500"
                        >
                          {LANGUAGE_LEVEL_OPTIONS[cvLanguage].map((opt) => (
                            <option key={opt.value} value={opt.value} className="dark:bg-[#1b2220] dark:text-zinc-100">
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="col-span-1 text-center">
                        <button type="button" onClick={() => removeLanguage(l.id)} className="text-[#727976] dark:text-zinc-400 hover:text-red-500 dark:hover:text-red-400 p-1">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Form Bottom Save Action */}
          <div className="pt-3 border-t border-[#edeeee] dark:border-[#242c2a] flex items-center justify-between">
            {saveSuccess ? (
              <span className="text-xs text-orange-800 dark:text-orange-300 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Perubahan berhasil disimpan ke My Resumes!
              </span>
            ) : <div />}
            <button
              type="button"
              onClick={handleSaveCV}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-orange-600 dark:bg-orange-500 hover:bg-orange-700 dark:hover:bg-orange-400 text-white text-xs font-bold transition-all shadow-sm"
            >
              <Save className="w-4 h-4 text-white" />
              <span>Simpan Perubahan CV</span>
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: Real-time Live Canvas (6 Cols) */}
        <div
          className={`lg:col-span-6 sticky top-20 print:col-span-12 print:static print:w-full print:m-0 print:p-0 cv-print-container ${
            mobileTab === "form" ? "hidden lg:block" : "block"
          }`}
        >
          <div className={`cv-print-canvas bg-white rounded-2xl border border-[#e1e3e2] shadow-md mx-auto text-[#191c1c] print:p-0 print:m-0 print:max-w-none print:shadow-none print:border-none print:rounded-none ${tStyle.container}`}>
            {!hasAnyData ? (
              <div className="flex flex-col items-center justify-center min-h-[500px] text-center space-y-3 text-[#727976]">
                <FileSearch className="w-12 h-12 text-orange-300 dark:text-orange-800" />
                <h3 className="text-sm font-bold text-[#191c1c]">Pratinjau CV Real-time</h3>
                <p className="text-xs max-w-xs">
                  Isi form di sebelah kiri untuk melihat kanvas dokumen CV ter-update secara otomatis.
                </p>
              </div>
            ) : (
              <div className="space-y-2 text-[#191c1c]">
                {/* Header Canvas (Dynamic Template Styling) */}
                <div className={`pb-1 space-y-0.5 ${tStyle.headerAlign}`}>
                  <h1 className={tStyle.nameText}>{fullName || "NAMA ANDA"}</h1>
                  {personalInfo.targetRole && (
                    <p className={tStyle.roleText}>{personalInfo.targetRole}</p>
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
                {validExperiences.length > 0 && (
                  <div className="py-0.5 space-y-1">
                    <div className={tStyle.sectionHeader}>
                      <h2 className={tStyle.sectionTitle}>
                        {SECTION_TITLES[cvLanguage].experience}
                      </h2>
                    </div>
                    <div className="space-y-1.5">
                      {validExperiences.map((exp) => (
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
                {validProjects.length > 0 && (
                  <div className="py-0.5 space-y-1">
                    <div className={tStyle.sectionHeader}>
                      <h2 className={tStyle.sectionTitle}>
                        {SECTION_TITLES[cvLanguage].projects}
                      </h2>
                    </div>
                    <div className="space-y-1.5">
                      {validProjects.map((proj) => (
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
                {validEducation.length > 0 && (
                  <div className="py-0.5 space-y-1">
                    <div className={tStyle.sectionHeader}>
                      <h2 className={tStyle.sectionTitle}>
                        {SECTION_TITLES[cvLanguage].education}
                      </h2>
                    </div>
                    <div className="space-y-1.5">
                      {validEducation.map((edu) => (
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

                {/* Skills (Inline Sideways Layout for Maximum Space Saving) */}
                {validSkills.length > 0 && (
                  <div className="py-0.5 space-y-0.5">
                    <div className={tStyle.sectionHeader}>
                      <h2 className={tStyle.sectionTitle}>
                        {SECTION_TITLES[cvLanguage].skills}
                      </h2>
                    </div>
                    {useCategories ? (
                      <div className="space-y-0.5 text-[10.5px] leading-snug text-[#191c1c]">
                        {groupSkillsByCategory(validSkills).map((group, idx) => (
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
                        {validSkills.map((s) => (typeof s === "string" ? s : s.name)).filter(Boolean).join(" • ")}
                      </p>
                    )}
                  </div>
                )}

                {/* Languages */}
                {validLanguages.length > 0 && (
                  <div className="py-0.5 space-y-0.5">
                    <div className={tStyle.sectionHeader}>
                      <h2 className={tStyle.sectionTitle}>
                        {SECTION_TITLES[cvLanguage].languages}
                      </h2>
                    </div>
                    <p className="text-[10.5px] leading-snug text-[#191c1c]">
                      {validLanguages.map((l) => {
                        const formattedLevel = formatLanguageLevel(l.level, cvLanguage);
                        return formattedLevel ? `${l.name} (${formattedLevel})` : l.name;
                      }).join(" • ")}
                    </p>
                  </div>
                )}

                {/* Certifications */}
                {validCertifications.length > 0 && (
                  <div className="py-0.5 space-y-0.5">
                    <div className={tStyle.sectionHeader}>
                      <h2 className={tStyle.sectionTitle}>
                        {SECTION_TITLES[cvLanguage].certifications}
                      </h2>
                    </div>
                    <div className="space-y-1">
                      {validCertifications.map((cert) => (
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
                {validAchievements.length > 0 && (
                  <div className="py-0.5 space-y-0.5">
                    <div className={tStyle.sectionHeader}>
                      <h2 className={tStyle.sectionTitle}>
                        {SECTION_TITLES[cvLanguage].achievements}
                      </h2>
                    </div>
                    <div className="space-y-1">
                      {validAchievements.map((ach) => (
                        <div key={ach.id} className="text-[10.5px] space-y-0.5">
                          <div className="flex items-center justify-between font-bold text-[#191c1c]">
                            <span>
                              {ach.title}
                              {ach.issuer ? <span className="font-normal text-[#4c6079]"> — {ach.issuer}</span> : null}
                            </span>
                            {ach.date && (
                              <span className="font-mono text-[10px] text-[#191c1c] font-normal">
                                {ach.date}
                              </span>
                            )}
                          </div>
                          {(ach.impact || ach.metric) && (
                            <p className="text-[10px] font-semibold text-orange-950">{ach.impact || ach.metric}</p>
                          )}
                          {ach.description && (
                            <p className="text-[10px] text-[#191c1c] leading-snug">{ach.description}</p>
                          )}
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
      {/* ATS Keyword Density & Optimization Drawer (PRD §23, §24) */}
      {isAtsDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-white dark:bg-[#1b2220] h-full shadow-2xl border-l border-[#e1e3e2] dark:border-[#242c2a] flex flex-col p-6 space-y-5 overflow-y-auto animate-in slide-in-from-right">
            <div className="flex items-center justify-between pb-3 border-b border-[#edeeee] dark:border-[#242c2a]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-950/60 text-orange-950 dark:text-orange-300 flex items-center justify-center font-bold">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-[#191c1c] dark:text-[#e2e8e6]">ATS Keyword Optimizer</h2>
                  <p className="text-xs text-[#727976] dark:text-[#a0aaa5]">ATS Density & Format Inspector</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAtsDrawerOpen(false)}
                className="p-1 rounded-lg text-[#727976] dark:text-zinc-400 hover:bg-[#f2f4f3] dark:hover:bg-[#121816]"
              >
                ✕
              </button>
            </div>

            {/* Calculate Resume Text & Keyword Statistics */}
            {(() => {
              const fullResumeText = `${fullName} ${personalInfo.targetRole} ${summary} ${validExperiences.map(e => `${e.role} ${e.company} ${e.bullets}`).join(' ')} ${validSkills.map(s => typeof s === 'string' ? s : s.name).join(' ')}`;
              const totalWords = fullResumeText.split(/\s+/).filter(Boolean).length || 1;
              const uniqueSkillNames = Array.from(new Set(validSkills.map(s => typeof s === 'string' ? s : s.name).filter(Boolean)));
              const masterProfileSkillNames = (profile.skills || []).map((s: any) => typeof s === 'string' ? s : s.name);
              const missingSkills = masterProfileSkillNames.filter(m => !uniqueSkillNames.some(u => u.toLowerCase().trim() === m.toLowerCase().trim()));

              const densityList = uniqueSkillNames.map(skill => {
                const regex = new RegExp(skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
                const matches = fullResumeText.match(regex);
                const count = matches ? matches.length : 0;
                const density = parseFloat(((count * 100) / totalWords).toFixed(1));
                let status: "ideal" | "low" | "overstuffed" = "ideal";
                if (density < 1.5) status = "low";
                else if (density > 4.5) status = "overstuffed";
                return { skill, count, density, status };
              });

              const idealCount = densityList.filter(d => d.status === "ideal").length;
              const atsScore = Math.min(98, Math.max(65, Math.round(70 + (idealCount / (densityList.length || 1)) * 25)));

              return (
                <div className="space-y-5 text-xs">
                  {/* ATS Compatibility Score Card */}
                  <div className="bg-[#f8faf9] dark:bg-[#121816] p-4 rounded-xl border border-[#e1e3e2] dark:border-[#242c2a] flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-mono uppercase text-[#727976] dark:text-zinc-400">ATS Score Estimate</span>
                      <h3 className="text-xl font-extrabold text-orange-600 dark:text-orange-400">{atsScore}% Compatibility</h3>
                      <p className="text-[11px] text-[#727976] dark:text-zinc-400 mt-0.5">Total Words: {totalWords} words (~1 Page density)</p>
                    </div>
                    <div className="w-12 h-12 rounded-full border-4 border-orange-600 dark:border-orange-500 flex items-center justify-center font-mono font-bold text-xs text-orange-600 dark:text-orange-400">
                      {atsScore}
                    </div>
                  </div>

                  {/* Keyword Density Inspector */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between font-bold text-[#191c1c] dark:text-[#e2e8e6]">
                      <span>Kepadatan Kata Kunci (Keyword Density)</span>
                      <span className="text-[10px] font-mono text-[#727976] dark:text-zinc-400">Target Ideal: 1.5% - 4.0%</span>
                    </div>

                    <div className="space-y-1.5 max-h-48 overflow-y-auto p-2 bg-[#f8faf9] dark:bg-[#121816] rounded-xl border border-[#e1e3e2] dark:border-[#242c2a]">
                      {densityList.map((d, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2 bg-white dark:bg-[#1b2220] rounded-lg border border-[#edeeee] dark:border-[#242c2a]">
                          <span className="font-semibold text-[#191c1c] dark:text-[#e2e8e6]">{d.skill}</span>
                          <div className="flex items-center gap-2 font-mono text-[11px]">
                            <span className="text-[#191c1c] dark:text-zinc-300">{d.count}x ({d.density}%)</span>
                            <span
                              className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                                d.status === "ideal"
                                  ? "bg-orange-100 dark:bg-orange-950/60 text-orange-800 dark:text-orange-300"
                                  : d.status === "low"
                                  ? "bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300"
                                  : "bg-red-100 dark:bg-red-950/60 text-red-800 dark:text-red-300"
                              }`}
                            >
                              {d.status === "ideal" ? "Ideal" : d.status === "low" ? "Rendah" : "Stuffed!"}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Missing Skills from Master Profile */}
                  {missingSkills.length > 0 && (
                    <div className="space-y-2 pt-2 border-t border-[#edeeee] dark:border-[#242c2a]">
                      <h4 className="font-bold text-[#191c1c] dark:text-[#e2e8e6]">Skill Master Profile yang Belum Masuk ke CV ini:</h4>
                      <div className="flex flex-wrap gap-1.5">
                        {missingSkills.map((sk, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => {
                              const newSkills = [...skills, { id: `sk_inj_${Date.now()}_${idx}`, name: sk, category: "Core Development", included: true }];
                              setSkills(newSkills);
                            }}
                            className="px-2.5 py-1 bg-orange-100 dark:bg-orange-950/60 hover:bg-orange-200 dark:hover:bg-orange-900/80 text-orange-950 dark:text-orange-300 border border-transparent dark:border-orange-800/50 rounded-md font-semibold text-[11px] flex items-center gap-1 transition-colors"
                          >
                            + Sisipkan &quot;{sk}&quot;
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Readability & Format Health Checklist */}
                  <div className="space-y-2 pt-2 border-t border-[#edeeee] dark:border-[#242c2a]">
                    <h4 className="font-bold text-[#191c1c] dark:text-[#e2e8e6]">Pemeriksaan Format & Keterbacaan ATS:</h4>
                    <ul className="space-y-1.5 text-[11px]">
                      <li className="flex items-center gap-2 text-orange-700 dark:text-orange-400 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400 shrink-0" />
                        <span>Email & Kontak Valid (Bebas elemen grafis terselubung)</span>
                      </li>
                      <li className="flex items-center gap-2 text-orange-700 dark:text-orange-400 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400 shrink-0" />
                        <span>Penggunaan Judul Seksi Standar (WORK EXPERIENCE, EDUCATION, SKILLS)</span>
                      </li>
                      <li className="flex items-center gap-2 text-orange-700 dark:text-orange-400 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400 shrink-0" />
                        <span>Densitas kata kunci teratur (Bebas dari penalti keyword stuffing)</span>
                      </li>
                    </ul>
                  </div>
                </div>
              );
            })()}

            <div className="pt-3 border-t border-[#edeeee] dark:border-[#242c2a] flex justify-end">
              <button
                type="button"
                onClick={() => setIsAtsDrawerOpen(false)}
                className="w-full py-2 bg-orange-600 dark:bg-orange-500 text-white rounded-lg text-xs font-semibold hover:bg-orange-700 dark:hover:bg-orange-400"
              >
                Tutup Optimizer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}



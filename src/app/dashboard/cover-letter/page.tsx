"use client";

import { useState, useEffect } from "react";
import {
  FileText,
  Sparkles,
  Copy,
  Check,
  Download,
  ShieldCheck,
  RefreshCw,
  Sliders,
  Briefcase,
  FolderGit2,
  GraduationCap,
  Layers,
} from "lucide-react";
import { useUserProfile } from "@/lib/use-user-profile";
import { useAuth } from "@/lib/auth-context";

export default function CoverLetterPage() {
  const { profile } = useUserProfile();
  const { user } = useAuth();

  const fullName = profile.personalInfo?.fullName || "";
  const [applicantName, setApplicantName] = useState(fullName);
  const [companyName, setCompanyName] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [tone, setTone] = useState<"professional" | "enthusiastic" | "confident" | "concise">("professional");
  const [language, setLanguage] = useState<"id" | "en">("id");
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  // Sync applicant name when profile loads
  useEffect(() => {
    if (fullName && !applicantName) {
      setApplicantName(fullName);
    }
  }, [fullName, applicantName]);

  // Master Profile Customization Multi-Select Selections
  const [selectedExpIds, setSelectedExpIds] = useState<string[]>([]);
  const [selectedProjIds, setSelectedProjIds] = useState<string[]>([]);
  const [selectedEduIds, setSelectedEduIds] = useState<string[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);

  const experiences = profile.experiences || [];
  const projects = profile.projects || [];
  const education = profile.education || [];
  const skillsList = profile.skills || [];

  const toggleExpSelection = (id: string) => {
    if (selectedExpIds.includes(id)) {
      setSelectedExpIds(selectedExpIds.filter(i => i !== id));
    } else {
      setSelectedExpIds([...selectedExpIds, id]);
    }
  };

  const toggleProjSelection = (id: string) => {
    if (selectedProjIds.includes(id)) {
      setSelectedProjIds(selectedProjIds.filter(i => i !== id));
    } else {
      setSelectedProjIds([...selectedProjIds, id]);
    }
  };

  const toggleEduSelection = (id: string) => {
    if (selectedEduIds.includes(id)) {
      setSelectedEduIds(selectedEduIds.filter(i => i !== id));
    } else {
      setSelectedEduIds([...selectedEduIds, id]);
    }
  };

  const toggleSkillSelection = (skillName: string) => {
    if (selectedSkills.includes(skillName)) {
      setSelectedSkills(selectedSkills.filter(s => s !== skillName));
    } else {
      setSelectedSkills([...selectedSkills, skillName]);
    }
  };

  // Helper to build active cover letter text strictly based on multi-selected Master Profile subset
  const buildLetterContent = (
    cName: string,
    jTitle: string,
    expIds: string[],
    projIds: string[],
    eduIds: string[],
    skillsArr: string[],
    wTone: string,
    wLang: string,
    aName: string
  ) => {
    const activeExps = expIds.length > 0
      ? experiences.filter(e => expIds.includes(e.id))
      : [];

    const activeProjs = projIds.length > 0
      ? projects.filter(p => projIds.includes(p.id))
      : [];

    const activeEdus = eduIds.length > 0
      ? education.filter(ed => eduIds.includes(ed.id))
      : [];

    const activeSkillsStr = skillsArr.length > 0
      ? skillsArr.join(", ")
      : "";

    const targetCompany = cName.trim() || "[Nama Perusahaan]";
    const targetRole = jTitle.trim() || "[Posisi Target]";
    const signName = aName.trim() || "[Nama Anda]";

    // Build experience text
    let expTextID = "";
    let expTextEN = "";

    if (activeExps.length === 1) {
      const e: any = activeExps[0];
      const bullet = Array.isArray(e.bullets) ? e.bullets[0] : (typeof e.bullets === "string" ? e.bullets.split("\n")[0] : "");
      expTextID = `Selama peran saya sebagai ${e.role} di ${e.company}, saya bertanggung jawab atas ${bullet || "pengembangan arsitektur sistem dan optimasi performa"}.`;
      expTextEN = `During my role as ${e.role} at ${e.company}, I was responsible for ${bullet || "scalable application architecture and performance optimization"}.`;
    } else if (activeExps.length > 1) {
      const expListID = activeExps.map((e: any) => {
        const bullet = Array.isArray(e.bullets) ? e.bullets[0] : (typeof e.bullets === "string" ? e.bullets.split("\n")[0] : "");
        return `• ${e.role} di ${e.company}: ${bullet || "Pengembangan sistem dan arsitektur produk"}`;
      }).join("\n");
      expTextID = `Rekam jejak pengalaman kerja relevan yang saya miliki mencakup:\n${expListID}`;

      const expListEN = activeExps.map((e: any) => {
        const bullet = Array.isArray(e.bullets) ? e.bullets[0] : (typeof e.bullets === "string" ? e.bullets.split("\n")[0] : "");
        return `• ${e.role} at ${e.company}: ${bullet || "Software engineering and system architecture"}`;
      }).join("\n");
      expTextEN = `My relevant professional experience includes:\n${expListEN}`;
    }

    // Build project text
    let projTextID = "";
    let projTextEN = "";
    if (activeProjs.length > 0) {
      const projListID = activeProjs.map(p => `• ${p.name} (${p.role || 'Project'}): ${p.description || "Pengembangan solusi teknologi tepat guna"}`).join("\n");
      projTextID = `Beberapa project kunci yang pernah saya kerjakan antara lain:\n${projListID}`;

      const projListEN = activeProjs.map(p => `• ${p.name} (${p.role || 'Project'}): ${p.description || "Scalable technical solution delivery"}`).join("\n");
      projTextEN = `Key featured projects include:\n${projListEN}`;
    }

    // Build education text
    let eduTextID = "";
    let eduTextEN = "";
    if (activeEdus.length === 1) {
      const ed = activeEdus[0];
      eduTextID = `Latar belakang pendidikan saya di ${ed.institution} (${ed.degree}${ed.fieldOfStudy ? ` ${ed.fieldOfStudy}` : ''}) memberikan fondasi teknis yang kuat dalam menyelesaikan tantangan rekayasa perangkat lunak secara terstruktur.`;
      eduTextEN = `My academic foundation from ${ed.institution} (${ed.degree}${ed.fieldOfStudy ? ` in ${ed.fieldOfStudy}` : ''}) has provided me with a rigorous engineering mindset to build scalable software solutions.`;
    } else if (activeEdus.length > 1) {
      const eduStrID = activeEdus.map(ed => `${ed.institution} (${ed.degree})`).join(" serta ");
      eduTextID = `Latar belakang pendidikan dan pelatihan saya di ${eduStrID} memberikan fondasi teknis yang komprehensif.`;

      const eduStrEN = activeEdus.map(ed => `${ed.institution} (${ed.degree})`).join(" and ");
      eduTextEN = `My academic and training background from ${eduStrEN} provides a comprehensive technical foundation.`;
    }

    if (wLang === "id") {
      const skillsClause = activeSkillsStr ? ` di bidang ${activeSkillsStr}` : "";
      const skillsClauseGeneral = activeSkillsStr ? `dalam ${activeSkillsStr}` : "di bidang yang relevan";

      let opening = "";
      let closing = "";

      if (wTone === "enthusiastic") {
        opening = `Yth. Tim HR ${targetCompany},\n\nSaya sangat bersemangat melamar posisi ${targetRole} di ${targetCompany}! Berdasarkan profil karir terverifikasi saya${skillsClause}, saya melihat keselarasan luar biasa antara kualifikasi saya dengan kebutuhan tim Anda.`;
        closing = `Terima kasih atas perhatian Bapak/Ibu dan saya sangat berharap dapat berdiskusi langsung dalam sesi wawancara!\n\nHormat saya,\n\n${signName}`;
      } else if (wTone === "concise") {
        opening = `Yth. Rekruter ${targetCompany},\n\nSaya melamar untuk posisi ${targetRole} di ${targetCompany}.${activeSkillsStr ? ` Keahlian di bidang ${activeSkillsStr} serta pengalaman terlampir siap diterapkan langsung untuk mendukung pertumbuhan produk Anda.` : ' Pengalaman terlampir siap diterapkan langsung untuk mendukung pertumbuhan produk Anda.'}`;
        closing = `Terima kasih atas waktu Bapak/Ibu.\n\nHormat saya,\n\n${signName}`;
      } else {
        opening = `Kepada Yth. Tim Rekrutmen ${targetCompany},\n\nSaya menulis surat lamaran ini untuk menyampaikan ketertarikan profesional saya pada posisi ${targetRole} di ${targetCompany}. Dengan latar belakang pengalaman dan penguasaan keahlian ${skillsClauseGeneral}, saya yakin dapat memberikan kontribusi nyata bagi perkembangan tim Anda.`;
        closing = `Saya sangat terkesan dengan reputasi ${targetCompany} dan berantusias untuk membawa keahlian teknis serta komitmen profesional saya ke dalam tim Anda. Terima kasih atas perhatian Bapak/Ibu. Saya menyambut baik kesempatan untuk berdiskusi lebih lanjut dalam sesi wawancara.\n\nHormat saya,\n\n${signName}`;
      }

      const bodyContent = [expTextID, projTextID, eduTextID].filter(Boolean).join("\n\n");
      return bodyContent ? `${opening}\n\n${bodyContent}\n\n${closing}` : `${opening}\n\n${closing}`;
    } else {
      const skillsClauseEN = activeSkillsStr ? ` across ${activeSkillsStr}` : "";

      const openingEN = `Dear Hiring Manager at ${targetCompany},\n\nI am writing to express my strong interest in the ${targetRole} position at ${targetCompany}.${activeSkillsStr ? ` Bringing proven expertise${skillsClauseEN}, I am confident in my ability to deliver immediate value to your organization.` : ' I am confident in my ability to deliver immediate value to your organization.'}`;
      const closingEN = `I admire ${targetCompany}'s innovation and culture, and I am eager to contribute my technical background to your upcoming initiatives. Thank you for your time and consideration. I welcome the opportunity to discuss my qualifications further.\n\nSincerely,\n\n${signName}`;

      const bodyContentEN = [expTextEN, projTextEN, eduTextEN].filter(Boolean).join("\n\n");
      return bodyContentEN ? `${openingEN}\n\n${bodyContentEN}\n\n${closingEN}` : `${openingEN}\n\n${closingEN}`;
    }
  };

  // Live document letter state
  const [letterText, setLetterText] = useState<string>("");

  // Re-build cover letter live preview whenever selections or inputs change
  useEffect(() => {
    setLetterText(
      buildLetterContent(
        companyName,
        jobTitle,
        selectedExpIds,
        selectedProjIds,
        selectedEduIds,
        selectedSkills,
        tone,
        language,
        applicantName
      )
    );
  }, [
    companyName,
    jobTitle,
    selectedExpIds,
    selectedProjIds,
    selectedEduIds,
    selectedSkills,
    tone,
    language,
    applicantName,
    experiences,
    education,
    projects,
  ]);

  const handleGenerate = async () => {
    setIsGenerating(true);

    const userId = user?.id || "";
    const provider = (localStorage.getItem(userId ? `cvforge_ai_provider_${userId}` : "cvforge_ai_provider") as any) || "gemini";
    const geminiKey = localStorage.getItem(userId ? `cvforge_gemini_key_${userId}` : "cvforge_gemini_key") || "";
    const openaiKey = localStorage.getItem(userId ? `cvforge_openai_key_${userId}` : "cvforge_openai_key") || "";
    const activeKey = provider === "openai" ? openaiKey : geminiKey;

    try {
      if (activeKey) {
        const selectedExps = (experiences || []).filter((e: any) => selectedExpIds.includes(e.id));
        const selectedEdus = (education || []).filter((e: any) => selectedEduIds.includes(e.id));
        const selectedProjs = (projects || []).filter((p: any) => selectedProjIds.includes(p.id));

        const res = await fetch("/api/ai/cover-letter", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": activeKey,
            "x-ai-provider": provider,
          },
          body: JSON.stringify({
            targetCompany: companyName,
            targetPosition: jobTitle,
            applicantName,
            tone,
            experiences: selectedExps,
            education: selectedEdus,
            projects: selectedProjs,
            skills: selectedSkills,
          }),
        });

        const data = await res.json();
        if (res.ok && data.success && data.data?.coverLetter) {
          setLetterText(data.data.coverLetter);
          setIsGenerating(false);
          return;
        }
      }
    } catch (err) {
      console.warn("Cover letter live LLM fetch failed, using internal builder:", err);
    }

    const generated = buildLetterContent(
      companyName,
      jobTitle,
      selectedExpIds,
      selectedProjIds,
      selectedEduIds,
      selectedSkills,
      tone,
      language,
      applicantName
    );
    setLetterText(generated);
    setIsGenerating(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(letterText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadDoc = () => {
    const docContent = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head><meta charset='utf-8'><title>Cover Letter - ${companyName}</title>
      <style>body { font-family: Calibri, sans-serif; font-size: 11pt; line-height: 1.5; margin: 1in; color: #191c1c; }</style>
      </head>
      <body>
        ${letterText.replace(/\n/g, "<br>")}
      </body>
      </html>
    `;
    const blob = new Blob(["\ufeff", docContent], { type: "application/msword" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Cover_Letter_${companyName.replace(/\s+/g, "_")}.doc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-slate-200/80 dark:border-zinc-800 shadow-xs transition-all">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-950/80 border border-orange-200 dark:border-orange-900/60 text-orange-600 dark:text-orange-400">
              <FileText className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              Cover Letter Studio
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1.5 max-w-xl">
            Tailor high-impact cover letters grounded 100% in your verified career achievements with precision multi-selection.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono bg-slate-50 dark:bg-zinc-950 px-3 py-2 rounded-lg border border-slate-200/80 dark:border-zinc-800/80 text-slate-600 dark:text-zinc-400">
          <ShieldCheck className="w-4 h-4 text-orange-500" />
          <span>Fact-Grounded Engine</span>
        </div>
      </div>

      {/* Main Workspace (Left Form vs Right Preview Canvas) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Form Options & Data Selection (5 Cols) */}
        <div className="lg:col-span-5 space-y-5 bg-white dark:bg-zinc-900 p-5 sm:p-6 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-xs">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 flex items-center gap-2 pb-2.5 border-b border-slate-100 dark:border-zinc-800">
            <Sliders className="w-4 h-4 text-orange-500" /> Target Job & Preferences
          </h2>

          <div className="space-y-3.5 text-xs">
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700 dark:text-zinc-300">Nama Pelamar / Applicant Name</label>
              <input
                type="text"
                value={applicantName}
                onChange={(e) => setApplicantName(e.target.value)}
                placeholder="e.g. Nama Lengkap Anda"
                className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-zinc-800 rounded-xl bg-slate-50/50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 focus:border-orange-500 focus:ring-1 focus:ring-orange-500/20 focus:outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-zinc-600"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700 dark:text-zinc-300">Target Company</label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. Tokopedia, Stripe"
                  className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-zinc-800 rounded-xl bg-slate-50/50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 focus:border-orange-500 focus:ring-1 focus:ring-orange-500/20 focus:outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-zinc-600"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700 dark:text-zinc-300">Target Job Title</label>
                <input
                  type="text"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="e.g. Senior Frontend Engineer"
                  className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-zinc-800 rounded-xl bg-slate-50/50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 focus:border-orange-500 focus:ring-1 focus:ring-orange-500/20 focus:outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-zinc-600"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700 dark:text-zinc-300">Job Description Context</label>
              <textarea
                rows={2}
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste key responsibilities or tech stack..."
                className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-zinc-800 rounded-xl bg-slate-50/50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 focus:border-orange-500 focus:ring-1 focus:ring-orange-500/20 focus:outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-zinc-600"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700 dark:text-zinc-300">Writing Tone</label>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-zinc-800 rounded-xl bg-slate-50/50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 focus:border-orange-500 focus:outline-none transition-all"
                >
                  <option value="professional">Professional</option>
                  <option value="enthusiastic">Enthusiastic</option>
                  <option value="confident">Confident</option>
                  <option value="concise">Concise & Direct</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700 dark:text-zinc-300">Language</label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-zinc-800 rounded-xl bg-slate-50/50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 focus:border-orange-500 focus:outline-none transition-all"
                >
                  <option value="id">Bahasa Indonesia 🇮🇩</option>
                  <option value="en">English 🇬🇧</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Master Profile Multi-Select Custom Data Selector */}
          <div className="pt-4 border-t border-slate-100 dark:border-zinc-800 space-y-3.5">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 flex items-center gap-2">
                <Layers className="w-4 h-4 text-orange-500" /> Select Relevant Facts
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1">
                Choose specific career profile items to inject into your cover letter preview.
              </p>
            </div>

            <div className="space-y-3.5 text-xs">
              {/* Multi-Select Experience Chips */}
              {experiences.length > 0 && (
                <div className="space-y-2">
                  <label className="font-medium text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-orange-500" /> Work Experience:
                  </label>
                  <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-2 bg-slate-50/80 dark:bg-zinc-950/60 rounded-xl border border-slate-200/80 dark:border-zinc-800/80">
                    {experiences.map((exp) => {
                      const isSelected = selectedExpIds.includes(exp.id);
                      return (
                        <button
                          key={exp.id}
                          type="button"
                          onClick={() => toggleExpSelection(exp.id)}
                          className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all text-left flex items-center gap-1.5 ${
                            isSelected
                              ? "bg-orange-500/10 border border-orange-500/40 text-orange-700 dark:bg-orange-500/20 dark:text-orange-300 dark:border-orange-500/50 shadow-2xs"
                              : "bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800"
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3 shrink-0 text-orange-500" />}
                          <span>{exp.role} ({exp.company})</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Multi-Select Project Chips */}
              {projects.length > 0 && (
                <div className="space-y-2">
                  <label className="font-medium text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
                    <FolderGit2 className="w-3.5 h-3.5 text-orange-500" /> Featured Projects:
                  </label>
                  <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-2 bg-slate-50/80 dark:bg-zinc-950/60 rounded-xl border border-slate-200/80 dark:border-zinc-800/80">
                    {projects.map((proj) => {
                      const isSelected = selectedProjIds.includes(proj.id);
                      return (
                        <button
                          key={proj.id}
                          type="button"
                          onClick={() => toggleProjSelection(proj.id)}
                          className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all text-left flex items-center gap-1.5 ${
                            isSelected
                              ? "bg-orange-500/10 border border-orange-500/40 text-orange-700 dark:bg-orange-500/20 dark:text-orange-300 dark:border-orange-500/50 shadow-2xs"
                              : "bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800"
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3 shrink-0 text-orange-500" />}
                          <span>{proj.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Multi-Select Education Chips */}
              {education.length > 0 && (
                <div className="space-y-2">
                  <label className="font-medium text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
                    <GraduationCap className="w-3.5 h-3.5 text-orange-500" /> Education & Credentials:
                  </label>
                  <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-2 bg-slate-50/80 dark:bg-zinc-950/60 rounded-xl border border-slate-200/80 dark:border-zinc-800/80">
                    {education.map((edu) => {
                      const isSelected = selectedEduIds.includes(edu.id);
                      return (
                        <button
                          key={edu.id}
                          type="button"
                          onClick={() => toggleEduSelection(edu.id)}
                          className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all text-left flex items-center gap-1.5 ${
                            isSelected
                              ? "bg-orange-500/10 border border-orange-500/40 text-orange-700 dark:bg-orange-500/20 dark:text-orange-300 dark:border-orange-500/50 shadow-2xs"
                              : "bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800"
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3 shrink-0 text-orange-500" />}
                          <span>{edu.institution} ({edu.degree})</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Multi-Select Skills Chips */}
              {skillsList.length > 0 && (
                <div className="space-y-2">
                  <label className="font-medium text-slate-700 dark:text-zinc-300 block">
                    Key Technical Skills:
                  </label>
                  <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-2 bg-slate-50/80 dark:bg-zinc-950/60 rounded-xl border border-slate-200/80 dark:border-zinc-800/80">
                    {skillsList.map((sk) => {
                      const sName = typeof sk === "string" ? sk : sk.name;
                      const isSelected = selectedSkills.includes(sName);
                      return (
                        <button
                          key={sk.id || sName}
                          type="button"
                          onClick={() => toggleSkillSelection(sName)}
                          className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all flex items-center gap-1.5 ${
                            isSelected
                              ? "bg-orange-500/10 border border-orange-500/40 text-orange-700 dark:bg-orange-500/20 dark:text-orange-300 dark:border-orange-500/50 shadow-2xs"
                              : "bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800"
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3 text-orange-500" />}
                          {sName}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full mt-2 py-3 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white font-semibold rounded-xl text-xs transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" /> Generating Cover Letter...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-orange-100" /> AI Enhance Selection
              </>
            )}
          </button>
        </div>

        {/* Right Column: Live Letter Paper Preview (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
                Document Studio Preview
              </span>
              <span className="font-mono text-[11px] px-2.5 py-0.5 rounded-full bg-slate-200/80 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 font-medium">
                {letterText.trim() ? letterText.trim().split(/\s+/).length : 0} words
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-200 rounded-lg text-xs font-medium hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors shadow-2xs"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                {copied ? "Copied!" : "Copy Text"}
              </button>

              <button
                type="button"
                onClick={handleDownloadDoc}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white rounded-lg text-xs font-semibold transition-colors shadow-2xs"
              >
                <Download className="w-3.5 h-3.5 text-orange-100" /> Download DOCX
              </button>
            </div>
          </div>

          <div className="cv-paper-canvas bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-md min-h-[520px]">
            <textarea
              value={letterText}
              onChange={(e) => setLetterText(e.target.value)}
              className="w-full h-[520px] bg-white text-sm leading-relaxed text-[#191c1c] font-sans resize-none focus:outline-none placeholder:text-slate-400"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

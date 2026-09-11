"use client";

import { useState, useMemo } from "react";
import {
  Cpu,
  Plus,
  X,
  Check,
  CheckCircle2,
  GripVertical,
  Trash2,
  Layers,
  Filter,
  FileText,
} from "lucide-react";
import { useUserProfile, ProfileSkill } from "@/lib/use-user-profile";

type ProficiencyLevel = "Expert" | "Advanced" | "Intermediate" | "Beginner";

const proficiencyNum: Record<ProficiencyLevel, number> = {
  Expert: 4,
  Advanced: 3,
  Intermediate: 2,
  Beginner: 1,
};

const numProficiency: Record<number, ProficiencyLevel> = {
  4: "Expert",
  3: "Advanced",
  2: "Intermediate",
  1: "Beginner",
};

const proficiencyDots: Record<ProficiencyLevel, number> = {
  Expert: 4,
  Advanced: 3,
  Intermediate: 2,
  Beginner: 1,
};

export default function SkillsPage() {
  const { profile, saveProfile } = useUserProfile();
  const [newSkillInputs, setNewSkillInputs] = useState<Record<string, string>>({});
  const [newProficiency, setNewProficiency] = useState<Record<string, ProficiencyLevel>>({});
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [customCategories, setCustomCategories] = useState<string[]>([]);

  const [selectedResumeFilter, setSelectedResumeFilter] = useState<string>("all");
  const [openLinkageSkillId, setOpenLinkageSkillId] = useState<string | null>(null);
  const savedResumes = profile.resumes || [];

  const skills = profile.skills || [];

  const getLinkedResumes = (skill: ProfileSkill) => {
    return savedResumes.filter((r) => {
      const snap = r.contentSnapshot?.skills;
      if (!Array.isArray(snap)) return false;
      return snap.some((s: any) =>
        typeof s === "string"
          ? s.toLowerCase().trim() === skill.name.toLowerCase().trim()
          : s.id === skill.id || (s.name || "").toLowerCase().trim() === skill.name.toLowerCase().trim()
      );
    });
  };

  const toggleResumeLink = (skill: ProfileSkill, resumeId: string) => {
    const targetResume = savedResumes.find((r) => r.id === resumeId);
    if (!targetResume) return;

    const currentSnap = targetResume.contentSnapshot || {};
    const rawSkills = currentSnap.skills;
    const currentSkills = Array.isArray(rawSkills) ? rawSkills : [];

    const exists = currentSkills.some((s: any) =>
      typeof s === "string"
        ? s.toLowerCase().trim() === skill.name.toLowerCase().trim()
        : s.id === skill.id || (s.name || "").toLowerCase().trim() === skill.name.toLowerCase().trim()
    );

    let newSkills = [];
    if (exists) {
      newSkills = currentSkills.filter(
        (s: any) =>
          !(
            typeof s === "string"
              ? s.toLowerCase().trim() === skill.name.toLowerCase().trim()
              : s.id === skill.id || (s.name || "").toLowerCase().trim() === skill.name.toLowerCase().trim()
          )
      );
    } else {
      newSkills = [
        ...currentSkills,
        {
          id: skill.id,
          name: skill.name,
          category: skill.category || "Core Development",
          proficiency: skill.proficiency,
        },
      ];
    }

    const updatedResume = {
      ...targetResume,
      contentSnapshot: {
        ...currentSnap,
        skills: newSkills,
      },
    };

    const newResumesList = savedResumes.map((r) => (r.id === resumeId ? updatedResume : r));
    saveProfile({
      ...profile,
      resumes: newResumesList,
    });
  };

  const filteredSkills = useMemo(() => {
    return skills.filter((skill) => {
      if (selectedResumeFilter === "all") return true;
      if (selectedResumeFilter === "unlinked") return getLinkedResumes(skill).length === 0;
      const linked = getLinkedResumes(skill);
      return linked.some((r) => r.id === selectedResumeFilter);
    });
  }, [skills, selectedResumeFilter, savedResumes]);

  // Group skills by category
  const categories = useMemo(() => {
    const map = new Map<string, ProfileSkill[]>();
    
    // Ensure all custom categories exist in map
    customCategories.forEach((cat) => {
      if (!map.has(cat)) map.set(cat, []);
    });

    // Group filtered skills
    filteredSkills.forEach((s) => {
      const cat = s.category || "General";
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat)!.push(s);
    });

    return Array.from(map.entries()).map(([name, catSkills]) => ({
      name,
      skills: catSkills,
    }));
  }, [filteredSkills, customCategories]);

  const addSkillToCategory = (catName: string) => {
    const name = newSkillInputs[catName]?.trim();
    const level = newProficiency[catName] ?? "Intermediate";
    if (!name) return;

    const newSkill: ProfileSkill = {
      id: `sk_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      name,
      category: catName,
      proficiency: proficiencyNum[level] || 2,
      verified: false,
    };

    saveProfile({ ...profile, skills: [...skills, newSkill] });
    setNewSkillInputs((prev) => ({ ...prev, [catName]: "" }));
  };

  const removeSkill = (skillId: string) => {
    const targetSkill = skills.find((s) => s.id === skillId || s.name === skillId);
    const skillName = targetSkill ? targetSkill.name.toLowerCase().trim() : skillId.toLowerCase().trim();

    const updatedSkills = skills.filter(
      (s) => s.id !== skillId && s.name !== skillId && s.name.toLowerCase().trim() !== skillName
    );

    const updatedResumes = savedResumes.map((r) => {
      const snap = r.contentSnapshot;
      if (!snap || !Array.isArray(snap.skills)) return r;
      return {
        ...r,
        contentSnapshot: {
          ...snap,
          skills: snap.skills.filter((s: any) => {
            const sName = typeof s === "string" ? s : s.name;
            const sId = typeof s === "object" ? s.id : undefined;
            return sId !== skillId && sName?.toLowerCase().trim() !== skillName;
          }),
        },
      };
    });

    saveProfile({
      ...profile,
      skills: updatedSkills,
      resumes: updatedResumes,
    });
  };

  const toggleVerified = (skillId: string) => {
    saveProfile({
      ...profile,
      skills: skills.map((s) =>
        s.id === skillId ? { ...s, verified: !s.verified } : s
      ),
    });
  };

  const addCategory = (nameToAdd?: string) => {
    const catName = (nameToAdd || newCategoryName).trim();
    if (!catName) return;
    if (!customCategories.includes(catName)) {
      setCustomCategories((prev) => [...prev, catName]);
    }
    setNewCategoryName("");
    setShowAddCategory(false);
  };

  const deleteCategory = (catName: string) => {
    setCustomCategories((prev) => prev.filter((c) => c !== catName));
    saveProfile({
      ...profile,
      skills: skills.filter((s) => s.category !== catName),
    });
  };

  const totalSkills = skills.length;
  const verifiedSkills = skills.filter((s) => s.verified).length;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Keahlian & Keterampilan</h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
            Kelola keahlian Anda untuk pencocokan otomatis dengan kualifikasi pekerjaan.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs bg-orange-100 dark:bg-orange-950/80 text-orange-900 dark:text-orange-300 px-3 py-1 rounded-full font-semibold">
            15% profil
          </span>
          <button
            onClick={() => setShowAddCategory(true)}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" /> Tambah Kategori
          </button>
        </div>
      </div>

      {/* Resume Integration Filter Bar */}
      {savedResumes.length > 0 && (
        <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-slate-200 dark:border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs shadow-xs">
          <div className="flex items-center gap-2 text-slate-900 dark:text-zinc-100 font-semibold">
            <Layers className="w-4 h-4 text-orange-600 dark:text-orange-400" />
            <span>Integrasi CV Target ({savedResumes.length} Resume):</span>
            <span className="text-slate-500 dark:text-zinc-400 font-normal hidden md:inline">
              Filter keahlian yang terhubung ke versi CV tertentu
            </span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-3.5 h-3.5 text-slate-500 dark:text-zinc-400" />
            <select
              value={selectedResumeFilter}
              onChange={(e) => setSelectedResumeFilter(e.target.value)}
              className="w-full sm:w-auto px-3 py-1.5 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 text-xs font-semibold focus:outline-none focus:border-orange-500 dark:focus:border-orange-500"
            >
              <option value="all">Semua Keahlian (Master Profile)</option>
              {savedResumes.map((r) => (
                <option key={r.id} value={r.id}>
                  📄 {r.title} ({r.role})
                </option>
              ))}
              <option value="unlinked">⚠️ Belum Terhubung ke CV Manapun</option>
            </select>
          </div>
        </div>
      )}

      {/* Stats Bar */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Skills", value: totalSkills },
          { label: "Verified", value: verifiedSkills },
          { label: "Categories", value: categories.length },
        ].map(({ label, value }) => (
          <div
            key={label}
            className="bg-white dark:bg-[#1b2220] rounded-xl border border-[#e1e3e2] dark:border-[#242c2a] px-5 py-4 text-center"
          >
            <p className="text-2xl font-bold text-[#191c1c] dark:text-zinc-100">{value}</p>
            <p className="text-xs text-[#727976] dark:text-zinc-400 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Add Category Form */}
      {showAddCategory && (
        <div className="bg-white dark:bg-zinc-900 border-2 border-orange-500 dark:border-orange-500 rounded-xl p-5 flex items-center gap-3">
          <input
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") addCategory();
            }}
            placeholder="Category name (e.g. Machine Learning, Cloud, Design)"
            className="flex-1 border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
            autoFocus
          />
          <button
            onClick={() => addCategory()}
            className="inline-flex items-center gap-1.5 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-xs"
          >
            <Check className="w-4 h-4 text-orange-100" /> Add
          </button>
          <button
            onClick={() => setShowAddCategory(false)}
            className="p-2 rounded-lg hover:bg-[#f2f4f3] dark:hover:bg-[#242c2a] text-[#727976] dark:text-zinc-400"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Skill Categories */}
      <div className="space-y-4">
        {categories.map((cat) => (
          <div
            key={cat.name}
            className="bg-white dark:bg-[#1b2220] rounded-xl border border-[#e1e3e2] dark:border-[#242c2a] overflow-hidden"
          >
            {/* Category Header */}
            <div className="flex items-center justify-between px-6 py-3 bg-[#f8faf9] dark:bg-[#121816] border-b border-[#e1e3e2] dark:border-[#242c2a]">
              <div className="flex items-center gap-2">
                <GripVertical className="w-4 h-4 text-[#c4c7c6] dark:text-zinc-500" />
                <h2 className="text-sm font-bold text-[#191c1c] dark:text-zinc-100 uppercase tracking-wider">
                  {cat.name}
                </h2>
                <span className="text-xs text-[#727976] dark:text-zinc-400">
                  ({cat.skills.length})
                </span>
              </div>
              <button
                onClick={() => deleteCategory(cat.name)}
                className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 text-[#c4c7c6] dark:text-zinc-500 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                title="Delete Category"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Skills Grid */}
            <div className="px-6 py-4 space-y-3">
              <div className="flex flex-wrap gap-2">
                {cat.skills.map((skill) => {
                  const level = numProficiency[skill.proficiency] || "Intermediate";
                  const linkedResumes = getLinkedResumes(skill);
                  return (
                    <div
                      key={skill.id}
                      className="group relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950/60 text-sm font-medium text-slate-900 dark:text-zinc-100 hover:border-orange-500/50 dark:hover:border-orange-500/50 transition-colors"
                    >
                      {/* Proficiency dots */}
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4].map((d) => (
                          <div
                            key={d}
                            className={`w-1.5 h-1.5 rounded-full transition-colors ${
                              d <= proficiencyDots[level]
                                ? "bg-orange-500 dark:bg-orange-400"
                                : "bg-zinc-200 dark:bg-zinc-800"
                            }`}
                          />
                        ))}
                      </div>
                      <span>{skill.name}</span>
                      {skill.verified && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-orange-500 dark:text-orange-400" />
                      )}

                      {/* Linked CV indicator badge */}
                      {linkedResumes.length > 0 && (
                        <span
                          className="text-[10px] bg-orange-100 dark:bg-orange-950/80 text-orange-800 dark:text-orange-300 px-2 py-0.5 rounded-full font-semibold"
                          title={`Tercantum di ${linkedResumes.length} CV: ${linkedResumes.map((r) => r.title).join(", ")}`}
                        >
                          {linkedResumes.length} CV
                        </span>
                      )}

                      {/* Target CV Linkage Button */}
                      {savedResumes.length > 0 && (
                        <div className="relative inline-block" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => setOpenLinkageSkillId(openLinkageSkillId === skill.id ? null : skill.id)}
                            className="p-0.5 text-slate-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
                            title="Hubungkan ke Target CV"
                          >
                            <FileText className="w-3.5 h-3.5" />
                          </button>

                          {openLinkageSkillId === skill.id && (
                            <div className="absolute left-0 mt-1 w-60 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl shadow-xl p-3 z-50 space-y-2 text-xs">
                              <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-1.5">
                                <span className="font-bold text-slate-900 dark:text-white">Pilih Target CV</span>
                                <button
                                  type="button"
                                  onClick={() => setOpenLinkageSkillId(null)}
                                  className="text-slate-400 hover:text-slate-900 dark:hover:text-white"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                              <div className="space-y-1 max-h-48 overflow-y-auto">
                                {savedResumes.map((r) => {
                                  const isLinked = getLinkedResumes(skill).some((lr) => lr.id === r.id);
                                  return (
                                    <div
                                      key={r.id}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        toggleResumeLink(skill, r.id);
                                      }}
                                      className="flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-zinc-800 cursor-pointer text-xs transition-colors select-none"
                                    >
                                      <span className="font-medium text-slate-800 dark:text-zinc-200 truncate max-w-[150px]">
                                        📄 {r.title}
                                      </span>
                                      <input
                                        type="checkbox"
                                        checked={isLinked}
                                        onChange={() => {}}
                                        className="rounded text-orange-600 focus:ring-orange-500 cursor-pointer"
                                      />
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Hover / Action buttons */}
                      <button
                        type="button"
                        onClick={() => toggleVerified(skill.id)}
                        className="p-0.5 hover:text-orange-600 dark:hover:text-orange-400 text-slate-400 transition-all"
                        title={
                          skill.verified ? "Mark unverified" : "Mark verified"
                        }
                      >
                        <Check className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeSkill(skill.id || skill.name)}
                        className="p-0.5 hover:text-red-500 dark:hover:text-red-400 text-[#727976] dark:text-zinc-400 transition-all ml-0.5"
                        title="Hapus skill"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Add skill inline */}
              <div className="flex gap-2 mt-3">
                <input
                  value={newSkillInputs[cat.name] ?? ""}
                  onChange={(e) =>
                    setNewSkillInputs((prev) => ({
                      ...prev,
                      [cat.name]: e.target.value,
                    }))
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter") addSkillToCategory(cat.name);
                  }}
                  placeholder="Add a skill…"
                  className="flex-1 border border-dashed border-slate-300 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500 dark:focus:border-orange-500 bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500"
                />
                <select
                  value={newProficiency[cat.name] ?? "Intermediate"}
                  onChange={(e) =>
                    setNewProficiency((prev) => ({
                      ...prev,
                      [cat.name]: e.target.value as ProficiencyLevel,
                    }))
                  }
                  className="border border-slate-200 dark:border-zinc-800 rounded-lg px-2 py-2 text-xs focus:outline-none focus:border-orange-500 dark:focus:border-orange-500 bg-white dark:bg-zinc-950 text-slate-700 dark:text-zinc-200"
                >
                  <option className="bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100">Expert</option>
                  <option className="bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100">Advanced</option>
                  <option className="bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100">Intermediate</option>
                  <option className="bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100">Beginner</option>
                </select>
                <button
                  onClick={() => addSkillToCategory(cat.name)}
                  className="px-3 py-2 bg-slate-100 dark:bg-zinc-800 hover:bg-orange-100 dark:hover:bg-orange-950 text-orange-600 dark:text-orange-400 rounded-lg transition-colors border border-slate-200 dark:border-zinc-800"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {categories.length === 0 && !showAddCategory && (
        <div className="text-center py-16 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-8 space-y-4">
          <Cpu className="w-12 h-12 mx-auto text-orange-400 dark:text-orange-400" />
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100">
              Belum ada keahlian (skills) ditambahkan
            </h3>
            <p className="text-sm text-slate-500 dark:text-zinc-400 max-w-md mx-auto mt-1">
              Tambahkan keahlian Anda berdasarkan kategori seperti Languages, Frameworks, atau Tools untuk optimalisasi ATS.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-2 pt-2">
            {["Languages", "Frameworks & Libraries", "Tools & Infrastructure"].map(
              (suggestedCat) => (
                <button
                  key={suggestedCat}
                  onClick={() => addCategory(suggestedCat)}
                  className="inline-flex items-center gap-1.5 bg-slate-100 dark:bg-zinc-800 hover:bg-orange-100 dark:hover:bg-orange-950 text-orange-600 dark:text-orange-400 border border-slate-200 dark:border-zinc-800 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" /> + {suggestedCat}
                </button>
              )
            )}
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center gap-6 px-2">
        <span className="text-xs text-slate-500 dark:text-zinc-400 font-medium">Proficiency:</span>
        {(["Expert", "Advanced", "Intermediate", "Beginner"] as ProficiencyLevel[]).map(
          (level) => (
            <div key={level} className="flex items-center gap-1.5">
              <div className="flex gap-0.5">
                {[1, 2, 3, 4].map((d) => (
                  <div
                    key={d}
                    className={`w-1.5 h-1.5 rounded-full ${
                      d <= proficiencyDots[level]
                        ? "bg-orange-500 dark:bg-orange-400"
                        : "bg-slate-200 dark:bg-zinc-800"
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs text-slate-500 dark:text-zinc-400">{level}</span>
            </div>
          )
        )}
        <div className="flex items-center gap-1 ml-4">
          <CheckCircle2 className="w-3.5 h-3.5 text-orange-500 dark:text-orange-400" />
          <span className="text-xs text-slate-500 dark:text-zinc-400">Verified</span>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import {
  Globe,
  Plus,
  Trash2,
  Check,
  X,
  Languages as LanguagesIcon,
  Layers,
  Filter,
  FileText,
} from "lucide-react";
import { useUserProfile } from "@/lib/use-user-profile";

const LEVEL_OPTIONS = [
  { value: "Bahasa Asli", label: "Bahasa Asli / Native" },
  { value: "Fasih", label: "Fasih / Fluent" },
  { value: "Mahir", label: "Mahir / Advanced" },
  { value: "Menengah", label: "Menengah / Intermediate" },
  { value: "Rendah", label: "Pemula / Elementary" },
];

export default function LanguagesPage() {
  const { profile, saveProfile, syncFromResumes } = useUserProfile();
  const [showAddForm, setShowAddForm] = useState(false);
  const [form, setForm] = useState({
    name: "",
    level: "Fasih",
  });

  const [selectedResumeFilter, setSelectedResumeFilter] = useState<string>("all");
  const [openLinkageLangId, setOpenLinkageLangId] = useState<string | null>(null);
  const savedResumes = profile.resumes || [];

  useEffect(() => {
    if ((!profile.languages || profile.languages.length === 0) && profile.resumes?.length > 0) {
      syncFromResumes();
    }
  }, [profile.languages?.length, profile.resumes?.length]);

  const languages = profile.languages || [];

  const getLinkedResumes = (lang: any) => {
    return savedResumes.filter((r) => {
      const snap = r.contentSnapshot?.languages;
      if (!Array.isArray(snap)) return false;
      return snap.some(
        (l: any) =>
          l.id === lang.id || (l.name || "").toLowerCase() === (lang.name || "").toLowerCase()
      );
    });
  };

  const toggleResumeLink = (lang: any, resumeId: string) => {
    const targetResume = savedResumes.find((r) => r.id === resumeId);
    if (!targetResume) return;

    const currentSnap = targetResume.contentSnapshot || {};
    const currentLangs = Array.isArray(currentSnap.languages) ? currentSnap.languages : [];

    const exists = currentLangs.some(
      (l: any) =>
        l.id === lang.id || (l.name || "").toLowerCase() === (lang.name || "").toLowerCase()
    );

    let newLangs = [];
    if (exists) {
      newLangs = currentLangs.filter(
        (l: any) =>
          !(l.id === lang.id || (l.name || "").toLowerCase() === (lang.name || "").toLowerCase())
      );
    } else {
      newLangs = [
        ...currentLangs,
        {
          id: lang.id,
          name: lang.name,
          level: lang.level,
        },
      ];
    }

    const updatedResume = {
      ...targetResume,
      contentSnapshot: {
        ...currentSnap,
        languages: newLangs,
      },
    };

    const newResumesList = savedResumes.map((r) => (r.id === resumeId ? updatedResume : r));
    saveProfile({
      ...profile,
      resumes: newResumesList,
    });
  };

  const filteredLanguages = languages.filter((lang) => {
    if (selectedResumeFilter === "all") return true;
    if (selectedResumeFilter === "unlinked") return getLinkedResumes(lang).length === 0;
    const linked = getLinkedResumes(lang);
    return linked.some((r) => r.id === selectedResumeFilter);
  });

  const save = () => {
    if (!form.name.trim()) return;
    const lowerName = form.name.trim().toLowerCase();
    const existingIndex = languages.findIndex((l) => (l.name || "").trim().toLowerCase() === lowerName);

    let updatedLangs = [];
    if (existingIndex >= 0) {
      updatedLangs = languages.map((l, i) => (i === existingIndex ? { ...l, level: form.level } : l));
    } else {
      updatedLangs = [...languages, { id: `lang_${Date.now()}`, name: form.name.trim(), level: form.level }];
    }

    saveProfile({ ...profile, languages: updatedLangs });
    setShowAddForm(false);
    setForm({ name: "", level: "Fasih" });
  };

  const deleteLang = (id: string) => {
    const targetLang = languages.find((l) => l.id === id);
    const langName = targetLang?.name?.toLowerCase();
    const updatedResumes = savedResumes.map((r) => {
      const snap = r.contentSnapshot;
      if (!snap || !Array.isArray(snap.languages)) return r;
      return {
        ...r,
        contentSnapshot: {
          ...snap,
          languages: snap.languages.filter(
            (l: any) => l.id !== id && (langName ? (l.name || "").toLowerCase() !== langName : true)
          ),
        },
      };
    });
    saveProfile({
      ...profile,
      languages: languages.filter((l) => l.id !== id),
      resumes: updatedResumes,
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Languages</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Language proficiencies and fluency levels in your Career Profile.
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4" /> Add Language
        </button>
      </div>

      {/* Resume Integration Filter Bar */}
      {savedResumes.length > 0 && (
        <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs shadow-xs">
          <div className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100 font-semibold">
            <Layers className="w-4 h-4 text-orange-600 dark:text-orange-400" />
            <span>Integrasi CV Target ({savedResumes.length} Resume):</span>
            <span className="text-zinc-500 dark:text-zinc-400 font-normal hidden md:inline">
              Filter penguasaan bahasa yang terhubung ke versi CV tertentu
            </span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-3.5 h-3.5 text-zinc-500" />
            <select
              value={selectedResumeFilter}
              onChange={(e) => setSelectedResumeFilter(e.target.value)}
              className="w-full sm:w-auto px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-xs font-semibold focus:outline-none focus:border-orange-500"
            >
              <option value="all">Semua Bahasa (Master Profile)</option>
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

      {/* Add Form */}
      {showAddForm && (
        <div className="bg-white dark:bg-zinc-900 border-2 border-orange-500 dark:border-orange-600 rounded-xl p-6 space-y-4 shadow-sm">
          <h2 className="text-base font-bold text-zinc-900 dark:text-white">
            Add Language Proficiency
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-900 dark:text-zinc-100">
                Language Name *
              </label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Bahasa Indonesia, English, Japanese"
                className="w-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-900 dark:text-zinc-100">
                Proficiency Level *
              </label>
              <select
                value={form.level}
                onChange={(e) => setForm({ ...form, level: e.target.value })}
                className="w-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
              >
                {LEVEL_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button
              onClick={save}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              <Check className="w-4 h-4" /> Save
            </button>
            <button
              onClick={() => setShowAddForm(false)}
              className="inline-flex items-center gap-2 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 px-4 py-2 rounded-lg text-sm font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <X className="w-4 h-4" /> Cancel
            </button>
          </div>
        </div>
      )}

      {/* Language Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredLanguages.map((lang) => (
          <div
            key={lang.id}
            className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 px-5 py-4 space-y-3 hover:shadow-sm transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 flex items-center justify-center shrink-0">
                  <Globe className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                    {lang.name}
                  </h3>
                  <span className="inline-block mt-0.5 text-xs font-semibold px-2 py-0.5 rounded-md bg-orange-100/60 text-orange-900 dark:bg-orange-950/60 dark:text-orange-300">
                    {lang.level}
                  </span>
                </div>
              </div>
              <button
                onClick={() => deleteLang(lang.id)}
                className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 text-zinc-400 hover:text-red-600 transition-colors"
                title="Delete language"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {/* Resume Linkage Badges & Manager */}
            <div className="flex items-center gap-1.5 flex-wrap pt-2 border-t border-zinc-100 dark:border-zinc-800">
              <span className="text-[10px] font-mono text-zinc-500 dark:text-zinc-400 uppercase font-bold">Tercantum di CV:</span>
              {getLinkedResumes(lang).length === 0 ? (
                <span className="text-[10px] italic text-zinc-400">Belum dihubungkan ke CV manapun</span>
              ) : (
                getLinkedResumes(lang).map((r) => (
                  <span
                    key={r.id}
                    className="text-[10px] bg-orange-50 dark:bg-zinc-800 text-orange-900 dark:text-orange-300 border border-orange-200 dark:border-orange-800 px-2 py-0.5 rounded-full font-mono font-semibold flex items-center gap-1"
                  >
                    <FileText className="w-3 h-3 text-orange-600 dark:text-orange-400" /> {r.title}
                  </span>
                ))
              )}

              {savedResumes.length > 0 && (
                <div className="relative inline-block ml-1" onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    onClick={() => setOpenLinkageLangId(openLinkageLangId === lang.id ? null : lang.id)}
                    className="text-[10px] bg-orange-100 text-orange-900 hover:bg-orange-200 px-2 py-0.5 rounded-full font-semibold flex items-center gap-1 transition-colors shadow-2xs"
                  >
                    <Plus className="w-2.5 h-2.5" /> Hubungkan ke CV Target
                  </button>

                  {openLinkageLangId === lang.id && (
                    <div className="absolute left-0 mt-1 w-64 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl p-3 z-50 space-y-2 text-xs">
                      <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-1.5">
                        <span className="font-bold text-zinc-900 dark:text-white">Pilih Target CV</span>
                        <button
                          type="button"
                          onClick={() => setOpenLinkageLangId(null)}
                          className="text-zinc-400 hover:text-zinc-700"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="space-y-1 max-h-48 overflow-y-auto">
                        {savedResumes.map((r) => {
                          const isLinked = getLinkedResumes(lang).some((lr) => lr.id === r.id);
                          return (
                            <div
                              key={r.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleResumeLink(lang, r.id);
                              }}
                              className="flex items-center justify-between p-1.5 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 cursor-pointer text-xs transition-colors"
                            >
                              <span className="font-medium text-zinc-900 dark:text-zinc-100 truncate max-w-[170px]">
                                📄 {r.title}
                              </span>
                              <input
                                type="checkbox"
                                checked={isLinked}
                                onChange={() => {}}
                                className="rounded text-orange-600 focus:ring-orange-500 accent-orange-600"
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {languages.length === 0 && !showAddForm && (
        <div className="text-center py-16 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-8 space-y-3">
          <LanguagesIcon className="w-12 h-12 mx-auto text-orange-400" />
          <h3 className="text-base font-bold text-zinc-900 dark:text-white">
            Belum ada penguasaan bahasa
          </h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
            Tambahkan penguasaan bahasa dan tingkat kemahiran Anda untuk memeperkuat profil karir.
          </p>
          <button
            onClick={() => setShowAddForm(true)}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-600 to-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-orange-500 hover:to-red-500 transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Language
          </button>
        </div>
      )}
    </div>
  );
}

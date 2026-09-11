"use client";

import { useState } from "react";
import {
  Trophy,
  Plus,
  Trash2,
  Check,
  X,
  Star,
  TrendingUp,
  Users,
  Lightbulb,
  Globe,
  Layers,
  Filter,
  FileText,
} from "lucide-react";
import { useUserProfile, ProfileAchievement } from "@/lib/use-user-profile";

type AchievementType =
  | "award"
  | "recognition"
  | "milestone"
  | "competition"
  | "publication"
  | "other";

const typeConfig: Record<
  AchievementType,
  { label: string; color: string; icon: any }
> = {
  award: {
    label: "Award",
    color: "text-amber-700 bg-amber-50 border-amber-200",
    icon: Trophy,
  },
  recognition: {
    label: "Recognition",
    color: "text-purple-700 bg-purple-50 border-purple-200",
    icon: Star,
  },
  milestone: {
    label: "Milestone",
    color: "text-blue-700 bg-blue-50 border-blue-200",
    icon: TrendingUp,
  },
  competition: {
    label: "Competition",
    color: "text-orange-800 bg-orange-50 border-orange-200",
    icon: Users,
  },
  publication: {
    label: "Publication",
    color: "text-indigo-700 bg-indigo-50 border-indigo-200",
    icon: Globe,
  },
  other: {
    label: "Other",
    color: "text-gray-700 bg-gray-50 border-gray-200",
    icon: Lightbulb,
  },
};

export default function AchievementsPage() {
  const { profile, saveProfile } = useUserProfile();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    date: "",
    issuer: "",
    type: "award" as AchievementType,
    impact: "",
  });

  const [selectedResumeFilter, setSelectedResumeFilter] = useState<string>("all");
  const [openLinkageAchId, setOpenLinkageAchId] = useState<string | null>(null);
  const savedResumes = profile.resumes || [];

  const achievements = profile.achievements || [];

  const getLinkedResumes = (ach: ProfileAchievement) => {
    return savedResumes.filter((r) => {
      const snap = r.contentSnapshot?.achievements;
      if (!Array.isArray(snap)) return false;
      return snap.some(
        (a: any) =>
          a.id === ach.id || (a.title || "").toLowerCase() === (ach.title || "").toLowerCase()
      );
    });
  };

  const toggleResumeLink = (ach: ProfileAchievement, resumeId: string) => {
    const targetResume = savedResumes.find((r) => r.id === resumeId);
    if (!targetResume) return;

    const currentSnap = targetResume.contentSnapshot || {};
    const currentAchs = Array.isArray(currentSnap.achievements) ? currentSnap.achievements : [];

    const exists = currentAchs.some(
      (a: any) =>
        a.id === ach.id || (a.title || "").toLowerCase() === (ach.title || "").toLowerCase()
    );

    let newAchs = [];
    if (exists) {
      newAchs = currentAchs.filter(
        (a: any) =>
          !(a.id === ach.id || (a.title || "").toLowerCase() === (ach.title || "").toLowerCase())
      );
    } else {
      newAchs = [
        ...currentAchs,
        {
          id: ach.id,
          title: ach.title,
          issuer: ach.issuer,
          date: ach.date,
          impact: ach.impact || ach.metric,
          description: ach.description,
        },
      ];
    }

    const updatedResume = {
      ...targetResume,
      contentSnapshot: {
        ...currentSnap,
        achievements: newAchs,
      },
    };

    const newResumesList = savedResumes.map((r) => (r.id === resumeId ? updatedResume : r));
    saveProfile({
      ...profile,
      resumes: newResumesList,
    });
  };

  const filteredAchievements = achievements.filter((ach) => {
    if (selectedResumeFilter === "all") return true;
    if (selectedResumeFilter === "unlinked") return getLinkedResumes(ach).length === 0;
    const linked = getLinkedResumes(ach);
    return linked.some((r) => r.id === selectedResumeFilter);
  });

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const save = () => {
    if (!form.title) return;
    const newAch: ProfileAchievement = {
      id: `ach_${Date.now()}`,
      title: form.title,
      description: form.description,
      date: form.date,
      issuer: form.issuer,
      type: form.type,
      impact: form.impact,
      metric: form.impact,
    };

    saveProfile({
      ...profile,
      achievements: [newAch, ...achievements],
    });
    setShowForm(false);
    setForm({
      title: "",
      description: "",
      date: "",
      issuer: "",
      type: "award",
      impact: "",
    });
  };

  const del = (id: string) => {
    const targetAch = achievements.find((a) => a.id === id);
    const title = targetAch?.title?.toLowerCase();
    const updatedResumes = savedResumes.map((r) => {
      const snap = r.contentSnapshot;
      if (!snap || !Array.isArray(snap.achievements)) return r;
      return {
        ...r,
        contentSnapshot: {
          ...snap,
          achievements: snap.achievements.filter(
            (a: any) => a.id !== id && (title ? (a.title || "").toLowerCase() !== title : true)
          ),
        },
      };
    });
    saveProfile({
      ...profile,
      achievements: achievements.filter((a) => a.id !== id),
      resumes: updatedResumes,
    });
  };

  const fmtDate = (d: string) => {
    if (!d) return "";
    const [y, m] = d.split("-");
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    return `${months[parseInt(m) - 1]} ${y}`;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#191c1c] dark:text-zinc-100">Achievements</h1>
          <p className="text-sm text-[#727976] dark:text-zinc-400 mt-1">
            Awards, recognitions, and milestones that demonstrate your impact.
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4" /> Add Achievement
        </button>
      </div>

      {/* Resume Integration Filter Bar */}
      {savedResumes.length > 0 && (
        <div className="bg-white dark:bg-[#1b2220] p-4 rounded-xl border border-[#e1e3e2] dark:border-[#242c2a] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs shadow-xs">
          <div className="flex items-center gap-2 text-[#191c1c] dark:text-zinc-200 font-semibold">
            <Layers className="w-4 h-4 text-orange-600 dark:text-orange-400" />
            <span>Integrasi CV Target ({savedResumes.length} Resume):</span>
            <span className="text-[#727976] dark:text-zinc-400 font-normal hidden md:inline">
              Filter pencapaian yang terhubung ke versi CV tertentu
            </span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-3.5 h-3.5 text-[#727976] dark:text-zinc-400" />
            <select
              value={selectedResumeFilter}
              onChange={(e) => setSelectedResumeFilter(e.target.value)}
              className="w-full sm:w-auto px-3 py-1.5 rounded-lg border border-[#e1e3e2] dark:border-[#242c2a] bg-[#f8faf9] dark:bg-[#121816] text-[#191c1c] dark:text-zinc-200 text-xs font-semibold focus:outline-none focus:border-orange-500 dark:focus:border-orange-500"
            >
              <option value="all">Semua Prestasi (Master Profile)</option>
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

      {showForm && (
        <div className="bg-white dark:bg-[#1b2220] border-2 border-orange-500 dark:border-orange-500 rounded-xl p-6 space-y-4 shadow-sm">
          <h2 className="text-base font-bold text-[#191c1c] dark:text-zinc-100">
            Add Achievement
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-1">
              <label className="text-xs font-medium text-[#191c1c] dark:text-zinc-300">
                Title *
              </label>
              <input
                value={form.title}
                onChange={(e) => set("title", e.target.value)}
                placeholder="e.g. ACM ICPC Regional Finalist"
                className="w-full border border-[#e1e3e2] dark:border-[#242c2a] bg-white dark:bg-[#121816] text-[#191c1c] dark:text-zinc-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 dark:focus:ring-orange-500/20 focus:border-orange-500 dark:focus:border-orange-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-[#191c1c] dark:text-zinc-300">
                Issuer / Organization
              </label>
              <input
                value={form.issuer}
                onChange={(e) => set("issuer", e.target.value)}
                placeholder="e.g. ACM Foundation"
                className="w-full border border-[#e1e3e2] dark:border-[#242c2a] bg-white dark:bg-[#121816] text-[#191c1c] dark:text-zinc-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 dark:focus:ring-orange-500/20 focus:border-orange-500 dark:focus:border-orange-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-[#191c1c] dark:text-zinc-300">
                Date
              </label>
              <input
                type="month"
                value={form.date}
                onChange={(e) => set("date", e.target.value)}
                className="w-full border border-[#e1e3e2] dark:border-[#242c2a] bg-white dark:bg-[#121816] text-[#191c1c] dark:text-zinc-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 dark:focus:ring-orange-500/20 focus:border-orange-500 dark:focus:border-orange-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-[#191c1c] dark:text-zinc-300">
                Type
              </label>
              <select
                value={form.type}
                onChange={(e) => set("type", e.target.value)}
                className="w-full border border-[#e1e3e2] dark:border-[#242c2a] bg-white dark:bg-[#121816] text-[#191c1c] dark:text-zinc-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 dark:focus:ring-orange-500/20 focus:border-orange-500 dark:focus:border-orange-500"
              >
                {Object.entries(typeConfig).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-[#191c1c] dark:text-zinc-300">
                Impact / Metric
              </label>
              <input
                value={form.impact}
                onChange={(e) => set("impact", e.target.value)}
                placeholder="e.g. Top 5% of 400+ teams"
                className="w-full border border-[#e1e3e2] dark:border-[#242c2a] bg-white dark:bg-[#121816] text-[#191c1c] dark:text-zinc-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 dark:focus:ring-orange-500/20 focus:border-orange-500 dark:focus:border-orange-500"
              />
            </div>
            <div className="col-span-2 space-y-1">
              <label className="text-xs font-medium text-[#191c1c] dark:text-zinc-300">
                Description
              </label>
              <textarea
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                rows={3}
                placeholder="Describe the context and your contribution…"
                className="w-full border border-[#e1e3e2] dark:border-[#242c2a] bg-white dark:bg-[#121816] text-[#191c1c] dark:text-zinc-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 dark:focus:ring-orange-500/20 focus:border-orange-500 dark:focus:border-orange-500 resize-none"
              />
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
              onClick={() => setShowForm(false)}
              className="inline-flex items-center gap-2 border border-[#e1e3e2] dark:border-[#242c2a] text-[#727976] dark:text-zinc-300 px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#f2f4f3] dark:hover:bg-[#242c2a] transition-colors"
            >
              <X className="w-4 h-4" /> Cancel
            </button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {filteredAchievements.map((ach) => {
          const achType = (ach.type as AchievementType) || "award";
          const config = typeConfig[achType] || typeConfig.award;
          const Icon = config.icon;
          const color = config.color;
          const label = config.label;

          return (
            <div
              key={ach.id}
              className="bg-white dark:bg-[#1b2220] rounded-xl border border-[#e1e3e2] dark:border-[#242c2a] px-6 py-4 hover:shadow-sm transition-shadow group"
            >
              <div className="flex items-start gap-4">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 dark:bg-[#121816] ${color
                    .split(" ")
                    .slice(1)
                    .join(" ")}`}
                >
                  <Icon className={`w-5 h-5 ${color.split(" ")[0]}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="text-base font-bold text-[#191c1c] dark:text-zinc-100">
                        {ach.title}
                      </h2>
                      <div className="flex items-center gap-2 mt-0.5 text-xs text-[#727976] dark:text-zinc-400">
                        {ach.issuer && (
                          <span className="font-medium text-[#3d3e3e] dark:text-zinc-300">
                            {ach.issuer}
                          </span>
                        )}
                        {ach.date && (
                          <>
                            <span>·</span>
                            <span>{fmtDate(ach.date)}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${color}`}
                      >
                        {label}
                      </span>
                      <button
                        onClick={() => del(ach.id)}
                        className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-50 dark:hover:bg-red-950/40 text-[#727976] dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-400 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  {ach.description && (
                    <p className="text-sm text-[#3d3e3e] dark:text-zinc-300 mt-2 leading-relaxed">
                      {ach.description}
                    </p>
                  )}
                  {(ach.impact || ach.metric) && (
                    <div className="mt-2 inline-flex items-center gap-1.5 bg-[#f2f4f3] dark:bg-[#121816] text-[#3d3e3e] dark:text-zinc-300 text-xs px-2.5 py-1 rounded-lg border border-[#e1e3e2] dark:border-[#242c2a]">
                      <TrendingUp className="w-3 h-3 text-orange-600 dark:text-orange-400" />
                      {ach.impact || ach.metric}
                    </div>
                  )}

                  {/* Resume Linkage Badges & Manager */}
                  <div className="flex items-center gap-1.5 flex-wrap pt-2 mt-2 border-t border-[#edeeee] dark:border-[#242c2a]">
                    <span className="text-[10px] font-mono text-[#727976] dark:text-zinc-400 uppercase font-bold">Tercantum di CV:</span>
                    {getLinkedResumes(ach).length === 0 ? (
                      <span className="text-[10px] italic text-[#727976] dark:text-zinc-500">Belum dihubungkan ke CV manapun</span>
                    ) : (
                      getLinkedResumes(ach).map((r) => (
                        <span
                          key={r.id}
                          className="text-[10px] bg-[#eef3f8] dark:bg-[#1a2b3c] text-orange-600 dark:text-[#93c5fd] border border-[#cde1ff] dark:border-[#1e3a8a] px-2 py-0.5 rounded-full font-mono font-semibold flex items-center gap-1"
                        >
                          <FileText className="w-3 h-3 text-orange-600 dark:text-[#60a5fa]" /> {r.title}
                        </span>
                      ))
                    )}

                    {savedResumes.length > 0 && (
                      <div className="relative inline-block ml-1" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => setOpenLinkageAchId(openLinkageAchId === ach.id ? null : ach.id)}
                          className="text-[10px] bg-orange-100 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300 hover:bg-orange-200 dark:hover:bg-orange-900/80 px-2 py-0.5 rounded-full font-semibold flex items-center gap-1 transition-colors shadow-2xs border border-transparent dark:border-orange-800"
                        >
                          <Plus className="w-2.5 h-2.5" /> Hubungkan ke CV Target
                        </button>

                        {openLinkageAchId === ach.id && (
                          <div className="absolute left-0 mt-1 w-64 bg-white dark:bg-[#1b2220] border border-[#e1e3e2] dark:border-[#242c2a] rounded-xl shadow-xl p-3 z-50 space-y-2 text-xs">
                            <div className="flex items-center justify-between border-b border-[#edeeee] dark:border-[#242c2a] pb-1.5">
                              <span className="font-bold text-[#191c1c] dark:text-zinc-100">Pilih Target CV</span>
                              <button
                                type="button"
                                onClick={() => setOpenLinkageAchId(null)}
                                className="text-[#727976] dark:text-zinc-400 hover:text-[#191c1c] dark:hover:text-zinc-100"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            <div className="space-y-1 max-h-48 overflow-y-auto">
                              {savedResumes.map((r) => {
                                const isLinked = getLinkedResumes(ach).some((lr) => lr.id === r.id);
                                return (
                                  <div
                                    key={r.id}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleResumeLink(ach, r.id);
                                    }}
                                    className="flex items-center justify-between p-1.5 rounded-lg hover:bg-[#f8faf9] dark:hover:bg-[#242c2a] cursor-pointer text-xs transition-colors"
                                  >
                                    <span className="font-medium text-[#191c1c] dark:text-zinc-200 truncate max-w-[170px]">
                                      📄 {r.title}
                                    </span>
                                    <input
                                      type="checkbox"
                                      checked={isLinked}
                                      onChange={() => {}}
                                      className="rounded text-orange-600 focus:ring-orange-500"
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
              </div>
            </div>
          );
        })}
      </div>

      {achievements.length === 0 && !showForm && (
        <div className="text-center py-16 bg-white dark:bg-[#1b2220] border border-[#e1e3e2] dark:border-[#242c2a] rounded-xl p-8 space-y-3">
          <Trophy className="w-12 h-12 mx-auto text-orange-300 dark:text-orange-900" />
          <h3 className="text-base font-bold text-[#191c1c] dark:text-zinc-100">
            Belum ada pencapaian
          </h3>
          <p className="text-sm text-[#727976] dark:text-zinc-400 max-w-sm mx-auto">
            Tunjukkan penghargaan dan pencapaian terbaik yang pernah Anda dapatkan.
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Achievement
          </button>
        </div>
      )}
    </div>
  );
}

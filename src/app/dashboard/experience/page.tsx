"use client";

import { useState, useEffect } from "react";
import {
  Briefcase,
  Plus,
  ShieldCheck,
  Pencil,
  Trash2,
  ChevronDown,
  ChevronUp,
  MapPin,
  Calendar,
  Check,
  X,
  AlertCircle,
  FileText,
  Filter,
  Layers,
  Sparkles,
} from "lucide-react";
import { useUserProfile } from "@/lib/use-user-profile";
import { useAuth } from "@/lib/auth-context";
import { MonthYearPicker } from "@/components/ui/month-year-picker";

interface Bullet {
  id: string;
  text: string;
  confidence: number;
}

interface Experience {
  id: string;
  role: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  bullets: Bullet[];
  expanded: boolean;
}

const DEMO_EXPERIENCES: Experience[] = [
  {
    id: "exp_1",
    role: "Lead Frontend Systems Engineer",
    company: "Tokopedia",
    location: "Jakarta, Indonesia",
    startDate: "2021-03",
    endDate: "",
    current: true,
    expanded: true,
    bullets: [
      { id: "b1", text: "Architected enterprise-scale microfrontend architecture using Next.js 14 and Tailwind CSS, reducing bundle sizes by 38%.", confidence: 97 },
      { id: "b2", text: "Engineered real-time collaboration state engine with WebSocket sync, handling 45,000 concurrent active document events.", confidence: 95 },
      { id: "b3", text: "Implemented deterministic visual regression test suite achieving 94% test coverage and reducing production defects.", confidence: 92 },
    ],
  },
  {
    id: "exp_2",
    role: "Fullstack Engineer",
    company: "CloudScale Inc",
    location: "Remote",
    startDate: "2019-06",
    endDate: "2021-02",
    current: false,
    expanded: false,
    bullets: [
      { id: "b4", text: "Engineered high-throughput financial payment transaction processing endpoints with strict idempotency guarantees.", confidence: 98 },
      { id: "b5", text: "Optimized complex PostgreSQL query execution plans, reducing median p95 query latency from 840ms to 92ms.", confidence: 96 },
    ],
  },
];

function confidenceBadge(score: number) {
  if (score >= 90) return { label: "High confidence", color: "text-orange-700 bg-orange-50 border-orange-200 dark:text-orange-300 dark:bg-orange-950/50 dark:border-orange-800" };
  if (score >= 75) return { label: "Medium confidence", color: "text-amber-700 bg-amber-50 border-amber-200" };
  return { label: "Needs review", color: "text-red-700 bg-red-50 border-red-200" };
}

export default function ExperiencePage() {
  const { profile: userStoreProfile, saveProfile, isDemoUser } = useUserProfile();
  const { user } = useAuth();

  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newRole, setNewRole] = useState("");
  const [newCompany, setNewCompany] = useState("");
  const [newLocation, setNewLocation] = useState("");
  const [newStart, setNewStart] = useState("");
  const [newEnd, setNewEnd] = useState("");
  const [newCurrent, setNewCurrent] = useState(false);

  useEffect(() => {
    if (userStoreProfile.experiences && userStoreProfile.experiences.length > 0) {
      const seen = new Set<string>();
      const uniqueExps: any[] = [];
      userStoreProfile.experiences.forEach((exp: any) => {
        const key = exp.id || `${exp.company || ""}_${exp.role || ""}`.toLowerCase().trim();
        if (key && !seen.has(key)) {
          seen.add(key);
          uniqueExps.push(exp);
        }
      });

      const mapped = uniqueExps.map((exp: any, idx: number) => ({
        id: exp.id || `exp_${idx}`,
        role: exp.role || "Software Engineer",
        company: exp.company || "Company",
        location: exp.location || "Location",
        startDate: exp.startDate || "2022",
        endDate: exp.endDate || "Present",
        current: exp.isCurrent ?? false,
        expanded: idx === 0,
        bullets: (exp.bullets || []).map((b: string, bIdx: number) => ({
          id: `b_${idx}_${bIdx}`,
          text: b,
          confidence: 95,
        })),
      }));
      setExperiences(mapped);
    } else if (isDemoUser) {
      setExperiences(DEMO_EXPERIENCES);
    } else {
      setExperiences([]);
    }
  }, [userStoreProfile, isDemoUser]);

  const syncToProfile = (updated: Experience[]) => {
    setExperiences(updated);
    saveProfile({
      ...userStoreProfile,
      experiences: updated.map((e) => ({
        id: e.id,
        role: e.role,
        company: e.company,
        location: e.location,
        startDate: e.startDate,
        endDate: e.endDate,
        isCurrent: e.current,
        bullets: e.bullets.map((b) => b.text),
      })),
    });
  };

  const toggleExpand = (id: string) => {
    setExperiences(
      experiences.map((exp) => (exp.id === id ? { ...exp, expanded: !exp.expanded } : exp))
    );
  };

  const handleDeleteExperience = (id: string) => {
    const targetExp = experiences.find((e) => e.id === id);
    const companyName = targetExp ? targetExp.company.toLowerCase().trim() : "";
    const roleName = targetExp ? targetExp.role.toLowerCase().trim() : "";
    const updated = experiences.filter((exp) => exp.id !== id);

    const updatedResumes = savedResumes.map((r) => {
      const snap = r.contentSnapshot;
      if (!snap || !Array.isArray(snap.experiences)) return r;
      return {
        ...r,
        contentSnapshot: {
          ...snap,
          experiences: snap.experiences.filter(
            (e: any) => e.id !== id && !((e.company || "").toLowerCase().trim() === companyName && (e.role || "").toLowerCase().trim() === roleName)
          ),
        },
      };
    });

    setExperiences(updated);
    saveProfile({
      ...userStoreProfile,
      experiences: updated.map((e) => ({
        id: e.id,
        role: e.role,
        company: e.company,
        location: e.location,
        startDate: e.startDate,
        endDate: e.endDate,
        isCurrent: e.current,
        bullets: e.bullets.map((b) => b.text),
      })),
      resumes: updatedResumes,
    });
  };

  // State for modern inline bullet editor
  const [bulletFormExpId, setBulletFormExpId] = useState<string | null>(null);
  const [editingBulletId, setEditingBulletId] = useState<string | null>(null);
  const [bulletInputValue, setBulletInputValue] = useState("");
  const [isAiRewritingBullet, setIsAiRewritingBullet] = useState(false);

  const startAddBullet = (expId: string) => {
    setBulletFormExpId(expId);
    setEditingBulletId(null);
    setBulletInputValue("");
  };

  const startEditBullet = (expId: string, bulletId: string, currentText: string) => {
    setBulletFormExpId(expId);
    setEditingBulletId(bulletId);
    setBulletInputValue(currentText);
  };

  const saveBulletForm = (expId: string) => {
    if (!bulletInputValue.trim()) return;
    const text = bulletInputValue.trim();

    const updated = experiences.map((exp) => {
      if (exp.id !== expId) return exp;
      if (editingBulletId) {
        return {
          ...exp,
          bullets: exp.bullets.map((b) => (b.id === editingBulletId ? { ...b, text } : b)),
        };
      } else {
        return {
          ...exp,
          bullets: [...exp.bullets, { id: `b_${Date.now()}`, text, confidence: 95 }],
        };
      }
    });

    syncToProfile(updated);
    setBulletFormExpId(null);
    setEditingBulletId(null);
    setBulletInputValue("");
  };

  const handleAiEnhanceBulletInput = async () => {
    if (!bulletInputValue.trim()) return;
    setIsAiRewritingBullet(true);
    try {
      const userId = user?.id || "";
      const provider = (localStorage.getItem(userId ? `cvforge_ai_provider_${userId}` : "cvforge_ai_provider") as any) || "gemini";
      const geminiKey = localStorage.getItem(userId ? `cvforge_gemini_key_${userId}` : "cvforge_gemini_key") || "";
      const openaiKey = localStorage.getItem(userId ? `cvforge_openai_key_${userId}` : "cvforge_openai_key") || "";
      const activeKey = provider === "openai" ? openaiKey : geminiKey;

      const res = await fetch("/api/ai/rewrite", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(activeKey ? { "x-api-key": activeKey, "x-ai-provider": provider } : {}),
        },
        body: JSON.stringify({
          text: bulletInputValue,
          type: "bullet",
          style: "action_oriented",
        }),
      });

      const data = await res.json();
      if (res.ok && data.success && data.data?.enhancedText) {
        setBulletInputValue(data.data.enhancedText);
      }
    } catch (err) {
      console.warn("AI bullet polish error:", err);
    } finally {
      setIsAiRewritingBullet(false);
    }
  };

  const handleDeleteBullet = (expId: string, bulletId: string) => {
    const updated = experiences.map((exp) => {
      if (exp.id !== expId) return exp;
      return {
        ...exp,
        bullets: exp.bullets.filter((b) => b.id !== bulletId),
      };
    });
    syncToProfile(updated);
  };

  const handleEditClick = (exp: Experience, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(exp.id);
    setNewRole(exp.role);
    setNewCompany(exp.company);
    setNewLocation(exp.location);
    setNewStart(exp.startDate);
    setNewEnd(exp.current ? "" : exp.endDate);
    setNewCurrent(exp.current);
    setShowAddForm(true);
  };

  const handleSaveAddForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRole.trim() || !newCompany.trim()) return;

    if (editingId) {
      const updated = experiences.map((exp) => {
        if (exp.id !== editingId) return exp;
        return {
          ...exp,
          role: newRole.trim(),
          company: newCompany.trim(),
          location: newLocation.trim() || "Remote",
          startDate: newStart || "2023-01",
          endDate: newCurrent ? "Present" : newEnd || "2024-01",
          current: newCurrent,
        };
      });
      syncToProfile(updated);
    } else {
      const created: Experience = {
        id: `exp_${Date.now()}`,
        role: newRole.trim(),
        company: newCompany.trim(),
        location: newLocation.trim() || "Remote",
        startDate: newStart || "2023-01",
        endDate: newCurrent ? "Present" : newEnd || "2024-01",
        current: newCurrent,
        expanded: true,
        bullets: [
          { id: `b_${Date.now()}`, text: `Spearheaded key engineering initiatives at ${newCompany.trim()}.`, confidence: 95 },
        ],
      };

      const updated = [created, ...experiences];
      syncToProfile(updated);
    }

    setShowAddForm(false);
    setEditingId(null);
    setNewRole("");
    setNewCompany("");
    setNewLocation("");
    setNewStart("");
    setNewEnd("");
    setNewCurrent(false);
  };

  const [selectedResumeFilter, setSelectedResumeFilter] = useState<string>("all");
  const [openLinkageExpId, setOpenLinkageExpId] = useState<string | null>(null);
  const savedResumes = userStoreProfile.resumes || [];

  const getLinkedResumes = (exp: Experience) => {
    return savedResumes.filter((r) => {
      const snap = r.contentSnapshot?.experiences;
      if (!Array.isArray(snap)) return false;
      return snap.some(
        (e: any) =>
          e.id === exp.id ||
          (e.company || "").toLowerCase().trim() === (exp.company || "").toLowerCase().trim()
      );
    });
  };

  const toggleResumeLink = (exp: Experience, resumeId: string) => {
    const targetResume = savedResumes.find((r) => r.id === resumeId);
    if (!targetResume) return;

    const currentSnap = targetResume.contentSnapshot || {};
    const rawExps = currentSnap.experiences;
    const currentExps = Array.isArray(rawExps) ? rawExps : [];

    const exists = currentExps.some(
      (e: any) =>
        e.id === exp.id ||
        (e.company || "").toLowerCase().trim() === (exp.company || "").toLowerCase().trim()
    );

    let newExps = [];
    if (exists) {
      newExps = currentExps.filter(
        (e: any) =>
          !(
            e.id === exp.id ||
            (e.company || "").toLowerCase().trim() === (exp.company || "").toLowerCase().trim()
          )
      );
    } else {
      newExps = [
        ...currentExps,
        {
          id: exp.id,
          company: exp.company,
          role: exp.role,
          location: exp.location,
          startDate: exp.startDate,
          endDate: exp.endDate,
          bullets: exp.bullets,
        },
      ];
    }

    const updatedResume = {
      ...targetResume,
      contentSnapshot: {
        ...currentSnap,
        experiences: newExps,
      },
    };

    const newResumesList = savedResumes.map((r) => (r.id === resumeId ? updatedResume : r));
    saveProfile({
      ...userStoreProfile,
      resumes: newResumesList,
    });
  };

  const filteredExperiences = experiences.filter((exp) => {
    if (selectedResumeFilter === "all") return true;
    if (selectedResumeFilter === "unlinked") return getLinkedResumes(exp).length === 0;
    const linked = getLinkedResumes(exp);
    return linked.some((r) => r.id === selectedResumeFilter);
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#18181b] p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-orange-600 dark:text-orange-400" /> Work Experience History
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-0.5">
            Verified work history & AI-enhanced impact statements linked to source proof.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddForm(true)}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white px-4 py-2.5 rounded-lg text-xs font-semibold transition-colors shadow-sm shrink-0"
        >
          <Plus className="w-4 h-4" /> Add Experience
        </button>
      </div>

      {/* Resume Integration Filter Bar */}
      {savedResumes.length > 0 && (
        <div className="bg-white dark:bg-[#18181b] p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs shadow-xs">
          <div className="flex items-center gap-2 text-zinc-900 dark:text-zinc-200 font-semibold">
            <Layers className="w-4 h-4 text-orange-600 dark:text-orange-400" />
            <span>Integrasi CV Target ({savedResumes.length} Resume):</span>
            <span className="text-[#727976] dark:text-[#8c9390] font-normal hidden md:inline">
              Filter pengalaman yang terhubung ke versi CV tertentu
            </span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-3.5 h-3.5 text-[#727976] dark:text-zinc-400" />
            <select
              value={selectedResumeFilter}
              onChange={(e) => setSelectedResumeFilter(e.target.value)}
              className="w-full sm:w-auto px-3 py-1.5 rounded-lg border border-[#e1e3e2] dark:border-[#242c2a] bg-[#f8faf9] dark:bg-[#121816] text-[#191c1c] dark:text-zinc-100 text-xs font-semibold focus:outline-none focus:border-orange-500"
            >
              <option value="all">Semua Pengalaman (Master Profile)</option>
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

      {/* Add / Edit Experience Modal Form */}
      {showAddForm && (
        <form onSubmit={handleSaveAddForm} className="bg-white dark:bg-[#1b2220] rounded-xl border border-[#e1e3e2] dark:border-[#242c2a] p-6 shadow-md space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-[#edeeee] dark:border-[#242c2a]">
            <h3 className="text-sm font-bold text-[#191c1c] dark:text-zinc-100">
              {editingId ? "Edit Work Experience Detail" : "Add New Work Experience"}
            </h3>
            <button
              type="button"
              onClick={() => {
                setShowAddForm(false);
                setEditingId(null);
              }}
              className="text-[#727976] dark:text-zinc-400 hover:text-[#191c1c] dark:hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#191c1c] dark:text-zinc-200">Role / Job Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. Senior Frontend Engineer"
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-[#c1c8c5] dark:border-[#242c2a] rounded-lg bg-white dark:bg-[#121816] text-[#191c1c] dark:text-zinc-100 focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#191c1c] dark:text-zinc-200">Company / Organization *</label>
              <input
                type="text"
                required
                placeholder="e.g. Stripe, Tokopedia"
                value={newCompany}
                onChange={(e) => setNewCompany(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-[#c1c8c5] dark:border-[#242c2a] rounded-lg bg-white dark:bg-[#121816] text-[#191c1c] dark:text-zinc-100 focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#191c1c] dark:text-zinc-200">Location / Mode *</label>
              <select
                value={
                  ["Remote", "Hybrid", "On-site", "Jakarta, Indonesia", "Semarang, Indonesia", "Surabaya, Indonesia", "Bandung, Indonesia", "Yogyakarta, Indonesia"].includes(newLocation)
                    ? newLocation
                    : "custom"
                }
                onChange={(e) => {
                  if (e.target.value === "custom") {
                    setNewLocation("");
                  } else {
                    setNewLocation(e.target.value);
                  }
                }}
                className="w-full px-3 py-2 text-xs border border-[#c1c8c5] dark:border-[#242c2a] rounded-lg focus:ring-2 focus:ring-orange-500 bg-white dark:bg-[#121816] text-[#191c1c] dark:text-zinc-100"
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
              {(!["Remote", "Hybrid", "On-site", "Jakarta, Indonesia", "Semarang, Indonesia", "Surabaya, Indonesia", "Bandung, Indonesia", "Yogyakarta, Indonesia"].includes(newLocation)) && (
                <input
                  type="text"
                  autoFocus
                  placeholder="Ketik nama kota/lokasi kustom..."
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-[#c1c8c5] dark:border-[#242c2a] bg-white dark:bg-[#121816] text-[#191c1c] dark:text-zinc-100 rounded-lg focus:ring-2 focus:ring-orange-500 mt-1.5"
                />
              )}
            </div>
            <div className="col-span-1 md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
              <MonthYearPicker
                label="Start Date"
                value={newStart}
                onChange={(val) => setNewStart(val)}
              />
              <MonthYearPicker
                label="End Date"
                value={newEnd}
                onChange={(val) => setNewEnd(val)}
                allowPresent={true}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="curr"
              checked={newCurrent}
              onChange={(e) => setNewCurrent(e.target.checked)}
              className="rounded text-orange-600 focus:ring-orange-500"
            />
            <label htmlFor="curr" className="text-xs text-[#191c1c] dark:text-zinc-200 font-medium cursor-pointer">
              I currently work here
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-[#edeeee] dark:border-[#242c2a]">
            <button
              type="button"
              onClick={() => {
                setShowAddForm(false);
                setEditingId(null);
              }}
              className="px-4 py-2 text-xs font-medium text-[#727976] dark:text-zinc-400 hover:text-[#191c1c] dark:hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white rounded-lg text-xs font-semibold transition-colors shadow-xs"
            >
              {editingId ? "Update Work Experience" : "Save Work Experience"}
            </button>
          </div>
        </form>
      )}

      {/* Experience List */}
      {filteredExperiences.length > 0 ? (
        <div className="space-y-4">
          {filteredExperiences.map((exp) => (
            <div key={exp.id} className="bg-white dark:bg-[#18181b] rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden transition-all">
              <div className="p-5 flex items-center justify-between cursor-pointer hover:bg-orange-50/40 dark:hover:bg-zinc-800/50" onClick={() => toggleExpand(exp.id)}>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">{exp.role}</h3>
                    <span className="text-xs text-orange-900 dark:text-orange-300 bg-orange-100 dark:bg-orange-950/80 px-2 py-0.5 rounded font-semibold">
                      {exp.company}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-3">
                    <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {exp.location}</span>
                    <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {exp.startDate} - {exp.current ? "Present" : exp.endDate}</span>
                  </p>

                  {/* Resume Linkage Badges & Manager */}
                  <div className="flex items-center gap-1.5 flex-wrap pt-1">
                    <span className="text-[10px] text-zinc-500 dark:text-zinc-400 uppercase font-bold">Tercantum di CV:</span>
                    {getLinkedResumes(exp).length === 0 ? (
                      <span className="text-[10px] italic text-zinc-400 dark:text-zinc-500">Belum dihubungkan ke CV manapun</span>
                    ) : (
                      getLinkedResumes(exp).map((r) => (
                        <span
                          key={r.id}
                          className="text-[10px] bg-orange-50 dark:bg-orange-950/60 text-orange-900 dark:text-orange-300 border border-orange-200 dark:border-orange-900/60 px-2 py-0.5 rounded-full font-semibold flex items-center gap-1"
                        >
                          <FileText className="w-3 h-3 text-orange-600 dark:text-orange-400" /> {r.title}
                        </span>
                      ))
                    )}

                    {savedResumes.length > 0 && (
                      <div className="relative inline-block ml-1" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => setOpenLinkageExpId(openLinkageExpId === exp.id ? null : exp.id)}
                          className="text-[10px] bg-orange-100 dark:bg-orange-950/80 text-orange-900 dark:text-orange-300 hover:bg-orange-200 px-2 py-0.5 rounded-full font-semibold flex items-center gap-1 transition-colors shadow-2xs"
                        >
                          <Plus className="w-2.5 h-2.5" /> Hubungkan ke CV Target
                        </button>

                        {openLinkageExpId === exp.id && (
                          <div className="absolute left-0 mt-1 w-64 bg-white dark:bg-[#1b2220] border border-[#e1e3e2] dark:border-[#242c2a] rounded-xl shadow-xl p-3 z-50 space-y-2 text-xs">
                            <div className="flex items-center justify-between border-b border-[#edeeee] dark:border-[#242c2a] pb-1.5">
                              <span className="font-bold text-[#191c1c] dark:text-white">Pilih Target CV</span>
                              <button
                                type="button"
                                onClick={() => setOpenLinkageExpId(null)}
                                className="text-[#727976] dark:text-zinc-400 hover:text-[#191c1c] dark:hover:text-white"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            <div className="space-y-1 max-h-48 overflow-y-auto">
                              {savedResumes.map((r) => {
                                const isLinked = getLinkedResumes(exp).some((lr) => lr.id === r.id);
                                return (
                                  <div
                                    key={r.id}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleResumeLink(exp, r.id);
                                    }}
                                    className="flex items-center justify-between p-1.5 rounded-lg hover:bg-[#f8faf9] dark:hover:bg-[#242c2a] cursor-pointer text-xs transition-colors select-none"
                                  >
                                    <span className="font-medium text-[#191c1c] dark:text-[#e2e8e6] truncate max-w-[170px]">
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
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => handleEditClick(exp, e)}
                    className="p-1.5 rounded hover:bg-orange-100 dark:hover:bg-zinc-800 text-orange-600 dark:text-orange-400 transition-colors"
                    title="Edit Experience Detail"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteExperience(exp.id);
                    }}
                    className="p-1.5 rounded hover:bg-red-100 text-red-600 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  {exp.expanded ? <ChevronUp className="w-5 h-5 text-[#727976]" /> : <ChevronDown className="w-5 h-5 text-[#727976]" />}
                </div>
              </div>

              {exp.expanded && (
                <div className="p-5 bg-zinc-50 dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wider">
                      Verified Bullets & Impact Statements ({exp.bullets.length})
                    </span>
                    <button
                      type="button"
                      onClick={() => startAddBullet(exp.id)}
                      className="inline-flex items-center gap-1 text-xs font-mono font-bold bg-orange-100 dark:bg-orange-950/80 hover:bg-orange-200 text-orange-900 dark:text-orange-300 px-2.5 py-1 rounded-md transition-colors"
                    >
                      <Plus className="w-3 h-3" /> Tambah Bullet
                    </button>
                  </div>

                  {/* Modern Inline Bullet Editor Form */}
                  {bulletFormExpId === exp.id && (
                    <div className="p-3 bg-white dark:bg-zinc-900 rounded-xl border-2 border-orange-500 dark:border-orange-600 shadow-sm space-y-2.5 animate-in fade-in duration-150">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-orange-600 dark:text-orange-400 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" />
                          {editingBulletId ? "Edit Impact Bullet Point" : "Tambah Impact Statement / Bullet Baru"}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setBulletFormExpId(null);
                            setEditingBulletId(null);
                            setBulletInputValue("");
                          }}
                          className="text-[#727976] hover:text-[#191c1c] p-0.5"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <textarea
                        rows={2}
                        autoFocus
                        value={bulletInputValue}
                        onChange={(e) => setBulletInputValue(e.target.value)}
                        placeholder="Contoh: Developed responsive web interfaces using React and Tailwind CSS, reducing layout shift by 40%."
                        className="w-full text-xs p-2.5 border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 leading-relaxed resize-y"
                      />

                      {/* Quick AI Action & Control Buttons */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                        <button
                          type="button"
                          onClick={handleAiEnhanceBulletInput}
                          disabled={isAiRewritingBullet || !bulletInputValue.trim()}
                          className="inline-flex items-center gap-1 text-[11px] font-semibold bg-orange-100 dark:bg-orange-950/80 hover:bg-orange-200 text-orange-900 dark:text-orange-300 px-2.5 py-1 rounded-md transition-colors disabled:opacity-50"
                        >
                          <Sparkles className={`w-3 h-3 ${isAiRewritingBullet ? "animate-spin" : ""}`} />
                          <span>{isAiRewritingBullet ? "Memoles..." : "Poles dengan AI"}</span>
                        </button>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setBulletFormExpId(null);
                              setEditingBulletId(null);
                              setBulletInputValue("");
                            }}
                            className="px-3 py-1.5 text-xs text-[#727976] hover:text-[#191c1c] font-medium"
                          >
                            Batal
                          </button>
                          <button
                            type="button"
                            onClick={() => saveBulletForm(exp.id)}
                            disabled={!bulletInputValue.trim()}
                            className="px-3 py-1.5 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white text-xs font-semibold rounded-lg transition-colors shadow-xs disabled:opacity-50"
                          >
                            {editingBulletId ? "Simpan Perubahan" : "+ Tambahkan Bullet"}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    {exp.bullets.map((bullet) => {
                      const badge = confidenceBadge(bullet.confidence);
                      return (
                        <div key={bullet.id} className="p-3 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 flex items-start justify-between gap-3 text-xs">
                          <div className="space-y-1 flex-1">
                            <p className="text-zinc-900 dark:text-zinc-100 leading-relaxed">{bullet.text}</p>
                            <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono border ${badge.color}`}>
                              {badge.label} ({bullet.confidence}%)
                            </span>
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => startEditBullet(exp.id, bullet.id, bullet.text)}
                              className="text-zinc-400 hover:text-orange-600 dark:hover:text-orange-400 p-1 transition-colors"
                              title="Edit Bullet"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteBullet(exp.id, bullet.id)}
                              className="text-zinc-400 hover:text-red-600 p-1 transition-colors"
                              title="Delete Bullet"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-[#1b2220] rounded-xl border border-dashed border-[#c1c8c5] dark:border-[#242c2a] p-12 text-center space-y-4">
          <div className="w-12 h-12 rounded-xl bg-[#f2f4f3] dark:bg-[#121816] text-[#727976] dark:text-zinc-400 flex items-center justify-center mx-auto">
            <Briefcase className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-[#191c1c] dark:text-zinc-100">No Work Experience Recorded</h3>
            <p className="text-xs text-[#727976] dark:text-zinc-400 max-w-sm mx-auto">
              Add your employment history to start extracting verified skill claims for your resumes.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowAddForm(true)}
            className="inline-flex items-center gap-1.5 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white px-4 py-2 rounded-lg text-xs font-semibold transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" /> Add Your First Work Experience
          </button>
        </div>
      )}
    </div>
  );
}

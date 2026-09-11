"use client";

import { useState } from "react";
import {
  GraduationCap,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  Check,
  X,
  GripVertical,
  Award,
  Layers,
  Filter,
  FileText,
} from "lucide-react";
import { useUserProfile, ProfileEducation } from "@/lib/use-user-profile";
import { MonthYearPicker } from "@/components/ui/month-year-picker";

export default function EducationPage() {
  const { profile, saveProfile } = useUserProfile();
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [form, setForm] = useState({
    degree: "",
    fieldOfStudy: "",
    institution: "",
    location: "",
    startDate: "",
    endDate: "",
    gpa: "",
    honors: "",
    activities: "",
  });

  const [selectedResumeFilter, setSelectedResumeFilter] = useState<string>("all");
  const [openLinkageEduId, setOpenLinkageEduId] = useState<string | null>(null);
  const savedResumes = profile.resumes || [];

  const educations = profile.education || [];

  const getLinkedResumes = (edu: ProfileEducation) => {
    return savedResumes.filter((r) => {
      const snap = r.contentSnapshot?.education;
      if (!Array.isArray(snap)) return false;
      return snap.some(
        (e: any) =>
          e.id === edu.id ||
          (e.degree === edu.degree && e.institution === edu.institution)
      );
    });
  };

  const toggleResumeLink = (edu: ProfileEducation, resumeId: string) => {
    const targetResume = savedResumes.find((r) => r.id === resumeId);
    if (!targetResume) return;

    const currentSnap = targetResume.contentSnapshot || {};
    const currentEdus = currentSnap.education || [];

    const exists = currentEdus.some(
      (e: any) =>
        e.id === edu.id ||
        (e.degree === edu.degree && e.institution === edu.institution)
    );

    let newEdus = [];
    if (exists) {
      newEdus = currentEdus.filter(
        (e: any) =>
          !(
            e.id === edu.id ||
            (e.degree === edu.degree && e.institution === edu.institution)
          )
      );
    } else {
      newEdus = [
        ...currentEdus,
        {
          id: edu.id,
          degree: edu.degree,
          fieldOfStudy: edu.fieldOfStudy,
          institution: edu.institution,
          location: edu.location,
          startDate: edu.startDate,
          endDate: edu.endDate,
          gpa: edu.gpa,
          honors: edu.honors,
          activities: edu.activities,
        },
      ];
    }

    const updatedResume = {
      ...targetResume,
      contentSnapshot: {
        ...currentSnap,
        education: newEdus,
      },
    };

    const newResumesList = savedResumes.map((r) => (r.id === resumeId ? updatedResume : r));
    saveProfile({
      ...profile,
      resumes: newResumesList,
    });
  };

  const filteredEducations = educations.filter((edu) => {
    if (selectedResumeFilter === "all") return true;
    if (selectedResumeFilter === "unlinked") return getLinkedResumes(edu).length === 0;
    const linked = getLinkedResumes(edu);
    return linked.some((r) => r.id === selectedResumeFilter);
  });

  const toggle = (id: string) =>
    setExpandedIds((prev) => ({ ...prev, [id]: !prev[id] }));

  const deleteEdu = (id: string) => {
    const targetEdu = educations.find((e) => e.id === id);
    const instName = targetEdu ? targetEdu.institution.toLowerCase().trim() : "";
    const updated = educations.filter((e) => e.id !== id);

    const updatedResumes = savedResumes.map((r) => {
      const snap = r.contentSnapshot;
      if (!snap || !Array.isArray(snap.education)) return r;
      return {
        ...r,
        contentSnapshot: {
          ...snap,
          education: snap.education.filter(
            (ed: any) => ed.id !== id && (ed.institution || "").toLowerCase().trim() !== instName
          ),
        },
      };
    });

    saveProfile({ ...profile, education: updated, resumes: updatedResumes });
  };

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const save = () => {
    if (!form.degree || !form.institution) return;
    const newEdu: ProfileEducation = {
      id: `edu_${Date.now()}`,
      degree: form.degree,
      fieldOfStudy: form.fieldOfStudy,
      institution: form.institution,
      location: form.location,
      startDate: form.startDate,
      endDate: form.endDate,
      gpa: form.gpa,
      honors: form.honors,
      activities: form.activities,
    };
    saveProfile({ ...profile, education: [newEdu, ...educations] });
    setExpandedIds((prev) => ({ ...prev, [newEdu.id]: true }));
    setShowAddForm(false);
    setForm({
      degree: "",
      fieldOfStudy: "",
      institution: "",
      location: "",
      startDate: "",
      endDate: "",
      gpa: "",
      honors: "",
      activities: "",
    });
  };

  const fmtDate = (d: string) => {
    if (!d) return "Present";
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
          <h1 className="text-2xl font-bold text-[#191c1c] dark:text-zinc-100">Education</h1>
          <p className="text-sm text-[#727976] dark:text-zinc-400 mt-1">
            Academic background and credentials.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs bg-orange-100 dark:bg-orange-950/80 text-orange-900 dark:text-orange-300 px-3 py-1 rounded-full font-semibold">
            15% profil
          </span>
          <button
            onClick={() => setShowAddForm(true)}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" /> Add Education
          </button>
        </div>
      </div>

      {/* Resume Integration Filter Bar */}
      {savedResumes.length > 0 && (
        <div className="bg-white dark:bg-[#18181b] p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs shadow-xs">
          <div className="flex items-center gap-2 text-zinc-900 dark:text-zinc-200 font-semibold">
            <Layers className="w-4 h-4 text-orange-600 dark:text-orange-400" />
            <span>Integrasi CV Target ({savedResumes.length} Resume):</span>
            <span className="text-[#727976] dark:text-[#8c9390] font-normal hidden md:inline">
              Filter pendidikan yang terhubung ke versi CV tertentu
            </span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-3.5 h-3.5 text-[#727976] dark:text-zinc-400" />
            <select
              value={selectedResumeFilter}
              onChange={(e) => setSelectedResumeFilter(e.target.value)}
              className="w-full sm:w-auto px-3 py-1.5 rounded-lg border border-[#e1e3e2] dark:border-[#242c2a] bg-[#f8faf9] dark:bg-[#121816] text-[#191c1c] dark:text-zinc-100 text-xs font-semibold focus:outline-none focus:border-orange-500"
            >
              <option value="all">Semua Pendidikan (Master Profile)</option>
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

      {showAddForm && (
        <div className="bg-white dark:bg-[#1b2220] border-2 border-orange-500 dark:border-orange-600 rounded-xl p-6 space-y-4 shadow-sm">
          <h2 className="text-base font-bold text-[#191c1c] dark:text-zinc-100">Add Education</h2>
          <div className="grid grid-cols-2 gap-4">
            {[
              { k: "degree", label: "Degree *", placeholder: "e.g. Bachelor of Science" },
              { k: "fieldOfStudy", label: "Field of Study", placeholder: "e.g. Computer Science" },
              { k: "institution", label: "Institution *", placeholder: "e.g. University of Indonesia" },
              { k: "location", label: "Location", placeholder: "e.g. Jakarta, Indonesia" },
              { k: "gpa", label: "GPA / Grade", placeholder: "e.g. 3.8 / 4.0" },
              { k: "honors", label: "Honors", placeholder: "e.g. Magna Cum Laude" },
            ].map(({ k, label, placeholder }) => (
              <div key={k} className="space-y-1">
                <label className="text-xs font-medium text-[#191c1c] dark:text-zinc-200">{label}</label>
                <input
                  value={(form as any)[k]}
                  onChange={(e) => set(k, e.target.value)}
                  placeholder={placeholder}
                  className="w-full border border-[#e1e3e2] dark:border-[#242c2a] rounded-lg px-3 py-2 text-sm bg-white dark:bg-[#121816] text-[#191c1c] dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                />
              </div>
            ))}
            <div className="col-span-2 grid grid-cols-1 md:grid-cols-2 gap-3 items-end">
              <MonthYearPicker
                label="Start Date"
                value={form.startDate}
                onChange={(val) => set("startDate", val)}
              />
              <MonthYearPicker
                label="End Date / Graduation"
                value={form.endDate}
                onChange={(val) => set("endDate", val)}
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-[#191c1c] dark:text-zinc-200">Activities & Societies</label>
            <input
              value={form.activities}
              onChange={(e) => set("activities", e.target.value)}
              placeholder="e.g. Student Developer Club, Hackathon finalist"
              className="w-full border border-[#e1e3e2] dark:border-[#242c2a] bg-white dark:bg-[#121816] text-[#191c1c] dark:text-zinc-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
            />
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
              className="inline-flex items-center gap-2 border border-[#e1e3e2] dark:border-[#242c2a] text-[#727976] dark:text-zinc-400 px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#f2f4f3] dark:hover:bg-[#121816] transition-colors"
            >
              <X className="w-4 h-4" /> Cancel
            </button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {filteredEducations.map((edu) => {
          const isExpanded = expandedIds[edu.id] ?? true;
          return (
            <div
              key={edu.id}
              className="bg-white dark:bg-[#1b2220] rounded-xl border border-[#e1e3e2] dark:border-[#242c2a] overflow-hidden hover:shadow-sm transition-shadow"
            >
              <div className="flex items-center gap-4 px-6 py-4">
                <GripVertical className="w-4 h-4 text-[#c4c7c6] dark:text-zinc-500 cursor-grab flex-shrink-0" />
                <div
                  className="flex-1 min-w-0 cursor-pointer space-y-1"
                  onClick={() => toggle(edu.id)}
                >
                  <h2 className="text-base font-bold text-[#191c1c] dark:text-zinc-100">
                    {edu.degree}
                    {edu.fieldOfStudy ? ` ${edu.fieldOfStudy}` : ""}
                  </h2>
                  <div className="flex items-center gap-2 text-xs text-[#727976] dark:text-zinc-400">
                    <span className="font-medium text-[#3d3e3e] dark:text-zinc-300">
                      {edu.institution}
                    </span>
                    {edu.location && (
                      <>
                        <span>·</span>
                        <span>{edu.location}</span>
                      </>
                    )}
                    {edu.startDate && (
                      <>
                        <span>·</span>
                        <span>
                          {fmtDate(edu.startDate)} – {fmtDate(edu.endDate)}
                        </span>
                      </>
                    )}
                  </div>

                  {/* Resume Linkage Badges & Manager */}
                  <div className="flex items-center gap-1.5 flex-wrap pt-1">
                    <span className="text-[10px] font-mono text-[#727976] dark:text-zinc-400 uppercase font-bold">Tercantum di CV:</span>
                    {getLinkedResumes(edu).length === 0 ? (
                      <span className="text-[10px] italic text-[#727976] dark:text-zinc-500">Belum dihubungkan ke CV manapun</span>
                    ) : (
                      getLinkedResumes(edu).map((r) => (
                        <span
                          key={r.id}
                          className="text-[10px] bg-orange-50 dark:bg-orange-950/60 text-orange-900 dark:text-orange-300 border border-orange-200 dark:border-orange-900/60 px-2 py-0.5 rounded-full font-mono font-semibold flex items-center gap-1"
                        >
                          <FileText className="w-3 h-3 text-orange-600 dark:text-orange-400" /> {r.title}
                        </span>
                      ))
                    )}

                    {savedResumes.length > 0 && (
                      <div className="relative inline-block ml-1" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => setOpenLinkageEduId(openLinkageEduId === edu.id ? null : edu.id)}
                          className="text-[10px] bg-orange-100 dark:bg-orange-950/80 text-orange-900 dark:text-orange-300 hover:bg-orange-200 px-2 py-0.5 rounded-full font-semibold flex items-center gap-1 transition-colors shadow-2xs"
                        >
                          <Plus className="w-2.5 h-2.5" /> Hubungkan ke CV Target
                        </button>

                        {openLinkageEduId === edu.id && (
                          <div className="absolute left-0 mt-1 w-64 bg-white dark:bg-[#1b2220] border border-[#e1e3e2] dark:border-[#242c2a] rounded-xl shadow-xl p-3 z-50 space-y-2 text-xs">
                            <div className="flex items-center justify-between border-b border-[#edeeee] dark:border-[#242c2a] pb-1.5">
                              <span className="font-bold text-[#191c1c] dark:text-white">Pilih Target CV</span>
                              <button
                                type="button"
                                onClick={() => setOpenLinkageEduId(null)}
                                className="text-[#727976] dark:text-zinc-400 hover:text-[#191c1c] dark:hover:text-white"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            <div className="space-y-1 max-h-48 overflow-y-auto">
                              {savedResumes.map((r) => {
                                const isLinked = getLinkedResumes(edu).some((lr) => lr.id === r.id);
                                return (
                                  <div
                                    key={r.id}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleResumeLink(edu, r.id);
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
                <div className="flex items-center gap-1 flex-shrink-0">
                  {edu.honors && (
                    <span className="text-xs font-semibold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 px-2.5 py-1 rounded-full hidden sm:inline-flex items-center gap-1">
                      <Award className="w-3 h-3" />
                      {edu.honors}
                    </span>
                  )}
                  <button
                    onClick={() => deleteEdu(edu.id)}
                    className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 text-[#727976] dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => toggle(edu.id)}
                    className="p-2 rounded-lg hover:bg-[#f2f4f3] dark:hover:bg-[#121816] text-[#727976] dark:text-zinc-400 transition-colors"
                  >
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {isExpanded && (
                <div className="border-t border-[#f2f4f3] dark:border-[#242c2a] px-6 py-4 grid grid-cols-2 gap-4">
                  {edu.gpa && (
                    <div>
                      <p className="text-xs text-[#727976] dark:text-zinc-400 font-medium mb-0.5">
                        GPA / Grade
                      </p>
                      <p className="text-sm font-semibold text-[#191c1c] dark:text-zinc-100">
                        {edu.gpa}
                      </p>
                    </div>
                  )}
                  {edu.honors && (
                    <div>
                      <p className="text-xs text-[#727976] dark:text-zinc-400 font-medium mb-0.5">
                        Honors
                      </p>
                      <p className="text-sm font-semibold text-[#191c1c] dark:text-zinc-100">
                        {edu.honors}
                      </p>
                    </div>
                  )}
                  {edu.activities && (
                    <div className="col-span-2">
                      <p className="text-xs text-[#727976] dark:text-zinc-400 font-medium mb-0.5">
                        Activities & Societies
                      </p>
                      <p className="text-sm text-[#3d3e3e] dark:text-zinc-300">
                        {edu.activities}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {educations.length === 0 && !showAddForm && (
        <div className="text-center py-16 bg-white dark:bg-[#1b2220] border border-[#e1e3e2] dark:border-[#242c2a] rounded-xl p-8 space-y-3">
          <GraduationCap className="w-12 h-12 mx-auto text-orange-400" />
          <h3 className="text-base font-bold text-[#191c1c] dark:text-zinc-100">
            Belum ada riwayat pendidikan
          </h3>
          <p className="text-sm text-[#727976] dark:text-zinc-400 max-w-sm mx-auto">
            Tambahkan latar belakang pendidikan Anda untuk memperkuat kualifikasi Career Profile.
          </p>
          <button
            onClick={() => setShowAddForm(true)}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Education
          </button>
        </div>
      )}
    </div>
  );
}

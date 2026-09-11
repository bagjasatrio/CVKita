"use client";

import { useState } from "react";
import { X, Plus, Trash2 } from "lucide-react";

interface EntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  section: "experience" | "education" | "project" | "skill" | "certification" | "identity";
  initialData?: any;
  onSave: (data: any) => void;
}

export function EntryModal({
  isOpen,
  onClose,
  section,
  initialData,
  onSave,
}: EntryModalProps) {
  const [formData, setFormData] = useState<any>(
    initialData || {
      role: "",
      company: "",
      startDate: "",
      endDate: "",
      location: "",
      bullets: [""],
      institution: "",
      degree: "",
      fieldOfStudy: "",
      grade: "",
      title: "",
      technologies: "",
      description: "",
      github: "",
      url: "",
      name: "",
      category: "Languages",
      level: "Intermediate",
      issuer: "",
      issueDate: "",
      credentialId: "",
      fullName: "",
      headline: "",
      pronouns: "",
      email: "",
      phone: "",
    }
  );

  if (!isOpen) return null;

  const handleChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleBulletChange = (idx: number, val: string) => {
    const updated = [...(formData.bullets || [""])];
    updated[idx] = val;
    handleChange("bullets", updated);
  };

  const addBullet = () => {
    handleChange("bullets", [...(formData.bullets || []), ""]);
  };

  const removeBullet = (idx: number) => {
    const updated = (formData.bullets || []).filter((_: any, i: number) => i !== idx);
    handleChange("bullets", updated.length > 0 ? updated : [""]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-zinc-800 space-y-5 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
          <h2 className="text-base font-bold text-slate-900 dark:text-zinc-100 capitalize">
            {initialData ? "Edit" : "Add New"} {section}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 dark:text-zinc-500 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Experience Form */}
          {section === "experience" && (
            <>
              <div>
                <label className="block font-medium text-slate-600 dark:text-zinc-400 mb-1">Job Title / Role</label>
                <input
                  type="text"
                  required
                  value={formData.role || ""}
                  onChange={(e) => handleChange("role", e.target.value)}
                  placeholder="e.g. Senior Frontend Engineer"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-600 dark:text-zinc-400 mb-1">Company / Organization</label>
                <input
                  type="text"
                  required
                  value={formData.company || ""}
                  onChange={(e) => handleChange("company", e.target.value)}
                  placeholder="e.g. Acme Tech Labs"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-600 dark:text-zinc-400 mb-1">Start Date</label>
                  <input
                    type="text"
                    value={formData.startDate || ""}
                    onChange={(e) => handleChange("startDate", e.target.value)}
                    placeholder="e.g. Jan 2023"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-600 dark:text-zinc-400 mb-1">End Date</label>
                  <input
                    type="text"
                    value={formData.endDate || ""}
                    onChange={(e) => handleChange("endDate", e.target.value)}
                    placeholder="e.g. Present"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-medium text-slate-600 dark:text-zinc-400">Accomplishment Bullets</label>
                  <button
                    type="button"
                    onClick={addBullet}
                    className="text-xs text-orange-600 dark:text-orange-400 font-semibold flex items-center gap-1 hover:underline"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Bullet
                  </button>
                </div>
                <div className="space-y-2">
                  {(formData.bullets || [""]).map((b: string, i: number) => (
                    <div key={i} className="flex items-start gap-2">
                      <textarea
                        rows={2}
                        value={b}
                        onChange={(e) => handleBulletChange(i, e.target.value)}
                        placeholder="Action verb + technical scope + quantified impact..."
                        className="w-full p-2 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-orange-500"
                      />
                      {(formData.bullets || []).length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeBullet(i)}
                          className="p-2 text-slate-400 dark:text-zinc-500 hover:text-red-500 dark:hover:text-red-400"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Identity Form */}
          {section === "identity" && (
            <>
              <div>
                <label className="block font-medium text-slate-600 dark:text-zinc-400 mb-1">Full Legal Name</label>
                <input
                  type="text"
                  required
                  value={formData.fullName || ""}
                  onChange={(e) => handleChange("fullName", e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-orange-500"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-600 dark:text-zinc-400 mb-1">Professional Headline</label>
                <input
                  type="text"
                  value={formData.headline || ""}
                  onChange={(e) => handleChange("headline", e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-orange-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-600 dark:text-zinc-400 mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.email || ""}
                    onChange={(e) => handleChange("email", e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-600 dark:text-zinc-400 mb-1">Location</label>
                  <input
                    type="text"
                    value={formData.location || ""}
                    onChange={(e) => handleChange("location", e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>
            </>
          )}

          {/* Skill Form */}
          {section === "skill" && (
            <>
              <div>
                <label className="block font-medium text-slate-600 dark:text-zinc-400 mb-1">Skill Name</label>
                <input
                  type="text"
                  required
                  value={formData.name || ""}
                  onChange={(e) => handleChange("name", e.target.value)}
                  placeholder="e.g. Next.js, Rust, Kubernetes"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-orange-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-600 dark:text-zinc-400 mb-1">Category</label>
                  <select
                    value={formData.category || "Languages"}
                    onChange={(e) => handleChange("category", e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 focus:outline-none"
                  >
                    <option value="Languages">Languages</option>
                    <option value="Frameworks & Libs">Frameworks & Libs</option>
                    <option value="Databases & Tools">Databases & Tools</option>
                    <option value="DevOps & Cloud">DevOps & Cloud</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-slate-600 dark:text-zinc-400 mb-1">Proficiency Level</label>
                  <select
                    value={formData.level || "Intermediate"}
                    onChange={(e) => handleChange("level", e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 focus:outline-none"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                    <option value="Expert">Expert</option>
                  </select>
                </div>
              </div>
            </>
          )}

          {/* Project Form */}
          {section === "project" && (
            <>
              <div>
                <label className="block font-medium text-slate-600 dark:text-zinc-400 mb-1">Project Title</label>
                <input
                  type="text"
                  required
                  value={formData.title || ""}
                  onChange={(e) => handleChange("title", e.target.value)}
                  placeholder="e.g. Real-Time Distributed Queue"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-orange-500"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-600 dark:text-zinc-400 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={formData.description || ""}
                  onChange={(e) => handleChange("description", e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-orange-500"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-600 dark:text-zinc-400 mb-1">
                  Technologies (comma separated)
                </label>
                <input
                  type="text"
                  value={
                    Array.isArray(formData.technologies)
                      ? formData.technologies.join(", ")
                      : formData.technologies || ""
                  }
                  onChange={(e) =>
                    handleChange(
                      "technologies",
                      e.target.value.split(",").map((s) => s.trim())
                    )
                  }
                  placeholder="TypeScript, Next.js, Redis, Docker"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-orange-500"
                />
              </div>
            </>
          )}

          {/* Education Form */}
          {section === "education" && (
            <>
              <div>
                <label className="block font-medium text-slate-600 dark:text-zinc-400 mb-1">Institution Name</label>
                <input
                  type="text"
                  required
                  value={formData.institution || ""}
                  onChange={(e) => handleChange("institution", e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-orange-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-600 dark:text-zinc-400 mb-1">Degree</label>
                  <input
                    type="text"
                    value={formData.degree || ""}
                    onChange={(e) => handleChange("degree", e.target.value)}
                    placeholder="B.S., M.S., Diploma"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-600 dark:text-zinc-400 mb-1">GPA / Grade</label>
                  <input
                    type="text"
                    value={formData.grade || ""}
                    onChange={(e) => handleChange("grade", e.target.value)}
                    placeholder="3.8 / 4.0"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>
            </>
          )}

          {/* Certification Form */}
          {section === "certification" && (
            <>
              <div>
                <label className="block font-medium text-slate-600 dark:text-zinc-400 mb-1">Certification Name</label>
                <input
                  type="text"
                  required
                  value={formData.name || ""}
                  onChange={(e) => handleChange("name", e.target.value)}
                  placeholder="AWS Solutions Architect, CKA, etc."
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-orange-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-600 dark:text-zinc-400 mb-1">Issuer</label>
                  <input
                    type="text"
                    value={formData.issuer || ""}
                    onChange={(e) => handleChange("issuer", e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-600 dark:text-zinc-400 mb-1">Issue Date</label>
                  <input
                    type="text"
                    value={formData.issueDate || ""}
                    onChange={(e) => handleChange("issueDate", e.target.value)}
                    placeholder="e.g. Aug 2024"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>
            </>
          )}

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-orange-600 dark:bg-orange-500 text-white dark:text-zinc-950 text-xs font-semibold hover:bg-orange-700 dark:hover:bg-orange-400 transition-colors shadow-xs"
            >
              Save to Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

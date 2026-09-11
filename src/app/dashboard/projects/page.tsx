"use client";

import { useState } from "react";
import { FolderGit2, Plus, ExternalLink, Trash2, X, Github, Layers, Filter, FileText } from "lucide-react";
import { useUserProfile, ProfileProject as Project } from "@/lib/use-user-profile";

export default function ProjectsPage() {
  const { profile, saveProfile } = useUserProfile();
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedResumeFilter, setSelectedResumeFilter] = useState<string>("all");
  const [openLinkageProjId, setOpenLinkageProjId] = useState<string | null>(null);

  const savedResumes = profile.resumes || [];

  // Form states
  const [name, setName] = useState("");
  const [role, setRole] = useState("Lead Author");
  const [description, setDescription] = useState("");
  const [techInput, setTechInput] = useState("");
  const [githubUrl, setGithubUrl] = useState("");

  const handleAddProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !description.trim()) return;

    const techStack = techInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const newProj: Project = {
      id: `proj_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name,
      role: role || "Developer",
      description,
      techStack: techStack.length > 0 ? techStack : ["TypeScript", "React"],
      githubUrl: githubUrl || undefined,
    };

    saveProfile({
      ...profile,
      projects: [newProj, ...(profile.projects || [])],
    });

    setName("");
    setDescription("");
    setTechInput("");
    setGithubUrl("");
    setShowAddForm(false);
  };

  const handleDeleteProject = (id: string) => {
    saveProfile({
      ...profile,
      projects: (profile.projects || []).filter((p) => p.id !== id),
    });
  };

  const toggleResumeLink = (proj: Project, resumeId: string) => {
    const currentTargetIds = (proj as any).targetResumeIds || [];
    const isLinked = currentTargetIds.includes(resumeId);
    const updatedTargetIds = isLinked
      ? currentTargetIds.filter((id: string) => id !== resumeId)
      : [...currentTargetIds, resumeId];

    const updatedProjects = (profile.projects || []).map((p) => {
      if (p.id === proj.id) {
        return { ...p, targetResumeIds: updatedTargetIds };
      }
      return p;
    });

    saveProfile({
      ...profile,
      projects: updatedProjects,
    });
  };

  const getLinkedResumes = (proj: Project) => {
    const targetIds = (proj as any).targetResumeIds || [];
    return savedResumes.filter((r) => targetIds.includes(r.id));
  };

  const filteredProjects = (profile.projects || []).filter((proj) => {
    if (selectedResumeFilter === "all") return true;
    const targetIds = (proj as any).targetResumeIds || [];
    if (selectedResumeFilter === "unlinked") return targetIds.length === 0;
    return targetIds.includes(selectedResumeFilter);
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-zinc-900 p-5 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
            <FolderGit2 className="w-6 h-6 text-orange-600 dark:text-orange-400" /> Project Portfolio
          </h1>
          <p className="text-sm text-slate-500 dark:text-zinc-400 mt-0.5">
            Key software projects, open source contributions, and engineering artifacts.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddForm(true)}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white px-4 py-2.5 rounded-lg text-xs font-semibold transition-colors shadow-sm shrink-0"
        >
          <Plus className="w-4 h-4" /> Add Project
        </button>
      </div>

      {/* Resume Integration Filter Bar */}
      {savedResumes.length > 0 && (
        <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-slate-200 dark:border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs shadow-xs">
          <div className="flex items-center gap-2 text-slate-900 dark:text-zinc-100 font-semibold">
            <Layers className="w-4 h-4 text-orange-600 dark:text-orange-400" />
            <span>Integrasi CV Target ({savedResumes.length} Resume):</span>
            <span className="text-slate-500 dark:text-zinc-400 font-normal hidden md:inline">
              Filter project yang terhubung ke versi CV tertentu
            </span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-3.5 h-3.5 text-slate-500 dark:text-zinc-400" />
            <select
              value={selectedResumeFilter}
              onChange={(e) => setSelectedResumeFilter(e.target.value)}
              className="w-full sm:w-auto px-3 py-1.5 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 text-xs font-semibold focus:outline-none focus:border-orange-500 dark:focus:border-orange-500"
            >
              <option value="all">Semua Project (Master Profile)</option>
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
        <form onSubmit={handleAddProject} className="bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 p-6 shadow-md space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-zinc-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">Add New Project</h3>
            <button type="button" onClick={() => setShowAddForm(false)} className="text-slate-400 hover:text-slate-900 dark:hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-800 dark:text-zinc-200">Project Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. CVForge AI"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 focus:ring-2 focus:ring-orange-500 dark:focus:ring-orange-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-800 dark:text-zinc-200">Your Role</label>
              <input
                type="text"
                placeholder="e.g. Lead Author / Developer"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 focus:ring-2 focus:ring-orange-500 dark:focus:ring-orange-500"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-800 dark:text-zinc-200">Description *</label>
            <textarea
              required
              rows={3}
              placeholder="Summary of what the project accomplishes and key metrics..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 focus:ring-2 focus:ring-orange-500 dark:focus:ring-orange-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-800 dark:text-zinc-200">Tech Stack (comma separated)</label>
              <input
                type="text"
                placeholder="React, TypeScript, Next.js"
                value={techInput}
                onChange={(e) => setTechInput(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 focus:ring-2 focus:ring-orange-500 dark:focus:ring-orange-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-800 dark:text-zinc-200">GitHub URL</label>
              <input
                type="url"
                placeholder="https://github.com/username/project"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 focus:ring-2 focus:ring-orange-500 dark:focus:ring-orange-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-zinc-800">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 text-xs font-medium text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white rounded-lg text-xs font-semibold transition-colors"
            >
              Save Project
            </button>
          </div>
        </form>
      )}

      {filteredProjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredProjects.map((proj) => (
            <div key={proj.id} className="bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 p-5 shadow-sm space-y-3 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100">{proj.name}</h3>
                    <span className="text-xs text-slate-600 dark:text-zinc-400 font-medium">{proj.role}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteProject(proj.id)}
                    className="p-1 text-slate-400 dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-xs text-slate-600 dark:text-zinc-300 leading-relaxed">{proj.description}</p>

                {/* Resume Linkage Badges & Manager */}
                <div className="flex items-center gap-1.5 flex-wrap pt-2 border-t border-slate-100 dark:border-zinc-800">
                  <span className="text-[10px] font-mono text-slate-500 dark:text-zinc-400 uppercase font-bold">Tercantum di CV:</span>
                  {getLinkedResumes(proj).length === 0 ? (
                    <span className="text-[10px] italic text-slate-400 dark:text-zinc-500">Belum dihubungkan ke CV manapun</span>
                  ) : (
                    getLinkedResumes(proj).map((r) => (
                      <span
                        key={r.id}
                        className="text-[10px] bg-orange-50 dark:bg-orange-950/60 text-orange-800 dark:text-orange-300 border border-orange-200 dark:border-orange-900/60 px-2 py-0.5 rounded-full font-mono font-semibold flex items-center gap-1"
                      >
                        <FileText className="w-3 h-3 text-orange-600 dark:text-orange-400" /> {r.title}
                      </span>
                    ))
                  )}

                  {savedResumes.length > 0 && (
                    <div className="relative inline-block ml-1" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => setOpenLinkageProjId(openLinkageProjId === proj.id ? null : proj.id)}
                        className="text-[10px] bg-orange-100 dark:bg-orange-950/80 text-orange-800 dark:text-orange-300 hover:bg-orange-200 px-2 py-0.5 rounded-full font-semibold flex items-center gap-1 transition-colors shadow-2xs"
                      >
                        <Plus className="w-2.5 h-2.5" /> Hubungkan ke CV Target
                      </button>

                      {openLinkageProjId === proj.id && (
                        <div className="absolute left-0 mt-1 w-64 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl shadow-xl p-3 z-50 space-y-2 text-xs">
                          <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-1.5">
                            <span className="font-bold text-slate-900 dark:text-white">Pilih Target CV</span>
                            <button
                              type="button"
                              onClick={() => setOpenLinkageProjId(null)}
                              className="text-slate-400 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <div className="space-y-1 max-h-48 overflow-y-auto">
                                {savedResumes.map((r) => {
                                  const isLinked = getLinkedResumes(proj).some((lr) => lr.id === r.id);
                                  return (
                                    <div
                                      key={r.id}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        toggleResumeLink(proj, r.id);
                                      }}
                                      className="flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-zinc-800 cursor-pointer text-xs transition-colors select-none"
                                    >
                                      <span className="font-medium text-slate-800 dark:text-zinc-200 truncate max-w-[170px]">
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

              <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-zinc-800">
                <div className="flex flex-wrap gap-1">
                  {proj.techStack.map((tech) => (
                    <span key={tech} className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-800 dark:text-zinc-200">
                      {tech}
                    </span>
                  ))}
                </div>

                {proj.githubUrl && (
                  <a
                    href={proj.githubUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-orange-600 dark:text-orange-400 hover:underline"
                  >
                    <Github className="w-3.5 h-3.5" /> Repository <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-dashed border-slate-300 dark:border-zinc-800 p-12 text-center space-y-4">
          <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 flex items-center justify-center mx-auto">
            <FolderGit2 className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100">No Projects Added Yet</h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-sm mx-auto">
              Add your software projects, repositories, or technical accomplishments.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowAddForm(true)}
            className="px-4 py-2 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white text-xs font-semibold rounded-lg transition-colors inline-flex items-center gap-1.5 shadow-xs"
          >
            <Plus className="w-4 h-4" /> Add Your First Project
          </button>
        </div>
      )}
    </div>
  );
}

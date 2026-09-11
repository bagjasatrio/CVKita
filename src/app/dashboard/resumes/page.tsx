"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, FileText, ArrowUpRight, Trash2, Eye } from "lucide-react";
import { useUserProfile, SavedResume } from "@/lib/use-user-profile";
import { GlassConfirmModal } from "@/components/ui/glass-confirm-modal";
import { ResumePreviewModal } from "@/components/resumes/resume-preview-modal";

export default function ResumesPage() {
  const { profile, saveProfile } = useUserProfile();
  const resumes = profile.resumes || [];

  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [previewResume, setPreviewResume] = useState<SavedResume | null>(null);

  const confirmDeleteResume = (id: string) => {
    setConfirmDeleteId(id);
  };

  const handleDeleteConfirmed = () => {
    if (!confirmDeleteId) return;
    saveProfile({
      ...profile,
      resumes: resumes.filter((r) => r.id !== confirmDeleteId),
    });
    setConfirmDeleteId(null);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-2xl font-bold text-[#191c1c] dark:text-zinc-100">My Targeted Resumes</h1>
          <p className="text-sm text-[#727976] dark:text-zinc-400">
            Deterministic resume snapshots derived from your Master Career Profile with tailored ATS keywords.
          </p>
        </div>
        <Link
          href="/dashboard/resumes/new?fresh=true"
          className="inline-flex items-center gap-2 bg-orange-600 dark:bg-orange-500 hover:bg-orange-700 dark:hover:bg-orange-400 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-xs self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 text-white" />
          <span>Tailor New Resume</span>
        </Link>
      </div>

      {resumes.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-[#1b2220] border border-[#e1e3e2] dark:border-[#242c2a] rounded-2xl p-8 space-y-3 print:hidden">
          <FileText className="w-12 h-12 mx-auto text-orange-400 dark:text-orange-500" />
          <h3 className="text-base font-bold text-[#191c1c] dark:text-zinc-100">Belum ada resume ter-tailor</h3>
          <p className="text-sm text-[#727976] dark:text-zinc-400 max-w-md mx-auto">
            Buat versi resume khusus yang disesuaikan dengan deskripsi pekerjaan impian Anda secara deterministik dari Master Career Profile.
          </p>
          <Link
            href="/dashboard/resumes/new?fresh=true"
            className="inline-flex items-center gap-2 bg-orange-600 dark:bg-orange-500 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-orange-700 dark:hover:bg-orange-400 transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4 text-white" /> Tailor New Resume
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 print:hidden">
          {resumes.map((resume) => (
            <div
              key={resume.id}
              className="bg-white dark:bg-[#1b2220] rounded-2xl border border-[#e1e3e2] dark:border-[#242c2a] p-5 flex flex-col justify-between hover:shadow-md hover:border-orange-300 dark:hover:border-orange-600/60 transition-all space-y-4 relative group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-orange-100 dark:bg-orange-950/80 text-orange-950 dark:text-orange-300 font-semibold border border-orange-200 dark:border-orange-900">
                    {resume.atsScore}% ATS Match
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-[#727976] dark:text-zinc-400">{resume.updated}</span>
                    <button
                      onClick={() => confirmDeleteResume(resume.id)}
                      className="p-1 rounded hover:bg-red-50 dark:hover:bg-red-950/40 text-[#727976] dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                      title="Delete resume"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <h2 className="text-base font-bold text-[#191c1c] dark:text-zinc-100 leading-tight">{resume.title}</h2>
                <p className="text-xs text-[#727976] dark:text-zinc-400">
                  Target: {resume.role} {resume.company ? `@ ${resume.company}` : ""}
                </p>
                <div className="flex items-center gap-2 text-xs text-[#4c6079] dark:text-zinc-400 font-mono">
                  <span>Template: {resume.template}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-[#edeeee] dark:border-[#242c2a] flex items-center justify-between">
                <Link
                  href={`/dashboard/resumes/${resume.id}`}
                  className="text-xs font-semibold text-orange-600 dark:text-orange-400 hover:underline flex items-center gap-1"
                >
                  <span>Open ATS Studio</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
                <button
                  type="button"
                  onClick={() => setPreviewResume(resume)}
                  className="px-3 py-1.5 rounded-lg bg-[#f2f4f3] dark:bg-[#121816] hover:bg-[#e1e3e2] dark:hover:bg-[#242c2a] text-xs font-medium text-[#191c1c] dark:text-zinc-200 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" />
                  <span>View Canvas</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ResumePreviewModal
        isOpen={Boolean(previewResume)}
        onClose={() => setPreviewResume(null)}
        resume={previewResume}
        profile={profile}
      />

      <GlassConfirmModal
        isOpen={Boolean(confirmDeleteId)}
        title="Hapus Resume?"
        description="Apakah Anda yakin ingin menghapus versi resume ini? Tindakan ini tidak dapat dibatalkan."
        confirmText="Hapus Resume"
        variant="danger"
        onConfirm={handleDeleteConfirmed}
        onCancel={() => setConfirmDeleteId(null)}
      />
    </div>
  );
}

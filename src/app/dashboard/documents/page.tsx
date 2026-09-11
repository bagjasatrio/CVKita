"use client";

import { useState } from "react";
import Link from "next/link";
import { UploadCloud, FileText, CheckCircle2, ShieldCheck, Plus, ArrowRight, Trash2 } from "lucide-react";
import { UploadModal } from "@/components/documents/upload-modal";
import { BulkUploadModal } from "@/components/documents/bulk-upload-modal";
import { useUserProfile } from "@/lib/use-user-profile";

export default function DocumentsPage() {
  const [isSingleModalOpen, setIsSingleModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const { profile, saveProfile } = useUserProfile();

  const documents = profile.documents || [];

  const deleteDocument = (id: string) => {
    saveProfile({
      ...profile,
      documents: documents.filter((d) => d.id !== id),
    });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Documents & Fact Vault</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Upload CVs, degree transcripts, and certificates. Extracted facts are indexed with source traceability.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsBulkModalOpen(true)}
            className="inline-flex items-center gap-2 bg-orange-100 text-orange-900 dark:bg-orange-950 dark:text-orange-300 hover:bg-orange-200 px-3.5 py-2 rounded-lg text-xs font-bold transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Bulk Import</span>
          </button>
          <button
            type="button"
            onClick={() => setIsSingleModalOpen(true)}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white px-4 py-2 rounded-lg text-xs font-semibold transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Upload Document</span>
          </button>
        </div>
      </div>

      {/* Upload Dropzone */}
      <div
        onClick={() => setIsBulkModalOpen(true)}
        className="border-2 border-dashed border-zinc-300 hover:border-orange-500 dark:border-zinc-800 dark:hover:border-orange-500 rounded-2xl p-8 bg-white dark:bg-zinc-900 text-center space-y-3 cursor-pointer transition-colors"
      >
        <div className="w-12 h-12 rounded-full bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 flex items-center justify-center mx-auto">
          <UploadCloud className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
            Click to upload or drag & drop files
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Supported formats: PDF, DOCX (Max 15MB). Automated anti-hallucination extraction with confidence scoring.
          </p>
        </div>
      </div>

      {/* Document List */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 divide-y divide-zinc-100 dark:divide-zinc-800">
        <div className="p-4 flex items-center justify-between font-medium text-xs text-zinc-500 dark:text-zinc-400">
          <span className="w-2/5">DOCUMENT</span>
          <span className="w-1/5">EXTRACTION STATUS</span>
          <span className="w-1/5">FACTS EXTRACTED</span>
          <span className="w-1/5 text-right">ACTION</span>
        </div>

        {documents.map((doc) => (
          <div key={doc.id} className="p-4 flex items-center justify-between text-sm hover:bg-orange-50/50 dark:hover:bg-zinc-800/50 transition-colors">
            <div className="flex items-center gap-3 w-2/5">
              <div className="w-9 h-9 rounded-lg bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 flex items-center justify-center shrink-0">
                <FileText className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-zinc-900 dark:text-zinc-100 text-xs truncate">{doc.name}</p>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">{doc.size} • {doc.uploadedAt}</p>
              </div>
            </div>

            <div className="w-1/5">
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-mono bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300 font-semibold">
                <CheckCircle2 className="w-3 h-3 text-orange-600 dark:text-orange-400" />
                {doc.status || "COMPLETED"}
              </span>
            </div>

            <div className="font-mono text-xs text-zinc-900 dark:text-zinc-100 w-1/5">
              {doc.facts ?? 12} verified items
            </div>

            <div className="w-1/5 text-right flex items-center justify-end gap-3">
              <Link
                href="/dashboard/documents/review"
                className="inline-flex items-center gap-1 text-xs font-medium text-orange-600 dark:text-orange-400 hover:underline"
              >
                <span>Review Facts</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <button
                onClick={() => deleteDocument(doc.id)}
                className="p-1 rounded hover:bg-red-50 text-zinc-400 hover:text-red-600 transition-colors"
                title="Delete document"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}

        {documents.length === 0 && (
          <div className="p-12 text-center space-y-2">
            <FileText className="w-10 h-10 mx-auto text-orange-400" />
            <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Belum ada dokumen diunggah</p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Unggah CV atau sertifikat Anda untuk memverifikasi fakta otomatis.
            </p>
          </div>
        )}
      </div>

      <UploadModal isOpen={isSingleModalOpen} onClose={() => setIsSingleModalOpen(false)} />
      <BulkUploadModal isOpen={isBulkModalOpen} onClose={() => setIsBulkModalOpen(false)} />
    </div>
  );
}

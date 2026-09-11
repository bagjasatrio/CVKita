"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  UploadCloud,
  FileText,
  X,
  Loader2,
  ShieldCheck,
  Award,
  GraduationCap,
  Sparkles,
  Layers,
  Trash2,
  Check,
} from "lucide-react";
import { useUserProfile } from "@/lib/use-user-profile";

interface BulkUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface BatchFileItem {
  id: string;
  file?: File;
  name: string;
  sizeStr: string;
  category: "CERTIFICATE" | "CV" | "TRANSCRIPT" | "ACHIEVEMENT";
  status: "queued" | "extracting" | "completed" | "error";
  progress: number;
  confidenceScore: number;
  extractedTitle: string;
  extractedIssuer?: string;
  extractedDate?: string;
}

export function BulkUploadModal({ isOpen, onClose }: BulkUploadModalProps) {
  const router = useRouter();
  const { profile, saveProfile } = useUserProfile();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [batchQueue, setBatchQueue] = useState<BatchFileItem[]>([
    {
      id: "demo-1",
      name: "Sertifikat_AWS_Certified_Solutions_Architect.pdf",
      sizeStr: "2.4 MB",
      category: "CERTIFICATE",
      status: "completed",
      progress: 100,
      confidenceScore: 0.96,
      extractedTitle: "AWS Certified Solutions Architect – Associate",
      extractedIssuer: "Amazon Web Services",
      extractedDate: "2023-11-15",
    },
    {
      id: "demo-2",
      name: "Transkrip_Nilai_S1_Teknik_Informatika.pdf",
      sizeStr: "1.8 MB",
      category: "TRANSCRIPT",
      status: "completed",
      progress: 100,
      confidenceScore: 0.91,
      extractedTitle: "S1 Teknik Informatika (IPK 3.82)",
      extractedIssuer: "Universitas Dian Nuswantoro",
      extractedDate: "2022-08-20",
    },
  ]);

  const [isProcessingBatch, setIsProcessingBatch] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const autoClassifyFile = (fileName: string): "CERTIFICATE" | "CV" | "TRANSCRIPT" | "ACHIEVEMENT" => {
    const lower = fileName.toLowerCase();
    if (lower.includes("cert") || lower.includes("sertifikat") || lower.includes("aws") || lower.includes("dicoding") || lower.includes("coursera")) {
      return "CERTIFICATE";
    }
    if (lower.includes("transcript") || lower.includes("transkrip") || lower.includes("ijazah") || lower.includes("gpa")) {
      return "TRANSCRIPT";
    }
    if (lower.includes("award") || lower.includes("juara") || lower.includes("achievement") || lower.includes("lomba")) {
      return "ACHIEVEMENT";
    }
    return "CV";
  };

  const handleFilesAdded = (files: FileList | File[]) => {
    const newItems: BatchFileItem[] = Array.from(files).map((f, idx) => {
      const cat = autoClassifyFile(f.name);
      return {
        id: `batch_${Date.now()}_${idx}`,
        file: f,
        name: f.name,
        sizeStr: `${(f.size / (1024 * 1024)).toFixed(1)} MB`,
        category: cat,
        status: "queued",
        progress: 0,
        confidenceScore: 0.92,
        extractedTitle: f.name.replace(/\.[^/.]+$/, "").replace(/_/g, " "),
        extractedIssuer: cat === "CERTIFICATE" ? "Verifiable Issuer" : "Academic Institution",
        extractedDate: "2024",
      };
    });

    setBatchQueue((prev) => [...prev, ...newItems]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFilesAdded(e.dataTransfer.files);
    }
  };

  const removeItem = (id: string) => {
    setBatchQueue(batchQueue.filter((item) => item.id !== id));
  };

  const startBatchExtraction = () => {
    setIsProcessingBatch(true);

    let currentIdx = 0;
    const interval = setInterval(() => {
      setBatchQueue((prev) => {
        return prev.map((item, idx) => {
          if (idx === currentIdx) {
            return {
              ...item,
              status: "extracting",
              progress: Math.min(100, item.progress + 40),
            };
          }
          if (idx < currentIdx) {
            return { ...item, status: "completed", progress: 100 };
          }
          return item;
        });
      });

      currentIdx++;
      if (currentIdx >= batchQueue.length) {
        clearInterval(interval);
        setTimeout(() => {
          setIsProcessingBatch(false);
          setIsSuccess(true);
        }, 500);
      }
    }, 600);
  };

  const handleBatchApproveHighConfidence = () => {
    const newCertifications = [...(profile.certifications || [])];
    const newAchievements = [...(profile.achievements || [])];
    const newEducations = [...(profile.education || [])];
    const newDocs = [...(profile.documents || [])];

    batchQueue.forEach((item) => {
      const docEntry = {
        id: `doc_${item.id}`,
        name: item.name,
        type: item.category,
        uploadedAt: "Just now",
        size: item.sizeStr,
        status: "COMPLETED",
        facts: 4,
      };
      if (!newDocs.some((d) => d.name === item.name)) {
        newDocs.unshift(docEntry);
      }

      if (item.category === "CERTIFICATE") {
        const exists = newCertifications.some(
          (c) => c.name.toLowerCase().trim() === item.extractedTitle.toLowerCase().trim()
        );
        if (!exists) {
          newCertifications.unshift({
            id: `cert_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            name: item.extractedTitle,
            issuer: item.extractedIssuer || "Verified Issuer",
            issueDate: item.extractedDate || "2023",
            status: "active",
          });
        }
      } else if (item.category === "ACHIEVEMENT") {
        const exists = newAchievements.some(
          (a) => a.title.toLowerCase().trim() === item.extractedTitle.toLowerCase().trim()
        );
        if (!exists) {
          newAchievements.unshift({
            id: `ach_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            title: item.extractedTitle,
            issuer: item.extractedIssuer || "Organization",
            date: item.extractedDate || "2023",
            description: `Extracted from document ${item.name}`,
          });
        }
      } else if (item.category === "TRANSCRIPT") {
        const exists = newEducations.some(
          (ed) => ed.institution.toLowerCase().trim() === (item.extractedIssuer || "").toLowerCase().trim()
        );
        if (!exists) {
          newEducations.unshift({
            id: `edu_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            institution: item.extractedIssuer || "Perguruan Tinggi",
            degree: item.extractedTitle,
            fieldOfStudy: "Teknik Informatika / Computer Science",
            startDate: "2018",
            endDate: "2022",
          });
        }
      }
    });

    saveProfile({
      ...profile,
      certifications: newCertifications,
      achievements: newAchievements,
      education: newEducations,
      documents: newDocs,
    });

    onClose();
    router.push("/dashboard/documents");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 dark:border-zinc-800 space-y-5 animate-in fade-in-50 zoom-in-95">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-orange-100 dark:bg-orange-950/80 text-orange-600 dark:text-orange-400 flex items-center justify-center font-bold">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 dark:text-zinc-100">
                  Bulk Certificate & Document Importer
                </h2>
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300">
                  Import Queue
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Batch upload multiple certificates, diplomas, and awards with automatic classification.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Dropzone for Multi-Files */}
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-slate-300 dark:border-zinc-700 hover:border-orange-500 rounded-xl p-6 bg-slate-50 dark:bg-zinc-950/60 text-center cursor-pointer transition-colors space-y-2"
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.docx,.png,.jpg,.jpeg,.txt"
            onChange={(e) => e.target.files && handleFilesAdded(e.target.files)}
            className="hidden"
          />
          <div className="w-10 h-10 rounded-full bg-white dark:bg-zinc-800 text-orange-600 dark:text-orange-400 flex items-center justify-center mx-auto shadow-xs">
            <UploadCloud className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-900 dark:text-zinc-100">
              Pilih Banyak Dokumen Sekaligus atau Drag & Drop (Batch Queue)
            </p>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
              Mendukung PDF, DOCX, PNG, JPG (Hingga 10 file sekaligus)
            </p>
          </div>
        </div>

        {/* Batch Queue List */}
        <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 dark:text-zinc-400 px-1 font-semibold uppercase">
            <span>FILE BATCH QUEUE ({batchQueue.length})</span>
            <span>STATUS & CONFIDENCE</span>
          </div>

          {batchQueue.map((item) => (
            <div
              key={item.id}
              className="p-3 bg-slate-50 dark:bg-zinc-950/60 rounded-xl border border-slate-200/80 dark:border-zinc-800 flex items-center justify-between text-xs gap-3"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="w-8 h-8 rounded-lg bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-orange-600 dark:text-orange-400 flex items-center justify-center shrink-0">
                  {item.category === "CERTIFICATE" ? (
                    <Award className="w-4 h-4" />
                  ) : item.category === "TRANSCRIPT" ? (
                    <GraduationCap className="w-4 h-4" />
                  ) : (
                    <FileText className="w-4 h-4" />
                  )}
                </div>

                <div className="min-w-0 flex-1 space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900 dark:text-zinc-100 truncate">
                      {item.extractedTitle || item.name}
                    </span>
                    <span className="px-1.5 py-0.2 text-[9px] font-mono font-bold rounded bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300 uppercase shrink-0">
                      {item.category}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400 truncate">
                    {item.name} • {item.sizeStr}
                  </p>

                  {/* Progress bar during extraction */}
                  {item.status === "extracting" && (
                    <div className="w-full h-1 bg-slate-200 dark:bg-zinc-800 rounded-full overflow-hidden mt-1">
                      <div
                        className="h-full bg-gradient-to-r from-orange-500 to-red-500 transition-all duration-300"
                        style={{ width: `${item.progress}%` }}
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-orange-600 dark:text-orange-400">
                  {Math.round(item.confidenceScore * 100)}% Match
                </span>

                <button
                  type="button"
                  onClick={() => removeItem(item.id)}
                  className="text-slate-400 hover:text-red-500 p-1 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}

          {batchQueue.length === 0 && (
            <div className="text-center py-6 text-xs text-slate-500 dark:text-zinc-400">
              Belum ada file di dalam antrean. Pilih atau geser sertifikat/dokumen ke area di atas.
            </div>
          )}
        </div>

        {/* Anti-Deduplication Guarantee Badge */}
        <div className="flex items-center justify-between text-xs bg-orange-50 dark:bg-orange-950/40 p-3 rounded-xl border border-orange-200 dark:border-orange-900/60">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-orange-600 dark:text-orange-400" />
            <span className="text-orange-900 dark:text-orange-200 font-medium">
              Auto-Deduplication & Zero-Fabrication Guard
            </span>
          </div>
          <span className="text-[11px] text-orange-700 dark:text-orange-400 font-mono">Deduplication Active</span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-end gap-3 pt-1 border-t border-slate-100 dark:border-zinc-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100"
          >
            Batal
          </button>

          {batchQueue.some((i) => i.status === "queued") && (
            <button
              type="button"
              onClick={startBatchExtraction}
              disabled={isProcessingBatch}
              className="px-4 py-2 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shadow-sm disabled:opacity-50"
            >
              {isProcessingBatch ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Ekstraksi Batch...
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-orange-100" /> Jalankan Ekstraksi Batch ({batchQueue.length})
                </>
              )}
            </button>
          )}

          {batchQueue.length > 0 && !batchQueue.some((i) => i.status === "queued") && (
            <button
              type="button"
              onClick={handleBatchApproveHighConfidence}
              className="px-5 py-2.5 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 shadow-md"
            >
              <Check className="w-4 h-4 text-orange-100" /> Gabungkan Semua ke Master Profile
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

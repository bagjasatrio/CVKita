"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  UploadCloud,
  FileText,
  X,
  Loader2,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UploadModal({ isOpen, onClose }: UploadModalProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [docType, setDocType] = useState<"CV" | "CERTIFICATE" | "TRANSCRIPT">("CV");
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
      setError(null);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      if (file) {
        formData.append("file", file);
      } else {
        // Sample document if user proceeds without selecting a file
        formData.append("fileName", "Bagja_Satrio_Resume_2024.pdf");
      }
      formData.append("docType", docType);

      const res = await fetch("/api/cv/upload", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Extraction failed");
      }

      // Store extraction in session storage for immediate smooth review transition
      if (typeof window !== "undefined") {
        sessionStorage.setItem("cvforge_current_extraction", JSON.stringify(json.data));
      }

      setIsUploading(false);
      onClose();
      router.push("/dashboard/documents/review");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to process document");
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-zinc-800 space-y-5 animate-in fade-in-50 zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-950/80 text-orange-600 dark:text-orange-400 flex items-center justify-center font-bold">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-zinc-100">Upload Document to Fact Vault</h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400">AI extraction with zero-hallucination guard</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Document Type Selector */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-900 dark:text-zinc-200 uppercase tracking-wider">
            Document Category
          </label>
          <div className="grid grid-cols-3 gap-2 text-xs font-medium">
            {(["CV", "CERTIFICATE", "TRANSCRIPT"] as const).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setDocType(type)}
                className={`py-2 px-3 rounded-lg border text-center transition-all ${
                  docType === type
                    ? "bg-gradient-to-r from-orange-600 to-red-600 text-white font-semibold shadow-xs border-transparent"
                    : "border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800"
                }`}
              >
                {type === "CV" ? "Resume / CV" : type === "CERTIFICATE" ? "Certificate" : "Transcript"}
              </button>
            ))}
          </div>
        </div>

        {/* Dropzone */}
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleFileDrop}
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-slate-300 dark:border-zinc-700 hover:border-orange-500 rounded-xl p-6 bg-slate-50 dark:bg-zinc-950/60 text-center cursor-pointer transition-colors space-y-2"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx,.txt"
            onChange={handleFileSelect}
            className="hidden"
          />
          <div className="w-10 h-10 rounded-full bg-white dark:bg-zinc-800 text-orange-600 dark:text-orange-400 flex items-center justify-center mx-auto shadow-xs">
            <FileText className="w-5 h-5" />
          </div>
          {file ? (
            <div className="space-y-1">
              <p className="text-xs font-bold text-orange-600 dark:text-orange-400">{file.name}</p>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400">{(file.size / 1024).toFixed(1)} KB</p>
            </div>
          ) : (
            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-900 dark:text-zinc-100">
                Choose a file or drag & drop here
              </p>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400">PDF, DOCX, or TXT up to 15MB</p>
            </div>
          )}
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Anti-fabrication reminder */}
        <div className="flex items-center gap-2 text-[11px] text-slate-600 dark:text-zinc-400 bg-slate-100 dark:bg-zinc-800/60 p-2.5 rounded-lg">
          <ShieldCheck className="w-4 h-4 text-orange-500 dark:text-orange-400 shrink-0" />
          <span>
            Extracted data requires your review before merging into your Career Profile.
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isUploading}
            className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isUploading}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white px-5 py-2.5 rounded-lg text-xs font-semibold transition-all shadow-sm disabled:opacity-50"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Extracting Facts...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-3.5 h-3.5 text-orange-100" />
                <span>Start AI Extraction</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

"use client";

import { AlertTriangle, Trash2, HelpCircle, X, ShieldAlert } from "lucide-react";

export interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "info";
  onConfirm: () => void;
  onCancel: () => void;
}

export function GlassConfirmModal({
  isOpen,
  title,
  description,
  confirmText = "Ya, Lanjutkan",
  cancelText = "Batal",
  variant = "danger",
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 print:hidden">
      <div className="w-full max-w-md bg-white dark:bg-[#1b2220] rounded-2xl border border-[#e1e3e2] dark:border-[#242c2a] shadow-2xl p-6 space-y-5 animate-in zoom-in-95 duration-200">
        {/* Header with Icon */}
        <div className="flex items-start gap-4">
          <div
            className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
              variant === "danger"
                ? "bg-red-100 text-red-700 dark:bg-red-950/80 dark:text-red-300 border border-red-200 dark:border-red-800"
                : variant === "warning"
                ? "bg-amber-100 text-amber-700 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-200 dark:border-amber-800"
                : "bg-blue-100 text-blue-700 dark:bg-blue-950/80 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
            }`}
          >
            {variant === "danger" ? (
              <Trash2 className="w-5 h-5" />
            ) : variant === "warning" ? (
              <AlertTriangle className="w-5 h-5" />
            ) : (
              <HelpCircle className="w-5 h-5" />
            )}
          </div>

          <div className="space-y-1 flex-1">
            <h3 className="text-base font-bold text-[#191c1c] dark:text-white leading-snug">
              {title}
            </h3>
            <p className="text-xs text-[#727976] dark:text-[#a0aaa5] leading-relaxed">
              {description}
            </p>
          </div>

          <button
            type="button"
            onClick={onCancel}
            className="p-1 rounded-lg text-[#727976] hover:bg-[#f2f4f3] dark:hover:bg-[#242c2a] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-[#edeeee] dark:border-[#242c2a]">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-xs font-semibold text-[#727976] dark:text-[#a0aaa5] hover:bg-[#f2f4f3] dark:hover:bg-[#242c2a] rounded-xl transition-colors"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`px-4 py-2 text-xs font-bold text-white rounded-xl transition-colors shadow-sm ${
              variant === "danger"
                ? "bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600"
                : variant === "warning"
                ? "bg-amber-600 hover:bg-amber-700 dark:bg-amber-700 dark:hover:bg-amber-600"
                : "bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500"
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

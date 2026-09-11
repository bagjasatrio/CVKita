"use client";

import React, { useEffect } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

export type ToastType = "success" | "error" | "info";

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
}

interface GlassToastProps {
  toast: ToastMessage | null;
  onClose: () => void;
  duration?: number;
}

export function GlassToast({ toast, onClose, duration = 3500 }: GlassToastProps) {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [toast, onClose, duration]);

  if (!toast) return null;

  const isSuccess = toast.type === "success";
  const isError = toast.type === "error";

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-5 duration-300 pointer-events-auto">
      <div
        className={`flex items-start gap-3.5 p-4 rounded-2xl border backdrop-blur-xl shadow-2xl min-w-[280px] max-w-md transition-all ${
          isSuccess
            ? "bg-orange-950/80 border-orange-500/40 text-orange-100 shadow-orange-950/50"
            : isError
            ? "bg-red-950/70 border-red-500/40 text-red-100 shadow-red-950/50"
            : "bg-slate-900/70 border-slate-700/50 text-slate-100 shadow-slate-950/50"
        }`}
        style={{
          boxShadow: isSuccess
            ? "0 20px 30px -10px rgba(249, 115, 22, 0.25), inset 0 1px 1px rgba(255, 255, 255, 0.15)"
            : isError
            ? "0 20px 30px -10px rgba(239, 68, 68, 0.25), inset 0 1px 1px rgba(255, 255, 255, 0.15)"
            : "0 20px 30px -10px rgba(15, 23, 42, 0.35), inset 0 1px 1px rgba(255, 255, 255, 0.15)",
        }}
      >
        <div className="flex-shrink-0 mt-0.5">
          {isSuccess ? (
            <CheckCircle2 className="w-5 h-5 text-orange-400 animate-pulse" />
          ) : isError ? (
            <AlertCircle className="w-5 h-5 text-red-400 animate-bounce" />
          ) : (
            <Info className="w-5 h-5 text-sky-400" />
          )}
        </div>

        <div className="flex-1 min-w-0 pr-2">
          <p className="text-sm font-bold tracking-wide">{toast.title}</p>
          {toast.message && (
            <p className="text-xs opacity-85 mt-0.5 leading-relaxed font-normal">{toast.message}</p>
          )}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="flex-shrink-0 text-white/60 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          aria-label="Close notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

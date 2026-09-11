"use client";

import { useState } from "react";
import {
  Sparkles,
  ShieldCheck,
  Check,
  X,
  Edit3,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { RewriteResponse } from "@/lib/ai/rewriter";

interface AIRewriteModalProps {
  isOpen: boolean;
  onClose: () => void;
  originalText: string;
  type?: "bullet" | "summary";
  onAccept: (enhancedText: string) => void;
}

export function AIRewriteModal({
  isOpen,
  onClose,
  originalText,
  type = "bullet",
  onAccept,
}: AIRewriteModalProps) {
  const [style, setStyle] = useState<"action_oriented" | "concise" | "metric_focused">(
    "action_oriented"
  );
  const [targetRole, setTargetRole] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<RewriteResponse | null>(null);
  const [editableText, setEditableText] = useState("");
  const [isManualEditing, setIsManualEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/ai/rewrite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: originalText,
          type,
          style,
          targetRole: targetRole || undefined,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Rewrite request failed");
      }

      setResult(json.data);
      setEditableText(json.data.enhancedText);
    } catch (err: any) {
      setError(err.message || "Failed to rewrite content");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 dark:border-zinc-800 space-y-5 animate-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-950/80 text-orange-600 dark:text-orange-400 flex items-center justify-center font-bold">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-zinc-100">
                AI Content Assistant (Fact-Preserved)
              </h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Zero fabricated metrics, guaranteed factual grounding
              </p>
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

        {/* Style Controls */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="font-semibold text-slate-900 dark:text-zinc-200">Optimization Tone:</span>
          {(
            [
              ["action_oriented", "Action-Oriented Verbs"],
              ["concise", "Concise & Crisp"],
              ["metric_focused", "Metric Highlights"],
            ] as const
          ).map(([val, label]) => (
            <button
              key={val}
              type="button"
              onClick={() => setStyle(val)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                style === val
                  ? "bg-gradient-to-r from-orange-600 to-red-600 text-white font-semibold shadow-xs"
                  : "border border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Comparison Canvas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Original */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-950/60 border border-slate-200/80 dark:border-zinc-800 space-y-2">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
              Original Content
            </span>
            <p className="text-xs text-slate-600 dark:text-zinc-300 leading-relaxed italic">{originalText}</p>
          </div>

          {/* Enhanced / Result */}
          <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-orange-200 dark:border-orange-900/60 shadow-xs space-y-2 relative">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-orange-600 dark:text-orange-400 uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-orange-500 dark:text-orange-400" /> Enhanced Output
              </span>
              {result && (
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300 font-bold">
                  {Math.round(result.confidenceScore * 100)}% Match
                </span>
              )}
            </div>

            {isLoading ? (
              <div className="h-24 flex flex-col items-center justify-center text-xs text-slate-500 dark:text-zinc-400 space-y-2">
                <Loader2 className="w-5 h-5 animate-spin text-orange-500 dark:text-orange-400" />
                <span>Optimizing verbs and metrics...</span>
              </div>
            ) : isManualEditing ? (
              <textarea
                value={editableText}
                onChange={(e) => setEditableText(e.target.value)}
                rows={4}
                className="w-full p-2 text-xs border border-orange-500 dark:border-orange-500 rounded-lg focus:outline-none leading-relaxed bg-white dark:bg-zinc-950 text-slate-900 dark:text-zinc-100"
              />
            ) : result ? (
              <p className="text-xs text-slate-900 dark:text-zinc-100 font-medium leading-relaxed">
                {editableText}
              </p>
            ) : (
              <p className="text-xs text-slate-500 dark:text-zinc-400 italic">
                Click &quot;Generate Enhanced Phrasing&quot; below to run the anti-fabrication pipeline.
              </p>
            )}
          </div>
        </div>

        {/* Preserved facts badge */}
        {result && (
          <div className="p-3 rounded-lg bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-900/60 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-orange-900 dark:text-orange-300">
              <ShieldCheck className="w-4 h-4 text-orange-600 dark:text-orange-400 shrink-0" />
              <span>
                <strong>Preserved Grounding:</strong> {result.preservedFacts.join(", ")}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsManualEditing(!isManualEditing)}
              className="text-xs text-orange-600 dark:text-orange-400 font-semibold hover:underline flex items-center gap-1"
            >
              <Edit3 className="w-3.5 h-3.5" />
              {isManualEditing ? "Done Editing" : "Edit Manually"}
            </button>
          </div>
        )}

        {error && (
          <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}

        {/* Action Suite */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-zinc-800">
          {!result ? (
            <div className="ml-auto flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleGenerate}
                disabled={isLoading}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white px-5 py-2 rounded-lg text-xs font-semibold transition-colors shadow-sm disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5 text-orange-100" />
                <span>Generate Enhanced Phrasing</span>
              </button>
            </div>
          ) : (
            <div className="w-full flex items-center justify-between">
              <button
                type="button"
                onClick={onClose}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-zinc-800 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
                <span>Reject / Keep Original</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleGenerate}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-zinc-800 text-xs font-medium text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800"
                >
                  Regenerate
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onAccept(editableText);
                    onClose();
                  }}
                  className="inline-flex items-center gap-1.5 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors shadow-sm"
                >
                  <Check className="w-3.5 h-3.5 text-orange-100" />
                  <span>Accept Enhanced</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

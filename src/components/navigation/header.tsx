"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Search, Bell, Sparkles, LogOut, User as UserIcon, ChevronDown, Menu, Sun, Moon, Monitor, Home } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useTheme } from "@/components/theme-provider";

interface HeaderProps {
  onOpenMobileMenu?: () => void;
}

export function Header({ onOpenMobileMenu }: HeaderProps) {
  const { user, logout } = useAuth();
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);
  const [isAiMenuOpen, setIsAiMenuOpen] = useState(false);
  const [isNotifMenuOpen, setIsNotifMenuOpen] = useState(false);

  const [isReadOnly, setIsReadOnly] = useState(true);

  const toggleThemeNext = () => {
    if (theme === "light") setTheme("dark");
    else if (theme === "dark") setTheme("system");
    else setTheme("light");
  };

  const aiStatus = (() => {
    if (typeof window === "undefined") {
      return { title: "Heuristic Generator", badge: "Internal Engine", isConnected: false, desc: "Internal Rule Engine active." };
    }

    const userId = user?.id || "";
    const provider = (localStorage.getItem(userId ? `cvforge_ai_provider_${userId}` : "cvforge_ai_provider") as any) || "gemini";
    const geminiKey = localStorage.getItem(userId ? `cvforge_gemini_key_${userId}` : "cvforge_gemini_key") || "";
    const openaiKey = localStorage.getItem(userId ? `cvforge_openai_key_${userId}` : "cvforge_openai_key") || "";

    if (provider === "openai" && openaiKey.trim()) {
      return { title: "OpenAI GPT-4o-mini", badge: "Live Connected", isConnected: true, desc: "Live OpenAI API Key active." };
    }
    if (provider === "gemini" && geminiKey.trim()) {
      return { title: "Google Gemini 1.5", badge: "Live Connected", isConnected: true, desc: "Live Gemini API Key active." };
    }
    if (provider === "heuristic") {
      return { title: "Heuristic Generator", badge: "Internal Engine", isConnected: true, desc: "Rule-based engine without external API." };
    }

    return {
      title: `${provider === "openai" ? "OpenAI" : "Google Gemini"} (API Key Belum Dipasang)`,
      badge: "Fallback Heuristic",
      isConnected: false,
      desc: "API Key belum diisi di Settings. Menggunakan Heuristic Fallback.",
    };
  })();

  return (
    <header className="h-16 shrink-0 border-b border-slate-200 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between sticky top-0 z-40 print:hidden transition-colors">
      {/* Left side: Hamburger button (Mobile) + Search Bar */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="p-2 rounded-lg border border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-900 lg:hidden shrink-0 transition-colors"
          aria-label="Open Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Search Input */}
        <div className="relative w-36 sm:w-60 md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-500" />
          <input
            type="text"
            name="search_query_unlocked"
            autoComplete="off"
            readOnly={isReadOnly}
            onFocus={() => setIsReadOnly(false)}
            onClick={() => setIsReadOnly(false)}
            placeholder="Search..."
            className="w-full bg-slate-100 dark:bg-zinc-900/80 text-xs sm:text-sm pl-9 pr-3 py-1.5 rounded-lg border border-transparent dark:border-zinc-800 text-slate-900 dark:text-zinc-100 focus:border-orange-500 dark:focus:border-orange-500 focus:bg-white dark:focus:bg-zinc-900 focus:outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-zinc-500"
          />
        </div>
      </div>

      {/* Action Buttons & Profile */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Landing Page Button */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors border border-slate-200/80 dark:border-zinc-800 shrink-0"
          title="Kembali ke Landing Page Utama"
        >
          <Home className="w-4 h-4 text-orange-500" />
          <span className="hidden md:inline">Landing Page</span>
        </Link>

        <Link
          href="/dashboard/resumes/new?fresh=true"
          className="inline-flex items-center gap-1.5 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold transition-colors shadow-xs shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">New Resume</span>
          <span className="sm:hidden">CV</span>
        </Link>

        {/* Quick AI Assistant Menu (Sparkles Icon) */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setIsAiMenuOpen(!isAiMenuOpen);
              setIsNotifMenuOpen(false);
              setIsThemeMenuOpen(false);
              setIsProfileMenuOpen(false);
            }}
            title="AI Assistant & Provider Status"
            aria-label="AI Assistant"
            className="p-2 rounded-lg text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-900 hover:text-slate-900 dark:hover:text-zinc-100 transition-colors relative"
          >
            <Sparkles className="w-5 h-5 text-orange-500" />
            <span className={`w-2 h-2 rounded-full ${aiStatus.isConnected ? "bg-orange-500" : "bg-amber-500"} absolute top-1.5 right-1.5 ring-2 ring-white dark:ring-zinc-950`} />
          </button>

          {isAiMenuOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl shadow-xl p-4 z-50 space-y-3 text-xs animate-in fade-in duration-150">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-2.5">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-orange-500" />
                  <span className="font-semibold text-slate-900 dark:text-white">CVKita AI Assistant</span>
                </div>
                <span className="text-[10px] font-mono font-medium bg-orange-500/10 text-orange-600 dark:text-orange-400 px-2 py-0.5 rounded-full border border-orange-500/20">
                  Ready
                </span>
              </div>

              <div className="bg-slate-50 dark:bg-zinc-950/60 p-3 rounded-lg border border-slate-200/80 dark:border-zinc-800/80 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase text-slate-400 dark:text-zinc-500">Engine</span>
                  <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full ${aiStatus.isConnected ? "bg-orange-500/10 text-orange-600 dark:text-orange-400" : "bg-amber-500/10 text-amber-600 dark:text-amber-400"}`}>
                    {aiStatus.badge}
                  </span>
                </div>
                <p className="font-semibold text-slate-900 dark:text-zinc-100 pt-0.5">
                  {aiStatus.title}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                  {aiStatus.desc}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase text-slate-400 dark:text-zinc-500 block px-1">Quick Actions</span>
                
                <Link
                  href="/dashboard/cover-letter"
                  onClick={() => setIsAiMenuOpen(false)}
                  className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800/80 text-slate-700 dark:text-zinc-300 font-medium transition-colors"
                >
                  <span className="text-base">✉️</span>
                  <span>Cover Letter Generator</span>
                </Link>

                <Link
                  href="/dashboard/resumes"
                  onClick={() => setIsAiMenuOpen(false)}
                  className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800/80 text-slate-700 dark:text-zinc-300 font-medium transition-colors"
                >
                  <span className="text-base">✨</span>
                  <span>Resume Bullet Enhancer</span>
                </Link>

                <Link
                  href="/dashboard/settings"
                  onClick={() => setIsAiMenuOpen(false)}
                  className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800/80 text-orange-600 dark:text-orange-400 font-semibold transition-colors pt-2 border-t border-slate-100 dark:border-zinc-800"
                >
                  <span className="text-base">⚙️</span>
                  <span>Configure AI Keys</span>
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Theme Switcher Toggle */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setIsThemeMenuOpen(!isThemeMenuOpen);
              setIsAiMenuOpen(false);
              setIsNotifMenuOpen(false);
              setIsProfileMenuOpen(false);
            }}
            className="p-2 rounded-lg text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-900 transition-colors"
            title={`Tema saat ini: ${theme} (Klik untuk ganti)`}
          >
            {theme === "system" ? (
              <Monitor className="w-5 h-5" />
            ) : resolvedTheme === "dark" ? (
              <Moon className="w-5 h-5 text-orange-400" />
            ) : (
              <Sun className="w-5 h-5 text-amber-500" />
            )}
          </button>

          {isThemeMenuOpen && (
            <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl shadow-xl py-1 z-50 text-xs">
              <div className="px-3 py-1.5 font-bold text-[11px] text-slate-400 dark:text-zinc-500 border-b border-slate-100 dark:border-zinc-800 uppercase">
                Pilih Tema
              </div>
              <button
                type="button"
                onClick={() => {
                  setTheme("light");
                  setIsThemeMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 text-left transition-colors ${
                  theme === "light"
                    ? "bg-orange-50 dark:bg-orange-950/50 text-orange-600 dark:text-orange-400 font-bold"
                    : "text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Sun className="w-4 h-4 text-amber-500" />
                  <span>Light (Terang)</span>
                </div>
                {theme === "light" && <span>✓</span>}
              </button>
              <button
                type="button"
                onClick={() => {
                  setTheme("dark");
                  setIsThemeMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 text-left transition-colors ${
                  theme === "dark"
                    ? "bg-orange-50 dark:bg-orange-950/50 text-orange-600 dark:text-orange-400 font-bold"
                    : "text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Moon className="w-4 h-4 text-orange-400" />
                  <span>Dark (Gelap)</span>
                </div>
                {theme === "dark" && <span>✓</span>}
              </button>
              <button
                type="button"
                onClick={() => {
                  setTheme("system");
                  setIsThemeMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 text-left transition-colors ${
                  theme === "system"
                    ? "bg-orange-50 dark:bg-orange-950/50 text-orange-600 dark:text-orange-400 font-bold"
                    : "text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Monitor className="w-4 h-4 text-slate-500" />
                  <span>System (Otomatis)</span>
                </div>
                {theme === "system" && <span>✓</span>}
              </button>
            </div>
          )}
        </div>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setIsNotifMenuOpen(!isNotifMenuOpen);
              setIsAiMenuOpen(false);
              setIsThemeMenuOpen(false);
              setIsProfileMenuOpen(false);
            }}
            aria-label="Notifications"
            className="p-2 rounded-lg text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-900 transition-colors relative"
          >
            <Bell className="w-5 h-5" />
            <span className="w-2 h-2 rounded-full bg-red-500 absolute top-2 right-2 ring-2 ring-white dark:ring-zinc-950" />
          </button>

          {isNotifMenuOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl shadow-2xl p-3 z-50 space-y-2 text-xs">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-1.5">
                <span className="font-bold text-slate-900 dark:text-white">Notifikasi Terbaru</span>
                <span className="text-[10px] font-mono text-orange-600 dark:text-orange-400 font-bold">2 Baru</span>
              </div>
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                <div className="p-2 bg-slate-50 dark:bg-zinc-950/60 rounded-lg border border-slate-200/80 dark:border-zinc-800">
                  <p className="font-bold text-orange-600 dark:text-orange-400">🎯 Skor ATS 98% Terdeteksi</p>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">Resume Anda memiliki kompatibilitas tinggi dengan JD Stripe.</p>
                </div>
                <div className="p-2 bg-slate-50 dark:bg-zinc-950/60 rounded-lg border border-slate-200/80 dark:border-zinc-800">
                  <p className="font-bold text-slate-800 dark:text-zinc-200">✨ Integrasi LLM Aktif</p>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">Engine Google Gemini siap untuk re-write fakta karier.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="h-6 w-px bg-slate-200 dark:bg-zinc-800" />

        {/* Profile Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
            className="flex items-center gap-2.5 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-900 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-orange-500 to-red-500 text-white flex items-center justify-center font-bold text-xs shadow-xs">
              {user?.avatarInitials || "AV"}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-semibold text-slate-800 dark:text-zinc-200 leading-none">{user?.name || "Alex Vance"}</p>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">{user?.roleTitle || "Senior Frontend Engineer"}</p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500" />
          </button>

          {isProfileMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl shadow-xl py-1 z-50 text-xs">
              <div className="px-4 py-2 border-b border-slate-100 dark:border-zinc-800">
                <p className="font-semibold text-slate-800 dark:text-zinc-200">{user?.name}</p>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400 truncate">{user?.email}</p>
              </div>

              <Link
                href="/dashboard/profile"
                onClick={() => setIsProfileMenuOpen(false)}
                className="flex items-center gap-2 px-4 py-2 text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 font-medium"
              >
                <UserIcon className="w-4 h-4 text-slate-400 dark:text-zinc-500" /> Master Profile
              </Link>

              <Link
                href="/"
                onClick={() => setIsProfileMenuOpen(false)}
                className="flex items-center gap-2 px-4 py-2 text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 font-medium"
              >
                <Home className="w-4 h-4 text-slate-400 dark:text-zinc-500" /> Landing Page Utama
              </Link>

              <div className="border-t border-slate-100 dark:border-zinc-800 my-1" />

              <button
                type="button"
                onClick={() => {
                  setIsProfileMenuOpen(false);
                  logout();
                }}
                className="w-full flex items-center gap-2 px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 font-medium text-left"
              >
                <LogOut className="w-4 h-4 text-red-600 dark:text-red-400" /> Sign Out (Logout)
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

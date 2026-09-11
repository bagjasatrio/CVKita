"use client";

import { useState } from "react";
import Link from "next/link";
import {
  UploadCloud,
  ShieldCheck,
  Target,
  ArrowRight,
  Layers,
  CheckCircle2,
  Lock,
  UserCheck,
  LogIn,
  Sun,
  Moon,
  Monitor,
  Sparkles,
  FileText,
  Zap,
  Check,
  ChevronDown,
  Award,
  Briefcase,
  GraduationCap,
  Cpu,
  Globe,
  Menu,
  X,
  Heart,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useTheme } from "@/components/theme-provider";

export default function LandingPage() {
  const { isAuthenticated, user } = useAuth();
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [isThemeDropdownOpen, setIsThemeDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"simulator" | "ats" | "vault">("simulator");
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const toggleFaq = (idx: number) => {
    setOpenFaq(openFaq === idx ? null : idx);
  };

  return (
    <div className="min-h-screen bg-[#fffdfa] dark:bg-[#09090b] text-[#1c1917] dark:text-[#fafafa] flex flex-col selection:bg-orange-100 selection:text-orange-900 transition-colors duration-200">
      {/* Background Ambient Glows */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-100px] left-[20%] w-[500px] h-[500px] bg-orange-400/25 dark:bg-orange-600/15 rounded-full blur-[120px]" />
        <div className="absolute top-[-50px] right-[20%] w-[450px] h-[450px] bg-red-400/20 dark:bg-red-600/10 rounded-full blur-[100px]" />
      </div>

      {/* Top Navigation Bar */}
      <nav className="h-16 sm:h-20 border-b border-orange-100 dark:border-zinc-800 bg-white/80 dark:bg-[#09090b]/80 backdrop-blur-xl sticky top-0 z-50 px-3 sm:px-8 lg:px-12 flex items-center justify-between transition-colors">
        <div className="flex items-center gap-2 sm:gap-3">
          <img
            src="/logo.png"
            alt="CVKita Logo"
            className="w-auto h-7 sm:h-8 object-contain shrink-0"
          />
          <span className="font-extrabold text-lg sm:text-xl tracking-tight text-zinc-900 dark:text-white flex items-center gap-1.5">
            CVKita
            <span className="hidden xs:inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full bg-orange-100 dark:bg-orange-950 text-orange-800 dark:text-orange-300 border border-orange-200 dark:border-orange-900">
              AI Platform
            </span>
          </span>
        </div>

        {/* Center Nav Links (Desktop - Absolutely Centered) */}
        <div className="hidden lg:flex items-center gap-6 xl:gap-8 text-sm font-medium text-zinc-600 dark:text-zinc-400 absolute left-1/2 -translate-x-1/2">
          <a href="#how-it-works" className="hover:text-orange-600 dark:hover:text-white transition-colors">
            Cara Kerja
          </a>
          <a href="#features" className="hover:text-orange-600 dark:hover:text-white transition-colors">
            Fitur Utama
          </a>
          <a href="#faq" className="hover:text-orange-600 dark:hover:text-white transition-colors">
            FAQ
          </a>
          <a
            href="https://tako.id/BAGJA"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-orange-200/80 dark:border-orange-900/60 bg-orange-50/80 dark:bg-orange-950/40 text-orange-900 dark:text-orange-300 hover:bg-orange-100 dark:hover:bg-orange-900/70 text-xs font-semibold transition-colors"
            title="Dukung Pengembangan CVKita"
          >
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 shrink-0" />
            <span>Dukung CVKita ☕</span>
          </a>
        </div>

        {/* Right Nav Actions */}
        <div className="flex items-center gap-1.5 sm:gap-3">
          {/* Theme Selector Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsThemeDropdownOpen(!isThemeDropdownOpen)}
              className="p-1.5 sm:p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors flex items-center gap-1 text-xs font-medium"
              title="Ganti Tema"
            >
              {resolvedTheme === "dark" ? (
                <Moon className="w-4 h-4 text-orange-400" />
              ) : (
                <Sun className="w-4 h-4 text-amber-500" />
              )}
              <span className="hidden md:inline capitalize">{theme}</span>
              <ChevronDown className="w-3 h-3 text-zinc-400 hidden sm:inline" />
            </button>

            {isThemeDropdownOpen && (
              <div className="absolute right-0 mt-2 w-36 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl p-1.5 z-50 text-xs space-y-0.5">
                <button
                  type="button"
                  onClick={() => {
                    setTheme("light");
                    setIsThemeDropdownOpen(false);
                  }}
                  className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left transition-colors ${
                    theme === "light"
                      ? "bg-orange-100 dark:bg-orange-950 text-orange-900 dark:text-orange-200 font-bold"
                      : "text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  }`}
                >
                  <Sun className="w-3.5 h-3.5 text-amber-500" /> Terang
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTheme("dark");
                    setIsThemeDropdownOpen(false);
                  }}
                  className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left transition-colors ${
                    theme === "dark"
                      ? "bg-orange-100 dark:bg-orange-950 text-orange-900 dark:text-orange-200 font-bold"
                      : "text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  }`}
                >
                  <Moon className="w-3.5 h-3.5 text-orange-400" /> Gelap
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTheme("system");
                    setIsThemeDropdownOpen(false);
                  }}
                  className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left transition-colors ${
                    theme === "system"
                      ? "bg-orange-100 dark:bg-orange-950 text-orange-900 dark:text-orange-200 font-bold"
                      : "text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  }`}
                >
                  <Monitor className="w-3.5 h-3.5 text-zinc-400" /> Sistem
                </button>
              </div>
            )}
          </div>

          {/* Auth Action */}
          {isAuthenticated ? (
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all shadow-sm shrink-0"
            >
              <UserCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
              <span className="hidden sm:inline">Dashboard ({user?.name.split(" ")[0]})</span>
              <span className="sm:hidden text-[11px]">Dashboard</span>
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden sm:flex text-xs sm:text-sm font-semibold text-zinc-700 dark:text-zinc-200 hover:text-orange-600 dark:hover:text-white px-2 py-1.5 transition-colors items-center gap-1"
              >
                <LogIn className="w-4 h-4" /> Masuk
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center gap-1 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all shadow-sm shrink-0"
              >
                <span>Mulai</span>
                <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </Link>
            </>
          )}

          {/* Mobile Menu Hamburger Toggle */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-1.5 sm:p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 lg:hidden transition-colors shrink-0"
            aria-label="Toggle Mobile Menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden animate-in fade-in">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setIsMobileMenuOpen(false)} />
          <div className="fixed top-16 right-0 bottom-0 w-72 bg-white dark:bg-[#09090b] border-l border-zinc-200 dark:border-zinc-800 p-6 shadow-2xl z-50 flex flex-col justify-between overflow-y-auto space-y-6 animate-in slide-in-from-right">
            <div className="space-y-4">
              <div className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider border-b border-zinc-100 dark:border-zinc-800 pb-2">
                Navigasi Platform
              </div>
              <div className="space-y-2 text-sm font-medium text-zinc-800 dark:text-zinc-200">
                <a
                  href="#how-it-works"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block p-2.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
                >
                  Cara Kerja
                </a>
                <a
                  href="#features"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block p-2.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
                >
                  Fitur Utama
                </a>
                <a
                  href="#faq"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block p-2.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
                >
                  FAQ
                </a>
                <a
                  href="https://tako.id/BAGJA"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-2 p-2.5 rounded-lg bg-orange-50 dark:bg-orange-950/40 text-orange-900 dark:text-orange-300 font-semibold border border-orange-200/80 dark:border-orange-900/60"
                >
                  <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
                  <span>Dukung CVKita ☕</span>
                </a>
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
              {!isAuthenticated && (
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-1.5 p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
                  >
                    <LogIn className="w-4 h-4" /> Masuk
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-1.5 p-2.5 rounded-lg bg-gradient-to-r from-orange-600 to-red-600 text-white text-xs font-semibold shadow-xs"
                  >
                    Daftar ↗
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative pt-12 sm:pt-16 pb-20 px-4 sm:px-8 lg:px-12 overflow-hidden flex-1 z-10">
        <div className="max-w-5xl mx-auto text-center space-y-6 sm:space-y-8">
          {/* Trust Badge Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-100 dark:bg-orange-950/80 border border-orange-200 dark:border-orange-900 text-xs text-orange-900 dark:text-orange-200 font-semibold backdrop-blur-sm shadow-xs animate-in fade-in duration-700">
            <ShieldCheck className="w-4 h-4 text-orange-600 dark:text-orange-400" />
            <span>Platform Karir Universal • Bebas Rekayasa AI • Cocok untuk Semua Profesi</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-zinc-900 dark:text-white leading-[1.15]">
            Build your career profile once.{" "}
            <span className="block bg-clip-text text-transparent bg-gradient-to-r from-orange-600 via-amber-600 to-red-600 dark:from-white dark:via-orange-300 dark:to-red-400 mt-1">
              Generate the right resume for every opportunity.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="max-w-3xl mx-auto text-base sm:text-lg text-zinc-600 dark:text-zinc-300 leading-relaxed">
            Satu tempat untuk membangun profil karir Anda secara lengkap. Impor CV lama, buat resume yang ramah sistem ATS, temukan lowongan kerja terbaru, dan susun Cover Letter profesional untuk berbagai bidang pekerjaan.
          </p>

          {/* Hero CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link
              href={isAuthenticated ? "/dashboard/documents" : "/login?redirectTo=/dashboard/documents"}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white px-8 py-4 rounded-xl text-base font-bold transition-all shadow-md hover:shadow-xl group"
            >
              <UploadCloud className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
              <span>Upload My CV</span>
            </Link>
            <Link
              href={isAuthenticated ? "/dashboard/profile" : "/login?redirectTo=/dashboard/profile"}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white dark:bg-zinc-900 hover:bg-orange-50 dark:hover:bg-zinc-800 text-orange-950 dark:text-white border border-orange-200 dark:border-zinc-800 px-8 py-4 rounded-xl text-base font-semibold transition-all shadow-xs"
            >
              <span>Start From Scratch</span>
              <ArrowRight className="w-4 h-4 text-orange-600 dark:text-orange-400" />
            </Link>
          </div>

          {/* Guarantee Badges */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs font-mono text-[#727976] dark:text-[#8c9390]">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-orange-600 dark:text-orange-400" />
              <span>Real-Time Job Matches & Direct Links</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-orange-600 dark:text-orange-400" />
              <span>Deterministic PDF Engine</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-orange-600 dark:text-orange-400" />
              <span>Strict Zero AI Fabrication</span>
            </div>
          </div>
        </div>

        {/* Live Interactive Product Preview Widget */}
        <div id="how-it-works" className="max-w-5xl mx-auto mt-14 bg-white dark:bg-[#161c1a] rounded-2xl border border-[#e1e3e2] dark:border-[#2a3431] shadow-2xl overflow-hidden">
          {/* Header Controls */}
          <div className="px-6 py-4 bg-[#f8faf9] dark:bg-[#1b2220] border-b border-[#e1e3e2] dark:border-[#2a3431] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-amber-400" />
              <div className="w-3 h-3 rounded-full bg-orange-400" />
              <span className="text-xs font-mono font-bold text-[#191c1c] dark:text-white ml-2">
                CVKita Engine Studio — Real-time Demo
              </span>
            </div>

            {/* Interactive Tabs */}
            <div className="flex items-center gap-1 bg-[#e1e3e2]/60 dark:bg-[#121816] p-1 rounded-lg text-xs font-medium w-full sm:w-auto">
              <button
                onClick={() => setActiveTab("simulator")}
                className={`flex-1 sm:flex-initial px-3 py-1 rounded-md transition-colors ${
                  activeTab === "simulator"
                    ? "bg-white dark:bg-[#1b2220] text-orange-950 dark:text-orange-300 font-bold shadow-xs"
                    : "text-[#727976] dark:text-[#8c9390] hover:text-[#191c1c]"
                }`}
              >
                1. Single Source Profile
              </button>
              <button
                onClick={() => setActiveTab("ats")}
                className={`flex-1 sm:flex-initial px-3 py-1 rounded-md transition-colors ${
                  activeTab === "ats"
                    ? "bg-white dark:bg-[#1b2220] text-orange-950 dark:text-orange-300 font-bold shadow-xs"
                    : "text-[#727976] dark:text-[#8c9390] hover:text-[#191c1c]"
                }`}
              >
                2. Real-Time Job Matches
              </button>
              <button
                onClick={() => setActiveTab("vault")}
                className={`flex-1 sm:flex-initial px-3 py-1 rounded-md transition-colors ${
                  activeTab === "vault"
                    ? "bg-white dark:bg-[#1b2220] text-orange-950 dark:text-orange-300 font-bold shadow-xs"
                    : "text-[#727976] dark:text-[#8c9390] hover:text-[#191c1c]"
                }`}
              >
                3. Cover Letter & Fact Vault
              </button>
            </div>
          </div>

          {/* Tab Content Display */}
          <div className="p-6 sm:p-8 space-y-6">
            {activeTab === "simulator" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                <div className="lg:col-span-5 space-y-4">
                  <div className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-orange-950 dark:text-orange-400 bg-orange-100 dark:bg-orange-950/60 px-2.5 py-1 rounded-md">
                    <Layers className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" /> MASTER CAREER PROFILE
                  </div>
                  <h3 className="text-xl font-bold text-[#191c1c] dark:text-white">
                    Simpan Sekali, Gunakan di Berbagai Versi CV
                  </h3>
                  <p className="text-xs text-[#4c6079] dark:text-[#9ea8a3] leading-relaxed">
                    Data pengalaman kerja, proyek, pendidikan, dan sertifikasi disimpan secara terpusat di Career Profile. Anda tinggal memilih item mana yang ingin dihubungkan ke masing-masing versi CV target secara presisi.
                  </p>
                  <div className="space-y-2 pt-2 text-xs font-mono">
                    <div className="p-2.5 rounded-lg border border-[#e1e3e2] dark:border-[#2a3431] bg-[#f8faf9] dark:bg-[#121816] flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <Briefcase className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" /> Lead Engineer @ Tokopedia
                      </span>
                      <span className="text-[10px] bg-orange-100 dark:bg-orange-950 text-orange-950 dark:text-orange-300 px-2 py-0.5 rounded font-bold">2 CV Target</span>
                    </div>
                    <div className="p-2.5 rounded-lg border border-[#e1e3e2] dark:border-[#2a3431] bg-[#f8faf9] dark:bg-[#121816] flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <Cpu className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" /> Next.js & TypeScript
                      </span>
                      <span className="text-[10px] bg-orange-100 dark:bg-orange-950 text-orange-950 dark:text-orange-300 px-2 py-0.5 rounded font-bold">Semua CV</span>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-7 bg-[#f8faf9] dark:bg-[#121816] p-6 rounded-xl border border-[#e1e3e2] dark:border-[#2a3431] space-y-4">
                  <div className="flex items-center justify-between border-b border-[#edeeee] dark:border-[#242c2a] pb-3">
                    <span className="text-xs font-mono font-bold text-[#191c1c] dark:text-white flex items-center gap-2">
                      <FileText className="w-4 h-4 text-orange-600 dark:text-orange-400" /> Preview Hasil Resume (A4 Paper Canvas)
                    </span>
                    <span className="text-[10px] font-mono text-orange-700 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/50 px-2 py-0.5 rounded border border-orange-200 dark:border-orange-800">
                      Deterministic PDF Render
                    </span>
                  </div>
                  <div className="bg-white text-[#191c1c] p-5 rounded-lg border border-[#e1e3e2] shadow-sm space-y-3 font-sans text-xs">
                    <div className="border-b border-[#191c1c] pb-2">
                      <h4 className="text-base font-bold uppercase tracking-wider text-[#191c1c]">JANE DOE</h4>
                      <p className="text-[10px] text-[#4c6079]">Senior Frontend Engineer • jane@example.com • Jakarta, Indonesia</p>
                    </div>
                    <div className="space-y-1">
                      <h5 className="font-bold uppercase text-[10px] border-b border-gray-300 pb-0.5">PENGALAMAN KERJA</h5>
                      <p className="font-bold">Lead Engineer — Tokopedia <span className="font-normal text-[10px] text-gray-500">(2021 - Present)</span></p>
                      <ul className="list-disc list-inside text-[11px] text-gray-700 space-y-0.5">
                        <li>Mengarsitekturi Next.js 14 micro-frontend yang menurunkan bundle size sebesar 38%.</li>
                        <li>Mengoptimalkan performa rendering hingga p95 latency mencapai 92ms.</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "ats" && (
              <div id="job-matches" className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                <div className="lg:col-span-5 space-y-4">
                  <div className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-orange-950 dark:text-orange-400 bg-orange-100 dark:bg-orange-950/60 px-2.5 py-1 rounded-md">
                    <Globe className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" /> REAL-TIME JOB MATCHES & RECRUITMENT LINKS
                  </div>
                  <h3 className="text-xl font-bold text-[#191c1c] dark:text-white">
                    Pencocokan Lowongan Real-Time & Direct Link Rekrutmen
                  </h3>
                  <p className="text-xs text-[#4c6079] dark:text-[#9ea8a3] leading-relaxed">
                    CVKita menganalisis data profil & resume Anda untuk merekomendasikan lowongan aktif di portal rekrutmen utama (LinkedIn, JobStreet, Glints) lengkap dengan tombol menuju situs pendaftaran resmi.
                  </p>
                  <div className="p-4 rounded-xl bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-800 space-y-2">
                    <div className="flex justify-between items-center text-xs font-bold text-orange-900 dark:text-orange-300">
                      <span>Live Realtime ATS Match Score</span>
                      <span className="text-lg">94%</span>
                    </div>
                    <div className="w-full bg-orange-200 dark:bg-orange-950 h-2 rounded-full overflow-hidden">
                      <div className="bg-orange-600 dark:bg-orange-400 h-full w-[94%]" />
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-7 bg-[#f8faf9] dark:bg-[#121816] p-6 rounded-xl border border-[#e1e3e2] dark:border-[#2a3431] space-y-3 text-xs">
                  <h4 className="font-bold text-[#191c1c] dark:text-white flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-orange-600 dark:text-orange-400" /> Lowongan Aktif Terhubungkan:
                    </span>
                    <span className="text-[10px] font-mono bg-orange-100 dark:bg-orange-950 text-orange-950 dark:text-orange-300 px-2 py-0.5 rounded font-bold">Real-time Portal</span>
                  </h4>
                  <div className="grid grid-cols-1 gap-2">
                    {[
                      { title: "Senior Frontend Engineer", company: "Tokopedia", location: "Jakarta (Hybrid)", score: "94% MATCH", portal: "LinkedIn" },
                      { title: "Fullstack React Developer", company: "Gojek / GoTo", location: "Jakarta (Remote)", score: "91% MATCH", portal: "Kalibrr" },
                    ].map((item) => (
                      <div key={item.title} className="p-3 bg-white dark:bg-[#1b2220] rounded-xl border border-[#e1e3e2] dark:border-[#242c2a] flex items-center justify-between">
                        <div>
                          <span className="font-bold text-[#191c1c] dark:text-white block">{item.title}</span>
                          <span className="text-[11px] text-[#727976] dark:text-[#8c9390]">{item.company} • {item.location}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-orange-950 dark:text-orange-300 font-mono font-bold bg-orange-100 dark:bg-orange-950/60 px-2 py-1 rounded border border-orange-200 dark:border-orange-900">
                            {item.score}
                          </span>
                          <span className="text-[10px] font-bold text-white bg-orange-600 dark:bg-orange-500 dark:text-zinc-950 px-2.5 py-1 rounded-lg hover:bg-orange-700 transition-colors">
                            Website Rekrutmen ↗
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "vault" && (
              <div id="cover-letter" className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                <div className="lg:col-span-5 space-y-4">
                  <div className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-orange-950 dark:text-orange-400 bg-orange-100 dark:bg-orange-950/60 px-2.5 py-1 rounded-md">
                    <ShieldCheck className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" /> ZERO FABRICATION & COVER LETTER AI
                  </div>
                  <h3 className="text-xl font-bold text-[#191c1c] dark:text-white">
                    Cover Letter AI & Validasi Dokumen Fact-Vault
                  </h3>
                  <p className="text-xs text-[#4c6079] dark:text-[#9ea8a3] leading-relaxed">
                    Buat Surat Lamaran Kerja (Cover Letter) profesional secara otomatis berdasarkan fakta riwayat karir asli Anda tanpa fabrikasi AI, dilengkapi audit trail dokumen `sourceId`.
                  </p>
                </div>

                <div className="lg:col-span-7 bg-[#f8faf9] dark:bg-[#121816] p-6 rounded-xl border border-[#e1e3e2] dark:border-[#2a3431] space-y-3 text-xs">
                  <div className="p-4 bg-white dark:bg-[#1b2220] rounded-xl border border-orange-300 dark:border-orange-800 space-y-2">
                    <div className="flex items-center justify-between border-b border-[#edeeee] dark:border-[#242c2a] pb-2">
                      <span className="font-bold text-[#191c1c] dark:text-white flex items-center gap-1.5">
                        <Zap className="w-4 h-4 text-orange-600 dark:text-orange-400" /> Generated Executive Cover Letter
                      </span>
                      <span className="text-[10px] bg-orange-100 dark:bg-orange-950 text-orange-800 dark:text-orange-300 px-2 py-0.5 rounded font-mono font-bold">100% Fact-Checked</span>
                    </div>
                    <p className="text-[#444746] dark:text-[#a0a3a2] text-[11px] leading-relaxed italic">
                      "Dengan latar belakang Senior Frontend Engineer di Tokopedia dan keahlian Next.js & TypeScript, saya yakin dapat memberikan kontribusi langsung pada tim engineering Anda..."
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Feature Cards Grid Section */}
        <div id="features" className="max-w-6xl mx-auto mt-24 space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Fitur Utama Platform CVKita
            </h2>
            <p className="text-sm sm:text-base text-[#4c6079] dark:text-[#9ea8a3] max-w-2xl mx-auto">
              Solusi karir modern terstruktur untuk pengelolaan profil, pencarian lowongan real-time, dan pembuatan CV/Cover Letter bebas fabrikasi.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-[#1b2220] p-7 rounded-2xl border border-[#e1e3e2] dark:border-[#2a3431] shadow-xs hover:shadow-md transition-all space-y-3 group">
              <div className="w-12 h-12 rounded-xl bg-orange-100 dark:bg-orange-950 text-orange-600 dark:text-orange-400 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Single Source of Truth</h3>
              <p className="text-sm text-[#4c6079] dark:text-[#9ea8a3] leading-relaxed">
                Career Profile Anda bersifat permanen. Cukup impor riwayat pendidikan, sertifikat, atau pengalaman sekali, lalu pilih item untuk setiap versi resume target.
              </p>
            </div>

            <div className="bg-white dark:bg-[#1b2220] p-7 rounded-2xl border border-[#e1e3e2] dark:border-[#2a3431] shadow-xs hover:shadow-md transition-all space-y-3 group">
              <div className="w-12 h-12 rounded-xl bg-orange-100 dark:bg-orange-950 text-orange-600 dark:text-orange-400 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Zero AI Fabrication Guarantee</h3>
              <p className="text-sm text-[#4c6079] dark:text-[#9ea8a3] leading-relaxed">
                Prinsip ketat anti-rekayasa. AI CVKita dilarang keras mengarang nama perusahaan, keahlian palsu, atau angka yang tidak ada pada dokumen pendukung Anda.
              </p>
            </div>

            <div className="bg-white dark:bg-[#1b2220] p-7 rounded-2xl border border-[#e1e3e2] dark:border-[#2a3431] shadow-xs hover:shadow-md transition-all space-y-3 group">
              <div className="w-12 h-12 rounded-xl bg-orange-100 dark:bg-orange-950 text-orange-600 dark:text-orange-400 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <Globe className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Real-Time Job Matches</h3>
              <p className="text-sm text-[#4c6079] dark:text-[#9ea8a3] leading-relaxed">
                Temukan lowongan kerja terupdate secara real-time yang cocok dengan kualifikasi Anda, lengkap dengan tombol langsung ke portal rekrutmen resmi.
              </p>
            </div>

            <div className="bg-white dark:bg-[#1b2220] p-7 rounded-2xl border border-[#e1e3e2] dark:border-[#2a3431] shadow-xs hover:shadow-md transition-all space-y-3 group">
              <div className="w-12 h-12 rounded-xl bg-orange-100 dark:bg-orange-950 text-orange-600 dark:text-orange-400 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">AI Cover Letter Generator</h3>
              <p className="text-sm text-[#4c6079] dark:text-[#9ea8a3] leading-relaxed">
                Hasil pembuatan Surat Lamaran Kerja terstruktur yang disesuaikan dengan posisi target dan hanya mengambil poin pengalaman terbukti pengguna.
              </p>
            </div>

            <div className="bg-white dark:bg-[#1b2220] p-7 rounded-2xl border border-[#e1e3e2] dark:border-[#2a3431] shadow-xs hover:shadow-md transition-all space-y-3 group">
              <div className="w-12 h-12 rounded-xl bg-orange-100 dark:bg-orange-950 text-orange-600 dark:text-orange-400 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <Target className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Precision ATS Inspector</h3>
              <p className="text-sm text-[#4c6079] dark:text-[#9ea8a3] leading-relaxed">
                Evaluasi kecocokan kata kunci resume dengan deskripsi pekerjaan target, skor kompatibilitas ATS 0-100%, serta rekomendasi perbaikan struktur.
              </p>
            </div>

            <div className="bg-white dark:bg-[#1b2220] p-7 rounded-2xl border border-[#e1e3e2] dark:border-[#2a3431] shadow-xs hover:shadow-md transition-all space-y-3 group">
              <div className="w-12 h-12 rounded-xl bg-orange-100 dark:bg-orange-950 text-orange-600 dark:text-orange-400 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Multi-Tenant Data Privacy</h3>
              <p className="text-sm text-[#4c6079] dark:text-[#9ea8a3] leading-relaxed">
                Isolasi data pengguna 100% di tingkat database Prisma & LocalStorage. Dukungan Gemini 1.5, OpenAI GPT-4o-mini, dan Internal Heuristic Engine.
              </p>
            </div>
          </div>
        </div>

        {/* FAQ Accordion Section */}
        <div id="faq" className="max-w-4xl mx-auto mt-28 space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">Pertanyaan Umum (FAQ)</h2>
            <p className="text-sm text-[#4c6079] dark:text-[#9ea8a3]">
              Informasi lengkap seputar fitur & platform CVKita.
            </p>
          </div>

          <div className="space-y-3">
            {[
              {
                q: "Apakah CVKita benar-benar 100% gratis?",
                a: "Ya! CVKita dirancang sebagai platform pembuatan profile karir dan CV tanpa biaya berlangganan tersembunyi.",
              },
              {
                q: "Bagaimana fitur Real-Time Job Matches bekerja?",
                a: "Sistem merekomendasikan lowongan aktif dari portal rekrutmen utama secara real-time yang sesuai dengan kualifikasi profil Anda, lengkap dengan tombol langsung ke situs resmi rekrutmen.",
              },
              {
                q: "Bagaimana jaminan Zero AI Fabrication bekerja?",
                a: "Sistem AI CVKita bekerja berdasarkan pipa validasi fakta. Setiap klaim (pengalaman, tanggal, sertifikasi) harus mereferensikan sumber dokumen yang valid (sourceIds). AI dilarang keras mengarang informasi palsu.",
              },
              {
                q: "Apakah data akun saya terisolasi dari pengguna lain?",
                a: "Ya! Setiap akun memiliki isolasi data 100% di tingkat database PostgreSQL dan browser local storage. Data akun Anda tidak akan pernah bocor atau muncul di akun lain.",
              },
              {
                q: "Bagaimana sistem ekspor PDF CVKita bekerja?",
                a: "CVKita menggunakan renderer deterministik berbasis HTML/CSS ke Headless Chromium untuk menghasilkan file PDF standar A4 yang dapat dibaca sempurna oleh sistem ATS.",
              },
            ].map((faq, idx) => (
              <div
                key={faq.q}
                className="bg-white dark:bg-[#1b2220] border border-[#e1e3e2] dark:border-[#2a3431] rounded-xl overflow-hidden transition-colors"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(idx)}
                  className="w-full p-5 text-left font-bold text-sm text-[#191c1c] dark:text-white flex items-center justify-between gap-4"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-[#727976] transition-transform ${
                      openFaq === idx ? "rotate-180 text-orange-600 dark:text-orange-400" : ""
                    }`}
                  />
                </button>
                {openFaq === idx && (
                  <div className="px-5 pb-5 pt-0 text-xs text-[#4c6079] dark:text-[#9ea8a3] leading-relaxed border-t border-[#f2f4f3] dark:border-[#242c2a] mt-1 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* CTA Bottom Banner */}
        <div className="max-w-5xl mx-auto mt-24 bg-gradient-to-r from-orange-600 via-amber-600 to-red-600 dark:from-orange-950 dark:via-amber-950 dark:to-red-950 text-white p-8 sm:p-12 rounded-3xl text-center space-y-6 shadow-xl relative overflow-hidden">
          <div className="relative z-10 space-y-4">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Siap Membangun Career Profile & CV Terbaik Anda?
            </h2>
            <p className="text-sm sm:text-base text-orange-100 max-w-xl mx-auto">
              Unggah CV Anda saat ini atau buat profil karir dari awal hanya dalam hitungan menit.
            </p>
            <div className="pt-2">
              <Link
                href={isAuthenticated ? "/dashboard/resumes/new" : "/register"}
                className="inline-flex items-center gap-2 bg-white hover:bg-orange-50 text-orange-950 font-bold px-8 py-4 rounded-xl text-base transition-all shadow-md hover:shadow-lg"
              >
                <span>Buat CV Pertama Sekarang</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#e1e3e2] dark:border-[#242c2a] bg-white dark:bg-[#0b0f0e] pt-16 pb-12 px-6 lg:px-16 text-xs text-[#727976] dark:text-[#8c9390] transition-colors">
        <div className="max-w-7xl mx-auto space-y-12">
          {/* Main Footer Columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
            {/* Column 1: Brand & Mission (Spans 2 cols) */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center gap-3">
                <img
                  src="/logo.png"
                  alt="CVKita Logo"
                  className="w-auto h-8 object-contain shrink-0"
                />
                <span className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                  CVKita
                  <span className="text-[10px] font-mono font-semibold px-2.5 py-0.5 rounded-full bg-orange-100 dark:bg-orange-950 text-orange-900 dark:text-orange-400 border border-orange-200 dark:border-orange-900">
                    v1.0 AI Platform
                  </span>
                </span>
              </div>

              <p className="text-xs text-[#4c6079] dark:text-[#9ea8a3] leading-relaxed max-w-sm">
                Platform karir terstruktur sebagai sumber kebenaran tunggal (*Single Source of Truth*). Ekstrak dokumen CV, tailorkan resume standar ATS, dan temukan lowongan kerja real-time tanpa rekayasa AI.
              </p>

              <div className="flex flex-wrap items-center gap-2 pt-1 font-mono text-[10.5px]">
                <span className="px-2.5 py-1 rounded-md bg-[#f8faf9] dark:bg-[#151a18] border border-[#e1e3e2] dark:border-[#242c2a] text-orange-950 dark:text-orange-300 font-semibold flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" /> Zero AI Fabrication
                </span>
                <span className="px-2.5 py-1 rounded-md bg-[#f8faf9] dark:bg-[#151a18] border border-[#e1e3e2] dark:border-[#242c2a] text-orange-950 dark:text-orange-300 font-semibold flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" /> 100% Multi-Tenant Isolation
                </span>
              </div>
            </div>

            {/* Column 2: Produk & Fitur */}
            <div className="space-y-3">
              <h4 className="font-mono font-bold text-xs uppercase tracking-wider text-[#191c1c] dark:text-white">
                Fitur Utama
              </h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <Link href="/dashboard/profile" className="hover:text-orange-600 transition-colors">
                    Career Profile Master
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard/jobs" className="hover:text-orange-600 transition-colors">
                    Real-Time Job Matches
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard/cover-letter" className="hover:text-orange-600 transition-colors">
                    Cover Letter AI Generator
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard/resumes" className="hover:text-orange-600 transition-colors">
                    ATS Precision Inspector
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard/documents" className="hover:text-orange-600 transition-colors">
                    Fact Vault Extraction
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3: Solusi & Standar */}
            <div className="space-y-3">
              <h4 className="font-mono font-bold text-xs uppercase tracking-wider text-[#191c1c] dark:text-white">
                Solusi & Standar
              </h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <span className="text-[#727976] dark:text-[#8c9390]">Deterministic A4 PDF Render</span>
                </li>
                <li>
                  <span className="text-[#727976] dark:text-[#8c9390]">Smart PDF & Certificate Parser</span>
                </li>
                <li>
                  <span className="text-[#727976] dark:text-[#8c9390]">Gemini 1.5 & OpenAI Support</span>
                </li>
                <li>
                  <span className="text-[#727976] dark:text-[#8c9390]">Offline Heuristic Engine</span>
                </li>
                <li>
                  <span className="text-[#727976] dark:text-[#8c9390]">Portabilitas Backup Profil JSON</span>
                </li>
              </ul>
            </div>

            {/* Column 4: Privasi & Keamanan */}
            <div className="space-y-3">
              <h4 className="font-mono font-bold text-xs uppercase tracking-wider text-[#191c1c] dark:text-white">
                Keamanan & Privasi
              </h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <span className="text-[#727976] dark:text-[#8c9390]">Isolasi PostgreSQL Prisma</span>
                </li>
                <li>
                  <span className="text-[#727976] dark:text-[#8c9390]">Penyimpanan API Key Lokal</span>
                </li>
                <li>
                  <span className="text-[#727976] dark:text-[#8c9390]">Audit Trail Source Document</span>
                </li>
                <li>
                  <span className="text-[#727976] dark:text-[#8c9390]">Verifikasi Kredensial Bebas Leak</span>
                </li>
                <li>
                  <span className="text-[#727976] dark:text-[#8c9390]">Jaminan Privasi Pengguna</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar Separator */}
          <div className="pt-8 border-t border-[#e1e3e2] dark:border-[#242c2a] flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-[11px] text-[#727976] dark:text-[#8c9390]">
              © {new Date().getFullYear()} <strong>CVKita Platform</strong>. Hak Cipta Dilindungi. Platform Pembuatan Profile Karir & Tailoring Resume ATS Terstruktur.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

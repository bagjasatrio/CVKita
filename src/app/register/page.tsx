"use client";

import { useState } from "react";
import Link from "next/link";
import { Sparkles, ShieldCheck, ArrowRight, Github, Chrome, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export default function RegisterPage() {
  const { register, loginWithOAuth } = useAuth();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<"Google" | "GitHub" | null>(null);
  const [isUnlocked, setIsUnlocked] = useState(false);

  // OAuth Modal States
  const [showOAuthModal, setShowOAuthModal] = useState(false);
  const [oauthProvider, setOauthProvider] = useState<"Google" | "GitHub">("Google");
  const [oauthEmail, setOauthEmail] = useState("");
  const [oauthName, setOauthName] = useState("");

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreedTerms || !email.trim()) return;
    setIsLoading(true);
    setErrorMessage(null);
    try {
      await register(fullName, email, password);
    } catch (err: any) {
      setErrorMessage(err?.message || "Registrasi gagal. Silakan periksa kembali data Anda.");
      setIsLoading(false);
    }
  };

  const handleDirectOAuth = async (provider: "Google" | "GitHub") => {
    setOauthLoading(provider);
    setIsLoading(true);
    setErrorMessage(null);
    try {
      await loginWithOAuth(provider === "Google" ? "google" : "github", undefined, undefined, "/dashboard");
    } catch (err: any) {
      setErrorMessage(err?.message || `Gagal registrasi dengan ${provider}.`);
      setIsLoading(false);
      setOauthLoading(null);
    }
  };

  const handleOAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!oauthEmail.trim()) return;
    setIsLoading(true);
    setShowOAuthModal(false);
    try {
      await loginWithOAuth(
        oauthProvider === "Google" ? "google" : "github",
        oauthEmail.trim(),
        oauthName.trim(),
        "/dashboard"
      );
    } catch (err: any) {
      setErrorMessage(err?.message || `Gagal registrasi dengan ${oauthProvider}.`);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 flex items-center justify-center p-4">
      {/* Container Card */}
      <div className="max-w-md w-full bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-8 shadow-xl space-y-6 relative">
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2 text-xl font-bold font-mono text-orange-600 dark:text-orange-400">
            <img
              src="/logo.png"
              alt="CVKita Logo"
              className="w-9 h-9 rounded-xl object-contain shrink-0"
            />
            CVKita
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-zinc-100 tracking-tight">Create Your Account</h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            Start building your single source-of-truth Career Profile today.
          </p>
        </div>

        {/* OAuth Social Login Buttons */}
        <div className="space-y-2.5">
          <button
            type="button"
            disabled={isLoading}
            onClick={() => handleDirectOAuth("Google")}
            className="w-full py-2.5 px-4 bg-slate-50 dark:bg-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-700 border border-slate-200 dark:border-zinc-700 text-slate-800 dark:text-zinc-200 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {oauthLoading === "Google" ? (
              <>
                <Sparkles className="w-4 h-4 animate-spin text-orange-600 dark:text-orange-400" />
                <span>Connecting to Google...</span>
              </>
            ) : (
              <>
                <Chrome className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                <span>Sign Up with Google</span>
              </>
            )}
          </button>
          <button
            type="button"
            disabled={isLoading}
            onClick={() => handleDirectOAuth("GitHub")}
            className="w-full py-2.5 px-4 bg-slate-50 dark:bg-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-700 border border-slate-200 dark:border-zinc-700 text-slate-800 dark:text-zinc-200 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {oauthLoading === "GitHub" ? (
              <>
                <Sparkles className="w-4 h-4 animate-spin text-slate-800 dark:text-zinc-200" />
                <span>Connecting to GitHub...</span>
              </>
            ) : (
              <>
                <Github className="w-4 h-4 text-slate-800 dark:text-zinc-200" />
                <span>Sign Up with GitHub</span>
              </>
            )}
          </button>
        </div>

        <div className="relative flex items-center justify-center">
          <div className="w-full border-t border-slate-200 dark:border-zinc-800"></div>
          <span className="absolute bg-white dark:bg-zinc-900 px-3 text-[11px] font-mono text-slate-400 dark:text-zinc-500 uppercase">or with email</span>
        </div>

        {/* Register Form */}
        <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 text-xs font-semibold text-red-600 dark:text-red-300">
              {errorMessage}
            </div>
          )}
          <div className="space-y-1">
            <label className="text-xs font-mono font-semibold text-slate-800 dark:text-zinc-200">Full Name *</label>
            <input
              type="text"
              name={isUnlocked ? "name" : "no_autofill_name"}
              required
              autoComplete={isUnlocked ? "name" : "off"}
              readOnly={!isUnlocked}
              onFocus={() => setIsUnlocked(true)}
              onClick={() => setIsUnlocked(true)}
              onMouseDown={() => setIsUnlocked(true)}
              placeholder="Nama Lengkap Anda"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs border border-slate-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 dark:focus:ring-orange-500 bg-white dark:bg-zinc-950 text-slate-900 dark:text-zinc-100"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-mono font-semibold text-slate-800 dark:text-zinc-200">Email Address *</label>
            <input
              type={isUnlocked ? "email" : "text"}
              name={isUnlocked ? "email" : "no_autofill_email"}
              required
              autoComplete={isUnlocked ? "email" : "off"}
              readOnly={!isUnlocked}
              onFocus={() => setIsUnlocked(true)}
              onClick={() => setIsUnlocked(true)}
              onMouseDown={() => setIsUnlocked(true)}
              placeholder="nama@domain.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs border border-slate-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 dark:focus:ring-orange-500 bg-white dark:bg-zinc-950 text-slate-900 dark:text-zinc-100"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-mono font-semibold text-slate-800 dark:text-zinc-200">Password *</label>
            <div className="relative">
              <input
                type={isUnlocked ? (showPassword ? "text" : "password") : "text"}
                name={isUnlocked ? "password" : "no_autofill_password"}
                required
                autoComplete={isUnlocked ? "new-password" : "off"}
                readOnly={!isUnlocked}
                onFocus={() => setIsUnlocked(true)}
                onClick={() => setIsUnlocked(true)}
                onMouseDown={() => setIsUnlocked(true)}
                placeholder="Minimum 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 pr-10 text-xs border border-slate-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 dark:focus:ring-orange-500 bg-white dark:bg-zinc-950 text-slate-900 dark:text-zinc-100"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 transition-colors p-1"
                aria-label={showPassword ? "Hide password" : "Show password"}
                title={showPassword ? "Sembunyikan password" : "Tampilkan password"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-start gap-2 pt-1">
            <input
              type="checkbox"
              id="terms"
              required
              checked={agreedTerms}
              onChange={(e) => setAgreedTerms(e.target.checked)}
              className="mt-0.5 rounded text-orange-600 focus:ring-orange-500"
            />
            <label htmlFor="terms" className="text-xs text-slate-500 dark:text-zinc-400 leading-snug cursor-pointer">
              I agree to the <a href="#" className="text-orange-600 dark:text-orange-400 underline">Terms of Service</a> and <a href="#" className="text-orange-600 dark:text-orange-400 underline">Privacy Policy</a> (Zero-Fabrication Guarantee).
            </label>
          </div>

          <button
            type="submit"
            disabled={isLoading || !agreedTerms}
            className="w-full py-3 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white rounded-xl text-xs font-semibold transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Sparkles className="w-4 h-4 animate-spin" /> Creating Account...
              </>
            ) : (
              <>
                <span>Create Free Account</span>
                <ArrowRight className="w-4 h-4 text-orange-100" />
              </>
            )}
          </button>
        </form>

        {/* Interactive OAuth Account Modal */}
        {showOAuthModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in">
            <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 max-w-sm w-full space-y-4 border border-slate-200 dark:border-zinc-800 shadow-2xl relative text-left">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
                <div className="flex items-center gap-2">
                  {oauthProvider === "Google" ? (
                    <Chrome className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                  ) : (
                    <Github className="w-5 h-5 text-slate-800 dark:text-zinc-200" />
                  )}
                  <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
                    Daftar dengan Akun {oauthProvider}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowOAuthModal(false)}
                  className="text-slate-400 hover:text-slate-900 dark:hover:text-zinc-100 text-sm font-bold"
                >
                  ✕
                </button>
              </div>

              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Masukkan informasi akun {oauthProvider} Anda untuk mendaftar tanpa password:
              </p>

              <form onSubmit={handleOAuthSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="block font-medium text-slate-800 dark:text-zinc-200 mb-1">Email {oauthProvider} Anda *</label>
                  <input
                    type="email"
                    required
                    value={oauthEmail}
                    onChange={(e) => setOauthEmail(e.target.value)}
                    placeholder={oauthProvider === "Google" ? "nama.anda@gmail.com" : "username@github.com"}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-xs focus:outline-none focus:border-orange-500 text-slate-900 dark:text-zinc-100"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-800 dark:text-zinc-200 mb-1">Nama Lengkap Anda (Opsional)</label>
                  <input
                    type="text"
                    value={oauthName}
                    onChange={(e) => setOauthName(e.target.value)}
                    placeholder="Misal: Nama Lengkap Anda"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-xs focus:outline-none focus:border-orange-500 text-slate-900 dark:text-zinc-100"
                  />
                </div>

                <div className="pt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowOAuthModal(false)}
                    className="flex-1 py-2 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs font-semibold text-slate-600 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-800"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white rounded-xl text-xs font-bold transition-colors"
                  >
                    Lanjutkan Pendaftaran
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Footer Link */}
        <div className="text-center text-xs text-slate-500 dark:text-zinc-400 font-mono pt-2 border-t border-slate-100 dark:border-zinc-800">
          Already have an account?{" "}
          <Link href="/login" className="text-orange-600 dark:text-orange-400 font-bold hover:underline">
            Sign In
          </Link>
        </div>

        {/* Privacy Note */}
        <div className="flex items-center justify-center gap-1.5 text-[10px] font-mono text-slate-400 dark:text-zinc-500">
          <ShieldCheck className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" />
          <span>256-bit Encrypted • Zero Data Fabrication</span>
        </div>
      </div>
    </div>
  );
}

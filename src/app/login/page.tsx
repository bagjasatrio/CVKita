"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Sparkles, ShieldCheck, ArrowRight, Github, Chrome, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

function LoginForm() {
  const { login, register } = useAuth();
  const searchParams = useSearchParams();
  const redirectTo = searchParams?.get("redirectTo") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);

  // OAuth Modal States
  const [showOAuthModal, setShowOAuthModal] = useState(false);
  const [oauthProvider, setOauthProvider] = useState<"Google" | "GitHub">("Google");
  const [oauthEmail, setOauthEmail] = useState("");
  const [oauthName, setOauthName] = useState("");

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setIsLoading(true);
    setErrorMessage(null);
    try {
      await login(email, password, redirectTo);
    } catch (err: any) {
      setErrorMessage(err?.message || "Login gagal. Silakan periksa kembali email & password Anda.");
      setIsLoading(false);
    }
  };

  const handleOAuthClick = (provider: "Google" | "GitHub") => {
    setOauthProvider(provider);
    setShowOAuthModal(true);
  };

  const handleOAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!oauthEmail.trim()) return;
    setIsLoading(true);
    setShowOAuthModal(false);
    try {
      const nameFromEmail = oauthEmail.split("@")[0].replace(".", " ");
      const derivedName = nameFromEmail
        .split(" ")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");
      const userFullName = oauthName.trim() || derivedName || `${oauthProvider} User`;
      await register(userFullName, oauthEmail.trim(), "oauth-pass");
    } catch {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-8 shadow-xl space-y-6 relative">
      {/* Header Branding */}
      <div className="text-center space-y-2">
        <Link href="/" className="inline-flex items-center gap-2 text-xl font-bold font-mono text-orange-600 dark:text-orange-400">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 text-white flex items-center justify-center font-bold shadow-xs">
            CK
          </div>
          CVKita
        </Link>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-zinc-100 tracking-tight">Welcome Back</h1>
        <p className="text-xs text-slate-500 dark:text-zinc-400">
          Build your career profile once. Tailor every resume.
        </p>
      </div>

      {/* OAuth Social Login Buttons */}
      <div className="space-y-2.5">
        <button
          type="button"
          disabled={isLoading}
          onClick={() => handleOAuthClick("Google")}
          className="w-full py-2.5 px-4 bg-slate-50 dark:bg-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-700 border border-slate-200 dark:border-zinc-700 text-slate-800 dark:text-zinc-200 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <Chrome className="w-4 h-4 text-orange-600 dark:text-orange-400" /> Continue with Google
        </button>
        <button
          type="button"
          disabled={isLoading}
          onClick={() => handleOAuthClick("GitHub")}
          className="w-full py-2.5 px-4 bg-slate-50 dark:bg-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-700 border border-slate-200 dark:border-zinc-700 text-slate-800 dark:text-zinc-200 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <Github className="w-4 h-4 text-slate-800 dark:text-zinc-200" /> Continue with GitHub
        </button>
      </div>

      <div className="relative flex items-center justify-center">
        <div className="w-full border-t border-slate-200 dark:border-zinc-800"></div>
        <span className="absolute bg-white dark:bg-zinc-900 px-3 text-[11px] font-mono text-slate-400 dark:text-zinc-500 uppercase">or with email</span>
      </div>

      {/* Form Login */}
      <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
        {errorMessage && (
          <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 text-xs font-semibold text-red-600 dark:text-red-300">
            {errorMessage}
          </div>
        )}
        <div className="space-y-1">
          <label className="text-xs font-mono font-semibold text-slate-800 dark:text-zinc-200">Work or Personal Email</label>
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
          <div className="flex justify-between items-center">
            <label className="text-xs font-mono font-semibold text-slate-800 dark:text-zinc-200">Password</label>
            <Link href="/forgot-password" className="text-[11px] text-orange-600 dark:text-orange-400 hover:underline font-mono">
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <input
              type={isUnlocked ? (showPassword ? "text" : "password") : "text"}
              name={isUnlocked ? "password" : "no_autofill_password"}
              required
              autoComplete={isUnlocked ? "current-password" : "off"}
              readOnly={!isUnlocked}
              onFocus={() => setIsUnlocked(true)}
              onClick={() => setIsUnlocked(true)}
              onMouseDown={() => setIsUnlocked(true)}
              placeholder="••••••••••••"
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

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white rounded-xl text-xs font-semibold transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <Sparkles className="w-4 h-4 animate-spin" /> Authenticating...
            </>
          ) : (
            <>
              <span>Sign In to CVKita</span>
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
                  Login dengan Akun {oauthProvider}
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
              Masukkan informasi akun {oauthProvider} Anda untuk masuk tanpa password:
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
                  Lanjutkan Login
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer Link */}
      <div className="text-center text-xs text-slate-500 dark:text-zinc-400 font-mono pt-2 border-t border-slate-100 dark:border-zinc-800">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="text-orange-600 dark:text-orange-400 font-bold hover:underline">
          Create Account
        </Link>
      </div>

      {/* Privacy Note */}
      <div className="flex items-center justify-center gap-1.5 text-[10px] font-mono text-slate-400 dark:text-zinc-500">
        <ShieldCheck className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" />
        <span>256-bit Encrypted • Zero Data Fabrication</span>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 flex flex-col justify-center items-center p-4">
      <Suspense
        fallback={
          <div className="max-w-md w-full bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-8 text-center font-mono text-xs text-orange-600 dark:text-orange-400">
            Loading login form...
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </div>
  );
}

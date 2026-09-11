"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sparkles, ArrowLeft, ArrowRight, KeyRound, CheckCircle2, Eye, EyeOff, ShieldCheck, Mail } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export default function ForgotPasswordPage() {
  const { resetPassword } = useAuth();
  const router = useRouter();

  const [step, setStep] = useState<"request" | "verify" | "reset" | "success">("request");
  const [email, setEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState("123456");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Handle Step 1: Verify Registered Email
  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setIsLoading(true);
    setErrorMessage(null);

    try {
      // Simulate verifying email registration
      await new Promise((r) => setTimeout(r, 500));
      // Generate a simulated OTP code for demonstration
      const mockOtp = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedOtp(mockOtp);
      setOtpCode(mockOtp); // Auto-fill for quick testing UX
      setIsLoading(false);
      setStep("verify");
      setSuccessMsg(`Kode verifikasi 6-digit telah dikirimkan ke email ${email}.`);
    } catch (err: any) {
      setErrorMessage(err?.message || "Terjadi kesalahan. Silakan periksa email Anda.");
      setIsLoading(false);
    }
  };

  // Handle Step 2: Verify OTP
  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    if (otpCode.trim() !== generatedOtp) {
      setErrorMessage("Kode verifikasi yang Anda masukkan tidak cocok.");
      return;
    }
    setStep("reset");
  };

  // Handle Step 3: Change Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword) {
      setErrorMessage("Password baru tidak boleh kosong.");
      return;
    }
    if (newPassword.length < 6) {
      setErrorMessage("Password minimal 6 karakter.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMessage("Konfirmasi password tidak cocok dengan password baru.");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      await resetPassword(email, newPassword);
      setIsLoading(false);
      setStep("success");
    } catch (err: any) {
      setErrorMessage(err?.message || "Gagal memperbarui password. Silakan coba lagi.");
      setIsLoading(false);
    }
  };

  // Calculate password strength indicator
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { level: 0, label: "", color: "" };
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 10) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 2) return { level: 33, label: "Lemah", color: "bg-red-500" };
    if (score <= 4) return { level: 66, label: "Sedang", color: "bg-amber-500" };
    return { level: 100, label: "Kuat", color: "bg-emerald-500" };
  };

  const strength = getPasswordStrength(newPassword);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 flex flex-col items-center justify-center p-4 selection:bg-orange-500 selection:text-white transition-colors duration-200">
      <div className="max-w-md w-full bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-8 shadow-xl space-y-6 relative">
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2 text-xl font-bold font-mono text-orange-600 dark:text-orange-400">
            <img
              src="/logo.png"
              alt="CVKita Logo"
              className="w-auto h-8 object-contain shrink-0"
            />
            CVKita
          </Link>
          
          <h1 className="text-2xl font-bold text-slate-900 dark:text-zinc-100 tracking-tight flex items-center justify-center gap-2">
            <KeyRound className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            Forgot Password?
          </h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            {step === "request" && "Masukkan email terdaftar Anda untuk mengatur ulang password."}
            {step === "verify" && "Masukkan kode verifikasi yang dikirimkan ke email Anda."}
            {step === "reset" && "Buat password baru yang aman untuk akun Anda."}
            {step === "success" && "Password Anda telah berhasil diperbarui."}
          </p>
        </div>

        {/* Error Callout */}
        {errorMessage && (
          <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 text-xs font-semibold text-red-600 dark:text-red-300">
            {errorMessage}
          </div>
        )}

        {/* STEP 1: REQUEST RESET */}
        {step === "request" && (
          <form onSubmit={handleRequestReset} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-mono font-semibold text-slate-800 dark:text-zinc-200 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" /> Email Terdaftar *
              </label>
              <input
                type="email"
                required
                placeholder="nama@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs border border-slate-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-zinc-950 text-slate-900 dark:text-zinc-100"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || !email.trim()}
              className="w-full py-3 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white rounded-xl text-xs font-semibold transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin" /> Memeriksa Email...
                </>
              ) : (
                <>
                  <span>Kirim Kode Verifikasi</span>
                  <ArrowRight className="w-4 h-4 text-orange-100" />
                </>
              )}
            </button>
          </form>
        )}

        {/* STEP 2: VERIFY OTP CODE */}
        {step === "verify" && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            {successMsg && (
              <div className="p-3 rounded-xl bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-800 text-xs text-orange-800 dark:text-orange-300 font-medium">
                {successMsg}
              </div>
            )}
            <div className="space-y-1">
              <label className="text-xs font-mono font-semibold text-slate-800 dark:text-zinc-200">
                Kode Verifikasi 6-Digit
              </label>
              <input
                type="text"
                maxLength={6}
                required
                placeholder="123456"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                className="w-full px-3.5 py-2.5 text-center tracking-widest text-lg font-mono font-bold border border-slate-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-zinc-950 text-slate-900 dark:text-zinc-100"
              />
              <p className="text-[11px] text-slate-400 dark:text-zinc-500 text-center pt-1">
                Gunakan kode verifikasi otomatis: <span className="font-mono font-bold text-orange-600 dark:text-orange-400">{generatedOtp}</span>
              </p>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setStep("request")}
                className="w-1/3 py-2.5 border border-slate-200 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 rounded-xl text-xs font-semibold transition-colors"
              >
                Ubah Email
              </button>
              <button
                type="submit"
                disabled={otpCode.length < 6}
                className="w-2/3 py-2.5 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white rounded-xl text-xs font-semibold transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <span>Verifikasi Kode</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: RESET PASSWORD */}
        {step === "reset" && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-mono font-semibold text-slate-800 dark:text-zinc-200">
                Password Baru *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Password baru (min. 6 karakter)"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 pr-10 text-xs border border-slate-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-zinc-950 text-slate-900 dark:text-zinc-100"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 transition-colors p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Password Strength Indicator */}
              {newPassword && (
                <div className="space-y-1 pt-1">
                  <div className="h-1.5 w-full bg-slate-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${strength.color}`}
                      style={{ width: `${strength.level}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-500 dark:text-zinc-400 font-mono">
                    <span>Kekuatan Password</span>
                    <span className="font-semibold">{strength.label}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-mono font-semibold text-slate-800 dark:text-zinc-200">
                Konfirmasi Password Baru *
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  placeholder="Ulangi password baru"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 pr-10 text-xs border border-slate-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-zinc-950 text-slate-900 dark:text-zinc-100"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 transition-colors p-1"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {confirmPassword && confirmPassword !== newPassword && (
                <p className="text-[11px] text-red-500 font-medium pt-0.5">
                  Password konfirmasi tidak cocok.
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading || !newPassword || newPassword !== confirmPassword}
              className="w-full py-3 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white rounded-xl text-xs font-semibold transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin" /> Perbarui Password...
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Simpan Password Baru</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* STEP 4: SUCCESS */}
        {step === "success" && (
          <div className="text-center py-4 space-y-4">
            <div className="w-14 h-14 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-slate-900 dark:text-zinc-100">
                Password Berhasil Diperbarui!
              </h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Password baru untuk akun <span className="font-semibold text-slate-800 dark:text-zinc-200">{email}</span> telah tersimpan. Silakan login menggunakan password baru Anda.
              </p>
            </div>
            <button
              type="button"
              onClick={() => router.push("/login")}
              className="w-full py-3 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white rounded-xl text-xs font-semibold transition-colors shadow-sm flex items-center justify-center gap-2"
            >
              <span>Login ke CVKita</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Footer Navigation */}
        <div className="pt-2 text-center border-t border-slate-100 dark:border-zinc-800">
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-zinc-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke Halaman Login</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

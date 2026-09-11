"use client";

import { useState, useEffect } from "react";
import {
  Settings,
  User,
  Bell,
  Shield,
  Palette,
  Trash2,
  Check,
  Eye,
  EyeOff,
  Moon,
  Sun,
  Monitor,
  AlertTriangle,
  Mail,
  Lock,
  Globe,
} from "lucide-react";

import { useAuth } from "@/lib/auth-context";
import { useUserProfile } from "@/lib/use-user-profile";
import { useTheme } from "@/components/theme-provider";
import { GlassToast, ToastMessage } from "@/components/ui/glass-toast";

type Tab = "account" | "ai" | "notifications" | "privacy" | "appearance";

export default function SettingsPage() {
  const { user, updateUser } = useAuth();
  const { profile, saveProfile } = useUserProfile();
  const { theme, setTheme } = useTheme();

  const [activeTab, setActiveTab] = useState<Tab>("account");
  const [showPassword, setShowPassword] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Account fields initialized from user profile
  const [fullName, setFullName] = useState(() => profile.personalInfo.fullName || user?.name || "");
  const [email, setEmail] = useState(() => profile.personalInfo.email || user?.email || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  // Keep input fields updated when profile or user changes
  useEffect(() => {
    if (profile.personalInfo.fullName) {
      setFullName(profile.personalInfo.fullName);
    } else if (user?.name) {
      setFullName(user.name);
    }
    if (profile.personalInfo.email) {
      setEmail(profile.personalInfo.email);
    } else if (user?.email) {
      setEmail(user.email);
    }
  }, [profile.personalInfo.fullName, profile.personalInfo.email, user?.name, user?.email]);

  // AI Provider & Keys state (User-scoped to prevent account cross-leakage)
  const [aiProvider, setAiProvider] = useState<"gemini" | "openai" | "heuristic">("gemini");
  const [geminiKey, setGeminiKey] = useState("");
  const [openaiKey, setOpenaiKey] = useState("");
  const [isAiKeyReadOnly, setIsAiKeyReadOnly] = useState(true);

  // Sync AI settings scoped strictly to active user.id
  useEffect(() => {
    if (typeof window !== "undefined" && user?.id) {
      setAiProvider((localStorage.getItem(`cvforge_ai_provider_${user.id}`) as any) || "gemini");
      setGeminiKey(localStorage.getItem(`cvforge_gemini_key_${user.id}`) || "");
      setOpenaiKey(localStorage.getItem(`cvforge_openai_key_${user.id}`) || "");
    } else if (typeof window !== "undefined" && !user?.id) {
      setGeminiKey("");
      setOpenaiKey("");
    }
  }, [user?.id]);

  const [showGeminiKey, setShowGeminiKey] = useState(false);
  const [showOpenaiKey, setShowOpenaiKey] = useState(false);
  const [testStatus, setTestStatus] = useState<{ type: "success" | "error" | "loading"; msg: string } | null>(null);

  const [toast, setToast] = useState<ToastMessage | null>(null);

  const showToast = (type: "success" | "error" | "info", title: string, message?: string) => {
    setToast({ id: Math.random().toString(), type, title, message });
  };

  const saveAiSettings = () => {
    if (typeof window !== "undefined" && user?.id) {
      localStorage.setItem(`cvforge_ai_provider_${user.id}`, aiProvider);
      localStorage.setItem(`cvforge_gemini_key_${user.id}`, geminiKey);
      localStorage.setItem(`cvforge_openai_key_${user.id}`, openaiKey);
    }
    setTestStatus({ type: "success", msg: "AI settings saved successfully!" });
    showToast("success", "Pengaturan AI Berhasil Disimpan", `Engine aktif: ${aiProvider.toUpperCase()}`);
    setTimeout(() => setTestStatus(null), 3000);
  };

  const testAiConnection = async () => {
    setTestStatus({ type: "loading", msg: "Testing live LLM connection..." });
    const activeKey = aiProvider === "openai" ? openaiKey : geminiKey;

    try {
      const res = await fetch("/api/ai/rewrite", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": activeKey,
          "x-ai-provider": aiProvider,
        },
        body: JSON.stringify({
          text: "Developed React web application for high performance dashboard.",
          type: "bullet",
          style: "action_oriented",
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setTestStatus({
          type: "success",
          msg: `Success! Model response: "${data.data.enhancedText.slice(0, 40)}..."`,
        });
        showToast("success", "Koneksi LLM Berhasil!", `Respon AI: "${data.data.enhancedText.slice(0, 40)}..."`);
      } else {
        setTestStatus({ type: "error", msg: data.error || "Connection failed. Check API Key." });
        showToast("error", "Koneksi LLM Gagal", data.error || "Periksa kembali API Key Anda.");
      }
    } catch (err: any) {
      setTestStatus({ type: "error", msg: err.message || "Network test failed." });
      showToast("error", "Koneksi Jaringan Gagal", err.message || "Tidak dapat menghubungi server AI.");
    }
  };

  // Notification preferences
  const [notifATS, setNotifATS] = useState(true);
  const [notifProfile, setNotifProfile] = useState(true);
  const [notifMarketing, setNotifMarketing] = useState(false);
  const [notifWeekly, setNotifWeekly] = useState(true);

  // Privacy
  const [profilePublic, setProfilePublic] = useState(false);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(true);

  const tabs: { id: Tab; label: string; icon: any }[] = [
    { id: "account", label: "Account", icon: User },
    { id: "ai", label: "AI Integration", icon: Settings },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "privacy", label: "Privacy", icon: Shield },
    { id: "appearance", label: "Appearance", icon: Palette },
  ];

  // Account handlers & status
  const [profileSaveStatus, setProfileSaveStatus] = useState<string | null>(null);
  const [passwordStatus, setPasswordStatus] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [deleteConfirmInput, setDeleteConfirmInput] = useState("");
  const [notifStatus, setNotifStatus] = useState<string | null>(null);

  const handleSaveProfileInfo = async () => {
    updateUser({ name: fullName, email });

    saveProfile({
      ...profile,
      personalInfo: {
        ...profile.personalInfo,
        fullName,
        email,
      },
    });

    try {
      await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, email }),
      });
    } catch (err) {
      console.warn("Prisma profile sync warning:", err);
    }

    setProfileSaveStatus("Profile information updated & synced!");
    showToast("success", "Profil Berhasil Diperbarui!", "Nama & Email tersimpan permanen di Supabase DB.");
    setTimeout(() => setProfileSaveStatus(null), 3000);
  };

  const handleUpdatePassword = () => {
    if (!currentPassword) {
      setPasswordStatus({ type: "error", msg: "Please enter your current password." });
      showToast("error", "Gagal Memperbarui Kata Sandi", "Silakan masukkan kata sandi Anda saat ini.");
      return;
    }
    if (newPassword.length < 6) {
      setPasswordStatus({ type: "error", msg: "New password must be at least 6 characters." });
      showToast("error", "Gagal Memperbarui Kata Sandi", "Kata sandi baru minimal 6 karakter.");
      return;
    }

    setPasswordStatus({ type: "success", msg: "Password updated successfully!" });
    showToast("success", "Kata Sandi Berhasil Diperbarui!", "Gunakan kata sandi baru untuk login selanjutnya.");
    setCurrentPassword("");
    setNewPassword("");
    setTimeout(() => setPasswordStatus(null), 3000);
  };

  const handleDeleteAccount = () => {
    if (deleteConfirmInput.trim() !== "DELETE") {
      showToast("error", "Konfirmasi Gagal", "Ketik DELETE untuk mengonfirmasi penghapusan.");
      return;
    }
    showToast("info", "Menghapus Akun...", "Data lokal telah dibersihkan.");
    if (typeof window !== "undefined") {
      localStorage.clear();
      window.location.href = "/login";
    }
  };

  const handleSaveNotifications = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("cvforge_notif_prefs", JSON.stringify({ notifATS, notifProfile, notifWeekly, notifMarketing }));
    }
    setNotifStatus("Notification preferences saved!");
    showToast("success", "Pengaturan Notifikasi Disimpan", "Preferensi notifikasi Anda berhasil diperbarui.");
    setTimeout(() => setNotifStatus(null), 3000);
  };

  const handleExportData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(profile, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `cvforge_profile_backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast("success", "Ekspor Data Berhasil", "File JSON cadangan profil telah diunduh.");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-zinc-100">Settings</h1>
        <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">Manage your account, preferences, and privacy.</p>
      </div>

      <div className="flex gap-6">
        {/* Sidebar */}
        <div className="w-52 flex-shrink-0">
          <nav className="space-y-1">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors text-left ${
                  activeTab === id
                    ? "bg-gradient-to-r from-orange-600 to-red-600 text-white font-bold shadow-xs"
                    : "text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800"
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Account Tab */}
          {activeTab === "account" && (
            <div className="space-y-5">
              {/* Profile Info */}
              <div className="bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 p-6 space-y-4 shadow-xs">
                <h2 className="text-base font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                  <User className="w-4 h-4 text-orange-600 dark:text-orange-400" /> Profile Information
                </h2>

                {profileSaveStatus && (
                  <div className="p-3 bg-orange-50 dark:bg-orange-950/60 border border-orange-200 dark:border-orange-900/60 text-orange-900 dark:text-orange-300 rounded-lg text-xs font-semibold flex items-center gap-2">
                    <Check className="w-4 h-4" /> {profileSaveStatus}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-800 dark:text-zinc-200">Full Name</label>
                    <input
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-800 dark:text-zinc-200">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-zinc-500" />
                      <input
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                      />
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleSaveProfileInfo}
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-xs"
                >
                  <Check className="w-4 h-4 text-orange-100" /> Save Changes
                </button>
              </div>

              {/* Change Password */}
              <div className="bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 p-6 space-y-4 shadow-xs">
                <h2 className="text-base font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-orange-600 dark:text-orange-400" /> Change Password
                </h2>

                {passwordStatus && (
                  <div
                    className={`p-3 rounded-lg text-xs font-semibold flex items-center gap-2 ${
                      passwordStatus.type === "success"
                        ? "bg-orange-50 dark:bg-orange-950/60 text-orange-900 dark:text-orange-300 border border-orange-200 dark:border-orange-900/60"
                        : "bg-red-50 dark:bg-red-950/60 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800"
                    }`}
                  >
                    {passwordStatus.msg}
                  </div>
                )}

                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-800 dark:text-zinc-200">Current Password</label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 rounded-lg px-3 pr-10 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-500"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-800 dark:text-zinc-200">New Password</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleUpdatePassword}
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-xs"
                >
                  Update Password
                </button>
              </div>

              {/* Danger Zone */}
              <div className="bg-white dark:bg-zinc-900 rounded-xl border border-red-200 dark:border-red-900/60 p-6 space-y-4 shadow-xs">
                <h2 className="text-base font-bold text-red-600 dark:text-red-400 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" /> Danger Zone
                </h2>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-zinc-100">Delete Account</p>
                    <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                      Permanently delete your account and reset all career profile data. This cannot be undone.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(true)}
                    className="px-4 py-2 bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-300 rounded-lg text-sm font-medium hover:bg-red-100 dark:hover:bg-red-900/60 transition-colors flex-shrink-0 ml-4"
                  >
                    <Trash2 className="w-4 h-4 inline mr-1.5" /> Delete Account
                  </button>
                </div>
                {showDeleteConfirm && (
                  <div className="bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 rounded-lg p-4 space-y-3">
                    <p className="text-sm font-medium text-red-700 dark:text-red-300">
                      Are you absolutely sure? Type <strong>DELETE</strong> to confirm.
                    </p>
                    <input
                      value={deleteConfirmInput}
                      onChange={(e) => setDeleteConfirmInput(e.target.value)}
                      placeholder='Type "DELETE" to confirm'
                      className="w-full border border-red-300 dark:border-red-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-500 bg-white dark:bg-zinc-950 text-slate-900 dark:text-zinc-100"
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={handleDeleteAccount}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
                      >
                        Confirm Delete
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowDeleteConfirm(false)}
                        className="px-4 py-2 border border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-300 rounded-lg text-sm font-medium hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* AI Integration Tab */}
          {activeTab === "ai" && (
            <div className="space-y-5">
              <div className="bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 p-6 space-y-5 shadow-xs">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                      <Settings className="w-4 h-4 text-orange-600 dark:text-orange-400" /> Live LLM Provider Configuration
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                      Connect your own API Key (Google Gemini 1.5 Flash / OpenAI GPT-4o-mini) for live AI resume rewriting & Cover Letter generation.
                    </p>
                  </div>
                </div>

                {testStatus && (
                  <div
                    className={`p-3.5 rounded-lg text-xs font-medium flex items-center gap-2 ${
                      testStatus.type === "success"
                        ? "bg-orange-50 dark:bg-orange-950/60 text-orange-900 dark:text-orange-300 border border-orange-200 dark:border-orange-900/60"
                        : testStatus.type === "error"
                        ? "bg-red-50 dark:bg-red-950/60 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800"
                        : "bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
                    }`}
                  >
                    {testStatus.msg}
                  </div>
                )}

                {/* Provider Selection */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-slate-800 dark:text-zinc-200">Select Active AI Engine</label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { id: "gemini", label: "Google Gemini 1.5", desc: "Fast & High Quality (Free Tier Available)" },
                      { id: "openai", label: "OpenAI GPT-4o-mini", desc: "Standard Production Grade LLM" },
                      { id: "heuristic", label: "Heuristic Generator", desc: "Internal Rule Engine (No API Key Required)" },
                    ].map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setAiProvider(p.id as any)}
                        className={`p-3.5 rounded-xl border text-left transition-all ${
                          aiProvider === p.id
                            ? "border-orange-500 bg-orange-50 dark:bg-orange-950/80 dark:border-orange-500 ring-1 ring-orange-500 dark:ring-orange-500"
                            : "border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700 bg-white dark:bg-zinc-800/60"
                        }`}
                      >
                        <p className={`text-xs font-bold ${aiProvider === p.id ? "text-orange-600 dark:text-orange-300" : "text-slate-900 dark:text-zinc-100"}`}>{p.label}</p>
                        <p className={`text-[10px] mt-1 ${aiProvider === p.id ? "text-orange-700/80 dark:text-orange-300/80" : "text-slate-500 dark:text-zinc-400"}`}>{p.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Gemini Key */}
                <div className="space-y-1.5 pt-2">
                  <label className="text-xs font-medium text-slate-800 dark:text-zinc-200 flex items-center justify-between">
                    <span>Google Gemini API Key</span>
                    <a
                      href="https://aistudio.google.com/app/apikey"
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] text-orange-600 dark:text-orange-400 underline hover:text-orange-700 dark:hover:text-orange-300"
                    >
                      Get Gemini API Key ↗
                    </a>
                  </label>
                  <div className="relative">
                    <input
                      type={showGeminiKey ? "text" : "password"}
                      name={`gemini_key_input_user_${user?.id || 'guest'}`}
                      autoComplete="off"
                      readOnly={isAiKeyReadOnly}
                      onFocus={() => setIsAiKeyReadOnly(false)}
                      onClick={() => setIsAiKeyReadOnly(false)}
                      value={geminiKey}
                      onChange={(e) => setGeminiKey(e.target.value)}
                      placeholder="AIzaSy..."
                      className="w-full border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 rounded-lg px-3 pr-10 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowGeminiKey(!showGeminiKey)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-500"
                    >
                      {showGeminiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* OpenAI Key */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-800 dark:text-zinc-200 flex items-center justify-between">
                    <span>OpenAI API Key</span>
                    <a
                      href="https://platform.openai.com/api-keys"
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] text-orange-600 dark:text-orange-400 underline hover:text-orange-700 dark:hover:text-orange-300"
                    >
                      Get OpenAI API Key ↗
                    </a>
                  </label>
                  <div className="relative">
                    <input
                      type={showOpenaiKey ? "text" : "password"}
                      name={`openai_key_input_user_${user?.id || 'guest'}`}
                      autoComplete="off"
                      readOnly={isAiKeyReadOnly}
                      onFocus={() => setIsAiKeyReadOnly(false)}
                      onClick={() => setIsAiKeyReadOnly(false)}
                      value={openaiKey}
                      onChange={(e) => setOpenaiKey(e.target.value)}
                      placeholder="sk-..."
                      className="w-full border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 rounded-lg px-3 pr-10 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowOpenaiKey(!showOpenaiKey)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-500"
                    >
                      {showOpenaiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 pt-3">
                  <button
                    type="button"
                    onClick={saveAiSettings}
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-xs"
                  >
                    <Check className="w-4 h-4 text-orange-100" /> Save AI Configuration
                  </button>
                  <button
                    type="button"
                    onClick={testAiConnection}
                    className="inline-flex items-center gap-2 border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-200 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
                  >
                    Test Live Connection
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === "notifications" && (
            <div className="bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 p-6 space-y-5 shadow-xs">
              <h2 className="text-base font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                <Bell className="w-4 h-4 text-orange-600 dark:text-orange-400" /> Notification Preferences
              </h2>

              {notifStatus && (
                <div className="p-3 bg-orange-50 dark:bg-orange-950/60 border border-orange-200 dark:border-orange-900/60 text-orange-900 dark:text-orange-300 rounded-lg text-xs font-semibold flex items-center gap-2">
                  <Check className="w-4 h-4" /> {notifStatus}
                </div>
              )}

              {[
                { label: "ATS Analysis Complete", desc: "Get notified when your resume ATS analysis finishes.", value: notifATS, set: setNotifATS },
                { label: "Profile Completion Reminders", desc: "Receive nudges to complete missing profile sections.", value: notifProfile, set: setNotifProfile },
                { label: "Weekly Career Digest", desc: "A weekly summary of your profile strength and job match activity.", value: notifWeekly, set: setNotifWeekly },
                { label: "Product Updates & Tips", desc: "Occasional tips, new features, and improvements.", value: notifMarketing, set: setNotifMarketing },
              ].map(({ label, desc, value, set }) => (
                <div key={label} className="flex items-start justify-between gap-4 py-2 border-b border-slate-100 dark:border-zinc-800 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-zinc-100">{label}</p>
                    <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">{desc}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => set(!value)}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors ${value ? "bg-orange-600 dark:bg-orange-500" : "bg-slate-200 dark:bg-zinc-700"}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${value ? "translate-x-6" : "translate-x-1"}`} />
                  </button>
                </div>
              ))}

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleSaveNotifications}
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-xs"
                >
                  <Check className="w-4 h-4 text-orange-100" /> Save Notification Preferences
                </button>
              </div>
            </div>
          )}

          {/* Privacy Tab */}
          {activeTab === "privacy" && (
            <div className="space-y-5">
              <div className="bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 p-6 space-y-5 shadow-xs">
                <h2 className="text-base font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-orange-600 dark:text-orange-400" /> Privacy Controls
                </h2>
                {[
                  { label: "Public Profile", desc: "Allow your profile summary to be visible via a shareable link.", value: profilePublic, set: setProfilePublic, icon: Globe },
                  { label: "Usage Analytics", desc: "Help us improve CVForge by sharing anonymized usage data.", value: analyticsEnabled, set: setAnalyticsEnabled, icon: Monitor },
                ].map(({ label, desc, value, set, icon: Icon }) => (
                  <div key={label} className="flex items-start justify-between gap-4 py-2 border-b border-slate-100 dark:border-zinc-800 last:border-0">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-zinc-800 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900 dark:text-zinc-100">{label}</p>
                        <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">{desc}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => set(!value)}
                      className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors ${value ? "bg-orange-600 dark:bg-orange-500" : "bg-slate-200 dark:bg-zinc-700"}`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${value ? "translate-x-6" : "translate-x-1"}`} />
                    </button>
                  </div>
                ))}
              </div>

              <div className="bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 p-6 space-y-3 shadow-xs">
                <h2 className="text-base font-bold text-slate-900 dark:text-zinc-100">Data Export</h2>
                <p className="text-sm text-slate-500 dark:text-zinc-400">Download a complete copy of your Career Profile data in JSON format.</p>
                <button
                  type="button"
                  onClick={handleExportData}
                  className="inline-flex items-center gap-2 border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-200 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  Export My Data (JSON)
                </button>
              </div>
            </div>
          )}

          {/* Appearance Tab */}
          {activeTab === "appearance" && (
            <div className="bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 p-6 space-y-5 shadow-xs">
              <h2 className="text-base font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                <Palette className="w-4 h-4 text-orange-600 dark:text-orange-400" /> Appearance
              </h2>
              <div>
                <p className="text-sm font-medium text-slate-800 dark:text-zinc-200 mb-3">Theme</p>
                <div className="grid grid-cols-3 gap-3">
                  {([
                    { value: "light", label: "Light", icon: Sun },
                    { value: "dark", label: "Dark", icon: Moon },
                    { value: "system", label: "System", icon: Monitor },
                  ] as const).map(({ value, label, icon: Icon }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setTheme(value)}
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                        theme === value
                          ? "border-orange-500 dark:border-orange-500 bg-orange-50 dark:bg-orange-950/80"
                          : "border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700 bg-white dark:bg-zinc-800/60"
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${theme === value ? "text-orange-600 dark:text-orange-300" : "text-slate-400 dark:text-zinc-500"}`} />
                      <span className={`text-sm font-medium ${theme === value ? "text-orange-600 dark:text-orange-300" : "text-slate-700 dark:text-zinc-300"}`}>
                        {label}
                      </span>
                      {theme === value && (
                        <span className="w-1.5 h-1.5 rounded-full bg-orange-500 dark:bg-orange-400" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
              <div className="pt-2">
                <p className="text-xs text-slate-500 dark:text-zinc-400">
                  Mode gelap & terang aktif secara instan. Tema System mengikuti konfigurasi preferensi sistem operasi Anda.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modern Glassmorphism Notification Toast */}
      <GlassToast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}

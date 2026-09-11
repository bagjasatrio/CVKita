"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  User,
  Briefcase,
  FolderGit2,
  GraduationCap,
  Sparkles,
  Award,
  Trophy,
  Globe,
  FileText,
  Files,
  Target,
  Settings,
  ShieldCheck,
  LogOut,
  Home,
  Plus,
} from "lucide-react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";

const navigationItems = [
  { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { name: "Profile", href: "/dashboard/profile", icon: User },
  { name: "Experience", href: "/dashboard/experience", icon: Briefcase },
  { name: "Projects", href: "/dashboard/projects", icon: FolderGit2 },
  { name: "Education", href: "/dashboard/education", icon: GraduationCap },
  { name: "Skills", href: "/dashboard/skills", icon: Sparkles },
  { name: "Certifications", href: "/dashboard/certifications", icon: Award },
  { name: "Achievements", href: "/dashboard/achievements", icon: Trophy },
  { name: "Languages", href: "/dashboard/languages", icon: Globe },
  { name: "Documents", href: "/dashboard/documents", icon: FileText },
  { name: "My Resumes", href: "/dashboard/resumes", icon: Files },
  { name: "Job Matches", href: "/dashboard/jobs", icon: Target },
  { name: "Cover Letter", href: "/dashboard/cover-letter", icon: FileText },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

interface SidebarProps {
  completionPercentage?: number;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export function Sidebar({
  completionPercentage = 75,
  isMobileOpen = false,
  onCloseMobile,
}: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <>
      {/* Mobile Drawer Overlay Backdrop */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 lg:hidden animate-in fade-in"
        />
      )}

      <aside
        className={cn(
          "bg-zinc-950 text-zinc-100 flex flex-col border-r border-zinc-800/80 h-screen sticky top-0 shrink-0 print:hidden transition-all duration-200 z-50",
          "hidden lg:flex w-64",
          isMobileOpen && "fixed inset-y-0 left-0 flex w-72 shadow-2xl z-50 animate-in slide-in-from-left"
        )}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-zinc-800/80">
          <Link href="/dashboard" onClick={onCloseMobile} className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="CVKita Logo"
              className="w-8 h-8 object-contain shrink-0"
            />
            <div>
              <span className="font-semibold tracking-tight text-white text-base">CVKita</span>
              <span className="text-[10px] ml-2 px-2 py-0.5 rounded-full bg-orange-950/60 text-orange-300 border border-orange-800/60 font-medium">
                v1.0
              </span>
            </div>
          </Link>
          {isMobileOpen && (
            <button
              onClick={onCloseMobile}
              className="p-1.5 rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-white lg:hidden transition-colors"
              title="Close Menu"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <Link
            href="/dashboard/resumes/new?fresh=true"
            onClick={onCloseMobile}
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-semibold text-white bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 transition-all mb-2 shadow-xs"
          >
            <Plus className="w-4 h-4 text-white" />
            <span>+ Buat Resume Baru</span>
          </Link>

          <Link
            href="/"
            onClick={onCloseMobile}
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-orange-400 bg-orange-950/40 hover:bg-orange-900/30 border border-orange-800/50 transition-all mb-3 shadow-2xs"
            title="Kembali ke Landing Page Utama"
          >
            <Home className="w-4 h-4 text-orange-400" />
            <span>Landing Page Utama</span>
          </Link>

          <div className="px-3 pb-2 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
            Profil Karir
          </div>
          {navigationItems.slice(0, 9).map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onCloseMobile}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150",
                  isActive
                    ? "bg-gradient-to-r from-orange-600/90 to-red-600/90 text-white font-semibold shadow-xs"
                    : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200"
                )}
              >
                <Icon className={cn("w-4 h-4 shrink-0 transition-colors", isActive ? "text-white" : "text-zinc-500")} />
                <span>{item.name}</span>
              </Link>
            );
          })}

          <div className="pt-4 px-3 pb-2 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
            Dokumen & Lamaran
          </div>
          {navigationItems.slice(9).map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onCloseMobile}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150",
                  isActive
                    ? "bg-gradient-to-r from-orange-600/90 to-red-600/90 text-white font-semibold shadow-xs"
                    : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200"
                )}
              >
                <Icon className={cn("w-4 h-4 shrink-0 transition-colors", isActive ? "text-white" : "text-zinc-500")} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Profile Completion Footer */}
        <div className="p-4 border-t border-zinc-800/80 bg-zinc-900/40 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-400 font-medium">Profile Completion</span>
            <span className="text-orange-400 font-bold">{completionPercentage}%</span>
          </div>
          <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-orange-500 to-red-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>

          <div className="pt-2 flex items-center justify-between border-t border-zinc-800/80 text-xs">
            <div className="flex items-center gap-2 truncate">
              <div className="w-6 h-6 rounded-full bg-zinc-800 text-orange-400 border border-zinc-700 font-bold text-[10px] flex items-center justify-center shrink-0">
                {user?.avatarInitials || "AV"}
              </div>
              <span className="text-zinc-200 font-medium truncate">{user?.name || "Alex Vance"}</span>
            </div>

            <button
              type="button"
              onClick={() => {
                if (onCloseMobile) onCloseMobile();
                logout();
              }}
              title="Sign Out"
              className="p-1.5 rounded text-zinc-400 hover:bg-red-950/50 hover:text-red-400 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

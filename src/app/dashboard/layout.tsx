"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/navigation/sidebar";
import { Header } from "@/components/navigation/header";
import { useAuth } from "@/lib/auth-context";
import { useUserProfile } from "@/lib/use-user-profile";
import { Sparkles } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading } = useAuth();
  const { completenessPercentage } = useUserProfile();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 flex flex-col items-center justify-center space-y-3">
        <img
          src="/logo.png"
          alt="CVKita Logo"
          className="w-auto h-8 object-contain animate-pulse shrink-0"
        />
        <div className="flex items-center gap-2 text-xs font-mono text-slate-600 dark:text-zinc-400">
          <Sparkles className="w-4 h-4 animate-spin text-orange-500" /> Authenticating Session...
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 print:bg-white print:block print:h-auto print:overflow-visible transition-colors duration-200">
      <Sidebar
        completionPercentage={completenessPercentage}
        isMobileOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden print:block print:w-full print:h-auto">
        <Header onOpenMobileMenu={() => setIsMobileMenuOpen(true)} />
        <main className="flex-1 p-3 sm:p-6 lg:p-8 overflow-y-auto print:p-0 print:m-0 print:overflow-visible print:w-full">
          {children}
        </main>
      </div>
    </div>
  );
}

"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export interface UserSession {
  id: string;
  name: string;
  email: string;
  roleTitle: string;
  avatarInitials: string;
  isDemo?: boolean;
}

interface AuthContextType {
  user: UserSession | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, pass: string, redirectTo?: string) => Promise<void>;
  register: (name: string, email: string, pass: string) => Promise<void>;
  logout: () => void;
  updateUser: (data: Partial<UserSession>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Helper to set session cookie
  const setSessionCookie = (active: boolean) => {
    if (typeof document !== "undefined") {
      if (active) {
        document.cookie = "cvforge_session=true; path=/; max-age=604800; SameSite=Lax";
      } else {
        document.cookie = "cvforge_session=; path=/; max-age=0; SameSite=Lax";
      }
    }
  };

  // Check auth state synchronously on mount
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("cvforge_user");
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        setUser(parsed);
        setSessionCookie(true);
      } else {
        setUser(null);
        setSessionCookie(false);
      }
    } catch {
      setUser(null);
      setSessionCookie(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, pass: string, redirectTo: string = "/dashboard") => {
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 400));

    const isDemo = email === "demo@cvforge.ai" || pass === "demo";

    const nameFromEmail = email.split("@")[0].replace(".", " ");
    const formattedName = nameFromEmail
      .split(" ")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");

    const initials = formattedName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();

    let userName = formattedName;
    if (email.includes("google")) userName = "Google User";
    if (email.includes("github")) userName = "GitHub User";

    const stableId = isDemo
      ? "user-demo"
      : `usr_${email.toLowerCase().trim().replace(/[^a-z0-9]/g, "_")}`;

    const loggedUser: UserSession = {
      id: stableId,
      name: userName || "User Account",
      email: email,
      roleTitle: "Career Profile Owner",
      avatarInitials: initials || "CF",
      isDemo: isDemo,
    };

    setSessionCookie(true);
    localStorage.setItem("cvforge_user", JSON.stringify(loggedUser));
    setUser(loggedUser);
    setIsLoading(false);
    router.push(redirectTo);
  };

  const register = async (name: string, email: string, pass: string) => {
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 400));

    const nameParts = name.trim().split(" ");
    const initials =
      nameParts.length >= 2
        ? `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase()
        : name.substring(0, 2).toUpperCase();

    const stableId = `usr_${email.toLowerCase().trim().replace(/[^a-z0-9]/g, "_")}`;

    const newUser: UserSession = {
      id: stableId,
      name: name || "Career Builder",
      email: email,
      roleTitle: "Career Profile Owner",
      avatarInitials: initials || "CF",
      isDemo: false,
    };

    setSessionCookie(true);
    localStorage.setItem("cvforge_user", JSON.stringify(newUser));
    setUser(newUser);
    setIsLoading(false);
    router.push("/dashboard");
  };

  const logout = () => {
    setSessionCookie(false);
    localStorage.removeItem("cvforge_user");
    setUser(null);
    router.push("/");
  };

  const updateUser = (data: Partial<UserSession>) => {
    if (!user) return;
    const updated = { ...user, ...data };
    if (data.name) {
      const parts = data.name.trim().split(" ");
      updated.avatarInitials =
        parts.length >= 2
          ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
          : data.name.substring(0, 2).toUpperCase();
    }
    setUser(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("cvforge_user", JSON.stringify(updated));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

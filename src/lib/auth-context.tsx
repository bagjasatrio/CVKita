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
  resetPassword: (email: string, newPass: string) => Promise<void>;
  logout: () => void;
  updateUser: (data: Partial<UserSession>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const getRegisteredAccounts = (): Array<{ id: string; name: string; email: string; pass: string; roleTitle: string; avatarInitials: string }> => {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem("cvforge_registered_accounts");
    if (!raw) {
      const initial = [
        {
          id: "usr_muhammad_bagjasatrio28_gmail_com",
          name: "Muhammad Bagja Satrio",
          email: "muhammad.bagjasatrio28@gmail.com",
          pass: "password123",
          roleTitle: "Career Profile Owner",
          avatarInitials: "MB",
        },
      ];
      localStorage.setItem("cvforge_registered_accounts", JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
};

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

    const cleanEmail = email.toLowerCase().trim();

    // Check demo account
    if (cleanEmail === "demo@cvforge.ai" || pass === "demo") {
      const demoUser: UserSession = {
        id: "user-demo",
        name: "Demo Account",
        email: "demo@cvforge.ai",
        roleTitle: "Career Profile Owner",
        avatarInitials: "DA",
        isDemo: true,
      };
      setSessionCookie(true);
      localStorage.setItem("cvforge_user", JSON.stringify(demoUser));
      setUser(demoUser);
      setIsLoading(false);
      router.push(redirectTo);
      return;
    }

    const registeredList = getRegisteredAccounts();
    const foundUser = registeredList.find((u) => u.email.toLowerCase().trim() === cleanEmail);

    if (!foundUser) {
      setIsLoading(false);
      throw new Error("Akun belum terdaftar. Silakan buat akun baru di halaman registrasi terlebih dahulu.");
    }

    if (foundUser.pass && pass && foundUser.pass !== pass && foundUser.pass !== "oauth-pass") {
      setIsLoading(false);
      throw new Error("Password yang Anda masukkan salah.");
    }

    const nameParts = (foundUser.name || "User Account").trim().split(" ");
    const initials =
      foundUser.avatarInitials ||
      (nameParts.length >= 2
        ? `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase()
        : foundUser.name.substring(0, 2).toUpperCase());

    const loggedUser: UserSession = {
      id: foundUser.id,
      name: foundUser.name,
      email: foundUser.email,
      roleTitle: foundUser.roleTitle || "Career Profile Owner",
      avatarInitials: initials,
      isDemo: false,
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

    const cleanEmail = email.toLowerCase().trim();
    const registeredList = getRegisteredAccounts();

    const existing = registeredList.find((u) => u.email.toLowerCase().trim() === cleanEmail);
    if (existing) {
      setIsLoading(false);
      throw new Error("Email ini sudah terdaftar. Silakan login ke akun Anda.");
    }

    const nameParts = name.trim().split(" ");
    const initials =
      nameParts.length >= 2
        ? `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase()
        : name.substring(0, 2).toUpperCase();

    const stableId = `usr_${cleanEmail.replace(/[^a-z0-9]/g, "_")}`;

    const newUserObj = {
      id: stableId,
      name: name || "Career Builder",
      email: cleanEmail,
      pass: pass || "password123",
      roleTitle: "Career Profile Owner",
      avatarInitials: initials || "CF",
    };

    const updatedAccounts = [...registeredList, newUserObj];
    localStorage.setItem("cvforge_registered_accounts", JSON.stringify(updatedAccounts));

    const newUserSession: UserSession = {
      id: stableId,
      name: newUserObj.name,
      email: newUserObj.email,
      roleTitle: newUserObj.roleTitle,
      avatarInitials: newUserObj.avatarInitials,
      isDemo: false,
    };

    setSessionCookie(true);
    localStorage.setItem("cvforge_user", JSON.stringify(newUserSession));
    setUser(newUserSession);
    setIsLoading(false);
    router.push("/dashboard");
  };

  const resetPassword = async (email: string, newPass: string) => {
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 400));

    const cleanEmail = email.toLowerCase().trim();
    const registeredList = getRegisteredAccounts();

    const userIdx = registeredList.findIndex((u) => u.email.toLowerCase().trim() === cleanEmail);
    if (userIdx === -1) {
      setIsLoading(false);
      throw new Error("Email ini belum terdaftar. Silakan periksa kembali email Anda.");
    }

    registeredList[userIdx].pass = newPass;
    localStorage.setItem("cvforge_registered_accounts", JSON.stringify(registeredList));
    setIsLoading(false);
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
        resetPassword,
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

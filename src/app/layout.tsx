import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "@/styles/globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { ThemeProvider } from "@/components/theme-provider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
});

export const metadata: Metadata = {
  title: "CVKita - Build Once. Tailor Every Time.",
  description:
    "Build your career profile once. Generate the right ATS-friendly resume for every opportunity.",
  keywords: ["resume builder", "career profile", "ATS resume", "AI CV generator", "job match"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans min-h-full flex flex-col bg-[#f8faf9] text-[#191c1c] dark:bg-[#0f1413] dark:text-[#e1e3e2] antialiased transition-colors duration-200`}>
        <ThemeProvider>
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

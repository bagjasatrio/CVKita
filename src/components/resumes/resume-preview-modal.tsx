"use client";

import React from "react";
import Link from "next/link";
import { X, Printer, Edit3, Eye, FileText, CheckCircle2 } from "lucide-react";
import { SavedResume, UserProfile } from "@/lib/use-user-profile";

interface ResumePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  resume: SavedResume | null;
  profile: UserProfile;
}

export function ResumePreviewModal({
  isOpen,
  onClose,
  resume,
  profile,
}: ResumePreviewModalProps) {
  if (!isOpen || !resume) return null;

  const snap = resume.contentSnapshot || {};

  const fullName =
    snap.personalInfo?.fullName ||
    profile.personalInfo?.fullName ||
    "Nama Anda";

  const targetRole =
    snap.personalInfo?.targetRole ||
    resume.role ||
    profile.personalInfo?.targetRole ||
    "";

  const email = snap.personalInfo?.email || profile.personalInfo?.email || "";
  const phone = snap.personalInfo?.phone || profile.personalInfo?.phone || "";
  const location =
    snap.personalInfo?.cityState ||
    snap.personalInfo?.location ||
    profile.personalInfo?.cityState ||
    "";

  const linkedin =
    snap.personalInfo?.linkedin || profile.personalInfo?.linkedin || "";
  const portfolioUrl =
    snap.personalInfo?.portfolioUrl ||
    snap.personalInfo?.website ||
    profile.personalInfo?.website ||
    "";

  const summary = snap.summary || profile.personalInfo?.summary || "";

  const experiences = (snap.experiences || profile.experiences || []).filter(
    (e: any) => e.included !== false && (e.role?.trim() || e.company?.trim())
  );

  const projects = (snap.projects || profile.projects || []).filter(
    (p: any) => p.included !== false && (p.name?.trim() || p.role?.trim())
  );

  const education = (snap.education || profile.education || []).filter(
    (e: any) => e.included !== false && (e.degree?.trim() || e.institution?.trim())
  );

  const skills = (snap.skills || profile.skills || []).filter(
    (s: any) => s.included !== false && (typeof s === "string" ? s.trim() : s.name?.trim())
  );

  const languages = (snap.languages || profile.languages || []).filter(
    (l: any) => l.included !== false && l.name?.trim()
  );

  const certifications = (
    snap.certifications ||
    profile.certifications ||
    []
  ).filter((c: any) => c.included !== false && c.name?.trim());

  const achievements = (
    snap.achievements ||
    profile.achievements ||
    []
  ).filter((a: any) => a.included !== false && a.title?.trim());

  const template = (resume.template || "ats").toLowerCase();

  const getTemplateStyles = () => {
    switch (template) {
      case "modern":
        return {
          container: "font-sans text-[#191c1c]",
          headerAlign: "text-left border-l-4 border-black pl-3 py-1 bg-slate-50/80 rounded-r-lg",
          nameText: "text-base font-extrabold tracking-tight uppercase text-black",
          roleText: "text-[11px] font-bold tracking-wider uppercase text-black",
          contactText: "text-[9.5px] text-[#4c6079] flex flex-wrap gap-x-2 gap-y-0.5 mt-1 font-sans",
          sectionHeader: "border-b-2 border-black pb-0.5 mb-1",
          sectionTitle: "text-[11px] font-bold uppercase tracking-wider text-black flex items-center gap-1.5",
        };
      case "executive":
        return {
          container: "font-serif text-[#1e293b]",
          headerAlign: "text-center pb-1.5 border-b-2 border-double border-black",
          nameText: "text-lg font-bold tracking-widest uppercase text-black",
          roleText: "text-[10px] font-semibold tracking-widest uppercase text-[#475569] mt-0.5",
          contactText: "text-[9.5px] text-[#475569] flex flex-wrap items-center justify-center gap-x-2 gap-y-0.5 mt-1 font-sans",
          sectionHeader: "border-b-2 border-black pb-0.5 mb-1 text-center",
          sectionTitle: "text-[11px] font-bold uppercase tracking-widest text-black",
        };
      case "tech":
        return {
          container: "font-mono text-[#0f172a]",
          headerAlign: "text-left border-b-2 border-black pb-1.5",
          nameText: "text-base font-black tracking-tight text-black",
          roleText: "text-[10.5px] font-mono font-bold text-black bg-[#eff6ff] px-2 py-0.5 rounded inline-block mt-0.5 border border-black",
          contactText: "text-[9px] text-[#64748b] flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-1.5 font-mono",
          sectionHeader: "border-b-2 border-black pb-0.5 mb-1",
          sectionTitle: "text-[10.5px] font-mono font-bold uppercase tracking-wider text-black",
        };
      case "ats":
      default:
        return {
          container: "font-sans text-[#191c1c]",
          headerAlign: "text-center pb-1",
          nameText: "text-sm font-bold tracking-tight uppercase text-black",
          roleText: "text-[10px] font-medium tracking-wider uppercase text-[#4c6079]",
          contactText: "flex flex-wrap items-center justify-center gap-x-1.5 gap-y-0.5 text-[9.5px] text-[#4c6079] leading-tight font-sans",
          sectionHeader: "border-b-2 border-black pb-0.5 mb-1",
          sectionTitle: "text-[10.5px] font-bold uppercase tracking-wider text-black",
        };
    }
  };

  const tStyle = getTemplateStyles();

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200 print:static print:inset-auto print:bg-transparent print:p-0 print:m-0 print:block print:w-full print:h-auto">
      <div className="bg-white dark:bg-[#1b2220] rounded-2xl border border-[#e1e3e2] dark:border-[#242c2a] w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden print:static print:w-full print:max-w-none print:shadow-none print:border-none print:rounded-none print:p-0 print:m-0 print:max-h-none print:block print:bg-white">
        {/* Modal Top Action Bar (Hidden during print) */}
        <div className="px-5 py-3.5 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between bg-slate-50 dark:bg-zinc-900 print:hidden">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-950/80 flex items-center justify-center text-orange-600 dark:text-orange-400 flex-shrink-0">
              <Eye className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100 truncate">
                {resume.title}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400 truncate">
                Preview Canvas Mode · Template: <span className="font-semibold uppercase">{template}</span> · ATS Score: <span className="font-bold text-orange-600 dark:text-orange-400">{resume.atsScore}%</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs font-semibold text-slate-800 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-700 transition-colors shadow-2xs"
            >
              <Printer className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" />
              <span className="hidden sm:inline">Cetak / Export PDF</span>
            </button>

            <Link
              href={`/dashboard/resumes/${resume.id}`}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white text-xs font-semibold transition-colors shadow-2xs"
            >
              <Edit3 className="w-3.5 h-3.5 text-orange-100" />
              <span>Open ATS Studio</span>
            </Link>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#727976] dark:text-zinc-400 hover:bg-[#f2f4f3] dark:hover:bg-[#242c2a] hover:text-[#191c1c] dark:hover:text-zinc-100 transition-colors ml-1"
              title="Close Preview"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Canvas Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-[#f2f4f3] dark:bg-[#121816] flex justify-center print:p-0 print:m-0 print:bg-white print:overflow-visible print:block print:w-full">
          <div className={`cv-print-canvas bg-white rounded-2xl shadow-xl text-[#191c1c] w-full max-w-[210mm] ${tStyle.container}`}>
            {/* Header Canvas */}
            <div className={tStyle.headerAlign}>
              <h1 className={tStyle.nameText}>{fullName}</h1>
              {targetRole && <p className={tStyle.roleText}>{targetRole}</p>}
              <div className={tStyle.contactText}>
                {[location, email, phone, linkedin, portfolioUrl]
                  .filter(Boolean)
                  .map((item, idx, arr) => (
                    <React.Fragment key={idx}>
                      <span>{item}</span>
                      {idx < arr.length - 1 && <span className="opacity-40">|</span>}
                    </React.Fragment>
                  ))}
              </div>
            </div>

            {/* Profile Summary */}
            {summary && (
              <div className="py-0.5 space-y-0.5 mt-2">
                <div className={tStyle.sectionHeader}>
                  <h2 className={tStyle.sectionTitle}>Ringkasan Profil</h2>
                </div>
                <p className="text-[10.5px] leading-snug text-[#191c1c]">{summary}</p>
              </div>
            )}

            {/* Work Experience */}
            {experiences.length > 0 && (
              <div className="py-0.5 space-y-1 mt-2">
                <div className={tStyle.sectionHeader}>
                  <h2 className={tStyle.sectionTitle}>Pengalaman Kerja</h2>
                </div>
                <div className="space-y-1.5">
                  {experiences.map((exp: any, i: number) => (
                    <div key={exp.id || i} className="text-[10.5px] space-y-0.5">
                      <div className="flex items-center justify-between font-bold text-[#191c1c]">
                        <span>
                          {exp.role || "Posisi"}{" "}
                          {exp.company ? `— ${exp.company}` : ""}
                        </span>
                        {(exp.startDate || exp.endDate) && (
                          <span className="font-mono text-[10px] text-[#191c1c] font-normal">
                            {exp.startDate} {exp.endDate ? `– ${exp.endDate}` : ""}
                          </span>
                        )}
                      </div>
                      {exp.location && (
                        <p className="text-[10px] text-[#4c6079] italic">
                          {exp.location}
                        </p>
                      )}
                      {exp.bullets && (
                        <ul className="list-disc list-outside ml-3.5 space-y-0.5 text-[#191c1c] leading-snug pt-0.5">
                          {(Array.isArray(exp.bullets)
                            ? exp.bullets
                            : typeof exp.bullets === "string"
                            ? exp.bullets.split("\n")
                            : []
                          )
                            .filter(Boolean)
                            .map((b: string, idx: number) => (
                              <li key={idx}>{b}</li>
                            ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Projects & Portfolio */}
            {projects.length > 0 && (
              <div className="py-0.5 space-y-1 mt-2">
                <div className={tStyle.sectionHeader}>
                  <h2 className={tStyle.sectionTitle}>Pengalaman Proyek</h2>
                </div>
                <div className="space-y-1.5">
                  {projects.map((proj: any, i: number) => (
                    <div key={proj.id || i} className="text-[10.5px] space-y-0.5">
                      <div className="flex items-center justify-between font-bold text-[#191c1c]">
                        <span>
                          {proj.name || "Nama Proyek"}{" "}
                          {proj.role ? (
                            <span className="font-normal text-[#4c6079]">
                              ({proj.role})
                            </span>
                          ) : null}
                        </span>
                        {(proj.startDate || proj.endDate) && (
                          <span className="font-mono text-[10px] text-[#191c1c] font-normal">
                            {proj.startDate} {proj.endDate ? `– ${proj.endDate}` : ""}
                          </span>
                        )}
                      </div>
                      {proj.link && (
                        <p className="text-[10px] text-[#4c6079] italic">
                          {proj.link}
                        </p>
                      )}
                      {proj.bullets && (
                        <ul className="list-disc list-outside ml-3.5 space-y-0.5 text-[#191c1c] leading-snug pt-0.5">
                          {(Array.isArray(proj.bullets)
                            ? proj.bullets
                            : typeof proj.bullets === "string"
                            ? proj.bullets.split("\n")
                            : []
                          )
                            .filter(Boolean)
                            .map((b: string, idx: number) => (
                              <li key={idx}>{b}</li>
                            ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Education */}
            {education.length > 0 && (
              <div className="py-0.5 space-y-1 mt-2">
                <div className={tStyle.sectionHeader}>
                  <h2 className={tStyle.sectionTitle}>Pendidikan</h2>
                </div>
                <div className="space-y-1.5">
                  {education.map((edu: any, i: number) => (
                    <div
                      key={edu.id || i}
                      className="flex items-center justify-between text-[10.5px]"
                    >
                      <div>
                        <p className="font-bold text-[#191c1c]">
                          {edu.degree}
                          {edu.fieldOfStudy ? ` ${edu.fieldOfStudy}` : ""}
                        </p>
                        <p className="text-[#4c6079] italic text-[10px]">
                          {edu.institution}
                        </p>
                      </div>
                      <div className="text-right font-mono text-[10px] text-[#191c1c]">
                        {(edu.startDate || edu.endDate) && (
                          <p>
                            {edu.startDate} {edu.endDate ? `– ${edu.endDate}` : ""}
                          </p>
                        )}
                        {edu.gpa && (
                          <p className="font-semibold text-orange-950">
                            GPA: {edu.gpa}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Skills */}
            {skills.length > 0 && (
              <div className="py-0.5 space-y-0.5 mt-2">
                <div className={tStyle.sectionHeader}>
                  <h2 className={tStyle.sectionTitle}>Keahlian & Keterampilan</h2>
                </div>
                <p className="text-[10.5px] leading-snug text-[#191c1c]">
                  {skills
                    .map((s: any) => (typeof s === "string" ? s : s.name))
                    .filter(Boolean)
                    .join(" • ")}
                </p>
              </div>
            )}

            {/* Languages */}
            {languages.length > 0 && (
              <div className="py-0.5 space-y-0.5 mt-2">
                <div className={tStyle.sectionHeader}>
                  <h2 className={tStyle.sectionTitle}>Penguasaan Bahasa</h2>
                </div>
                <p className="text-[10.5px] leading-snug text-[#191c1c]">
                  {languages
                    .map((l: any) => (l.level ? `${l.name} (${l.level})` : l.name))
                    .join(" • ")}
                </p>
              </div>
            )}

            {/* Certifications */}
            {certifications.length > 0 && (
              <div className="py-0.5 space-y-0.5 mt-2">
                <div className={tStyle.sectionHeader}>
                  <h2 className={tStyle.sectionTitle}>Sertifikasi</h2>
                </div>
                <div className="space-y-1">
                  {certifications.map((cert: any, i: number) => (
                    <div
                      key={cert.id || i}
                      className="flex items-center justify-between text-[10.5px]"
                    >
                      <div>
                        <p className="font-bold text-[#191c1c]">{cert.name}</p>
                        {cert.issuer && (
                          <p className="text-[#4c6079] italic text-[10px]">
                            {cert.issuer}
                          </p>
                        )}
                      </div>
                      {cert.issueDate && (
                        <p className="font-mono text-[10px] text-[#191c1c]">
                          {cert.issueDate}{" "}
                          {cert.expiryDate ? `– ${cert.expiryDate}` : ""}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Achievements */}
            {achievements.length > 0 && (
              <div className="py-0.5 space-y-0.5 mt-2">
                <div className={tStyle.sectionHeader}>
                  <h2 className={tStyle.sectionTitle}>Pencapaian & Penghargaan</h2>
                </div>
                <div className="space-y-1">
                  {achievements.map((ach: any, i: number) => (
                    <div key={ach.id || i} className="text-[10.5px] space-y-0.5">
                      <div className="flex items-center justify-between font-bold text-[#191c1c]">
                        <span>
                          {ach.title}
                          {ach.issuer ? (
                            <span className="font-normal text-[#4c6079]">
                              {" "}
                              — {ach.issuer}
                            </span>
                          ) : null}
                        </span>
                        {ach.date && (
                          <span className="font-mono text-[10px] text-[#191c1c] font-normal">
                            {ach.date}
                          </span>
                        )}
                      </div>
                      {(ach.impact || ach.description) && (
                        <p className="text-[10px] text-[#4c6079]">
                          {ach.impact || ach.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useAuth } from "./auth-context";

export interface ProfileExperience {
  id: string;
  company: string;
  role: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  location: string;
  bullets: string[];
}

export interface ProfileProject {
  id: string;
  name: string;
  role: string;
  description: string;
  techStack: string[];
  link?: string;
  githubUrl?: string;
}

export interface ProfileEducation {
  id: string;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string;
  endDate: string;
  gpa?: string;
  activities?: string;
  honors?: string;
  location?: string;
}

export interface ProfileSkill {
  id: string;
  name: string;
  category: string;
  proficiency: number; // 1-4
  verified: boolean;
}

export interface ProfileCertification {
  id: string;
  name: string;
  issuer: string;
  issueDate: string;
  expiryDate?: string;
  credentialId?: string;
  credentialUrl?: string;
  status: "active" | "expired" | "pending";
  documentLinked?: boolean;
}

export interface ProfileAchievement {
  id: string;
  title: string;
  category?: string;
  type?: "award" | "recognition" | "milestone" | "competition" | "publication" | "other";
  date: string;
  issuer?: string;
  description: string;
  metric?: string;
  impact?: string;
}

export interface UserProfileStore {
  personalInfo: {
    fullName: string;
    firstName?: string;
    lastName?: string;
    targetRole?: string;
    email: string;
    headline: string;
    summary: string;
    phone: string;
    location: string;
    website: string;
    github: string;
    linkedin: string;
    portfolioUrl?: string;
    postalCode?: string;
    cityState?: string;
    fullAddress?: string;
    country?: string;
  };
  experiences: ProfileExperience[];
  projects: ProfileProject[];
  education: ProfileEducation[];
  skills: ProfileSkill[];
  certifications: ProfileCertification[];
  achievements: ProfileAchievement[];
  languages?: { id: string; name: string; level: string }[];
  documents: { id: string; name: string; type: string; uploadedAt: string; size: string; status: string; facts?: number }[];
  resumes: { id: string; title: string; role: string; company?: string; template: string; atsScore: number; updated: string; contentSnapshot?: any }[];
}

export type UserProfile = UserProfileStore;
export type SavedResume = UserProfileStore["resumes"][number];

const EMPTY_PROFILE: UserProfileStore = {
  personalInfo: {
    fullName: "",
    email: "",
    headline: "",
    summary: "",
    phone: "",
    location: "",
    website: "",
    github: "",
    linkedin: "",
  },
  experiences: [],
  projects: [],
  education: [],
  skills: [],
  certifications: [],
  achievements: [],
  documents: [],
  resumes: [],
};

export function syncProfileFromResumes(currentProfile: UserProfileStore): UserProfileStore {
  const resumes = currentProfile.resumes || [];
  if (resumes.length === 0) return currentProfile;

  const updatedProfile: UserProfileStore = { ...currentProfile };

  // Collect merged experiences
  const expMap = new Map<string, ProfileExperience>();
  (updatedProfile.experiences || []).forEach((e) => {
    if (e.id) expMap.set(e.id, e);
    const key = `${e.company}_${e.role}`.toLowerCase().trim();
    if (key) expMap.set(key, e);
  });

  // Collect merged projects
  const projMap = new Map<string, ProfileProject>();
  (updatedProfile.projects || []).forEach((p) => {
    if (p.id) projMap.set(p.id, p);
    if (p.name) projMap.set(p.name.toLowerCase().trim(), p);
  });

  // Collect merged education
  const eduMap = new Map<string, ProfileEducation>();
  (updatedProfile.education || []).forEach((ed) => {
    if (ed.id) eduMap.set(ed.id, ed);
    const key = `${ed.institution}_${ed.degree}`.toLowerCase().trim();
    if (key) eduMap.set(key, ed);
  });

  // Collect merged skills
  const skillMap = new Map<string, ProfileSkill>();
  (updatedProfile.skills || []).forEach((s) => {
    if (s.id) skillMap.set(s.id, s);
    if (s.name) skillMap.set(s.name.toLowerCase().trim(), s);
  });

  // Collect merged certifications
  const certMap = new Map<string, ProfileCertification>();
  (updatedProfile.certifications || []).forEach((c) => {
    if (c.id) certMap.set(c.id, c);
    if (c.name) certMap.set(c.name.toLowerCase().trim(), c);
  });

  // Collect merged achievements
  const achievementMap = new Map<string, ProfileAchievement>();
  (updatedProfile.achievements || []).forEach((a) => {
    if (a.title) achievementMap.set(a.title.toLowerCase().trim(), a);
  });

  // Collect merged languages
  const langMap = new Map<string, { id: string; name: string; level: string }>();
  (updatedProfile.languages || []).forEach((l) => {
    if (l.name) langMap.set(l.name.toLowerCase().trim(), l);
  });

  // Iterate over all created resumes snapshots
  resumes.forEach((r) => {
    const snap = r.contentSnapshot;
    if (!snap) return;

    // Personal Info sync
    if (snap.personalInfo) {
      const p = snap.personalInfo;
      const target = updatedProfile.personalInfo;
      if (!target.fullName && (p.firstName || p.lastName)) {
        target.fullName = `${p.firstName || ""} ${p.lastName || ""}`.trim();
      }
      if (!target.email && p.email) target.email = p.email;
      if (!target.phone && p.phone) target.phone = p.phone;
      if (!target.location && (p.cityState || p.location)) target.location = p.cityState || p.location;
      if (!target.linkedin && p.linkedin) target.linkedin = p.linkedin;
      if (!target.website && p.portfolioUrl) target.website = p.portfolioUrl;
      if (!target.targetRole && p.targetRole) target.targetRole = p.targetRole;
      if (!target.summary && snap.summary) target.summary = snap.summary;
    }

    // Experiences sync
    if (Array.isArray(snap.experiences)) {
      snap.experiences.forEach((e: any, idx: number) => {
        if (!e.company && !e.role) return;
        const idKey = e.id;
        const nameKey = `${e.company || ""}_${e.role || ""}`.toLowerCase().trim();
        const exists = (idKey && expMap.has(idKey)) || (nameKey && expMap.has(nameKey));
        if (!exists) {
          const bulletsArr = Array.isArray(e.bullets)
            ? e.bullets
            : typeof e.bullets === "string"
            ? e.bullets.split("\n").filter(Boolean)
            : [];
          const newId = e.id || `exp_synced_${idx}_${Date.now()}`;
          const newExp: ProfileExperience = {
            id: newId,
            company: e.company || "Perusahaan",
            role: e.role || "Posisi Pekerjaan",
            startDate: e.startDate || "2022-01",
            endDate: e.endDate || "Present",
            isCurrent: e.isCurrent ?? (e.endDate === "Present" || !e.endDate),
            location: e.location || "Remote",
            bullets: bulletsArr,
          };
          expMap.set(newId, newExp);
          if (nameKey) expMap.set(nameKey, newExp);
        }
      });
    }

    // Projects sync
    if (Array.isArray(snap.projects)) {
      snap.projects.forEach((p: any, idx: number) => {
        if (!p.name) return;
        const key = p.name.toLowerCase().trim();
        if (key && !projMap.has(key)) {
          projMap.set(key, {
            id: p.id || `proj_synced_${idx}_${Date.now()}`,
            name: p.name,
            role: p.role || "Developer / Contributor",
            description: p.bullets || p.description || "",
            techStack: Array.isArray(p.techStack) ? p.techStack : [],
            link: p.link || "",
          });
        }
      });
    }

    // Education sync
    if (Array.isArray(snap.education)) {
      snap.education.forEach((ed: any, idx: number) => {
        if (!ed.institution) return;
        const key = `${ed.institution || ""}_${ed.degree || ""}`.toLowerCase().trim();
        if (key && !eduMap.has(key)) {
          eduMap.set(key, {
            id: ed.id || `edu_synced_${idx}_${Date.now()}`,
            institution: ed.institution,
            degree: ed.degree || "Sarjana",
            fieldOfStudy: ed.fieldOfStudy || "",
            startDate: ed.startDate || "2018",
            endDate: ed.endDate || "2022",
            gpa: ed.gpa || "",
          });
        }
      });
    }

    // Skills sync
    if (Array.isArray(snap.skills)) {
      snap.skills.forEach((s: any, idx: number) => {
        const name = typeof s === "string" ? s : s.name;
        if (!name) return;
        const key = name.toLowerCase().trim();
        if (key && !skillMap.has(key)) {
          skillMap.set(key, {
            id: `sk_synced_${idx}_${Date.now()}`,
            name: name,
            category: (typeof s === "object" && s.category) ? s.category : "Core Development",
            proficiency: 3,
            verified: true,
          });
        }
      });
    }

    // Certifications sync
    if (Array.isArray(snap.certifications)) {
      snap.certifications.forEach((c: any, idx: number) => {
        const name = typeof c === "string" ? c : c.name;
        if (!name) return;
        const key = name.toLowerCase().trim();
        if (key && !certMap.has(key)) {
          certMap.set(key, {
            id: `cert_synced_${idx}_${Date.now()}`,
            name: name,
            issuer: c.issuer || "Organisasi Sertifikasi",
            issueDate: c.issueDate || "2023",
            status: "active",
          });
        }
      });
    }

    // Achievements sync
    if (Array.isArray(snap.achievements)) {
      snap.achievements.forEach((a: any, idx: number) => {
        const title = typeof a === "string" ? a : a.title;
        if (!title) return;
        const key = title.toLowerCase().trim();
        if (key && !achievementMap.has(key)) {
          achievementMap.set(key, {
            id: a.id || `ach_synced_${idx}_${Date.now()}`,
            title: title,
            issuer: a.issuer || "",
            date: a.date || "2023",
            description: a.description || "",
            metric: a.metric || a.impact || "",
            impact: a.impact || a.metric || "",
          });
        }
      });
    }

    // Languages sync
    if (Array.isArray(snap.languages)) {
      snap.languages.forEach((l: any, idx: number) => {
        const name = typeof l === "string" ? l : l.name;
        if (!name) return;
        const key = name.toLowerCase().trim();
        if (key && !langMap.has(key)) {
          langMap.set(key, {
            id: l.id || `lang_synced_${idx}_${Date.now()}`,
            name: name,
            level: l.level || "Fasih",
          });
        }
      });
    }
  });

  updatedProfile.experiences = Array.from(expMap.values());
  updatedProfile.projects = Array.from(projMap.values());
  updatedProfile.education = Array.from(eduMap.values());
  updatedProfile.skills = Array.from(skillMap.values());
  updatedProfile.certifications = Array.from(certMap.values());
  updatedProfile.achievements = Array.from(achievementMap.values());
  updatedProfile.languages = Array.from(langMap.values());

  return cleanDeduplicatedProfile(updatedProfile);
}

export function cleanDeduplicatedProfile(profile: UserProfileStore): UserProfileStore {
  const expMap = new Map<string, ProfileExperience>();
  (profile.experiences || []).forEach((e) => {
    const nameKey = `${e.company || ""}_${e.role || ""}`.toLowerCase().trim();
    const key = nameKey || e.id;
    if (key) {
      const existing = expMap.get(key);
      if (!existing) {
        expMap.set(key, e);
      } else {
        // Prefer the entry that has non-empty location, custom dates, or Prisma ID
        if (
          (e.id && (!existing.id || e.id.length > existing.id.length)) ||
          (e.location && e.location !== "Remote" && existing.location === "Remote") ||
          (e.bullets && e.bullets.length >= (existing.bullets?.length || 0))
        ) {
          expMap.set(key, e);
        }
      }
    }
  });

  const projMap = new Map<string, ProfileProject>();
  (profile.projects || []).forEach((p) => {
    const key = (p.name || "").toLowerCase().trim() || p.id;
    if (key) projMap.set(key, p);
  });

  const eduMap = new Map<string, ProfileEducation>();
  (profile.education || []).forEach((ed) => {
    const key = `${ed.institution}_${ed.degree}`.toLowerCase().trim() || ed.id;
    if (key) eduMap.set(key, ed);
  });

  const skillMap = new Map<string, ProfileSkill>();
  (profile.skills || []).forEach((s) => {
    const key = (s.name || "").toLowerCase().trim() || s.id;
    if (key) skillMap.set(key, s);
  });

  const certMap = new Map<string, ProfileCertification>();
  (profile.certifications || []).forEach((c) => {
    const key = (c.name || "").toLowerCase().trim() || c.id;
    if (key) certMap.set(key, c);
  });

  const langMap = new Map<string, { id: string; name: string; level: string }>();
  (profile.languages || []).forEach((l) => {
    const key = (l.name || "").toLowerCase().trim() || l.id;
    if (key) langMap.set(key, l);
  });

  const achMap = new Map<string, ProfileAchievement>();
  (profile.achievements || []).forEach((a) => {
    const key = (a.title || "").toLowerCase().trim() || a.id;
    if (key) achMap.set(key, a);
  });

  return {
    ...profile,
    experiences: Array.from(expMap.values()),
    projects: Array.from(projMap.values()),
    education: Array.from(eduMap.values()),
    skills: Array.from(skillMap.values()),
    certifications: Array.from(certMap.values()),
    languages: Array.from(langMap.values()),
    achievements: Array.from(achMap.values()),
  };
}

function getProfileForUser(user: any): UserProfileStore {
  const userId = user?.id || "user_default_1";
  const storageKey = `cvforge_profile_${userId}`;
  let baseProfile: UserProfileStore | null = null;

  if (typeof window !== "undefined") {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        baseProfile = JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    if (!baseProfile || (!baseProfile.experiences?.length && !baseProfile.skills?.length)) {
      const defaultSaved = localStorage.getItem("cvforge_profile_user_default_1");
      if (defaultSaved) {
        try {
          const parsedDefault = JSON.parse(defaultSaved);
          if (parsedDefault && (parsedDefault.experiences?.length || parsedDefault.skills?.length)) {
            baseProfile = parsedDefault;
          }
        } catch {
          // fallback
        }
      }
    }
  }

  const profileToReturn = baseProfile || {
    personalInfo: {
      fullName: user?.name || "",
      email: user?.email || "",
      headline: "",
      summary: "",
      phone: "",
      location: "",
      website: "",
      github: "",
      linkedin: "",
    },
    experiences: [],
    projects: [],
    education: [],
    skills: [],
    certifications: [],
    achievements: [],
    documents: [],
    resumes: [],
  };

  return syncProfileFromResumes(profileToReturn);
}

export function propagateProfileToResumes(profile: UserProfileStore): UserProfileStore {
  const resumes = profile.resumes || [];
  if (resumes.length === 0) return profile;

  const updatedResumes = resumes.map((r) => {
    if (!r.contentSnapshot) return r;
    const snap = { ...r.contentSnapshot };

    // 1. Sync Experiences
    if (profile.experiences?.length) {
      if (!Array.isArray(snap.experiences)) {
        snap.experiences = [];
      }

      snap.experiences = snap.experiences.map((snapExp: any) => {
        const masterMatch = profile.experiences.find(
          (m) =>
            (Boolean(m.id && snapExp.id) && m.id === snapExp.id) ||
            (Boolean(m.company && snapExp.company && m.role && snapExp.role) &&
              m.company.toLowerCase().trim() === (snapExp.company || "").toLowerCase().trim() &&
              m.role.toLowerCase().trim() === (snapExp.role || "").toLowerCase().trim())
        );
        if (masterMatch) {
          return {
            ...snapExp,
            company: masterMatch.company,
            role: masterMatch.role,
            location: masterMatch.location,
            startDate: masterMatch.startDate,
            endDate: masterMatch.endDate,
            isCurrent: masterMatch.isCurrent,
            bullets: Array.isArray(masterMatch.bullets)
              ? masterMatch.bullets.join("\n")
              : masterMatch.bullets || "",
          };
        }
        return snapExp;
      });

      profile.experiences.forEach((masterExp) => {
        const exists = snap.experiences.some(
          (se: any) =>
            (Boolean(se.id && masterExp.id) && se.id === masterExp.id) ||
            (Boolean(se.company && masterExp.company && se.role && masterExp.role) &&
              se.company.toLowerCase().trim() === masterExp.company.toLowerCase().trim() &&
              se.role.toLowerCase().trim() === masterExp.role.toLowerCase().trim())
        );
        if (!exists) {
          snap.experiences.push({
            id: masterExp.id,
            company: masterExp.company,
            role: masterExp.role,
            location: masterExp.location,
            startDate: masterExp.startDate,
            endDate: masterExp.endDate,
            isCurrent: masterExp.isCurrent,
            bullets: Array.isArray(masterExp.bullets)
              ? masterExp.bullets.join("\n")
              : masterExp.bullets || "",
          });
        }
      });
    }

    // 2. Sync Projects
    if (profile.projects?.length) {
      if (!Array.isArray(snap.projects)) snap.projects = [];
      snap.projects = snap.projects.map((snapProj: any) => {
        const masterMatch = profile.projects.find(
          (m) => m.id === snapProj.id || m.name.toLowerCase().trim() === (snapProj.name || "").toLowerCase().trim()
        );
        if (masterMatch) {
          return {
            ...snapProj,
            name: masterMatch.name,
            role: masterMatch.role,
            bullets: masterMatch.description,
            techStack: masterMatch.techStack,
            link: masterMatch.link,
          };
        }
        return snapProj;
      });
      profile.projects.forEach((masterProj) => {
        const exists = snap.projects.some(
          (sp: any) => sp.id === masterProj.id || sp.name.toLowerCase().trim() === masterProj.name.toLowerCase().trim()
        );
        if (!exists) {
          snap.projects.push({
            id: masterProj.id,
            name: masterProj.name,
            role: masterProj.role,
            bullets: masterProj.description,
            techStack: masterProj.techStack,
            link: masterProj.link,
          });
        }
      });
    }

    // 3. Sync Education
    if (profile.education?.length) {
      if (!Array.isArray(snap.education)) snap.education = [];
      snap.education = snap.education.map((snapEdu: any) => {
        const masterMatch = profile.education.find(
          (m) =>
            m.id === snapEdu.id ||
            m.institution.toLowerCase().trim() === (snapEdu.institution || "").toLowerCase().trim()
        );
        if (masterMatch) {
          return {
            ...snapEdu,
            institution: masterMatch.institution,
            degree: masterMatch.degree,
            fieldOfStudy: masterMatch.fieldOfStudy,
            startDate: masterMatch.startDate,
            endDate: masterMatch.endDate,
            gpa: masterMatch.gpa || "",
          };
        }
        return snapEdu;
      });
      profile.education.forEach((masterEdu) => {
        const exists = snap.education.some(
          (se: any) =>
            se.id === masterEdu.id ||
            se.institution.toLowerCase().trim() === masterEdu.institution.toLowerCase().trim()
        );
        if (!exists) {
          snap.education.push({
            id: masterEdu.id,
            institution: masterEdu.institution,
            degree: masterEdu.degree,
            fieldOfStudy: masterEdu.fieldOfStudy,
            startDate: masterEdu.startDate,
            endDate: masterEdu.endDate,
            grade: masterEdu.gpa,
          });
        }
      });
    }

    // 4. Sync Skills
    if (profile.skills?.length) {
      if (!Array.isArray(snap.skills)) snap.skills = [];
      profile.skills.forEach((masterSkill) => {
        const exists = snap.skills.some((ss: any) => {
          const sName = typeof ss === "string" ? ss : ss.name;
          return sName.toLowerCase().trim() === masterSkill.name.toLowerCase().trim();
        });
        if (!exists) {
          snap.skills.push({
            id: masterSkill.id,
            name: masterSkill.name,
            category: masterSkill.category,
          });
        }
      });
    }

    // 5. Sync Certifications
    if (profile.certifications?.length) {
      if (!Array.isArray(snap.certifications)) snap.certifications = [];
      profile.certifications.forEach((masterCert) => {
        const exists = snap.certifications.some((sc: any) => {
          const cName = typeof sc === "string" ? sc : sc.name;
          return (cName || "").toLowerCase().trim() === masterCert.name.toLowerCase().trim();
        });
        if (!exists) {
          snap.certifications.push({
            id: masterCert.id,
            name: masterCert.name,
            issuer: masterCert.issuer,
            issueDate: masterCert.issueDate,
          });
        }
      });
    }

    // 6. Sync Achievements
    if (profile.achievements?.length) {
      if (!Array.isArray(snap.achievements)) snap.achievements = [];
      profile.achievements.forEach((masterAch) => {
        const exists = snap.achievements.some((sa: any) => {
          const aTitle = typeof sa === "string" ? sa : sa.title;
          return (aTitle || "").toLowerCase().trim() === masterAch.title.toLowerCase().trim();
        });
        if (!exists) {
          snap.achievements.push({
            id: masterAch.id,
            title: masterAch.title,
            issuer: masterAch.issuer,
            date: masterAch.date,
            description: masterAch.description,
            metric: masterAch.metric || masterAch.impact,
          });
        }
      });
    }

    // 7. Sync Languages
    if (profile.languages?.length) {
      if (!Array.isArray(snap.languages)) snap.languages = [];
      profile.languages.forEach((masterLang) => {
        const exists = snap.languages.some((sl: any) => {
          const lName = typeof sl === "string" ? sl : sl.name;
          return (lName || "").toLowerCase().trim() === masterLang.name.toLowerCase().trim();
        });
        if (!exists) {
          snap.languages.push({
            id: masterLang.id,
            name: masterLang.name,
            level: masterLang.level,
          });
        }
      });
    }

    return {
      ...r,
      contentSnapshot: snap,
    };
  });

  return {
    ...profile,
    resumes: updatedResumes,
  };
}

export function useUserProfile() {
  const { user } = useAuth();
  const effectiveUserId = user?.id || "user_default_1";
  const [profile, setProfile] = useState<UserProfileStore>(() => getProfileForUser(user));

  // Load profile from Supabase PostgreSQL database on mount or when effectiveUserId changes
  useEffect(() => {
    let isMounted = true;
    const local = getProfileForUser(user);

    fetch(`/api/profile?userId=${encodeURIComponent(effectiveUserId)}`)
      .then((res) => res.json())
      .then((resData) => {
        if (!isMounted) return;
        if (resData.success && resData.data) {
          const dbData = resData.data;
          const merged: UserProfileStore = {
            ...local,
            personalInfo: {
              ...local.personalInfo,
              ...(dbData.personalInfo || {}),
            },
            experiences: dbData.experiences?.length ? dbData.experiences : local.experiences,
            projects: dbData.projects?.length ? dbData.projects : local.projects,
            education: dbData.education?.length ? dbData.education : local.education,
            skills: dbData.skills?.length ? dbData.skills : local.skills,
            certifications: dbData.certifications?.length ? dbData.certifications : local.certifications,
            achievements: dbData.achievements?.length ? dbData.achievements : local.achievements,
            resumes: dbData.resumes?.length ? dbData.resumes : local.resumes,
            documents: dbData.documents?.length ? dbData.documents : local.documents,
          };
          const cleanedMerged = cleanDeduplicatedProfile(merged);
          setProfile(cleanedMerged);
          if (typeof window !== "undefined") {
            localStorage.setItem(`cvforge_profile_${effectiveUserId}`, JSON.stringify(cleanedMerged));
          }
        } else {
          setProfile(local);
        }
      })
      .catch(() => {
        if (isMounted) setProfile(local);
      });

    return () => {
      isMounted = false;
    };
  }, [effectiveUserId]);

  const saveProfile = (newProfile: UserProfileStore) => {
    const syncedProfile = syncProfileFromResumes(newProfile);
    const fullyPropagated = propagateProfileToResumes(syncedProfile);
    const cleanedProfile = cleanDeduplicatedProfile(fullyPropagated);
    setProfile(cleanedProfile);
    if (typeof window !== "undefined") {
      localStorage.setItem(`cvforge_profile_${effectiveUserId}`, JSON.stringify(cleanedProfile));

      // Asynchronously persist to Supabase PostgreSQL database ON USER ACTION ONLY
      fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: effectiveUserId, ...cleanedProfile }),
      })
        .then((res) => res.json())
        .catch((err) => console.error("Database profile sync failed:", err));
    }
  };

  const manualSync = () => {
    const synced = syncProfileFromResumes(profile);
    saveProfile(synced);
    return synced;
  };

  // Profile Completeness Calculation (PRD §42 Weights)
  const calculateCompleteness = (): number => {
    let score = 0;
    // Personal Info (15%): Name & Email = 5%, Phone/Location/Headline = 10%
    if (profile.personalInfo.fullName && profile.personalInfo.email) {
      score += 5;
      if (profile.personalInfo.phone || profile.personalInfo.location || profile.personalInfo.headline) {
        score += 10;
      }
    }
    // Professional Summary (10%)
    if (profile.personalInfo.summary?.trim()) score += 10;
    // Education (15%)
    if (profile.education.length > 0) score += 15;
    // Experience (20%)
    if (profile.experiences.length > 0) score += 20;
    // Projects (15%)
    if (profile.projects.length > 0) score += 15;
    // Skills (15%)
    if (profile.skills.length > 0) score += 15;
    // Certifications (5%)
    if (profile.certifications.length > 0) score += 5;
    // Links (5%)
    if (
      profile.personalInfo.website ||
      profile.personalInfo.github ||
      profile.personalInfo.linkedin ||
      profile.personalInfo.portfolioUrl
    ) {
      score += 5;
    }
    return Math.min(100, score);
  };

  // Calculate Total Verified Facts
  const calculateFactCount = (): number => {
    let count = 0;
    count += profile.experiences.reduce((acc, e) => acc + (e.bullets?.length || 1), 0);
    count += profile.projects.length * 2;
    count += profile.education.length * 2;
    count += profile.skills.length;
    count += profile.certifications.length;
    count += profile.achievements.length;
    return count;
  };

  return {
    profile,
    saveProfile,
    syncFromResumes: manualSync,
    completenessPercentage: calculateCompleteness(),
    verifiedFactCount: calculateFactCount(),
    isDemoUser: !!user?.isDemo,
  };
}

export function exportResumeToDocx(data: {
  fullName: string;
  personalInfo: any;
  summary: string;
  validExperiences: any[];
  validProjects: any[];
  validEducation: any[];
  validSkills: any[];
  validCertifications: any[];
  validLanguages: any[];
}) {
  const {
    fullName,
    personalInfo,
    summary,
    validExperiences,
    validProjects,
    validEducation,
    validSkills,
    validCertifications,
    validLanguages,
  } = data;

  let expHtml = "";
  if (validExperiences.length > 0) {
    expHtml = "<h2>Pengalaman Kerja / Experience</h2>" +
      validExperiences.map((e) => {
        const locStr = e.location ? `<p class="item-sub">${e.location}</p>` : "";
        const bulletItems = (e.bullets || "")
          .split("\n")
          .filter(Boolean)
          .map((b: string) => `<li>${b.replace(/^•\s*/, "")}</li>`)
          .join("");
        const listStr = bulletItems ? `<ul>${bulletItems}</ul>` : "";
        return `<p class="item-header"><strong>${e.role || ""}</strong> — ${e.company || ""} <span style="float:right; font-weight:normal;">(${e.startDate || ""} – ${e.endDate || "Present"})</span></p>${locStr}${listStr}`;
      }).join("");
  }

  let projHtml = "";
  if (validProjects.length > 0) {
    projHtml = "<h2>Pengalaman Project / Projects</h2>" +
      validProjects.map((p) => {
        const roleStr = p.role ? `(${p.role})` : "";
        const techStr = p.techStack && p.techStack.length ? `<p class="item-sub">Tech: ${p.techStack.join(", ")}</p>` : "";
        const bulletItems = (p.bullets || "")
          .split("\n")
          .filter(Boolean)
          .map((b: string) => `<li>${b.replace(/^•\s*/, "")}</li>`)
          .join("");
        const listStr = bulletItems ? `<ul>${bulletItems}</ul>` : "";
        return `<p class="item-header"><strong>${p.name || ""}</strong> ${roleStr}</p>${techStr}${listStr}`;
      }).join("");
  }

  let eduHtml = "";
  if (validEducation.length > 0) {
    eduHtml = "<h2>Pendidikan / Education</h2>" +
      validEducation.map((ed) => {
        const fieldStr = ed.fieldOfStudy ? `(${ed.fieldOfStudy})` : "";
        const gpaStr = ed.gpa ? `<p class="item-sub">GPA: ${ed.gpa}</p>` : "";
        return `<p class="item-header"><strong>${ed.institution || ""}</strong> — ${ed.degree || ""} ${fieldStr} <span style="float:right; font-weight:normal;">(${ed.startDate || ""} – ${ed.endDate || ""})</span></p>${gpaStr}`;
      }).join("");
  }

  let skillHtml = "";
  if (validSkills.length > 0) {
    skillHtml = `<h2>Keahlian / Skills</h2><p>${validSkills.map((s) => (typeof s === "string" ? s : s.name)).join(" • ")}</p>`;
  }

  let certHtml = "";
  if (validCertifications.length > 0) {
    certHtml = `<h2>Sertifikasi / Certifications</h2>` +
      validCertifications.map((c) => `<p><strong>${c.name}</strong> — ${c.issuer} (${c.issueDate})</p>`).join("");
  }

  let langHtml = "";
  if (validLanguages.length > 0) {
    langHtml = `<h2>Penguasaan Bahasa / Languages</h2><p>${validLanguages.map((l) => `${l.name} (${l.level})`).join(" • ")}</p>`;
  }

  const contactStr = [
    personalInfo.email,
    personalInfo.phone,
    personalInfo.cityState || personalInfo.location,
    personalInfo.linkedin,
    personalInfo.portfolioUrl || personalInfo.website,
  ].filter(Boolean).join(" • ");

  const docxTitle = fullName || "Resume";
  const docxBody = [
    "<h1>" + docxTitle + "</h1>",
    "<p class=\"contact\">" + contactStr + "</p>",
    summary ? "<h2>Ringkasan Profil / Summary</h2><p>" + summary + "</p>" : "",
    expHtml,
    projHtml,
    eduHtml,
    skillHtml,
    certHtml,
    langHtml
  ].join("\n");

  const docxContent = "<!DOCTYPE html><html><head><meta charset='utf-8'><title>" + docxTitle + "</title></head><body>" + docxBody + "</body></html>";

  const blob = new Blob(["\ufeff", docxContent], { type: "application/msword" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${docxTitle.replace(/\s+/g, "_")}_CVForge.doc`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

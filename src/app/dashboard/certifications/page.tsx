"use client";

import { useState } from "react";
import {
  Award,
  Plus,
  ExternalLink,
  ShieldCheck,
  Trash2,
  Check,
  X,
  Calendar,
  Building2,
  AlertCircle,
  Upload,
  Layers,
  Filter,
  FileText,
} from "lucide-react";
import { useUserProfile, ProfileCertification } from "@/lib/use-user-profile";

type Status = "active" | "expired" | "pending";

const statusStyles: Record<Status, string> = {
  active: "text-orange-800 bg-orange-50 border-orange-200 dark:text-orange-300 dark:bg-orange-950/60 dark:border-orange-800",
  expired: "text-red-700 bg-red-50 border-red-200",
  pending: "text-amber-700 bg-amber-50 border-amber-200",
};

const statusLabels: Record<Status, string> = {
  active: "Active",
  expired: "Expired",
  pending: "Pending Review",
};

export default function CertificationsPage() {
  const { profile, saveProfile } = useUserProfile();
  const [showAddForm, setShowAddForm] = useState(false);
  const [form, setForm] = useState({
    name: "",
    issuer: "",
    issueDate: "",
    expiryDate: "",
    credentialId: "",
    credentialUrl: "",
    status: "active" as Status,
  });

  const [selectedResumeFilter, setSelectedResumeFilter] = useState<string>("all");
  const [openLinkageCertId, setOpenLinkageCertId] = useState<string | null>(null);
  const savedResumes = profile.resumes || [];

  const certs = profile.certifications || [];

  const getLinkedResumes = (cert: ProfileCertification) => {
    return savedResumes.filter((r) => {
      const snap = r.contentSnapshot?.certifications;
      if (!Array.isArray(snap)) return false;
      return snap.some(
        (c: any) =>
          c.id === cert.id || (c.name || "").toLowerCase() === (cert.name || "").toLowerCase()
      );
    });
  };

  const toggleResumeLink = (cert: ProfileCertification, resumeId: string) => {
    const targetResume = savedResumes.find((r) => r.id === resumeId);
    if (!targetResume) return;

    const currentSnap = targetResume.contentSnapshot || {};
    const currentCerts = currentSnap.certifications || [];

    const exists = currentCerts.some(
      (c: any) =>
        c.id === cert.id || (c.name || "").toLowerCase() === (cert.name || "").toLowerCase()
    );

    let newCerts = [];
    if (exists) {
      newCerts = currentCerts.filter(
        (c: any) =>
          !(c.id === cert.id || (c.name || "").toLowerCase() === (cert.name || "").toLowerCase())
      );
    } else {
      newCerts = [
        ...currentCerts,
        {
          id: cert.id,
          name: cert.name,
          issuer: cert.issuer,
          issueDate: cert.issueDate,
          expiryDate: cert.expiryDate,
          credentialId: cert.credentialId,
          credentialUrl: cert.credentialUrl,
        },
      ];
    }

    const updatedResume = {
      ...targetResume,
      contentSnapshot: {
        ...currentSnap,
        certifications: newCerts,
      },
    };

    const newResumesList = savedResumes.map((r) => (r.id === resumeId ? updatedResume : r));
    saveProfile({
      ...profile,
      resumes: newResumesList,
    });
  };

  const filteredCerts = certs.filter((cert) => {
    if (selectedResumeFilter === "all") return true;
    if (selectedResumeFilter === "unlinked") return getLinkedResumes(cert).length === 0;
    const linked = getLinkedResumes(cert);
    return linked.some((r) => r.id === selectedResumeFilter);
  });

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const save = () => {
    if (!form.name || !form.issuer) return;
    const newCert: ProfileCertification = {
      id: `cert_${Date.now()}`,
      name: form.name,
      issuer: form.issuer,
      issueDate: form.issueDate,
      expiryDate: form.expiryDate,
      credentialId: form.credentialId,
      credentialUrl: form.credentialUrl,
      status: form.status,
      documentLinked: false,
    };

    saveProfile({ ...profile, certifications: [newCert, ...certs] });
    setShowAddForm(false);
    setForm({
      name: "",
      issuer: "",
      issueDate: "",
      expiryDate: "",
      credentialId: "",
      credentialUrl: "",
      status: "active",
    });
  };

  const deleteCert = (id: string) => {
    const targetCert = certs.find((c) => c.id === id);
    const certName = targetCert ? targetCert.name.toLowerCase().trim() : "";
    const updated = certs.filter((c) => c.id !== id);

    const updatedResumes = savedResumes.map((r) => {
      const snap = r.contentSnapshot;
      if (!snap || !Array.isArray(snap.certifications)) return r;
      return {
        ...r,
        contentSnapshot: {
          ...snap,
          certifications: snap.certifications.filter(
            (c: any) => c.id !== id && (typeof c === "string" ? c.toLowerCase().trim() !== certName : (c.name || "").toLowerCase().trim() !== certName)
          ),
        },
      };
    });

    saveProfile({
      ...profile,
      certifications: updated,
      resumes: updatedResumes,
    });
  };

  const toggleDocumentLinked = (id: string) => {
    saveProfile({
      ...profile,
      certifications: certs.map((c) =>
        c.id === id ? { ...c, documentLinked: !c.documentLinked } : c
      ),
    });
  };

  const fmtDate = (d: string) => {
    if (!d) return "No Expiry";
    const [y, m] = d.split("-");
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    return `${months[parseInt(m) - 1]} ${y}`;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#191c1c] dark:text-zinc-100">Certifications</h1>
          <p className="text-sm text-[#727976] dark:text-zinc-400 mt-1">
            Verified industry credentials. Link documents for automatic confidence scoring.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono bg-orange-100 dark:bg-orange-950/60 text-orange-900 dark:text-orange-300 border border-orange-200 dark:border-orange-800 px-2.5 py-1 rounded-md font-semibold">
            5% of profile
          </span>
          <button
            onClick={() => setShowAddForm(true)}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Certification
          </button>
        </div>
      </div>

      {/* Resume Integration Filter Bar */}
      {savedResumes.length > 0 && (
        <div className="bg-white dark:bg-[#1b2220] p-4 rounded-xl border border-[#e1e3e2] dark:border-[#242c2a] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs shadow-xs">
          <div className="flex items-center gap-2 text-[#191c1c] dark:text-zinc-200 font-semibold">
            <Layers className="w-4 h-4 text-orange-600 dark:text-orange-400" />
            <span>Integrasi CV Target ({savedResumes.length} Resume):</span>
            <span className="text-[#727976] dark:text-zinc-400 font-normal hidden md:inline">
              Filter sertifikasi yang terhubung ke versi CV tertentu
            </span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-3.5 h-3.5 text-[#727976] dark:text-zinc-400" />
            <select
              value={selectedResumeFilter}
              onChange={(e) => setSelectedResumeFilter(e.target.value)}
              className="w-full sm:w-auto px-3 py-1.5 rounded-lg border border-[#e1e3e2] dark:border-[#242c2a] bg-[#f8faf9] dark:bg-[#121816] text-[#191c1c] dark:text-zinc-200 text-xs font-semibold focus:outline-none focus:border-orange-500"
            >
              <option value="all">Semua Sertifikasi (Master Profile)</option>
              {savedResumes.map((r) => (
                <option key={r.id} value={r.id}>
                  📄 {r.title} ({r.role})
                </option>
              ))}
              <option value="unlinked">⚠️ Belum Terhubung ke CV Manapun</option>
            </select>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total", value: certs.length },
          {
            label: "Active",
            value: certs.filter((c) => c.status === "active").length,
          },
          {
            label: "Document Linked",
            value: certs.filter((c) => c.documentLinked).length,
          },
        ].map(({ label, value }) => (
          <div
            key={label}
            className="bg-white dark:bg-[#1b2220] rounded-xl border border-[#e1e3e2] dark:border-[#242c2a] px-5 py-4 text-center"
          >
            <p className="text-2xl font-bold text-[#191c1c] dark:text-zinc-100">{value}</p>
            <p className="text-xs text-[#727976] dark:text-zinc-400 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Add Form */}
      {showAddForm && (
        <div className="bg-white dark:bg-[#1b2220] border-2 border-orange-500 dark:border-orange-600 rounded-xl p-6 space-y-4 shadow-sm">
          <h2 className="text-base font-bold text-[#191c1c] dark:text-zinc-100">
            Add Certification
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-1">
              <label className="text-xs font-medium text-[#191c1c] dark:text-zinc-300">
                Certification Name *
              </label>
              <input
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="e.g. AWS Certified Solutions Architect"
                className="w-full border border-[#e1e3e2] dark:border-[#242c2a] bg-white dark:bg-[#121816] text-[#191c1c] dark:text-zinc-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-[#191c1c] dark:text-zinc-300">
                Issuing Organization *
              </label>
              <input
                value={form.issuer}
                onChange={(e) => set("issuer", e.target.value)}
                placeholder="e.g. Amazon Web Services"
                className="w-full border border-[#e1e3e2] dark:border-[#242c2a] bg-white dark:bg-[#121816] text-[#191c1c] dark:text-zinc-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-[#191c1c] dark:text-zinc-300">
                Credential ID
              </label>
              <input
                value={form.credentialId}
                onChange={(e) => set("credentialId", e.target.value)}
                placeholder="e.g. AWS-CSA-2024-001"
                className="w-full border border-[#e1e3e2] dark:border-[#242c2a] bg-white dark:bg-[#121816] text-[#191c1c] dark:text-zinc-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-[#191c1c] dark:text-zinc-300">
                Issue Date
              </label>
              <input
                type="month"
                value={form.issueDate}
                onChange={(e) => set("issueDate", e.target.value)}
                className="w-full border border-[#e1e3e2] dark:border-[#242c2a] bg-white dark:bg-[#121816] text-[#191c1c] dark:text-zinc-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-[#191c1c] dark:text-zinc-300">
                Expiry Date
              </label>
              <input
                type="month"
                value={form.expiryDate}
                onChange={(e) => set("expiryDate", e.target.value)}
                placeholder="Leave blank if no expiry"
                className="w-full border border-[#e1e3e2] dark:border-[#242c2a] bg-white dark:bg-[#121816] text-[#191c1c] dark:text-zinc-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
              />
            </div>
            <div className="col-span-2 space-y-1">
              <label className="text-xs font-medium text-[#191c1c] dark:text-zinc-300">
                Credential URL
              </label>
              <input
                value={form.credentialUrl}
                onChange={(e) => set("credentialUrl", e.target.value)}
                placeholder="https://..."
                className="w-full border border-[#e1e3e2] dark:border-[#242c2a] bg-white dark:bg-[#121816] text-[#191c1c] dark:text-zinc-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
              />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button
              onClick={save}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              <Check className="w-4 h-4" /> Save
            </button>
            <button
              onClick={() => setShowAddForm(false)}
              className="inline-flex items-center gap-2 border border-[#e1e3e2] dark:border-[#242c2a] text-[#727976] dark:text-zinc-300 px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#f2f4f3] dark:hover:bg-[#242c2a] transition-colors"
            >
              <X className="w-4 h-4" /> Cancel
            </button>
          </div>
        </div>
      )}

      {/* Cert Cards */}
      <div className="space-y-3">
        {filteredCerts.map((cert) => (
          <div
            key={cert.id}
            className="bg-white dark:bg-[#1b2220] rounded-xl border border-[#e1e3e2] dark:border-[#242c2a] px-6 py-4 hover:shadow-sm transition-shadow"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-950/40 flex items-center justify-center flex-shrink-0">
                  <Award className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-[#191c1c] dark:text-zinc-100 leading-tight">
                    {cert.name}
                  </h2>
                  <div className="flex items-center gap-2 mt-1 text-xs text-[#727976] dark:text-zinc-400">
                    <Building2 className="w-3.5 h-3.5" />
                    <span>{cert.issuer}</span>
                    {cert.issueDate && (
                      <>
                        <span>·</span>
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Issued {fmtDate(cert.issueDate)}</span>
                      </>
                    )}
                    {cert.expiryDate && (
                      <>
                        <span>·</span>
                        <span>Expires {fmtDate(cert.expiryDate)}</span>
                      </>
                    )}
                  </div>
                  {cert.credentialId && (
                    <p className="text-xs text-[#9ea8a3] dark:text-zinc-500 mt-1 font-mono">
                      ID: {cert.credentialId}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <span
                      className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                        statusStyles[cert.status]
                      }`}
                    >
                      {statusLabels[cert.status]}
                    </span>
                    {cert.documentLinked ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-orange-900 dark:text-orange-300 bg-orange-100 dark:bg-orange-950/60 border border-orange-200 dark:border-orange-800 px-2 py-0.5 rounded-full">
                        <ShieldCheck className="w-3 h-3 text-orange-600 dark:text-orange-400" /> Verified Document
                      </span>
                    ) : (
                      <button
                        onClick={() => toggleDocumentLinked(cert.id)}
                        className="inline-flex items-center gap-1 text-[10px] text-[#727976] dark:text-zinc-300 bg-[#f2f4f3] dark:bg-[#121816] hover:bg-orange-100 dark:hover:bg-orange-950/40 border border-[#e1e3e2] dark:border-[#242c2a] px-2 py-0.5 rounded-full transition-colors"
                        title="Click to link document"
                      >
                        <AlertCircle className="w-3 h-3 text-amber-500" /> Link document proof
                      </button>
                    )}
                  </div>

                  {/* Resume Linkage Badges & Manager */}
                  <div className="flex items-center gap-1.5 flex-wrap pt-2 mt-2 border-t border-[#edeeee] dark:border-[#242c2a]">
                    <span className="text-[10px] font-mono text-[#727976] dark:text-zinc-400 uppercase font-bold">Tercantum di CV:</span>
                    {getLinkedResumes(cert).length === 0 ? (
                      <span className="text-[10px] italic text-[#727976] dark:text-zinc-500">Belum dihubungkan ke CV manapun</span>
                    ) : (
                      getLinkedResumes(cert).map((r) => (
                        <span
                          key={r.id}
                          className="text-[10px] bg-orange-50 dark:bg-orange-950/60 text-orange-900 dark:text-orange-300 border border-orange-200 dark:border-orange-900/60 px-2 py-0.5 rounded-full font-mono font-semibold flex items-center gap-1"
                        >
                          <FileText className="w-3 h-3 text-orange-600 dark:text-orange-400" /> {r.title}
                        </span>
                      ))
                    )}

                    {savedResumes.length > 0 && (
                      <div className="relative inline-block ml-1" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => setOpenLinkageCertId(openLinkageCertId === cert.id ? null : cert.id)}
                          className="text-[10px] bg-orange-100 dark:bg-orange-950/60 text-orange-900 dark:text-orange-300 hover:bg-orange-200 px-2 py-0.5 rounded-full font-semibold flex items-center gap-1 transition-colors shadow-2xs border border-transparent dark:border-orange-800"
                        >
                          <Plus className="w-2.5 h-2.5" /> Hubungkan ke CV Target
                        </button>

                        {openLinkageCertId === cert.id && (
                          <div className="absolute left-0 mt-1 w-64 bg-white dark:bg-[#1b2220] border border-[#e1e3e2] dark:border-[#242c2a] rounded-xl shadow-xl p-3 z-50 space-y-2 text-xs">
                            <div className="flex items-center justify-between border-b border-[#edeeee] dark:border-[#242c2a] pb-1.5">
                              <span className="font-bold text-[#191c1c] dark:text-zinc-100">Pilih Target CV</span>
                              <button
                                type="button"
                                onClick={() => setOpenLinkageCertId(null)}
                                className="text-[#727976] dark:text-zinc-400 hover:text-[#191c1c] dark:hover:text-zinc-100"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            <div className="space-y-1 max-h-48 overflow-y-auto">
                              {savedResumes.map((r) => {
                                const isLinked = getLinkedResumes(cert).some((lr) => lr.id === r.id);
                                return (
                                  <div
                                    key={r.id}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleResumeLink(cert, r.id);
                                    }}
                                    className="flex items-center justify-between p-1.5 rounded-lg hover:bg-[#f8faf9] dark:hover:bg-[#242c2a] cursor-pointer text-xs transition-colors select-none"
                                  >
                                    <span className="font-medium text-[#191c1c] dark:text-zinc-200 truncate max-w-[170px]">
                                      📄 {r.title}
                                    </span>
                                    <input
                                      type="checkbox"
                                      checked={isLinked}
                                      onChange={() => {}}
                                      className="rounded text-orange-600 focus:ring-orange-500 cursor-pointer"
                                    />
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                {cert.credentialUrl && (
                  <a
                    href={cert.credentialUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg hover:bg-[#f2f4f3] dark:hover:bg-[#242c2a] text-[#727976] dark:text-zinc-400 hover:text-[#191c1c] dark:hover:text-zinc-100 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
                {!cert.documentLinked && (
                  <button
                    onClick={() => toggleDocumentLinked(cert.id)}
                    className="p-2 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-950/60 text-[#727976] dark:text-zinc-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
                    title="Upload document"
                  >
                    <Upload className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => deleteCert(cert.id)}
                  className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 text-[#727976] dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {certs.length === 0 && !showAddForm && (
        <div className="text-center py-16 bg-white dark:bg-[#1b2220] border border-[#e1e3e2] dark:border-[#242c2a] rounded-xl p-8 space-y-3">
          <Award className="w-12 h-12 mx-auto text-orange-400" />
          <h3 className="text-base font-bold text-[#191c1c] dark:text-zinc-100">
            Belum ada sertifikasi
          </h3>
          <p className="text-sm text-[#727976] dark:text-zinc-400 max-w-sm mx-auto">
            Tambahkan sertifikasi profesional untuk memverifikasi keahlian Anda.
          </p>
          <button
            onClick={() => setShowAddForm(true)}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Certification
          </button>
        </div>
      )}
    </div>
  );
}

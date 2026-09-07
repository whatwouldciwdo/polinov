"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Toast from "@/components/Toast";

interface MemberFormItem {
  id: string;
  name: string;
  nip: string;
  position: string;
  photoFile: File | null;
  photoPreview: string | null;
}

export default function CreateCandidatePage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Form inputs for Makalah
  const [title, setTitle] = useState("");
  const [makalahFile, setMakalahFile] = useState<File | null>(null);

  // Default 2 Member Cards
  const [members, setMembers] = useState<MemberFormItem[]>([
    {
      id: "member-1",
      name: "",
      nip: "",
      position: "",
      photoFile: null,
      photoPreview: null,
    },
    {
      id: "member-2",
      name: "",
      nip: "",
      position: "",
      photoFile: null,
      photoPreview: null,
    },
  ]);

  // Add new member card
  const handleAddMember = () => {
    setMembers((prev) => [
      ...prev,
      {
        id: `member-${Date.now()}`,
        name: "",
        nip: "",
        position: "",
        photoFile: null,
        photoPreview: null,
      },
    ]);
  };

  // Remove member card
  const handleRemoveMember = (id: string) => {
    if (members.length <= 1) {
      setError("Minimal harus ada 1 anggota kandidat inovator.");
      return;
    }
    setMembers((prev) => prev.filter((m) => m.id !== id));
  };

  // Update member field
  const handleMemberChange = (
    id: string,
    field: "name" | "nip" | "position",
    value: string
  ) => {
    setMembers((prev) =>
      prev.map((m) => (m.id === id ? { ...m, [field]: value } : m))
    );
  };

  // Handle photo file change for specific member
  const handlePhotoChange = (id: string, file: File | null) => {
    if (!file) return;
    const previewUrl = URL.createObjectURL(file);
    setMembers((prev) =>
      prev.map((m) =>
        m.id === id
          ? { ...m, photoFile: file, photoPreview: previewUrl }
          : m
      )
    );
  };

  // Remove photo for specific member
  const handleRemovePhoto = (id: string) => {
    setMembers((prev) =>
      prev.map((m) =>
        m.id === id ? { ...m, photoFile: null, photoPreview: null } : m
      )
    );
  };

  // Form Submit
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!title.trim()) {
      setError("Judul inovasi / makalah wajib diisi.");
      return;
    }

    if (!makalahFile) {
      setError("Berkas makalah (PDF) wajib diunggah.");
      return;
    }

    // Check if at least first member has name
    const validMembers = members.filter((m) => m.name.trim() !== "");
    if (validMembers.length === 0) {
      setError("Silakan lengkapi setidaknya 1 nama kandidat inovator.");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("name", title.trim());
      formData.append("file", makalahFile);

      // Clean members data for JSON
      const membersData = validMembers.map((m) => ({
        name: m.name.trim(),
        nip: m.nip.trim(),
        position: m.position.trim(),
        photo: null,
      }));

      formData.append("members_data", JSON.stringify(membersData));

      // Append photo files with index matching validMembers
      validMembers.forEach((m, idx) => {
        if (m.photoFile) {
          formData.append(`member_photo_${idx}`, m.photoFile);
        }
      });

      const res = await fetch("/api/admin/candidates", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        router.push("/dashboard/candidates");
      } else {
        setError(data.error || "Terjadi kesalahan saat menyimpan data.");
        setLoading(false);
      }
    } catch (err: any) {
      console.error(err);
      setError("Gagal terhubung ke server.");
      setLoading(false);
    }
  };

  return (
    <>
      {error && <Toast type="error" message={error} />}

      {/* Breadcrumb */}
      <nav className="mb-6">
        <div className="inline-flex items-center gap-2 neu-pill-inset px-4 py-2 text-xs font-medium text-gray-400">
          <Link href="/dashboard" className="text-purple-400 hover:underline">
            Dashboard
          </Link>
          <span>/</span>
          <Link
            href="/dashboard/candidates"
            className="text-purple-400 hover:underline"
          >
            Makalah
          </Link>
          <span>/</span>
          <span className="text-gray-200 font-semibold">Tambah Makalah</span>
        </div>
      </nav>

      {/* Top Header Panel */}
      <div className="w-full max-w-7xl neu-panel p-6 mb-8 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-wide">
            Tambah Makalah Inovasi
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Daftarkan berkas karya inovasi dan kelola tim kandidat inovator 2026.
          </p>
        </div>
        <Link href="/dashboard/candidates">
          <button
            type="button"
            className="neu-btn px-4 py-2 text-xs font-semibold text-gray-300 hover:text-white"
          >
            &larr; Kembali ke Data Makalah
          </button>
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="w-full max-w-7xl">
        {/* GRID SPLIT: KIRI (MAKALAH) & KANAN (TIM INOVATOR) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* ================= CARD KIRI: INFORMASI MAKALAH INOVASI ================= */}
          <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-6">
            <div className="neu-panel p-6 sm:p-8 border border-white/5 space-y-6">
              
              {/* Header Card Kiri */}
              <div className="flex items-center gap-3 pb-4 border-b border-white/5">
                <span className="neu-icon-well w-8 h-8 text-sm font-bold text-purple-400">
                  1
                </span>
                <div>
                  <h2 className="text-base font-bold text-white tracking-wide">
                    Informasi Makalah Inovasi
                  </h2>
                  <p className="text-xs text-gray-400">
                    Detail judul dan berkas dokumen makalah.
                  </p>
                </div>
              </div>

              {/* Judul Inovasi */}
              <div>
                <label
                  htmlFor="title"
                  className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2"
                >
                  Judul Inovasi / Makalah <span className="text-red-400">*</span>
                </label>
                <div className="neu-inset px-4 py-1.5">
                  <textarea
                    id="title"
                    rows={3}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full py-2 bg-transparent border-none focus:outline-none text-white text-sm placeholder-gray-500 resize-none"
                    placeholder="cth. Optimalisasi Efisiensi Turbin Uap Berbasis IoT dan AI"
                    required
                  ></textarea>
                </div>
              </div>

              {/* Berkas Makalah */}
              <div>
                <label
                  htmlFor="file"
                  className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2"
                >
                  Berkas Makalah (PDF / Dokumen) <span className="text-red-400">*</span>
                </label>
                <div className="neu-inset p-3.5 space-y-3">
                  <input
                    type="file"
                    id="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setMakalahFile(e.target.files[0]);
                      }
                    }}
                    className="w-full text-xs text-gray-400 file:mr-3 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-500 cursor-pointer"
                    required
                  />
                  {makalahFile ? (
                    <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 neu-pill px-3 py-1.5 border border-emerald-500/20">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                      <span className="truncate">{makalahFile.name}</span>
                      <span className="text-gray-400">({(makalahFile.size / 1024).toFixed(0)} KB)</span>
                    </div>
                  ) : (
                    <p className="text-[11px] text-gray-500">Format yang didukung: PDF, DOC, DOCX</p>
                  )}
                </div>
              </div>

              {/* Action Buttons in Left Card */}
              <div className="pt-4 border-t border-white/5 space-y-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full neu-btn-primary py-3.5 text-sm font-bold tracking-wide disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <svg
                        className="animate-spin h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      <span>Menyimpan Makalah...</span>
                    </>
                  ) : (
                    <span>Simpan Makalah &amp; Kandidat</span>
                  )}
                </button>

                <Link href="/dashboard/candidates" className="block">
                  <button
                    type="button"
                    className="w-full neu-btn py-2.5 text-xs font-semibold text-gray-400 hover:text-white"
                  >
                    Batal
                  </button>
                </Link>
              </div>

            </div>
          </div>

          {/* ================= CARD KANAN: TIM KANDIDAT INOVATOR ================= */}
          <div className="lg:col-span-7 space-y-6">
            <div className="neu-panel p-6 sm:p-8 border border-white/5 space-y-6">
              
              {/* Header Card Kanan */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
                <div className="flex items-center gap-3">
                  <span className="neu-icon-well w-8 h-8 text-sm font-bold text-purple-400">
                    2
                  </span>
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-white tracking-wide">
                      Tim Kandidat Inovator
                    </h2>
                    <p className="text-xs text-gray-400">
                      Tambahkan foto, nama, NIP, dan jabatan anggota tim inovasi.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 self-start sm:self-auto">
                  <span className="neu-pill-inset px-3 py-1 text-xs text-purple-400 font-semibold font-mono">
                    {members.length} Kandidat
                  </span>
                  <button
                    type="button"
                    onClick={handleAddMember}
                    className="neu-btn-primary px-3.5 py-1.5 text-xs font-bold flex items-center gap-1.5"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="13"
                      height="13"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="12" y1="5" x2="12" y2="19"></line>
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                    <span>Tambah Card</span>
                  </button>
                </div>
              </div>

              {/* Dynamic Member Cards List */}
              <div className="space-y-5">
                {members.map((member, index) => (
                  <div
                    key={member.id}
                    className="neu-card p-5 sm:p-6 border border-white/5 space-y-4 relative transition-all"
                  >
                    {/* Card Inner Header */}
                    <div className="flex items-center justify-between pb-3 border-b border-white/5">
                      <div className="flex items-center gap-2">
                        <span className="neu-icon-well w-7 h-7 text-xs font-bold text-purple-400">
                          {index + 1}
                        </span>
                        <span className="text-sm font-bold text-white">
                          {index === 0
                            ? "Kandidat 1 (Ketua / Inovator Utama)"
                            : `Kandidat ${index + 1}`}
                        </span>
                      </div>

                      {members.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveMember(member.id)}
                          className="neu-btn px-3 py-1 text-xs text-red-400 hover:text-red-300 font-semibold flex items-center gap-1"
                          title="Hapus Card Kandidat Ini"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                          </svg>
                          <span>Hapus</span>
                        </button>
                      )}
                    </div>

                    {/* Card Body: Foto + Inputs */}
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-start">
                      
                      {/* FOTO KANDIDAT (4 Columns) */}
                      <div className="sm:col-span-4 flex flex-col items-center justify-center p-3.5 neu-inset rounded-2xl border border-white/5 text-center">
                        <div className="relative w-24 h-24 mb-2.5 rounded-2xl overflow-hidden neu-panel flex items-center justify-center border border-white/10 group">
                          {member.photoPreview ? (
                            <img
                              src={member.photoPreview}
                              alt={`Foto ${member.name || "Kandidat"}`}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="flex flex-col items-center text-gray-500">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="32"
                                height="32"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                <circle cx="12" cy="7" r="4"></circle>
                              </svg>
                              <span className="text-[10px] mt-1 text-gray-400">Tanpa Foto</span>
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col gap-1.5 w-full">
                          <label className="neu-btn px-2.5 py-1.5 text-xs text-purple-300 hover:text-white font-semibold cursor-pointer text-center">
                            <span>{member.photoPreview ? "Ganti Foto" : "Unggah Foto"}</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                if (e.target.files && e.target.files[0]) {
                                  handlePhotoChange(member.id, e.target.files[0]);
                                }
                              }}
                              className="hidden"
                            />
                          </label>
                          {member.photoPreview && (
                            <button
                              type="button"
                              onClick={() => handleRemovePhoto(member.id)}
                              className="text-[10px] text-red-400 hover:underline"
                            >
                              Hapus Foto
                            </button>
                          )}
                        </div>
                      </div>

                      {/* INPUTS: NAMA, NIP, JABATAN (8 Columns) */}
                      <div className="sm:col-span-8 space-y-3.5">
                        {/* Nama */}
                        <div>
                          <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">
                            Nama Lengkap <span className="text-red-400">*</span>
                          </label>
                          <div className="neu-inset px-3.5 py-1">
                            <input
                              type="text"
                              value={member.name}
                              onChange={(e) =>
                                handleMemberChange(member.id, "name", e.target.value)
                              }
                              placeholder="cth. Budi Santoso, S.T."
                              className="w-full py-1.5 bg-transparent border-none focus:outline-none text-white text-sm placeholder-gray-500"
                              required
                            />
                          </div>
                        </div>

                        {/* NIP */}
                        <div>
                          <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">
                            NIP Kandidat
                          </label>
                          <div className="neu-inset px-3.5 py-1">
                            <input
                              type="text"
                              value={member.nip}
                              onChange={(e) =>
                                handleMemberChange(member.id, "nip", e.target.value)
                              }
                              placeholder="cth. 198803152014021002"
                              className="w-full py-1.5 bg-transparent border-none focus:outline-none text-white text-sm placeholder-gray-500 font-mono"
                            />
                          </div>
                        </div>

                        {/* Jabatan / Divisi */}
                        <div>
                          <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">
                            Jabatan / Divisi
                          </label>
                          <div className="neu-inset px-3.5 py-1">
                            <input
                              type="text"
                              value={member.position}
                              onChange={(e) =>
                                handleMemberChange(member.id, "position", e.target.value)
                              }
                              placeholder="cth. Supervisor Pemeliharaan Mesin"
                              className="w-full py-1.5 bg-transparent border-none focus:outline-none text-white text-sm placeholder-gray-500"
                            />
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>
                ))}
              </div>

              {/* Bottom Add Card Button */}
              <div className="pt-2 flex justify-center">
                <button
                  type="button"
                  onClick={handleAddMember}
                  className="neu-btn px-6 py-2.5 text-xs font-semibold text-purple-300 hover:text-white flex items-center gap-2 border border-purple-500/20"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="16"></line>
                    <line x1="8" y1="12" x2="16" y2="12"></line>
                  </svg>
                  <span>+ Tambah Card Kandidat Lainnya</span>
                </button>
              </div>

            </div>
          </div>

        </div>
      </form>
    </>
  );
}

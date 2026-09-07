"use client";

import { useState, useEffect, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Toast from "@/components/Toast";
import DocumentViewer from "@/components/DocumentViewer";
import { EVALUATION_CRITERIA } from "@/lib/criteria";
import { formatFileUrl } from "@/lib/fileUrl";

interface MemberItem {
  name: string;
  nip?: string;
  position?: string;
  photo?: string | null;
}

interface Candidate {
  id: number;
  name: string;
  file?: string | null;
  members?: MemberItem[] | string | null;
}

export default function ScorePage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<string>("");
  const [selectedScores, setSelectedScores] = useState<Record<number, number | "">>({
    1: "",
    2: "",
    3: "",
    4: "",
    5: "",
    6: "",
    7: "",
  });
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [viewerOpen, setViewerOpen] = useState(false);

  useEffect(() => {
    fetch("/api/candidates")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setCandidates(data);
        }
      })
      .catch((err) => console.error("Error fetching candidates:", err));
  }, []);

  // Find currently selected candidate
  const activeCandidate = useMemo(() => {
    return candidates.find((c) => String(c.id) === String(selectedCandidate));
  }, [candidates, selectedCandidate]);

  // Parse active candidate's members
  const activeMembers: MemberItem[] = useMemo(() => {
    if (!activeCandidate?.members) return [];
    if (Array.isArray(activeCandidate.members)) return activeCandidate.members;
    if (typeof activeCandidate.members === "string") {
      try {
        return JSON.parse(activeCandidate.members);
      } catch {
        return [];
      }
    }
    return [];
  }, [activeCandidate]);

  const handleScoreChange = (criterionId: number, value: string) => {
    setSelectedScores((prev) => ({
      ...prev,
      [criterionId]: value === "" ? "" : Number(value),
    }));
  };

  // Calculate realtime total score
  const totalScore = useMemo(() => {
    let sum = 0;
    for (const criterion of EVALUATION_CRITERIA) {
      const val = selectedScores[criterion.id];
      if (typeof val === "number") {
        sum += val * criterion.weight;
      }
    }
    return Math.round(sum * 100) / 100;
  }, [selectedScores]);

  // Count how many criteria have been answered
  const answeredCount = useMemo(() => {
    return Object.values(selectedScores).filter((val) => typeof val === "number").length;
  }, [selectedScores]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!selectedCandidate) {
      setError("Silakan pilih judul makalah inovasi terlebih dahulu.");
      return;
    }

    // Check if all 7 criteria are selected
    for (const criterion of EVALUATION_CRITERIA) {
      if (selectedScores[criterion.id] === "" || typeof selectedScores[criterion.id] !== "number") {
        setError(`Kriteria ${criterion.id} (${criterion.title}) belum dinilai.`);
        return;
      }
    }

    setLoading(true);

    const formattedScores = EVALUATION_CRITERIA.map((c) => ({
      criterion_id: c.id,
      score: selectedScores[c.id],
      weight: c.weight,
    }));

    try {
      const res = await fetch("/api/scores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidate_id: selectedCandidate,
          scores: formattedScores,
          feedback: feedback.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Terjadi kesalahan saat menyimpan nilai.");
        setLoading(false);
        return;
      }

      router.push(`/dashboard/after-score/${data.id}`);
    } catch (err) {
      console.error(err);
      setError("Gagal terhubung ke server.");
      setLoading(false);
    }
  };

  return (
    <>
      {error && <Toast type="error" message={error} />}
      
      <div className="min-h-screen py-8 px-4 sm:px-6 font-cabin bg-[#1e2029] text-gray-100 flex flex-col items-center">
        
        {/* Top Header Panel */}
        <div className="w-full max-w-7xl neu-panel p-6 sm:p-8 mb-8 flex flex-col sm:flex-row items-center justify-between gap-4 border border-white/5">
          <div>
            <span className="inline-block px-3 py-1 text-xs font-semibold text-purple-400 neu-pill-inset uppercase tracking-wider mb-2">
              Lembar Penilaian Juri &bull; Standar Bobot 2026
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Form Penilaian Inovasi 2026
            </h1>
            <p className="text-xs text-gray-400 mt-1 font-sans">
              Evaluasi karya inovasi berdasarkan 7 Kriteria Standar POLINOV (Total Bobot 100%)
            </p>
          </div>
          <Link href="/dashboard">
            <button type="button" className="neu-btn px-5 py-2.5 text-xs font-semibold text-gray-300 hover:text-white">
              &larr; Kembali ke Home
            </button>
          </Link>
        </div>

        {/* MAIN LAYOUT: KIRI (FORM PENILAIAN) & KANAN (INFORMASI KANDIDAT) */}
        <form onSubmit={handleSubmit} className="w-full max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* ================= KOLOM KIRI (7 COLUMNS): LEMBAR PENILAIAN ================= */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Card 1: Pilih Judul Makalah Inovasi */}
              <div className="neu-card p-6 sm:p-7 border border-white/5 space-y-3">
                <div className="flex items-center gap-2.5 pb-2 border-b border-white/5">
                  <span className="neu-icon-well w-7 h-7 text-xs font-bold text-purple-400">
                    #
                  </span>
                  <div>
                    <h2 className="text-base font-bold text-white tracking-wide">
                      Pilih Judul Makalah Inovasi
                    </h2>
                    <p className="text-xs text-gray-400">
                      Tentukan karya inovasi yang akan Anda evaluasi nilainya
                    </p>
                  </div>
                </div>

                <div className="neu-inset p-1.5 mt-2">
                  <select
                    name="candidate_id"
                    value={selectedCandidate}
                    onChange={(e) => setSelectedCandidate(e.target.value)}
                    className="w-full p-2.5 bg-transparent text-gray-200 focus:outline-none rounded-xl text-sm cursor-pointer"
                    required
                  >
                    <option value="" className="bg-[#1a1c24] text-gray-400">
                      -- Pilih Judul Makalah Inovasi --
                    </option>
                    {candidates.map((cd) => (
                      <option key={cd.id} value={cd.id} className="bg-[#1a1c24] text-gray-200">
                        {cd.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Realtime Live Score Preview Banner */}
              <div className="neu-panel p-5 border border-purple-500/20 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="neu-icon-well w-11 h-11 text-purple-400 font-bold text-lg flex items-center justify-center">
                    &Sigma;
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-medium">Status Penilaian:</p>
                    <p className="text-sm font-semibold text-white">
                      {answeredCount} dari {EVALUATION_CRITERIA.length} Kriteria Terisi
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-400 uppercase tracking-wider">Perkiraan Nilai:</span>
                  <div className="neu-pill px-4 py-2 text-xl font-bold text-purple-400 font-mono border border-purple-500/30">
                    {totalScore.toFixed(2)} <span className="text-xs font-normal text-gray-400">/ 100</span>
                  </div>
                </div>
              </div>

              {/* Section: 7 Kriteria Penilaian */}
              <div className="space-y-6">
                {EVALUATION_CRITERIA.map((criterion) => {
                  const currentVal = selectedScores[criterion.id];
                  const subtotal = typeof currentVal === "number" 
                    ? (currentVal * criterion.weight).toFixed(2) 
                    : "0.00";

                  return (
                    <div key={criterion.id} className="neu-card p-6 sm:p-7 border border-white/5 space-y-4">
                      {/* Top Bar of Criterion */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-white/5">
                        <div className="flex items-center gap-3">
                          <span className="neu-icon-well w-8 h-8 text-xs font-bold text-purple-400">
                            {criterion.id}
                          </span>
                          <h3 className="text-base font-bold text-white">
                            {criterion.title}
                          </h3>
                        </div>
                        <div className="flex items-center gap-2 self-start sm:self-auto">
                          <span className="neu-pill-inset px-3 py-1 text-xs text-purple-400 font-bold">
                            Bobot {criterion.weightPercent}
                          </span>
                          {typeof currentVal === "number" && (
                            <span className="neu-pill px-3 py-1 text-xs text-emerald-400 font-mono font-semibold">
                              +{subtotal} Poin
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Context: Focus & Indicator */}
                      <div className="neu-inset p-3.5 rounded-xl text-xs space-y-1.5 font-sans border border-white/5">
                        <div>
                          <span className="text-gray-400 font-semibold">Fokus Penilaian: </span>
                          <span className="text-gray-300">{criterion.focus}</span>
                        </div>
                        <div>
                          <span className="text-gray-400 font-semibold">Indikator: </span>
                          <span className="text-gray-300">{criterion.indicator}</span>
                        </div>
                      </div>

                      {/* Options Dropdown */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                          Pilih Nilai &amp; Deskripsi Rubrik:
                        </label>
                        <div className="neu-inset p-1">
                          <select
                            value={selectedScores[criterion.id]}
                            onChange={(e) => handleScoreChange(criterion.id, e.target.value)}
                            className="w-full p-2.5 bg-transparent text-gray-200 focus:outline-none rounded-xl text-sm cursor-pointer"
                            required
                          >
                            <option value="" className="bg-[#1a1c24] text-gray-400">
                              -- Pilih Nilai Evaluasi (0 - 100) --
                            </option>
                            {criterion.options.map((opt) => (
                              <option
                                key={opt.value}
                                value={opt.value}
                                className="bg-[#1a1c24] text-gray-200"
                              >
                                {opt.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Section: Feedback / Catatan Juri */}
              <div className="neu-card p-6 sm:p-7 border border-white/5 space-y-3">
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <span className="neu-icon-well w-7 h-7 text-xs text-purple-400">&para;</span>
                  Feedback / Catatan Evaluasi Juri <span className="text-xs font-normal text-gray-400">(Opsional)</span>
                </h2>
                <p className="text-xs text-gray-400">
                  Berikan catatan masukan, apresiasi, atau saran penyempurnaan karya inovasi bagi peserta:
                </p>
                <div className="neu-inset p-2">
                  <textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    rows={3}
                    placeholder="Tuliskan feedback atau rekomendasi Anda untuk inovasi ini..."
                    className="w-full p-2 bg-transparent text-gray-200 focus:outline-none rounded-xl text-sm resize-y"
                  ></textarea>
                </div>
              </div>

              {/* Note below feedback */}
              <div className="text-right">
                <p className="text-[11px] text-gray-500 italic">
                  * Pastikan semua 7 kriteria telah terisi sebelum menyimpan nilai pada panel di sebelah kanan.
                </p>
              </div>

            </div>

            {/* ================= KOLOM KANAN (5 COLUMNS): INFORMASI KANDIDAT INOVATOR & AKSI ================= */}
            <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-6">
              <div className="neu-panel p-6 sm:p-7 border border-white/5 space-y-6">
                
                {/* Header Card Informasi Kandidat */}
                <div className="flex items-center justify-between pb-4 border-b border-white/5">
                  <div className="flex items-center gap-3">
                    <span className="neu-icon-well w-8 h-8 text-xs font-bold text-purple-400">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                        <circle cx="9" cy="7" r="4"></circle>
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                      </svg>
                    </span>
                    <div>
                      <h2 className="text-base font-bold text-white tracking-wide">
                        Informasi Kandidat Inovator
                      </h2>
                      <p className="text-xs text-gray-400">
                        Profil tim dan berkas dokumen makalah
                      </p>
                    </div>
                  </div>

                  {activeCandidate && (
                    <span className="neu-pill-inset px-3 py-1 text-xs text-emerald-400 font-semibold font-mono">
                      Terpilih
                    </span>
                  )}
                </div>

                {/* Body: Conditional Rendering */}
                {!activeCandidate ? (
                  /* STATE KOSONG (Belum memilih judul) */
                  <div className="neu-inset p-8 rounded-2xl text-center space-y-4 border border-white/5">
                    <div className="w-16 h-16 mx-auto rounded-2xl neu-panel flex items-center justify-center text-purple-400/60 border border-white/5">
                      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                        <line x1="16" y1="13" x2="8" y2="13"></line>
                        <line x1="16" y1="17" x2="8" y2="17"></line>
                        <polyline points="10 9 9 9 8 9"></polyline>
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-gray-300">
                        Belum Ada Makalah Terpilih
                      </h3>
                      <p className="text-xs text-gray-500 mt-1 max-w-xs mx-auto leading-relaxed">
                        Silakan pilih judul makalah inovasi pada menu dropdown di sebelah kiri untuk melihat rincian dokumen dan profil tim kandidat.
                      </p>
                    </div>
                  </div>
                ) : (
                  /* STATE SUDAH MEMILIH KANDIDAT */
                  <div className="space-y-6">
                    
                    {/* 1. Judul Inovasi & Berkas Makalah */}
                    <div className="neu-card p-5 border border-white/5 space-y-3">
                      <span className="text-[11px] font-bold text-purple-400 uppercase tracking-wider">
                        Judul Karya Inovasi
                      </span>
                      <h3 className="text-sm font-bold text-white leading-snug">
                        {activeCandidate.name}
                      </h3>

                      <div className="pt-2 border-t border-white/5 space-y-2">
                        {activeCandidate.file ? (
                          <>
                            <button
                              type="button"
                              onClick={() => setViewerOpen(true)}
                              className="w-full neu-btn-primary py-2.5 px-4 text-xs font-bold text-white flex items-center justify-center gap-2 group shadow-lg"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:scale-110 transition-transform">
                                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                              </svg>
                              <span>Buka Dokumen (Web Viewer)</span>
                            </button>

                            <div className="flex items-center justify-between text-[11px] px-1 text-gray-400">
                              <Link
                                href={`/dashboard/viewer/${activeCandidate.id}?from=/dashboard/score`}
                                className="text-purple-400 hover:underline flex items-center gap-1 font-medium"
                              >
                                <span>Buka Halaman Penuh</span> &rarr;
                              </Link>
                              <a
                                href={formatFileUrl(activeCandidate.file)}
                                download
                                className="hover:text-gray-200 hover:underline"
                              >
                                Unduh File
                              </a>
                            </div>
                          </>
                        ) : (
                          <div className="text-xs text-gray-500 italic py-1">
                            Berkas dokumen makalah belum diunggah.
                          </div>
                        )}
                      </div>
                    </div>

                    {/* 2. Daftar Tim Kandidat Inovator */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
                          <span>Anggota Tim Inovator</span>
                        </span>
                        <span className="neu-pill-inset px-2.5 py-0.5 text-[11px] font-mono font-semibold text-purple-400">
                          {activeMembers.length > 0 ? `${activeMembers.length} Orang` : "1 Orang"}
                        </span>
                      </div>

                      {activeMembers.length === 0 ? (
                        /* Fallback jika data lama belum ada field members */
                        <div className="neu-card p-4 border border-white/5 flex items-center gap-4">
                          <div className="w-14 h-14 rounded-2xl neu-panel flex items-center justify-center text-purple-400 font-bold text-lg border border-white/10 shrink-0">
                            {activeCandidate.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-xs font-bold text-white truncate">
                              Inovator Utama
                            </div>
                            <div className="text-[11px] text-gray-400 mt-0.5">
                              Tim Peserta POLINOV 2026
                            </div>
                          </div>
                        </div>
                      ) : (
                        /* Render List Anggota Tim Lengkap */
                        <div className="space-y-3.5 max-h-[360px] overflow-y-auto pr-1">
                          {activeMembers.map((member, idx) => (
                            <div
                              key={idx}
                              className="neu-card p-4 border border-white/5 space-y-3 hover:border-purple-500/20 transition-all"
                            >
                              <div className="flex items-start gap-3.5">
                                {/* Foto Kandidat */}
                                <div className="relative w-14 h-14 rounded-2xl overflow-hidden neu-inset flex items-center justify-center border border-white/10 shrink-0">
                                  {member.photo ? (
                                    <img
                                      src={`/${member.photo}`}
                                      alt={member.name}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <div className="flex flex-col items-center justify-center text-gray-500">
                                      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                        <circle cx="12" cy="7" r="4"></circle>
                                      </svg>
                                      <span className="text-[8px] mt-0.5 text-gray-400">No Photo</span>
                                    </div>
                                  )}
                                </div>

                                {/* Profil Info */}
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-2">
                                    <span className="neu-icon-well w-5 h-5 text-[10px] font-bold text-purple-400 shrink-0">
                                      {idx + 1}
                                    </span>
                                    <span className="text-[10px] font-semibold text-purple-400 uppercase tracking-wider truncate">
                                      {idx === 0 ? "Ketua / Inovator Utama" : `Anggota Tim ${idx + 1}`}
                                    </span>
                                  </div>
                                  
                                  <h4 className="text-sm font-bold text-white mt-1 leading-snug break-words">
                                    {member.name || "-"}
                                  </h4>

                                  <div className="mt-1.5 space-y-0.5 text-xs text-gray-400">
                                    {member.nip && (
                                      <div className="flex items-center gap-1.5 font-mono text-[11px] text-gray-300">
                                        <span className="text-gray-500">NIP:</span>
                                        <span>{member.nip}</span>
                                      </div>
                                    )}
                                    {member.position && (
                                      <div className="text-[11px] text-gray-400 truncate">
                                        {member.position}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                  </div>
                )}

                {/* ================= ACTION PANEL: DI SEBELAH KANAN DI BAWAH KANDIDAT ================= */}
                <div className="pt-5 border-t border-white/5 space-y-3.5">
                  
                  {/* Total Skor Box */}
                  <div className="flex items-center justify-between p-3.5 neu-inset rounded-2xl border border-white/5">
                    <div className="flex items-center gap-2">
                      <span className="neu-icon-well w-6 h-6 text-[11px] font-bold text-purple-400">
                        &Sigma;
                      </span>
                      <span className="text-xs text-gray-300 font-semibold uppercase tracking-wider">
                        Total Skor:
                      </span>
                    </div>
                    <div className="neu-pill px-3.5 py-1 text-base font-bold font-mono text-purple-400 border border-purple-500/30">
                      {totalScore.toFixed(2)} <span className="text-[11px] text-gray-400 font-normal">/ 100</span>
                    </div>
                  </div>

                  {/* Tombol Simpan Nilai */}
                  <button
                    type="submit"
                    disabled={loading || answeredCount < EVALUATION_CRITERIA.length || !selectedCandidate}
                    className="w-full neu-btn-primary py-3.5 text-xs font-bold tracking-wider uppercase disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
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
                        <span>Menyimpan Nilai...</span>
                      </>
                    ) : (
                      <span>Simpan Nilai Inovasi</span>
                    )}
                  </button>

                  {/* Tombol Batal */}
                  <Link href="/dashboard" className="block">
                    <button
                      type="button"
                      className="w-full neu-btn py-2.5 text-xs font-semibold text-gray-400 hover:text-white"
                    >
                      &larr; Batal
                    </button>
                  </Link>
                </div>

              </div>
            </div>

          </div>
        </form>

      </div>

      {/* ================= IN-PAGE WEB VIEWER MODAL ================= */}
      {viewerOpen && activeCandidate && activeCandidate.file && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-6xl h-[94vh] neu-panel flex flex-col rounded-3xl border border-white/10 shadow-2xl overflow-hidden bg-[#1e2029]">
            
            {/* Modal Header Bar with Prominent Back Button */}
            <div className="px-4 sm:px-6 py-3.5 border-b border-white/10 flex items-center justify-between gap-4 bg-[#181a22]">
              <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                <button
                  type="button"
                  onClick={() => setViewerOpen(false)}
                  className="neu-btn px-4 py-2 text-xs font-bold text-purple-300 hover:text-white flex items-center gap-2 shrink-0 border border-purple-500/20"
                  title="Tutup dan kembali ke lembar penilaian"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="19" y1="12" x2="5" y2="12"></line>
                    <polyline points="12 19 5 12 12 5"></polyline>
                  </svg>
                  <span>Kembali ke Penilaian</span>
                </button>

                <div className="min-w-0">
                  <h3 className="text-xs sm:text-sm font-bold text-white truncate max-w-md sm:max-w-xl md:max-w-2xl">
                    {activeCandidate.name}
                  </h3>
                </div>
              </div>

              {/* Right side controls */}
              <div className="flex items-center gap-2 shrink-0">
                <Link
                  href={`/dashboard/viewer/${activeCandidate.id}?from=/dashboard/score`}
                  target="_blank"
                  className="neu-btn px-3.5 py-2 text-xs text-gray-300 hover:text-white flex items-center gap-1.5"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                    <polyline points="15 3 21 3 21 9"></polyline>
                    <line x1="10" y1="14" x2="21" y2="3"></line>
                  </svg>
                  <span>Buka Tab Baru</span>
                </Link>
              </div>
            </div>

            {/* Modal Document Viewer Body */}
            <div className="flex-1 p-2 sm:p-3 bg-[#13141a] overflow-hidden flex flex-col">
              <DocumentViewer
                fileUrl={formatFileUrl(activeCandidate.file)}
                title={activeCandidate.name}
              />
            </div>

          </div>
        </div>
      )}
    </>
  );
}

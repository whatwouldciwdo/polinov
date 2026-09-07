"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { EVALUATION_CRITERIA } from "@/lib/criteria";

export interface CandidateEvaluationItem {
  id: number;
  name: string;
  candidateNip?: string | null;
  candidatePosition?: string | null;
  isEvaluated: boolean;
  scoreId?: number | null;
  scoreValue?: string | null;
  details?: any | null;
  feedback?: string | null;
  evaluatedAt?: string | null;
}

interface Props {
  evaluatorName: string;
  evaluatorNip?: string | null;
  items: CandidateEvaluationItem[];
}

export default function HistoryView({ evaluatorName, evaluatorNip, items }: Props) {
  const [filterTab, setFilterTab] = useState<"all" | "evaluated" | "pending">("all");
  const [search, setSearch] = useState("");
  const [selectedDetail, setSelectedDetail] = useState<CandidateEvaluationItem | null>(null);

  const evaluatedCount = useMemo(
    () => items.filter((item) => item.isEvaluated).length,
    [items]
  );
  const pendingCount = items.length - evaluatedCount;
  const progressPercent = items.length > 0 ? Math.round((evaluatedCount / items.length) * 100) : 0;

  // Average score given by this judge
  const avgGivenScore = useMemo(() => {
    const evaluatedItems = items.filter((i) => i.isEvaluated && i.scoreValue);
    if (evaluatedItems.length === 0) return "0.00";
    const sum = evaluatedItems.reduce(
      (acc, curr) => acc + (parseFloat(curr.scoreValue || "0") || 0),
      0
    );
    return (sum / evaluatedItems.length).toFixed(2);
  }, [items]);

  // Filter items based on tab & search
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());

      if (filterTab === "evaluated") {
        return matchesSearch && item.isEvaluated;
      }
      if (filterTab === "pending") {
        return matchesSearch && !item.isEvaluated;
      }
      return matchesSearch;
    });
  }, [items, filterTab, search]);

  return (
    <div className="min-h-screen py-10 px-4 font-cabin bg-[#1e2029] text-gray-100 flex flex-col items-center">
      <div className="w-full max-w-5xl space-y-8">
        
        {/* Header Panel */}
        <div className="neu-panel p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4 border border-white/5">
          <div>
            <span className="inline-block px-3 py-1 text-xs font-semibold text-purple-400 neu-pill-inset uppercase tracking-wider mb-2">
              Juri Dashboard &bull; POLINOV 2026
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Riwayat Penilaian Saya
            </h1>
            <p className="text-xs text-gray-400 mt-1 font-sans">
              Evaluator: <span className="font-semibold text-white">{evaluatorName}</span> {evaluatorNip ? `(${evaluatorNip})` : ""}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/dashboard">
              <button className="neu-btn px-5 py-2.5 text-xs font-semibold text-gray-300 hover:text-white">
                &larr; Dashboard
              </button>
            </Link>
            {pendingCount > 0 && (
              <Link href="/dashboard/score">
                <button className="neu-btn-primary px-5 py-2.5 text-xs font-bold">
                  Nilai Sekarang &rarr;
                </button>
              </Link>
            )}
          </div>
        </div>

        {/* Progress & Summary Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Card 1: Total Makalah */}
          <div className="neu-card p-5 border border-white/5 flex flex-col justify-between">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Total Makalah Inovasi
            </span>
            <div className="mt-3 flex items-baseline gap-1.5">
              <span className="text-3xl font-bold text-white font-mono">{items.length}</span>
              <span className="text-xs text-gray-400">judul</span>
            </div>
          </div>

          {/* Card 2: Sudah Dinilai */}
          <div className="neu-card p-5 border border-white/5 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Sudah Dinilai
              </span>
              <span className="neu-pill-inset px-2 py-0.5 text-[10px] text-emerald-400 font-bold">
                {progressPercent}%
              </span>
            </div>
            <div className="mt-3 flex items-baseline gap-1.5">
              <span className="text-3xl font-bold text-emerald-400 font-mono">{evaluatedCount}</span>
              <span className="text-xs text-gray-400">selesai</span>
            </div>
          </div>

          {/* Card 3: Belum Dinilai */}
          <div className="neu-card p-5 border border-white/5 flex flex-col justify-between">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Belum Dinilai
            </span>
            <div className="mt-3 flex items-baseline gap-1.5">
              <span className={`text-3xl font-bold font-mono ${pendingCount > 0 ? "text-amber-400" : "text-gray-400"}`}>
                {pendingCount}
              </span>
              <span className="text-xs text-gray-400">menunggu</span>
            </div>
          </div>

          {/* Card 4: Rata-rata Skor Saya */}
          <div className="neu-card p-5 border border-white/5 flex flex-col justify-between">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Rata-rata Skor Saya
            </span>
            <div className="mt-3 flex items-baseline gap-1.5">
              <span className="text-3xl font-bold text-purple-400 font-mono">{avgGivenScore}</span>
              <span className="text-xs text-gray-400">/ 100</span>
            </div>
          </div>

        </div>

        {/* Progress Bar Neumorphic */}
        <div className="neu-card p-4 border border-white/5 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-300 font-medium">Progres Kelengkapan Penilaian:</span>
            <span className="text-purple-400 font-bold font-mono">{evaluatedCount} dari {items.length} Inovasi ({progressPercent}%)</span>
          </div>
          <div className="w-full h-3 neu-inset p-0.5 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-600 to-purple-400 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>

        {/* Filter Tabs & Search */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          {/* Tabs */}
          <div className="flex items-center gap-2 p-1 neu-inset rounded-2xl w-full sm:w-auto">
            <button
              onClick={() => setFilterTab("all")}
              className={`flex-1 sm:flex-initial px-4 py-2 text-xs font-semibold rounded-xl transition-all ${
                filterTab === "all"
                  ? "neu-btn-primary text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Semua ({items.length})
            </button>
            <button
              onClick={() => setFilterTab("evaluated")}
              className={`flex-1 sm:flex-initial px-4 py-2 text-xs font-semibold rounded-xl transition-all ${
                filterTab === "evaluated"
                  ? "neu-btn-primary text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Sudah Dinilai ({evaluatedCount})
            </button>
            <button
              onClick={() => setFilterTab("pending")}
              className={`flex-1 sm:flex-initial px-4 py-2 text-xs font-semibold rounded-xl transition-all ${
                filterTab === "pending"
                  ? "neu-btn-primary text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Belum Dinilai ({pendingCount})
            </button>
          </div>

          {/* Search Box */}
          <div className="w-full sm:w-72 neu-inset p-1 flex items-center">
            <svg className="w-4 h-4 ml-3 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari judul inovasi..."
              className="w-full p-2 bg-transparent text-xs text-gray-100 placeholder-gray-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Table of Candidate Evaluations */}
        <div className="neu-panel p-4 sm:p-6 border border-white/5 space-y-4">
          <div className="neu-inset p-3 rounded-2xl overflow-x-auto border border-white/5">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="p-3 text-xs font-bold text-purple-400 uppercase tracking-wider text-center w-12">
                    No
                  </th>
                  <th className="p-3 text-xs font-bold text-purple-400 uppercase tracking-wider">
                    Judul Makalah Inovasi
                  </th>
                  <th className="p-3 text-xs font-bold text-purple-400 uppercase tracking-wider text-center w-36">
                    Status
                  </th>
                  <th className="p-3 text-xs font-bold text-purple-400 uppercase tracking-wider text-center w-28">
                    Nilai Saya
                  </th>
                  <th className="p-3 text-xs font-bold text-purple-400 uppercase tracking-wider text-center w-40">
                    Waktu Audit
                  </th>
                  <th className="p-3 text-xs font-bold text-purple-400 uppercase tracking-wider text-center w-36">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-gray-400 text-sm">
                      {items.length === 0
                        ? "Belum ada data makalah yang terdaftar dalam sistem."
                        : "Tidak ada data inovasi yang sesuai dengan kriteria filter Anda."}
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((item, index) => {
                    const formattedDate = item.evaluatedAt
                      ? new Date(item.evaluatedAt).toLocaleString("id-ID", {
                          timeZone: "Asia/Jakarta",
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        }) + " WIB"
                      : "-";

                    return (
                      <tr key={item.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="p-3 text-center text-xs font-mono text-gray-400">
                          {index + 1}
                        </td>
                        <td className="p-3">
                          <div className="text-sm font-semibold text-white">{item.name}</div>
                          {item.candidatePosition && (
                            <div className="text-xs text-gray-400 font-sans mt-0.5">
                              {item.candidatePosition}
                            </div>
                          )}
                        </td>
                        <td className="p-3 text-center">
                          {item.isEvaluated ? (
                            <span className="neu-pill px-3 py-1 text-xs font-semibold text-emerald-400 border border-emerald-500/20 inline-flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                              Sudah Dinilai
                            </span>
                          ) : (
                            <span className="neu-pill-inset px-3 py-1 text-xs font-semibold text-amber-400 inline-flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                              Belum Dinilai
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-center">
                          {item.isEvaluated ? (
                            <span className="neu-pill px-3 py-1 text-sm font-bold text-purple-400 font-mono">
                              {item.scoreValue}
                            </span>
                          ) : (
                            <span className="text-xs text-gray-500 font-mono">-</span>
                          )}
                        </td>
                        <td className="p-3 text-center text-xs font-mono text-gray-300">
                          {formattedDate}
                        </td>
                        <td className="p-3 text-center">
                          {item.isEvaluated ? (
                            <button
                              type="button"
                              onClick={() => setSelectedDetail(item)}
                              className="neu-btn px-3 py-1.5 text-xs text-purple-300 hover:text-white font-semibold flex items-center justify-center gap-1 mx-auto"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                <polyline points="14 2 14 8 20 8"></polyline>
                                <line x1="16" y1="13" x2="8" y2="13"></line>
                                <line x1="16" y1="17" x2="8" y2="17"></line>
                                <polyline points="10 9 9 9 8 9"></polyline>
                              </svg>
                              <span>Detail Nilai</span>
                            </button>
                          ) : (
                            <Link href="/dashboard/score">
                              <button className="neu-btn-primary px-3 py-1.5 text-xs font-bold">
                                Beri Nilai
                              </button>
                            </Link>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* ================= MODAL DETAIL REKAP NILAI PER FIELD ================= */}
      {selectedDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-3xl neu-panel p-6 sm:p-8 rounded-3xl border border-white/10 shadow-2xl bg-[#1e2029] space-y-6 max-h-[92vh] overflow-y-auto custom-scrollbar">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-white/5">
              <div>
                <div className="flex items-center gap-2">
                  <span className="neu-pill-inset px-2.5 py-0.5 text-[10px] font-bold text-purple-400 uppercase tracking-wider">
                    Rekap Detail Penilaian Juri
                  </span>
                  <span className="text-gray-500 text-xs">&bull;</span>
                  <span className="text-xs text-gray-400 font-mono">POLINOV 2026</span>
                </div>
                <h2 className="text-base sm:text-lg font-bold text-white mt-1.5 leading-snug">
                  {selectedDetail.name}
                </h2>
                <p className="text-xs text-gray-400 mt-1">
                  Evaluator: <span className="text-gray-200 font-semibold">{evaluatorName}</span> {evaluatorNip ? `(${evaluatorNip})` : ""}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedDetail(null)}
                className="w-8 h-8 neu-btn rounded-xl flex items-center justify-center text-gray-400 hover:text-white shrink-0 text-lg"
              >
                &times;
              </button>
            </div>

            {/* Metric Banner: Total Nilai Akhir */}
            <div className="neu-card p-5 border border-purple-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="neu-icon-well w-12 h-12 text-purple-400 font-bold text-xl flex items-center justify-center">
                  &Sigma;
                </div>
                <div>
                  <span className="text-xs text-gray-400 uppercase tracking-wider font-semibold">
                    Total Nilai Akhir:
                  </span>
                  <div className="text-2xl font-bold text-purple-400 font-mono">
                    {selectedDetail.scoreValue} <span className="text-xs text-gray-400 font-normal">/ 100</span>
                  </div>
                </div>
              </div>

              {selectedDetail.evaluatedAt && (
                <div className="text-xs text-gray-400 sm:text-right font-mono">
                  <span className="text-gray-500 block">Waktu Penilaian:</span>
                  <span className="text-gray-200">
                    {new Date(selectedDetail.evaluatedAt).toLocaleString("id-ID", {
                      timeZone: "Asia/Jakarta",
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })} WIB
                  </span>
                </div>
              )}
            </div>

            {/* TABEL RINCIAN PER FIELD (7 KRITERIA STANDAR) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wider">
                  Rincian Penilaian 7 Kriteria Bobot Excel
                </h3>
                <span className="neu-pill-inset px-2.5 py-0.5 text-[11px] text-purple-400 font-mono">
                  Total Bobot 100%
                </span>
              </div>

              <div className="neu-inset p-2 rounded-2xl overflow-x-auto border border-white/5">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-white/5 text-purple-400 font-bold uppercase">
                      <th className="p-3 text-center w-10">No</th>
                      <th className="p-3">Kriteria Penilaian &amp; Fokus</th>
                      <th className="p-3 text-center w-20">Bobot</th>
                      <th className="p-3 text-center w-24">Skor (0-100)</th>
                      <th className="p-3 text-right w-28">Subtotal Poin</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {(() => {
                      const detailsArr = Array.isArray(selectedDetail.details) ? selectedDetail.details : [];

                      return EVALUATION_CRITERIA.map((criterion, idx) => {
                        // Find matching score in details
                        const matched = detailsArr.find(
                          (d: any) => d.criterion_id === criterion.id || d.criterionId === criterion.id
                        );

                        const rawScore = matched && typeof matched.score === "number" 
                          ? matched.score 
                          : null;

                        const subtotal = rawScore !== null 
                          ? (rawScore * criterion.weight).toFixed(2) 
                          : "-";

                        return (
                          <tr key={criterion.id} className="hover:bg-white/[0.02] transition-colors">
                            <td className="p-3 text-center font-mono text-gray-400">
                              {idx + 1}
                            </td>
                            <td className="p-3">
                              <div className="font-semibold text-white">{criterion.title}</div>
                              <div className="text-[11px] text-gray-400 mt-0.5">{criterion.focus}</div>
                            </td>
                            <td className="p-3 text-center">
                              <span className="neu-pill-inset px-2 py-0.5 font-bold text-purple-300 font-mono">
                                {criterion.weightPercent}
                              </span>
                            </td>
                            <td className="p-3 text-center">
                              {rawScore !== null ? (
                                <span className="neu-pill px-3 py-1 font-mono font-bold text-white">
                                  {rawScore}
                                </span>
                              ) : (
                                <span className="text-gray-500 font-mono italic">
                                  {selectedDetail.scoreValue ? "Tercatat" : "-"}
                                </span>
                              )}
                            </td>
                            <td className="p-3 text-right font-mono font-bold text-emerald-400">
                              {rawScore !== null ? `+${subtotal}` : "-"}
                            </td>
                          </tr>
                        );
                      });
                    })()}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-white/10 font-bold bg-white/[0.02]">
                      <td colSpan={2} className="p-3 text-right text-gray-300 uppercase">
                        Total Rekapitulasi:
                      </td>
                      <td className="p-3 text-center text-purple-300 font-mono">
                        100%
                      </td>
                      <td className="p-3 text-center text-gray-400">
                        Skor Akhir:
                      </td>
                      <td className="p-3 text-right text-purple-400 font-mono text-sm">
                        {selectedDetail.scoreValue} / 100
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {(!Array.isArray(selectedDetail.details) || selectedDetail.details.length === 0) && (
                <p className="text-[11px] text-amber-400/80 italic px-2">
                  * Catatan: Data penilaian ini disimpan sebelum sistem detail kriteria diaktifkan. Total nilai akhir yang tervalidasi adalah {selectedDetail.scoreValue}.
                </p>
              )}
            </div>

            {/* CATATAN / FEEDBACK JURI */}
            {selectedDetail.feedback ? (
              <div className="neu-card p-4 border border-white/5 space-y-2">
                <span className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
                  <span>Catatan / Feedback Juri:</span>
                </span>
                <p className="text-xs text-gray-200 leading-relaxed italic bg-white/[0.02] p-3 rounded-xl border border-white/5">
                  &ldquo;{selectedDetail.feedback}&rdquo;
                </p>
              </div>
            ) : (
              <div className="neu-inset p-3 rounded-xl text-center text-xs text-gray-500 italic border border-white/5">
                Tidak ada catatan khusus yang ditambahkan oleh juri untuk penilaian ini.
              </div>
            )}

            {/* Modal Actions */}
            <div className="pt-3 border-t border-white/5 flex items-center justify-between gap-4">
              <Link
                href={`/dashboard/viewer/${selectedDetail.id}?from=/dashboard/history`}
                className="neu-btn px-4 py-2 text-xs font-semibold text-purple-300 hover:text-white flex items-center gap-1.5"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                </svg>
                <span>Buka Makalah Inovasi</span>
              </Link>

              <button
                type="button"
                onClick={() => setSelectedDetail(null)}
                className="neu-btn-primary px-6 py-2 text-xs font-bold"
              >
                &larr; Tutup Rekap
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

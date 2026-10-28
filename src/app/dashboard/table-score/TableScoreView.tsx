"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

export interface CandidateScoreItem {
  id: number;
  name: string;
  category: string; // "TEKNIK" | "NON TEKNIK"
  candidateNip: string;
  candidatePosition: string;
  avg: number;
  scoreCount: number;
  globalRank: number;
}

interface Props {
  initialCandidates: CandidateScoreItem[];
}

export default function TableScoreView({ initialCandidates }: Props) {
  const [categoryFilter, setCategoryFilter] = useState<"ALL" | "TEKNIK" | "NON TEKNIK">("ALL");
  const [search, setSearch] = useState("");

  // Counts per category
  const teknikCount = useMemo(
    () => initialCandidates.filter((c) => c.category === "TEKNIK").length,
    [initialCandidates]
  );
  const nonTeknikCount = useMemo(
    () => initialCandidates.filter((c) => c.category === "NON TEKNIK").length,
    [initialCandidates]
  );

  // Filter and sort candidates based on selected category & search
  const displayedCandidates = useMemo(() => {
    // 1. Filter by category
    let list = initialCandidates;
    if (categoryFilter !== "ALL") {
      list = list.filter((c) => c.category === categoryFilter);
    }

    // 2. Sort descending by average score
    const sorted = [...list].sort((a, b) => b.avg - a.avg);

    // 3. Assign category-specific rank
    const withRank = sorted.map((c, index) => ({
      ...c,
      categoryRank: index + 1,
    }));

    // 4. Filter by search keyword
    if (!search.trim()) return withRank;

    const query = search.toLowerCase();
    return withRank.filter(
      (c) =>
        c.name.toLowerCase().includes(query) ||
        c.candidateNip.toLowerCase().includes(query) ||
        c.candidatePosition.toLowerCase().includes(query) ||
        c.category.toLowerCase().includes(query)
    );
  }, [initialCandidates, categoryFilter, search]);

  // Summary Metrics for the current view
  const summaryMetrics = useMemo(() => {
    const list =
      categoryFilter === "ALL"
        ? initialCandidates
        : initialCandidates.filter((c) => c.category === categoryFilter);

    const count = list.length;
    const evaluatedList = list.filter((c) => c.scoreCount > 0);
    const avgScore =
      evaluatedList.length > 0
        ? (evaluatedList.reduce((sum, c) => sum + c.avg, 0) / evaluatedList.length).toFixed(2)
        : "0.00";

    const topCandidate =
      list.length > 0
        ? [...list].sort((a, b) => b.avg - a.avg)[0]
        : null;

    const totalEvaluations = list.reduce((sum, c) => sum + c.scoreCount, 0);

    return {
      count,
      avgScore,
      topCandidate: topCandidate && topCandidate.avg > 0 ? topCandidate : null,
      totalEvaluations,
    };
  }, [initialCandidates, categoryFilter]);

  // Export to CSV
  const handleExportCSV = () => {
    if (displayedCandidates.length === 0) return;

    const headers = [
      categoryFilter === "ALL" ? "Peringkat Global" : "Peringkat Kategori",
      ...(categoryFilter !== "ALL" ? ["Peringkat Global"] : []),
      "Kategori",
      "Judul Inovasi",
      "Inovator / Jabatan",
      "NIP Inovator",
      "Nilai Rata-rata",
      "Jumlah Penilai",
    ];

    const rows = displayedCandidates.map((c) => {
      const row = [
        c.categoryRank,
        ...(categoryFilter !== "ALL" ? [c.globalRank] : []),
        `"${c.category}"`,
        `"${c.name.replace(/"/g, '""')}"`,
        `"${c.candidatePosition.replace(/"/g, '""')}"`,
        c.candidateNip || "-",
        c.avg.toFixed(2),
        c.scoreCount,
      ];
      return row;
    });

    const csvContent =
      "data:text/csv;charset=utf-8,\uFEFF" +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    const filterTag = categoryFilter.toLowerCase().replace(/\s+/g, "_");
    link.setAttribute(
      "download",
      `rekap-nilai-polinov-2026_${filterTag}_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="relative flex flex-col items-center justify-between min-h-screen py-8 px-4 font-cabin text-gray-100 bg-[#1e2029]">
      {/* Background Subtle Accent */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-purple-600/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-6xl neu-panel p-6 sm:p-10 border border-white/5 space-y-6 my-auto">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-white/5">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-block px-3 py-1 text-xs font-semibold text-purple-400 neu-pill-inset uppercase tracking-wider">
                Rekapitulasi Nilai &amp; Peringkat
              </span>
              <span className="neu-pill px-2.5 py-0.5 text-[11px] font-mono text-gray-400 border border-white/10">
                POLINOV 2026
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              HASIL PENILAIAN INOVASI
            </h1>
            <p className="text-xs text-gray-400 mt-1 font-sans">
              Klasemen karya inovasi berdasarkan akumulasi skor dewan juri per bidang kategori.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 print:hidden">
            <button
              onClick={() => window.print()}
              className="neu-btn px-4 py-2 text-xs font-semibold text-gray-300 hover:text-white flex items-center gap-1.5"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 6 2 18 2 18 9"></polyline>
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                <rect x="6" y="14" width="12" height="8"></rect>
              </svg>
              <span>Cetak</span>
            </button>

            <button
              onClick={handleExportCSV}
              disabled={displayedCandidates.length === 0}
              className="neu-btn-primary px-4 py-2 text-xs font-bold flex items-center gap-1.5 disabled:opacity-50"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
              <span>Ekspor CSV</span>
            </button>

            <Link href="/dashboard">
              <button className="neu-btn px-4 py-2 text-xs font-semibold text-gray-300 hover:text-white">
                &larr; Dashboard
              </button>
            </Link>
          </div>
        </div>

        {/* Category Tabs Filter */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 print:hidden">
          <div className="flex items-center gap-2 neu-inset p-1.5 rounded-2xl border border-white/5">
            <button
              type="button"
              onClick={() => setCategoryFilter("ALL")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                categoryFilter === "ALL"
                  ? "neu-panel text-white border border-purple-500/40 shadow-sm"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <span>Semua Kategori</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
                categoryFilter === "ALL" ? "bg-purple-500/20 text-purple-300" : "bg-white/5 text-gray-500"
              }`}>
                {initialCandidates.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setCategoryFilter("TEKNIK")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                categoryFilter === "TEKNIK"
                  ? "neu-panel text-emerald-300 border border-emerald-500/40 shadow-sm"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>Teknik</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
                categoryFilter === "TEKNIK" ? "bg-emerald-500/20 text-emerald-300" : "bg-white/5 text-gray-500"
              }`}>
                {teknikCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setCategoryFilter("NON TEKNIK")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                categoryFilter === "NON TEKNIK"
                  ? "neu-panel text-purple-300 border border-purple-500/40 shadow-sm"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-purple-400"></span>
              <span>Non Teknik</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
                categoryFilter === "NON TEKNIK" ? "bg-purple-500/20 text-purple-300" : "bg-white/5 text-gray-500"
              }`}>
                {nonTeknikCount}
              </span>
            </button>
          </div>

          {/* Search Box */}
          <div className="w-full sm:w-72 neu-inset p-1 flex items-center rounded-xl">
            <svg className="w-4 h-4 ml-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari inovasi / inovator..."
              className="w-full p-2 bg-transparent text-xs text-gray-100 placeholder-gray-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Summary Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
          <div className="neu-card p-4 border border-white/5 flex flex-col justify-between">
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
              Total Karya ({categoryFilter === "ALL" ? "Semua" : categoryFilter})
            </span>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-2xl font-bold text-white font-mono">{summaryMetrics.count}</span>
              <span className="text-xs text-gray-400 font-sans">makalah</span>
            </div>
          </div>

          <div className="neu-card p-4 border border-white/5 flex flex-col justify-between">
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
              Rata-rata Skor Kategori
            </span>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-2xl font-bold text-purple-300 font-mono">{summaryMetrics.avgScore}</span>
              <span className="text-xs text-gray-400 font-sans">/ 100</span>
            </div>
          </div>

          <div className="neu-card p-4 border border-white/5 flex flex-col justify-between col-span-2 md:col-span-2">
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
              Peringkat Teratas Saat Ini
            </span>
            <div className="mt-1">
              {summaryMetrics.topCandidate ? (
                <div>
                  <div className="text-sm font-bold text-yellow-400 truncate" title={summaryMetrics.topCandidate.name}>
                    🥇 {summaryMetrics.topCandidate.name}
                  </div>
                  <div className="text-xs text-gray-300 font-mono flex items-center gap-2 mt-0.5">
                    <span>Skor: <strong className="text-purple-300">{summaryMetrics.topCandidate.avg.toFixed(2)}</strong></span>
                    <span>&bull;</span>
                    <span>{summaryMetrics.topCandidate.scoreCount} Juri Penilai</span>
                  </div>
                </div>
              ) : (
                <span className="text-xs text-gray-500 italic">Belum ada karya yang dinilai pada filter ini.</span>
              )}
            </div>
          </div>
        </div>

        {/* Table Leaderboard */}
        <div className="neu-inset p-3 rounded-2xl overflow-x-auto border border-white/5">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-white/5">
                <th className="p-3.5 text-xs font-bold text-purple-400 uppercase tracking-wider text-center w-20">
                  {categoryFilter === "ALL" ? "Peringkat" : "Peringkat"}
                </th>
                <th className="p-3.5 text-xs font-bold text-purple-400 uppercase tracking-wider w-28 text-center">
                  Kategori
                </th>
                <th className="p-3.5 text-xs font-bold text-purple-400 uppercase tracking-wider">
                  Judul Inovasi &amp; Inovator
                </th>
                <th className="p-3.5 text-xs font-bold text-purple-400 uppercase tracking-wider text-center w-36">
                  Nilai Rata-rata
                </th>
                <th className="p-3.5 text-xs font-bold text-purple-400 uppercase tracking-wider text-center w-32">
                  Partisipasi Juri
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {displayedCandidates.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-400 text-sm">
                    Tidak ada data karya inovasi yang sesuai dengan filter.
                  </td>
                </tr>
              ) : (
                displayedCandidates.map((cd, index) => {
                  const isTop1 = cd.categoryRank === 1 && cd.avg > 0;
                  const isTop2 = cd.categoryRank === 2 && cd.avg > 0;
                  const isTop3 = cd.categoryRank === 3 && cd.avg > 0;

                  return (
                    <tr key={cd.id} className="hover:bg-white/[0.02] transition-colors">
                      {/* Peringkat */}
                      <td className="p-3.5 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <span
                            className={`neu-icon-well w-8 h-8 flex items-center justify-center text-xs font-bold ${
                              isTop1
                                ? "text-yellow-400 border border-yellow-500/40 shadow-sm"
                                : isTop2
                                ? "text-gray-200 border border-gray-400/30"
                                : isTop3
                                ? "text-amber-500 border border-amber-600/30"
                                : "text-gray-400"
                            }`}
                          >
                            {isTop1 ? "1 🥇" : isTop2 ? "2 🥈" : isTop3 ? "3 🥉" : cd.categoryRank}
                          </span>
                          {categoryFilter !== "ALL" && (
                            <span className="text-[10px] text-gray-500 font-mono mt-1" title="Peringkat dari seluruh 10 karya inovasi">
                              (Global #{cd.globalRank})
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Kategori Badge */}
                      <td className="p-3.5 text-center">
                        <span
                          className={`neu-pill-inset px-2.5 py-1 text-[10px] font-bold font-mono uppercase inline-block whitespace-nowrap ${
                            cd.category === "TEKNIK"
                              ? "text-emerald-400 border border-emerald-500/30 bg-emerald-500/5"
                              : "text-purple-400 border border-purple-500/30 bg-purple-500/5"
                          }`}
                        >
                          {cd.category}
                        </span>
                      </td>

                      {/* Judul & Inovator */}
                      <td className="p-3.5">
                        <div className="font-semibold text-white text-sm leading-snug">
                          {cd.name}
                        </div>
                        <div className="text-xs text-gray-400 font-sans mt-1 flex flex-wrap items-center gap-1.5">
                          <span className="text-gray-300 font-medium">
                            {cd.candidatePosition && cd.candidatePosition !== "-" ? cd.candidatePosition : "Inovator"}
                          </span>
                          <span>&bull;</span>
                          <span className="font-mono text-gray-400">NIP: {cd.candidateNip || "-"}</span>
                        </div>
                      </td>

                      {/* Nilai Rata-rata */}
                      <td className="p-3.5 text-center">
                        <div className="inline-flex flex-col items-center">
                          <span className="neu-pill px-3.5 py-1 text-sm font-bold text-purple-300 font-mono inline-block">
                            {cd.avg > 0 ? cd.avg.toFixed(2) : "0.00"}
                          </span>
                          <span className="text-[10px] text-gray-500 font-mono mt-0.5">/ 100</span>
                        </div>
                      </td>

                      {/* Jumlah Penilai */}
                      <td className="p-3.5 text-center">
                        <span
                          className={`neu-pill-inset px-2.5 py-1 text-xs font-mono inline-block ${
                            cd.scoreCount > 0 ? "text-gray-200" : "text-gray-500"
                          }`}
                        >
                          {cd.scoreCount} Juri
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Info */}
        <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 pt-2 font-mono gap-2">
          <span>Menampilkan {displayedCandidates.length} dari {initialCandidates.length} karya inovasi</span>
          <span>Sistem Informasi POLINOV 2026</span>
        </div>

      </div>

      {/* Page Footer */}
      <div className="relative z-10 flex justify-center w-full max-w-6xl mt-8 print:hidden">
        <div className="neu-pill px-6 py-2.5 text-xs text-purple-300 font-mono tracking-wider border border-white/5">
          &copy; 2026 - SISTEM INFORMASI POLINOV
        </div>
      </div>
    </div>
  );
}

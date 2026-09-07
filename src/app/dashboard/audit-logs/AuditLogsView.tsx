"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

export interface AuditLogItem {
  id: number;
  score: string;
  createdAt: string;
  user: {
    id: number;
    name: string;
    email: string;
    nip?: string | null;
    role: string;
  };
  candidate: {
    id: number;
    name: string;
    candidateNip?: string | null;
    candidatePosition?: string | null;
  };
}

interface Props {
  initialLogs: AuditLogItem[];
  totalCandidatesCount: number;
}

export default function AuditLogsView({ initialLogs, totalCandidatesCount }: Props) {
  const [search, setSearch] = useState("");
  const [selectedJudge, setSelectedJudge] = useState("");

  // Get unique judges for filter dropdown
  const uniqueJudges = useMemo(() => {
    const judgeMap = new Map<number, { id: number; name: string }>();
    for (const log of initialLogs) {
      if (!judgeMap.has(log.user.id)) {
        judgeMap.set(log.user.id, { id: log.user.id, name: log.user.name });
      }
    }
    return Array.from(judgeMap.values());
  }, [initialLogs]);

  // Unique candidates that have been evaluated
  const uniqueEvaluatedCandidates = useMemo(() => {
    return new Set(initialLogs.map((l) => l.candidate.id)).size;
  }, [initialLogs]);

  // Calculate overall average score
  const overallAvg = useMemo(() => {
    if (initialLogs.length === 0) return 0;
    const sum = initialLogs.reduce((acc, curr) => acc + (parseFloat(curr.score) || 0), 0);
    return (sum / initialLogs.length).toFixed(2);
  }, [initialLogs]);

  // Filter logs based on search and judge filter
  const filteredLogs = useMemo(() => {
    return initialLogs.filter((log) => {
      const matchesSearch =
        log.user.name.toLowerCase().includes(search.toLowerCase()) ||
        (log.user.nip && log.user.nip.includes(search)) ||
        log.candidate.name.toLowerCase().includes(search.toLowerCase());

      const matchesJudge =
        selectedJudge === "" || log.user.id.toString() === selectedJudge;

      return matchesSearch && matchesJudge;
    });
  }, [initialLogs, search, selectedJudge]);

  // Export to CSV
  const handleExportCSV = () => {
    if (filteredLogs.length === 0) return;

    const headers = ["ID", "Waktu Audit (WIB)", "Nama Juri", "NIP Juri", "Email Juri", "Judul Inovasi", "Skor Penilaian"];
    const rows = filteredLogs.map((log) => [
      log.id,
      new Date(log.createdAt).toLocaleString("id-ID", {
        timeZone: "Asia/Jakarta",
        dateStyle: "medium",
        timeStyle: "short",
      }),
      `"${log.user.name.replace(/"/g, '""')}"`,
      log.user.nip || "-",
      log.user.email,
      `"${log.candidate.name.replace(/"/g, '""')}"`,
      log.score,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `audit-log-polinov-2026_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      {/* Breadcrumb */}
      <nav className="mb-6 print:hidden">
        <div className="inline-flex items-center gap-2 neu-pill-inset px-4 py-2 text-xs font-medium text-gray-400">
          <Link href="/dashboard" className="text-purple-400 hover:underline">
            Dashboard
          </Link>
          <span>/</span>
          <span className="text-gray-200 font-semibold">Audit Log Penilaian</span>
        </div>
      </nav>

      {/* Main Panel */}
      <div className="neu-panel p-6 sm:p-8 border border-white/5 space-y-6">
        
        {/* Header Title & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/5">
          <div>
            <div className="flex items-center gap-2">
              <span className="neu-icon-well w-8 h-8 text-purple-400 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
                  <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
                  <path d="M9 12h6"></path>
                  <path d="M9 16h6"></path>
                </svg>
              </span>
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-wide">
                Audit Log Penilaian Juri
              </h1>
            </div>
            <p className="text-xs text-gray-400 mt-1 font-sans">
              Rekam jejak transparan seluruh aktivitas penilaian inovasi POLINOV 2026.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 print:hidden">
            <button
              onClick={() => window.print()}
              className="neu-btn px-4 py-2 text-xs font-semibold text-gray-300 hover:text-white flex items-center gap-1.5"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 6 2 18 2 18 9"></polyline>
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                <rect x="6" y="14" width="12" height="8"></rect>
              </svg>
              <span>Cetak Laporan</span>
            </button>

            <button
              onClick={handleExportCSV}
              disabled={filteredLogs.length === 0}
              className="neu-btn-primary px-4 py-2 text-xs font-bold flex items-center gap-1.5 disabled:opacity-50"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
              <span>Ekspor CSV</span>
            </button>
          </div>
        </div>

        {/* Summary Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="neu-card p-4 border border-white/5 flex flex-col justify-between">
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
              Total Penilaian
            </span>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-2xl font-bold text-white font-mono">{initialLogs.length}</span>
              <span className="text-xs text-gray-400">entri</span>
            </div>
          </div>

          <div className="neu-card p-4 border border-white/5 flex flex-col justify-between">
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
              Juri Berpartisipasi
            </span>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-2xl font-bold text-purple-400 font-mono">{uniqueJudges.length}</span>
              <span className="text-xs text-gray-400">orang</span>
            </div>
          </div>

          <div className="neu-card p-4 border border-white/5 flex flex-col justify-between">
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
              Inovasi Dinilai
            </span>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-2xl font-bold text-emerald-400 font-mono">
                {uniqueEvaluatedCandidates}
              </span>
              <span className="text-xs text-gray-400">/ {totalCandidatesCount}</span>
            </div>
          </div>

          <div className="neu-card p-4 border border-white/5 flex flex-col justify-between">
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
              Rata-rata Skor
            </span>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-2xl font-bold text-purple-300 font-mono">{overallAvg}</span>
              <span className="text-xs text-gray-400">/ 100</span>
            </div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2 print:hidden">
          <div className="flex-1 neu-inset p-1 flex items-center">
            <svg className="w-4 h-4 ml-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari berdasarkan nama juri, NIP, atau judul inovasi..."
              className="w-full p-2.5 bg-transparent text-sm text-gray-100 placeholder-gray-500 focus:outline-none"
            />
          </div>

          <div className="sm:w-64 neu-inset p-1">
            <select
              value={selectedJudge}
              onChange={(e) => setSelectedJudge(e.target.value)}
              className="w-full p-2.5 bg-transparent text-sm text-gray-200 focus:outline-none rounded-xl cursor-pointer"
            >
              <option value="" className="bg-[#1a1c24] text-gray-400">
                Semua Juri ({uniqueJudges.length})
              </option>
              {uniqueJudges.map((j) => (
                <option key={j.id} value={j.id.toString()} className="bg-[#1a1c24] text-gray-200">
                  {j.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Audit Table */}
        <div className="neu-inset p-3 rounded-2xl overflow-x-auto border border-white/5">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5">
                <th className="p-3 text-xs font-bold text-purple-400 uppercase tracking-wider text-center w-12">
                  No
                </th>
                <th className="p-3 text-xs font-bold text-purple-400 uppercase tracking-wider w-44">
                  Waktu Penilaian
                </th>
                <th className="p-3 text-xs font-bold text-purple-400 uppercase tracking-wider w-56">
                  Juri Penilai
                </th>
                <th className="p-3 text-xs font-bold text-purple-400 uppercase tracking-wider">
                  Makalah Inovasi
                </th>
                <th className="p-3 text-xs font-bold text-purple-400 uppercase tracking-wider text-center w-28">
                  Skor Total
                </th>
                <th className="p-3 text-xs font-bold text-purple-400 uppercase tracking-wider text-center w-28">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-400 text-sm">
                    {initialLogs.length === 0
                      ? "Belum ada riwayat penilaian juri yang tercatat di database."
                      : "Tidak ada data log yang cocok dengan pencarian / filter Anda."}
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log, index) => {
                  const dateFormatted = new Date(log.createdAt).toLocaleString("id-ID", {
                    timeZone: "Asia/Jakarta",
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  });

                  return (
                    <tr key={log.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="p-3 text-center text-xs font-mono text-gray-400">
                        {index + 1}
                      </td>
                      <td className="p-3">
                        <div className="text-xs font-mono text-gray-300 font-semibold flex items-center gap-1.5">
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-400">
                            <circle cx="12" cy="12" r="10"></circle>
                            <polyline points="12 6 12 12 16 14"></polyline>
                          </svg>
                          <span>{dateFormatted} WIB</span>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="text-sm font-semibold text-white">{log.user.name}</div>
                        <div className="text-xs text-gray-400 font-mono mt-0.5">
                          NIP: {log.user.nip || "-"}
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="text-sm font-medium text-gray-200">{log.candidate.name}</div>
                        {log.candidate.candidatePosition && (
                          <div className="text-xs text-gray-400 font-sans mt-0.5">
                            {log.candidate.candidatePosition}
                          </div>
                        )}
                      </td>
                      <td className="p-3 text-center">
                        <span className="neu-pill px-3 py-1 text-sm font-bold text-purple-400 font-mono">
                          {log.score}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <span className="neu-pill-inset px-2.5 py-0.5 text-[10px] font-semibold text-emerald-400 uppercase tracking-wider">
                          Tercatat
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
        <div className="flex items-center justify-between text-xs text-gray-500 pt-2 font-mono">
          <span>Menampilkan {filteredLogs.length} dari {initialLogs.length} log penilaian</span>
          <span>Sistem Informasi POLINOV 2026</span>
        </div>

      </div>
    </>
  );
}

"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

export interface AuditLogItem {
  id: number;
  score: string;
  feedback?: string | null;
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

export interface JudgeItem {
  id: number;
  name: string;
  nip?: string | null;
  email: string;
  role?: string;
}

export interface CandidateItem {
  id: number;
  name: string;
  candidateNip?: string | null;
  candidatePosition?: string | null;
}

interface Props {
  initialLogs: AuditLogItem[];
  totalCandidatesCount: number;
  allJudges: JudgeItem[];
  allCandidates: CandidateItem[];
}

export default function AuditLogsView({
  initialLogs,
  totalCandidatesCount,
  allJudges,
  allCandidates,
}: Props) {
  const [activeTab, setActiveTab] = useState<"matrix" | "logs">("matrix");
  const [search, setSearch] = useState("");
  const [selectedJudge, setSelectedJudge] = useState("");
  const [matrixFilter, setMatrixFilter] = useState<"all" | "completed" | "in_progress" | "not_started">("all");

  // Feedback list filters in Tab 1
  const [feedbackCandidateFilter, setFeedbackCandidateFilter] = useState("");
  const [feedbackJudgeFilter, setFeedbackJudgeFilter] = useState("");
  const [feedbackOnlyHasText, setFeedbackOnlyHasText] = useState(true);

  // Modal detail popup for a specific score and its feedback
  const [selectedFeedbackModal, setSelectedFeedbackModal] = useState<{
    judgeName: string;
    judgeNip?: string | null;
    candidateName: string;
    score: string;
    feedback?: string | null;
    createdAt?: string | null;
  } | null>(null);

  // Lookup map: `${judgeId}-${candidateId}` -> { score, feedback, createdAt, id }
  const scoreMap = useMemo(() => {
    const map = new Map<string, { score: string; feedback?: string | null; createdAt: string; id: number }>();
    for (const log of initialLogs) {
      map.set(`${log.user.id}-${log.candidate.id}`, {
        score: log.score,
        feedback: log.feedback,
        createdAt: log.createdAt,
        id: log.id,
      });
    }
    return map;
  }, [initialLogs]);

  // Overall unique judges who have given at least one score
  const uniqueScoredJudgesCount = useMemo(() => {
    return new Set(initialLogs.map((l) => l.user.id)).size;
  }, [initialLogs]);

  // Unique candidates that have been evaluated by at least one judge
  const uniqueEvaluatedCandidatesCount = useMemo(() => {
    return new Set(initialLogs.map((l) => l.candidate.id)).size;
  }, [initialLogs]);

  // Count of logs containing feedback text
  const feedbackCount = useMemo(() => {
    return initialLogs.filter((l) => l.feedback && l.feedback.trim().length > 0).length;
  }, [initialLogs]);

  // Overall average score
  const overallAvg = useMemo(() => {
    if (initialLogs.length === 0) return "0.00";
    const sum = initialLogs.reduce((acc, curr) => acc + (parseFloat(curr.score) || 0), 0);
    return (sum / initialLogs.length).toFixed(2);
  }, [initialLogs]);

  // Calculate matrix statistics per judge
  const judgeMatrixStats = useMemo(() => {
    return allJudges.map((judge) => {
      let evaluatedCount = 0;
      let totalScoreSum = 0;

      const candidateScores = allCandidates.map((candidate) => {
        const item = scoreMap.get(`${judge.id}-${candidate.id}`);
        if (item) {
          evaluatedCount++;
          totalScoreSum += parseFloat(item.score) || 0;
          return {
            candidateId: candidate.id,
            candidateName: candidate.name,
            score: item.score,
            feedback: item.feedback ?? null,
            createdAt: item.createdAt,
            evaluated: true,
          };
        }
        return {
          candidateId: candidate.id,
          candidateName: candidate.name,
          score: null,
          feedback: null,
          createdAt: null,
          evaluated: false,
        };
      });

      const totalCandidates = allCandidates.length;
      const percentage = totalCandidates > 0 ? Math.round((evaluatedCount / totalCandidates) * 100) : 0;
      const averageScore = evaluatedCount > 0 ? (totalScoreSum / evaluatedCount).toFixed(2) : "-";

      let status: "completed" | "in_progress" | "not_started" = "not_started";
      if (evaluatedCount === totalCandidates && totalCandidates > 0) {
        status = "completed";
      } else if (evaluatedCount > 0) {
        status = "in_progress";
      }

      return {
        judge,
        evaluatedCount,
        totalCandidates,
        percentage,
        averageScore,
        status,
        candidateScores,
      };
    });
  }, [allJudges, allCandidates, scoreMap]);

  // Filtered Matrix Judges based on search and progress filter
  const filteredMatrixJudges = useMemo(() => {
    return judgeMatrixStats.filter((item) => {
      const matchSearch =
        item.judge.name.toLowerCase().includes(search.toLowerCase()) ||
        (item.judge.nip && item.judge.nip.includes(search));

      const matchStatus =
        matrixFilter === "all" || item.status === matrixFilter;

      return matchSearch && matchStatus;
    });
  }, [judgeMatrixStats, search, matrixFilter]);

  // Filtered feedbacks for Tab 1 feedback section
  const filteredFeedbacks = useMemo(() => {
    return initialLogs.filter((log) => {
      const matchCandidate =
        feedbackCandidateFilter === "" || log.candidate.id.toString() === feedbackCandidateFilter;
      const matchJudge =
        feedbackJudgeFilter === "" || log.user.id.toString() === feedbackJudgeFilter;
      const matchHasText =
        !feedbackOnlyHasText || (Boolean(log.feedback) && log.feedback!.trim().length > 0);

      return matchCandidate && matchJudge && matchHasText;
    });
  }, [initialLogs, feedbackCandidateFilter, feedbackJudgeFilter, feedbackOnlyHasText]);

  // Filtered Logs for Tab 2
  const filteredLogs = useMemo(() => {
    return initialLogs.filter((log) => {
      const matchesSearch =
        log.user.name.toLowerCase().includes(search.toLowerCase()) ||
        (log.user.nip && log.user.nip.includes(search)) ||
        log.candidate.name.toLowerCase().includes(search.toLowerCase()) ||
        (log.feedback && log.feedback.toLowerCase().includes(search.toLowerCase()));

      const matchesJudge =
        selectedJudge === "" || log.user.id.toString() === selectedJudge;

      return matchesSearch && matchesJudge;
    });
  }, [initialLogs, search, selectedJudge]);

  // Export Matrix to CSV
  const handleExportMatrixCSV = () => {
    if (allJudges.length === 0 || allCandidates.length === 0) return;

    const headers = [
      "No",
      "Nama Juri",
      "NIP",
      "Progres",
      "Persentase (%)",
      "Rata-rata Nilai",
      ...allCandidates.map((c, i) => `"${i + 1}. ${c.name.replace(/"/g, '""')}"`),
    ];

    const rows = judgeMatrixStats.map((item, idx) => {
      const candidateScoreCols = item.candidateScores.map((cs) => (cs.score !== null ? cs.score : "-"));
      return [
        idx + 1,
        `"${item.judge.name.replace(/"/g, '""')}"`,
        item.judge.nip || "-",
        `"${item.evaluatedCount}/${item.totalCandidates}"`,
        `${item.percentage}%`,
        item.averageScore,
        ...candidateScoreCols,
      ];
    });

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `matriks-penilaian-polinov-2026_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export Logs to CSV (including feedback column)
  const handleExportLogsCSV = () => {
    if (filteredLogs.length === 0) return;

    const headers = [
      "ID",
      "Waktu Audit (WIB)",
      "Nama Juri",
      "NIP Juri",
      "Email Juri",
      "Judul Inovasi",
      "Skor Total",
      "Feedback / Catatan Evaluasi Juri",
    ];

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
      `"${(log.feedback || "").replace(/"/g, '""')}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `log-penilaian-polinov-2026_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Dedicated Export for Feedback / Evaluation notes
  const handleExportFeedbackCSV = () => {
    const dataToExport = initialLogs.filter((l) => l.feedback && l.feedback.trim().length > 0);
    if (dataToExport.length === 0) return;

    const headers = [
      "No",
      "Makalah Inovasi",
      "Nama Juri",
      "NIP Juri",
      "Total Skor",
      "Waktu Penilaian",
      "Feedback / Catatan Evaluasi Juri",
    ];

    const rows = dataToExport.map((log, idx) => [
      idx + 1,
      `"${log.candidate.name.replace(/"/g, '""')}"`,
      `"${log.user.name.replace(/"/g, '""')}"`,
      log.user.nip || "-",
      log.score,
      new Date(log.createdAt).toLocaleString("id-ID", {
        timeZone: "Asia/Jakarta",
        dateStyle: "medium",
        timeStyle: "short",
      }),
      `"${(log.feedback || "").replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8,\uFEFF" +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `feedback-evaluasi-juri-polinov-2026_${new Date().toISOString().slice(0, 10)}.csv`
    );
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
          <span className="text-gray-200 font-semibold">Rekapitulasi &amp; Audit Penilaian Juri</span>
        </div>
      </nav>

      {/* Main Panel */}
      <div className="neu-panel p-6 sm:p-8 border border-white/5 space-y-6">
        
        {/* Header Title & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/5">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="neu-icon-well w-8 h-8 text-purple-400 flex items-center justify-center font-bold">
                &Sigma;
              </span>
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-wide">
                Rekapitulasi &amp; Audit Penilaian Juri
              </h1>
            </div>
            <p className="text-xs text-gray-400 mt-1 font-sans">
              Pantau progres kelengkapan penilaian setiap juri, rekam jejak transparansi, serta masukan/feedback evaluasi juri POLINOV 2026.
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

            {activeTab === "matrix" ? (
              <button
                onClick={handleExportMatrixCSV}
                className="neu-btn-primary px-4 py-2 text-xs font-bold flex items-center gap-1.5"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="7 10 12 15 17 10"></polyline>
                  <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
                <span>Ekspor Matriks CSV</span>
              </button>
            ) : (
              <button
                onClick={handleExportLogsCSV}
                disabled={filteredLogs.length === 0}
                className="neu-btn-primary px-4 py-2 text-xs font-bold flex items-center gap-1.5 disabled:opacity-50"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="7 10 12 15 17 10"></polyline>
                  <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
                <span>Ekspor Log CSV</span>
              </button>
            )}
          </div>
        </div>

        {/* Global Summary Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="neu-card p-4 border border-white/5 flex flex-col justify-between">
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
              Total Penilaian Masuk
            </span>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-2xl font-bold text-white font-mono">{initialLogs.length}</span>
              <span className="text-xs text-gray-400 font-sans">
                skor <span className="text-purple-400 font-medium">({feedbackCount} ada catatan)</span>
              </span>
            </div>
          </div>

          <div className="neu-card p-4 border border-white/5 flex flex-col justify-between">
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
              Juri Terdaftar
            </span>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-2xl font-bold text-purple-400 font-mono">{allJudges.length}</span>
              <span className="text-xs text-gray-400 font-sans">
                ({uniqueScoredJudgesCount} aktif menilai)
              </span>
            </div>
          </div>

          <div className="neu-card p-4 border border-white/5 flex flex-col justify-between">
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
              Judul Inovasi
            </span>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-2xl font-bold text-emerald-400 font-mono">
                {uniqueEvaluatedCandidatesCount}
              </span>
              <span className="text-xs text-gray-400 font-sans">/ {totalCandidatesCount} dinilai</span>
            </div>
          </div>

          <div className="neu-card p-4 border border-white/5 flex flex-col justify-between">
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
              Rata-rata Skor Global
            </span>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-2xl font-bold text-purple-300 font-mono">{overallAvg}</span>
              <span className="text-xs text-gray-400 font-sans">/ 100</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-3 border-b border-white/5 pb-2 print:hidden">
          <button
            type="button"
            onClick={() => { setActiveTab("matrix"); setSearch(""); }}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === "matrix"
                ? "neu-inset text-purple-400 border border-purple-500/20"
                : "neu-btn text-gray-400 hover:text-white"
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="3" y1="9" x2="21" y2="9"></line>
              <line x1="3" y1="15" x2="21" y2="15"></line>
              <line x1="9" y1="3" x2="9" y2="21"></line>
              <line x1="15" y1="3" x2="15" y2="21"></line>
            </svg>
            <span>Matriks Progres Penilaian Juri</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab("logs"); setSearch(""); }}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === "logs"
                ? "neu-inset text-purple-400 border border-purple-500/20"
                : "neu-btn text-gray-400 hover:text-white"
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="8" y1="6" x2="21" y2="6"></line>
              <line x1="8" y1="12" x2="21" y2="12"></line>
              <line x1="8" y1="18" x2="21" y2="18"></line>
              <line x1="3" y1="6" x2="3.01" y2="6"></line>
              <line x1="3" y1="12" x2="3.01" y2="12"></line>
              <line x1="3" y1="18" x2="3.01" y2="18"></line>
            </svg>
            <span>Log Riwayat Detail Penilaian</span>
          </button>
        </div>

        {/* ======================================================== */}
        {/* TAB 1: MATRIKS PROGRES JURI                              */}
        {/* ======================================================== */}
        {activeTab === "matrix" && (
          <div className="space-y-6">
            
            {/* Filter & Search Bar for Matrix */}
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between print:hidden">
              <div className="w-full sm:flex-1 neu-inset p-1 flex items-center">
                <svg className="w-4 h-4 ml-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Cari nama atau NIP juri..."
                  className="w-full p-2.5 bg-transparent text-sm text-gray-100 placeholder-gray-500 focus:outline-none"
                />
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
                <button
                  type="button"
                  onClick={() => setMatrixFilter("all")}
                  className={`neu-btn px-3 py-1.5 text-xs font-semibold whitespace-nowrap ${
                    matrixFilter === "all" ? "text-purple-300 border border-purple-500/40 font-bold" : "text-gray-400"
                  }`}
                >
                  Semua ({judgeMatrixStats.length})
                </button>
                <button
                  type="button"
                  onClick={() => setMatrixFilter("completed")}
                  className={`neu-btn px-3 py-1.5 text-xs font-semibold whitespace-nowrap ${
                    matrixFilter === "completed" ? "text-emerald-300 border border-emerald-500/40 font-bold" : "text-gray-400"
                  }`}
                >
                  Selesai Semua ({judgeMatrixStats.filter((j) => j.status === "completed").length})
                </button>
                <button
                  type="button"
                  onClick={() => setMatrixFilter("in_progress")}
                  className={`neu-btn px-3 py-1.5 text-xs font-semibold whitespace-nowrap ${
                    matrixFilter === "in_progress" ? "text-yellow-300 border border-yellow-500/40 font-bold" : "text-gray-400"
                  }`}
                >
                  Sedang Menilai ({judgeMatrixStats.filter((j) => j.status === "in_progress").length})
                </button>
                <button
                  type="button"
                  onClick={() => setMatrixFilter("not_started")}
                  className={`neu-btn px-3 py-1.5 text-xs font-semibold whitespace-nowrap ${
                    matrixFilter === "not_started" ? "text-rose-300 border border-rose-500/40 font-bold" : "text-gray-400"
                  }`}
                >
                  Belum Mulai ({judgeMatrixStats.filter((j) => j.status === "not_started").length})
                </button>
              </div>
            </div>

            {/* Judges Progress Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredMatrixJudges.map((item) => (
                <div
                  key={item.judge.id}
                  className="neu-card p-4 border border-white/5 space-y-3 hover:border-purple-500/20 transition-all"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl neu-panel flex items-center justify-center text-purple-400 font-bold text-sm shrink-0 border border-white/10">
                        {item.judge.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm font-bold text-white truncate" title={item.judge.name}>
                          {item.judge.name}
                        </h4>
                        <p className="text-[11px] text-gray-400 font-mono">
                          NIP: {item.judge.nip || "-"}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`neu-pill-inset px-2 py-0.5 text-[10px] font-bold font-mono uppercase shrink-0 ${
                        item.status === "completed"
                          ? "text-emerald-400 border border-emerald-500/30"
                          : item.status === "in_progress"
                          ? "text-yellow-400 border border-yellow-500/30"
                          : "text-gray-400"
                      }`}
                    >
                      {item.status === "completed"
                        ? "Selesai"
                        : item.status === "in_progress"
                        ? "Menilai"
                        : "Belum"}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-400">Progres Penilaian:</span>
                      <span className="font-mono font-bold text-white">
                        {item.evaluatedCount} / {item.totalCandidates}{" "}
                        <span className="text-purple-400">({item.percentage}%)</span>
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden p-0.5 neu-inset">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          item.status === "completed"
                            ? "bg-gradient-to-r from-emerald-500 to-teal-400"
                            : item.status === "in_progress"
                            ? "bg-gradient-to-r from-purple-500 to-indigo-400"
                            : "bg-gray-700"
                        }`}
                        style={{ width: `${item.percentage}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Average Score */}
                  <div className="flex items-center justify-between text-xs pt-1 border-t border-white/5">
                    <span className="text-gray-400">Rata-rata Skor:</span>
                    <span className="font-mono font-bold text-purple-300">
                      {item.averageScore !== "-" ? `${item.averageScore} / 100` : "-"}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Matrix Table (Judges x Candidates) */}
            <div className="neu-card p-5 border border-white/5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-bold text-white tracking-wide">
                    Tabel Matriks Penilaian Inovasi
                  </h3>
                  <p className="text-xs text-gray-400">
                    Klik skor bertanda <span className="text-purple-400 font-semibold">💬</span> untuk membuka feedback/catatan evaluasi juri.
                  </p>
                </div>
                <span className="neu-pill-inset px-3 py-1 text-[11px] font-mono text-purple-400 font-semibold self-start sm:self-auto">
                  {allJudges.length} Juri &times; {allCandidates.length} Makalah
                </span>
              </div>

              <div className="neu-inset p-3 rounded-2xl overflow-x-auto border border-white/5">
                <table className="w-full text-left border-collapse min-w-[950px]">
                  <thead>
                    <tr className="border-b border-white/5">
                      <th className="p-3 text-[11px] font-bold text-purple-400 uppercase tracking-wider text-center w-10">
                        #
                      </th>
                      <th className="p-3 text-[11px] font-bold text-purple-400 uppercase tracking-wider w-48 sticky left-0 bg-[#15171e] z-10">
                        Juri Penilai
                      </th>
                      <th className="p-3 text-[11px] font-bold text-purple-400 uppercase tracking-wider text-center w-28">
                        Progres
                      </th>
                      <th className="p-3 text-[11px] font-bold text-purple-400 uppercase tracking-wider text-center w-24">
                        Rata-rata
                      </th>
                      {allCandidates.map((c, idx) => (
                        <th
                          key={c.id}
                          className="p-3 text-[11px] font-bold text-purple-400 uppercase tracking-wider text-center w-28"
                          title={`${idx + 1}. ${c.name}`}
                        >
                          <div className="truncate max-w-[110px] mx-auto">
                            #{idx + 1}
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-xs">
                    {filteredMatrixJudges.length === 0 ? (
                      <tr>
                        <td colSpan={4 + allCandidates.length} className="p-8 text-center text-gray-400 text-sm">
                          Tidak ada data juri yang sesuai dengan filter.
                        </td>
                      </tr>
                    ) : (
                      filteredMatrixJudges.map((item, rowIdx) => (
                        <tr key={item.judge.id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="p-3 text-center text-gray-400 font-mono">
                            {rowIdx + 1}
                          </td>
                          <td className="p-3 sticky left-0 bg-[#181a22] z-10">
                            <div className="font-semibold text-white truncate max-w-[190px]" title={item.judge.name}>
                              {item.judge.name}
                            </div>
                            <div className="text-[10px] text-gray-400 font-mono">
                              NIP: {item.judge.nip || "-"}
                            </div>
                          </td>
                          <td className="p-3 text-center font-mono font-bold">
                            <span
                              className={`neu-pill-inset px-2.5 py-1 text-[11px] inline-block ${
                                item.status === "completed"
                                  ? "text-emerald-400"
                                  : item.status === "in_progress"
                                  ? "text-yellow-400"
                                  : "text-gray-500"
                              }`}
                            >
                              {item.evaluatedCount}/{item.totalCandidates}
                            </span>
                          </td>
                          <td className="p-3 text-center font-mono font-bold text-purple-300">
                            {item.averageScore}
                          </td>

                          {/* Candidate score cells */}
                          {item.candidateScores.map((cs) => (
                            <td key={cs.candidateId} className="p-3 text-center">
                              {cs.evaluated ? (
                                <button
                                  type="button"
                                  onClick={() =>
                                    setSelectedFeedbackModal({
                                      judgeName: item.judge.name,
                                      judgeNip: item.judge.nip,
                                      candidateName: cs.candidateName,
                                      score: cs.score || "",
                                      feedback: cs.feedback,
                                      createdAt: cs.createdAt,
                                    })
                                  }
                                  className={`neu-pill px-2 py-1 text-[11px] font-bold font-mono border transition-all cursor-pointer inline-flex items-center gap-1 hover:scale-105 ${
                                    cs.feedback && cs.feedback.trim()
                                      ? "text-emerald-300 border-emerald-500/40 bg-emerald-500/10 hover:border-purple-400 hover:text-white"
                                      : "text-emerald-300 border-emerald-500/20 hover:border-emerald-400"
                                  }`}
                                  title={
                                    cs.feedback && cs.feedback.trim()
                                      ? `Skor: ${cs.score} (Ada catatan feedback juri - klik untuk membaca)`
                                      : `Skor: ${cs.score} (Klik untuk detail)`
                                  }
                                >
                                  <span>{cs.score}</span>
                                  {cs.feedback && cs.feedback.trim() && (
                                    <span className="text-purple-400 text-[10px]" title="Ada catatan evaluasi">💬</span>
                                  )}
                                </button>
                              ) : (
                                <span
                                  className="text-[11px] text-gray-600 font-mono italic"
                                  title={`Belum dinilai (${cs.candidateName})`}
                                >
                                  -
                                </span>
                              )}
                            </td>
                          ))}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Legend of Candidate Titles */}
              <div className="pt-3 border-t border-white/5 space-y-2">
                <span className="text-[11px] font-bold text-gray-300 uppercase tracking-wider">
                  Keterangan Judul Inovasi (#1 - #{allCandidates.length}):
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-400">
                  {allCandidates.map((c, i) => (
                    <div key={c.id} className="flex items-start gap-2">
                      <span className="neu-icon-well w-5 h-5 text-[10px] font-bold text-purple-400 shrink-0">
                        {i + 1}
                      </span>
                      <span className="truncate leading-snug text-gray-300" title={c.name}>
                        {c.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* ======================================================== */}
            {/* SECTION: KUMPULAN FEEDBACK & CATATAN EVALUASI JURI       */}
            {/* ======================================================== */}
            <div className="neu-card p-5 border border-white/5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/5">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="neu-icon-well w-7 h-7 text-purple-400 flex items-center justify-center font-bold text-xs">
                      💬
                    </span>
                    <h3 className="text-sm font-bold text-white tracking-wide">
                      Feedback / Catatan Evaluasi Juri
                    </h3>
                  </div>
                  <p className="text-xs text-gray-400 mt-1 font-sans">
                    Catatan masukan, apresiasi, atau saran penyempurnaan karya inovasi bagi peserta yang ditulis oleh dewan juri.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleExportFeedbackCSV}
                    disabled={feedbackCount === 0}
                    className="neu-btn px-3 py-1.5 text-xs font-bold text-purple-400 hover:text-white flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                      <polyline points="7 10 12 15 17 10"></polyline>
                      <line x1="12" y1="15" x2="12" y2="3"></line>
                    </svg>
                    <span>Ekspor Catatan CSV ({feedbackCount})</span>
                  </button>
                </div>
              </div>

              {/* Filter Controls for Feedback */}
              <div className="flex flex-col sm:flex-row gap-3 items-center">
                {/* Filter by Candidate */}
                <div className="w-full sm:flex-1 neu-inset p-1">
                  <select
                    value={feedbackCandidateFilter}
                    onChange={(e) => setFeedbackCandidateFilter(e.target.value)}
                    className="w-full p-2 bg-transparent text-xs text-gray-200 focus:outline-none rounded-xl cursor-pointer"
                  >
                    <option value="" className="bg-[#1a1c24] text-gray-400">
                      Semua Makalah Inovasi ({allCandidates.length})
                    </option>
                    {allCandidates.map((c, i) => (
                      <option key={c.id} value={c.id.toString()} className="bg-[#1a1c24] text-gray-200">
                        #{i + 1} - {c.name.length > 55 ? `${c.name.slice(0, 55)}...` : c.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Filter by Judge */}
                <div className="w-full sm:w-60 neu-inset p-1">
                  <select
                    value={feedbackJudgeFilter}
                    onChange={(e) => setFeedbackJudgeFilter(e.target.value)}
                    className="w-full p-2 bg-transparent text-xs text-gray-200 focus:outline-none rounded-xl cursor-pointer"
                  >
                    <option value="" className="bg-[#1a1c24] text-gray-400">
                      Semua Juri ({allJudges.length})
                    </option>
                    {allJudges.map((j) => (
                      <option key={j.id} value={j.id.toString()} className="bg-[#1a1c24] text-gray-200">
                        {j.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Toggle: Only show entries with text */}
                <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-400 select-none whitespace-nowrap self-start sm:self-auto py-1">
                  <input
                    type="checkbox"
                    checked={feedbackOnlyHasText}
                    onChange={(e) => setFeedbackOnlyHasText(e.target.checked)}
                    className="rounded text-purple-600 focus:ring-0 bg-transparent"
                  />
                  <span>Hanya yang memiliki catatan ({feedbackCount})</span>
                </label>
              </div>

              {/* Feedback Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-2">
                {filteredFeedbacks.length === 0 ? (
                  <div className="col-span-full neu-inset p-8 rounded-xl text-center text-xs text-gray-400 italic">
                    Tidak ada catatan feedback juri yang sesuai dengan filter pencarian.
                  </div>
                ) : (
                  filteredFeedbacks.map((item) => (
                    <div
                      key={item.id}
                      className="neu-card p-4 border border-white/5 space-y-3 hover:border-purple-500/20 transition-all flex flex-col justify-between"
                    >
                      <div className="space-y-2.5">
                        {/* Header: Candidate title + Score */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <span className="neu-pill-inset px-2.5 py-1 text-[11px] font-bold text-purple-300 font-sans block truncate" title={item.candidate.name}>
                              {item.candidate.name}
                            </span>
                          </div>
                          <div className="neu-pill px-2.5 py-0.5 text-xs font-bold text-emerald-300 font-mono shrink-0 border border-emerald-500/30">
                            Skor: {item.score}
                          </div>
                        </div>

                        {/* Judge info & timestamp */}
                        <div className="flex items-center justify-between text-xs pt-1.5 border-t border-white/5">
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="w-6 h-6 rounded-lg neu-panel flex items-center justify-center text-[10px] font-bold text-purple-400 shrink-0">
                              {item.user.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <span className="font-semibold text-white truncate block">{item.user.name}</span>
                              <span className="text-[10px] text-gray-400 font-mono">NIP: {item.user.nip || "-"}</span>
                            </div>
                          </div>
                          <div className="text-[10px] text-gray-400 font-mono shrink-0">
                            {new Date(item.createdAt).toLocaleString("id-ID", {
                              timeZone: "Asia/Jakarta",
                              dateStyle: "short",
                              timeStyle: "short",
                            })} WIB
                          </div>
                        </div>

                        {/* The feedback message */}
                        <div className="neu-inset p-3.5 rounded-xl border border-purple-500/10">
                          {item.feedback && item.feedback.trim() ? (
                            <p className="text-xs text-gray-200 whitespace-pre-line leading-relaxed font-sans">
                              &ldquo;{item.feedback}&rdquo;
                            </p>
                          ) : (
                            <p className="text-xs text-gray-500 italic font-sans">
                              (Tidak ada catatan evaluasi dari juri)
                            </p>
                          )}
                        </div>
                      </div>

                      {item.feedback && item.feedback.trim() && (
                        <div className="pt-2 flex justify-end">
                          <button
                            type="button"
                            onClick={() =>
                              setSelectedFeedbackModal({
                                judgeName: item.user.name,
                                judgeNip: item.user.nip,
                                candidateName: item.candidate.name,
                                score: item.score,
                                feedback: item.feedback,
                                createdAt: item.createdAt,
                              })
                            }
                            className="text-[11px] text-purple-400 hover:text-purple-300 hover:underline flex items-center gap-1 font-semibold"
                          >
                            <span>Perbesar Catatan &rarr;</span>
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 2: LOG RIWAYAT PENILAIAN DETAIL                     */}
        {/* ======================================================== */}
        {activeTab === "logs" && (
          <div className="space-y-6">
            
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
                  placeholder="Cari berdasarkan nama juri, NIP, judul inovasi, atau isi feedback..."
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
                    Semua Juri ({allJudges.length})
                  </option>
                  {allJudges.map((j) => (
                    <option key={j.id} value={j.id.toString()} className="bg-[#1a1c24] text-gray-200">
                      {j.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Audit Logs Table */}
            <div className="neu-inset p-3 rounded-2xl overflow-x-auto border border-white/5">
              <table className="w-full text-left border-collapse min-w-[950px]">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="p-3 text-xs font-bold text-purple-400 uppercase tracking-wider text-center w-12">
                      No
                    </th>
                    <th className="p-3 text-xs font-bold text-purple-400 uppercase tracking-wider w-40">
                      Waktu Penilaian
                    </th>
                    <th className="p-3 text-xs font-bold text-purple-400 uppercase tracking-wider w-48">
                      Juri Penilai
                    </th>
                    <th className="p-3 text-xs font-bold text-purple-400 uppercase tracking-wider w-64">
                      Makalah Inovasi
                    </th>
                    <th className="p-3 text-xs font-bold text-purple-400 uppercase tracking-wider">
                      Feedback / Catatan Juri
                    </th>
                    <th className="p-3 text-xs font-bold text-purple-400 uppercase tracking-wider text-center w-24">
                      Skor Total
                    </th>
                    <th className="p-3 text-xs font-bold text-purple-400 uppercase tracking-wider text-center w-24">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredLogs.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-gray-400 text-sm">
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

                      const hasFeedback = Boolean(log.feedback && log.feedback.trim());

                      return (
                        <tr key={log.id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="p-3 text-center text-xs font-mono text-gray-400">
                            {index + 1}
                          </td>
                          <td className="p-3">
                            <div className="text-xs font-mono text-gray-300 font-semibold flex items-center gap-1.5">
                              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-400 shrink-0">
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
                            <div className="text-sm font-medium text-gray-200 line-clamp-2" title={log.candidate.name}>
                              {log.candidate.name}
                            </div>
                            {log.candidate.candidatePosition && (
                              <div className="text-xs text-gray-400 font-sans mt-0.5 truncate" title={log.candidate.candidatePosition}>
                                {log.candidate.candidatePosition}
                              </div>
                            )}
                          </td>
                          
                          {/* Feedback / Catatan Evaluasi Juri column */}
                          <td className="p-3">
                            {hasFeedback ? (
                              <div
                                onClick={() =>
                                  setSelectedFeedbackModal({
                                    judgeName: log.user.name,
                                    judgeNip: log.user.nip,
                                    candidateName: log.candidate.name,
                                    score: log.score,
                                    feedback: log.feedback,
                                    createdAt: log.createdAt,
                                  })
                                }
                                className="neu-pill-inset p-2.5 rounded-xl border border-purple-500/20 text-xs text-gray-200 hover:border-purple-400 hover:bg-white/[0.02] transition-all cursor-pointer group max-w-sm"
                                title="Klik untuk membuka catatan lengkap"
                              >
                                <div className="flex items-center gap-1.5 text-[10px] font-bold text-purple-400 mb-1 uppercase tracking-wider">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                                  </svg>
                                  <span>Catatan Juri:</span>
                                </div>
                                <p className="line-clamp-2 text-gray-300 font-sans italic group-hover:text-white transition-colors">
                                  &ldquo;{log.feedback}&rdquo;
                                </p>
                                <div className="text-[10px] text-purple-400/80 group-hover:text-purple-300 mt-1 flex items-center gap-1 font-semibold">
                                  <span>Buka catatan lengkap &rarr;</span>
                                </div>
                              </div>
                            ) : (
                              <span className="text-gray-600 text-xs italic font-sans">- Tidak ada catatan -</span>
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
        )}

      </div>

      {/* ======================================================== */}
      {/* POPUP MODAL: DETAIL FEEDBACK & CATATAN EVALUASI JURI     */}
      {/* ======================================================== */}
      {selectedFeedbackModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in"
          onClick={() => setSelectedFeedbackModal(null)}
        >
          <div
            className="neu-panel w-full max-w-xl p-6 border border-white/10 rounded-2xl shadow-2xl space-y-5 animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-white/10">
              <div>
                <div className="flex items-center gap-2">
                  <span className="neu-icon-well w-8 h-8 text-purple-400 flex items-center justify-center font-bold text-sm">
                    💬
                  </span>
                  <h3 className="text-base font-bold text-white tracking-wide">
                    Feedback / Catatan Evaluasi Juri
                  </h3>
                </div>
                <p className="text-xs text-gray-400 mt-1 font-sans">
                  Detail masukan, apresiasi, atau rekomendasi dewan juri bagi karya inovasi ini.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedFeedbackModal(null)}
                className="neu-btn p-1.5 rounded-lg text-gray-400 hover:text-white"
                title="Tutup dialog"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            {/* Score & Candidate Details */}
            <div className="grid grid-cols-2 gap-3 text-xs neu-inset p-3.5 rounded-xl border border-white/5">
              <div>
                <span className="text-gray-400 block text-[10px] uppercase font-bold tracking-wider">Juri Penilai</span>
                <span className="text-white font-semibold text-sm">{selectedFeedbackModal.judgeName}</span>
                {selectedFeedbackModal.judgeNip && (
                  <span className="text-gray-400 block text-[11px] font-mono">NIP: {selectedFeedbackModal.judgeNip}</span>
                )}
              </div>
              <div>
                <span className="text-gray-400 block text-[10px] uppercase font-bold tracking-wider">Total Skor Diberikan</span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-xl font-bold text-purple-400 font-mono">{selectedFeedbackModal.score}</span>
                  <span className="text-xs text-gray-400 font-sans">/ 100</span>
                </div>
              </div>
              <div className="col-span-2 pt-2 border-t border-white/5">
                <span className="text-gray-400 block text-[10px] uppercase font-bold tracking-wider">Makalah Inovasi</span>
                <span className="text-gray-200 font-medium text-xs leading-snug">{selectedFeedbackModal.candidateName}</span>
              </div>
              {selectedFeedbackModal.createdAt && (
                <div className="col-span-2 text-[11px] text-gray-400 font-mono">
                  Waktu Penilaian: {new Date(selectedFeedbackModal.createdAt).toLocaleString("id-ID", {
                    timeZone: "Asia/Jakarta",
                    dateStyle: "long",
                    timeStyle: "short",
                  })} WIB
                </div>
              )}
            </div>

            {/* Feedback Content */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                  <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
                <span>Catatan Masukan, Apresiasi, atau Saran:</span>
              </label>

              {selectedFeedbackModal.feedback && selectedFeedbackModal.feedback.trim() ? (
                <div className="neu-inset p-4 rounded-xl border border-purple-500/20 max-h-64 overflow-y-auto">
                  <p className="text-sm text-gray-100 whitespace-pre-line leading-relaxed font-sans">
                    {selectedFeedbackModal.feedback}
                  </p>
                </div>
              ) : (
                <div className="neu-inset p-4 rounded-xl border border-white/5 text-center text-xs text-gray-400 italic font-sans">
                  Juri ini tidak menyertakan catatan evaluasi tambahan untuk inovasi ini.
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end pt-2 border-t border-white/5">
              <button
                type="button"
                onClick={() => setSelectedFeedbackModal(null)}
                className="neu-btn px-5 py-2 text-xs font-bold text-gray-300 hover:text-white"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

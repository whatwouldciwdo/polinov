"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Toast from "@/components/Toast";

interface Candidate {
  id: number;
  name: string;
  candidateNip: string;
  candidatePosition: string;
  file: string | null;
}

export default function AdminCandidatesPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const fetchCandidates = async () => {
    try {
      const res = await fetch("/api/admin/candidates");
      const data = await res.json();
      if (Array.isArray(data)) setCandidates(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm("Apakah Anda yakin ingin menghapus data makalah/kandidat ini?")) return;

    const res = await fetch(`/api/admin/candidates/${id}`, { method: "DELETE" });
    if (res.ok) {
      setToast({ type: "success", message: "Makalah berhasil dihapus." });
      fetchCandidates();
    }
  };

  return (
    <>
      {toast && <Toast type={toast.type} message={toast.message} />}

      {/* Breadcrumb */}
      <nav className="mb-6">
        <div className="inline-flex items-center gap-2 neu-pill-inset px-4 py-2 text-xs font-medium text-gray-400">
          <Link href="/dashboard" className="text-purple-400 hover:underline">Dashboard</Link>
          <span>/</span>
          <span className="text-gray-200 font-semibold">Kelola Makalah</span>
        </div>
      </nav>

      {/* Main Panel */}
      <div className="neu-panel p-6 sm:p-8 border border-white/5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-white/5">
          <div>
            <h1 className="text-xl font-bold text-white tracking-wide">Daftar Makalah Inovasi</h1>
            <p className="text-xs text-gray-400 mt-0.5">Kelola berkas makalah dan data peserta inovator.</p>
          </div>
          <Link href="/dashboard/candidates/create">
            <button className="neu-btn-primary px-5 py-2.5 text-xs font-semibold flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              <span>Tambah Makalah Baru</span>
            </button>
          </Link>
        </div>

        {/* Candidates Table */}
        <div className="neu-inset p-3 rounded-2xl overflow-x-auto border border-white/5">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5">
                <th className="p-3 text-xs font-bold text-purple-400 uppercase tracking-wider text-center w-12">#</th>
                <th className="p-3 text-xs font-bold text-purple-400 uppercase tracking-wider">Judul Inovasi</th>
                <th className="p-3 text-xs font-bold text-purple-400 uppercase tracking-wider">NIP Kandidat</th>
                <th className="p-3 text-xs font-bold text-purple-400 uppercase tracking-wider">Jabatan</th>
                <th className="p-3 text-xs font-bold text-purple-400 uppercase tracking-wider text-center">Berkas</th>
                <th className="p-3 text-xs font-bold text-purple-400 uppercase tracking-wider text-right w-36">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {candidates.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-sm text-gray-400">
                    Belum ada data makalah kandidat.
                  </td>
                </tr>
              ) : (
                candidates.map((candidate, index) => (
                  <tr key={candidate.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-3 text-center">
                      <span className="neu-icon-well w-7 h-7 mx-auto text-xs font-semibold text-gray-400">
                        {index + 1}
                      </span>
                    </td>
                    <td className="p-3 font-semibold text-white text-sm">
                      <div>{candidate.name}</div>
                      {(candidate as any).members && Array.isArray((candidate as any).members) && (candidate as any).members.length > 0 && (
                        <div className="flex flex-wrap items-center gap-2 mt-1.5">
                          <span className="neu-pill-inset px-2 py-0.5 text-[10px] text-purple-400 font-semibold font-mono">
                            {((candidate as any).members as any[]).length} Inovator
                          </span>
                          <div className="flex -space-x-1.5 overflow-hidden items-center">
                            {((candidate as any).members as any[]).map((m: any, i: number) =>
                              m.photo ? (
                                <img
                                  key={i}
                                  src={`/${m.photo}`}
                                  alt={m.name}
                                  className="inline-block h-6 w-6 rounded-full ring-2 ring-[#1e2029] object-cover"
                                  title={`${m.name} (${m.nip || "-"})`}
                                />
                              ) : (
                                <div
                                  key={i}
                                  className="h-6 w-6 rounded-full bg-purple-900/60 ring-2 ring-[#1e2029] flex items-center justify-center text-[9px] text-purple-300 font-bold"
                                  title={`${m.name} (${m.nip || "-"})`}
                                >
                                  {m.name ? m.name.charAt(0).toUpperCase() : "I"}
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      )}
                    </td>
                    <td className="p-3 text-xs text-gray-300 font-mono">
                      {(candidate as any).members && Array.isArray((candidate as any).members) && (candidate as any).members.length > 0
                        ? ((candidate as any).members as any[]).map((m: any) => m.nip || "-").join(", ")
                        : candidate.candidateNip}
                    </td>
                    <td className="p-3 text-xs text-gray-300">
                      {(candidate as any).members && Array.isArray((candidate as any).members) && (candidate as any).members.length > 0
                        ? ((candidate as any).members as any[]).map((m: any) => m.position || "-").join(", ")
                        : candidate.candidatePosition}
                    </td>
                    <td className="p-3 text-center">
                      {candidate.file ? (
                        <a
                          href={`/${candidate.file}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="neu-pill px-3 py-1 text-xs font-semibold text-purple-300 hover:text-white inline-block"
                        >
                          Lihat File
                        </a>
                      ) : (
                        <span className="text-xs text-gray-500 italic">-</span>
                      )}
                    </td>
                    <td className="p-3 text-right space-x-2">
                      <Link href={`/dashboard/candidates/edit/${candidate.id}`}>
                        <button className="neu-btn px-3 py-1 text-xs font-semibold text-blue-400 hover:text-white">
                          Edit
                        </button>
                      </Link>
                      <button
                        onClick={() => handleDelete(candidate.id)}
                        className="neu-btn px-3 py-1 text-xs font-semibold text-red-400 hover:text-red-300"
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

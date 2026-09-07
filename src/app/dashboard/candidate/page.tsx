import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function CandidatePage() {
  const candidates = await prisma.candidate.findMany();

  return (
    <div className="relative flex flex-col items-center justify-between min-h-screen py-10 px-4 font-cabin text-gray-100 bg-[#1e2029]">
      {/* Background Accent */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-purple-600/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Main Card */}
      <div className="relative z-10 w-full max-w-5xl neu-panel p-6 sm:p-10 border border-white/5 my-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 pb-6 border-b border-white/5">
          <div>
            <span className="inline-block px-3 py-1 text-xs font-semibold text-purple-400 neu-pill-inset uppercase tracking-wider mb-2">
              Dokumen &amp; Referensi
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              MAKALAH INOVASI 2026
            </h1>
          </div>
          <Link href="/dashboard">
            <button className="neu-btn px-5 py-2.5 text-xs font-semibold text-gray-300 hover:text-white">
              &larr; Kembali ke Home
            </button>
          </Link>
        </div>

        {/* Table in Inset Well */}
        <div className="neu-inset p-3 rounded-2xl overflow-x-auto border border-white/5">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5">
                <th className="p-4 text-xs font-bold text-purple-400 uppercase tracking-wider text-center w-16">No</th>
                <th className="p-4 text-xs font-bold text-purple-400 uppercase tracking-wider">Judul Inovasi</th>
                <th className="p-4 text-xs font-bold text-purple-400 uppercase tracking-wider text-right w-48">Aksi Dokumen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {candidates.length === 0 ? (
                <tr>
                  <td colSpan={3} className="p-8 text-center text-gray-400 text-sm">
                    Belum ada makalah yang terdaftar.
                  </td>
                </tr>
              ) : (
                candidates.map((cd, index) => (
                  <tr key={cd.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-4 text-center">
                      <span className="neu-icon-well w-8 h-8 mx-auto text-xs font-bold text-gray-400">
                        {index + 1}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="font-semibold text-white text-sm">{cd.name}</div>
                      {(cd as any).members && Array.isArray((cd as any).members) && (cd as any).members.length > 0 ? (
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          {((cd as any).members as any[]).map((m: any, i: number) => (
                            <div
                              key={i}
                              className="inline-flex items-center gap-2 neu-inset px-2.5 py-1 rounded-xl text-xs"
                            >
                              {m.photo ? (
                                <img
                                  src={`/${m.photo}`}
                                  alt={m.name}
                                  className="w-6 h-6 rounded-full object-cover"
                                />
                              ) : (
                                <div className="w-6 h-6 rounded-full bg-purple-900/50 flex items-center justify-center text-[10px] text-purple-300 font-bold">
                                  {m.name ? m.name.charAt(0).toUpperCase() : "I"}
                                </div>
                              )}
                              <div className="flex items-baseline gap-1">
                                <span className="text-gray-200 font-medium">{m.name}</span>
                                {m.position && (
                                  <span className="text-gray-500 text-[10px]">
                                    ({m.position})
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-xs text-gray-400 font-sans mt-0.5">
                          {cd.candidatePosition || "Inovator"} {cd.candidateNip ? `\u2022 ${cd.candidateNip}` : ""}
                        </div>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      {cd.file ? (
                        <div className="inline-flex items-center gap-2">
                          <Link
                            href={`/dashboard/viewer/${cd.id}?from=/dashboard/candidate`}
                            className="neu-btn-primary px-3.5 py-1.5 text-xs font-semibold flex items-center gap-1.5 shadow-md"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                            </svg>
                            <span>Buka Web Viewer</span>
                          </Link>
                          <a
                            href={`/${cd.file}`}
                            download
                            className="neu-btn px-3 py-1.5 text-xs font-semibold text-gray-400 hover:text-white hidden sm:inline-flex"
                            title="Unduh File Asli"
                          >
                            Download
                          </a>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-500 italic">Berkas belum diunggah</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer */}
      <div className="relative z-10 flex justify-center w-full max-w-5xl mt-8">
        <div className="neu-pill px-6 py-2.5 text-xs text-purple-300 font-mono tracking-wider border border-white/5">
          &copy; 2026 - SISTEM INFORMASI POLINOV
        </div>
      </div>
    </div>
  );
}

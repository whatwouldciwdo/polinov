import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function TableScorePage() {
  const candidates = await prisma.candidate.findMany({
    include: { scores: true },
  });

  const candidatesWithAvg = candidates.map((cd) => ({
    ...cd,
    avg:
      cd.scores.length > 0
        ? cd.scores.reduce((sum, s) => sum + parseFloat(s.score), 0) /
          cd.scores.length
        : 0,
    scoreCount: cd.scores.length,
  }));

  // Sort descending by average score
  candidatesWithAvg.sort((a, b) => b.avg - a.avg);

  return (
    <div className="relative flex flex-col items-center justify-between min-h-screen py-10 px-4 font-cabin text-gray-100 bg-[#1e2029]">
      {/* Background Subtle Accent */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-purple-600/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Main Card */}
      <div className="relative z-10 w-full max-w-5xl neu-panel p-6 sm:p-10 border border-white/5 my-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 pb-6 border-b border-white/5">
          <div>
            <span className="inline-block px-3 py-1 text-xs font-semibold text-purple-400 neu-pill-inset uppercase tracking-wider mb-2">
              Rekapitulasi Nilai
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              HASIL PENILAIAN INOVASI
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
                <th className="p-4 text-xs font-bold text-purple-400 uppercase tracking-wider text-center w-16">Peringkat</th>
                <th className="p-4 text-xs font-bold text-purple-400 uppercase tracking-wider">Judul Inovasi</th>
                <th className="p-4 text-xs font-bold text-purple-400 uppercase tracking-wider text-center w-36">Nilai Rata-rata</th>
                <th className="p-4 text-xs font-bold text-purple-400 uppercase tracking-wider text-center w-36">Jumlah Penilai</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {candidatesWithAvg.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-gray-400 text-sm">
                    Belum ada data inovasi atau penilaian.
                  </td>
                </tr>
              ) : (
                candidatesWithAvg.map((cd, index) => (
                  <tr key={cd.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-4 text-center">
                      <span className={`neu-icon-well w-8 h-8 mx-auto text-xs font-bold ${
                        index === 0 ? "text-yellow-400" : index === 1 ? "text-gray-300" : index === 2 ? "text-amber-600" : "text-gray-400"
                      }`}>
                        {index + 1}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="font-semibold text-white text-sm">{cd.name}</div>
                      <div className="text-xs text-gray-400 font-sans mt-0.5">{cd.candidatePosition || "Inovator"} &bull; {cd.candidateNip || "-"}</div>
                    </td>
                    <td className="p-4 text-center">
                      <span className="neu-pill px-3 py-1 text-sm font-bold text-purple-300 font-mono inline-block">
                        {cd.avg.toFixed(2)}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <span className="neu-pill-inset px-3 py-1 text-xs text-gray-400 font-mono inline-block">
                        {cd.scoreCount} Penilai
                      </span>
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

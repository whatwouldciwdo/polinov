import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import { EVALUATION_CRITERIA } from "@/lib/criteria";

export const dynamic = "force-dynamic";

export default async function AfterScorePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getServerSession(authOptions);

  const score = await prisma.score.findUnique({
    where: { id: parseInt(id) },
    include: { candidate: true },
  });

  if (!score) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1e2029] text-white">
        <div className="neu-panel p-8 text-center max-w-md">
          <p className="text-gray-300 mb-4">Data penilaian tidak ditemukan.</p>
          <Link href="/dashboard">
            <button className="neu-btn px-6 py-2">Kembali ke Home</button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center min-h-screen py-10 px-4 font-mono bg-[#1e2029]">
      {/* Dashboard Header - Neumorphic Thank You Card */}
      <div className="relative w-full max-w-5xl p-8 sm:p-12 rounded-3xl neu-panel flex flex-col md:flex-row items-center justify-between overflow-hidden border border-white/5 mb-8">
        
        {/* Soft Background Accent */}
        <div className="absolute -top-24 -left-24 w-80 h-80 bg-purple-600/15 rounded-full blur-3xl pointer-events-none"></div>

        {/* Left Section */}
        <div className="relative flex-1 z-10 space-y-4 text-center md:text-left">
          <img
            src="/image/moon.png"
            alt="Moon"
            className="hidden sm:block absolute w-48 h-auto -left-16 -top-28 opacity-90 pointer-events-none drop-shadow-[0_15px_25px_rgba(0,0,0,0.6)]"
          />
          <span className="inline-block px-3 py-1 text-xs font-semibold text-purple-400 neu-pill-inset uppercase tracking-widest">
            Penilaian Sukses
          </span>
          <h1 className="pt-2 text-4xl sm:text-5xl font-bold text-white font-bitter tracking-tight">
            TERIMA KASIH!
          </h1>
          
          <div className="neu-inset p-4 rounded-2xl border border-white/5 text-sm text-gray-300 space-y-1 my-3">
            <p>
              Bapak/Ibu <span className="font-semibold text-white">{session?.user?.name || "User"}</span> telah memberikan penilaian untuk:
            </p>
            <p className="font-bold text-purple-300 text-base">
              {score.candidate.name}
            </p>
            <div className="pt-2 flex items-center justify-center md:justify-start gap-3">
              <span className="text-xs text-gray-400 uppercase tracking-wider">Total Nilai:</span>
              <span className="neu-pill px-4 py-1 text-lg font-bold text-purple-400 font-mono">
                {score.score}
              </span>
            </div>
          </div>

          <div className="pt-2 flex flex-wrap gap-4 justify-center md:justify-start items-center">
            <Link href="/dashboard">
              <button className="neu-btn px-6 py-2.5 text-sm font-semibold text-gray-300 hover:text-white">
                &larr; Home
              </button>
            </Link>
            <Link href="/dashboard/history">
              <button className="neu-btn px-6 py-2.5 text-sm font-semibold text-purple-300 hover:text-white">
                Riwayat Penilaian Saya
              </button>
            </Link>
            <Link href="/dashboard/score">
              <button className="neu-btn-primary px-6 py-2.5 text-sm font-semibold tracking-wide">
                Nilai Judul Lain
              </button>
            </Link>
          </div>
        </div>

        {/* Right Section */}
        <div className="relative flex items-center justify-center flex-1 mt-8 md:mt-0">
          <img
            src="/image/planets.png"
            alt="Planets"
            className="object-contain w-72 sm:w-88 h-72 sm:h-88 drop-shadow-[0_20px_35px_rgba(0,0,0,0.6)]"
          />
          <div className="absolute text-right top-4 right-4 neu-pill px-4 py-2 border border-white/5">
            <p className="text-2xl font-bold text-white font-bitter leading-none">2026</p>
            <p className="text-xs text-purple-400 font-medium">UBP CLG</p>
          </div>
        </div>
      </div>

      {/* 7-Criteria Detail Breakdown Card */}
      <div className="w-full max-w-5xl neu-panel p-6 sm:p-8 border border-white/5 space-y-4 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-white/5">
          <div>
            <h2 className="text-lg font-bold text-white tracking-wide">
              Rekapitulasi Nilai Per Kriteria (Bobot 2026)
            </h2>
            <p className="text-xs text-gray-400">
              Rincian poin evaluasi berdasarkan 7 rubrik standar POLINOV
            </p>
          </div>
          <span className="neu-pill px-4 py-1 text-sm font-bold font-mono text-purple-400 border border-purple-500/30 self-start sm:self-auto">
            Total: {score.score} / 100
          </span>
        </div>

        <div className="neu-inset p-2 rounded-2xl overflow-x-auto border border-white/5">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-white/5 text-purple-400 font-bold uppercase">
                <th className="p-3 text-center w-10">No</th>
                <th className="p-3">Kriteria Penilaian &amp; Fokus</th>
                <th className="p-3 text-center w-24">Bobot</th>
                <th className="p-3 text-center w-28">Skor (0-100)</th>
                <th className="p-3 text-right w-28">Poin Diperoleh</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {(() => {
                const detailsArr = Array.isArray((score as any).details) ? (score as any).details : [];

                return EVALUATION_CRITERIA.map((criterion, idx) => {
                  const matched = detailsArr.find(
                    (d: any) => d.criterion_id === criterion.id || d.criterionId === criterion.id
                  );
                  const rawScore = matched && typeof matched.score === "number" ? matched.score : null;
                  const subtotal = rawScore !== null ? (rawScore * criterion.weight).toFixed(2) : "-";

                  return (
                    <tr key={criterion.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="p-3 text-center font-mono text-gray-400">{idx + 1}</td>
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
                          <span className="text-gray-500 font-mono italic">Tervalidasi</span>
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
                  Total Nilai:
                </td>
                <td className="p-3 text-center text-purple-300 font-mono">100%</td>
                <td className="p-3 text-center text-gray-400">-</td>
                <td className="p-3 text-right text-purple-400 font-mono text-sm">
                  {score.score} / 100
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {(score as any).feedback && (
          <div className="neu-card p-4 border border-white/5 space-y-1 mt-3">
            <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">
              Feedback / Catatan Evaluasi Anda:
            </span>
            <p className="text-xs text-gray-200 italic">&ldquo;{(score as any).feedback}&rdquo;</p>
          </div>
        )}
      </div>

      {/* Cards Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl">
        {/* Card 1 */}
        <Link href="/dashboard/table-score" className="group">
          <div className="neu-card p-6 h-full flex flex-col justify-between">
            <div>
              <div className="neu-icon-well w-14 h-14 mb-5 text-purple-400 group-hover:text-purple-300 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 32 32" fill="none">
                  <path d="M16 23.0267L24.24 28L22.0533 18.6267L29.3333 12.32L19.7467 11.5067L16 2.66666L12.2533 11.5067L2.66666 12.32L9.94666 18.6267L7.75999 28L16 23.0267Z" fill="currentColor" fillOpacity="0.9" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-white group-hover:text-purple-300 transition-colors">
                Tabel Hasil Penilaian
              </h3>
              <p className="mt-2 text-sm text-gray-400 leading-relaxed font-sans">
                Menampilkan rekapitulasi nilai dan peringkat seluruh inovasi.
              </p>
            </div>
            <div className="mt-4 flex items-center text-xs font-semibold text-purple-400 group-hover:translate-x-1 transition-transform">
              Buka Tabel &rarr;
            </div>
          </div>
        </Link>

        {/* Card 2 */}
        <Link href="/dashboard/candidate" className="group">
          <div className="neu-card p-6 h-full flex flex-col justify-between">
            <div>
              <div className="neu-icon-well w-14 h-14 mb-5 text-purple-400 group-hover:text-purple-300 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                  <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
              </div>
              <h3 className="text-lg font-bold text-white group-hover:text-purple-300 transition-colors">
                Makalah Inovasi
              </h3>
              <p className="mt-2 text-sm text-gray-400 leading-relaxed font-sans">
                Akses dokumen dan unduh berkas makalah inovasi tahun 2026.
              </p>
            </div>
            <div className="mt-4 flex items-center text-xs font-semibold text-purple-400 group-hover:translate-x-1 transition-transform">
              Lihat Makalah &rarr;
            </div>
          </div>
        </Link>

        {/* Card 3 */}
        <div className="neu-card p-6 h-full flex flex-col justify-between opacity-85">
          <div>
            <div className="neu-icon-well w-14 h-14 mb-5 text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                <polyline points="21 15 16 10 5 21"></polyline>
              </svg>
            </div>
            <h3 className="text-lg font-bold text-white">
              Galeri Inovasi
            </h3>
            <p className="mt-2 text-sm text-gray-400 leading-relaxed font-sans">
              Dokumentasi foto dan rekam jejak inovator tahun sebelumnya.
            </p>
          </div>
          <div className="mt-4 text-xs text-gray-500 font-sans">
            Segera Hadir
          </div>
        </div>
      </div>

      {/* Footer Pill */}
      <div className="flex justify-center w-full max-w-5xl mt-12">
        <div className="neu-pill px-6 py-2.5 text-xs text-purple-300 font-mono tracking-wider border border-white/5">
          &copy; 2026 - SISTEM INFORMASI POLINOV
        </div>
      </div>
    </div>
  );
}

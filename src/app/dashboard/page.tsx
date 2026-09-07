import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import LogoutButton from "@/components/LogoutButton";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  return (
    <div className="flex flex-col items-center min-h-screen py-10 px-4 font-mono bg-[#1e2029]">
      {/* Dashboard Header - Neumorphic Hero Panel */}
      <div className="relative w-full max-w-5xl p-8 sm:p-12 rounded-3xl neu-panel flex flex-col md:flex-row items-center justify-between overflow-hidden border border-white/5 mb-8">
        
        {/* Soft Background Accent */}
        <div className="absolute -top-24 -left-24 w-80 h-80 bg-purple-600/15 rounded-full blur-3xl pointer-events-none"></div>

        {/* Left Section (Text and Action) */}
        <div className="relative flex-1 z-10 space-y-4 text-center md:text-left">
          <img
            src="/image/moon.png"
            alt="Moon"
            className="hidden sm:block absolute w-48 h-auto -left-16 -top-28 opacity-90 pointer-events-none drop-shadow-[0_15px_25px_rgba(0,0,0,0.6)]"
          />
          <span className="inline-block px-3 py-1 text-xs font-semibold text-purple-400 neu-pill-inset uppercase tracking-widest">
            Dashboard Utama
          </span>
          <h1 className="pt-2 text-4xl sm:text-5xl font-bold text-white font-bitter tracking-tight">
            PENILAIAN INOVASI <span className="text-purple-400">2026</span>
          </h1>
          <p className="text-gray-300 font-extralight text-base">
            Selamat datang, <span className="font-semibold text-white">{session?.user?.name || "User"}</span>
          </p>

          <div className="pt-4 flex flex-wrap gap-4 justify-center md:justify-start items-center">
            <Link href="/dashboard/score">
              <button className="neu-btn-primary px-8 py-3 text-sm font-semibold tracking-wide">
                Nilai Sekarang
              </button>
            </Link>
            <Link href="/dashboard/history">
              <button className="neu-btn px-6 py-3 text-sm font-semibold text-purple-300 hover:text-white">
                Riwayat Saya
              </button>
            </Link>
            {session?.user?.role === "admin" && (
              <Link href="/dashboard/audit-logs">
                <button className="neu-btn px-6 py-3 text-sm font-semibold text-emerald-400 hover:text-emerald-300">
                  Audit Log Juri
                </button>
              </Link>
            )}
            <LogoutButton />
          </div>
        </div>

        {/* Right Section (Planets Illustration) */}
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

      {/* Cards Section - 4 Columns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-5xl">
        {/* Card 1: Riwayat Penilaian Saya */}
        <Link href="/dashboard/history" className="group">
          <div className="neu-card p-6 h-full flex flex-col justify-between">
            <div>
              <div className="neu-icon-well w-14 h-14 mb-5 text-purple-400 group-hover:text-purple-300 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 11l3 3L22 4"></path>
                  <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
                </svg>
              </div>
              <h3 className="text-lg font-bold text-white group-hover:text-purple-300 transition-colors">
                Riwayat Penilaian
              </h3>
              <p className="mt-2 text-sm text-gray-400 leading-relaxed font-sans">
                Pantau progres dan status penilaian seluruh makalah inovasi Anda.
              </p>
            </div>
            <div className="mt-4 flex items-center text-xs font-semibold text-purple-400 group-hover:translate-x-1 transition-transform">
              Lihat Riwayat &rarr;
            </div>
          </div>
        </Link>

        {/* Card 2: Tabel Hasil Penilaian */}
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

        {/* Card 3: Makalah Inovasi */}
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

        {/* Card 4: Galeri Inovasi */}
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

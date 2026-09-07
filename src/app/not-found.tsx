import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1e2029] p-4">
      <div className="neu-panel p-8 max-w-md text-center border border-white/5 space-y-4">
        <h2 className="text-4xl font-extrabold text-purple-400">404</h2>
        <h3 className="text-lg font-bold text-white">Halaman Tidak Ditemukan</h3>
        <p className="text-xs text-gray-400">
          Halaman yang Anda tuju tidak tersedia atau telah dipindahkan.
        </p>
        <Link href="/dashboard" className="inline-block mt-4">
          <button className="neu-btn-primary px-6 py-2.5 text-xs font-bold">
            Kembali ke Dashboard
          </button>
        </Link>
      </div>
    </div>
  );
}

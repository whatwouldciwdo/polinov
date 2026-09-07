"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Toast from "@/components/Toast";

export default function CreateUserPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);

    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: formData.get("name"),
        nip: formData.get("nip"),
        email: formData.get("email"),
        password: formData.get("password"),
      }),
    });

    if (res.ok) {
      router.push("/dashboard/users");
    } else {
      const data = await res.json();
      setError(data.error || "Terjadi kesalahan");
      setLoading(false);
    }
  };

  return (
    <>
      {error && <Toast type="error" message={error} />}
      
      {/* Breadcrumb */}
      <nav className="mb-6">
        <div className="inline-flex items-center gap-2 neu-pill-inset px-4 py-2 text-xs font-medium text-gray-400">
          <Link href="/dashboard" className="text-purple-400 hover:underline">Dashboard</Link>
          <span>/</span>
          <Link href="/dashboard/users" className="text-purple-400 hover:underline">Data Juri</Link>
          <span>/</span>
          <span className="text-gray-200 font-semibold">Tambah Juri</span>
        </div>
      </nav>

      {/* Form Card */}
      <div className="w-full max-w-xl neu-panel p-6 sm:p-10 border border-white/5">
        <div className="mb-6 pb-4 border-b border-white/5">
          <h2 className="text-xl font-bold text-white tracking-wide">Tambah Juri Penilai Baru</h2>
          <p className="text-xs text-gray-400 mt-1">Lengkapi informasi juri baru untuk akun evaluator inovasi.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="name" className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
              Nama Lengkap
            </label>
            <div className="neu-inset px-4 py-1">
              <input
                type="text"
                id="name"
                name="name"
                className="w-full py-2.5 bg-transparent border-none focus:outline-none text-white text-sm placeholder-gray-500"
                placeholder="cth. Budi Santoso"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="nip" className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
              NIP
            </label>
            <div className="neu-inset px-4 py-1">
              <input
                type="text"
                id="nip"
                name="nip"
                className="w-full py-2.5 bg-transparent border-none focus:outline-none text-white text-sm placeholder-gray-500"
                placeholder="cth. 198501012010121001"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
              Email Perusahaan
            </label>
            <div className="neu-inset px-4 py-1">
              <input
                type="email"
                id="email"
                name="email"
                className="w-full py-2.5 bg-transparent border-none focus:outline-none text-white text-sm placeholder-gray-500"
                placeholder="cth. budi@perusahaan.com"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
              Password
            </label>
            <div className="neu-inset px-4 py-1">
              <input
                type="password"
                id="password"
                name="password"
                className="w-full py-2.5 bg-transparent border-none focus:outline-none text-white text-sm placeholder-gray-500"
                placeholder="Masukkan password"
                required
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-white/5">
            <Link href="/dashboard/users">
              <button type="button" className="neu-btn px-5 py-2.5 text-xs font-semibold text-gray-300 hover:text-white">
                Batal
              </button>
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="neu-btn-primary px-6 py-2.5 text-xs font-bold tracking-wide disabled:opacity-50"
            >
              {loading ? "Menyimpan..." : "Simpan Data Juri"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import Toast from "@/components/Toast";

export default function EditUserPage() {
  const router = useRouter();
  const params = useParams();
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`/api/admin/users/${params.id}`)
      .then((res) => res.json())
      .then((data) => setUser(data));
  }, [params.id]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);

    const res = await fetch(`/api/admin/users/${params.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: formData.get("name"),
        nip: formData.get("nip"),
        email: formData.get("email"),
        password: formData.get("password") || undefined,
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

  if (!user) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="neu-pill-inset px-6 py-3 text-xs text-gray-400">
          Memuat data pengguna...
        </div>
      </div>
    );
  }

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
          <span className="text-gray-200 font-semibold">Edit Juri</span>
        </div>
      </nav>

      {/* Form Card */}
      <div className="w-full max-w-xl neu-panel p-6 sm:p-10 border border-white/5">
        <div className="mb-6 pb-4 border-b border-white/5">
          <h2 className="text-xl font-bold text-white tracking-wide">Edit Data Juri Penilai</h2>
          <p className="text-xs text-gray-400 mt-1">Perbarui profil atau kata sandi juri penilai.</p>
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
                defaultValue={user.name}
                className="w-full py-2.5 bg-transparent border-none focus:outline-none text-white text-sm placeholder-gray-500"
                placeholder="Masukkan nama"
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
                defaultValue={user.nip || ""}
                className="w-full py-2.5 bg-transparent border-none focus:outline-none text-white text-sm placeholder-gray-500"
                placeholder="Masukkan NIP"
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
                defaultValue={user.email}
                className="w-full py-2.5 bg-transparent border-none focus:outline-none text-white text-sm placeholder-gray-500"
                placeholder="Masukkan email"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
              Password Baru (Opsional)
            </label>
            <div className="neu-inset px-4 py-1">
              <input
                type="password"
                id="password"
                name="password"
                className="w-full py-2.5 bg-transparent border-none focus:outline-none text-white text-sm placeholder-gray-500"
                placeholder="Kosongkan jika tidak ingin mengubah"
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
              {loading ? "Menyimpan..." : "Simpan Perubahan Data Juri"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

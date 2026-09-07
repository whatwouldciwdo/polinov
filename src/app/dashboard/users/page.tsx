"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Toast from "@/components/Toast";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  nip?: string | null;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      if (Array.isArray(data)) setUsers(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm("Apakah Anda yakin ingin menghapus juri ini?")) return;

    const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
    if (res.ok) {
      setToast({ type: "success", message: "Akun juri berhasil dihapus." });
      fetchUsers();
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
          <span className="text-gray-200 font-semibold">Kelola Data Juri</span>
        </div>
      </nav>

      {/* Main Panel */}
      <div className="neu-panel p-6 sm:p-8 border border-white/5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-white/5">
          <div>
            <h1 className="text-xl font-bold text-white tracking-wide">Daftar Juri Penilai</h1>
            <p className="text-xs text-gray-400 mt-0.5">Kelola akun juri penilai dan hak akses sistem evaluasi inovasi.</p>
          </div>
          <Link href="/dashboard/users/create">
            <button className="neu-btn-primary px-5 py-2.5 text-xs font-semibold flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              <span>Tambah Juri Baru</span>
            </button>
          </Link>
        </div>

        {/* Users Table */}
        <div className="neu-inset p-3 rounded-2xl overflow-x-auto border border-white/5">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5">
                <th className="p-3 text-xs font-bold text-purple-400 uppercase tracking-wider text-center w-12">#</th>
                <th className="p-3 text-xs font-bold text-purple-400 uppercase tracking-wider">Nama Juri</th>
                <th className="p-3 text-xs font-bold text-purple-400 uppercase tracking-wider">Email</th>
                <th className="p-3 text-xs font-bold text-purple-400 uppercase tracking-wider text-center w-24">Role</th>
                <th className="p-3 text-xs font-bold text-purple-400 uppercase tracking-wider text-right w-36">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-sm text-gray-400">
                    Belum ada data juri penilai.
                  </td>
                </tr>
              ) : (
                users.map((user, index) => (
                  <tr key={user.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-3 text-center">
                      <span className="neu-icon-well w-7 h-7 mx-auto text-xs font-semibold text-gray-400">
                        {index + 1}
                      </span>
                    </td>
                    <td className="p-3 font-semibold text-white text-sm">
                      {user.name}
                      {user.nip && <span className="block text-xs font-normal text-gray-400">{user.nip}</span>}
                    </td>
                    <td className="p-3 text-sm text-gray-300">{user.email}</td>
                    <td className="p-3 text-center">
                      <span className="neu-pill-inset px-3 py-1 text-xs font-semibold text-purple-300 uppercase">
                        {user.role === "user" || user.role === "juri" ? "JURI" : user.role.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-3 text-right space-x-2">
                      <Link href={`/dashboard/users/edit/${user.id}`}>
                        <button className="neu-btn px-3 py-1 text-xs font-semibold text-blue-400 hover:text-white">
                          Edit
                        </button>
                      </Link>
                      <button
                        onClick={() => handleDelete(user.id)}
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

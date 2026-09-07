"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminSidebar() {
  const pathname = usePathname();

  const handleLogout = async () => {
    const { signOut } = await import("next-auth/react");
    signOut({ callbackUrl: "/login" });
  };

  const isUsersActive = pathname.startsWith("/dashboard/users");
  const isCandidatesActive = pathname.startsWith("/dashboard/candidates");
  const isAuditLogsActive = pathname.startsWith("/dashboard/audit-logs");

  return (
    <>
      {/* Sidebar for Desktop */}
      <aside className="hidden w-64 p-6 text-white bg-[#181920] border-r border-white/5 lg:flex lg:flex-col lg:justify-between min-h-screen">
        <div>
          {/* Brand Header */}
          <div className="mb-8 pb-6 border-b border-white/5 text-center">
            <div className="neu-pill p-2 mb-3 inline-block">
              <img src="/image/logo.png" alt="Logo" className="h-7 mx-auto object-contain" />
            </div>
            <h2 className="text-lg font-bold text-white tracking-wide">POLINOV ADMIN</h2>
            <span className="inline-block mt-1 px-2.5 py-0.5 text-[10px] font-semibold text-purple-400 neu-pill-inset uppercase tracking-widest">
              Control Center
            </span>
          </div>

          {/* Navigation Links */}
          <nav>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/dashboard/users"
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-medium ${
                    isUsersActive
                      ? "neu-inset text-purple-400 font-bold border-purple-500/20"
                      : "neu-btn text-gray-300 hover:text-white"
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                  </svg>
                  <span>Data Juri</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard/candidates"
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-medium ${
                    isCandidatesActive
                      ? "neu-inset text-purple-400 font-bold border-purple-500/20"
                      : "neu-btn text-gray-300 hover:text-white"
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                    <polyline points="10 9 9 9 8 9"></polyline>
                  </svg>
                  <span>Data Makalah</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard/audit-logs"
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-medium ${
                    isAuditLogsActive
                      ? "neu-inset text-purple-400 font-bold border-purple-500/20"
                      : "neu-btn text-gray-300 hover:text-white"
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
                    <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
                    <path d="M9 12h6"></path>
                    <path d="M9 16h6"></path>
                    <circle cx="12" cy="12" r="1" fill="currentColor"></circle>
                  </svg>
                  <span>Audit Log Juri</span>
                </Link>
              </li>
            </ul>
          </nav>
        </div>

        {/* Bottom Actions */}
        <div className="pt-6 border-t border-white/5 space-y-3">
          <Link
            href="/dashboard"
            className="neu-btn w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs text-gray-400 hover:text-white font-medium"
          >
            <span>&larr; User View</span>
          </Link>

          <button
            onClick={handleLogout}
            className="neu-btn w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs text-red-400 hover:text-red-300 font-semibold"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile Header with Toggle */}
      <div className="flex items-center justify-between w-full p-4 text-white bg-[#181920] border-b border-white/5 lg:hidden">
        <div className="flex items-center gap-2">
          <img src="/image/logo.png" alt="Logo" className="h-6 object-contain" />
          <h2 className="text-base font-bold text-white">POLINOV ADMIN</h2>
        </div>
        <button
          id="menuToggle"
          className="neu-btn w-10 h-10 flex items-center justify-center text-lg text-gray-300"
          onClick={() => {
            const sidebar = document.getElementById("mobileSidebar");
            sidebar?.classList.toggle("-translate-x-full");
          }}
        >
          &#9776;
        </button>
      </div>

      {/* Mobile Drawer Sidebar */}
      <aside
        id="mobileSidebar"
        className="fixed top-0 left-0 z-50 w-64 h-full p-6 text-white transition-transform duration-300 transform -translate-x-full bg-[#181920] border-r border-white/5 flex flex-col justify-between lg:hidden shadow-2xl"
      >
        <div>
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/5">
            <h2 className="text-lg font-bold">POLINOV ADMIN</h2>
            <button
              onClick={() => {
                const sidebar = document.getElementById("mobileSidebar");
                sidebar?.classList.add("-translate-x-full");
              }}
              className="neu-btn w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white"
            >
              &times;
            </button>
          </div>

          <nav>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/dashboard/users"
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm ${
                    isUsersActive ? "neu-inset text-purple-400 font-bold" : "neu-btn text-gray-300"
                  }`}
                  onClick={() => document.getElementById("mobileSidebar")?.classList.add("-translate-x-full")}
                >
                  <span>Data Juri</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard/candidates"
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm ${
                    isCandidatesActive ? "neu-inset text-purple-400 font-bold" : "neu-btn text-gray-300"
                  }`}
                  onClick={() => document.getElementById("mobileSidebar")?.classList.add("-translate-x-full")}
                >
                  <span>Data Makalah</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard/audit-logs"
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm ${
                    isAuditLogsActive ? "neu-inset text-purple-400 font-bold" : "neu-btn text-gray-300"
                  }`}
                  onClick={() => document.getElementById("mobileSidebar")?.classList.add("-translate-x-full")}
                >
                  <span>Audit Log Juri</span>
                </Link>
              </li>
            </ul>
          </nav>
        </div>

        <div className="pt-6 border-t border-white/5 space-y-3">
          <Link
            href="/dashboard"
            className="neu-btn w-full flex items-center justify-center px-4 py-2.5 text-xs text-gray-300"
          >
            User View
          </Link>
          <button
            onClick={handleLogout}
            className="neu-btn w-full flex items-center justify-center px-4 py-2.5 text-xs text-red-400 font-semibold"
          >
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}

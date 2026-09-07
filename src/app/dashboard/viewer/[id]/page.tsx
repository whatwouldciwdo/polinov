"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import DocumentViewer from "@/components/DocumentViewer";
import { formatFileUrl } from "@/lib/fileUrl";

interface Candidate {
  id: number;
  name: string;
  file: string | null;
  members?: any;
}

export default function DocumentViewerPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = params?.id as string;
  const backUrl = searchParams.get("from");

  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    fetch(`/api/candidates`)
      .then((res) => res.json())
      .then((data: Candidate[]) => {
        const found = data.find((c) => String(c.id) === String(id));
        if (found) {
          setCandidate(found);
        } else {
          setError("Dokumen makalah tidak ditemukan.");
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Gagal memuat dokumen.");
        setLoading(false);
      });
  }, [id]);

  const handleBack = () => {
    if (backUrl) {
      router.push(backUrl);
    } else {
      router.back();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1e2029] flex items-center justify-center p-4">
        <div className="neu-panel p-8 max-w-sm text-center border border-white/5 space-y-3">
          <div className="w-8 h-8 mx-auto border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs text-gray-300 font-mono">Membuka Web Viewer Dokumen...</p>
        </div>
      </div>
    );
  }

  if (error || !candidate || !candidate.file) {
    return (
      <div className="min-h-screen bg-[#1e2029] flex items-center justify-center p-4">
        <div className="neu-panel p-8 max-w-md text-center border border-white/5 space-y-4">
          <div className="w-12 h-12 mx-auto neu-icon-well text-red-400 text-xl font-bold flex items-center justify-center">
            !
          </div>
          <h2 className="text-base font-bold text-white">Dokumen Tidak Tersedia</h2>
          <p className="text-xs text-gray-400">
            {error || "Berkas makalah belum diunggah untuk karya inovasi ini."}
          </p>
          <button
            type="button"
            onClick={handleBack}
            className="neu-btn px-5 py-2 text-xs font-semibold text-gray-200 hover:text-white"
          >
            &larr; Kembali
          </button>
        </div>
      </div>
    );
  }

  const fileUrl = formatFileUrl(candidate.file);

  const isPdf = fileUrl.toLowerCase().endsWith(".pdf");

  return (
    <div className="min-h-screen bg-[#1e2029] text-gray-100 flex flex-col font-cabin">
      
      {/* Top Header Bar with Back Button */}
      <header className="neu-panel px-4 sm:px-8 py-3.5 border-b border-white/5 flex items-center justify-between gap-4 sticky top-0 z-30 shadow-lg">
        
        {/* Left: Back Button + Title */}
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <button
            type="button"
            onClick={handleBack}
            className="neu-btn px-3.5 py-2 text-xs font-bold text-purple-300 hover:text-white flex items-center gap-2 shrink-0 border border-purple-500/20"
            title="Kembali ke halaman sebelumnya"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            <span>Kembali</span>
          </button>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="neu-pill-inset px-2 py-0.5 text-[10px] font-semibold text-purple-400 font-mono uppercase">
                Web Viewer Makalah
              </span>
              <span className="text-gray-500 text-xs hidden sm:inline">&bull;</span>
              <span className="text-[11px] text-gray-400 font-mono hidden sm:inline">
                POLINOV 2026
              </span>
            </div>
            <h1 className="text-xs sm:text-sm font-bold text-white truncate max-w-md sm:max-w-xl md:max-w-2xl mt-0.5">
              {candidate.name}
            </h1>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2.5 shrink-0">
          <a
            href={fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="neu-btn px-3 py-1.5 text-xs text-gray-300 hover:text-white hidden sm:flex items-center gap-1.5"
            title="Buka file asli di tab baru"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
              <polyline points="15 3 21 3 21 9"></polyline>
              <line x1="10" y1="14" x2="21" y2="3"></line>
            </svg>
            <span>Tab Baru</span>
          </a>

          <a
            href={fileUrl}
            download
            className="neu-btn-primary px-3.5 py-1.5 text-xs font-semibold flex items-center gap-1.5"
            title="Unduh file dokumen"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            <span className="hidden sm:inline">Download</span>
          </a>
        </div>
      </header>

      {/* Main Document Display Area */}
      <main className="flex-1 p-2 sm:p-4 md:p-6 flex flex-col">
        <div className="neu-panel p-2 sm:p-3 flex-1 flex flex-col rounded-2xl border border-white/5 overflow-hidden shadow-2xl min-h-[82vh]">
          <DocumentViewer fileUrl={fileUrl} title={candidate.name} />
        </div>
      </main>

    </div>
  );
}

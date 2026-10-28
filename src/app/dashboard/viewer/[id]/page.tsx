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
  filePpt?: string | null;
  fileFeedback?: string | null;
  members?: any;
}

export default function DocumentViewerPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = params?.id as string;
  const backUrl = searchParams.get("from");
  const initialType = searchParams.get("type") as "makalah" | "ppt" | "feedback" | null;

  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [activeType, setActiveType] = useState<"makalah" | "ppt" | "feedback">(initialType || "makalah");
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
          // If requested initialType doesn't have a file, pick whichever file is available
          if (initialType === "ppt" && found.filePpt) {
            setActiveType("ppt");
          } else if (initialType === "feedback" && found.fileFeedback) {
            setActiveType("feedback");
          } else if (found.file) {
            setActiveType("makalah");
          } else if (found.filePpt) {
            setActiveType("ppt");
          } else if (found.fileFeedback) {
            setActiveType("feedback");
          }
        } else {
          setError("Data inovasi tidak ditemukan.");
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Gagal memuat dokumen.");
        setLoading(false);
      });
  }, [id, initialType]);

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

  // Determine current active file
  const currentFile =
    activeType === "makalah"
      ? candidate?.file
      : activeType === "ppt"
      ? candidate?.filePpt
      : candidate?.fileFeedback;

  if (error || !candidate || (!candidate.file && !candidate.filePpt && !candidate.fileFeedback)) {
    return (
      <div className="min-h-screen bg-[#1e2029] flex items-center justify-center p-4">
        <div className="neu-panel p-8 max-w-md text-center border border-white/5 space-y-4">
          <div className="w-12 h-12 mx-auto neu-icon-well text-red-400 text-xl font-bold flex items-center justify-center">
            !
          </div>
          <h2 className="text-base font-bold text-white">Dokumen Tidak Tersedia</h2>
          <p className="text-xs text-gray-400">
            {error || "Berkas belum diunggah untuk karya inovasi ini."}
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

  const activeFileUrl = currentFile ? formatFileUrl(currentFile) : null;

  return (
    <div className="min-h-screen bg-[#1e2029] text-gray-100 flex flex-col font-cabin">
      
      {/* Top Header Bar with Back Button */}
      <header className="neu-panel px-4 sm:px-8 py-3.5 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sticky top-0 z-30 shadow-lg">
        
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
                {activeType === "makalah"
                  ? "Web Viewer Makalah"
                  : activeType === "ppt"
                  ? "Web Viewer PowerPoint"
                  : "Web Viewer Feedback"}
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

        {/* Center: Tabs for Switching Makalah / PPT / Feedback */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {candidate.file && (
            <button
              type="button"
              onClick={() => setActiveType("makalah")}
              className={`neu-btn px-3.5 py-1.5 text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activeType === "makalah"
                  ? "text-purple-300 border border-purple-500/50 bg-purple-500/10 font-bold"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <span>Makalah</span>
            </button>
          )}

          {candidate.filePpt && (
            <button
              type="button"
              onClick={() => setActiveType("ppt")}
              className={`neu-btn px-3.5 py-1.5 text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activeType === "ppt"
                  ? "text-orange-300 border border-orange-500/50 bg-orange-500/10 font-bold"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <span>PowerPoint</span>
            </button>
          )}

          {candidate.fileFeedback && (
            <button
              type="button"
              onClick={() => setActiveType("feedback")}
              className={`neu-btn px-3.5 py-1.5 text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activeType === "feedback"
                  ? "text-emerald-300 border border-emerald-500/50 bg-emerald-500/10 font-bold"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <span>Feedback</span>
            </button>
          )}
        </div>

        {/* Right: Actions */}
        {activeFileUrl && (
          <div className="flex items-center gap-2.5 shrink-0">
            <a
              href={activeFileUrl}
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
              href={activeFileUrl}
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
        )}
      </header>

      {/* Main Document Display Area */}
      <main className="flex-1 p-2 sm:p-4 md:p-6 flex flex-col">
        <div className="neu-panel p-2 sm:p-3 flex-1 flex flex-col rounded-2xl border border-white/5 overflow-hidden shadow-2xl min-h-[82vh]">
          {activeFileUrl ? (
            <DocumentViewer
              key={`${activeType}-${candidate.id}`}
              fileUrl={activeFileUrl}
              title={`${activeType.toUpperCase()} - ${candidate.name}`}
            />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-3">
              <p className="text-sm text-gray-400">
                Berkas {activeType} belum diunggah untuk karya ini.
              </p>
            </div>
          )}
        </div>
      </main>

    </div>
  );
}

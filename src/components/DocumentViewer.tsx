"use client";

import { useEffect, useRef, useState } from "react";

interface Props {
  fileUrl: string;
  title: string;
}

export default function DocumentViewer({ fileUrl, title }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const isPdf = fileUrl.toLowerCase().endsWith(".pdf");
  const isDocx = fileUrl.toLowerCase().endsWith(".docx") || fileUrl.toLowerCase().endsWith(".doc");

  useEffect(() => {
    if (!isDocx) {
      setLoading(false);
      return;
    }

    let isMounted = true;
    setLoading(true);
    setError("");

    async function loadDocx() {
      try {
        const res = await fetch(fileUrl);
        if (!res.ok) throw new Error("Gagal mengunduh file dokumen dari server.");
        const blob = await res.blob();

        if (!isMounted || !containerRef.current) return;

        // Clear previous content
        containerRef.current.innerHTML = "";

        const { renderAsync } = await import("docx-preview");
        await renderAsync(blob, containerRef.current, undefined, {
          className: "docx",
          inWrapper: true,
          ignoreWidth: false,
          ignoreHeight: false,
          breakPages: true,
        });

        if (isMounted) {
          setLoading(false);
        }
      } catch (err: any) {
        console.error("Error rendering docx:", err);
        if (isMounted) {
          setError(err.message || "Gagal memproses dokumen Word (.docx)");
          setLoading(false);
        }
      }
    }

    loadDocx();

    return () => {
      isMounted = false;
    };
  }, [fileUrl, isDocx]);

  if (isPdf) {
    return (
      <iframe
        src={`${fileUrl}#toolbar=1&navpanes=1&scrollbar=1`}
        title={title}
        className="w-full h-full flex-1 rounded-2xl bg-[#2a2c38] border border-white/10"
        style={{ minHeight: "calc(100vh - 160px)" }}
      />
    );
  }

  if (isDocx) {
    return (
      <div className="w-full h-full flex-1 flex flex-col overflow-hidden relative">
        {loading && (
          <div className="absolute inset-0 bg-[#1e2029]/90 flex flex-col items-center justify-center z-10 space-y-3">
            <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs text-purple-300 font-mono">Memuat dan merender isi dokumen Word...</p>
          </div>
        )}

        {error ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
            <div className="w-12 h-12 neu-icon-well text-amber-400 text-lg font-bold flex items-center justify-center">
              !
            </div>
            <h4 className="text-sm font-bold text-white">Pratinjau Word Gagal Dimuat</h4>
            <p className="text-xs text-gray-400 max-w-sm">{error}</p>
            <a
              href={fileUrl}
              download
              className="neu-btn-primary px-5 py-2 text-xs font-bold"
            >
              Unduh File Dokumen
            </a>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#181920] rounded-2xl border border-white/10 custom-scrollbar">
            <div
              ref={containerRef}
              className="docx-render-container mx-auto bg-white text-gray-900 shadow-2xl rounded-lg p-6 sm:p-12 min-h-full max-w-4xl prose prose-sm"
              style={{
                fontFamily: "Calibri, Arial, sans-serif",
              }}
            ></div>
          </div>
        )}
      </div>
    );
  }

  // Fallback for other file types
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
      <div className="w-16 h-16 neu-panel rounded-2xl flex items-center justify-center text-purple-400">
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
        </svg>
      </div>
      <h3 className="text-base font-bold text-white">File Dokumen Tersedia</h3>
      <p className="text-xs text-gray-400 max-w-md">
        Format berkas ini dapat diakses atau diunduh langsung untuk dibaca.
      </p>
      <div className="flex items-center gap-3">
        <a
          href={fileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="neu-btn px-4 py-2 text-xs font-semibold text-purple-300 hover:text-white"
        >
          Buka di Tab Baru
        </a>
        <a
          href={fileUrl}
          download
          className="neu-btn-primary px-5 py-2 text-xs font-semibold text-white"
        >
          Download File
        </a>
      </div>
    </div>
  );
}

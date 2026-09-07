"use client";

import { useEffect, useRef, useState } from "react";
import { formatFileUrl } from "@/lib/fileUrl";

interface Props {
  fileUrl: string;
  title: string;
}

export default function DocumentViewer({ fileUrl, title }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const normalizedUrl = formatFileUrl(fileUrl);
  const cleanPath = normalizedUrl.toLowerCase().split("?")[0];
  const isPdf = cleanPath.endsWith(".pdf");
  const isDocx = cleanPath.endsWith(".docx") || cleanPath.endsWith(".doc");

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError("");

    async function initViewer() {
      try {
        if (isDocx) {
          const res = await fetch(normalizedUrl);
          if (!res.ok) {
            const fileName = normalizedUrl.split("/").pop() || "dokumen";
            if (res.status === 404) {
              throw new Error(
                `Berkas Word "${decodeURIComponent(fileName)}" tidak ditemukan di server (404). Pastikan file sudah tersimpan di storage uploads server.`
              );
            }
            throw new Error(`Gagal mengunduh dokumen dari server (HTTP ${res.status}).`);
          }
          const blob = await res.blob();

          if (!isMounted || !containerRef.current) return;
          containerRef.current.innerHTML = "";

          const { renderAsync } = await import("docx-preview");
          await renderAsync(blob, containerRef.current, undefined, {
            className: "docx",
            inWrapper: true,
            ignoreWidth: false,
            ignoreHeight: false,
            breakPages: true,
          });
        } else if (isPdf) {
          // Pre-check if PDF exists to avoid Next.js 404 page rendering inside iframe
          let checkOk = false;
          try {
            const headRes = await fetch(normalizedUrl, { method: "HEAD" });
            checkOk = headRes.ok;
          } catch {
            checkOk = false;
          }

          if (!checkOk) {
            const getRes = await fetch(normalizedUrl);
            if (!getRes.ok) {
              const fileName = normalizedUrl.split("/").pop() || "dokumen.pdf";
              throw new Error(
                `Berkas PDF "${decodeURIComponent(fileName)}" tidak ditemukan di server (404). Pastikan file sudah tersimpan di storage uploads server.`
              );
            }
          }
        }

        if (isMounted) {
          setLoading(false);
        }
      } catch (err: any) {
        console.error("Error rendering document:", err);
        if (isMounted) {
          setError(err.message || "Gagal memproses dokumen");
          setLoading(false);
        }
      }
    }

    initViewer();

    return () => {
      isMounted = false;
    };
  }, [normalizedUrl, isDocx, isPdf]);

  if (loading) {
    return (
      <div className="w-full h-full flex-1 flex flex-col items-center justify-center min-h-[300px] p-6 text-center space-y-3">
        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-purple-300 font-mono">Memuat dan memeriksa berkas dokumen...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
        <div className="w-12 h-12 neu-icon-well text-amber-400 text-lg font-bold flex items-center justify-center">
          !
        </div>
        <h4 className="text-sm font-bold text-white">Pratinjau Dokumen Gagal Dimuat</h4>
        <p className="text-xs text-gray-400 max-w-md leading-relaxed">{error}</p>
        <div className="flex items-center gap-3 pt-2">
          <a
            href={normalizedUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="neu-btn px-4 py-2 text-xs font-semibold text-purple-300 hover:text-white"
          >
            Coba Buka Langsung
          </a>
          <a
            href={normalizedUrl}
            download
            className="neu-btn-primary px-5 py-2 text-xs font-bold text-white"
          >
            Unduh Berkas
          </a>
        </div>
      </div>
    );
  }

  if (isPdf) {
    return (
      <iframe
        src={`${normalizedUrl}#toolbar=1&navpanes=1&scrollbar=1`}
        title={title}
        className="w-full h-full flex-1 rounded-2xl bg-[#2a2c38] border border-white/10"
        style={{ minHeight: "calc(100vh - 160px)" }}
      />
    );
  }

  if (isDocx) {
    return (
      <div className="w-full h-full flex-1 flex flex-col overflow-hidden relative">
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#181920] rounded-2xl border border-white/10 custom-scrollbar">
          <div
            ref={containerRef}
            className="docx-render-container mx-auto bg-white text-gray-900 shadow-2xl rounded-lg p-6 sm:p-12 min-h-full max-w-4xl prose prose-sm"
            style={{
              fontFamily: "Calibri, Arial, sans-serif",
            }}
          ></div>
        </div>
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
          href={normalizedUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="neu-btn px-4 py-2 text-xs font-semibold text-purple-300 hover:text-white"
        >
          Buka di Tab Baru
        </a>
        <a
          href={normalizedUrl}
          download
          className="neu-btn-primary px-5 py-2 text-xs font-semibold text-white"
        >
          Download File
        </a>
      </div>
    </div>
  );
}

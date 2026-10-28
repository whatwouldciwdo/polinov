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
  const isPpt = cleanPath.endsWith(".ppt") || cleanPath.endsWith(".pptx");

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError("");

    if (!normalizedUrl) {
      setError("Tautan berkas tidak valid atau belum tersedia.");
      setLoading(false);
      return;
    }

    // Set a safety timeout of 12 seconds so loading NEVER hangs indefinitely
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, 12000);

    async function initViewer() {
      try {
        if (isDocx) {
          const res = await fetch(normalizedUrl, { signal: controller.signal });
          clearTimeout(timeoutId);

          if (!res.ok) {
            const fileName = normalizedUrl.split("/").pop() || "dokumen";
            if (res.status === 404) {
              throw new Error(
                `Berkas Word "${decodeURIComponent(fileName)}" tidak ditemukan di server (404). Pastikan berkas sudah terunggah.`
              );
            }
            throw new Error(`Gagal mengunduh dokumen dari server (HTTP ${res.status}).`);
          }

          const blob = await res.blob();
          if (!isMounted) return;

          // Render into container
          if (containerRef.current) {
            containerRef.current.innerHTML = "";
            const { renderAsync } = await import("docx-preview");
            await renderAsync(blob, containerRef.current, undefined, {
              className: "docx",
              inWrapper: true,
              ignoreWidth: false,
              ignoreHeight: false,
              breakPages: true,
            });
          }
        } else if (isPdf) {
          clearTimeout(timeoutId);
          // For PDF, iframe renders immediately via browser native viewer.
          // We don't block on full JS fetch; iframe handles streaming.
        } else if (isPpt) {
          clearTimeout(timeoutId);
        }

        if (isMounted) {
          setLoading(false);
        }
      } catch (err: any) {
        clearTimeout(timeoutId);
        console.error("Error loading document:", err);
        if (isMounted) {
          if (err.name === "AbortError") {
            setError("Waktu memuat dokumen melebihi batas (timeout). Silakan gunakan tombol Buka Langsung atau Unduh Berkas.");
          } else {
            setError(err.message || "Gagal memproses dokumen.");
          }
          setLoading(false);
        }
      }
    }

    initViewer();

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [normalizedUrl, isDocx, isPdf, isPpt]);

  // Error State
  if (error) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
        <div className="w-12 h-12 neu-icon-well text-amber-400 text-lg font-bold flex items-center justify-center">
          !
        </div>
        <h4 className="text-sm font-bold text-white">Pratinjau Dokumen Tidak Dapat Ditampilkan</h4>
        <p className="text-xs text-gray-400 max-w-md leading-relaxed">{error}</p>
        <div className="flex items-center gap-3 pt-2">
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
            className="neu-btn-primary px-5 py-2 text-xs font-bold text-white"
          >
            Unduh Berkas
          </a>
        </div>
      </div>
    );
  }

  // PDF Viewer
  if (isPdf) {
    return (
      <div className="w-full h-full flex-1 flex flex-col relative">
        {loading && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#1e2029] space-y-3">
            <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs text-purple-300 font-mono">Memuat berkas PDF...</p>
          </div>
        )}
        <iframe
          src={`${normalizedUrl}#toolbar=1&navpanes=1&scrollbar=1`}
          title={title}
          onLoad={() => setLoading(false)}
          className="w-full h-full flex-1 rounded-2xl bg-[#2a2c38] border border-white/10"
          style={{ minHeight: "calc(100vh - 160px)" }}
        />
      </div>
    );
  }

  // Word DOCX Viewer
  if (isDocx) {
    return (
      <div className="w-full h-full flex-1 flex flex-col overflow-hidden relative">
        {loading && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#181920]/95 backdrop-blur-sm space-y-3">
            <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs text-purple-300 font-mono">Memuat dan merender berkas Word (.docx)...</p>
          </div>
        )}
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

  // PowerPoint PPT / PPTX Viewer
  if (isPpt) {
    const absoluteUrl =
      typeof window !== "undefined"
        ? `${window.location.origin}${normalizedUrl.startsWith("/") ? "" : "/"}${normalizedUrl}`
        : normalizedUrl;
    const googleViewerUrl = `https://docs.google.com/gview?url=${encodeURIComponent(absoluteUrl)}&embedded=true`;

    return (
      <div className="w-full h-full flex-1 flex flex-col relative">
        {loading && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#1e2029] space-y-3">
            <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs text-purple-300 font-mono">Menyiapkan pratinjau presentasi PowerPoint...</p>
          </div>
        )}
        <iframe
          src={googleViewerUrl}
          title={title}
          onLoad={() => setLoading(false)}
          className="w-full h-full flex-1 rounded-2xl bg-[#2a2c38] border border-white/10"
          style={{ minHeight: "calc(100vh - 160px)" }}
          allow="fullscreen"
        />
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
      <h3 className="text-base font-bold text-white">Berkas Dokumen Tersedia</h3>
      <p className="text-xs text-gray-400 max-w-md">
        Format berkas ini dapat dibuka langsung di tab baru atau diunduh ke komputer Anda.
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

import type { Metadata } from "next";
import Providers from "@/components/Providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "POLINOV - Penilaian Inovasi UBP CLG",
  description: "Web Penilaian Inovasi UBP Cilegon Tahun 2026",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Bitter:ital,wght@0,100..900;1,100..900&family=Buenard:wght@400;700&family=Cabin:ital,wght@0,400..700;1,400..700&family=Space+Mono:ital,wght@0,400;0,700;1,400;1,700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-[#1e2029] text-gray-100 antialiased selection:bg-purple-600 selection:text-white">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

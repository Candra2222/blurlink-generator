import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BlurLink Generator",
  description:
    "Unggah satu gambar, dapatkan tautan blur teaser atau original siap dibagikan.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-gray-950 text-gray-100">
        <div
          aria-hidden
          className="pointer-events-none fixed inset-x-0 top-0 -z-10 h-80 bg-[radial-gradient(60%_100%_at_50%_0%,rgba(59,130,246,0.18),transparent)]"
        />
        <header className="sticky top-0 z-20 border-b border-white/5 bg-gray-950/70 backdrop-blur">
          <div className="mx-auto flex w-full max-w-4xl items-center justify-between px-4 py-3 sm:px-6">
            <Link href="/" className="group flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 shadow-lg shadow-blue-500/20">
                <svg
                  viewBox="0 0 24 24"
                  className="h-4.5 w-4.5 text-white"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"
                    strokeLinejoin="round"
                  />
                  <circle cx="12" cy="12" r="3" fill="currentColor" stroke="none" />
                </svg>
              </span>
              <span className="text-lg font-bold tracking-tight text-white">
                BlurLink
                <span className="text-blue-400">.</span>
              </span>
            </Link>
            <nav className="flex items-center gap-1 text-sm text-gray-400">
              <Link
                href="/"
                className="rounded-lg px-3 py-1.5 transition-colors hover:bg-white/5 hover:text-white"
              >
                Beranda
              </Link>
              <Link
                href="/history"
                className="rounded-lg px-3 py-1.5 transition-colors hover:bg-white/5 hover:text-white"
              >
                Riwayat
              </Link>
            </nav>
          </div>
        </header>
        <main className="flex flex-1 flex-col">{children}</main>
      </body>
    </html>
  );
}

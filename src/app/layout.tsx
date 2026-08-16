import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import NavLinks from "@/components/NavLinks";
import "./globals.css";

const LOGO_URL =
  "https://gjckialvldozgcfewmyf.supabase.co/storage/v1/object/public/LOGO/logo.png";

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
  icons: { icon: LOGO_URL },
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
        {/* Animated background */}
        <div aria-hidden className="pointer-events-none fixed inset-0 -z-20">
          <div className="absolute inset-0 bg-[radial-gradient(60%_100%_at_50%_0%,rgba(59,130,246,0.16),transparent)]" />
          <div className="animate-blob absolute -top-24 -left-24 h-80 w-80 rounded-full bg-blue-600/25 blur-3xl" />
          <div
            className="animate-blob absolute top-1/3 -right-32 h-96 w-96 rounded-full bg-violet-600/20 blur-3xl anim-delay-2"
            style={{ animationDuration: "20s" }}
          />
          <div
            className="animate-blob absolute -bottom-32 left-1/4 h-80 w-80 rounded-full bg-cyan-500/15 blur-3xl anim-delay-4"
            style={{ animationDuration: "24s" }}
          />
        </div>

        <header className="sticky top-0 z-20 border-b border-white/5 bg-gray-950/70 backdrop-blur">
          <div className="mx-auto flex w-full max-w-4xl items-center justify-between px-4 py-3 sm:px-6">
            <Link href="/" className="group flex items-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={LOGO_URL}
                alt="BlurLink"
                className="h-10 w-auto transition-transform group-hover:scale-105"
              />
            </Link>
            <NavLinks />
          </div>
        </header>

        <main className="flex flex-1 flex-col">{children}</main>

        <footer className="border-t border-white/5 py-6">
          <p className="animate-fade-in flex items-center justify-center gap-2 text-sm text-gray-500">
            <svg
              viewBox="0 0 24 24"
              className="h-4 w-4 text-violet-400"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
            Powered by{" "}
            <span className="animate-gradient-x bg-gradient-to-r from-blue-400 via-violet-400 to-blue-400 bg-clip-text font-semibold text-transparent">
              Sesepuh
            </span>
          </p>
        </footer>
      </body>
    </html>
  );
}

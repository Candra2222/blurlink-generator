"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { ChangeEvent, DragEvent } from "react";

type Mode = "blur" | "original" | "live";

const ACCEPT = "image/jpeg,image/png,image/webp";
const MAX_SIZE = 5 * 1024 * 1024;

export default function Home() {
  const [mode, setMode] = useState<Mode>("blur");
  const [blur, setBlur] = useState(40);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  function setFileIfValid(f: File | null) {
    setError(null);
    if (!f) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(f.type)) {
      setError("Format harus JPG, PNG, atau WebP.");
      setFile(null);
      setPreview(null);
      return;
    }
    if (f.size > MAX_SIZE) {
      setError("Ukuran maksimal 5MB.");
      setFile(null);
      setPreview(null);
      return;
    }
    setFile(f);
    setPreview(URL.createObjectURL(f));
  }

  function onDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragging(false);
    setFileIfValid(e.dataTransfer.files?.[0] ?? null);
  }

  async function handleSubmit() {
    if (!file) {
      setError("Pilih file gambar terlebih dahulu.");
      return;
    }
    setUploading(true);
    setError(null);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("mode", mode);
    fd.append("blur", String(blur));
    try {
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      if (!res.ok) {
        let message = "Upload gagal.";
        try {
          const body = await res.json();
          message = body?.error ?? message;
        } catch {
          message = `Upload gagal (${res.status}). Silakan coba lagi.`;
        }
        throw new Error(message);
      }
      const data = await res.json();
      router.push(`/success?mode=${data.mode}&slug=${data.slug}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload gagal.");
      setUploading(false);
    }
  }

  function handleFileInput(e: ChangeEvent<HTMLInputElement>) {
    setFileIfValid(e.target.files?.[0] ?? null);
  }

  const modes: {
    value: Mode;
    title: string;
    desc: string;
    icon: React.ReactNode;
  }[] = [
    {
      value: "blur",
      title: "Blur",
      desc: "Teaser buram + show now",
      icon: (
        <svg
          viewBox="0 0 24 24"
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
        >
          <path
            d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"
            strokeLinejoin="round"
          />
          <circle cx="12" cy="12" r="3" fill="currentColor" stroke="none" />
        </svg>
      ),
    },
    {
      value: "original",
      title: "Original",
      desc: "Asli, tanpa proses",
      icon: (
        <svg
          viewBox="0 0 24 24"
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
        >
          <rect
            x="3.5"
            y="4.5"
            width="17"
            height="15"
            rx="2.5"
            strokeLinejoin="round"
          />
          <path d="M3.5 9h17" strokeLinecap="round" />
          <circle cx="8" cy="12.5" r="0.8" fill="currentColor" stroke="none" />
          <circle cx="10.5" cy="12.5" r="0.8" fill="currentColor" stroke="none" />
        </svg>
      ),
    },
    {
      value: "live",
      title: "Live Stream",
      desc: "Teaser buram + kolom live",
      icon: (
        <svg
          viewBox="0 0 24 24"
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
        >
          <rect
            x="3.5"
            y="6"
            width="17"
            height="12"
            rx="3"
            strokeLinejoin="round"
          />
          <circle cx="12" cy="12" r="2" fill="currentColor" stroke="none" />
          <path d="M16.5 8.5a5 5 0 010 7M7.5 8.5a5 5 0 000 7" strokeLinecap="round" />
        </svg>
      ),
    },
  ];

  return (
    <div className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center gap-7 px-4 py-12">
      <div className="text-center">
        <h1 className="animate-fade-up text-3xl font-bold tracking-tight text-white sm:text-4xl">
          BlurLink{" "}
          <span className="animate-shimmer-text bg-gradient-to-r from-blue-400 via-violet-400 to-blue-400 bg-clip-text text-transparent">
            Generator
          </span>
        </h1>
        <p className="animate-fade-up anim-delay-1 mx-auto mt-3 max-w-md text-sm leading-relaxed text-gray-400">
          Unggah satu gambar, pilih hasil akhir, dan bagikan tautan hanya dengan
          sekali klik.
        </p>
      </div>

      <div className="animate-fade-up anim-delay-2 grid grid-cols-2 gap-2 rounded-2xl border border-white/10 bg-white/5 p-1.5 sm:grid-cols-3">
        {modes.map((m) => {
          const active = mode === m.value;
          return (
            <button
              key={m.value}
              type="button"
              onClick={() => setMode(m.value)}
              aria-pressed={active}
              className={`shine-card flex flex-col items-start gap-1 rounded-xl px-4 py-3 text-left transition-all duration-300 ${
                m.value === "live" ? "col-span-2 sm:col-span-1" : ""
              } ${
                active
                  ? "bg-gradient-to-br from-blue-600 to-violet-600 shadow-lg shadow-blue-600/40 ring-1 ring-blue-400/40"
                  : "bg-transparent hover:-translate-y-0.5 hover:bg-white/5 hover:shadow-lg hover:shadow-violet-500/10"
              }`}
            >
              <span
                className={`flex items-center gap-2 text-sm font-semibold ${
                  active ? "text-white" : "text-gray-300"
                }`}
              >
                {m.icon}
                {m.title}
              </span>
              <span
                className={`text-xs ${
                  active ? "text-blue-100" : "text-gray-500"
                }`}
              >
                {m.desc}
              </span>
            </button>
          );
        })}
      </div>

      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={`animate-fade-up anim-delay-3 group flex h-60 cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed p-6 text-center transition-all duration-300 sm:h-64 ${
          dragging
            ? "border-blue-400 bg-blue-500/10 shadow-lg shadow-blue-500/20"
            : "border-white/15 bg-white/5 hover:border-blue-400/50 hover:bg-white/[0.07] hover:shadow-lg hover:shadow-blue-500/10"
        }`}
      >
        {preview ? (
          <div className="relative flex h-full w-full items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={preview}
              alt="Pratinjau"
              className="animate-zoom-in max-h-44 max-w-full rounded-xl object-contain shadow-2xl"
            />
            <span className="absolute bottom-0 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-3 py-1 text-xs text-gray-200 backdrop-blur">
              Klik untuk ganti gambar
            </span>
          </div>
        ) : (
          <>
            <span className="animate-float flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 text-gray-400 transition-colors group-hover:text-blue-300">
              <svg
                className="h-7 w-7"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                />
              </svg>
            </span>
            <p className="text-sm font-medium text-gray-300">
              Tarik &amp; letakkan gambar di sini
            </p>
            <p className="text-xs text-gray-500">
              atau klik untuk memilih file — JPG / PNG / WebP, maks 5MB
            </p>
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          className="hidden"
          onChange={handleFileInput}
        />
      </div>

      {mode === "blur" && (
        <div className="animate-fade-up anim-delay-4 flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
          <label className="flex items-center justify-between text-sm text-gray-300">
            <span>Kekuatan Blur</span>
            <span className="rounded-md bg-white/10 px-2 py-0.5 font-mono text-xs font-semibold text-blue-300">
              {blur}%
            </span>
          </label>
          <input
            type="range"
            min={0}
            max={100}
            value={blur}
            onChange={(e) => setBlur(Number(e.target.value))}
            className="slider w-full"
          />
          <div className="flex justify-between text-[11px] text-gray-500">
            <span>Jelas</span>
            <span>Buram</span>
          </div>
        </div>
      )}

      {error && (
        <p className="animate-fade-in rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={uploading}
        className="shine-card animate-fade-up anim-delay-5 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition-all duration-300 hover:-translate-y-0.5 hover:from-blue-500 hover:to-violet-500 hover:shadow-blue-500/40 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
      >
        {uploading ? (
          <>
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            Memproses gambar...
          </>
        ) : (
          "Buat Tautan"
        )}
      </button>
    </div>
  );
}

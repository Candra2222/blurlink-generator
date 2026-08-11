# BlurLink Generator

Aplikasi web untuk membuat link gambar *teaser* (buram) atau original dari satu unggahan. Dibangun dengan **Next.js (App Router)**, **TypeScript**, **Tailwind CSS**, **sharp** untuk pemrosesan gambar, dan **Supabase** untuk database + storage.

## Fitur

- Pilih hasil akhir di awal: **Blur** (buram + overlay 👁️ "show now") atau **Original** (tanpa proses).
- Hasil gambar blur di-*resize* ke **1200×630 px (rasio 16:9)** dengan teknik *cover crop*.
- Slider kekuatan blur yang bisa disesuaikan (0–100%).
- Drag-and-drop unggah (JPG / PNG / WebP, maks 5MB).
- Satu tautan hasil dengan tombol "Salin Tautan".
- Halaman viewer `/t/[slug]` (blur) dan `/o/[slug]` (original).
- Riwayat link dengan fitur **hapus** (menghapus data + file).

## Setup Supabase

1. Buat proyek baru di [supabase.com](https://supabase.com).
2. Buka **Dashboard → SQL Editor → New query**, salin seluruh isi `supabase/schema.sql`, lalu jalankan (membuat tabel `image_links`, RLS, dan bucket `originals` + `blur`).
3. Salin `.env.local.example` menjadi `.env.local` dan isi:
   - `NEXT_PUBLIC_SUPABASE_URL` — Project URL (Dashboard → Settings → API).
   - `SUPABASE_SERVICE_ROLE_KEY` — service_role key (digunakan server-side).

## Menjalankan

```bash
npm install
npm run dev
```

Buka `http://localhost:3000`.

## Build produksi

```bash
npm run build
npm run start
```

## Struktur data

- Tabel: `image_links` (PostgreSQL) — kolom mengikuti desain PRD.
- Storage: bucket `blur` dan `originals` (publik). Kolom `teaser_storage_path` / `original_storage_path` menyimpan URL publik lengkap.

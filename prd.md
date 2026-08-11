markdown_content = """# Product Requirements Document (PRD)

## **Nama Produk:** BlurLink Generator (Nama Tentatif)
## **Versi:** 1.2 (MVP - Tech Stack Defined)
## **Tanggal:** 11 Agustus 2026
## **Status:** Draft

---

## 1. Pendahuluan & Latar Belakang

### 1.1 Masalah (Problem)
Banyak pengguna media sosial, *content creator*, atau pemasar ingin membagikan konten gambar secara "menggoda" (*teaser* atau *sneak-peek*) untuk membangun rasa penasaran. Namun, mereka juga membutuhkan cara instan untuk membagikan gambar aslinya (misalnya, di grup berbayar, Patreon, atau tautan bio). Memproses gambar *teaser* dan membuat tautan (*hosting*) untuk kedua versi (buram dan asli) memakan waktu dan membutuhkan banyak aplikasi.

### 1.2 Solusi (Solution)
Membangun sebuah aplikasi web yang memungkinkan pengguna mengunggah satu gambar. Aplikasi akan secara otomatis:
1. Memproses gambar menjadi versi *teaser* (blur 40% + emoji mata + teks "show now").
2. Menyimpan versi asli gambar tanpa perubahan.
3. Menghasilkan **dua tautan (URL) terpisah**: satu untuk gambar *teaser* (buram) dan satu lagi untuk gambar asli (jelas).

### 1.3 Tujuan Produk (Goals)
* Menyediakan alat bantu *teaser* konten yang instan dan mudah digunakan.
* Memberikan fleksibilitas kepada *creator* untuk membagikan tautan *teaser* ke publik dan tautan asli ke audiens eksklusif.
* Menghilangkan kebutuhan *hosting* gambar pihak ketiga yang rumit.

---

## 2. Cakupan Produk (Product Scope) - MVP

### **Fitur Utama (Di dalam Cakupan):**
1. Halaman unggah gambar (*upload*) dengan antarmuka yang bersih.
2. Pemrosesan gambar otomatis (versi blur):
   * Efek Blur bisa di atur manual.
   * *Overlay* Emoji Mata Kecil (👁️).
   * *Overlay* Teks "show now".
3. Penyimpanan gambar asli.
4. Buat dengan fitur pilihan:
   * Link Blur.
   * Link Original.
5. Halaman hasil dengan pratinjau tombol "Salin Tautan" (*Copy Link*).
6. Halaman *viewer* untuk melihat gambar (baik versi *blur* maupun *original*).

---

## 3. Spesifikasi Fungsional (User Flows)

### 3.1 Flow 1: Pengunggahan dan Pemrosesan (Creator Flow)
1. **Akses Halaman Utama:** Pengguna membuka aplikasi (misal: `blurlink.io`).
2. **Unggah Gambar:** Pengguna mengunggah gambar via *drag-and-drop* atau tombol (Format JPG/PNG/WebP, maks. 5MB).
3. **Pemrosesan (Sisi Server):** 
   * Gambar diunggah ke *endpoint* API.
   * Gambar asli disimpan ke *Storage Bucket* "Originals".
   * Gambar diproses menggunakan *library* pengolah gambar untuk posisi center(diberi blur, emoji, teks).
   * Gambar hasil proses disimpan ke *Storage Bucket* "blur".
   * Data relasi URL disimpan ke *Database*.

### 3.2 Flow 2: Menampilkan Gambar (Viewer Flow)
* **Viewer Link Teaser:** Viewer membuka `domain.com/t/[teaser_id]`. Halaman menampilkan gambar yang diburamkan.
* **Viewer Link Original:** Viewer membuka `domain.com/o/[original_id]`. Halaman menampilkan gambar asli dengan resolusi penuh.

* Ini di tentukan tergantung di awal user pilih fitur yang blur atau original

---

## 4. Persyaratan Teknis (Technical Requirements) & Tech Stack

Aplikasi ini akan dibangun menggunakan *stack* modern untuk performa tinggi dan skalabilitas.

### 4.1 Tech Stack Pilihan
* **Frontend:** Next.js (App Router), React, Tailwind CSS (untuk styling UI yang cepat dan responsif).
* **Backend:** Next.js API Routes / Server Actions (BFF - Backend for Frontend).
* **Database:** Supabase (PostgreSQL).
* **Penyimpanan (*Storage*):** Supabase Storage.
* **Pemrosesan Gambar:** `sharp` (Library Node.js yang sangat cepat untuk memproses gambar, sangat cocok dikombinasikan dengan Next.js).

### 4.2 Desain Database (Supabase)
Tabel: `image_links`
* `id` (UUID, Primary Key)
* `teaser_slug` (String, Unique, misal: '7x9bq2') -> Digunakan untuk URL `/t/...`
* `original_slug` (String, Unique, misal: 'm9v2pkw') -> Digunakan untuk URL `/o/...`
* `teaser_storage_path` (String) -> Path file di Supabase Storage
* `original_storage_path` (String) -> Path file di Supabase Storage
* `created_at` (Timestamp)

### 4.3 Supabase Storage Buckets
* Bucket `originals`: Untuk menyimpan file gambar asli. (Akses publik).
* Bucket `blur`: Untuk menyimpan file gambar hasil blur. ( Akses publik).

### 4.4 Keamanan URL (Crucial)
* `blur_slug` dan `original_slug` **harus** di-*generate* secara acak (kriptografis) dan independen. Tidak boleh berurutan atau memiliki pola yang sama agar pengunjung link blur tidak bisa menebak link original.

---

## 5. UI/UX Considerations (Tailwind CSS)

### 5.1 Desain Visual
* **Tema:** Minimalis, *Dark Mode* *by default* (bg-gray-900) agar gambar lebih *stand out*, teks warna terang (text-gray-100).
* **Komponen:** Gunakan *utility classes* Tailwind untuk membuat *Card*, *Button* dengan efek *hover*, dan transisi yang mulus.

### 5.2 Halaman Upload (`/`)
* Kotak unggah *dashed border* di tengah layar.
* *State* "Uploading" dengan *spinner* animasi saat pemrosesan terjadi.

### 5.3 Halaman Hasil (`/success`)
* Hierarki visual yang jelas:
  * Tombol **"Copy Link"**: Menonjol (misal: `bg-blue-600 hover:bg-blue-700 text-white`).

### 5.4 Halaman Viewer (`/t/[id]` dan `/o/[id]`)
* Hanya menampilkan gambar di tengah layar dengan latar belakang gelap (`min-h-screen bg-black flex items-center justify-center`).

---

## 6. Metrik Keberhasilan (Success Metrics - KPI)

1. **Total Unggahan:** Jumlah entri di *database* Supabase.
2. **Kinerja Waktu:** Proses unggah -> proses via `sharp` -> simpan ke Supabase Storage -> *return* URL selesai dalam < 3-5 detik.
3. **Uptime:** Aplikasi stabil berjalan di *platform hosting* (misal: Vercel).

---
"""
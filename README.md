# Cakrawala International School — Website Statis

Website institusi pendidikan internasional multi-halaman, 100% statis: **HTML5 + Tailwind CSS CDN (v4 browser) + Vanilla JS ES Modules + JSON + Lucide/Swiper/GLightbox CDN**. Tanpa framework, tanpa backend, tanpa build. Siap untuk GitHub Pages.

> Identitas, konten, dan gambar SVG adalah orisinal/placeholder. Ganti dengan aset berlisensi milik Anda melalui CMS sebelum publikasi. Angka biaya, statistik, dan penerimaan universitas adalah **data ilustrasi**.

## 1. Menjalankan secara lokal
Karena memakai ES Modules + fetch JSON, buka lewat server statis (bukan file://):

    cd cakrawala-school
    python3 -m http.server 8080
    # buka http://localhost:8080

Semua path relatif + base path otomatis, jadi berjalan di root maupun subfolder.

## 2. Mengaktifkan GitHub Pages
1. Unggah seluruh isi folder ke repository GitHub.
2. Settings - Pages - Source: **Deploy from a branch** - pilih branch `main`, folder `/ (root)`.
3. Tunggu deployment. Situs live di `https://USER.github.io/REPO/`.
4. `404.html` otomatis dipakai GitHub Pages. `.nojekyll` mencegah pemrosesan Jekyll.

## 3. Mengatur base path
Base path dihitung otomatis oleh `assets/js/config.js` dari lokasi modul - tidak perlu diubah untuk project repo (`/REPO/`) maupun custom domain. Untuk **canonical URL & sitemap**, set `siteUrl` di `data/config.json` (atau CMS - Pengaturan), lalu buat ulang `sitemap.xml` via CMS - SEO.

## 4. Mengelola JSON
Semua konten berasal dari `data/*.json` (pages, navigation, homepage, blogs, events, campuses, academic-programs, sports, faqs, fees, dll). Edit langsung file JSON, atau gunakan CMS. `programs.json` adalah alias (`$ref`) ke `academic-programs.json`.

## 5. Menggunakan CMS
Buka `/admin/` - buat passphrase (gerbang client-side, bukan keamanan server). Kelola halaman (CRUD + page builder drag-drop), homepage, navigasi mega menu, blog (rich text), media, acara, kampus, akademik, kegiatan, komunitas, donasi, testimoni, FAQ, formulir, SEO, dan pengaturan brand.

## 6. GitHub Publisher (Mode 2)
CMS - **Connect GitHub** - masukkan **fine-grained PAT** (izin *Contents: Read & write*, hanya repo tujuan). Token **hanya di memori sesi** - tidak pernah ke localStorage/sessionStorage/JSON/source. Alur: Test Connection - Load Latest Data (deteksi konflik via SHA) - Preview Changes - Publish (commit per file) - GitHub Pages deploy otomatis.

**Peringatan keamanan:** token di browser dapat diakses kode apa pun di origin ini selama sesi aktif. Jangan pakai di perangkat bersama; Disconnect setelah selesai.

## 7. Export / Import JSON (Mode 1 & 3)
- **Mode 1 (Lokal):** edit tersimpan sebagai draft di localStorage browser. Draft TIDAK mengubah situs publik.
- **Mode 3 (Manual):** CMS - Ekspor (per file atau bundle) - ganti file di `data/` repo - commit & push - tunggu Pages.
- Impor: CMS - Impor file JSON atau bundle. Validasi struktur otomatis.

## 8. Menambahkan halaman baru
CMS - Halaman - Halaman baru - isi slug/konten - Simpan - **Unduh file HTML** - letakkan di `[slug]/index.html` repo. Tambahkan tautan di Navigasi. (Atau salin folder halaman lain dan ubah `data-page`.)

## 9. Menambahkan gambar
CMS - Media - unggah (drag-drop), atur folder/alt/nama. Publish via GitHub (biner base64) atau unduh lalu letakkan di `assets/images/[folder]/`. Referensikan path-nya di konten. Placeholder SVG tersedia di `assets/images/`.

## 10. Deployment & troubleshooting
- **JSON gagal dimuat:** pastikan dibuka via HTTP(S), bukan file://; cek path & validitas JSON (`python3 tools/validate.py`).
- **Path rusak di subfolder:** jangan pakai path absolut `/assets/`; semua sudah relatif + base otomatis.
- **Tailwind tidak muncul:** CDN `@tailwindcss/browser@4` memindai DOM saat runtime; pastikan online. Konfigurasi tema ada di `<style type="text/tailwindcss">` tiap halaman.
- **Form tidak terkirim:** mode statis default = unduh/salin data; atur `mailto` atau `endpoint` (mis. Formspree) di CMS - Formulir. Tidak ada pesan "terkirim" palsu.
- **Perubahan CMS tidak live:** harus di-Publish (GitHub) atau ekspor+commit manual.
- Workflow `validate.yml` menjalankan QA JSON/tautan saat push (bukan build frontend).

## Batasan arsitektur statis (jujur)
- Konten halaman dirender client-side dari JSON; `<title>`, meta, canonical, OG, dan JSON-LD sudah di-bake statis per halaman untuk SEO. Untuk SEO maksimal tanpa JS, pertimbangkan prerender manual.
- CMS auth hanya client-side; keamanan publish bergantung pada PAT.
- Tidak ada pemrosesan pembayaran/penyimpanan formulir server; gunakan layanan eksternal bila perlu.
- Terjemahan: UI + navigasi + homepage + halaman utama tersedia EN/ID; halaman lain memakai struktur terjemahan yang dapat dilengkapi via CMS (fallback EN).

## Struktur & QA
Lihat halaman `site-map/` di situs. QA: `python3 tools/validate.py`.

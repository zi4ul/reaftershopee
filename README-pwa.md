# Memasang PWA Post Hub (GitHub Pages + iPhone)

## 1. Taruh di GitHub Pages (sekali, ± 5 menit)
1. Buat repositori baru di GitHub (publik), misalnya `post-hub-pwa`.
2. Unggah **isi folder `pwa/`** (bukan folder `pwa` itu sendiri): `index.html`, `core.js`, `upload.js`, `app.js`, `manifest.json`, `sw.js`, `icon-192.png`, `icon-512.png`. Jangan unggah `spike.html` bila tidak perlu.
3. Settings → Pages → Source: *Deploy from a branch* → `main` / `/ (root)` → Save.
4. Tunggu 1–2 menit. Alamatnya: `https://NAMA-ANDA.github.io/post-hub-pwa/`.
5. Aman untuk publik: berkas ini tidak berisi token. URL hub dan token diisi di layar **Pengaturan** dan hanya tersimpan di iPhone Anda.

## 2. Tambah ke Layar Utama (iPhone)
1. Buka alamat di atas dengan **Safari** (bukan Chrome).
2. Ketuk tombol Bagikan → **Tambah ke Layar Utama** → Tambah.
3. Buka dari ikon baru. Tab **Setelan**: isi URL web app hub dan token klien → Simpan → Tes koneksi.

## 3. Pembaruan
- Setelah mengunggah versi baru, naikkan angka `CACHE` di `sw.js` (`post-hub-shell-v2`, dst.), lalu tutup penuh dan buka ulang aplikasi.
- Service worker hanya menyimpan kerangka halaman. Panggilan ke hub dan Google Drive selalu lewat jaringan.

## 3b. Pembaruan T39/T40 (produk dulu, thumbnail, pustaka video)
1. Unggah ulang SEMUA berkas `pwa/` ke repositori (`index.html`, `core.js`, `app.js`, `sw.js`, ...). `sw.js` sudah dinaikkan ke `post-hub-shell-v2`.
2. Hub: tempel ulang `hub/Api.gs` DAN `hub/Upload.gs` di Apps Script, lalu **Deploy > Kelola deployment > Edit > Versi baru** (URL tetap). Tanpa ini tab "Pernah diunggah" menampilkan "Hub belum diperbarui".
3. Tutup penuh aplikasi di HP lalu buka lagi. Thumbnail produk muncul setelah Reafter men-scrape katalog (Pengaturan > Scrape Produk).

## 4. Catatan
- Unggah video harus dilakukan dengan layar menyala dan halaman tetap terbuka (iOS menghentikan unggahan di latar belakang).
- Yang BELUM DIUJI: pemasangan di iPhone asli. Uji dengan video ≥ 50 MB.

## 3c. Pembaruan T64d (tampilan baru "Pernah diunggah", layar sukses, animasi)
1. Unggah ulang SEMUA berkas `pwa/` ke repositori GitHub Pages: `index.html`, `app.js`, `core.js`, `upload.js`, `manifest.json`, `sw.js`, ikon. Di GitHub: *Add file → Upload files*, timpa berkas lama, *Commit changes*. `sw.js` sudah dinaikkan ke `post-hub-shell-v5`.
2. Tunggu 1–2 menit, lalu **tutup penuh** aplikasi di HP (geser ke atas dari app switcher) dan buka lagi. Bila tampilan lama masih muncul, tutup-buka sekali lagi.
3. Yang baru: tab "Pernah diunggah" berupa kartu bergambar; setelah Kirim muncul layar sukses (ringkasan platform + tombol **Kirim lagi** / **Lihat Daftar Job**); animasi halus (otomatis nonaktif bila HP diatur "Kurangi Gerakan"); warna bilah status mengikuti mode terang/gelap.

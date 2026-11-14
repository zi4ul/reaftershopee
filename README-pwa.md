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
3. Buka dari ikon baru. Tab **Pengaturan**: isi URL web app hub dan token klien → Simpan → Tes koneksi.

## 3. Pembaruan (setiap kali ada versi baru)
1. Unggah ulang SEMUA berkas `pwa/` ke repositori (GitHub: *Add file → Upload files*, timpa berkas lama, *Commit changes*).
2. Setiap perubahan berkas kerangka harus disertai kenaikan angka `CACHE` di `sw.js` (sekarang `post-hub-shell-v23`).
3. Tunggu 1–2 menit, lalu **tutup penuh** aplikasi di HP (geser ke atas dari app switcher) dan buka lagi. Bila tampilan lama masih muncul, tutup-buka sekali lagi.
4. Service worker hanya menyimpan kerangka halaman. Panggilan ke hub dan Google Drive selalu lewat jaringan.
5. Hub (hanya bila tab "Pernah diunggah" menampilkan "Hub belum diperbarui"): tempel ulang `hub/Api.gs` DAN `hub/Upload.gs` di Apps Script, lalu **Deploy > Kelola deployment > Edit > Versi baru** (URL tetap).
6. Thumbnail produk muncul setelah Reafter men-scrape katalog (Pengaturan > Scrape Produk).

## 4. Cara pakai (v1.21.0)
**Tema** (tab Pengaturan > Tampilan): Gelap, Terang, atau Ikuti sistem (bawaan). Tiap pilihan punya gambar pratinjau; ketuk langsung diterapkan dan diingat di HP ini (`localStorage` kunci `posthub.theme`). Warna bilah status iPhone ikut berubah.

**Buat Posting** berupa Wizard 6 langkah, satu langkah per layar. Di atas ada **6 garis** (satu per langkah; abu = belum, aksen pudar = selesai, abu tegas = berikutnya, aksen tebal = sedang dibuka) dan teks "Langkah X dari 6 · Nama". Garis bisa diketuk untuk pindah ke langkah yang sudah terbuka; langkah di depan yang masih terkunci tidak bisa dilompati.
1. **Video**: dari HP atau "Pernah diunggah". Setelah dipilih tampil label "Video terpilih", preview besar, dan tombol "Ganti video".
2. **Platform**: Shopee Video, TikTok, Instagram.
3. **Produk**: tab Shopee / TikTok. Wajib memilih bila katalog platform itu ada; bila katalog kosong boleh lanjut tanpa produk.
4. **Deskripsi dan hashtag**: penghitung karakter per platform.
5. **Waktu**: Sekarang atau Jadwalkan; kotak "Simpan video di Drive". Memilih **Jadwalkan** langsung menampilkan kartu tanggal dan jam (waktu bawaan = kelipatan 30 menit berikutnya, minimal 30 menit dari sekarang, mis. `Sabtu, 14 Nov 2026` + `11.00`, lencana "Hari ini"/"Besok"). **Satu ketukan di kartu** membuka picker tanggal+jam bawaan iPhone. Waktu yang sudah lewat (atau sama dengan menit sekarang) ditolak: kartu bergaris merah, pesan "Waktu jadwal sudah lewat…", tombol Lanjut/Kirim nonaktif. Dicek ulang saat pindah langkah dan saat Kirim (waktu bisa lewat selagi layar terbuka).
6. **Ringkasan**: satu panel dengan garis pemisah antarbagian: video (thumbnail + nama + ukuran), platform sebagai chip berwarna (Shopee oranye, TikTok cyan, Instagram magenta), produk per platform sebagai baris horizontal yang bisa digeser (gambar + nama; Instagram "Tanpa produk"), deskripsi + hashtag + penghitung karakter, dan waktu (mis. "Dijadwalkan Minggu, 15 Nov 2026 · 09.05 (Besok)"). Tiap bagian punya tombol **Ubah**; setelah mengubah, tombol Lanjut berganti "Simpan, ke ringkasan". Tombol **Kirim** ada di langkah ini.

**Layar sukses** (setelah Kirim): pesan utama "Masuk antrean!" dengan penjelasan satu kalimat (video terkirim, job masuk antrean, Reafter di PC akan memostingnya; untuk jadwal: "sesuai jadwal"). Di bawahnya satu panel ringkasan: platform berwarna + jumlah produk, dan waktu ("Sekarang" atau mis. "Minggu, 15 Nov 2026 · 09.05"). Tombol **Kirim lagi** (primary, di atas) kembali ke langkah 1 dengan teks dikosongkan; **Lihat Daftar Job** (secondary) membuka tab Daftar Job.

Tombol **Kembali** dan **Lanjut** ada di bagian bawah. Bila Lanjut nonaktif, alasannya tertulis tepat di atasnya. Langkah di depan yang masih terkunci tidak bisa dilompati lewat bilah langkah di atas.

**Daftar Job** (v1.19.0): kartu dua kolom. Atas: nama video + status job. Kiri: thumbnail video portrait (ketuk = putar). Kanan: produk (2 terlihat; geser bila lebih dari 2, ada titik penanda), jadwal · ukuran, status tiap platform, tombol Batalkan. Garis kiri kartu berwarna sesuai status (hijau selesai, merah gagal/perlu tindakan, oranye berjalan, abu menunggu/batal). Tag platform: Shopee oranye, TikTok cyan, Instagram magenta. Chip filter di atas daftar; chip filter di atas daftar: Semua, Berjalan, Selesai, Gagal, Perlu tindakan (masing-masing dengan jumlah). Job "Sebagian berhasil" dihitung di Gagal; job dibatalkan hanya tampil di Semua.

## 5. Cek manual di iPhone (belum pernah diuji di perangkat asli)
Tes otomatis dan uji di Chromium (layar 390×844, mode terang dan gelap, hub tiruan) sudah lulus, tetapi hal berikut hanya bisa dipastikan di iPhone:
- [ ] Setelah pembaruan, app dibuka penuh-ulang dan terlihat Wizard (ada bilah 6 langkah).
- [ ] Langkah 1: pilih video dari HP, thumbnail muncul (tidak hitam), "Ganti video" bekerja.
- [ ] Tombol Kembali/Lanjut tidak tertutup bilah tab bawah atau garis home iPhone; alasan tombol nonaktif terbaca.
- [ ] Langkah 3: pilih produk Shopee (maks 6) dan TikTok (maks 1); Lanjut baru aktif setelah lengkap.
- [ ] Langkah 5: "Jadwalkan" tanpa tanggal membuat Lanjut nonaktif dengan alasan.
- [ ] (v1.20.1) Ringkasan: chip platform berwarna; produk dalam satu baris yang digeser ke samping (halaman tidak ikut bergeser, titik awal rapi); tampil benar di tema terang dan gelap; tombol Ubah mudah diketuk.
- [ ] Ringkasan: semua bagian benar; "Ubah" membuka langkah yang tepat dan kembali ke ringkasan.
- [ ] (v1.21.0) iPhone portrait: gulir sampai paling bawah di langkah 6 dengan pesan galat/progres tampil, tidak ada bagian yang tertutup dock/bilah tab; bilah tab tidak tertabrak garis home.
- [ ] (v1.21.0) Gulir ke bawah di langkah mana pun: header langkah menempel DI BAWAH jam/baterai iPhone (bukan di bawahnya terpotong atau tembus), tanpa celah aneh di atasnya.
- [ ] (v1.21.0) Putar iPhone ke landscape: isi, bilah tab, dock, layar sukses, dan pemutar video tidak tertutup notch/Dynamic Island; tidak ada geseran horizontal halaman.
- [ ] (v1.21.0) Hashtag/Deskripsi sangat panjang tanpa spasi: Ringkasan dan layar tidak melebar ke samping.
- [ ] (v1.21.0) Ulangi satu alur penuh (video → Kirim → sukses → Daftar Job) di tema Gelap lalu Terang; tidak ada teks tak terbaca atau warna janggal.
- [ ] (v1.20.2) Layar sukses: judul "Masuk antrean!", platform berwarna dalam satu panel, "Kirim lagi" menonjol (primary) dan "Lihat Daftar Job" polos (secondary); tombol tidak tertutup garis home iPhone; terbaca di tema terang dan gelap.
- [ ] Kirim video ≥ 50 MB dengan layar menyala; layar sukses muncul; "Kirim lagi" kembali ke langkah 1.
- [ ] (v1.17.0, hub sudah diperbarui) Ketuk thumbnail di Daftar Job / tombol ▶ di Pustaka: video terunduh dan terputar; ✕ menutup. Preview video di langkah 1 juga bisa diketuk untuk memutar.
- [ ] (v1.17.0) Video lama tanpa thumbnail: setelah Daftar Job / Pustaka dimuat, gambar muncul sendiri.
- [ ] (v1.19.0) Daftar Job: kartu dua kolom; geser produk ke samping bila > 2 tidak ikut menggeser halaman; titik penanda berpindah; ketuk thumbnail memutar video.
- [ ] Daftar Job: chip filter menghitung dan menyaring dengan benar; Batalkan / Coba lagi masih jalan.
- [ ] (v1.20.0) Bilah atas: tepat 6 garis + teks "Langkah X dari 6 · Nama"; garis langkah selesai/berikutnya/terbuka bisa dibedakan di tema terang dan gelap; mengetuk garis memindah langkah (hanya yang sudah terbuka).
- [ ] (v1.20.0) Langkah 5: ketuk Jadwalkan → kartu tanggal+jam langsung tampil dengan waktu bawaan; ketuk kartu SEKALI → picker tanggal+jam iPhone terbuka; pilih waktu → kartu ikut berubah; picker tidak mengizinkan tanggal kemarin.
- [ ] (v1.20.0) Biarkan layar terbuka sampai waktu jadwal terlewat, lalu ketuk Lanjut/Kirim: ditolak dengan pesan "sudah lewat" (bukan terkirim). Job terjadwal tampil di Daftar Job dengan jam yang benar.
- [ ] Ketuk kolom Deskripsi, Hashtag, Nama alternatif, Jadwal, dan Pengaturan: halaman TIDAK membesar sendiri.
- [ ] Mode gelap dan "Kurangi Gerakan" (Aksesibilitas) tampil wajar.
- [ ] (v1.18.0) Pengaturan > Tampilan: pilih Gelap / Terang / Ikuti sistem; tampilan berubah seketika, tetap sama setelah app ditutup-buka. Pada Ikuti sistem, ubah mode iPhone (Pusat Kontrol) dan app ikut berubah.
- [ ] (v1.18.0) Tidak ada kilatan putih/gelap saat app dibuka dengan tema yang dipilih; bilah status atas iPhone serasi dengan tema.

## 6. Catatan
- v1.21.0 (QA responsif, versi final redesign): hanya tampilan/CSS; tidak ada perubahan logika, hub, atau format job. Hasil audit kode (tampilan nyata BELUM diuji di perangkat; lihat bagian 5):
  - **Safe area atas:** header langkah (`.stepbar`) kini berhenti di bawah area status (`top:env(safe-area-inset-top)`), dan `body::before` memberi latar bilah di area itu agar isi tidak terlihat lewat saat digulir.
  - **Safe area kiri/kanan (iPhone landscape):** token baru `--padl`/`--padr` (= 14px atau safe area, mana lebih besar) dipakai `body`, `.stepbar`, `.dock`, `.jfilter`; bilah tab, layar sukses, dan pemutar video juga menghormati safe area kiri/kanan. Margin negatif tidak lagi memakai 14px tetap.
  - **Bilah tab + dock:** padding bawah isi halaman dinaikkan 210px → 280px (+safe area) karena dock (alasan 2 baris + tombol + pesan kirim 3 baris) plus bilah tab bisa setinggi ±260px dan sebelumnya bisa menutupi bagian bawah Ringkasan. Jangan dikurangi.
  - **Overflow horizontal:** `body{overflow-x:clip}`, `img,video{max-width:100%}`; teks panjang tanpa spasi (hashtag, galat, pesan) dibungkus `overflow-wrap:anywhere` (`.schip.tag`, `.msg`, `.wzwhy`, `.dtmsg`); semua baris geser (`.jcar`, `.sprow`, `.jfilter`) bergeser di wadahnya sendiri (`overscroll-behavior-x:contain`).
  - **Layar sukses:** bisa digulir bila layar pendek (`overflow-y:auto`, `justify-content:safe center`).
  - **Tema:** diperiksa otomatis: semua `var(--…)` terdefinisi dan setiap token terang punya padanan gelap (kecuali `--media-*` yang selalu gelap). Belum ditemukan warna tertulis di luar blok token.
  - Catatan, tidak diubah: `manifest.json` memuat `background_color` gelap dan `theme_color` biru tetap (hanya untuk layar pembuka/instal Android; iPhone memakai `<meta theme-color>` yang ikut tema). `apple-mobile-web-app-status-bar-style` tidak diatur (bawaan iOS); bila di iPhone ada celah/garis di atas, itu tempat memeriksanya dulu.
- v1.20.2 (Halaman Sukses): hanya tampilan; hub dan format job tidak berubah. `showDone` di `app.js`: `#done-msg` kini kalimat penjelasan "masuk antrean" (bukan lagi teks dari hub; teks hub "Terkirim. Job masuk antrean." tetap tampil di `#sendmsg`), baris ringkasan memakai `<b class="ptag shopee|tiktok|instagram">`, dan `.done .sum` jadi satu panel dengan garis pemisah. Id `done`, `done-msg`, `done-sum`, `done-again`, `done-jobs` tidak berubah.
- v1.20.1 (Halaman Ringkasan): hanya tampilan; hub dan format job tidak berubah. `renderSummary` di `app.js` menghasilkan: `.ssec` (bagian, rata + pemisah, bukan kartu), `.schip.shopee|tiktok|instagram` (chip platform, token platform), `.sprod > .sphead` (tag `.ptag` + hitungan) + `.sprow` (baris horizontal, `overflow-x:auto`, `overscroll-behavior-x:contain`, snap) berisi `.sitem` (88px, nama 2 baris). Tombol Ubah tetap `button.sec.sedit[data-edit=N]` (5 buah, id/selector tidak berubah). Tes menjaga chip berwarna, 5 tombol Ubah, baris produk, escape nama, dan jadwal ramah.
- v1.20.0 (Stepper 6 garis + penjadwalan): hanya tampilan dan validasi di PWA; hub, worker, antrean, dan kontrak API tidak berubah. Format data job tidak berubah: `scheduledAt` tetap string `YYYY-MM-DDTHH:mm` (waktu lokal HP, nilai `datetime-local`) atau `null` bila Sekarang.
  - Stepper: `index.html` memakai `<div class="stepbar">` (sticky) berisi `<ol class="stepper" id="stepper">` dengan tepat 6 `<li><a id="sgN" data-go="N" aria-label="Langkah N: Nama">` tanpa teks tampil + `#wzprog`. Area ketuk tiap garis 44px, garisnya tipis (`::before`). Kelas `fin`/`on` tetap diatur JS (`renderSteps`), `sN` di `.stepper` menandai langkah terbuka. Tes menjaga jumlah garis = 6.
  - Jadwal: kartu `#schedcard` (label) berisi tanggal `#schedd`, jam `#schedt`, lencana `#schedr`, dan input `#sched` transparan yang menutupi seluruh kartu (inilah yang membuat satu ketukan membuka picker); pesan galat `#schedmsg`; pembungkus `#schedbox`. Atribut `min` input diisi menit sekarang.
  - Logika murni di `core.js` (dites di `pwa-core.test.js`): `defaultSchedule`, `minSchedule`, `scheduleProblem`, `formatSchedule`. Validasi dipakai di `app.js` (`schedProblem`) untuk indikator langkah, alasan tombol Lanjut, daftar galat, dan pengecekan ulang di tombol Kirim.
  - Ringkasan (langkah 6) dan layar sukses masih menampilkan waktu sebagai `YYYY-MM-DD HH:mm`; dirapikan di task 7 dan 8.
- v1.19.0 (Kartu Daftar Job): hanya tampilan; format data job, hub, dan tombol Batalkan/Coba lagi tidak berubah. Produk dari semua platform digabung jadi satu carousel (urut Shopee, TikTok). Tombol berbahaya memakai `button.sec.danger`. Kelas penting: `.jcard.st-ok|bad|warn|mut`, `.jcols/.jleft/.jright`, `.jcar/.jslide/.jdots`, `.ptag.shopee|tiktok|instagram`, `.jst`.
- v1.18.1 (Standardisasi komponen): hanya tampilan; hub tidak perlu diperbarui.
  - **Tombol:** bawaan = primary (gradien aksen); `button.sec` = secondary; `.iconbtn` = tombol ikon (mis. ✕). State seragam: hover (hanya perangkat dengan penunjuk), active (menyusut + gelap), disabled (pudar, tanpa bayangan), fokus papan ketik (`:focus-visible`, cincin aksen).
  - **Input:** permukaan `--field` (bukan `--card`), fokus = garis + cincin aksen, `::placeholder` memakai `--mut`. Ukuran huruf tetap 16px.
  - **Badge:** satu dasar `.badge` (juga dipakai `.jbadge`, `.vlabel`, `.schip`); varian `ok`, `bad`, `warn`, `mut` (netral), tanpa varian = info. Sebelumnya status "warn" tidak punya warna sendiri.
  - **Modal:** pemutar video memakai kelas `.modal`; tombol ✕ jelas di kedua tema, fokus pindah ke ✕ saat dibuka, dan Esc menutup (papan ketik eksternal).
  - **Tab bawah:** state hover/tekan/terpilih mengikuti token.
  - **Kartu bersarang dikurangi:** kontrol di dalam kartu langkah (chip platform, tab, Sekarang/Jadwalkan, baris pustaka, kartu produk) memakai `--field`/transparan, bukan kartu tembus lagi; bagian Ringkasan menjadi baris rata dengan garis pemisah (desain penuh Ringkasan di v1.20.1).
  - Perbaikan dari v1.18.0: bayangan tombol primary sempat tidak valid (token berisi bayangan utuh, tapi diberi ukuran lagi) sehingga hilang; ikon ✕ pemutar tak terlihat di tema gelap. Tes kini menjaga keduanya.
- v1.18.0 (Design system + tema): hanya perubahan tampilan; hub tidak perlu diperbarui.
  - Semua warna, ukuran huruf, bobot, radius, jarak (gap), dan bayangan kini token CSS di blok paling atas `<style>` di `index.html`. **Dilarang menulis warna `#hex`/`rgb()` di luar blok token**; `tests/pwa-html.test.js` memeriksanya. Token: `--bg --fg --mut --acc --on-acc --soft --card --bar --line --edge`, status `--ok --bad --warn --info` (+ `-bg`), platform `--shopee --tiktok --instagram` (+ `-bg`, dipakai Task 5), `--media-*` (pemutar video, selalu gelap), `--fs-* --fw-* --r-* --sp-* --shadow*`.
  - Terang dan gelap dirancang terpisah (aksen gelap lebih cerah dengan teks gelap di atasnya, status/platform punya nuansa sendiri). Blok gelap ada DUA salinan identik (untuk "ikut sistem" dan "dipaksa gelap"); ubah keduanya, tes menjaga agar sama.
  - Tema dipasang lewat atribut `data-theme` di `<html>` (`light`/`dark`; tanpa atribut = ikut sistem). Skrip kecil di `<head>` memasangnya sebelum halaman digambar (tanpa kedip). Logika: `PostHubCore.loadTheme/saveTheme/applyTheme`.
  - Ukuran huruf kolom ketik tetap 16px (`--fs-base`); jangan diubah.
- v1.17.0 (Pemutar video + thumbnail dari Drive): **hub harus diperbarui** agar fitur ini jalan. Tempel ulang `hub/Api.gs` DAN `hub/Upload.gs` di Apps Script, lalu Deploy > Kelola deployment > Edit > Versi baru (URL tetap). Hub baru: `hub-1C-0.2`. Tanpa pembaruan hub, aplikasi tetap normal; hanya video dari HP yang bisa diputar dan thumbnail dari Drive tidak muncul.
  - Putar: ketuk preview video (langkah 1), tombol ▶ di Pustaka, atau thumbnail di kartu Daftar Job. Video dari HP diputar langsung; video dari Drive diunduh per 3 MB lewat hub (progres tampil), maks 120 MB. Tutup pemutar dengan tombol ✕.
  - Thumbnail: video yang belum punya gambar di HP (diunggah dari perangkat lain) diambil dari Drive lewat hub, maks 12 sekali muat. Drive butuh beberapa menit untuk membuat gambar mini setelah unggah; bila belum siap, dicoba lagi saat Daftar Job dimuat ulang (jeda 2 menit).
- v1.16.4: thumbnail video dibuat lebih tajam (240px) dan kualitasnya diturunkan otomatis agar selalu muat di penyimpanan HP; sebelumnya thumbnail yang terlalu besar dibuang diam-diam sehingga kartu Daftar Job menampilkan ikon 🎬. Thumbnail juga disimpan walau job gagal dibuat. Video yang diunggah dari perangkat lain/sebelum v1.16.4 tetap tanpa thumbnail sampai Task 2 (hub).
- Unggah video harus dilakukan dengan layar menyala dan halaman tetap terbuka (iOS menghentikan unggahan di latar belakang).
- Kolom ketik memakai huruf 16px agar iPhone tidak memperbesar (zoom) halaman saat mengetik. Jangan diperkecil di CSS.
- Nama alternatif video tersimpan di HP ini saja (localStorage); nama asli file di Drive tidak berubah.

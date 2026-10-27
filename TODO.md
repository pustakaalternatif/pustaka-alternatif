# TODO — Pustaka Alternatif

- [x] Impor dan jalankan kode website dari arsip ZIP sebagai dasar proyek tanpa mengganti teknologi yang digunakan; build Vite berhasil.
- [x] Pertahankan desain editorial, tata letak, tipografi, warna, dan pengalaman visual yang sudah ada; tampilan desktop dan ponsel berhasil dirender.
- [x] Pertahankan seluruh halaman, navigasi, fitur, struktur konten, serta aset yang telah tersedia di dalam proyek; seluruh rute terdaftar dan aset proyek ikut terimpor.
- [x] Sesuaikan konfigurasi build dan runtime hanya sejauh diperlukan agar situs dapat berjalan dengan benar di lingkungan Manus; runtime port 3000 cocok dengan server dan halaman rute menghasilkan JSON.
- [x] Sediakan pratinjau Manus yang stabil dan persisten untuk peninjauan website; server berjalan pada runtime Preview Manus.
- [x] Jaga proyek tetap dalam mode pratinjau dan jangan menerbitkannya sebagai situs publik; auto-publish Manus tetap nonaktif dan tidak ada publikasi publik yang diminta.

## Pembaruan Ruang Ide — 27 Oktober 2026

- [x] Tambahkan lima tulisan dari lima dokumen Word yang dilampirkan ke Ruang Ide dengan isi dan urutan yang dipertahankan; tampilkan sebagai tulisan terbit beserta pembuat Mun’im Sirry dan gambar pendamping yang disediakan.
- [x] Tata ulang Ruang Ide menjadi layout kolom responsif minimalis-modern, gunakan DM Serif Display untuk judul dan Plus Jakarta Sans untuk isi, menu, serta navigasi; sediakan pratinjau dan akses baca utuh per tulisan.
- [x] Selaraskan panel admin dengan situs dengan menyediakan halaman Kelola Ruang Ide yang dapat mencari, menambah, menyunting, menghapus, menata foto/teaser/isi/tanggal, dan mengubah status Draf/Terbit tiap tulisan tanpa menghilangkan pengelolaan katalog, pesanan, penulis, profil, atau pengaturan situs.
- [x] Sertakan migrasi Supabase yang menambahkan tulisan hanya bila koleksi editorial masih kosong, menjaga konten editorial yang sudah ada, serta dokumentasikan cara menerapkannya.
- [x] Buat ZIP sumber proyek yang diperbarui, termasuk aset dan migrasi baru, tanpa memasukkan kredensial, dependensi lokal, atau hasil build.


## Adaptasi Layout Halaman Kolom — 27 Oktober 2026

- [x] Adaptasi halaman Ruang Ide agar mengikuti komposisi halaman kategori kolom referensi: satu tulisan utama besar, dua tulisan pendamping di sisi kanan, lalu daftar tulisan terbaru.
- [x] Pertahankan palette, tipografi, identitas visual, interaksi baca tulisan, navigasi, dan seluruh fitur proyek Pustaka Alternatif yang sudah ada.
- [x] Pastikan susunan baru responsif pada desktop dan seluler serta preview Manus tetap berjalan pada port 3000.
- [x] Perbarui ZIP sumber proyek agar berisi kode, aset, konfigurasi, dan migrasi terbaru tanpa kredensial, node_modules, atau hasil build.

## Interaksi Tulisan Ruang Ide — 27 Oktober 2026

- [x] Perkecil dan seimbangkan tipografi dua tulisan pendamping agar judul serta nama penulis proporsional terhadap ukuran kartu.
- [x] Setiap tulisan terbit di Ruang Ide dapat diklik menuju route detail dinamis, menampilkan narasi lengkap, metadata, waktu baca, dan tombol kembali.
- [x] Tambahkan berbagi ke X/Twitter, LinkedIn, Facebook, WhatsApp, email, serta salin tautan pada halaman detail dan overlay hover gambar kartu.
- [x] Buat ukuran ikon, jarak, dan label overlay sosial mengikuti ukuran container gambar sehingga tetap proporsional pada kartu kecil dan mode mobile.
- [x] Perbarui manifest route, build, preview desktop/mobile, dan ZIP sumber tanpa node_modules, hasil build, atau kredensial.
- [x] Pastikan panel admin menyediakan tambah, edit, hapus, pengaturan status, gambar, teaser, tanggal, dan isi lengkap tulisan Ruang Ide.
- [x] Terapkan perataan justify pada teaser dan narasi publik Ruang Ide serta area isi tulisan pada panel admin, tanpa menerapkan justify pada judul, metadata, atau tombol.

## Arsitektur Deployment — 27 Oktober 2026

- [x] Siapkan dokumentasi dan struktur deployment GitHub → Vercel → Supabase, termasuk arsitektur folder, urutan SQL, environment variables, aturan secret, dan langkah verifikasi.
- [x] Tambahkan `.nvmrc` dan workflow GitHub Actions untuk memastikan versi Node dan build Vite konsisten.
- [x] Perbarui ZIP sumber tanpa kredensial, `node_modules`, atau `dist`, dengan file dokumentasi deployment yang siap dipakai.

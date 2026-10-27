# Pustaka Alternatif

Website editorial berbahasa Indonesia untuk katalog buku dan pemesanan via WhatsApp. Arsitektur produksi ditujukan untuk GitHub + Vercel (frontend statis) + Supabase (Auth, Postgres, Storage). Desain editorial serta aset sampul dari arsip sumber dipertahankan.

## Menjalankan di lokal

Gunakan Node.js 20.19+ atau 22.12+ dan npm (sesuai rentang yang didukung Vite):

```bash
npm install
cp .env.example .env.local
npm run dev
```

Tanpa konfigurasi Supabase, halaman publik memakai katalog contoh yang sudah ada. Panel admin tetap meminta konfigurasi backend dan tidak memiliki akun demo/bypass. Sesudah kredensial Supabase ditambahkan, halaman publik membaca basis data dan semua perubahan panel admin memerlukan sesi autentikasi yang benar.

Untuk build lokal: `npm run build`. File produksi dibuat ke `dist/`.

## Struktur proyek

- `src/main.jsx`: halaman publik, katalog, detail/checkout, navigasi, login OTP, dashboard admin, pengelolaan buku/penulis/kategori/pesanan dan pengaturan situs.
- `src/lib/backend.js`: Supabase Auth, Postgres/RLS, harga/order, pengaturan, dan upload gambar sampul.
- `src/styles.css`: tampilan editorial dan layout responsif.
- `public/assets/`: logo, sampul buku, dan aset situs.
- `public/manus-routes.json`: route Preview.
- `supabase/schema.sql`: tabel, indeks, constraint, fungsi admin, RLS dan bucket Storage.
- `supabase/seed.sql`: katalog awal (harga yang belum diketahui tidak diisi) dan pengaturan default.
- `supabase/bootstrap_admin.sql`: membuat relasi admin untuk user Auth yang telah dibuat.
- `.env.example`: placeholder browser-safe Supabase URL/key.
- `vercel.json`: build Vite dan fallback SPA.
- `docs/ARCHITECTURE.md`: peta lapisan aplikasi dan alur data.
- `docs/DEPLOYMENT.md`: langkah deployment GitHub → Vercel → Supabase.
- `supabase/README.md`: urutan setup database dan bootstrap admin.
- `.github/workflows/build.yml`: validasi `npm ci` dan build pada push/pull request.
- `.nvmrc`: versi Node yang dipakai konsisten oleh lokal, CI, dan Vercel.

## Persiapan Supabase

1. Buat project Supabase. Di SQL Editor, jalankan `supabase/schema.sql`, kemudian `supabase/seed.sql`.
2. Setelah SQL schema dan seed, jalankan `supabase/migrations/20261027_ruang_ide_writings.sql` untuk mengisi lima tulisan awal jika koleksi editorial masih kosong. Migrasi tidak menimpa tulisan yang sudah ada.
3. Di **Authentication → Users**, buat user admin menggunakan alamat email dan kata sandi yang akan digunakan untuk masuk. Jangan membuka pendaftaran publik.
4. Buka `supabase/bootstrap_admin.sql`, ganti `admin@example.com` dengan email akun yang tepat, lalu jalankan query untuk memberi akun tersebut peran admin aktif.
5. Di Authentication, aktifkan email/password. Tambahkan SMTP milik penerbit pada pengaturan SMTP agar kode pemulihan dapat benar-benar dikirim ke inbox admin.
6. Ubah template email **Reset Password** agar mengirim OTP token, misalnya isi template: `Kode OTP untuk mengatur ulang kata sandi: {{ .Token }}`. Proses aplikasi memanggil `resetPasswordForEmail`, memverifikasi kode melalui `verifyOtp` bertipe `recovery`, lalu menyimpan kata sandi baru. Jika template masih berupa magic link atau SMTP belum tersedia, pengiriman OTP numerik belum berfungsi seperti yang diinginkan.
7. Atur masa berlaku OTP, URL situs dan domain pengirim melalui dashboard Supabase sesuai domain deployment. Buat/kelola alamat email admin dari dashboard Auth; alamat email tidak ditanamkan ke kode publik.
8. Isi URL project serta anon/publishable key pada `.env.local` untuk Preview lokal.

Schema memberlakukan Row Level Security: katalog terbit/pra-terbit dan pengaturan dapat dibaca publik; draf tersembunyi; write katalog/pengaturan/sampul serta baca/pembaruan order hanya untuk akun admin aktif; insert order publik harus berisi buku terbit dengan harga katalog yang sama dan total yang sama dengan harga satuan × jumlah. Tabel order tidak menyimpan email pelanggan. Alamat dan nomor WhatsApp yang dikirim adalah milik pemesan.

Supabase URL dan anon/publishable key memang dipakai oleh browser dan dilindungi policy RLS. Jangan pernah menambahkan `service_role` key ke variabel `VITE_*`, berkas source, GitHub, atau bundle. Project ini tidak membutuhkan service-role key maupun API route Vercel untuk fitur yang ada.

### Harga katalog

Harga disimpan dalam satuan Rupiah integer. Enam harga yang tersedia di katalog arsip dipertahankan di `seed.sql`; tiga judul yang harga sumbernya tidak dicantumkan dibiarkan kosong. Admin perlu memasukkan harga melalui **Admin → Kelola buku** sebelum buku tersebut dapat dipesan. Nilai total adalah harga buku × jumlah; ongkos kirim dikonfirmasi penjual dan tidak dijumlahkan otomatis.

## Deploy GitHub + Vercel

Panduan operasional lengkap tersedia di [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md). Ringkasan langkahnya:

1. Hubungkan folder/repository ini ke repositori GitHub milik penerbit. Jangan commit `.env.local` atau kredensial.
2. Import repository GitHub di Vercel. Framework: Vite; build command `npm run build`; output `dist`. `vercel.json` menyiapkan fallback SPA untuk route katalog, detail, checkout, dan admin.
3. Tambahkan `VITE_SUPABASE_URL` dan `VITE_SUPABASE_ANON_KEY` sebagai environment variables untuk Preview/Production di Vercel, kemudian deploy. Keduanya nilai client yang boleh tampil pada bundle; RLS adalah batas keamanannya. Jangan mengisi secret service-role.
4. Jalankan SQL schema/seed satu kali di Supabase dan bootstrap akun admin. Pastikan domain Vercel didaftarkan sebagai URL situs di Supabase Auth serta SMTP dan template OTP sudah aktif.
5. Setelah deployment, uji halaman publik, login admin, pemulihan OTP, perubahan harga/pesanan, dan pembatasan akses RLS sebelum menerima pesanan nyata.

Deployment live belum dilakukan karena project Supabase, URL/anon key, email admin dan kredensial SMTP penerbit belum diberikan. File `.env.example` hanya berisi placeholder, bukan kredensial aktif.

## Fitur panel admin

- Ringkasan jumlah buku per status dan pesanan baru.
- CRUD buku, metadata, ISBN, harga Rupiah, stok, kategori, status terbit, Pilihan editor, dan upload cover.
- CRUD profil penulis; buku dan penulis tetap terhubung berdasarkan id.
- CRUD tulisan Ruang Ide: pencarian, gambar, teaser, tanggal, isi lengkap, dan status Draf/Terbit.
- Tambah, ubah nama, dan hapus kategori; kategori yang dipakai buku tidak bisa dihapus.
- Pencarian/filter pesanan, pembaruan status (Baru, Diproses, Dikirim, Selesai, Dibatalkan), dan ekspor CSV berisi jumlah, harga, total serta alamat/lokasi.
- Pengaturan nama/slogan penerbit, WhatsApp publik, lokasi, teks hero/profil dan tampilan buku yang akan terbit.
- Profil admin, email akun, peran, serta logout.
- Login email/kata sandi untuk user Auth yang sudah dimasukkan ke `admin_users`; reset kata sandi memakai OTP email.

## Checkout WhatsApp

Checkout meminta nama, nomor WhatsApp pemesan, alamat, lokasi/patokan, jumlah, dan catatan opsional. Total dihitung otomatis dan pesan disusun dengan bagian data pemesan/rincian pesanan, harga satuan, subtotal buku, order ID, waktu, serta ongkos kirim yang dikonfirmasi terpisah. Pemesan meninjau isi pesan dan menekan tombol kirim di WhatsApp; situs tidak mengirim pesan diam-diam. Tombol gelembung WhatsApp publik tidak menghalangi formulir checkout.


## Ruang ide dan naskah & kerja sama

Halaman publik `/ruang-ide` dan `/naskah-kerjasama` memakai konten editorial pada record `site_settings`. Halaman **Admin → Ruang Ide** mengelola tulisan dengan pencarian, status draf/terbit, gambar, teaser, tanggal, dan isi lengkap. Pengaturan identitas penerbit tetap berada di **Admin → Pengaturan situs**.

Untuk proyek Supabase lama, jalankan `supabase/migrations/20261026_editorial_content.sql` bila belum pernah diterapkan, kemudian jalankan `supabase/migrations/20261027_ruang_ide_writings.sql` melalui SQL Editor Supabase. Migrasi terbaru menambahkan lima tulisan dan foto sumber hanya jika koleksi editorial masih kosong; konten editorial yang telah disimpan sebelumnya tidak ditimpa. Jika migrasi tidak dijalankan, tampilan memakai lima naskah bawaan proyek sampai editor menyimpan pengaturan.

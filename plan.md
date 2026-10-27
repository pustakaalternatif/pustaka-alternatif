# Rencana pembaruan checkout, panel admin, dan deployment

## Tujuan dan pendekatan

Pertahankan desain editorial biru/off-white dan semua aset serta konten yang sudah ada. Harga katalog disimpan sebagai angka Rupiah bulat; jumlah checkout berupa bilangan bulat 1–99; ringkasan serta pesan WhatsApp selalu dihitung dari harga dan jumlah terbaru. Pesan disusun rapi untuk penjual dan tidak menganggap ongkos kirim termasuk dalam total harga buku.

Panel admin menjadi workspace operasional: ringkasan katalog/pesanan, CRUD buku beserta harga/stok/status/Pilihan editor, CRUD penulis, pengelolaan kategori, pencarian dan perubahan status order serta ekspor CSV, pengaturan identitas dan konten publik, profil dan logout. Semua route admin mensyaratkan Supabase Auth dan row admin aktif. Tanpa kredensial, Preview tetap menampilkan katalog contoh yang sudah ada, tetapi panel admin tetap terkunci; tidak ada akun demo atau bypass autentikasi.

Login menggunakan email/kata sandi akun yang diprovisikan manual. Pemulihan kata sandi memakai kode OTP ke email admin: `resetPasswordForEmail`, `verifyOtp` bertipe recovery, lalu penetapan kata sandi baru. Pengiriman nyata membutuhkan SMTP, template recovery Supabase yang menampilkan token, dan admin yang terdaftar.

## Arsitektur dan struktur proyek

Deployment target adalah static Vite + React di Vercel; GitHub menjadi repositori yang kelak dihubungkan pengguna. Supabase menyediakan Auth, Postgres, Storage, dan Row Level Security. Aplikasi memakai SDK `@supabase/supabase-js` langsung dengan URL project dan anon/publishable key; tidak ada service-role key dalam bundle dan tidak ada endpoint admin publik. RLS membatasi bacaan katalog publik, menolak order dengan harga/jumlah yang tidak cocok dengan buku terbitan, dan memberi akses admin hanya pada sesi yang memiliki baris `admin_users` aktif.

- `src/main.jsx`: halaman publik, form checkout, pembatasan rute admin, autentikasi/OTP, dashboard, CRUD, status pesanan dan pengaturan.
- `src/lib/backend.js`: Supabase SDK, pemetaan harga/order, Auth, katalog, pengaturan dan upload Storage; fallback contoh statis hanya saat belum ada konfigurasi, bukan saat request produksi gagal.
- `supabase/schema.sql`: tabel, relasi, constraint, indeks, fungsi admin, bucket sampul dan kebijakan RLS.
- `supabase/seed.sql`: katalog awal dan pengaturan default; harga yang memang tidak tercantum tetap kosong.
- `supabase/bootstrap_admin.sql`: aktivasi baris admin untuk user yang lebih dahulu dibuat di Supabase Auth.
- `.env.example`: nama konfigurasi browser-safe saja.
- `vercel.json`: build static dan fallback route SPA.
- `README.md` dan `TODO.md`: langkah GitHub/Vercel/Supabase, SMTP, OTP, dan acceptance request.

Dependency utama yang ditambahkan adalah `@supabase/supabase-js`; deployment tidak perlu Node API atau service-role secret karena operasi admin dan insert pesanan dilindungi RLS di Postgres.

## Sistem desain

- **Arah**: editorial kontemporer yang sudah dipakai situs; jangan mengganti identitas, aset, gerak cover atau gaya tipografi.
- **Prinsip**: kontrol admin jelas, harga/total transparan, autentikasi ketat, pesan order mudah dibaca.
- **Palet**: pertahankan biru penerbit dan off-white; hijau WhatsApp hanya untuk tindakan WhatsApp.
- **Tata letak**: pertahankan shell publik dan navigasi/admin responsif; daftar, tabel, ringkasan dan panel form mengikuti fungsi masing-masing.
- **Interaksi dan gerak**: loading/error state jujur, validasi sebelum menyimpan, konfirmasi penghapusan, transisi singkat yang halus; tetap hormati `prefers-reduced-motion`.
- **Tipografi dan suara**: pertahankan Playfair Display, DM Sans, DM Mono serta microcopy Indonesia yang ringkas dan editorial.
- **Esensi merek**: penerbit untuk pendidikan publik dan pembaca yang kritis; terbuka, teliti, editorial.

## Tambahan ruang editorial dan pengelolaan konten
- Pertahankan stack React/Vite serta gaya editorial minimalis Pustaka Alternatif. Tambahkan navigasi publik untuk `/ruang-ide` dan `/naskah-kerjasama`, manifest rute, dan layout responsif untuk menu yang bertambah.
- Ruang Ide merender daftar refleksi pendek penulis yang berstatus terbit. Editor mengelolanya langsung pada panel admin (tambah/edit/hapus, draf atau terbit). Pengaturan tersimpan sebagai konten JSONB di `site_settings` dan menggunakan jalur penyimpanan Supabase atau fallback localStorage yang sudah tersedia.
- Halaman Naskah & kerja sama memuat panduan rinci tentang persiapan naskah, pengiriman via email, proses editorial, hak cipta/penerbitan, serta opsi terjemahan, cetak bersama, dan kerja sama program. Admin dapat memperbarui narasi pengantar tanpa mengubah struktur panduan.
- Migrasi skema idempoten menambahkan kolom konten editorial, tanpa menghapus tabel atau data lama. Ekspor ZIP dilakukan setelah kode dan skema terbaru siap.

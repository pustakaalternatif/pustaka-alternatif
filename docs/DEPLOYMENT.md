# Panduan Deployment Pustaka Alternatif

Dokumen ini menyiapkan alur deployment yang aman untuk **GitHub → Vercel → Supabase**. ZIP proyek tidak menyimpan secret aktif. Semua nilai di `.env.example` adalah placeholder.

## 1. Struktur deployment

```text
GitHub repository
        │
        ├── Vercel: build frontend Vite dari branch main
        │       └── environment variables VITE_SUPABASE_URL
        │           dan VITE_SUPABASE_ANON_KEY
        │
        └── Supabase: Auth + Postgres + Storage + RLS
                ├── supabase/schema.sql
                ├── supabase/seed.sql
                ├── supabase/migrations/
                └── supabase/bootstrap_admin.sql
```

Frontend berjalan sebagai static SPA. Browser hanya memakai `VITE_SUPABASE_URL` dan anon/publishable key. Tidak ada service-role key dan tidak ada API server Vercel yang diperlukan untuk fitur saat ini. Keamanan write dan data admin dijaga oleh Supabase Auth, fungsi `is_active_admin()`, dan Row Level Security.

## 2. GitHub

Jika repository belum dibuat:

```bash
git init -b main
git add .
git commit -m "Initial Pustaka Alternatif deployment"
git remote add origin https://github.com/USERNAME/REPOSITORY.git
git push -u origin main
```

Jika repository sudah terhubung, cukup:

```bash
git add .
git commit -m "Update Pustaka Alternatif"
git push origin main
```

Sebelum push, pastikan `.env.local`, `.env.production`, dan semua file berisi secret tidak ikut ter-commit. `.gitignore` sudah mengecualikan environment lokal, `node_modules`, dan `dist`.

Workflow GitHub Actions di `.github/workflows/build.yml` akan menjalankan `npm ci` dan `npm run build` pada setiap push atau pull request ke `main`.

## 3. Supabase

Buat satu project Supabase kosong. Dari **SQL Editor**, jalankan dalam urutan berikut:

1. `supabase/schema.sql`
2. `supabase/seed.sql`
3. `supabase/migrations/20261026_editorial_content.sql` jika instalasi lama belum pernah menerapkannya
4. `supabase/migrations/20261027_ruang_ide_writings.sql`
5. `supabase/bootstrap_admin.sql` setelah email admin sudah dibuat di Authentication → Users

`20261027_ruang_ide_writings.sql` hanya mengisi lima tulisan awal jika koleksi editorial masih kosong. Data editorial yang sudah ada tidak ditimpa.

### Membuat admin

1. Buka **Authentication → Users**.
2. Buat user admin menggunakan email dan password yang aman.
3. Buka `supabase/bootstrap_admin.sql` dan ganti placeholder `admin@example.com` dengan email user tersebut.
4. Jalankan SQL tersebut.
5. Nonaktifkan pendaftaran publik jika situs hanya boleh memiliki akun admin yang dibuat manual.

Untuk pemulihan password OTP, atur SMTP sendiri di Supabase dan sesuaikan template email reset password. Jangan menaruh SMTP password atau service-role key di repository atau environment `VITE_*`.

### Storage

Schema membuat bucket Storage yang digunakan untuk sampul buku. Policy bucket sudah berada di `supabase/schema.sql`. Periksa **Storage → Policies** setelah schema dijalankan; akses upload tetap dibatasi untuk admin aktif.

## 4. Vercel

1. Masuk Vercel dan pilih **Add New → Project**.
2. Import repository GitHub.
3. Framework preset: **Vite**.
4. Build command: `npm run build`.
5. Output directory: `dist`.
6. Tambahkan environment variables untuk Preview dan Production:

```text
VITE_SUPABASE_URL=https://PROJECT_REF.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_ANON_OR_PUBLISHABLE_KEY
```

7. Deploy branch `main`.
8. Salin domain Vercel yang aktif dan daftarkan di Supabase **Authentication → URL Configuration** sebagai Site URL serta Redirect URLs bila diperlukan oleh flow Auth.

`vercel.json` sudah menyediakan SPA fallback ke `/index.html`, sehingga route berikut tetap dapat dibuka langsung atau setelah refresh:

- `/ruang-ide`
- `/ruang-ide/:slug`
- `/buku/:slug`
- `/checkout/:slug`
- `/admin/*`

## 5. Pemeriksaan sebelum menerima traffic

Jalankan lokal:

```bash
npm ci
cp .env.example .env.local
# isi dua VITE_* dengan nilai Supabase
npm run dev
npm run build
```

Periksa:

- halaman beranda, katalog, Ruang Ide, dan detail tulisan;
- login admin dan logout;
- tambah/edit/hapus tulisan Ruang Ide;
- status Draf/Terbit dan visibilitas tulisan;
- upload sampul dari admin;
- checkout dengan buku yang sudah memiliki harga;
- policy RLS dengan akun publik dan akun admin terpisah;
- URL Vercel setelah refresh langsung pada route nested.

## 6. Aturan secret

Boleh berada di browser/bundle:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY` atau publishable key

Tidak boleh berada di browser, GitHub, Vercel `VITE_*`, source code, atau ZIP:

- `service_role` key;
- password database;
- SMTP password;
- access token GitHub/Vercel/Supabase.

Jika secret pernah terlanjur ter-commit, rotasi secret di provider sebelum deployment.

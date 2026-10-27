# Arsitektur Proyek

## Lapisan aplikasi

```text
src/main.jsx
  ├── PublicShell dan navigasi SPA
  ├── halaman publik katalog, buku, checkout, Ruang Ide, dan submission
  ├── halaman detail tulisan /ruang-ide/:slug
  └── panel admin dan CRUD konten

src/lib/backend.js
  ├── client Supabase berbasis VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY
  ├── Auth dan profil admin
  ├── Postgres/RLS untuk buku, penulis, kategori, order, dan site_settings
  └── Storage upload sampul

src/lib/editorialIdeas.js
  └── fallback lima tulisan Ruang Ide ketika Supabase belum dikonfigurasi

src/styles.css
  └── sistem warna, tipografi, layout responsif, detail tulisan, dan overlay sosial

public/assets/
  └── logo, sampul buku, dan gambar lima tulisan Ruang Ide

supabase/
  ├── schema.sql                    baseline tabel, fungsi, policy, bucket
  ├── seed.sql                      katalog/pengaturan awal
  ├── migrations/                   perubahan terurut dan seed editorial idempoten
  └── bootstrap_admin.sql            pemberian role admin ke user Auth
```

## Alur data publik

Tanpa konfigurasi Supabase, frontend memakai fallback lokal untuk preview. Dengan dua environment variable Supabase, `loadSiteData()` membaca data publik dari Postgres; tulisan berstatus `Draf` tidak ditampilkan. Detail tulisan mencari record terbit berdasarkan slug yang dibuat dari judul.

## Alur data admin

Admin login melalui Supabase Auth. Setiap operasi tulis pada katalog, pengaturan, order, upload sampul, dan editorial content harus melewati policy yang memanggil `is_active_admin()`. Editor dapat mengelola tulisan melalui `/admin/ruang-ide`; perubahan disimpan sebagai JSON editorial di `site_settings`.

## Alur deployment

- GitHub menyimpan source code dan menjalankan pemeriksaan build melalui GitHub Actions.
- Vercel menjalankan `npm ci`/build sesuai konfigurasi project dan menyajikan `dist` sebagai SPA.
- Supabase menyimpan Auth, Postgres, Storage, RLS, dan isi editorial produksi.
- Browser tidak memerlukan server runtime Vercel atau service-role key.

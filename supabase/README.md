# Supabase setup

Gunakan file SQL dari root project sebagai source of truth database. Jalankan melalui Supabase SQL Editor dengan urutan:

1. `schema.sql`
2. `seed.sql`
3. `migrations/20261026_editorial_content.sql` untuk instalasi lama bila diperlukan
4. `migrations/20261027_ruang_ide_writings.sql`
5. `bootstrap_admin.sql` setelah user admin tersedia di Supabase Auth

Semua query seed Ruang Ide dirancang idempoten terhadap koleksi editorial: migrasi 20261027 tidak menimpa tulisan yang sudah tersimpan.

## Environment frontend

Salin `.env.example` menjadi `.env.local` untuk development atau masukkan variabel yang sama di Vercel:

```text
VITE_SUPABASE_URL=https://PROJECT_REF.supabase.co
VITE_SUPABASE_ANON_KEY=ANON_OR_PUBLISHABLE_KEY
```

Hanya URL dan anon/publishable key yang digunakan di browser. Jangan pernah memasukkan `service_role`, password database, atau SMTP secret ke `VITE_*`.

## Admin

Buat user pada **Authentication → Users**, lalu ganti email placeholder di `bootstrap_admin.sql` dan jalankan query tersebut. Setelah itu login melalui `/admin` dan kelola tulisan pada **Admin → Ruang Ide**.

# Store Monitoring

Aplikasi web untuk memantau operasional toko retail multi-cabang: akun dan hak akses, area dan toko, produk, persediaan, POS, absensi, pengeluaran, laporan, serta notifikasi.

## Teknologi

- PHP 8.3 dan Laravel 13
- MySQL/MariaDB
- Inertia.js 3, React 19, TypeScript, dan Vite Plus
- Spatie Laravel Permission untuk role dan permission
- Laravel Sanctum untuk endpoint API

## Persyaratan

Pastikan perangkat sudah memiliki:

- Git
- PHP 8.3 atau lebih baru beserta ekstensi PHP yang dibutuhkan Laravel
- Composer
- Node.js dan npm
- MySQL 8 atau MariaDB

## Menjalankan proyek hasil clone

### 1. Clone repository

```bash
git clone https://github.com/nopal2008/toko_monitoring.git
cd toko_monitoring
```

### 2. Pasang dependency dan siapkan environment

```bash
composer install
```

Salin `.env.example` menjadi `.env`:

```bash
# macOS/Linux
cp .env.example .env

# Windows PowerShell
Copy-Item .env.example .env
```

Buat database kosong, lalu sesuaikan konfigurasi `DB_*` di `.env`, misalnya:

```dotenv
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=toko_monitoring
DB_USERNAME=root
DB_PASSWORD=
```

Buat application key dan jalankan migrasi:

```bash
php artisan key:generate
php artisan migrate
```

> **Catatan database:** migrasi yang tersedia belum mencakup seluruh tabel yang dipakai semua modul aplikasi. Karena itu, `php artisan migrate` saja belum menyiapkan database lengkap untuk seluruh fitur. Siapkan migrasi skema yang belum tersedia sebelum mencoba modul terkait. Jangan mengimpor dump database lokal sebagai pengganti skema bersih.

### 3. Pasang dependency frontend

```bash
npm install
npm run build
```

### 4. Jalankan aplikasi

Buka dua terminal dari folder proyek.

Terminal pertama:

```bash
php artisan serve
```

Terminal kedua:

```bash
npm run dev
```

Buka alamat lokal yang ditampilkan oleh `php artisan serve`.

## Data demo

Seeder demo dapat dijalankan di lingkungan lokal/testing setelah semua tabel yang diperlukan tersedia:

```bash
php artisan db:seed --class=DemoDatabaseSeeder
```

Seeder ini menolak berjalan di production. Akun demo yang dibuat menggunakan password `password`; gunakan hanya untuk pengembangan lokal dan jangan gunakan kredensial tersebut di lingkungan publik.

## Pemeriksaan

```bash
npm run check
npm run types:check
php artisan test
```

## Struktur penting

- `app/` — controller, model, middleware, service, dan policy Laravel
- `database/migrations/` — migrasi database yang tersedia
- `database/seeders/` — seeder role dan data demo
- `resources/js/` — halaman dan komponen React/Inertia
- `routes/web.php` — route web
- `routes/api.php` — endpoint API
- [Blueprint.md](Blueprint.md) — blueprint dan rancangan pengembangan
- [PRD.md](PRD.md) — kebutuhan produk
- [ERD.md](ERD.md) — diagram relasi data

## Keamanan data

- Jangan commit `.env`, kredensial, token, atau dump database yang berisi data pengguna.
- Jangan gunakan akun/demo data untuk production.
- Konfigurasikan `APP_DEBUG=false` dan kredensial database yang aman sebelum deployment.

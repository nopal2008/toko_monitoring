# PRODUCT REQUIREMENTS DOCUMENT (PRD)

## Store Monitoring System

| Field         | Nilai                                                           |
| ------------- | --------------------------------------------------------------- |
| Versi         | 2.1                                                             |
| Tanggal       | 12 November 2026                                                |
| Product Owner | Product Team                                                    |
| Tim Teknis    | Backend (PHP 8.3 / Laravel 13.17), Frontend (React + Inertia 3) |
| Status        | Dalam pengembangan                                              |

> Dokumen ini memuat kebutuhan produk dan rancangan target. Tidak semua tabel atau alur yang direncanakan sudah tersedia di aplikasi. Status implementasi harus diverifikasi terhadap route, model, dan migrasi di repository.

---

## 1. Latar Belakang & Masalah

Pemilik bisnis retail multi-cabang sulit memantau operasional harian secara real-time. Informasi penjualan, stok, kehadiran, dan pengeluaran tersebar. Akibatnya:

- Stok habis baru diketahui setelah pelanggan komplain.
- Kebocoran kas dan pengeluaran tidak wajar sulit dideteksi.
- Rekonsiliasi lintas cabang memakan waktu berhari-hari.
- Pemilik tidak punya gambaran konsolidasi performa bisnis.

**Store Monitoring System** memusatkan seluruh data operasional ke satu dashboard berbasis Inertia, dengan kontrol akses per peran dan notifikasi otomatis.

---

## 2. Arsitektur (Khusus Backend)

### 2.1 Keputusan Inti: **Monolit Inertia 3, bukan API Terpisah**

| Aspek                   | Keputusan                                            | Alasan                                                                          |
| ----------------------- | ---------------------------------------------------- | ------------------------------------------------------------------------------- |
| **Pengiriman frontend** | Inertia.js 3 + React (TypeScript)                    | Tidak perlu maintain API terpisah; controller mengembalikan `Inertia::render()` |
| **Routing**             | Route web Laravel (`routes/web.php`)                 | Wayfinder menghasilkan helper TypeScript bertipe                                |
| **Autentikasi web**     | Sesi Laravel                                         | Digunakan untuk UI Inertia                                                      |
| **Autentikasi API**     | Laravel Sanctum                                      | Endpoint API tersedia di `/api/v1`                                              |
| **Otorisasi**           | `spatie/laravel-permission ^8.5` + middleware/policy | RBAC dan pembatasan akses                                                       |
| **Multi-tenancy**       | **Global scope** pada `tenant_id`                    | Trait `BelongsToTenant` diterapkan ke semua model bisnis                        |
| **Real-time**           | **Polling** (Inertia partial reload)                 | Tidak ada paket broadcasting                                                    |
| **Antrean**             | Driver `database` (default)                          | `jobs`, `failed_jobs`, `job_batches` dipakai                                    |
| **Cache**               | Driver `database` (default)                          | Query dashboard di-cache TTL 60 detik                                           |
| **Upload file**         | `Storage::disk()` + kolom `string` path              | Tidak ada `laravel-medialibrary`                                                |
| **Audit**               | Tabel kustom opsional (lihat §10)                    | Tidak ada `spatie/laravel-activitylog`                                          |

### 2.2 Lingkungan & Perkakas

- **Runtime**: PHP 8.3, Laravel `^13.17`.
- **Frontend**: React 19, TypeScript, Inertia.js 3, dan Vite Plus.
- **Laravel Boost ^2.2**: dependency pengembangan untuk guideline proyek.
- **Analisis statis**: `larastan/larastan ^3.9` (level 6 minimum).
- **Testing**: `pestphp/pest ^4.7` + `pest-plugin-laravel ^4.1` — feature-first.
- **Code style**: `laravel/pint ^1.27`.
- **Logging lokal**: `laravel/pail ^1.2.5`.
- **Dev environment**: `laravel/sail ^1.53`.

### 2.3 Siklus Request

```
Browser (React + Inertia)
    │  Inertia visit (XHR)
    ▼
routes/web.php  (middleware: web → auth → tenant → role/permission)
    ▼
Controller (tipis) ── FormRequest (validasi) ── Policy (otorisasi)
    ▼
Service Class ─── DB::transaction(...) ─── dispatch Event / Job
    ▼
Inertia::render('Transactions/Index', [ 'transactions' => Resource::collection(...) ])
    ▼
Browser merender ulang komponen halaman
```

---

## 3. Persona & Pembagian Akses Halaman

| Peran                    | Kebutuhan Utama                                   | Cakupan Data               | Halaman yang Boleh Diakses                                   |
| ------------------------ | ------------------------------------------------- | -------------------------- | ------------------------------------------------------------ |
| **Owner**                | Konsolidasi semua cabang, profitabilitas, anomali | Semua cabang tenant        | Dashboard semua cabang, laporan konsolidasi, pengaturan      |
| **Admin**                | Kelola master data, user, konfigurasi             | Semua cabang tenant        | Master data, user, pengaturan, dashboard                     |
| **Area Manager**         | Monitoring & approval cabang yang ditugaskan      | Cabang yang di-assign      | Dashboard cabang terassign, approval transfer/pengeluaran    |
| **Store Manager**        | Operasional harian satu cabang                    | Satu cabang                | Dashboard cabang, inventory, transaksi, absensi, pengeluaran |
| **Kasir / Staff**        | Input transaksi cepat, absensi mandiri            | Satu cabang, aksi terbatas | POS, absensi pribadi, riwayat transaksi sendiri              |
| **Super-Admin Platform** | Kelola tenant                                     | `users.tenant_id = NULL`   | Panel tenant (di luar cakupan MVP)                           |

### 3.1 Pembagian Akses Halaman (Route-Level)

| Route                                  | Owner | Admin | Area Manager | Store Manager | Kasir/Staff |
| -------------------------------------- | ----- | ----- | ------------ | ------------- | ----------- |
| `/dashboard` (semua cabang)            | ✅    | ✅    | ❌           | ❌            | ❌          |
| `/dashboard?store=` (cabang terassign) | ✅    | ✅    | ✅           | ✅            | ❌          |
| `/stores` (CRUD)                       | ✅    | ✅    | ❌           | ❌            | ❌          |
| `/products`                            | ✅    | ✅    | view         | view          | ❌          |
| `/inventories`                         | ✅    | ✅    | ✅           | ✅            | ❌          |
| `/inventories/transfer`                | ✅    | ✅    | ✅           | ✅            | ❌          |
| `/transactions` (POS)                  | ✅    | ✅    | view         | ✅            | ✅          |
| `/transactions/{id}/cancel`            | ✅    | ✅    | ✅           | ✅            | ❌          |
| `/employees`                           | ✅    | ✅    | ✅           | ✅            | ❌          |
| `/attendances` (semua)                 | ✅    | ✅    | ✅           | ✅            | ❌          |
| `/attendances/check-in` (self)         | ✅    | ✅    | ✅           | ✅            | ✅          |
| `/expenses`                            | ✅    | ✅    | ✅           | ✅            | ❌          |
| `/expenses/{id}/approve`               | ✅    | ✅    | ✅           | ❌            | ❌          |
| `/reports/*`                           | ✅    | ✅    | ✅           | ✅            | ❌          |
| `/settings`                            | ✅    | ✅    | ❌           | ❌            | ❌          |

> **Aturan penting:** Frontend hanya membantu menyembunyikan menu. Otorisasi harus tetap ditegakkan di backend melalui middleware dan policy.

---

## 4. Ruang Lingkup

### 4.1 Ruang lingkup aplikasi

1. **Autentikasi multi-tenant** via sesi web dan Sanctum untuk API, dengan `spatie/laravel-permission`.
2. **Manajemen cabang** + penugasan user ke cabang (`store_user`).
3. **Master produk & kategori** dengan harga per cabang (`product_store`).
4. **Inventory**: stok per cabang, penyesuaian, transfer antar cabang dengan approval.
5. **Transaksi penjualan** (POS) atomik + pembatalan dengan restore stok.
6. **Shift kasir** (buka/tutup, rekonsiliasi kas).
7. **Karyawan & absensi** (check-in/out dengan geofence, status kehadiran).
8. **Pengeluaran** dengan kategori dan alur approval.
9. **Dashboard**: kartu KPI, grafik tren, widget low-stock.
10. **Notifikasi**: in-app (bell + polling), preferensi kanal.
11. **Laporan**: penjualan, inventory, absensi, pengeluaran — dapat diekspor.
12. **Audit log** (opsional, tabel kustom).

### 4.2 Belum tersedia atau perlu dikembangkan

- API publik/eksternal di luar endpoint `/api/v1` yang sudah tersedia.
- Push WebSocket real-time (butuh Reverb/Pusher).
- Aplikasi mobile native (web responsif / PWA saja).
- Payroll, akuntansi double-entry.
- Integrasi hardware POS (printer thermal, cash drawer).
- Alur pengadaan/pembelian lengkap.

---

## 5. Kebutuhan Fungsional per Modul

### 5.1 Autentikasi & Multi-Tenancy (P0)

| Requirement            | Detail                                                                     |
| ---------------------- | -------------------------------------------------------------------------- |
| Login                  | Email + password, dilindungi rate limiter aplikasi                         |
| Sesi                   | Driver sesi Laravel; tabel `sessions`; ID sesi diperbarui saat login       |
| Logout                 | Invalidasi sesi; redirect ke `/login`                                      |
| Middleware             | `auth`, `tenant`, `EnsureStoreAccess`, `role:` / `permission:`             |
| Isolasi tenant         | Global scope pada semua model bisnis memfilter `auth()->user()->tenant_id` |
| Proteksi lintas tenant | User tenant A tidak bisa mengakses resource tenant B → 403                 |

### 5.2 Otorisasi (P0)

- Peran sistem: `owner`, `admin`, `area_manager`, `store_manager`, `cashier`, `staff`.
- Permission mengikuti pola `module.action`:
  `store.view`, `store.manage`, `product.view`, `product.manage`,
  `inventory.view`, `inventory.adjust`, `inventory.transfer`,
  `transaction.create`, `transaction.cancel`, `transaction.view`,
  `expense.create`, `expense.approve`,
  `attendance.view`, `attendance.manage`,
  `report.view`, `report.export`, `setting.manage`, `user.manage`.
- Ditegakkan via **Policy** (jangan percaya `tenant_id`/`store_id` dari request).
- Opsional: `Gate::before()` bypass untuk super-admin.

### 5.3 Master Data (P0)

- CRUD `areas`, `warehouses`, `brands`, `units` (master operasional lintas cabang).
- CRUD `stores` (cabang) + `store_user` (penugasan).
- CRUD `categories`, `products`.
- SKU unik per `tenant_id`.
- Barcode opsional, dapat dicari.
- Soft-delete pada `stores`, `categories`, `products`, `areas`, `warehouses`, `brands`, `units`.

### 5.4 Inventory (P0)

- Stok dicatat melalui `inventories` berdasarkan toko/produk dan dapat dikaitkan dengan gudang.
- Halaman inventory, penyesuaian, dan aksi transfer tersedia melalui route web.
- Tabel stock opname, retur, permintaan stok, penyesuaian, dan penerimaan barang tersedia pada sebagian migrasi; route/model/service untuk seluruh alur tersebut belum tersedia.
- Setiap mutasi menulis **baris immutable** ke `stock_movements` dengan `quantity_before` / `quantity_after`.
- Penyesuaian wajib `reason` + permission `inventory.adjust`.
- State machine transfer: `pending → approved → in_transit → completed` (atau `cancelled`).
    - Stok keluar dari **asal** saat `in_transit`.
    - Stok masuk ke **tujuan** saat `completed` memakai `received_quantity`.
- Approval dibatasi untuk `owner | admin | area_manager`.

### 5.5 Penjualan (P0)

- Alur POS: pilih produk → qty → diskon → pembayaran → konfirmasi.
- **Transaksi atomik** (lihat §6.1).
- Nomor invoice: `{STORE_CODE}-{YYYYMMDD}-{SEQ}` unik per tenant.
- Pembatalan mengembalikan stok (`stock_movements.type='return'`).
- Snapshot `product_name`, `product_sku`, `price`, `cost_price` di `transaction_items`.

### 5.6 Shift Kasir (P1)

- Buka shift: catat `opening_cash`; hanya satu shift terbuka per `(store, user)`.
- Tutup shift: hitung `expected_cash = opening_cash + total transaksi tunai`; catat `closing_cash`; hitung `cash_difference`.
- Butuh permission `transaction.create`.

### 5.7 SDM & Absensi (P0)

- CRUD karyawan; `user_id` opsional untuk akun login.
- Jadwal kerja per hari (untuk hitung `late_minutes`).
- Check-in/out:
    - Tolak duplikat `(employee_id, date)` → 422.
    - Validasi Haversine terhadap `stores.latitude/longitude` + `radius_meter` (jika dikonfigurasi).
    - `late_minutes = max(0, check_in_at − scheduled_start)`.
    - Status otomatis `late` jika `late_minutes > 0`.

### 5.8 Pengeluaran (P0)

- CRUD + lampiran opsional (path `Storage`).
- Kategori per tenant.
- Alur approval: `draft → approved | rejected`.
- Approver butuh permission `expense.approve`.

### 5.9 Dashboard (P0)

- **Kartu KPI**: penjualan hari ini, jumlah transaksi, stok menipis, karyawan aktif.
- **Grafik**: tren penjualan (hari/minggu/bulan), perbandingan antar cabang, komposisi pengeluaran.
- **Filter**: cabang (multi/single), periode.
- **Sumber data**: `daily_store_summaries` → fallback agregasi langsung.
- **Cache**: key = `dashboard:{tenant}:{store}:{period}`; TTL 60 detik.
- **Partial reload** via Inertia `router.reload({ only: ['chart'] })`.

### 5.10 Notifikasi (P1)

- Tipe event: `low_stock`, `late_attendance`, `below_target_sales`, `daily_digest`.
- **Kanal**: **in-app saja** (bell icon) via tabel `notifications`.
- **Polling**: `GET /notifications/poll` (unread count + 5 terbaru) tiap 30 detik.
- **Preferensi**: toggle per-user per-event di `notification_preferences`.
- Debounce low-stock: 1×24 jam per `(store_id, product_id)`.
- Diproses lewat antrean (driver `database`) — tidak memblokir request.

### 5.11 Laporan (P1)

- Laporan penjualan (per cabang / produk / hari).
- Laporan inventory (stok terkini, daftar low-stock, riwayat pergerakan).
- Laporan absensi (per karyawan, per periode, dengan rincian status).
- Laporan pengeluaran (per kategori, per periode).
- Ekspor **XLSX/PDF** jika paket ditambahkan; jika tidak, **CSV fallback**.
- Ekspor besar → **job antrean + notifikasi saat siap**.

### 5.12 Pengaturan (P2)

- Key-value per tenant di `settings` (`setting_group`, `setting_key`, `value` JSON).
- Dipakai untuk: tarif pajak, header struk, ambang low-stock default, preferensi notifikasi.

---

## 6. Aturan Bisnis Kritis

### 6.1 Transaksi Penjualan (Atomik)

```
DB::transaction:
  1. Lock baris `inventories` (SELECT ... FOR UPDATE) untuk setiap produk
  2. Jika qty < diminta → throw InsufficientStockException (422)
  3. Generate invoice_number (STORE_CODE-YYYYMMDD-SEQ, unik per tenant)
  4. Insert transactions + transaction_items (dengan snapshot)
  5. Kurangi inventories.quantity, perbarui last_movement_at
  6. Insert stock_movements (type='sale', quantity_before, quantity_after, ref=Transaction)
  7. dispatch(TransactionCompleted) → listener:
       - LowStockCheckListener (antrean)
       - DashboardCacheListener (antrean)
```

Pembatalan → baris `stock_movements.type='return'` baru, pulihkan stok, tandai `cancelled_at`, `cancelled_by`, `cancel_reason`.

### 6.2 Low-Stock Alert

- Trigger: setiap baris baru `stock_movements`.
- Kondisi: `inventories.quantity <= inventories.min_stock`.
- Penerima: user dengan role `owner | area_manager` (tenant tersebut) + `store_manager` cabang terkait.
- Debounce: 24 jam per `(store_id, product_id)` — simpan timestamp terakhir di cache.
- Pengiriman: listener antrean → tulis baris `notifications` → polling mengirim ke UI.

### 6.3 Geofence Absensi

- Jarak Haversine antara koordinat check-in dan `stores.latitude/longitude`.
- Tolak jika jarak > `stores.radius_meter` (default 100 m).
- Lewati pengecekan geofence jika koordinat toko null (kompatibilitas mundur).

### 6.4 State Machine Transfer Stok

```
pending ──approve──> approved ──ship──> in_transit ──complete──> completed
   │                    │                    │
   └────cancel──────────┴────cancel──────────┘
```

- `in_transit` **mengurangi** stok asal.
- `completed` **menambah** stok tujuan sebesar `received_quantity`.

---

## 7. Kebutuhan Non-Fungsional (Fokus Backend)

| Aspek                | Target                                                                                                  |
| -------------------- | ------------------------------------------------------------------------------------------------------- |
| **Kinerja query**    | Eager loading wajib (`with()`); larang N+1; `Model::preventLazyLoading(!app()->isProduction())`         |
| **Pagination**       | Semua daftar memakai pagination; dataset besar pakai `cursorPaginate()`                                 |
| **Index database**   | FK index, composite index `(tenant_id, store_id, created_at)`, index unik `(tenant_id, invoice_number)` |
| **Waktu respons**    | TTFB Inertia < 400 ms p95; render dashboard < 2 detik                                                   |
| **Polling**          | `/notifications/poll` < 50 ms p95, cache 15 detik                                                       |
| **Ketersediaan**     | 99,5% per bulan                                                                                         |
| **Skala**            | 100 tenant, 500 cabang, 1 juta transaksi/bulan                                                          |
| **Keamanan**         | Praktik OWASP; password di-hash; perlindungan CSRF dan rate limit pada login/endpoint tulis             |
| **Isolasi tenant**   | Global scope + Policy; diuji di CI                                                                      |
| **Audit**            | Tabel `activity_log` kustom opsional (§10)                                                              |
| **Backup**           | Harian, RPO 24 jam / RTO 4 jam                                                                          |
| **Observability**    | Log terstruktur (`laravel/pail` lokal), Sentry (produksi), monitoring antrean                           |
| **Type safety**      | Wayfinder route helper, Larastan level 6+, Pest feature test                                            |
| **Dukungan browser** | Chrome/Edge/Safari 2 versi terakhir; responsif ≥ 360 px                                                 |

---

## 8. Route Web dan API

Route UI didefinisikan di `routes/web.php` dan dilindungi middleware sesuai kebutuhan. API v1 didefinisikan terpisah di `routes/api.php`; cek file route untuk daftar endpoint terbaru.

```
GET    /login                    Tampilkan halaman login
POST   /login                    Autentikasi
POST   /logout                   Logout

GET    /dashboard                Dashboard (filter via query: ?store=&period=)

RESOURCE  /stores                Hanya Owner/Admin
RESOURCE  /products
RESOURCE  /categories
RESOURCE  /suppliers

GET    /inventories              Daftar (filter: store, low_stock)
POST   /inventories/adjust       Penyesuaian
POST   /inventories/transfer     Buat transfer
POST   /inventories/transfer/{id}/approve
POST   /inventories/transfer/{id}/complete
POST   /inventories/transfer/{id}/cancel

GET    /transactions
POST   /transactions
POST   /transactions/{transaction}/cancel

POST   /cashier-shifts/open
POST   /cashier-shifts/{shift}/close

RESOURCE  /employees
GET    /attendances              Daftar (filter: store, date, status)
POST   /attendances/check-in
POST   /attendances/check-out

RESOURCE  /expenses
POST   /expenses/{expense}/approve

GET    /reports/sales
GET    /reports/inventory
GET    /reports/attendance
GET    /reports/expenses
GET    /reports/{type}/export    Ekspor antrean → notifikasi saat siap

GET    /notifications            Halaman Inertia
GET    /notifications/poll       JSON — endpoint polling (unread + 5 terbaru)
POST   /notifications/{id}/read

GET    /settings
PUT    /settings
```

> **Catatan:** Web routes menyajikan halaman Inertia dan sejumlah aksi; API v1 menyediakan endpoint JSON terpisah.

---

## 9. Keamanan (Sangat Penting)

### 9.1 Autentikasi & Sesi

- Gunakan autentikasi sesi Laravel untuk aplikasi web; gunakan Sanctum untuk endpoint API.
- Regenerasi session ID saat login dan perubahan privilege.
- Konfigurasikan cookie sesi aman sesuai environment deployment.
- Hash password dengan mekanisme Laravel dan kebijakan password yang sesuai.
- Terapkan rate limit pada login dan endpoint tulis.

### 9.2 Otorisasi

- **Jangan pernah percaya `tenant_id` atau `store_id` dari request** — selalu validasi kepemilikan.
- Gunakan **Policy** untuk otorisasi per-record.
- Middleware `role:` / `permission:` untuk proteksi tingkat route.
- Frontend hanya menyembunyikan UI; **keputusan akhir selalu di backend**.

### 9.3 Validasi & Mass Assignment

- Validasi input dengan Form Request atau validasi Laravel yang sesuai.
- Gunakan `$fillable` atau `$guarded`; hindari `Model::unguard()`.
- Gunakan **Eloquent/Query Builder** dengan parameter binding; hindari raw SQL tanpa binding.

### 9.4 CSRF & Header

- Pertahankan perlindungan CSRF Laravel untuk request web yang mengubah data.
- Terapkan security header (X-Content-Type-Options, X-Frame-Options, Referrer-Policy).

### 9.5 Isolasi Tenant

- Trait `BelongsToTenant` + Global Scope pada semua model bisnis.
- Uji di CI: pastikan tidak ada model bisnis yang lupa memakai trait.

---

## 10. Opsional: Audit Log Kustom (Tanpa Paket)

Jika audit diperlukan, buat tabel:

```php
Schema::create('activity_log', function (Blueprint $table) {
    $table->id();
    $table->string('log_name')->nullable();
    $table->text('description');
    $table->nullableMorphs('subject');
    $table->nullableMorphs('causer');
    $table->json('properties')->nullable();
    $table->string('event')->nullable();
    $table->timestamps();
    $table->index(['subject_type', 'subject_id']);
    $table->index(['causer_type', 'causer_id']);
});
```

Isi melalui trait `LogsActivity` pada model (`created`, `updated`, `deleted` → satu baris per event).

---

## 11. Peta Paket (Terpasang vs. Perlu Ditambah Nanti)

### Terpasang (dari `composer.json`)

| Paket                       | Peran                     |
| --------------------------- | ------------------------- |
| `inertiajs/inertia-laravel` | Adaptor Inertia           |
| `laravel/framework`         | Inti                      |
| `laravel/wayfinder`         | Generasi route TypeScript |
| `spatie/laravel-permission` | RBAC                      |
| `laravel/sanctum`           | Autentikasi token API     |
| `laravel/boost`             | Guideline AI agent        |

### Rekomendasi Tambahan (di luar MVP kecuali dipasang)

| Kebutuhan               | Paket                          |
| ----------------------- | ------------------------------ |
| Audit log (jika wajib)  | `spatie/laravel-activitylog`   |
| Ekspor XLSX             | `maatwebsite/excel`            |
| Ekspor PDF              | `barryvdh/laravel-dompdf`      |
| Media handling          | `spatie/laravel-medialibrary`  |
| Push real-time (fase 2) | `laravel/reverb` + Echo client |

Jika paket tidak terpasang, implementasikan fallback minimal (CSV, tabel audit manual, polling).

---

## 12. Kriteria Penerimaan (Sampel)

| ID    | Skenario                                         | Ekspektasi                                                                 |
| ----- | ------------------------------------------------ | -------------------------------------------------------------------------- |
| AC-01 | Login password salah                             | 422, tetap di `/login`, error tampil via prop `errors` Inertia             |
| AC-02 | User tenant A akses toko tenant B                | 403 (Policy), tidak ada kebocoran data                                     |
| AC-03 | Transaksi POS stok kurang                        | 422, **tidak ada** baris `transactions`/`transaction_items` yang tersimpan |
| AC-04 | Stok melewati ambang minimum                     | Baris `notifications` muncul ≤ 30 detik, tidak duplikat dalam 24 jam       |
| AC-05 | Check-in ganda di hari sama                      | 422; baris `attendances` lama tidak berubah                                |
| AC-06 | Transfer `approved → in_transit`                 | `inventories.quantity` asal berkurang; baris `stock_movements` tertulis    |
| AC-07 | Ganti filter dashboard                           | **Partial reload** Inertia — hanya prop `chart` yang diambil ulang         |
| AC-08 | Polling `/notifications/poll` setelah alert baru | Unread count bertambah dalam 30 detik                                      |
| AC-09 | Batalkan transaksi selesai                       | Stok pulih; baris `stock_movements.type='return'` masuk                    |
| AC-10 | Tutup shift kasir dengan selisih                 | `cash_difference` terhitung; tampil di riwayat shift                       |

---

## 13. Risiko & Mitigasi

| Risiko                                       | Dampak         | Mitigasi                                                                           |
| -------------------------------------------- | -------------- | ---------------------------------------------------------------------------------- |
| Race condition stok saat transaksi bersamaan | Oversell       | `SELECT ... FOR UPDATE` dalam `DB::transaction` + Pest concurrency test            |
| Kebocoran data antar tenant                  | Kritis         | `BelongsToTenant` di base model + CI test yang gagal jika model bisnis tanpa trait |
| Polling membebani DB                         | Lonjakan beban | Cache respons poll 15 detik; kembalikan hanya `unread_count` + 5 terbaru           |
| Dashboard lambat pada data besar             | UX buruk       | Pra-agregasi `daily_store_summaries` + cache 60 detik                              |
| Tidak ada push real-time                     | Ekspektasi UX  | Batasan terdokumentasi; polling cukup untuk MVP; Reverb dijadwalkan fase 2         |
| Session storage sebagai bottleneck           | Scaling        | Driver sesi `database` (default); pindah ke Redis saat scaling horizontal          |

---

## 14. Roadmap

| Fase                   | Durasi   | Deliverable                                                        |
| ---------------------- | -------- | ------------------------------------------------------------------ |
| **Fase 1**             | 3 minggu | Auth + tenant + RBAC; master data; cabang & user                   |
| **Fase 2**             | 4 minggu | Inventory (stok, movement, transfer); POS; shift kasir             |
| **Fase 3**             | 3 minggu | Dashboard (KPI, grafik, cache); notifikasi low-stock; polling bell |
| **Fase 4**             | 3 minggu | Absensi + pengeluaran + laporan; audit log; hardening; UAT         |
| **Fase 5** (pasca-MVP) | 2 minggu | Reverb real-time; PWA mobile; UI pengadaan                         |

---

## 15. Glosarium

| Istilah        | Definisi                                                                     |
| -------------- | ---------------------------------------------------------------------------- |
| Tenant         | Satu entitas bisnis (perusahaan) pengguna sistem                             |
| Cabang (Store) | Unit operasional di bawah tenant                                             |
| Ledger         | Tabel `stock_movements` immutable — sumber kebenaran histori stok            |
| Snapshot       | Nilai field yang dibekukan (nama, harga, HPP) disalin ke `transaction_items` |
| Shift          | Jendela buka/tutup kasir untuk rekonsiliasi kas                              |
| Min Stock      | Ambang batas bawah stok per produk per cabang                                |
| Partial Reload | Fitur Inertia untuk menyegarkan prop tertentu tanpa kunjungan halaman penuh  |
| Wayfinder      | Paket yang menghasilkan helper route TypeScript bertipe dari route Laravel   |
| Boost          | Paket guideline AI agent agar kode sesuai best practice Laravel 13           |

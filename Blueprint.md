# MASTER PROJECT BLUEPRINT & AI DEVELOPMENT PROMPT

## Multi-Branch Retail, Warehouse, Inventory Monitoring & POS Management System

**Dokumen:** Product Requirements Document (PRD) + Database Blueprint +
RBAC + Business Workflow + UI/UX Prompt\
**Versi:** 1.0\
**Target backend:** Laravel 13 (PHP 8.3)\
**Target database:** MySQL 8 / MariaDB kompatibel\
**Bahasa antarmuka:** Bahasa Indonesia\
**Zona waktu:** Asia/Jakarta\
**Status:** Rancangan awal untuk implementasi bertahap

---

# 1. Instruksi Utama untuk AI Developer

Bertindaklah sebagai Senior Software Architect, Senior Laravel
Developer, Database Engineer, Security Engineer, QA Engineer, dan UI/UX
Designer.

Bangun aplikasi **Multi-Branch Retail & Warehouse Management System**
untuk mengelola perusahaan retail yang mempunyai gudang pusat, banyak
toko cabang, gudang di setiap cabang, transaksi POS, distribusi barang,
monitoring stok, laporan, dan kontrol akses berdasarkan jabatan serta
wilayah kerja.

Jangan hanya membuat tampilan atau CRUD. Bangun sistem yang konsisten
secara bisnis, aman, dapat diuji, dan siap dikembangkan.

## Aturan pengerjaan

1.  Analisis struktur proyek dan database yang sudah ada sebelum
    mengubah apa pun.
2.  Jangan menghapus atau mengganti tabel/data lama tanpa rencana
    migrasi dan persetujuan.
3.  Gunakan Laravel 13, Eloquent ORM, Form Request Validation,
    Policies/Gates, Middleware, Service Layer, dan database transaction.
4.  Pisahkan Controller, Request, Model, Policy, Service, Enum, dan
    Resource/View sesuai tanggung jawab.
5.  Semua operasi stok wajib mempunyai histori `stock_movements`.
6.  Jangan mengubah stok secara langsung tanpa transaksi bisnis yang
    sah.
7.  Gunakan foreign key, unique constraint, index, decimal untuk nilai
    uang, dan tipe integer yang sesuai untuk kuantitas.
8.  Gunakan `DB::transaction()` dan row locking (`lockForUpdate`) untuk
    operasi stok yang rawan konflik.
9.  Terapkan validasi permission dan data scope di backend.
    Menyembunyikan menu frontend saja tidak cukup.
10. Buat test untuk role, cabang, transfer, penerimaan, POS, notifikasi,
    dan konkurensi stok.
11. Jangan membuat data dummy seolah-olah data produksi. Tandai data
    demo dengan jelas.
12. Kerjakan per fase. Setelah setiap fase, jelaskan file yang dibuat,
    migration yang dijalankan, cara menguji, dan hasil yang diharapkan.
13. Jika ada keputusan bisnis yang belum ditentukan, gunakan konfigurasi
    yang dapat diubah, dokumentasikan asumsi, dan jangan mengunci aturan
    secara tersembunyi.
14. Jangan membuat microservices. Gunakan modular monolith Laravel
    terlebih dahulu.
15. Jangan menambahkan fitur pembayaran online, akuntansi kompleks,
    multi-company, atau integrasi eksternal kecuali diminta.

---

# 2. Ringkasan Produk

Aplikasi ini merupakan sistem terpusat untuk mengelola:

- Gudang pusat (central warehouse).
- Banyak area operasional.
- Banyak toko cabang.
- **Setiap cabang wajib mempunyai minimal satu gudang sendiri.**
- Produk, kategori, merek, SKU, dan barcode.
- Persediaan barang per gudang.
- Pembelian barang dan penerimaan barang.
- Permintaan stok dari cabang.
- Persetujuan dan transfer stok.
- POS/kasir di setiap cabang.
- Shift kasir dan pergerakan kas.
- Retur penjualan dan retur pembelian.
- Stock opname dan penyesuaian stok.
- Notifikasi stok baru, stok menipis, stok habis, dan aktivitas
  penting.
- Dashboard Owner, Area Manager, Store Manager, Staff
  Gudang/Operasional, dan Kasir.
- Audit log dan laporan.

## Prinsip arsitektur

Gunakan **centralized modular monolith**:

- Satu aplikasi Laravel.
- Satu database utama.
- Semua cabang memakai backend yang sama.
- Data dipisahkan berdasarkan `area_id`, `branch_id`, dan
  `warehouse_id`.
- Setiap cabang memiliki gudang sendiri.
- Gudang pusat tidak dianggap sebagai toko cabang.
- Semua stok dicatat berdasarkan lokasi gudang, bukan hanya
  berdasarkan produk.

---

# 3. Struktur Organisasi dan Lokasi

Struktur organisasi:

```text
COMPANY
└── OWNER
    ├── CENTRAL WAREHOUSE
    └── AREA
        ├── AREA MANAGER
        ├── BRANCH A
        │   ├── STORE MANAGER
        │   ├── BRANCH WAREHOUSE A
        │   ├── POS REGISTER 1
        │   ├── POS REGISTER 2
        │   ├── STAFF
        │   └── CASHIER
        ├── BRANCH B
        │   ├── STORE MANAGER
        │   ├── BRANCH WAREHOUSE B
        │   ├── POS REGISTER 1
        │   ├── STAFF
        │   └── CASHIER
        └── BRANCH C
            └── ...
```

## Definisi entitas

- **Area:** kelompok wilayah yang berisi beberapa cabang dan diawasi
  Area Manager.
- **Branch:** satu lokasi toko.
- **Warehouse:** lokasi fisik persediaan barang.
- **Central Warehouse:** gudang pusat, `branch_id` bernilai NULL.
- **Branch Warehouse:** gudang milik satu cabang, `branch_id` wajib
  terisi.
- **POS Register:** terminal kasir yang terdaftar pada satu cabang.
- **Cash Shift:** sesi kerja kasir pada satu POS Register.

Aturan:

1.  Setiap cabang wajib mempunyai minimal satu gudang aktif.
2.  Gudang cabang harus terhubung ke tepat satu cabang.
3.  Gudang pusat tidak terhubung ke cabang.
4.  Cabang tidak boleh menjual stok gudang cabang lain.
5.  POS cabang hanya boleh menggunakan gudang yang diizinkan untuk
    cabang tersebut.
6.  Satu area dapat mempunyai banyak cabang.
7.  Area Manager hanya mengelola area yang ditugaskan.
8.  Owner memiliki cakupan seluruh perusahaan.

---

# 4. Role, Tugas, dan Hak Akses

Gunakan lima role utama berikut. Simpan role dengan slug konsisten.

## 4.1 Owner (`owner`)

**Tanggung jawab:** pemilik bisnis dan pengambil keputusan tertinggi.

Dapat: - Melihat dashboard seluruh perusahaan. - Melihat semua area,
cabang, gudang, produk, stok, penjualan, pembelian, transfer, dan
laporan. - Membuat, mengubah, menonaktifkan area dan cabang. - Mengelola
gudang pusat dan kebijakan gudang. - Mengelola akun, role, permission,
dan penugasan pengguna. - Melihat dan menyetujui transfer stok, termasuk
lintas area. - Menetapkan aturan batas minimum stok dan penerima
notifikasi. - Melihat notifikasi stok baru, stok menipis, stok habis,
stok berlebih, dan aktivitas penting. - Melihat serta mengekspor laporan
penjualan, inventory, pembelian, transfer, dan keuangan. - Melihat audit
log seluruh perusahaan. - Mengatur konfigurasi sistem.

Tidak boleh: - Mengubah histori transaksi yang sudah final secara
diam-diam. - Menghapus transaksi finansial atau stok yang sudah
diposting. Koreksi harus melalui void, reversal, retur, atau adjustment
yang tercatat. - Menghapus audit log.

## 4.2 Area Manager (`area_manager`)

**Tanggung jawab:** mengawasi kinerja dan operasional seluruh cabang
dalam area penugasannya.

Dapat: - Melihat dashboard area. - Melihat stok, penjualan, pembelian,
dan aktivitas gudang cabang di areanya. - Melihat notifikasi stok baru,
stok menipis, dan stok habis di areanya. - Menyetujui atau menolak
permintaan transfer dalam area sesuai kebijakan. - Menyetujui permintaan
pengisian stok cabang jika diberi permission. - Memantau Store Manager,
Staff, dan Cashier di areanya. - Melihat laporan performa cabang di
areanya. - Membuat catatan tindak lanjut dan eskalasi kepada Owner. -
Melihat audit log area.

Tidak boleh: - Melihat atau mengelola area lain. - Membuat atau mengubah
Owner. - Mengubah konfigurasi global. - Menyetujui transfer lintas area
kecuali Owner memberikan delegasi eksplisit. - Mengubah stok secara
langsung tanpa dokumen adjustment. - Menghapus transaksi final.

## 4.3 Store Manager (`store_manager`)

**Tanggung jawab:** mengelola satu cabang dan memastikan operasional
toko berjalan.

Dapat: - Melihat dashboard cabangnya. - Melihat stok gudang cabangnya. -
Melihat transaksi POS dan laporan penjualan cabang. - Mengelola Staff
dan Cashier yang ditempatkan pada cabangnya sesuai permission. -
Mengajukan permintaan stok ke gudang pusat atau sumber gudang yang
diizinkan. - Membuat dokumen stock opname. - Mengajukan stock
adjustment. - Memeriksa penerimaan transfer. - Mengelola retur cabang
sesuai kebijakan. - Melihat notifikasi stok menipis/habis. - Mengelola
jadwal/shift operasional jika modul diaktifkan. - Melihat laporan
cabang.

Tidak boleh: - Melihat data cabang lain. - Menyetujui permintaan yang
dibuat sendiri. - Mengubah stok langsung tanpa dokumen. - Mengubah harga
global produk tanpa permission. - Mengubah konfigurasi perusahaan. -
Menghapus transaksi final.

## 4.4 Staff Operasional / Gudang (`staff`)

**Tanggung jawab:** melaksanakan pekerjaan operasional gudang dan toko.

Dapat, sesuai penempatan dan permission: - Melihat katalog produk. -
Melihat stok gudang cabangnya. - Mencatat penerimaan barang berdasarkan
dokumen yang disetujui. - Menyiapkan barang transfer. - Mencatat
pengiriman barang. - Membantu stock opname. - Melaporkan barang rusak
atau selisih. - Mengajukan retur atau adjustment. - Melihat tugas dan
notifikasi operasional. - Melihat aktivitas miliknya sendiri.

Tidak boleh: - Menyetujui permintaan atau transfer. - Mengubah jumlah
stok tanpa dokumen. - Mengakses data cabang lain. - Melihat laporan
keuangan global. - Mengubah role dan permission. - Menghapus transaksi
final.

## 4.5 Cashier / Kasir (`cashier`)

**Tanggung jawab:** menjalankan transaksi penjualan melalui POS.

Dapat: - Login ke POS cabang yang ditugaskan. - Membuka dan menutup cash
shift. - Memasukkan saldo awal kas. - Scan barcode atau mencari
produk. - Membuat transaksi penjualan. - Memproses metode pembayaran
yang diaktifkan. - Mencetak atau menampilkan struk. - Melihat transaksi
miliknya sesuai kebijakan. - Mengajukan pembatalan/retur untuk
persetujuan. - Mencatat cash-in/cash-out shift jika diberi permission.

Tidak boleh: - Mengubah stok langsung. - Mengubah harga produk global. -
Menghapus transaksi yang sudah dibayar. - Mengakses POS cabang lain. -
Melihat laporan laba rugi atau keuangan global. - Menyetujui retur atau
refund sendiri jika kebijakan memerlukan approval.

## Ringkasan hak akses

---

Modul Owner Area Manager Store Manager Staff Cashier

---

Dashboard Global Area Cabang Operasional POS

Area Full View sendiri No No No

Branch Full View area View sendiri View sendiri View
sendiri

Warehouse Full View area Manage cabang Operasional Stok jual

Products Full View View / terbatas View View

Inventory Full View area Manage dokumen Operasional Read untuk
POS

Purchase Full View area Request Receive sesuai No
tugas

Stock Full Approve area Create View No
Request

Stock Full Approve area Request/Receive Prepare/Ship No
Transfer sesuai tugas

Stock Full Monitor Manage Count/Input No
Opname

POS View semua View area View cabang No Operate

Sales Full View area View cabang Terbatas Transaksi
sendiri

Returns Full Monitor Approve sesuai Request Request
policy

Users Full View/manage Manage Staff Profile sendiri Profile
terbatas area cabang sendiri

Reports Global Area Cabang Operasional Shift
sendiri

Audit Logs Global Area Cabang Aktivitas Aktivitas
sendiri/terbatas sendiri

Settings Full No Cabang terbatas No No
--------------------------------------------------------------------------------------

**Catatan:** tabel ini adalah default. Hak akses teknis harus berasal
dari permission, bukan sekadar pengecekan nama role. Aksi sensitif dapat
dibatasi lebih lanjut melalui Policy.

---

# 5. Aturan Monitoring Stok dan Notifikasi

Ini merupakan kebutuhan utama sistem.

Sistem harus mengirim notifikasi kepada Owner dan Area Manager ketika: -
Barang baru diterima dan stok bertambah. - Stok mencapai batas
minimum. - Stok berada di bawah batas minimum. - Stok habis. - Terjadi
selisih stock opname. - Terjadi adjustment. - Transfer dikirim,
diterima, terlambat, atau bermasalah.

## 5.1 Jenis notifikasi

---

Event Penerima default Tindakan

---

Goods receipt berhasil Owner, Area Manager Informasi stok
terkait, Store Manager bertambah
terkait

Stok menyentuh minimum Owner, Area Manager Peringatan
terkait, Store Manager

Stok di bawah minimum Owner, Area Manager Peringatan dan
terkait, Store Manager rekomendasi
replenishment

Stok habis Owner, Area Manager Prioritas tinggi
terkait, Store Manager

Stock adjustment Approver sesuai scope Memerlukan keputusan
diajukan

Stock adjustment Owner, Area Manager Informasi
disetujui terkait, Store Manager

Transfer diajukan Approver sesuai scope Memerlukan keputusan

Transfer dikirim Owner, Area Manager, Informasi
cabang tujuan

Transfer diterima Owner, Area Manager, Informasi
Store Manager

Selisih penerimaan Owner dan Area Manager Peringatan untuk
terkait investigasi
-----------------------------------------------------------------------

Notifikasi ke Owner untuk event stok bersifat informatif dan tidak
otomatis berarti Owner harus menyetujui setiap transaksi.

## 5.2 Kebijakan notifikasi dan approval

Buat konfigurasi yang dapat diatur, misalnya:

- `notify_owner_on_new_stock = true`
- `notify_area_manager_on_new_stock = true`
- `notify_owner_on_low_stock = true`
- `notify_area_manager_on_low_stock = true`
- `low_stock_threshold_source = product_warehouse`
- `replenishment_approval_mode = area_manager`
- `cross_area_approval_mode = owner`

**Default yang direkomendasikan:**

1.  Setiap stok baru yang sudah diterima secara sah langsung
    menghasilkan notifikasi kepada Owner, Area Manager terkait, dan
    Store Manager cabang.
2.  Stok menipis atau habis langsung mengirim notifikasi kepada Owner,
    Area Manager, dan Store Manager.
3.  Notifikasi tidak menunggu persetujuan. Notifikasi hanya memberi
    informasi.
4.  Permintaan replenishment/transfer tetap memerlukan persetujuan Area
    Manager untuk transaksi dalam area.
5.  Transfer lintas area memerlukan persetujuan Owner.
6.  Owner dapat menerima eskalasi jika Area Manager belum mengambil
    keputusan melewati SLA.
7.  Jangan mengirim notifikasi berulang setiap kali halaman dibuka.
    Gunakan event dan deduplication/cooldown.
8.  Catat status pengiriman notifikasi dan penerimanya.

## 5.3 Batas stok

Sediakan konfigurasi minimum stok per produk dan gudang, bukan hanya
satu nilai global produk.

Contoh:

Produk Gudang Stok Minimum Status

---

Produk A Pusat 500 100 Normal
Produk A Malang 8 20 Menipis
Produk A Surabaya 0 15 Habis

Gunakan aturan: - `quantity <= 0`: habis. -
`0 < quantity <= minimum_stock`: menipis. - `quantity > minimum_stock`:
normal.

Simpan `reorder_point` dan bila dibutuhkan `reorder_quantity` di
konfigurasi inventory per gudang.

## 5.4 Kanal notifikasi

Tahap pertama: - In-app notification. - Badge jumlah notifikasi belum
dibaca. - Notification center dengan filter jenis, cabang, gudang,
tanggal, dan status.

Tahap berikutnya: - Email. - WhatsApp melalui provider resmi setelah
konfigurasi dan kredensial tersedia. - Push notification jika aplikasi
mendukungnya.

Jangan mengklaim email/WhatsApp terkirim jika integrasi belum
dikonfigurasi. Simpan status pengiriman dan kegagalan.

---

# 6. Rancangan Database Relasional

Gunakan InnoDB, `utf8mb4`, foreign key, index, unique constraint, dan
migration Laravel.

Gunakan `id` unsigned bigint sebagai primary key internal kecuali ada
alasan kuat lain. Gunakan `decimal(15,2)` untuk nilai uang. Untuk stok,
gunakan `decimal(15,3)` jika produk dapat memiliki satuan pecahan; jika
semua barang unit utuh, `unsigned bigint` dapat digunakan. Hindari
floating point untuk uang dan stok yang harus presisi.

## 6.1 Organization

### `areas`

- id
- name
- code (unique)
- description (nullable)
- is_active
- timestamps

### `branches`

- id
- area_id (FK areas)
- name
- code (unique)
- address
- phone (nullable)
- is_active
- timestamps

### `warehouses`

- id
- branch_id (nullable FK branches)
- name
- code (unique)
- type (`central`, `branch`)
- address (nullable)
- is_active
- timestamps

Validasi bisnis: - `type=central` harus `branch_id=NULL`. -
`type=branch` harus memiliki `branch_id`. - Setiap branch harus memiliki
minimal satu warehouse aktif. - Implementasikan validasi minimal satu
gudang melalui service/proses pembuatan cabang, bukan mengandalkan CHECK
lintas tabel.

## 6.2 Authentication dan RBAC

### `users`

- id
- role_id (FK roles)
- name
- email (unique)
- password
- is_active
- email_verified_at (nullable)
- remember_token
- timestamps

### `roles`

- id
- name
- slug (unique)
- description
- timestamps

Seed role: - owner - area_manager - store_manager - staff - cashier

### `permissions`

- id
- name
- slug (unique)
- module
- description
- timestamps

### `role_permissions`

- id
- role_id
- permission_id
- unique(role_id, permission_id)

### `area_users`

- id
- user_id
- area_id
- unique(user_id, area_id)

### `branch_users`

- id
- user_id
- branch_id
- unique(user_id, branch_id)

Tambahkan validasi bahwa Store Manager dan Cashier ditempatkan ke cabang
yang sesuai. Area Manager ditugaskan ke area. Staff dapat ditugaskan ke
cabang dan/atau gudang sesuai kebutuhan.

## 6.3 Master data

### `categories`

- id
- parent_id (nullable self FK)
- name
- slug
- is_active
- timestamps

### `brands`

- id
- name
- slug
- is_active
- timestamps

### `units`

- id
- name
- symbol
- timestamps

### `products`

- id
- category_id
- brand_id (nullable)
- unit_id
- sku (unique)
- barcode (nullable unique)
- name
- description (nullable)
- purchase_price decimal(15,2)
- selling_price decimal(15,2)
- is_active
- timestamps

Jangan menyimpan stok aktual di `products`.

## 6.4 Inventory

### `inventories`

- id
- warehouse_id
- product_id
- quantity decimal(15,3), default 0
- reserved_quantity decimal(15,3), default 0
- minimum_stock decimal(15,3), default 0
- reorder_quantity decimal(15,3), nullable
- unique(warehouse_id, product_id)
- timestamps

Stok tersedia = quantity - reserved_quantity.

### `stock_movements`

- id
- warehouse_id
- product_id
- movement_type
- quantity_delta (positif/negatif sesuai aturan yang ditetapkan)
- quantity_before
- quantity_after
- reference_type
- reference_id
- notes (nullable)
- created_by
- created_at

Gunakan ledger yang tidak diubah secara diam-diam. Koreksi dilakukan
dengan movement pembalik atau adjustment baru.

### `stock_opnames`

- id
- warehouse_id
- reference
- status (`draft`, `counting`, `submitted`, `approved`, `rejected`,
  `completed`)
- counted_by
- approved_by (nullable)
- notes
- timestamps

### `stock_opname_items`

- id
- stock_opname_id
- product_id
- system_quantity
- physical_quantity
- difference
- notes

### `stock_adjustments`

- id
- warehouse_id
- reference
- reason
- status (`draft`, `pending_approval`, `approved`, `rejected`,
  `posted`)
- created_by
- approved_by (nullable)
- timestamps

### `stock_adjustment_items`

- id
- stock_adjustment_id
- product_id
- quantity_before
- adjustment_quantity
- quantity_after

## 6.5 Supplier dan pembelian

### `suppliers`

- id
- name
- phone (nullable)
- email (nullable)
- address (nullable)
- is_active
- timestamps

### `purchase_orders`

- id
- supplier_id
- destination_warehouse_id
- reference (unique)
- status
- order_date
- expected_date (nullable)
- subtotal
- discount
- tax
- total_amount
- created_by
- timestamps

### `purchase_order_items`

- id
- purchase_order_id
- product_id
- quantity_ordered
- unit_price
- subtotal

### `goods_receipts`

- id
- purchase_order_id
- warehouse_id
- reference (unique)
- status
- received_by
- received_at
- notes

### `goods_receipt_items`

- id
- goods_receipt_id
- product_id
- quantity_received
- quantity_rejected
- notes

Inventory bertambah berdasarkan kuantitas yang diterima dan disetujui,
bukan kuantitas yang hanya dipesan.

## 6.6 Stock request dan transfer

### `stock_requests`

- id
- source_warehouse_id
- destination_warehouse_id
- reference (unique)
- status
- requested_by
- approved_by (nullable)
- requested_at
- approved_at (nullable)
- notes

### `stock_request_items`

- id
- stock_request_id
- product_id
- quantity_requested
- quantity_approved
- notes

### `stock_transfers`

- id
- source_warehouse_id
- destination_warehouse_id
- reference (unique)
- status
- requested_by
- approved_by (nullable)
- shipped_by (nullable)
- received_by (nullable)
- shipped_at (nullable)
- received_at (nullable)
- notes

### `stock_transfer_items`

- id
- stock_transfer_id
- product_id
- quantity_requested
- quantity_approved
- quantity_sent
- quantity_received
- quantity_damaged
- notes

### `stock_transfer_approvals`

- id
- stock_transfer_id
- approver_id
- decision (`approved`, `rejected`)
- notes
- decided_at

Gunakan `stock_requests` sebagai permintaan kebutuhan. Setelah
disetujui, sistem membuat atau mengonversi menjadi dokumen transfer
dengan referensi yang dapat dilacak. Jangan menggandakan stok pada kedua
dokumen.

## 6.7 POS dan penjualan

### `registers`

- id
- branch_id
- warehouse_id
- name
- code (unique)
- is_active

### `cash_shifts`

- id
- register_id
- cashier_id
- opening_cash decimal(15,2)
- closing_cash decimal(15,2), nullable
- expected_cash decimal(15,2), nullable
- difference decimal(15,2), nullable
- opened_at
- closed_at (nullable)
- status (`open`, `closed`, `reconciled`)

### `sales`

- id
- branch_id
- warehouse_id
- register_id
- cash_shift_id
- cashier_id
- invoice_number (unique)
- subtotal
- discount
- tax
- total
- payment_status
- status (`draft`, `completed`, `voided`, `refunded`,
  `partially_refunded`)
- sold_at
- timestamps

### `sale_items`

- id
- sale_id
- product_id
- product_name_snapshot
- sku_snapshot
- quantity
- unit_price
- discount
- subtotal

Simpan snapshot nama/SKU/harga agar histori struk tidak berubah ketika
master produk diedit.

### `payments`

- id
- sale_id
- method (`cash`, `card`, `bank_transfer`, `qris`, configurable)
- amount
- reference (nullable)
- status
- paid_at

### `cash_movements`

- id
- cash_shift_id
- type (`cash_in`, `cash_out`, `sale_cash`, `refund_cash`)
- amount
- description
- created_by
- created_at

### `sales_returns`

- id
- sale_id
- reference
- reason
- status
- created_by
- approved_by (nullable)
- timestamps

### `sales_return_items`

- id
- sales_return_id
- product_id
- quantity
- item_condition (`resellable`, `damaged`)
- refund_amount

Barang retur hanya menambah stok jika hasil pemeriksaan menyatakan
barang layak jual dan proses retur telah disetujui.

## 6.8 Audit, notifikasi, pengeluaran

### `notifications`

Gunakan Laravel Notifications atau tabel notifikasi standar dengan data
tambahan bila diperlukan.

### `audit_logs`

- id
- user_id
- action
- module
- reference_type
- reference_id
- old_values JSON (nullable)
- new_values JSON (nullable)
- ip_address (nullable)
- user_agent (nullable)
- created_at

### `expenses`

- id
- branch_id
- expense_category_id
- reference
- amount
- description
- status
- created_by
- approved_by (nullable)
- expense_date

### `expense_categories`

- id
- name
- is_active

---

# 7. Relasi Eloquent yang Harus Dibuat

Contoh relasi utama:

- `Area hasMany Branch`
- `Area belongsToMany User` melalui `area_users`
- `Branch belongsTo Area`
- `Branch hasMany Warehouse`
- `Branch belongsToMany User` melalui `branch_users`
- `Warehouse belongsTo Branch` (nullable untuk gudang pusat)
- `Warehouse hasMany Inventory`
- `Product hasMany Inventory`
- `Inventory belongsTo Warehouse`
- `Inventory belongsTo Product`
- `Product hasMany StockMovement`
- `Warehouse hasMany StockMovement`
- `StockTransfer belongsTo source Warehouse`
- `StockTransfer belongsTo destination Warehouse`
- `StockTransfer hasMany StockTransferItem`
- `User belongsTo Role`
- `Role belongsToMany Permission`
- `User hasMany Sale` sebagai cashier
- `Sale hasMany SaleItem`
- `Sale hasMany Payment`
- `Register belongsTo Branch`
- `Register belongsTo Warehouse`
- `CashShift belongsTo Register`
- `CashShift belongsTo User` sebagai cashier

Pastikan relasi source dan destination menggunakan foreign key yang
eksplisit agar tidak ambigu.

---

# 8. Business Workflow

## 8.1 Pembelian dan penerimaan barang

```text
Purchasing membuat Purchase Order
        ↓
Supplier mengirim barang
        ↓
Staff gudang memeriksa barang
        ↓
Goods Receipt dibuat
        ↓
Kuantitas diterima dikonfirmasi
        ↓
Database transaction:
  - Inventory bertambah
  - Stock movement IN dibuat
  - Goods Receipt menjadi posted/completed
        ↓
Notifikasi dikirim ke Owner,
Area Manager terkait, Store Manager terkait
```

PO tidak menambah stok. Goods Receipt yang sudah diposting menambah
stok.

## 8.2 Replenishment dan transfer stok

```text
Stok cabang mencapai reorder point
        ↓
Sistem memberi peringatan
        ↓
Store Manager membuat Stock Request
        ↓
Area Manager memeriksa kebutuhan dan stok sumber
        ↓
Dalam area yang sama:
  Area Manager dapat approve/reject
Lintas area:
  Owner harus approve
        ↓
Gudang sumber menyiapkan barang
        ↓
Barang dikirim
        ↓
Stok sumber dipindahkan ke status/lokasi IN_TRANSIT
        ↓
Cabang tujuan memeriksa barang
        ↓
Kuantitas diterima dikonfirmasi
        ↓
Stok gudang tujuan bertambah
        ↓
Jika ada selisih/rusak:
  buat discrepancy record dan notifikasi
        ↓
Transfer selesai
```

Gunakan lokasi virtual `IN_TRANSIT` atau mekanisme inventory-in-transit
yang setara. Jangan mengurangi stok sumber dan menambah stok tujuan
sebelum barang benar-benar mencapai tahapan yang sesuai.

## 8.3 POS

```text
Kasir login
  ↓
Pilih POS Register yang ditugaskan
  ↓
Buka Cash Shift dan input saldo awal
  ↓
Scan barcode / cari produk
  ↓
Validasi produk dan stok gudang cabang
  ↓
Hitung subtotal, diskon, pajak, total
  ↓
Proses pembayaran
  ↓
Jika pembayaran berhasil:
  - Simpan Sale
  - Simpan Sale Items
  - Simpan Payment
  - Kurangi Inventory
  - Buat Stock Movement OUT
  - Buat struk
  - Kirim event notifikasi bila stok menyentuh batas minimum
  ↓
Kasir menutup shift
  ↓
Rekonsiliasi kas
```

Gunakan database transaction dan `lockForUpdate()` pada inventory.
Terapkan idempotency key atau mekanisme pencegah transaksi ganda.

## 8.4 Stock opname

```text
Store Manager membuat sesi opname
  ↓
Staff menghitung stok fisik
  ↓
Sistem membandingkan stok sistem dan fisik
  ↓
Selisih ditampilkan
  ↓
Store Manager mengajukan hasil
  ↓
Approver memeriksa sesuai kebijakan
  ↓
Adjustment diposting
  ↓
Inventory dan Stock Movement diperbarui
  ↓
Audit log dan notifikasi dibuat
```

---

# 9. Aturan Teknis Persediaan

1.  `inventories.quantity` adalah saldo stok terkini per produk per
    gudang.
2.  `stock_movements` adalah ledger pergerakan stok.
3.  Setiap perubahan inventory harus menghasilkan movement dalam
    transaksi database yang sama.
4.  Tambahkan unique constraint pada `(warehouse_id, product_id)`.
5.  Cegah stok tersedia menjadi negatif kecuali ada kebijakan khusus
    yang diaktifkan Owner.
6.  Gunakan row lock saat mengurangi stok.
7.  Jangan menghapus movement yang telah diposting.
8.  Gunakan reversal movement untuk koreksi.
9.  Transfer harus membedakan requested, approved, sent, received,
    damaged.
10. Stok yang sedang transit harus dapat dilacak dan tidak dihitung
    sebagai stok tersedia di gudang sumber atau tujuan.
11. Gunakan idempotency untuk mencegah goods receipt, sale, atau
    transfer diposting dua kali.
12. Gunakan decimal yang konsisten untuk kuantitas pecahan.
13. Simpan snapshot harga/nama produk pada transaksi penjualan dan
    pembelian.
14. Buat scheduled job untuk mendeteksi stok menipis jika perubahan stok
    tidak selalu berasal dari aplikasi.
15. Event notifikasi sebaiknya diproses setelah transaksi database
    berhasil commit.

---

# 10. UI/UX Design System dan Prompt

## 10.1 Arah visual

Buat dashboard admin modern untuk aplikasi bisnis retail dan
pergudangan.

Karakter desain: - Professional enterprise dashboard. - Bersih,
minimalis, modern, dan mudah dipahami. - Prioritaskan keterbacaan dan
efisiensi kerja. - Jangan terlalu banyak gradient, glassmorphism,
animasi, atau dekorasi. - Gunakan whitespace secara konsisten. - Gunakan
desain responsif untuk desktop, tablet, dan mobile. - Bahasa antarmuka
Indonesia. - Format mata uang Rupiah: `Rp 1.250.000`. - Format tanggal:
`17 Nov 2026` atau format lokal yang konsisten. - Semua tabel mendukung
pencarian, filter, sorting, pagination, dan empty state.

## 10.2 Warna dan komponen

Gunakan: - Primary: navy/dark blue untuk navigasi dan elemen utama. -
Accent: blue untuk aksi utama. - Success: green untuk status
berhasil/normal. - Warning: amber untuk stok menipis/perlu tindakan. -
Danger: red untuk stok habis, gagal, atau tindakan berisiko. - Neutral:
gray untuk border, background, teks sekunder.

Komponen: - Sidebar collapsible. - Topbar dengan breadcrumb, pencarian,
notifikasi, profil. - KPI cards. - Data table. - Filter bar. - Search
input. - Date range picker. - Status badge. - Confirmation dialog. -
Drawer/detail panel. - Form dengan validation state. - Toast
notification. - Skeleton loading. - Empty state. - Error state. -
Pagination. - Chart dan grafik. - Responsive mobile navigation.

Gunakan icon set konsisten seperti Lucide. Jangan memakai emoji sebagai
icon utama aplikasi.

## 10.3 Layout utama

Desktop: - Sidebar di kiri. - Topbar di bagian atas. - Konten utama
dengan lebar fleksibel. - KPI di atas. - Grafik dan tabel di bawah. -
Jangan membuat tabel terlalu padat.

Mobile: - Sidebar berubah menjadi drawer/bottom navigation sesuai
kebutuhan. - Tabel dapat horizontal scroll atau menjadi card list. -
Tombol aksi penting mudah dijangkau. - POS harus nyaman untuk layar
tablet dan desktop.

## 10.4 Dashboard per role

### Owner Dashboard

Tampilkan: - Total cabang aktif. - Total gudang. - Total produk. - Total
stok seluruh lokasi. - Nilai persediaan. - Total penjualan hari
ini/bulan ini. - Estimasi laba kotor jika data HPP tersedia. - Cabang
dengan penjualan tertinggi/terendah. - Stok menipis dan habis di seluruh
cabang. - Barang baru diterima. - Transfer menunggu keputusan. -
Aktivitas terbaru. - Grafik tren penjualan. - Perbandingan performa
area/cabang. - Filter tanggal, area, cabang, kategori produk.

### Area Manager Dashboard

Tampilkan: - Total cabang dalam area. - Total penjualan area. - Stok
menipis/habis per cabang. - Transfer dan request menunggu approval. -
Penerimaan barang terbaru. - Performa cabang. - Aktivitas Store
Manager. - Daftar notifikasi area. - Filter tanggal dan cabang.

### Store Manager Dashboard

Tampilkan: - Penjualan hari ini. - Jumlah transaksi. - Stok gudang
cabang. - Produk menipis/habis. - Request stok. - Transfer dalam
perjalanan. - Barang yang harus diterima. - Hasil stock opname. -
Aktivitas Staff dan Kasir. - Laporan harian cabang.

### Staff Dashboard

Tampilkan: - Tugas operasional hari ini. - Barang masuk yang perlu
diperiksa. - Transfer yang perlu disiapkan. - Stock opname yang sedang
berlangsung. - Laporan barang rusak/selisih. - Notifikasi tugas.

### Cashier Dashboard / POS

Buat tampilan POS khusus: - Area scan barcode yang menonjol. - Pencarian
produk cepat. - Daftar item keranjang. - Kontrol quantity. - Harga dan
subtotal. - Diskon sesuai permission. - Total pembayaran besar dan mudah
dibaca. - Pilihan metode pembayaran. - Tombol proses pembayaran yang
jelas. - Cetak/preview struk. - Informasi shift kasir dan saldo kas. -
Stok tersedia sebagai informasi. - Error state jika stok tidak cukup. -
Konfirmasi sebelum void/refund. - Dukungan keyboard shortcut jika
memungkinkan.

## 10.5 Halaman modul

Buat halaman berikut:

1.  Login dan forgot password.
2.  Dashboard sesuai role.
3.  User management.
4.  Role & permission management.
5.  Area management.
6.  Branch management.
7.  Warehouse management.
8.  Product, category, brand, unit.
9.  Supplier.
10. Inventory per gudang.
11. Stock movement history.
12. Low stock monitoring.
13. Purchase order.
14. Goods receipt.
15. Stock request.
16. Stock transfer.
17. Transfer approval center.
18. Stock opname.
19. Stock adjustment approval.
20. POS register.
21. Cash shift.
22. Sales history.
23. Sales return/refund.
24. Expenses.
25. Reports and analytics.
26. Notification center.
27. Audit log.
28. System settings.

## 10.6 Prompt UI/UX siap pakai

```text
Bertindaklah sebagai Senior Product Designer dan Enterprise UI/UX Designer.

Rancang antarmuka aplikasi Multi-Branch Retail & Warehouse Management System.

Aplikasi memiliki lima role:
1. Owner
2. Area Manager
3. Store Manager
4. Staff Operasional/Gudang
5. Cashier/Kasir

Buat design system yang konsisten dan dashboard berbeda sesuai role.
Gunakan sidebar, topbar, breadcrumb, KPI cards, data table, filter,
status badge, chart, notification center, drawer, modal, dan form.

Gaya visual:
- Modern enterprise SaaS dashboard.
- Minimalis, profesional, bersih.
- Navy/blue sebagai warna utama.
- Green untuk normal/success.
- Amber untuk warning.
- Red untuk critical/error.
- Typography jelas.
- Whitespace cukup.
- Responsive desktop, tablet, dan mobile.
- Bahasa Indonesia.
- Format mata uang Rupiah.

Owner harus dapat memonitor semua area, cabang, gudang, stok,
penjualan, pembelian, transfer, dan laporan.

Area Manager hanya melihat area yang ditugaskan dan mempunyai
halaman approval transfer serta monitoring stok.

Store Manager mengelola satu cabang dan gudangnya, mengajukan
stok, menerima transfer, melakukan stock opname, serta memonitor
aktivitas operasional cabang.

Staff memiliki halaman tugas operasional gudang dan stok.

Cashier mempunyai POS khusus yang cepat, mudah digunakan,
mendukung barcode, keranjang, pembayaran, shift kasir, dan struk.

Tampilkan notifikasi ketika barang baru diterima, stok menipis,
stok habis, transfer dikirim, dan transfer diterima.
Tampilkan siapa yang harus mengambil tindakan.

Setiap halaman harus memiliki:
- Loading state.
- Empty state.
- Error state.
- Success feedback.
- Validation message.
- Confirmation untuk tindakan berisiko.

Jangan membuat semua role menggunakan dashboard yang sama.
Jangan menampilkan menu yang tidak relevan dengan role.
Tetap validasi semua akses di backend.
Jangan menggunakan data palsu tanpa label DEMO.
Prioritaskan usability, accessibility, consistency, dan efisiensi kerja.
```

---

# 11. Keamanan dan Authorization

Implementasikan:

- Authentication yang aman.
- Password hashing menggunakan Laravel Hash (bcrypt atau Argon2 sesuai
  konfigurasi).
- CSRF protection untuk web session.
- Rate limiting login dan endpoint sensitif.
- Authorization melalui permission dan Policy.
- Data scope berdasarkan area, branch, dan warehouse.
- Validasi ownership setiap resource.
- Audit log untuk aktivitas sensitif.
- Validasi server-side pada seluruh input.
- Hindari mass assignment dengan `$fillable` atau `$guarded` yang
  tepat.
- Jangan pernah mengirim password, token, atau data rahasia pada
  response.
- Jangan mempercayai `branch_id`, `warehouse_id`, `cashier_id`, atau
  `approved_by` dari frontend tanpa validasi hak akses.
- Pastikan Staff/Kasir tidak dapat mengubah ID cabang pada request
  untuk mengakses cabang lain.
- Gunakan soft delete hanya untuk master data yang memang aman
  dinonaktifkan; transaksi final tidak boleh dihapus sembarangan.

Contoh data scope:

- Owner: seluruh data.
- Area Manager: area yang ditugaskan.
- Store Manager: cabang yang ditugaskan.
- Staff: gudang/cabang yang ditugaskan dan aktivitas sesuai izin.
- Cashier: POS, shift, dan transaksi sesuai penugasan.

Setiap endpoint `show`, `update`, `delete`, `approve`, `ship`,
`receive`, dan `refund` harus memeriksa Policy dan scope, bukan hanya
endpoint daftar.

---

# 12. API dan Routing

Gunakan route group berdasarkan middleware dan permission.

Contoh konseptual:

```php
Route::middleware(['auth'])->group(function () {
    Route::get('/dashboard', DashboardController::class);

    Route::middleware('permission:branches.view')
        ->get('/branches', [BranchController::class, 'index']);

    Route::middleware('permission:inventory.view')
        ->get('/inventory', [InventoryController::class, 'index']);

    Route::middleware('permission:stock_transfers.approve')
        ->post('/stock-transfers/{transfer}/approve',
            [StockTransferController::class, 'approve']);

    Route::middleware('permission:sales.create')
        ->post('/pos/sales', [POSController::class, 'store']);
});
```

Sesuaikan implementasi middleware dengan konfigurasi Laravel 13. Jangan
menganggap nama middleware di atas otomatis tersedia sebelum
didaftarkan.

Pisahkan endpoint web dan API jika frontend menggunakan SPA atau
aplikasi mobile.

---

# 13. QA dan Acceptance Criteria

Sistem belum dianggap selesai jika hanya halaman dapat dibuka.

## Role test

- Owner dapat melihat semua area/cabang.
- Area Manager tidak dapat membaca area lain melalui URL/API langsung.
- Store Manager tidak dapat membaca cabang lain.
- Staff tidak dapat approve transfer tanpa permission.
- Cashier tidak dapat mengakses halaman pengelolaan stok.
- Cashier tidak dapat mengganti `branch_id` untuk menjual dari cabang
  lain.
- User nonaktif tidak dapat login.

## Warehouse test

- Setiap cabang mempunyai gudang sendiri.
- Gudang pusat tidak terhubung ke cabang.
- Produk dapat memiliki stok berbeda di setiap gudang.
- Stok tidak dapat menjadi negatif tanpa kebijakan khusus.
- Setiap perubahan stok menghasilkan stock movement.
- Barang dalam perjalanan dapat dilacak.

## Transfer test

- Request membutuhkan approval yang sesuai.
- Area Manager hanya dapat approve transfer dalam scope-nya.
- Transfer lintas area memerlukan Owner.
- Transfer ditolak tidak mengubah stok.
- Transfer dikirim memindahkan stok ke in-transit.
- Penerimaan parsial tercatat.
- Barang rusak/selisih menghasilkan catatan.
- Transfer tidak dapat diposting dua kali.

## POS test

- Kasir hanya memakai register cabangnya.
- Kasir harus membuka shift sebelum transaksi.
- POS mengambil stok dari gudang cabang yang terhubung.
- Pembayaran gagal tidak mengurangi stok.
- Pembayaran berhasil mengurangi stok satu kali.
- Dua kasir tidak dapat menjual stok terakhir secara bersamaan
  melebihi jumlah tersedia.
- Void/refund menghasilkan reversal yang tercatat.
- Tutup shift menghasilkan rekonsiliasi kas.

## Notification test

- Goods receipt memicu notifikasi stok baru.
- Stok mencapai minimum memicu low stock notification.
- Stok nol memicu out of stock notification.
- Owner dan Area Manager terkait menerima notifikasi sesuai
  konfigurasi.
- Area Manager tidak menerima notifikasi area lain.
- Notifikasi tidak terkirim berulang tanpa alasan.
- Kegagalan email/provider tidak membatalkan transaksi stok.

---

# 14. Tahapan Implementasi

Kerjakan secara berurutan. Jangan membuat semua modul sekaligus.

## Phase 1 --- Foundation

- Audit proyek dan database.
- Authentication.
- Roles.
- Permissions.
- Role permissions.
- User management.
- Seeder role dan akun demo.
- Middleware dan Policy.
- Feature test akses.

## Phase 2 --- Organization

- Areas.
- Branches.
- Warehouses.
- Area users.
- Branch users.
- Validasi satu cabang minimal satu gudang.
- Dashboard dasar per role.

## Phase 3 --- Master Data

- Categories.
- Brands.
- Units.
- Products.
- Suppliers.
- SKU dan barcode.
- Harga dan histori harga.

## Phase 4 --- Inventory

- Inventories.
- Stock movements.
- Minimum stock.
- Stock opname.
- Stock adjustment.
- Audit trail stok.
- Low-stock detection.

## Phase 5 --- Purchasing & Distribution

- Purchase orders.
- Goods receipts.
- Stock requests.
- Approval workflow.
- Stock transfers.
- In-transit inventory.
- Partial receiving.
- Discrepancy handling.

## Phase 6 --- POS

- Registers.
- Cash shifts.
- Sales.
- Sale items.
- Payments.
- Cash movements.
- Returns/refunds.
- Receipt printing.
- Concurrency testing.

## Phase 7 --- Monitoring

- Owner dashboard.
- Area Manager dashboard.
- Store Manager dashboard.
- Staff dashboard.
- Cashier dashboard.
- Notification center.
- Reports.
- Exports.

## Phase 8 --- QA & Release

- Feature test.
- Integration test.
- Authorization test.
- Inventory consistency test.
- Security review.
- Performance review.
- Backup and restore test.
- Deployment documentation.

---

# 15. Akun Demo dan Data Uji

Siapkan akun demo berikut dengan password demo yang hanya digunakan di
lingkungan lokal/testing. Jangan memakai password contoh ini di
produksi.

Nama Email Role

---

Demo Owner owner@demo.test owner
Demo Area Manager area.manager@demo.test area_manager
Demo Store Manager store.manager@demo.test store_manager
Demo Staff staff@demo.test staff
Demo Cashier cashier@demo.test cashier

Data demo: - Area Jawa Timur. - Cabang Malang. - Cabang Surabaya. -
Cabang Pasuruan. - Gudang Pusat. - Gudang Malang. - Gudang Surabaya. -
Gudang Pasuruan. - Minimal 10 produk. - Minimal 2 POS register di salah
satu cabang. - Data transaksi dan stok dummy diberi label DEMO.

Penugasan: - Owner: global. - Area Manager: Area Jawa Timur. - Store
Manager: Cabang Malang. - Staff: Gudang Malang. - Cashier: POS Cabang
Malang.

Buat seeder yang idempotent agar dapat dijalankan ulang tanpa
menggandakan data. Jangan menyimpan password plaintext pada database.

---

# 16. Output yang Harus Dihasilkan AI Developer

Pada akhir setiap fase, hasilkan:

1.  Penjelasan arsitektur dan keputusan teknis.
2.  Daftar migration yang dibuat.
3.  Daftar model dan relasi Eloquent.
4.  Daftar controller, request, service, policy, dan middleware.
5.  Daftar route.
6.  Screenshot atau deskripsi UI yang dibuat.
7.  Test case dan hasil pengujian.
8.  Cara menjalankan migration dan seeder.
9.  Contoh request/response API jika ada.
10. Daftar risiko, asumsi, dan pekerjaan berikutnya.

Jangan hanya memberikan potongan kode. Integrasikan kode ke struktur
proyek yang benar, pastikan namespace, import, relasi, route, migration,
dan validasi konsisten.

---

# 17. Instruksi Mulai Pengerjaan

Mulai dari **Phase 1 --- Foundation & Authentication**.

Sebelum menulis kode:

1.  Periksa versi Laravel dan PHP.
2.  Periksa struktur folder proyek.
3.  Periksa migration dan tabel yang sudah ada.
4.  Periksa sistem authentication yang sudah digunakan.
5.  Identifikasi apakah database `toko_online` sudah memiliki data
    penting.
6.  Buat rencana perubahan yang tidak merusak data lama.
7.  Tampilkan rancangan tabel dan relasi Phase 1.
8.  Setelah rancangan jelas, implementasikan migration, model, seeder,
    middleware, Policy, dan test.
9.  Jalankan test dan perbaiki error.
10. Jangan lanjut Phase 2 sebelum Phase 1 lulus pengujian.

**Target akhir:** aplikasi retail multi-cabang yang aman, dapat
dimonitor Owner dan Area Manager, setiap cabang memiliki gudang sendiri,
mempunyai POS, memiliki alur persetujuan transfer, dan mengirim
notifikasi stok secara tepat kepada pihak yang bertanggung jawab.

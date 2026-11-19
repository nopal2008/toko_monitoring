# PANDUAN KASIR - STORE MONITORING SYSTEM

## Overview

Panduan ini menjelaskan fitur-fitur yang tersedia untuk kasir dalam sistem Store Monitoring System. Kasir dapat mengelola transaksi penjualan, membuka/menutup shift, mencetak struk, dan melihat laporan penjualan harian.

---

## 1. Login & Dashboard Kasir

### Akses Awal

1. Login dengan kredensial kasir
    - **Email**: `cashier@demo.test`
    - **Password**: `password`

2. Akan masuk ke **Dashboard Kasir** yang menampilkan:
    - Status shift kasir (aktif/tidak aktif)
    - Statistik penjualan hari ini
    - Daftar produk terlaris
    - Tombol cepat untuk membuka shift dan mulai transaksi

### Halaman Dashboard Kasir

**Route**: `/cashier`

Menu di sidebar akan menampilkan:

- 🏠 **Dashboard Kasir** - Halaman utama kasir dengan statistik
- 🛍️ **Kasir (POS)** - Interface transaksi penjualan
- 📄 **Riwayat Transaksi** - Histori penjualan

---

## 2. Buka & Tutup Shift

### Membuka Shift

1. Klik tombol **"Buka Shift"** di Dashboard Kasir
2. Sistem akan membuat shift baru dengan:
    - `opening_balance`: Saldo pembukaan kasir
    - `opened_at`: Waktu pembukaan shift

### Menutup Shift

1. Klik tombol **"Tutup Shift"** di Dashboard Kasir
2. Konfirmasi: "Tutup shift kasir? Pastikan saldo sudah sesuai."
3. Sistem akan mencatat:
    - `closing_balance`: Saldo penutupan
    - `closed_at`: Waktu penutupan shift

### Informasi Shift Aktif

Saat shift aktif, dashboard menampilkan:

- Nomor shift
- Waktu pembukaan
- Saldo pembukaan

---

## 3. Transaksi Penjualan (POS)

### Membuka POS

1. Dari Dashboard Kasir, klik **"Mulai Transaksi"**
2. Atau akses langsung melalui menu sidebar → **"Kasir (POS)"**

### Interface POS

Halaman POS (`/pos`) menampilkan:

#### Bagian Kiri: Daftar Produk

- **Search Bar**: Cari produk berdasarkan nama, SKU, atau barcode
- **Filter Kategori**: Filter produk berdasarkan kategori
- **Grid Produk**: Tampilan produk dengan foto, harga, dan stok
- **Barcode Scanner**: Scan barcode untuk menambah produk ke keranjang

#### Bagian Tengah: Keranjang

- **Daftar Item**: Produk yang akan dijual beserta quantity
- **Tombol -/+**: Kurangi/tambah quantity item
- **Total Calculation**: Real-time update total harga
- **Remove Item**: Hapus item dari keranjang (tombol Trash)

#### Bagian Kanan: Ringkasan & Checkout

- **Subtotal**: Total harga sebelum diskon & pajak
- **Discount**: Diskon manual atau otomatis dari promosi
- **Tax**: Pajak yang berlaku
- **Total**: Total pembayaran yang harus dibayar
- **Payment Methods**: Pilih metode pembayaran:
    - 💵 Tunai (Cash)
    - 💳 Kartu Debit (Debit)
    - 💳 Kartu Kredit (Credit)
    - 📱 QRIS
    - 🏪 E-Wallet
    - 🏦 Transfer
    - Lainnya

### Alur Transaksi Penjualan

#### Step 1: Tambah Produk ke Keranjang

**Opsi 1 - Klik Produk**

- Klik produk di grid
- Akan ditambah 1 ke keranjang

**Opsi 2 - Scan Barcode**

- Letakkan cursor di input scanner (otomatis focus saat halaman dibuka)
- Scan barcode produk
- Produk otomatis ditambah ke keranjang

**Opsi 3 - Search**

- Ketik nama/SKU/barcode di search bar
- Klik produk dari hasil search
- Ditambah ke keranjang

#### Step 2: Atur Quantity

- Klik `+` untuk tambah quantity
- Klik `-` untuk kurangi quantity
- Total akan terupdate otomatis

#### Step 3: Pilih Metode Pembayaran

1. Klik tombol **"Checkout"** atau scroll ke bawah
2. Pilih metode pembayaran dari 7 opsi tersedia
3. Untuk pembayaran split (lebih dari 1 metode):
    - Tambah row pembayaran baru dengan tombol "Tambah Metode"
    - Masukkan nominal untuk setiap metode

#### Step 4: Tentukan Nominal Pembayaran

- Input jumlah yang dibayarkan
- Sistem otomatis hitung kembalian (change)
- Jika pembayaran kurang, tampil error

#### Step 5: Cetak Struk (Optional)

- Centang **"Cetak Struk"** jika ingin langsung cetak
- Atau cetak nanti dari halaman Riwayat Transaksi

#### Step 6: Submit Transaksi

- Klik tombol **"Selesaikan Transaksi"**
- Transaksi akan disimpan
- Jika cetak struk, diarahkan ke halaman Receipt
- Jika tidak, diarahkan ke halaman detail transaksi

### Fitur Tambahan POS

#### Hold Transaksi (Tahan)

- Jika transaksi belum selesai, klik **"Tahan"**
- Beri label untuk transaksi (misal: nama pelanggan)
- Keranjang akan disimpan dan bisa diakses nanti
- Di sidebar "Transaksi Tertahan" tampil daftar hold

#### Resume dari Hold

- Klik transaksi tertahan dari list
- Keranjang akan di-load ulang
- Lanjutkan proses checkout

#### Diskon Manual

- Input nominal diskon di field "Diskon Manual"
- Otomatis terupdate total pembayaran

#### Promosi Otomatis

- Jika ada produk yang masuk kategori promosi:
    - Otomatis akan diberikan harga promosi
    - Diskon akan tampil di detail item

#### Multiple Store

- Jika kasir multi-store (area manager):
    - Pilih store di dropdown bagian atas
    - Produk akan di-filter sesuai store
    - Stok akan menunjukkan untuk store yang dipilih

---

## 4. Riwayat Transaksi

### Akses Riwayat

- Menu sidebar → **"Riwayat Transaksi"**
- Route: `/transactions`

### Daftar Transaksi

Menampilkan tabel dengan kolom:

- **Invoice Number**: Nomor struk
- **Tanggal**: Waktu transaksi dibuat
- **Kasir**: Nama kasir yang melayani
- **Total**: Jumlah pembayaran
- **Status**: Status transaksi (completed, cancelled, dll)
- **Aksi**: Tombol View dan Print

### Detail Transaksi

1. Klik tombol **"Lihat"** pada baris transaksi
2. Atau akses langsung: `/transactions/{id}`
3. Menampilkan:
    - Informasi transaksi (nomor struk, tanggal, total)
    - Daftar item yang dibeli
    - Metode pembayaran
    - Catatan transaksi
    - Tombol untuk cetak struk atau batalkan transaksi

### Cetak Struk

1. Dari halaman detail transaksi:
    - Klik tombol **"Cetak Struk"**
2. Atau dari halaman riwayat:
    - Klik ikon print di kolom Aksi

### Detail Struk yang Tercetak

Struk akan menampilkan:

```
========== [NAMA TOKO] ==========
Alamat, Kota
No. Telepon

Invoice: INV-2026-11-19-001
Tanggal: 19 Nov 2026, 14:30:45
Kasir: [Nama Kasir]

--- DETAIL PEMBELIAN ---
Produk      Qty  Harga    Subtotal
Indomie     2    5.000    10.000
Aqua 600ml  1    7.000    7.000

Subtotal:           17.000
Diskon:             (2.000)
Pajak (10%):        1.500
─────────────────────────
TOTAL:              16.500

--- PEMBAYARAN ---
Metode: Tunai
Dibayar: 20.000
Kembalian: 3.500

========== Terima Kasih ==========
[Footer Note dari Settings]
```

---

## 5. Dashboard Statistik Kasir

### Statistik Hari Ini

Dashboard Kasir menampilkan:

| Card                   | Keterangan                                 |
| ---------------------- | ------------------------------------------ |
| **Transaksi Hari Ini** | Jumlah transaksi yang sudah diproses       |
| **Total Penjualan**    | Total nilai penjualan dalam Rupiah         |
| **Total Diskon**       | Total diskon yang diberikan dalam Rupiah   |
| **Rata-rata**          | Rata-rata nilai transaksi (total / jumlah) |

### Produk Terlaris Hari Ini

Tabel 10 produk terlaris yang ditampilkan dengan:

- **Peringkat**: 1-10
- **Nama Produk**: Nama item yang terjual
- **Terjual**: Jumlah unit terjual (dalam pcs)
- **Total**: Total nilai penjualan produk tersebut

---

## 6. Fitur Tambahan untuk Kasir

### Laporan Penjualan (Reports)

Kasir bisa melihat laporan penjualan dengan:

- Filter tanggal (dari - sampai)
- Breakdown per kategori
- Breakdown per produk
- Perbandingan dengan periode sebelumnya

**Route**: `/reports/sales`

### Pengeluaran (Expenses)

Kasir bisa membuat laporan pengeluaran:

- Input nominal pengeluaran
- Pilih kategori pengeluaran
- Foto bukti (attachment)
- Submit untuk persetujuan manager

**Route**: `/expenses`

### Notifikasi Real-time

Notifikasi kasir untuk:

- ⚠️ Stok produk menipis
- ✅ Transaksi berhasil
- ❌ Error saat transaksi
- 💬 Pesan dari manager

**Route**: `/notifications`

---

## 7. Keyboard Shortcuts & Tips

### Shortcuts

| Shortcut         | Aksi                               |
| ---------------- | ---------------------------------- |
| **Tab**          | Focus ke input scanner             |
| **Enter** (scan) | Scan barcode & tambah ke keranjang |
| **+**            | Tambah quantity item terpilih      |
| **-**            | Kurangi quantity item terpilih     |
| **Delete**       | Hapus item dari keranjang          |
| **Ctrl + P**     | Print struk                        |

### Tips Efisien

1. **Scan Barcode**: Lebih cepat daripada cari manual
2. **Hold Transaksi**: Gunakan untuk jeda / tunggu pelanggan
3. **Quick Search**: Ketik huruf pertama nama produk
4. **Multi-store**: Pastikan store sudah benar sebelum checkout
5. **Cetak Struk**: Langsung saat checkout untuk efisiensi

---

## 8. Troubleshooting

### Masalah: Shift tidak bisa dibuka

**Solusi**:

- Logout dan login ulang
- Pastikan sudah ada shift yang ditutup sebelumnya
- Hubungi manager jika masih error

### Masalah: Produk tidak muncul di POS

**Solusi**:

- Pastikan produk sudah diaktifkan (`is_active = 1`)
- Pastikan produk sudah ditambahkan ke store
- Cek kategori produk di filter kategori

### Masalah: Barcode scanner tidak berfungsi

**Solusi**:

- Klik di input scanner untuk focus
- Pastikan scanner sudah connected
- Try scan produk lain untuk test
- Hubungi IT jika scanner rusak

### Masalah: Struk tidak bisa dicetak

**Solusi**:

- Pastikan printer sudah connected
- Check setting printer di komputer
- Try print dari halaman detail transaksi
- Hubungi IT jika printer error

### Masalah: Kembalian salah hitung

**Solusi**:

- Check kembali nominal yang dibayarkan
- Pastikan metode pembayaran benar
- Refresh halaman dan try ulang
- Hubungi manager untuk revisi

---

## 9. Permintaan Support

Jika ada masalah atau pertanyaan, hubungi:

- **Manager Toko**: Untuk issue transaksi
- **Admin System**: Untuk issue teknis
- **Help Desk**: Email support atau WhatsApp

---

**Versi Dokumen**: 1.0  
**Terakhir Update**: 19 November 2026  
**Status**: Aktif

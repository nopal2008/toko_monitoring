# Panduan API Postman

Dokumentasi ini mencakup semua route API yang terdaftar pada `routes/api.php`.

## Persiapan

- Jalankan aplikasi, misalnya dengan `php artisan serve`.
- Base URL lokal: `http://127.0.0.1:8000/api/v1`. URL ini hanya prefix; mengirim request ke `/api/v1` tanpa endpoint akan menghasilkan `404 Not Found`.
- Buat akun demo dengan `php artisan db:seed --class=DemoDatabaseSeeder` setelah skema database lengkap tersedia.
- Header untuk request JSON:

```http
Accept: application/json
Content-Type: application/json
```

Jika seeder akun berhasil dijalankan, gunakan akun owner berikut untuk endpoint supplier:

```text
Email: owner@demo.test
Password: password
```

Seeder juga membuat akun untuk tiap role berikut. Semua akun demo memakai password `password`:

| Role | Email |
|---|---|
| `owner` | `owner@demo.test` |
| `area_manager` | `area.manager@demo.test` |
| `store_manager` | `store.manager@demo.test` |
| `cashier` | `cashier@demo.test` |
| `staff` | `staff@demo.test` |

Endpoint supplier hanya menerima role `owner` atau `admin`, permission `product.manage`, tenant aktif, dan token ability `suppliers:manage`. Seeder saat ini menyediakan role `owner`; role `admin` sudah tidak dibuat oleh seeder.

## Frontend

UI utama aplikasi menggunakan Inertia dan React melalui konfigurasi Vite di root proyek. Folder `frontend/` berisi kode frontend mandiri tahap eksperimen dan belum memiliki perintah npm tersendiri yang siap dijalankan.

## Login dan autentikasi

### 1. Login — `POST http://127.0.0.1:8000/api/v1/login`

Jangan kirim request ke base URL saja (`http://127.0.0.1:8000/api/v1`); gunakan path `/login` dan method `POST`.

Di Postman pilih **Body → raw → JSON**:

```json
{
  "email": "owner@demo.test",
  "password": "password",
  "device_name": "Postman"
}
```

`device_name` boleh dihilangkan. Login berhasil mengembalikan HTTP `201 Created`:

```json
{
  "data": {
    "token": "<TOKEN_DARI_RESPONSE>",
    "token_type": "Bearer",
    "expires_at": "2026-11-16T08:00:00.000000Z",
    "user": {
      "id": 1,
      "name": "Demo Owner",
      "email": "owner@demo.test"
    }
  }
}
```

Salin nilai `data.token`. Token berlaku selama 2 jam.

### Memakai token

Untuk semua endpoint yang membutuhkan login, pilih tab **Authorization → Bearer Token** dan masukkan token tersebut. Atau kirim header:

```http
Authorization: Bearer <TOKEN_DARI_RESPONSE>
```

### 2. Cek pengguna login — `GET /user`

Tidak perlu body. Contoh response `200 OK`:

```json
{
  "data": {
    "id": 1,
    "name": "Demo Owner",
    "email": "owner@demo.test"
  }
}
```

### 3. Logout — `POST /logout`

Kirim token Bearer. Tidak perlu body. Berhasil mengembalikan HTTP `204 No Content` dan mencabut token yang sedang digunakan.

## API Supplier

Semua endpoint berikut memerlukan token Bearer dengan role, permission, tenant, dan ability yang disebutkan di bagian persiapan. Data supplier dibatasi ke tenant pengguna.

### 4. Daftar supplier — `GET /suppliers`

Contoh URL:

```text
GET http://127.0.0.1:8000/api/v1/suppliers?per_page=10&page=1
```

`per_page` opsional, default `10`, dibatasi antara `1` dan `100`. Response berisi array `data` serta metadata pagination (`links` dan `meta`).

### 5. Detail supplier — `GET /suppliers/{id}`

Contoh:

```text
GET http://127.0.0.1:8000/api/v1/suppliers/1
```

Contoh response `200 OK`:

```json
{
  "data": {
    "id": 1,
    "name": "PT Contoh Pemasok",
    "phone": "081234567890",
    "email": "kontak@contoh.test",
    "address": "Jl. Contoh No. 1",
    "is_active": true,
    "created_at": "2026-11-16T06:00:00.000000Z",
    "updated_at": "2026-11-16T06:00:00.000000Z"
  }
}
```

### 6. Tambah supplier — `POST /suppliers`

Pilih **Body → raw → JSON**:

```json
{
  "name": "PT Pemasok Baru",
  "phone": "081234567890",
  "email": "sales@pemasok.test",
  "address": "Jl. Pemasok No. 10",
  "is_active": true
}
```

`name` wajib diisi. Field `phone`, `email`, `address`, dan `is_active` opsional. `tenant_id` tidak perlu dikirim; server memakai tenant dari akun login. Berhasil mengembalikan HTTP `201 Created` dengan objek supplier di dalam `data`.

### 7. Ubah supplier — `PUT /suppliers/{id}` atau `PATCH /suppliers/{id}`

Contoh:

```text
PATCH http://127.0.0.1:8000/api/v1/suppliers/1
```

Body JSON memakai field yang sama dengan tambah supplier. `name` tetap wajib, termasuk untuk `PATCH`.

```json
{
  "name": "PT Pemasok Diperbarui",
  "phone": "081111111111",
  "email": "baru@pemasok.test",
  "address": "Alamat baru",
  "is_active": true
}
```

Berhasil mengembalikan HTTP `200 OK` dengan supplier yang diperbarui di dalam `data`.

### 8. Hapus supplier — `DELETE /suppliers/{id}`

Contoh:

```text
DELETE http://127.0.0.1:8000/api/v1/suppliers/1
```

Tidak perlu body. Penghapusan menggunakan soft delete dan berhasil mengembalikan HTTP `204 No Content`.

## Status error umum

- `401 Unauthorized`: token tidak ada/tidak valid, atau email dan password login salah.
- `403 Forbidden`: akun tidak aktif/tidak memiliki tenant aktif, atau role, permission, maupun token ability tidak memenuhi syarat.
- `404 Not Found`: supplier tidak ditemukan atau berada di tenant lain.
- `422 Unprocessable Entity`: validasi body gagal; response berisi `message` dan rincian `errors`.

## Ringkasan route

| Method | Path | Keterangan |
|---|---|---|
| `POST` | `/api/v1/login` | Membuat token |
| `GET` | `/api/v1/user` | Melihat pengguna dari token |
| `POST` | `/api/v1/logout` | Mencabut token saat ini |
| `GET` | `/api/v1/suppliers` | Daftar supplier |
| `GET` | `/api/v1/suppliers/{id}` | Detail supplier |
| `POST` | `/api/v1/suppliers` | Membuat supplier |
| `PUT`, `PATCH` | `/api/v1/suppliers/{id}` | Memperbarui supplier |
| `DELETE` | `/api/v1/suppliers/{id}` | Soft delete supplier |

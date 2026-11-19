# API Supplier — Tes Postman

API JSON Supplier untuk tes Postman sudah tersedia di `/api/v1`. Import collection [Supplier_API.postman_collection.json](./Supplier_API.postman_collection.json) melalui **Postman → Import**; collection berisi request berurutan dan assertion status/JSON.

## Persiapan

1. Pastikan aplikasi dan database lokal berjalan. Pada database baru, jalankan migrasi dan seeder role:

    ```powershell
    php artisan migrate --seed
    ```

    Jika database sudah dibuat dari dump SQL yang memiliki tabel aplikasi, jangan jalankan migrasi di atas dump tersebut sebelum riwayat migrasinya diselaraskan.

2. Pastikan akun uji memiliki tenant aktif. Untuk akses semua endpoint supplier, akun harus memiliki role `owner` atau `admin` **dan** permission `product.manage`.
3. Buat environment Postman dan isi:

    | Variable                                | Isi                                                     |
    | --------------------------------------- | ------------------------------------------------------- |
    | `base_url`                              | Alamat aplikasi lokal, misalnya `http://127.0.0.1:8000` |
    | `email` / `password`                    | Kredensial akun uji `owner` atau `admin`                |
    | `cashier_email` / `cashier_password`    | Kredensial akun uji role `cashier`                      |
    | `token`, `cashier_token`, `supplier_id` | Biarkan kosong; request collection mengisinya           |

    Pilih environment itu sebelum menjalankan collection. Tandai password dan token sebagai **sensitive**. Gunakan akun/database lokal, bukan kredensial produksi.

4. Jalankan collection berurutan dengan **Run collection**. Login owner membuat token Sanctum yang berlaku **2 jam**; logout di akhir mencabut token tersebut.

## Endpoint yang dites

Semua request Supplier memakai header `Authorization: Bearer <token>`. Request API tidak memakai cookie sesi atau CSRF.

| Method                                                                                                      | Path                     | Sukses | Fungsi                                    |
| ----------------------------------------------------------------------------------------------------------- | ------------------------ | -----: | ----------------------------------------- |
| `POST`                                                                                                      | `/api/v1/login`          |  `201` | Login dan menerbitkan Bearer Token        |
| `GET`                                                                                                       | `/api/v1/user`           |  `200` | Memastikan token aktif                    |
| `GET`                                                                                                       | `/api/v1/suppliers`      |  `200` | Daftar supplier; mendukung `?per_page=10` |
| `GET`                                                                                                       | `/api/v1/suppliers/{id}` |  `200` | Deta                                      |
| Simpan `data.token` sebagai Bearer Token. Respons hanya menampilkan token plaintext saat token diterbitkan. |

### POST supplier

```json
{
    "name": "Supplier Uji",
    "phone": "081234567890",
    "email": "supplier@example.test",
    "address": "Alamat uji",
    "is_active": true
}
```

`name` wajib. `phone`, `email`, `address`, dan `is_active` opsional. `email` harus valid jika diisi. Collection menyimpan ID dari respons POST ke `supplier_id` untuk tes detail, update, dan delete.

## Pemeriksaan keamanan

| Kondisi                                                    |                                     Hasil yang diharapkan |
| ---------------------------------------------------------- | --------------------------------------------------------: |
| Bearer token tidak ada atau salah                          |                                                     `401` |
| Kredensial login salah                                     |                                                     `401` |
| Akun tidak aktif atau tenant tidak aktif                   |                                                     `403` |
| Role selain `owner`/`admin` (contoh `cashier`)             |                                                     `403` |
| Role `owner`/`admin` tanpa `product.manage`                |                                                     `403` |
| Token tidak memiliki ability `suppliers:manage`            |                                                     `403` |
| ID supplier dari tenant lain atau supplier yang diarsipkan |                                                     `404` |
| Input tidak valid, misalnya email salah                    |                              `422`, berisi objek `errors` |
| POST/PATCH menyertakan `tenant_id` asing                   | `tenant_id` diabaikan; tenant tetap ditentukan dari token |

Collection mencoba `tenant_id: 999999` saat POST dan PATCH, lalu memastikan API tidak menampilkan field tenant. Untuk memverifikasi data tersimpan di database, periksa `tenant_id` supplier tersebut melalui database client; nilainya harus sama dengan tenant pemilik token.

Untuk tes lintas-tenant manual, login sebagai owner tenant A, lalu GET ID supplier milik tenant B memakai token tenant A:

```http
GET {{base_url}}/api/v1/suppliers/{{id_supplier_tenant_b}}
Authorization: Bearer {{token_tenant_a}}
Accept: application/json
```

Hasilnya harus `404`, bukan `403`, agar API tidak membocorkan keberadaan data tenant lain.

## Yang diverifikasi otomatis

Tes feature Laravel meliputi login, penerbitan dan pencabutan token, GET daftar/detail, POST, PATCH, DELETE, validasi, permission/role, ability token, mass assignment `tenant_id`, dan isolasi tenant:

```powershell
php artisan test --compact tests/Feature/SupplierApiTest.php
```

# Enterprise Microservices

Proyek UTS implementasi arsitektur microservices untuk aplikasi e-commerce. Repository ini terdiri dari Product Service, Cart Service, Review Service, dan Order Service yang berkomunikasi melalui HTTP API.

## Arsitektur

Setiap service memiliki tanggung jawab dan database masing-masing.

| Service | Teknologi | Port |
|---|---|---:|
| Product Service | Node.js, Express, MySQL | 3000 |
| Cart Service | Laravel, PostgreSQL | 3001 |
| Review Service | Python, Flask, MongoDB | 3002 |
| Order Service | Laravel, MySQL | 3003 |

### Alur komunikasi Order Service

1. Client mengirim permintaan checkout ke Order Service.
2. Order Service mengambil cart pengguna dari Cart Service.
3. Order Service mengambil detail produk dari Product Service.
4. Order Service memvalidasi produk dan ketersediaan stok.
5. Order Service menyimpan order dan item order dalam transaksi database.
6. Nama dan harga produk disimpan sebagai snapshot pada item order.
7. Setelah order berhasil disimpan, Order Service meminta Cart Service mengosongkan cart.

Order Service tidak membaca database milik service lain secara langsung. Komunikasi antarlayanan dilakukan melalui HTTP API.

## Struktur Repository

- `product-service/` — Product Service
- `cart-service/` — Cart Service
- `review-service/` — Review Service
- `order-service/` — Order Service
- `ecommerce-ui/` — direktori aplikasi UI
- `docker-compose.yml` — konfigurasi layanan dan database

## Prasyarat

- Git
- Docker Engine
- Docker Compose plugin

Docker harus berjalan sebelum menjalankan perintah Compose.

## Menjalankan Seluruh Layanan

Clone repository:

```bash
git clone https://github.com/satzcd/enterprise001.git
cd enterprise001
```

Pastikan port yang digunakan tidak sedang dipakai aplikasi lain: `3000`, `3001`, `3002`, `3003`, dan `5432`.

Build dan jalankan seluruh layanan:

```bash
docker compose up --build -d
```

Periksa status container:

```bash
docker compose ps
```

Lihat log seluruh layanan:

```bash
docker compose logs -f
```

Lihat log Order Service:

```bash
docker compose logs -f order-service
```

Hentikan container tanpa menghapus data database:

```bash
docker compose down
```

**Penting:** Jangan gunakan `docker compose down -v` karena perintah tersebut dapat menghapus volume database.

## Order Service API

Base URL:

```text
http://localhost:3003
```

| Method | Endpoint | Keterangan |
|---|---|---|
| GET | `/health` | Health check |
| POST | `/orders` | Membuat pesanan dari cart pengguna |
| GET | `/orders/{id}` | Mengambil detail pesanan |
| GET | `/orders/user/{userId}` | Mengambil daftar pesanan pengguna |
| PATCH | `/orders/{id}/pay` | Mengubah status pesanan menjadi PAID |

Daftar pesanan mendukung filter status:

```text
GET /orders/user/1?status=PENDING
GET /orders/user/1?status=PAID
```

Status pesanan yang digunakan adalah `PENDING` dan `PAID`.

### Contoh Request

Health check:

```bash
curl -i http://localhost:3003/health
```

Membuat pesanan:

```bash
curl -i -X POST http://localhost:3003/orders \
  -H "Content-Type: application/json" \
  -d '{"user_id":10002}'
```

Mengambil detail pesanan:

```bash
curl -i http://localhost:3003/orders/1
```

Mengambil daftar pesanan pengguna:

```bash
curl -i http://localhost:3003/orders/user/10002
```

Mengambil daftar pesanan berdasarkan status:

```bash
curl -i "http://localhost:3003/orders/user/10002?status=PENDING"
```

Memproses pembayaran:

```bash
curl -i -X PATCH http://localhost:3003/orders/1/pay
```

### Contoh Skenario Error

Request tanpa `user_id` untuk menguji validasi:

```bash
curl -i -X POST http://localhost:3003/orders \
  -H "Content-Type: application/json" \
  -d '{}'
```

Mengambil order yang tidak tersedia:

```bash
curl -i http://localhost:3003/orders/999999
```

Menguji filter status tidak valid:

```bash
curl -i "http://localhost:3003/orders/user/10002?status=INVALID"
```

Membayar order yang sudah berstatus `PAID` dapat digunakan untuk menguji konflik pembayaran berulang.

## Integrasi Antarservice

Order Service menggunakan konfigurasi URL berikut:

| Environment Variable | Nilai pada Docker Compose |
|---|---|
| `CART_SERVICE_URL` | `http://cart-service:3001` |
| `PRODUCT_SERVICE_URL` | `http://product-service:3000` |

Order Service menggunakan Cart Service untuk mengambil dan mengosongkan cart. Product Service digunakan untuk mengambil informasi produk, termasuk nama, harga, dan stok.

## Database dan Penyimpanan Data

Order Service menggunakan MySQL dengan database `orderdb`.

Data pesanan dan item pesanan disimpan pada database milik Order Service. Informasi nama dan harga produk disimpan sebagai snapshot agar detail pesanan tidak berubah ketika data produk di Product Service berubah.

Penyimpanan order dan item order menggunakan transaksi database.

Setiap service memiliki volume database masing-masing pada konfigurasi Docker Compose. Pertahankan volume tersebut ketika melakukan restart atau pembaruan layanan.

## Konfigurasi Environment

Order Service menyediakan template konfigurasi di:

```text
order-service/.env.example
```

Variabel penting:

- `APP_ENV` — lingkungan aplikasi.
- `APP_DEBUG` — mengatur detail debug.
- `APP_KEY` — application key Laravel.
- `LOG_CHANNEL` — tujuan logging.
- `DB_CONNECTION` — driver database.
- `DB_HOST` — host database.
- `DB_PORT` — port database.
- `DB_DATABASE` — nama database.
- `DB_USERNAME` — username database.
- `DB_PASSWORD` — password database.
- `CART_SERVICE_URL` — URL Cart Service.
- `PRODUCT_SERVICE_URL` — URL Product Service.

Untuk pengembangan lokal, sesuaikan konfigurasi dengan lingkungan masing-masing. Jangan commit file `.env`, password pribadi, API key, atau kredensial rahasia. Nonaktifkan debug pada deployment production.

## Pengujian

Pengujian Order Service dapat dijalankan dari root repository:

```bash
docker compose exec order-service php artisan test
```

Atau dari direktori `order-service` jika PHP dan Composer tersedia secara lokal:

```bash
php artisan test
```

Pengujian manual API dapat dilakukan menggunakan curl, Postman, atau Insomnia.

## Keputusan Desain dan Batasan

- Setiap microservice memiliki database sendiri.
- Komunikasi antarservice dilakukan melalui HTTP API.
- Order Service menggunakan lapisan client untuk komunikasi dengan Cart Service dan Product Service.
- Data nama dan harga produk disimpan sebagai snapshot item order.
- Checkout menggunakan transaksi database agar penyimpanan order dan item order konsisten.
- Kegagalan komunikasi dengan service dependency ditangani sebagai kegagalan dependency.
- Proyek ini tidak mencakup autentikasi, pembayaran nyata, pengurangan stok, pembatalan pesanan, atau message broker.

## Video Demo UTS

Tautan video demo:

**[ISI DENGAN TAUTAN VIDEO YANG SUDAH DIUNGGAH]**

Timestamp demo:

- 00:00 — Pembukaan dan pengenalan proyek
- [MM:SS] — Arsitektur microservices
- [MM:SS] — Menjalankan project menggunakan Docker Compose
- [MM:SS] — Health check dan endpoint Order Service
- [MM:SS] — Checkout berhasil
- [MM:SS] — Validasi request dan cart kosong
- [MM:SS] — Stok tidak mencukupi
- [MM:SS] — Product Service tidak tersedia dan log Order Service
- [MM:SS] — Snapshot harga produk
- [MM:SS] — Pembayaran dan penanganan error
- [MM:SS] — Penutup

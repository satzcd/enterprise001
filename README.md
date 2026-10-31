# Enterprise Microservices

Proyek UTS implementasi arsitektur microservices untuk aplikasi e-commerce. Repository ini terdiri dari Product Service, Cart Service, Review Service, dan Order Service yang berkomunikasi melalui HTTP API.

## Arsitektur

Setiap service memiliki tanggung jawab dan database masing-masing.

| Service | Teknologi | Database | Port |
|---|---|---|---:|
| Product Service | Node.js, Express | MySQL | 3000 |
| Cart Service | Laravel | PostgreSQL | 3001 |
| Review Service | Python, Flask | MongoDB | 3002 |
| Order Service | Laravel | MySQL | 3003 |

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

- `product-service/` — Product Service.
- `cart-service/` — Cart Service.
- `review-service/` — Review Service.
- `order-service/` — Order Service.
- `ecommerce-ui/` — Direktori aplikasi UI.
- `docker-compose.yml` — Konfigurasi layanan dan database.

## Prasyarat

- Git.
- Docker Engine.
- Docker Compose plugin.

Docker harus berjalan sebelum menjalankan perintah Compose.

## Menjalankan Seluruh Layanan

### 1. Clone repository

```bash
git clone https://github.com/satzcd/enterprise001.git
cd enterprise001
```

### 2. Persiapan environment

Cart Service Laravel membutuhkan `APP_KEY`. Buat key baru menggunakan Docker tanpa perlu memasang PHP secara lokal.

```bash
printf 'CART_APP_KEY=%s\n' \
  "$(docker run --rm php:8.4-cli -r 'echo "base64:".base64_encode(random_bytes(32));')" > .env
```

Perintah tersebut membuat file `.env` di direktori utama repository.

Pastikan file `.env` tidak di-commit ke GitHub karena berisi konfigurasi lokal dan application key.

### 3. Jalankan seluruh layanan

```bash
docker compose up --build -d
```

Perintah tersebut membangun image dan menjalankan seluruh service beserta database masing-masing.

### 4. Periksa status container

```bash
docker compose ps
```

Pastikan seluruh container berjalan dan database sudah berstatus `healthy`.

### 5. Lihat log

Seluruh service:

```bash
docker compose logs -f
```

Khusus Order Service:

```bash
docker compose logs -f order-service
```

### 6. Menghentikan dan menjalankan kembali layanan

Menghentikan container tanpa menghapus data:

```bash
docker compose stop
```

Menjalankan kembali:

```bash
docker compose start
```

Untuk mempertahankan data database, jangan gunakan `docker compose down -v`.

## Order Service API

Base URL:

```text
http://localhost:3003
```

### Daftar Endpoint

| Method | Endpoint | Keterangan |
|---|---|---|
| GET | `/health` | Health check |
| POST | `/orders` | Membuat pesanan dari cart pengguna |
| GET | `/orders/{id}` | Mengambil detail pesanan |
| GET | `/orders/user/{userId}` | Mengambil daftar pesanan pengguna |
| PATCH | `/orders/{id}/pay` | Mengubah status pesanan menjadi PAID |

Daftar pesanan mendukung filter status:

```text
GET /orders/user/10002?status=PENDING
GET /orders/user/10002?status=PAID
```

Status pesanan yang digunakan:

- `PENDING`
- `PAID`

### Contoh Request

Semua contoh menggunakan `curl` dan dapat dijalankan melalui Git Bash.

**Health check**

```bash
curl -i http://localhost:3003/health
```

**Membuat pesanan**

Order dibuat berdasarkan cart pengguna. Cart harus sudah berisi produk.

```bash
curl -i -X POST http://localhost:3003/orders \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -d '{"user_id":10002}'
```

**Mengambil detail pesanan**

```bash
curl -i http://localhost:3003/orders/1
```

**Mengambil daftar pesanan pengguna**

```bash
curl -i http://localhost:3003/orders/user/10002
```

**Mengambil daftar pesanan berdasarkan status**

```bash
curl -i "http://localhost:3003/orders/user/10002?status=PENDING"
```

**Memproses pembayaran**

```bash
curl -i -X PATCH http://localhost:3003/orders/1/pay \
  -H "Accept: application/json"
```

Pembayaran hanya mengubah status pesanan dari `PENDING` menjadi `PAID`. Integrasi pembayaran nyata tidak termasuk dalam cakupan proyek.

## Validasi dan Penanganan Error

Order Service menggunakan HTTP status code berikut:

| HTTP Status | Kondisi |
|---|---|
| 200 | Request berhasil |
| 201 | Order berhasil dibuat |
| 404 | Order atau resource tidak ditemukan |
| 409 | Cart kosong, produk tidak tersedia, stok tidak cukup, atau konflik status |
| 422 | Validasi request gagal |
| 503 | Cart Service atau Product Service tidak tersedia |
| 500 | Kesalahan internal yang tidak terduga |

### Contoh Skenario Error

**1. Request tanpa user_id**

```bash
curl -i -X POST http://localhost:3003/orders \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -d '{}'
```

Hasil yang diharapkan: `422 Unprocessable Content`.

**2. Mengambil order yang tidak tersedia**

```bash
curl -i http://localhost:3003/orders/999999
```

Hasil yang diharapkan: `404 Not Found`.

**3. Filter status tidak valid**

```bash
curl -i "http://localhost:3003/orders/user/10002?status=INVALID" \
  -H "Accept: application/json"
```

Hasil yang diharapkan: `422 Unprocessable Content`.

**4. Cart kosong**

Checkout menggunakan user yang belum memiliki item cart.

```bash
curl -i -X POST http://localhost:3003/orders \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -d '{"user_id":10003}'
```

Hasil yang diharapkan: `409 Conflict`.

**5. Stok tidak mencukupi**

Masukkan jumlah produk ke cart melebihi stok yang tersedia, kemudian lakukan checkout.

Hasil yang diharapkan: `409 Conflict`.

**6. Dependency service tidak tersedia**

Jika Cart Service atau Product Service tidak dapat diakses ketika checkout, Order Service mengembalikan:

```text
503 Service Unavailable
```

Detail kegagalan dicatat melalui logging Order Service.

## Integrasi Antarservice

Order Service menggunakan konfigurasi URL berikut:

| Environment Variable | Nilai pada Docker Compose |
|---|---|
| `CART_SERVICE_URL` | `http://cart-service:3001` |
| `PRODUCT_SERVICE_URL` | `http://product-service:3000` |

Cart Service digunakan untuk:

- Mengambil item cart berdasarkan user ID.
- Mengosongkan cart setelah order berhasil disimpan.

Product Service digunakan untuk:

- Mengambil detail produk.
- Memeriksa keberadaan produk.
- Mengambil nama, harga, dan stok produk.

Semua komunikasi dilakukan melalui HTTP API dan tidak mengakses database service lain secara langsung.

## Database dan Penyimpanan Data

Order Service menggunakan MySQL dengan database `orderdb`.

Tabel utama:

**orders**

- `id`
- `user_id`
- `status`
- `total_amount`
- `created_at`
- `updated_at`

**order_items**

- `id`
- `order_id`
- `product_id`
- `product_name`
- `unit_price`
- `quantity`
- `subtotal`

Nama dan harga produk disimpan sebagai snapshot pada item order. Dengan demikian, informasi pesanan tetap mencerminkan data ketika order dibuat, meskipun informasi produk berubah kemudian.

Penyimpanan order dan item order menggunakan transaksi database agar data pesanan konsisten.

Setiap service memiliki volume database masing-masing pada konfigurasi Docker Compose. Pertahankan volume tersebut ketika melakukan restart atau pembaruan layanan.

## Konfigurasi Environment

Order Service menyediakan template konfigurasi di:

```text
order-service/.env.example
```

Cart Service menyediakan template konfigurasi di:

```text
cart-service/.env.example
```

Product Service dan Review Service juga memiliki template konfigurasi masing-masing.

Variabel penting untuk Order Service:

| Variabel | Keterangan |
|---|---|
| `APP_ENV` | Lingkungan aplikasi |
| `APP_DEBUG` | Mengatur detail debug |
| `APP_KEY` | Application key Laravel |
| `LOG_CHANNEL` | Tujuan logging |
| `DB_CONNECTION` | Driver database |
| `DB_HOST` | Host database |
| `DB_PORT` | Port database |
| `DB_DATABASE` | Nama database |
| `DB_USERNAME` | Username database |
| `DB_PASSWORD` | Password database |
| `CART_SERVICE_URL` | URL Cart Service |
| `PRODUCT_SERVICE_URL` | URL Product Service |

Pada konfigurasi root Docker Compose, Cart Service menerima `CART_APP_KEY` dari file `.env` di direktori utama repository.

Jangan commit file `.env`, password, API key, application key, atau kredensial rahasia. Nonaktifkan debug pada deployment production.

## Pengujian

Pengujian otomatis Order Service menggunakan PHPUnit dan Laravel testing.

Untuk menjalankan pengujian secara lokal, masuk ke direktori Order Service:

```bash
cd order-service
composer install
php artisan test
```

Pengujian juga dapat dijalankan dari root repository jika PHP dan Composer tersedia:

```bash
php artisan test
```

Image Docker menggunakan instalasi production tanpa development dependencies. Karena itu, PHPUnit tidak tersedia secara default di container Order Service.

Pengujian manual API dapat dilakukan menggunakan `curl`, Postman, atau Insomnia.

## Keputusan Desain dan Batasan

- Setiap microservice memiliki database sendiri.
- Komunikasi antarlayanan dilakukan melalui HTTP API.
- Order Service menggunakan lapisan client untuk komunikasi dengan Cart Service dan Product Service.
- Controller bertanggung jawab menangani HTTP request dan response.
- Business logic checkout ditempatkan pada service layer.
- Data nama dan harga produk disimpan sebagai snapshot item order.
- Checkout menggunakan transaksi database agar penyimpanan order dan item order konsisten.
- Kegagalan komunikasi dengan service dependency ditangani sebagai kegagalan dependency.
- Cart dikosongkan setelah order berhasil disimpan.
- Jika pengosongan cart gagal setelah order tersimpan, order tetap dipertahankan dan kegagalan dicatat melalui log.

Batasan proyek:

- Tidak mencakup autentikasi.
- Tidak mencakup pembayaran nyata.
- Tidak melakukan pengurangan stok produk.
- Tidak mencakup pembatalan pesanan.
- Tidak menggunakan message broker.

## Video Demo UTS

Tautan video demo:

**[ISI DENGAN TAUTAN VIDEO YANG SUDAH DIUNGGAH]**

Timestamp demo:

- 00:00 — Pembukaan dan pengenalan proyek.
- [MM:SS] — Arsitektur microservices.
- [MM:SS] — Menjalankan project menggunakan Docker Compose dari fresh clone.
- [MM:SS] — Health check dan endpoint Order Service.
- [MM:SS] — Checkout berhasil.
- [MM:SS] — Validasi request tanpa user_id.
- [MM:SS] — Cart kosong.
- [MM:SS] — Stok tidak mencukupi.
- [MM:SS] — Product Service tidak tersedia dan log Order Service.
- [MM:SS] — Snapshot harga produk.
- [MM:SS] — Pembayaran dan penanganan error.
- [MM:SS] — Penutup.

## Repository

GitHub:

https://github.com/satzcd/enterprise001
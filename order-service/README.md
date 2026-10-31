# Order Service

Order Service merupakan layanan backend untuk mengelola pesanan pada proyek UTS Microservices. Service dibangun menggunakan Laravel dan MySQL serta berkomunikasi dengan Cart Service dan Product Service melalui HTTP API.

## Teknologi

- Laravel 13
- PHP 8.3+
- MySQL
- Laravel HTTP Client
- PHPUnit

## Tanggung Jawab

- Membuat pesanan berdasarkan isi cart pengguna.
- Mengambil informasi produk dari Product Service.
- Menyimpan snapshot nama produk dan harga pada item pesanan.
- Mengelola status pesanan.
- Memproses pembayaran pesanan.
- Menyediakan informasi pesanan berdasarkan ID maupun user.

## API

Base URL lokal: `http://localhost:3003`

| Method | Endpoint | Keterangan |
|---|---|---|
| GET | `/health` | Health check |
| POST | `/orders` | Membuat pesanan |
| GET | `/orders/{id}` | Detail pesanan |
| GET | `/orders/user/{userId}` | Daftar pesanan pengguna |
| PATCH | `/orders/{id}/pay` | Membayar pesanan |

### Filter daftar pesanan

Endpoint daftar pesanan pengguna mendukung query parameter `status`.

Contoh:

`GET /orders/user/1?status=PENDING`

Status pesanan:
- `PENDING`
- `PAID`

## Integrasi Antarservice

### Cart Service

Order Service mengambil cart pengguna dan meminta Cart Service mengosongkan cart setelah checkout berhasil.

Konfigurasi URL:

`CART_SERVICE_URL=http://cart-service:3001`

### Product Service

Order Service mengambil informasi produk untuk memvalidasi produk dan memperoleh informasi harga serta nama produk.

Konfigurasi URL:

`PRODUCT_SERVICE_URL=http://product-service:3000`

Komunikasi antarservice menggunakan HTTP client dengan timeout agar permintaan tidak menunggu tanpa batas.

## Alur Checkout

1. Client mengirim `POST /orders` dengan identitas pengguna.
2. Order Service mengambil item cart dari Cart Service.
3. Order Service mengambil detail setiap produk dari Product Service.
4. Order Service memvalidasi data produk dan menghitung subtotal serta total pesanan.
5. Order dan item pesanan disimpan menggunakan transaksi database.
6. Nama dan harga produk disimpan sebagai snapshot pada item pesanan.
7. Setelah transaksi berhasil, Order Service meminta Cart Service menghapus cart pengguna.

Jika terjadi kegagalan pada proses checkout, transaksi database dibatalkan. Kegagalan pengosongan cart setelah pesanan tersimpan dicatat melalui logging.

## Pembayaran

Endpoint: `PATCH /orders/{id}/pay`

Pembayaran mengubah status pesanan dari `PENDING` menjadi `PAID`.

Pesanan yang tidak ditemukan menghasilkan respons not found. Pesanan yang sudah dibayar tidak dapat diproses kembali.

## Penanganan Error

Service menangani kondisi seperti:
- Request tidak valid.
- Pesanan tidak ditemukan.
- Konflik proses bisnis, termasuk pembayaran berulang.
- Cart atau Product Service tidak tersedia.
- Kegagalan komunikasi antarservice.

Error konflik proses bisnis menggunakan HTTP `409`, sedangkan kegagalan ketergantungan service menggunakan HTTP `503`.

Informasi debug tambahan dikendalikan oleh konfigurasi `APP_DEBUG`. Jangan mengaktifkan debug pada deployment production.

## Menjalankan Secara Lokal

Dari direktori `order-service`:

```bash
composer install
cp .env.example .env
php artisan key:generate
```

Sesuaikan konfigurasi database dan URL service pada `.env`.

Jalankan migrasi:

```bash
php artisan migrate
```

Jalankan aplikasi:

```bash
php artisan serve --host=0.0.0.0 --port=3003
```

## Menjalankan dengan Docker Compose

Dari root repository:

```bash
docker compose up --build -d
```

Periksa container:

```bash
docker compose ps
```

Lihat log Order Service:

```bash
docker compose logs -f order-service
```

## Pengujian

Dari direktori `order-service`:

```bash
php artisan test
```

Pengujian mencakup fitur checkout, model pesanan, client integrasi Cart dan Product, serta alur pembacaan dan pembayaran pesanan.

## Konfigurasi Environment

Gunakan `.env.example` sebagai template konfigurasi.

Variabel penting:

- `APP_ENV`
- `APP_DEBUG`
- `APP_URL`
- `DB_CONNECTION`
- `DB_HOST`
- `DB_PORT`
- `DB_DATABASE`
- `DB_USERNAME`
- `DB_PASSWORD`
- `CART_SERVICE_URL`
- `PRODUCT_SERVICE_URL`

Jangan commit file `.env` atau kredensial asli.
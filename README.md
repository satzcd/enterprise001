# Enterprise Microservices



Proyek UTS implementasi arsitektur microservices untuk aplikasi e-commerce.



## Arsitektur



Proyek terdiri dari empat layanan aplikasi dan database masing-masing:



| Service | Teknologi | Port |

|---|---|---:|

| Product Service | Node.js / Express + MySQL | 3000 |

| Cart Service | Laravel + PostgreSQL | 3001 |

| Review Service | Python / Flask + MongoDB | 3002 |

| Order Service | Laravel + MySQL | 3003 |



Setiap service berjalan secara terpisah dan berkomunikasi melalui HTTP API.



## Struktur Repository



- `cart-service`

- `ecommerce-ui`

- `order-service`

- `product-service`

- `review-service`

- `docker-compose.yml`



## Prasyarat



- Docker Engine

- Docker Compose plugin

- Git



Untuk menjalankan Order Service secara lokal di luar Docker, diperlukan PHP dan Composer sesuai requirement aplikasi.



## Menjalankan seluruh layanan



Clone repository:



```bash

git clone https:github.comsatzcdenterprise001.git

cd enterprise001

```



Jalankan seluruh layanan:



```bash

docker compose up --build -d

```



Periksa status container:



```bash

docker compose ps

```



Lihat log:



```bash

docker compose logs -f

```



Log khusus Order Service:



```bash

docker compose logs -f order-service

```



## Order Service API



Base URL lokal: `http:localhost:3003`



| Method | Endpoint | Keterangan |

|---|---|---|

| GET | `health` | Health check |

| POST | `orders` | Membuat pesanan dari cart |

| GET | `orders{id}` | Detail pesanan |

| GET | `ordersuser{userId}` | Daftar pesanan pengguna |

| PATCH | `orders{id}pay` | Memproses pembayaran |



Daftar pesanan mendukung filter status melalui query parameter `status`, misalnya `PENDING` atau `PAID`.



### Alur checkout



1\. Client mengirim permintaan checkout ke Order Service.

2\. Order Service mengambil data cart dari Cart Service.

3\. Order Service mengambil informasi produk dari Product Service.

4\. Order Service menyimpan pesanan dan item pesanan dalam transaksi database.

5\. Informasi produk dan harga disimpan sebagai snapshot item pesanan.

6\. Setelah checkout berhasil, Order Service meminta Cart Service mengosongkan cart pengguna.



### Pembayaran



Pembayaran mengubah status pesanan dari `PENDING` menjadi `PAID`. Pesanan yang sudah dibayar tidak dapat dibayar ulang.



## Pengujian Order Service



Dari direktori Order Service:



```bash

cd order-service

php artisan test

```



Jika berjalan melalui Docker:



```bash

docker compose exec order-service php artisan test

```



## Konfigurasi dan keamanan



- Gunakan `.env.example` sebagai referensi konfigurasi.

- Buat file `.env` lokal sesuai kebutuhan setiap service.

- Jangan commit `.env`, password, API key, atau kredensial.

- `APP\_DEBUG` sebaiknya dinonaktifkan pada deployment production.

- Jangan menghapus Docker volume database saat melakukan restart atau pembaruan layanan.



Dokumentasi spesifik masing-masing service dapat dilihat pada README di direktori service terkait.


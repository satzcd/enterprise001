# Order Service

Order Service adalah layanan backend untuk proyek UTS Microservices menggunakan Laravel dan MySQL.

## Status

Repository ini berisi bootstrap Laravel 13. Endpoint bisnis, integrasi antarlayanan, konfigurasi database khusus, dan Docker integration akan dikerjakan pada tahap berikutnya.

## Prasyarat

- PHP 8.3 atau kompatibel dengan requirement proyek
- Composer
- MySQL untuk pengembangan berikutnya

## Menyiapkan aplikasi lokal

Jalankan dari direktori order-service/:

```bash
composer install
cp .env.example .env
php artisan key:generate
php artisan test
```

Jangan commit file .env atau kredensial.

## Teknologi

- Laravel 13
- PHP 8.3+
- Composer
- PHPUnit melalui Laravel testing

## Status pengujian bootstrap

Dua test bawaan Laravel telah lulus pada pemeriksaan awal. Hasil tersebut hanya memverifikasi skeleton Laravel, belum menguji endpoint atau business logic Order Service.

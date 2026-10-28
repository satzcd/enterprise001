<?php

namespace App\Services\Clients;

use App\Exceptions\ServiceUnavailableException;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Http;

class ProductServiceClient
{
    public function getProduct(int $productId): ?array
    {
        try {
            $response = Http::baseUrl(
                rtrim((string) config('services.product.url'), '/')
            )
                ->acceptJson()
                ->timeout(5)
                ->get("/products/{$productId}");
        } catch (ConnectionException $exception) {
            throw new ServiceUnavailableException(
                'Tidak dapat terhubung ke Product Service.',
                0,
                $exception
            );
        }

        if ($response->status() === 404) {
            return null;
        }

        if ($response->serverError()) {
            throw new ServiceUnavailableException(
                'Product Service mengalami kesalahan server.'
            );
        }

        if (! $response->successful()) {
            throw new ServiceUnavailableException(
                'Product Service mengembalikan respons yang tidak valid.'
            );
        }

        $body = $response->json();
        $product = is_array($body) ? ($body['data'] ?? null) : null;

        if (! is_array($product)) {
            throw new ServiceUnavailableException(
                'Format respons Product Service tidak valid.'
            );
        }

        return $product;
    }
}

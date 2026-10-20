<?php

namespace App\Services\Clients;

use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Http;
use RuntimeException;

class CartServiceClient
{
    public function getCart(int $userId): array
    {
        try {
            $response = Http::baseUrl(
                rtrim((string) config('services.cart.url'), '/')
            )
                ->acceptJson()
                ->timeout(5)
                ->get("/carts/{$userId}");
        } catch (ConnectionException $exception) {
            throw new RuntimeException(
                'Tidak dapat terhubung ke Cart Service.',
                0,
                $exception
            );
        }

        if ($response->status() >= 500) {
            throw new RuntimeException(
                'Cart Service mengalami kesalahan server.'
            );
        }

        if (! $response->successful()) {
            throw new RuntimeException(
                'Cart Service mengembalikan respons yang tidak valid.'
            );
        }

        $cart = $response->json();

        if (! is_array($cart) || ! array_is_list($cart)) {
            throw new RuntimeException(
                'Format respons Cart Service tidak valid.'
            );
        }

        return $cart;
    }

    public function clearCart(int $userId): void
    {
        try {
            $response = Http::baseUrl(
                rtrim((string) config('services.cart.url'), '/')
            )
                ->acceptJson()
                ->timeout(5)
                ->delete("/carts/{$userId}");
        } catch (ConnectionException $exception) {
            throw new RuntimeException(
                'Tidak dapat mengosongkan cart melalui Cart Service.',
                0,
                $exception
            );
        }

        if (! $response->successful()) {
            throw new RuntimeException(
                'Cart Service gagal mengosongkan cart.'
            );
        }
    }
}

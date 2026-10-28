<?php

namespace App\Services\Clients;

use App\Exceptions\ServiceUnavailableException;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Http;

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
            throw new ServiceUnavailableException(
                'Tidak dapat terhubung ke Cart Service.',
                0,
                $exception
            );
        }

        if ($response->serverError()) {
            throw new ServiceUnavailableException(
                'Cart Service mengalami kesalahan server.'
            );
        }

        if (! $response->successful()) {
            throw new ServiceUnavailableException(
                'Cart Service mengembalikan respons yang tidak valid.'
            );
        }

        $cart = $response->json();

        if (! is_array($cart) || ! array_is_list($cart)) {
            throw new ServiceUnavailableException(
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
            throw new ServiceUnavailableException(
                'Tidak dapat mengosongkan cart melalui Cart Service.',
                0,
                $exception
            );
        }

        if (! $response->successful()) {
            throw new ServiceUnavailableException(
                'Cart Service gagal mengosongkan cart.'
            );
        }
    }
}

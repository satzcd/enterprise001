<?php

namespace App\Services;

use App\Exceptions\CheckoutConflictException;
use App\Exceptions\ServiceUnavailableException;
use App\Models\Order;
use App\Services\Clients\CartServiceClient;
use App\Services\Clients\ProductServiceClient;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Throwable;

class OrderCheckoutService
{
    private const MAX_AMOUNT_CENTS = 999999999999;

    public function __construct(
        private CartServiceClient $cartClient,
        private ProductServiceClient $productClient,
    ) {
    }

    public function checkout(int $userId): Order
    {
        $cartItems = $this->cartClient->getCart($userId);

        if ($cartItems === []) {
            throw new CheckoutConflictException(
                'Cart kosong. Tambahkan produk sebelum checkout.'
            );
        }

        $preparedItems = [];
        $totalCents = 0;

        foreach ($cartItems as $cartItem) {
            $productId = $cartItem['product_id'] ?? null;
            $quantity = $cartItem['quantity'] ?? null;

            if (
                ! is_numeric($productId)
                || (int) $productId < 1
                || (string) (int) $productId !== (string) $productId
                || ! is_numeric($quantity)
                || (int) $quantity < 1
                || (string) (int) $quantity !== (string) $quantity
            ) {
                throw new ServiceUnavailableException(
                    'Cart Service mengembalikan data item yang tidak valid.'
                );
            }

            $product = $this->productClient->getProduct((int) $productId);

            if ($product === null) {
                throw new CheckoutConflictException(
                    "Produk dengan ID {$productId} tidak ditemukan."
                );
            }

            $name = $product['name'] ?? null;
            $stock = $product['stock'] ?? null;
            $price = $product['price'] ?? null;

            if (
                ! is_string($name)
                || trim($name) === ''
                || ! is_numeric($stock)
                || (int) $stock < 0
                || (string) (int) $stock !== (string) $stock
            ) {
                throw new ServiceUnavailableException(
                    'Product Service mengembalikan data produk yang tidak valid.'
                );
            }

            if ((int) $stock < (int) $quantity) {
                throw new CheckoutConflictException(
                    "Stok produk {$name} tidak mencukupi."
                );
            }

            $unitPriceCents = $this->parsePriceToCents($price);
            $quantityValue = (int) $quantity;

            if (
                $unitPriceCents > 0
                && $quantityValue > intdiv(
                    self::MAX_AMOUNT_CENTS,
                    $unitPriceCents
                )
            ) {
                throw new CheckoutConflictException(
                    'Total checkout melebihi batas nilai yang didukung.'
                );
            }

            $subtotalCents = $unitPriceCents * $quantityValue;

            if ($totalCents > self::MAX_AMOUNT_CENTS - $subtotalCents) {
                throw new CheckoutConflictException(
                    'Total checkout melebihi batas nilai yang didukung.'
                );
            }

            $totalCents += $subtotalCents;

            $preparedItems[] = [
                'product_id' => (int) $productId,
                'product_name' => trim($name),
                'unit_price' => $this->formatCents($unitPriceCents),
                'quantity' => (int) $quantity,
                'subtotal' => $this->formatCents($subtotalCents),
            ];
        }

        $order = DB::transaction(function () use (
            $userId,
            $preparedItems,
            $totalCents
        ): Order {
            $order = Order::create([
                'user_id' => $userId,
                'status' => 'PENDING',
                'total_amount' => $this->formatCents($totalCents),
            ]);

            $order->items()->createMany($preparedItems);

            return $order->load('items');
        });

        try {
            $this->cartClient->clearCart($userId);
        } catch (Throwable $exception) {
            Log::error('Gagal mengosongkan cart setelah checkout.', [
                'order_id' => $order->id,
                'user_id' => $userId,
                'exception' => $exception->getMessage(),
            ]);
        }

        return $order;
    }

    private function parsePriceToCents(mixed $price): int
    {
        if (
            ! is_string($price)
            && ! is_int($price)
        ) {
            throw new ServiceUnavailableException(
                'Product Service mengembalikan harga dengan format tidak valid.'
            );
        }

        $price = (string) $price;

        if (! preg_match('/^\d{1,8}(?:\.\d{1,2})?$/', $price)) {
            throw new ServiceUnavailableException(
                'Product Service mengembalikan harga dengan format tidak valid.'
            );
        }

        [$whole, $fraction] = array_pad(
            explode('.', $price, 2),
            2,
            ''
        );

        $cents = ((int) $whole * 100)
            + (int) str_pad($fraction, 2, '0');

        if ($cents > self::MAX_AMOUNT_CENTS) {
            throw new ServiceUnavailableException(
                'Harga produk melebihi batas yang didukung.'
            );
        }

        return $cents;
    }

    private function formatCents(int $cents): string
    {
        return intdiv($cents, 100)
            . '.'
            . str_pad((string) ($cents % 100), 2, '0', STR_PAD_LEFT);
    }
}
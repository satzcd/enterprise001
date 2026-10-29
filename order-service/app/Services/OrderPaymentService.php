<?php

namespace App\Services;

use App\Exceptions\CheckoutConflictException;
use App\Models\Order;
use Illuminate\Support\Facades\DB;

class OrderPaymentService
{
    public function pay(int $orderId): Order
    {
        return DB::transaction(function () use ($orderId): Order {
            $order = Order::query()
                ->lockForUpdate()
                ->find($orderId);

            if ($order === null) {
                abort(404, "Pesanan dengan id {$orderId} tidak ditemukan.");
            }

            if ($order->status !== 'PENDING') {
                throw new CheckoutConflictException(
                    'Pesanan hanya dapat dibayar saat berstatus PENDING.'
                );
            }

            $order->status = 'PAID';
            $order->save();

            return $order->load('items');
        });
    }
}

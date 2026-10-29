<?php

namespace App\Services;

use App\Models\Order;
use Illuminate\Database\Eloquent\Collection;

class OrderReadService
{
    public function findWithItems(int $orderId): ?Order
    {
        return Order::query()
            ->with('items')
            ->find($orderId);
    }

    public function listForUser(
        int $userId,
        ?string $status = null
    ): Collection {
        $query = Order::query()
            ->with('items')
            ->where('user_id', $userId)
            ->orderByDesc('created_at')
            ->orderByDesc('id');

        if ($status !== null) {
            $query->where('status', $status);
        }

        return $query->get();
    }
}

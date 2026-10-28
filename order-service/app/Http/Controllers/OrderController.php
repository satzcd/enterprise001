<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreOrderRequest;
use App\Services\OrderCheckoutService;
use Illuminate\Http\JsonResponse;

class OrderController extends Controller
{
    public function __construct(
        private OrderCheckoutService $checkoutService
    ) {
    }

    public function store(StoreOrderRequest $request): JsonResponse
    {
        $order = $this->checkoutService->checkout(
            (int) $request->validated('user_id')
        );

        return response()->json([
            'message' => 'Order berhasil dibuat.',
            'data' => [
                'id' => $order->id,
                'user_id' => $order->user_id,
                'status' => $order->status,
                'total_amount' => $order->total_amount,
                'items' => $order->items->map(fn ($item) => [
                    'product_id' => $item->product_id,
                    'product_name' => $item->product_name,
                    'unit_price' => $item->unit_price,
                    'quantity' => $item->quantity,
                    'subtotal' => $item->subtotal,
                ])->values(),
                'created_at' => $order->created_at,
                'updated_at' => $order->updated_at,
            ],
        ], 201);
    }
}

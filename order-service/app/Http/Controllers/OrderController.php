<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreOrderRequest;
use App\Services\OrderCheckoutService;
use Illuminate\Http\JsonResponse;
use App\Models\Order;
use Illuminate\Http\Request;
use App\Services\OrderPaymentService;

class OrderController extends Controller
{
    public function __construct(
        private OrderCheckoutService $checkoutService,
        private OrderPaymentService $paymentService,
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

    public function show(int $id): JsonResponse
{
    $order = Order::query()
        ->with('items')
        ->find($id);

    if ($order === null) {
        return response()->json([
            'message' => "Pesanan dengan id {$id} tidak ditemukan.",
        ], 404);
    }

    return response()->json([
        'message' => 'Berhasil mengambil pesanan.',
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
    ], 200);
}


public function userOrders(Request $request, int $userId): JsonResponse
{
    $status = $request->query('status');

    if ($status !== null && ! in_array($status, ['PENDING', 'PAID'], true)) {
        return response()->json([
            'message' => 'Data yang dikirim tidak valid',
            'errors' => [
                'status' => ['Status harus PENDING atau PAID'],
            ],
        ], 422);
    }

    $query = Order::query()
        ->with('items')
        ->where('user_id', $userId)
        ->orderByDesc('created_at')
        ->orderByDesc('id');

    if ($status !== null) {
        $query->where('status', $status);
    }

    $orders = $query->get();

    return response()->json([
        'message' => 'Berhasil mengambil daftar pesanan',
        'data' => $orders->map(fn (Order $order) => [
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
        ])->values(),
    ], 200);
}

public function pay(int $id): JsonResponse
{
    $order = $this->paymentService->pay($id);

    return response()->json([
        'message' => 'Pembayaran pesanan berhasil.',
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
    ], 200);
}

}

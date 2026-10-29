<?php

namespace App\Http\Controllers;

use App\Http\Requests\ListUserOrdersRequest;
use App\Http\Requests\StoreOrderRequest;
use App\Services\OrderCheckoutService;
use App\Services\OrderPaymentService;
use App\Services\OrderReadService;
use Illuminate\Http\JsonResponse;

class OrderController extends Controller
{
    public function __construct(
        private OrderCheckoutService $checkoutService,
        private OrderPaymentService $paymentService,
        private OrderReadService $readService,
    ) {}

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
        $order = $this->readService->findWithItems($id);

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

    public function userOrders(
        ListUserOrdersRequest $request,
        int $userId
    ): JsonResponse {
        $status = $request->validated('status');

        $orders = $this->readService->listForUser(
            $userId,
            $status
        );

        return response()->json([
            'message' => 'Berhasil mengambil daftar pesanan',
            'data' => $orders->map(fn ($order) => [
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

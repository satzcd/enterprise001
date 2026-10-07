<?php

namespace App\Http\Controllers;

use App\Exceptions\CartItemNotFoundException;
use App\Http\Requests\AddCartItemRequest;
use App\Http\Requests\UpdateCartItemRequest;
use App\Services\CartService;
use Illuminate\Http\JsonResponse;

class CartController extends Controller
{
    public function __construct(
        private CartService $cartService
    ) {
    }

    public function index($userId): JsonResponse
    {
        return response()->json(
            $this->cartService->getCart($userId)
        );
    }

    public function store(AddCartItemRequest $request): JsonResponse
    {
        $item = $this->cartService->addItem(
            $request->user_id,
            $request->product_id,
            $request->quantity
        );

        return response()->json($item, 201);
    }

    public function update(
        UpdateCartItemRequest $request,
        $id
    ): JsonResponse {
        try {
            $item = $this->cartService->updateQuantity(
                $id,
                $request->quantity
            );

            return response()->json($item);
        } catch (CartItemNotFoundException $e) {
            return response()->json([
                'message' => $e->getMessage(),
            ], 404);
        }
    }

    public function destroy($id): JsonResponse
    {
        try {
            $this->cartService->removeItem($id);

            return response()->json([
                'message' => 'Cart item removed',
            ]);
        } catch (CartItemNotFoundException $e) {
            return response()->json([
                'message' => $e->getMessage(),
            ], 404);
        }
    }

    public function clear($userId): JsonResponse
    {
        $this->cartService->clearCart($userId);

        return response()->json([
            'message' => 'Cart cleared',
        ]);
    }
}

<?php

namespace App\Services;

use App\Exceptions\CartItemNotFoundException;
use App\Models\CartItem;

class CartService
{
    public function getCart($userId)
    {
        return CartItem::forUser($userId)
            ->orderBy('id')
            ->get();
    }

    public function addItem($userId, $productId, $quantity)
    {
        $item = CartItem::firstOrNew([
            'user_id' => $userId,
            'product_id' => $productId,
        ]);

        $item->quantity = ($item->exists ? $item->quantity : 0) + $quantity;
        $item->save();

        return $item;
    }

    public function updateQuantity($id, $quantity)
    {
        $item = CartItem::find($id);

        if (!$item) {
            throw new CartItemNotFoundException('Cart item not found');
        }

        $item->quantity = $quantity;
        $item->save();

        return $item;
    }

    public function removeItem($id)
    {
        $item = CartItem::find($id);

        if (!$item) {
            throw new CartItemNotFoundException('Cart item not found');
        }

        $item->delete();
    }

    public function clearCart($userId)
    {
        CartItem::forUser($userId)->delete();
    }
}

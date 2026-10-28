<?php

namespace Tests\Feature;

use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

class OrderModelTest extends TestCase
{
    use RefreshDatabase;

    public function test_order_and_order_item_tables_have_required_columns(): void
    {
        $this->assertTrue(Schema::hasColumns('orders', [
            'id',
            'user_id',
            'status',
            'total_amount',
            'created_at',
            'updated_at',
        ]));

        $this->assertTrue(Schema::hasColumns('order_items', [
            'id',
            'order_id',
            'product_id',
            'product_name',
            'unit_price',
            'quantity',
            'subtotal',
        ]));
    }

    public function test_order_has_items_and_item_belongs_to_order(): void
    {
        $order = Order::query()->create([
            'user_id' => 101,
            'total_amount' => '59.90',
        ]);

        $item = $order->items()->create([
            'product_id' => 501,
            'product_name' => 'Keyboard',
            'unit_price' => '29.95',
            'quantity' => 2,
            'subtotal' => '59.90',
        ]);

        $loadedOrder = Order::query()
            ->with('items')
            ->findOrFail($order->id);

        $this->assertSame('PENDING', $loadedOrder->status);
        $this->assertCount(1, $loadedOrder->items);
        $this->assertSame($order->id, $item->order->id);
        $this->assertSame('Keyboard', $loadedOrder->items[0]->product_name);
        $this->assertSame('29.95', $loadedOrder->items[0]->unit_price);
        $this->assertSame('59.90', $loadedOrder->total_amount);
    }
}

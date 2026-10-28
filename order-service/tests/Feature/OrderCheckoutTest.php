<?php

namespace Tests\Feature;

use App\Models\Order;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Tests\TestCase;

class OrderCheckoutTest extends TestCase
{
    use RefreshDatabase;

    public function test_checkout_rejects_quantity_that_exceeds_amount_limit(): void
    {
        Http::fake([
            '*/carts/10' => Http::response([
                [
                    'id' => 1,
                    'user_id' => 10,
                    'product_id' => 5,
                    'quantity' => 2147483647,
                ],
            ]),
            '*/products/5' => Http::response([
                'message' => 'Berhasil mengambil data produk',
                'data' => [
                    'id' => 5,
                    'name' => 'Keyboard',
                    'price' => '99999999.99',
                    'stock' => 2147483647,
                ],
            ]),
        ]);

        $this->postJson('/orders', ['user_id' => 10])
            ->assertStatus(409);

        $this->assertDatabaseCount('orders', 0);
        $this->assertDatabaseCount('order_items', 0);
    }

    public function test_checkout_creates_order_and_snapshots_product_data(): void
    {
        Http::fake([
            '*/carts/10' => Http::response([
                [
                    'id' => 1,
                    'user_id' => 10,
                    'product_id' => 5,
                    'quantity' => 2,
                ],
            ]),
            '*/products/5' => Http::response([
                'message' => 'Berhasil mengambil data produk',
                'data' => [
                    'id' => 5,
                    'name' => 'Keyboard',
                    'price' => '125000.50',
                    'stock' => 10,
                ],
            ]),
            '*/carts/10' => Http::sequence()
                ->push([
                    [
                        'id' => 1,
                        'user_id' => 10,
                        'product_id' => 5,
                        'quantity' => 2,
                    ],
                ])
                ->push(['message' => 'Cart cleared']),
        ]);

        $response = $this->postJson('/orders', [
            'user_id' => 10,
        ]);

        $response
            ->assertCreated()
            ->assertJsonPath('data.user_id', 10)
            ->assertJsonPath('data.status', 'PENDING')
            ->assertJsonPath('data.total_amount', '250001.00')
            ->assertJsonPath('data.items.0.product_name', 'Keyboard')
            ->assertJsonPath('data.items.0.unit_price', '125000.50')
            ->assertJsonPath('data.items.0.quantity', 2)
            ->assertJsonPath('data.items.0.subtotal', '250001.00');

        $this->assertDatabaseCount('orders', 1);
        $this->assertDatabaseCount('order_items', 1);
    }

    public function test_checkout_rejects_missing_user_id(): void
    {
        $this->postJson('/orders', [])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('user_id');

        $this->assertDatabaseCount('orders', 0);
    }

    public function test_checkout_rejects_empty_cart(): void
    {
        Http::fake([
            '*/carts/10' => Http::response([]),
        ]);

        $this->postJson('/orders', ['user_id' => 10])
            ->assertStatus(409);

        $this->assertDatabaseCount('orders', 0);
    }

    public function test_checkout_rejects_missing_product(): void
    {
        Http::fake([
            '*/carts/10' => Http::response([
                [
                    'id' => 1,
                    'user_id' => 10,
                    'product_id' => 99,
                    'quantity' => 1,
                ],
            ]),
            '*/products/99' => Http::response([
                'message' => 'Produk tidak ditemukan',
            ], 404),
        ]);

        $this->postJson('/orders', ['user_id' => 10])
            ->assertStatus(409);

        $this->assertDatabaseCount('orders', 0);
    }

    public function test_checkout_returns_503_when_product_service_fails(): void
    {
        Http::fake([
            '*/carts/10' => Http::response([
                [
                    'id' => 1,
                    'user_id' => 10,
                    'product_id' => 5,
                    'quantity' => 1,
                ],
            ]),
            '*/products/5' => Http::response([
                'message' => 'Internal Server Error',
            ], 500),
        ]);

        $this->postJson('/orders', ['user_id' => 10])
            ->assertStatus(503);

        $this->assertDatabaseCount('orders', 0);
    }

    public function test_order_is_kept_when_cart_cannot_be_cleared(): void
    {
        Http::fake([
            '*/carts/10' => Http::sequence()
                ->push([
                    [
                        'id' => 1,
                        'user_id' => 10,
                        'product_id' => 5,
                        'quantity' => 1,
                    ],
                ])
                ->push(['message' => 'Cart service error'], 500),
            '*/products/5' => Http::response([
                'message' => 'Berhasil mengambil data produk',
                'data' => [
                    'id' => 5,
                    'name' => 'Keyboard',
                    'price' => '100.00',
                    'stock' => 10,
                ],
            ]),
        ]);

        $response = $this->postJson('/orders', ['user_id' => 10]);

        $response->assertCreated();
        $this->assertDatabaseCount('orders', 1);
        $this->assertDatabaseCount('order_items', 1);
    }

    public function test_checkout_rejects_insufficient_stock(): void
    {
        Http::fake([
            '*/carts/10' => Http::response([
                [
                    'id' => 1,
                    'user_id' => 10,
                    'product_id' => 5,
                    'quantity' => 3,
                ],
            ]),
            '*/products/5' => Http::response([
                'message' => 'Berhasil mengambil data produk',
                'data' => [
                    'id' => 5,
                    'name' => 'Keyboard',
                    'price' => '100.00',
                    'stock' => 2,
                ],
            ]),
        ]);

        $this->postJson('/orders', ['user_id' => 10])
            ->assertStatus(409);

        $this->assertDatabaseCount('orders', 0);
        $this->assertDatabaseCount('order_items', 0);
    }

    public function test_checkout_returns_503_when_cart_service_fails(): void
    {
        Http::fake([
            '*/carts/10' => Http::response([
                'message' => 'Internal Server Error',
            ], 500),
        ]);

        $this->postJson('/orders', ['user_id' => 10])
            ->assertStatus(503);

        $this->assertDatabaseCount('orders', 0);
    }

    public function test_checkout_logs_failure_when_cart_cannot_be_cleared(): void
    {
        Log::spy();

        Http::fake([
            '*/carts/10' => Http::sequence()
                ->push([
                    [
                        'id' => 1,
                        'user_id' => 10,
                        'product_id' => 5,
                        'quantity' => 1,
                    ],
                ])
                ->push(['message' => 'Cart service error'], 500),
            '*/products/5' => Http::response([
                'message' => 'Berhasil mengambil data produk',
                'data' => [
                    'id' => 5,
                    'name' => 'Keyboard',
                    'price' => '100.00',
                    'stock' => 10,
                ],
            ]),
        ]);

        $response = $this->postJson('/orders', ['user_id' => 10]);

        $response->assertCreated();

        $order = Order::query()->firstOrFail();

        Log::shouldHaveReceived('error')
            ->once()
            ->withArgs(function (string $message, array $context) use ($order) {
                return $message === 'Gagal mengosongkan cart setelah checkout.'
                    && $context['order_id'] === $order->id
                    && $context['user_id'] === 10;
            });

        $this->assertDatabaseCount('orders', 1);
        $this->assertDatabaseCount('order_items', 1);
    }
}
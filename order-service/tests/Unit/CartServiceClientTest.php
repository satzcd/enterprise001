<?php

namespace Tests\Unit;

use App\Exceptions\ServiceUnavailableException;
use App\Services\Clients\CartServiceClient;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class CartServiceClientTest extends TestCase
{
    public function test_it_returns_cart_items_as_a_list(): void
    {
        config([
            'services.cart.url' => 'http://cart-service:3001',
        ]);

        Http::fake([
            'cart-service:3001/carts/7' => Http::response([
                [
                    'id' => 11,
                    'user_id' => 7,
                    'product_id' => 1,
                    'quantity' => 2,
                ],
            ], 200),
        ]);

        $items = app(CartServiceClient::class)->getCart(7);

        $this->assertCount(1, $items);
        $this->assertSame(1, $items[0]['product_id']);
        $this->assertSame(2, $items[0]['quantity']);
    }

    public function test_it_throws_when_cart_response_is_not_a_list(): void
    {
        config([
            'services.cart.url' => 'http://cart-service:3001',
        ]);

        Http::fake([
            'cart-service:3001/carts/7' => Http::response([
                'data' => [],
            ], 200),
        ]);

        $this->expectException(ServiceUnavailableException::class);

        app(CartServiceClient::class)->getCart(7);
    }

    public function test_it_clears_cart_successfully(): void
    {
        config([
            'services.cart.url' => 'http://cart-service:3001',
        ]);

        Http::fake([
            'cart-service:3001/carts/7' => Http::response([
                'message' => 'Cart cleared',
            ], 200),
        ]);

        app(CartServiceClient::class)->clearCart(7);

        Http::assertSent(
            fn ($request) =>
                $request->method() === 'DELETE'
                && $request->url() === 'http://cart-service:3001/carts/7'
        );
    }

    public function test_it_throws_when_clearing_cart_fails(): void
    {
        config([
            'services.cart.url' => 'http://cart-service:3001',
        ]);

        Http::fake([
            'cart-service:3001/carts/7' => Http::response([
                'message' => 'Internal Server Error',
            ], 500),
        ]);

        $this->expectException(ServiceUnavailableException::class);

        app(CartServiceClient::class)->clearCart(7);
    }

    public function test_it_returns_an_empty_list_when_cart_is_empty(): void
    {
        config([
            'services.cart.url' => 'http://cart-service:3001',
        ]);

        Http::fake([
            'cart-service:3001/carts/7' => Http::response([], 200),
        ]);

        $items = app(CartServiceClient::class)->getCart(7);

        $this->assertSame([], $items);
    }

}

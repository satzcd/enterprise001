<?php

namespace Tests\Unit;

use App\Exceptions\ServiceUnavailableException;
use App\Services\Clients\ProductServiceClient;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class ProductServiceClientTest extends TestCase
{
    public function test_it_returns_product_from_data_field(): void
    {
        config([
            'services.product.url' => 'http://product-service:3000',
        ]);

        Http::fake([
            'product-service:3000/products/1' => Http::response([
                'message' => 'Berhasil mengambil data produk',
                'data' => [
                    'id' => 1,
                    'name' => 'Keyboard',
                    'price' => '450000.00',
                    'stock' => 10,
                ],
            ], 200),
        ]);

        $product = app(ProductServiceClient::class)->getProduct(1);

        $this->assertSame(1, $product['id']);
        $this->assertSame('Keyboard', $product['name']);
        $this->assertSame('450000.00', $product['price']);
    }

    public function test_it_returns_null_when_product_is_not_found(): void
    {
        config([
            'services.product.url' => 'http://product-service:3000',
        ]);

        Http::fake([
            'product-service:3000/products/99' => Http::response([
                'message' => 'Produk tidak ditemukan',
            ], 404),
        ]);

        $product = app(ProductServiceClient::class)->getProduct(99);

        $this->assertNull($product);
    }

    public function test_it_throws_service_unavailable_on_server_error(): void
    {
        config([
            'services.product.url' => 'http://product-service:3000',
        ]);

        Http::fake([
            'product-service:3000/products/1' => Http::response([
                'message' => 'Internal Server Error',
            ], 500),
        ]);

        $this->expectException(ServiceUnavailableException::class);

        app(ProductServiceClient::class)->getProduct(1);
    }
}

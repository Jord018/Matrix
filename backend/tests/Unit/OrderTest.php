<?php

namespace Tests\Unit;

use App\Models\Order;
use Carbon\Carbon;
use DateTimeInterface;
use Tests\Concerns\BackOfficeSchema;
use Tests\TestCase;

class OrderTest extends TestCase
{
    use BackOfficeSchema;

    protected function setUp(): void
    {
        parent::setUp();
    }

    public function test_model_configuration(): void
    {
        $order = new Order;

        $this->assertSame('orders', $order->getTable());
        $this->assertSame('id', $order->getKeyName());
        $this->assertSame('string', $order->getKeyType());
        $this->assertFalse($order->getIncrementing());
        $this->assertFalse($order->timestamps);

        $expectedFillable = ['id', 'userId', 'username', 'items', 'purchaseDate', 'status'];
        $this->assertSame($expectedFillable, $order->getFillable());
    }

    public function test_items_array_cast_and_purchase_date_cast(): void
    {
        $itemsData = [
            [
                'gameName' => 'Elden Ring',
                'coverImage' => 'https://example.com/er.jpg',
                'price' => 59.99,
                'keys' => ['XXXX-YYYY-ZZZZ'],
            ],
            [
                'gameName' => 'Hades',
                'coverImage' => 'https://example.com/hades.jpg',
                'price' => 24.99,
                'keys' => ['AAAA-BBBB-CCCC'],
            ],
        ];

        $now = Carbon::now();

        $order = Order::create([
            'userId' => 'user-12345',
            'username' => 'alice',
            'items' => $itemsData,
            'purchaseDate' => $now,
            'status' => 'completed',
        ]);

        $this->assertNotEmpty($order->id);
        $this->assertSame('user-12345', $order->userId);
        $this->assertSame('alice', $order->username);
        $this->assertSame('completed', $order->status);

        // Test items cast
        $this->assertIsArray($order->items);
        $this->assertCount(2, $order->items);
        $this->assertSame('Elden Ring', $order->items[0]['gameName']);
        $this->assertSame(['XXXX-YYYY-ZZZZ'], $order->items[0]['keys']);

        // Test purchaseDate cast
        $this->assertInstanceOf(DateTimeInterface::class, $order->purchaseDate);
        $this->assertSame($now->toIso8601String(), $order->purchaseDate->toIso8601String());

        // Test retrieving fresh instance from database
        $fresh = Order::find($order->id);
        $this->assertNotNull($fresh);
        $this->assertIsArray($fresh->items);
        $this->assertSame('Hades', $fresh->items[1]['gameName']);
        $this->assertInstanceOf(DateTimeInterface::class, $fresh->purchaseDate);
    }

    public function test_custom_legacy_string_id(): void
    {
        $customId = 'order-legacy-123456';
        $order = Order::create([
            'id' => $customId,
            'userId' => 'user-999',
            'username' => 'bob',
            'items' => [],
            'status' => 'pending',
        ]);

        $this->assertSame($customId, $order->id);
        $found = Order::find($customId);
        $this->assertNotNull($found);
        $this->assertSame($customId, $found->id);
    }
}

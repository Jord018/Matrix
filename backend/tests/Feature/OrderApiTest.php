<?php

namespace Tests\Feature;

use App\Models\Game;
use App\Models\Order;
use Tests\Concerns\BackOfficeSchema;
use Tests\TestCase;

class OrderApiTest extends TestCase
{
    use BackOfficeSchema;

    public function test_successful_order_deducts_stock_generates_keys_and_persists_order(): void
    {
        $game1 = Game::create([
            'name' => 'Elden Ring',
            'coverImage' => 'https://example.com/er.jpg',
            'price' => 59.99,
            'stock' => 10,
        ]);

        $game2 = Game::create([
            'name' => 'Hades',
            'coverImage' => 'https://example.com/hades.jpg',
            'price' => 24.99,
            'stock' => 5,
        ]);

        $payload = [
            'items' => [
                ['gameId' => $game1->id, 'amount' => 2],
                ['gameId' => $game2->id, 'amount' => 1],
            ],
            'userId' => 'user-101',
            'username' => 'gamer_one',
        ];

        $response = $this->postJson('/api/orders', $payload);

        $response->assertCreated()
            ->assertJsonPath('userId', 'user-101')
            ->assertJsonPath('username', 'gamer_one')
            ->assertJsonPath('status', 'completed')
            ->assertJsonCount(2, 'items');

        $orderId = $response->json('id');
        $this->assertStringStartsWith('ORD-', $orderId);

        // Verify stock deduction in database
        $this->assertSame(8, $game1->fresh()->stock);
        $this->assertSame(4, $game2->fresh()->stock);

        // Verify keys format and quantity
        $items = $response->json('items');
        $this->assertCount(2, $items[0]['keys']);
        $this->assertMatchesRegularExpression('/^[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/', $items[0]['keys'][0]);
        $this->assertMatchesRegularExpression('/^[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/', $items[0]['keys'][1]);

        $this->assertCount(1, $items[1]['keys']);
        $this->assertMatchesRegularExpression('/^[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/', $items[1]['keys'][0]);

        // Verify persistence in orders table
        $savedOrder = Order::find($orderId);
        $this->assertNotNull($savedOrder);
        $this->assertSame('completed', $savedOrder->status);
    }

    public function test_checkout_alias_route_works(): void
    {
        $game = Game::create([
            'name' => 'Cyberpunk 2077',
            'price' => 49.99,
            'stock' => 5,
        ]);

        $response = $this->postJson('/api/checkout', [
            'items' => [
                ['gameId' => $game->id, 'amount' => 1],
            ],
        ]);

        $response->assertCreated();
        $this->assertSame(4, $game->fresh()->stock);
    }

    public function test_guest_checkout_defaults_user_and_username_to_guest(): void
    {
        $game = Game::create([
            'name' => 'Indie Hit',
            'price' => 9.99,
            'stock' => 5,
        ]);

        $response = $this->postJson('/api/orders', [
            'items' => [
                ['gameId' => $game->id, 'amount' => 1],
            ],
        ]);

        $response->assertCreated()
            ->assertJsonPath('userId', 'guest')
            ->assertJsonPath('username', 'guest');
    }

    public function test_out_of_stock_fails_with_422_and_rolls_back_stock(): void
    {
        $game1 = Game::create([
            'name' => 'First Game',
            'price' => 50,
            'stock' => 10,
        ]);

        $game2 = Game::create([
            'name' => 'Scarce Game',
            'price' => 60,
            'stock' => 1,
        ]);

        $payload = [
            'items' => [
                ['gameId' => $game1->id, 'amount' => 2],
                ['gameId' => $game2->id, 'amount' => 3], // exceeds stock (1)
            ],
        ];

        $response = $this->postJson('/api/orders', $payload);

        $response->assertStatus(422)
            ->assertJsonValidationErrors('stock');

        // Rollback check: Neither game has stock decremented
        $this->assertSame(10, $game1->fresh()->stock);
        $this->assertSame(1, $game2->fresh()->stock);

        // No order created
        $this->assertSame(0, Order::count());
    }

    public function test_non_existent_game_fails_with_422(): void
    {
        $response = $this->postJson('/api/orders', [
            'items' => [
                ['gameId' => 'non-existent-game-id', 'amount' => 1],
            ],
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors('items.0.gameId');
    }

    public function test_invalid_payload_fails_validation(): void
    {
        // Missing items
        $this->postJson('/api/orders', [])
            ->assertStatus(422)
            ->assertJsonValidationErrors('items');

        // Empty items array
        $this->postJson('/api/orders', ['items' => []])
            ->assertStatus(422)
            ->assertJsonValidationErrors('items');

        // Amount zero or negative
        $game = Game::create(['name' => 'Test', 'price' => 10, 'stock' => 5]);
        $this->postJson('/api/orders', [
            'items' => [['gameId' => $game->id, 'amount' => 0]],
        ])->assertStatus(422)
            ->assertJsonValidationErrors('items.0.amount');

        $this->postJson('/api/orders', [
            'items' => [['gameId' => $game->id, 'amount' => -1]],
        ])->assertStatus(422)
            ->assertJsonValidationErrors('items.0.amount');
    }
}

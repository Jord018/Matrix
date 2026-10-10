<?php

namespace Tests\Feature;

use App\Models\Order;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Concerns\BackOfficeSchema;
use Tests\TestCase;

class AdminOrderIndexTest extends TestCase
{
    use BackOfficeSchema, RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->createSchema();
    }

    public function test_requires_admin(): void
    {
        $this->getJson('/api/admin/orders')->assertStatus(401);
        $this->actAs('customer');
        $this->getJson('/api/admin/orders')->assertStatus(403);
    }

    public function test_lists_orders_newest_first_with_items(): void
    {
        Order::create(['userId' => 'u1', 'username' => 'old', 'status' => 'completed', 'purchaseDate' => '2026-01-01 10:00:00', 'items' => []]);
        Order::create([
            'userId' => 'u2', 'username' => 'new', 'status' => 'completed', 'purchaseDate' => '2026-02-01 10:00:00',
            'items' => [['gameName' => 'Zelda', 'keys' => ['A-B-C', 'D-E-F']]],
        ]);
        $this->actAs();

        $this->getJson('/api/admin/orders')->assertOk()
            ->assertJsonCount(2)
            ->assertJsonPath('0.username', 'new')
            ->assertJsonPath('0.items.0.gameName', 'Zelda')
            ->assertJsonCount(2, '0.items.0.keys')
            ->assertJsonPath('1.username', 'old');
    }
}

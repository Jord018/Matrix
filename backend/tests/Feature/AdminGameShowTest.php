<?php

namespace Tests\Feature;

use App\Models\Game;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Concerns\BackOfficeSchema;
use Tests\TestCase;

class AdminGameShowTest extends TestCase
{
    use BackOfficeSchema, RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->createSchema();
    }

    public function test_requires_admin(): void
    {
        $game = Game::create(['name' => 'A']);
        $this->getJson("/api/admin/games/{$game->id}")->assertStatus(401);
        $this->actAs('customer');
        $this->getJson("/api/admin/games/{$game->id}")->assertStatus(403);
    }

    public function test_returns_one_game(): void
    {
        $game = Game::create([
            'name' => 'A', 'price' => 5, 'stock' => 2, 'categories' => ['RPG'],
            'screenshots' => ['http://x/1.png'], 'systemRequirements' => ['os' => 'Win'],
        ]);
        $this->actAs();
        $this->getJson("/api/admin/games/{$game->id}")->assertOk()
            ->assertJsonPath('name', 'A')
            ->assertJsonPath('categories', ['RPG'])
            ->assertJsonPath('systemRequirements.os', 'Win');
    }

    public function test_unknown_id_is_404(): void
    {
        $this->actAs();
        $this->getJson('/api/admin/games/nope')->assertStatus(404);
    }
}

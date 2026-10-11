<?php

namespace Tests\Feature;

use App\Models\Game;
use Tests\Concerns\BackOfficeSchema;
use Tests\TestCase;

class AdminGameShowTest extends TestCase
{
    use BackOfficeSchema;

    protected function setUp(): void
    {
        parent::setUp();
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

    public function test_finds_a_game_with_a_legacy_non_uuid_id(): void
    {
        $game = new Game(['name' => 'Legacy']);
        $game->id = '69b7fba7cbfe780b4c63c7d0'; // id format of rows migrated from Mongo
        $game->save();
        $this->actAs();

        $this->getJson('/api/admin/games/69b7fba7cbfe780b4c63c7d0')->assertOk()->assertJsonPath('name', 'Legacy');
    }

    public function test_unknown_id_is_404(): void
    {
        $this->actAs();
        $this->getJson('/api/admin/games/nope')->assertStatus(404);
    }
}

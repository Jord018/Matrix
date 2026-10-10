<?php

namespace Tests\Feature;

use App\Models\Game;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Concerns\BackOfficeSchema;
use Tests\TestCase;

class AdminGameDeleteTest extends TestCase
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
        $this->deleteJson("/api/admin/games/{$game->id}")->assertStatus(401);
        $this->actAs('customer');
        $this->deleteJson("/api/admin/games/{$game->id}")->assertStatus(403);
        $this->assertSame(1, Game::count());
    }

    public function test_deletes_only_the_given_game(): void
    {
        $a = Game::create(['name' => 'A']);
        Game::create(['name' => 'B']);
        $this->actAs();
        $this->deleteJson("/api/admin/games/{$a->id}")->assertOk();
        $this->assertSame(['B'], Game::pluck('name')->all());
    }

    public function test_unknown_game_is_404(): void
    {
        $this->actAs();
        $this->deleteJson('/api/admin/games/nope')->assertStatus(404);
    }
}

<?php

namespace Tests\Feature;

use App\Models\Game;
use App\Models\Highlight;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Concerns\BackOfficeSchema;
use Tests\TestCase;

class AdminHighlightIndexTest extends TestCase
{
    use BackOfficeSchema, RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->createSchema();
    }

    public function test_requires_admin(): void
    {
        $this->getJson('/api/admin/highlights')->assertStatus(401);
        $this->actAs('customer');
        $this->getJson('/api/admin/highlights')->assertStatus(403);
    }

    public function test_returns_highlights_and_game_options(): void
    {
        $zed = Game::create(['name' => 'Zed']);
        $alpha = Game::create(['name' => 'Alpha']);
        Highlight::create(['gameId' => $zed->id, 'name' => 'Zed', 'customImage' => 'http://x/b.png', 'buttonColor' => '#fff']);
        $this->actAs();

        $this->getJson('/api/admin/highlights')->assertOk()
            ->assertJsonCount(1, 'highlights')
            ->assertJsonPath('highlights.0.buttonColor', '#fff')
            ->assertJsonPath('games.0.name', 'Alpha')
            ->assertJsonPath('games.0.id', $alpha->id)
            ->assertJsonPath('games.1.name', 'Zed');
    }

    public function test_empty_state(): void
    {
        $this->actAs();
        $this->getJson('/api/admin/highlights')->assertOk()->assertExactJson(['highlights' => [], 'games' => []]);
    }
}

<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Game;
use Tests\Concerns\BackOfficeSchema;
use Tests\TestCase;

class AdminGameUpdateTest extends TestCase
{
    use BackOfficeSchema;

    private Game $game;

    protected function setUp(): void
    {
        parent::setUp();
        Category::create(['name' => 'RPG']);
        Category::create(['name' => 'Action']);
        $this->game = Game::create([
            'name' => 'Old', 'price' => 1, 'stock' => 1, 'categories' => ['RPG'],
            'screenshots' => ['http://x/1.png'], 'description' => 'old',
        ]);
    }

    private function payload(array $over = []): array
    {
        return $over + ['name' => 'New', 'price' => 20, 'stock' => 9, 'categories' => ['Action'], 'screenshots' => []];
    }

    public function test_requires_admin(): void
    {
        $this->putJson("/api/admin/games/{$this->game->id}", $this->payload())->assertStatus(401);
        $this->actAs('customer');
        $this->putJson("/api/admin/games/{$this->game->id}", $this->payload())->assertStatus(403);
    }

    public function test_updates_and_can_clear_lists(): void
    {
        $this->actAs();
        $this->putJson("/api/admin/games/{$this->game->id}", $this->payload())->assertOk()
            ->assertJsonPath('name', 'New');

        $fresh = $this->game->fresh();
        $this->assertSame(20.0, $fresh->price);
        $this->assertSame(['Action'], $fresh->categories);
        $this->assertSame([], $fresh->screenshots);
    }

    public function test_omitted_lists_are_cleared(): void
    {
        $this->actAs();
        $this->putJson("/api/admin/games/{$this->game->id}", ['name' => 'N', 'price' => 1, 'stock' => 1])->assertOk();
        $this->assertSame([], $this->game->fresh()->categories);
    }

    public function test_validation_failure_leaves_game_untouched(): void
    {
        $this->actAs();
        $this->putJson("/api/admin/games/{$this->game->id}", $this->payload(['price' => -5]))
            ->assertStatus(422)->assertJsonValidationErrors('price');
        $this->assertSame('Old', $this->game->fresh()->name);
    }

    public function test_unknown_game_is_404(): void
    {
        $this->actAs();
        $this->putJson('/api/admin/games/nope', $this->payload())->assertStatus(404);
    }
}

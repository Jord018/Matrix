<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Game;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Concerns\BackOfficeSchema;
use Tests\TestCase;

class AdminCategoryVisibilityTest extends TestCase
{
    use BackOfficeSchema, RefreshDatabase;

    private Category $rpg;

    protected function setUp(): void
    {
        parent::setUp();
        $this->createSchema();
        $this->rpg = Category::create(['name' => 'RPG']);
    }

    public function test_requires_admin(): void
    {
        $url = "/api/admin/categories/{$this->rpg->id}/visibility";
        $this->patchJson($url, ['isVisible' => false])->assertStatus(401);
        $this->actAs('customer');
        $this->patchJson($url, ['isVisible' => false])->assertStatus(403);
        $this->getJson("/api/admin/categories/{$this->rpg->id}/games")->assertStatus(403);
    }

    public function test_toggles_visibility_both_ways(): void
    {
        $this->actAs();
        $url = "/api/admin/categories/{$this->rpg->id}/visibility";

        $this->patchJson($url, ['isVisible' => false])->assertOk()->assertJsonPath('isVisible', false);
        $this->assertFalse($this->rpg->fresh()->isVisible);
        $this->patchJson($url, ['isVisible' => true])->assertOk();
        $this->assertTrue($this->rpg->fresh()->isVisible);
    }

    public function test_requires_a_boolean(): void
    {
        $this->actAs();
        $url = "/api/admin/categories/{$this->rpg->id}/visibility";
        $this->patchJson($url, [])->assertStatus(422);
        $this->patchJson($url, ['isVisible' => 'maybe'])->assertStatus(422);
    }

    public function test_unknown_category_is_404(): void
    {
        $this->actAs();
        $this->patchJson('/api/admin/categories/nope/visibility', ['isVisible' => true])->assertStatus(404);
    }

    public function test_lists_games_in_category_sorted_z_to_a(): void
    {
        Game::create(['name' => 'Alpha', 'categories' => ['RPG']]);
        Game::create(['name' => 'Zed', 'categories' => ['RPG', 'Action']]);
        Game::create(['name' => 'Other', 'categories' => ['Action']]);
        $this->actAs();

        $this->getJson("/api/admin/categories/{$this->rpg->id}/games")->assertOk()
            ->assertJsonCount(2)->assertJsonPath('0.name', 'Zed')->assertJsonPath('1.name', 'Alpha');
    }
}

<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Game;
use Tests\Concerns\BackOfficeSchema;
use Tests\TestCase;

class AdminCategoryVisibilityTest extends TestCase
{
    use BackOfficeSchema;

    private Category $rpg;

    protected function setUp(): void
    {
        parent::setUp();
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

    public function test_toggling_visibility_hides_category_and_games_from_storefront(): void
    {
        Game::create(['name' => 'Dragon Quest', 'categories' => ['RPG']]);
        Game::create(['name' => 'Street Fighter', 'categories' => ['Fighting']]);
        Category::create(['name' => 'Fighting']);

        // Before toggle: RPG category and RPG game are visible in store
        $this->getJson('/api/categories')->assertOk()->assertJsonFragment(['name' => 'RPG']);
        $this->getJson('/api/games')->assertOk()->assertJsonFragment(['name' => 'Dragon Quest']);

        // Admin toggles RPG visibility to false
        $this->actAs();
        $this->patchJson("/api/admin/categories/{$this->rpg->id}/visibility", ['isVisible' => false])->assertOk();

        // After toggle: RPG category and Dragon Quest game are HIDDEN from storefront
        $this->getJson('/api/categories')->assertOk()
            ->assertJsonMissing(['name' => 'RPG'])
            ->assertJsonFragment(['name' => 'Fighting']);

        $this->getJson('/api/games')->assertOk()
            ->assertJsonMissing(['name' => 'Dragon Quest'])
            ->assertJsonFragment(['name' => 'Street Fighter']);

        // Toggle back to true
        $this->patchJson("/api/admin/categories/{$this->rpg->id}/visibility", ['isVisible' => true])->assertOk();
        $this->getJson('/api/categories')->assertOk()->assertJsonFragment(['name' => 'RPG']);
        $this->getJson('/api/games')->assertOk()->assertJsonFragment(['name' => 'Dragon Quest']);
    }
}

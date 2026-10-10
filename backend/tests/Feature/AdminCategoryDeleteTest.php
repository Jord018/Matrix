<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Game;
use Tests\Concerns\BackOfficeSchema;
use Tests\TestCase;

class AdminCategoryDeleteTest extends TestCase
{
    use BackOfficeSchema;

    protected function setUp(): void
    {
        parent::setUp();
    }

    public function test_requires_admin(): void
    {
        $c = Category::create(['name' => 'RPG']);
        $this->deleteJson("/api/admin/categories/{$c->id}")->assertStatus(401);
        $this->actAs('customer');
        $this->deleteJson("/api/admin/categories/{$c->id}")->assertStatus(403);
        $this->assertSame(1, Category::count());
    }

    public function test_deletes_category_and_removes_it_from_games(): void
    {
        $rpg = Category::create(['name' => 'RPG']);
        Category::create(['name' => 'Action']);
        $a = Game::create(['name' => 'A', 'categories' => ['RPG', 'Action']]);
        $b = Game::create(['name' => 'B', 'categories' => ['RPG']]);
        $c = Game::create(['name' => 'C', 'categories' => ['Action']]);
        $this->actAs();

        $this->deleteJson("/api/admin/categories/{$rpg->id}")->assertOk();

        $this->assertSame(['Action'], Category::pluck('name')->all());
        $this->assertSame(['Action'], $a->fresh()->categories);
        $this->assertSame([], $b->fresh()->categories);
        $this->assertSame(['Action'], $c->fresh()->categories);
    }

    public function test_unknown_category_is_404(): void
    {
        $this->actAs();
        $this->deleteJson('/api/admin/categories/nope')->assertStatus(404);
    }
}

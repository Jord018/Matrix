<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Game;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Concerns\BackOfficeSchema;
use Tests\TestCase;

class AdminCategoryRenameTest extends TestCase
{
    use BackOfficeSchema, RefreshDatabase;

    private Category $rpg;

    protected function setUp(): void
    {
        parent::setUp();
        $this->createSchema();
        $this->rpg = Category::create(['name' => 'RPG']);
        Category::create(['name' => 'Action']);
    }

    public function test_requires_admin(): void
    {
        $this->putJson("/api/admin/categories/{$this->rpg->id}", ['name' => 'X'])->assertStatus(401);
        $this->actAs('customer');
        $this->putJson("/api/admin/categories/{$this->rpg->id}", ['name' => 'X'])->assertStatus(403);
    }

    public function test_renames_and_updates_every_game_using_it(): void
    {
        $a = Game::create(['name' => 'A', 'categories' => ['Action', 'RPG']]);
        $b = Game::create(['name' => 'B', 'categories' => ['RPG']]);
        $c = Game::create(['name' => 'C', 'categories' => ['Action']]);
        $d = Game::create(['name' => 'D']);
        $this->actAs();

        $this->putJson("/api/admin/categories/{$this->rpg->id}", ['name' => 'Role Playing'])
            ->assertOk()->assertJsonPath('name', 'Role Playing');

        $this->assertSame('Role Playing', $this->rpg->fresh()->name);
        $this->assertSame(['Action', 'Role Playing'], $a->fresh()->categories);
        $this->assertSame(['Role Playing'], $b->fresh()->categories);
        $this->assertSame(['Action'], $c->fresh()->categories);
        $this->assertSame([], $d->fresh()->categories);
    }

    public function test_keeping_the_same_name_is_allowed(): void
    {
        $this->actAs();
        $this->putJson("/api/admin/categories/{$this->rpg->id}", ['name' => 'RPG'])->assertOk();
    }

    public function test_rejects_empty_or_taken_name(): void
    {
        $this->actAs();
        $this->putJson("/api/admin/categories/{$this->rpg->id}", ['name' => ''])->assertStatus(422);
        $this->putJson("/api/admin/categories/{$this->rpg->id}", ['name' => 'Action'])->assertStatus(422);
        $this->assertSame('RPG', $this->rpg->fresh()->name);
    }

    public function test_unknown_category_is_404(): void
    {
        $this->actAs();
        $this->putJson('/api/admin/categories/nope', ['name' => 'X'])->assertStatus(404);
    }
}

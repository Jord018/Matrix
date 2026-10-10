<?php

namespace Tests\Feature;

use App\Models\Category;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Concerns\BackOfficeSchema;
use Tests\TestCase;

class AdminCategoryStoreTest extends TestCase
{
    use BackOfficeSchema, RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->createSchema();
    }

    public function test_requires_admin(): void
    {
        $this->postJson('/api/admin/categories', ['name' => 'RPG'])->assertStatus(401);
        $this->actAs('customer');
        $this->postJson('/api/admin/categories', ['name' => 'RPG'])->assertStatus(403);
    }

    public function test_creates_visible_category(): void
    {
        $this->actAs();
        $this->postJson('/api/admin/categories', ['name' => 'RPG'])->assertCreated()
            ->assertJsonPath('name', 'RPG')->assertJsonPath('isVisible', true);
        $this->assertTrue(Category::first()->isVisible);
    }

    public function test_rejects_empty_name(): void
    {
        $this->actAs();
        $this->postJson('/api/admin/categories', ['name' => ''])->assertStatus(422)->assertJsonValidationErrors('name');
    }

    public function test_rejects_duplicate_name(): void
    {
        Category::create(['name' => 'RPG']);
        $this->actAs();
        $this->postJson('/api/admin/categories', ['name' => 'RPG'])->assertStatus(422)->assertJsonValidationErrors('name');
        $this->assertSame(1, Category::count());
    }
}

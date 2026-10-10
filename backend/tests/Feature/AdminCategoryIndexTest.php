<?php

namespace Tests\Feature;

use App\Models\Category;
use Tests\Concerns\BackOfficeSchema;
use Tests\TestCase;

class AdminCategoryIndexTest extends TestCase
{
    use BackOfficeSchema;

    protected function setUp(): void
    {
        parent::setUp();
    }

    public function test_requires_admin(): void
    {
        $this->getJson('/api/admin/categories')->assertStatus(401);
        $this->actAs('customer');
        $this->getJson('/api/admin/categories')->assertStatus(403);
    }

    public function test_lists_categories_by_name_with_visibility(): void
    {
        Category::create(['name' => 'RPG', 'isVisible' => false]);
        Category::create(['name' => 'Action']);
        $this->actAs();

        $this->getJson('/api/admin/categories')->assertOk()
            ->assertJsonCount(2)
            ->assertJsonPath('0.name', 'Action')
            ->assertJsonPath('0.isVisible', true)
            ->assertJsonPath('1.name', 'RPG')
            ->assertJsonPath('1.isVisible', false);
    }
}

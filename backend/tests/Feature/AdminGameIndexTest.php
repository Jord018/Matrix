<?php

namespace Tests\Feature;

use App\Models\Game;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Concerns\BackOfficeSchema;
use Tests\TestCase;

class AdminGameIndexTest extends TestCase
{
    use BackOfficeSchema, RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->createSchema();

        foreach (['Alpha Quest', 'Zelda 100%', 'Mario'] as $name) {
            Game::create(['name' => $name, 'price' => 10, 'stock' => 3, 'categories' => ['RPG']]);
        }
    }

    public function test_guest_is_unauthorized(): void
    {
        $this->getJson('/api/admin/games')->assertStatus(401);
    }

    public function test_customer_is_forbidden(): void
    {
        $this->actAs('customer');
        $this->getJson('/api/admin/games')->assertStatus(403);
    }

    public function test_admin_gets_all_games_sorted_z_to_a(): void
    {
        $this->actAs('admin');
        $this->getJson('/api/admin/games')->assertOk()
            ->assertJsonCount(3)
            ->assertJsonPath('0.name', 'Zelda 100%')
            ->assertJsonPath('2.name', 'Alpha Quest')
            ->assertJsonPath('0.categories', ['RPG']);
    }

    public function test_search_is_case_insensitive_substring(): void
    {
        $this->actAs('admin');
        $this->getJson('/api/admin/games?search=ALPHA')->assertOk()
            ->assertJsonCount(1)->assertJsonPath('0.name', 'Alpha Quest');
    }

    public function test_search_treats_wildcards_literally(): void
    {
        $this->actAs('admin');
        $this->getJson('/api/admin/games?search=100%25')->assertOk()->assertJsonCount(1);
        $this->getJson('/api/admin/games?search=%25')->assertOk()->assertJsonCount(1);
        $this->getJson('/api/admin/games?search=_')->assertOk()->assertJsonCount(0);
    }

    public function test_search_with_no_match_returns_empty_list(): void
    {
        $this->actAs('admin');
        $this->getJson('/api/admin/games?search=nothing')->assertOk()->assertExactJson([]);
    }
}

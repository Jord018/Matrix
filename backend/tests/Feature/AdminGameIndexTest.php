<?php

namespace Tests\Feature;

use App\Models\Account;
use App\Models\Game;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

class AdminGameIndexTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        // Existing Supabase tables have no migrations.
        Schema::create('Account', function ($t) {
            $t->uuid('id')->primary();
            $t->string('Username');
            $t->string('Email');
            $t->string('PasswordHash');
            $t->string('Role')->default('customer');
            $t->timestamp('createdAt')->nullable();
        });
        Schema::create('games', function ($t) {
            $t->uuid('id')->primary();
            $t->string('name');
            $t->text('description')->nullable();
            $t->text('coverImage')->nullable();
            $t->text('screenshots')->nullable();
            $t->text('categories')->nullable();
            $t->decimal('price')->nullable();
            $t->integer('stock')->default(0);
            $t->decimal('rating')->nullable();
            $t->bigInteger('igdbId')->nullable();
            $t->json('systemRequirements')->nullable();
        });

        foreach (['Alpha Quest', 'Zelda 100%', 'Mario'] as $name) {
            Game::create(['name' => $name, 'price' => 10, 'stock' => 3, 'categories' => ['RPG']]);
        }
    }

    private function actAs(string $role): void
    {
        $this->actingAs(Account::create([
            'Username' => $role, 'Email' => "$role@x.com", 'PasswordHash' => 'x', 'Role' => $role,
        ]), 'sanctum');
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

<?php

namespace Tests\Feature;

use App\Models\CategorySetting;
use App\Models\Game;
use App\Models\Highlight;
use Tests\Concerns\BackOfficeSchema;
use Tests\TestCase;

class CatalogApiTest extends TestCase
{
    use BackOfficeSchema;

    public function test_get_categories_returns_only_visible_categories_ordered_by_name(): void
    {
        CategorySetting::create(['name' => 'Strategy', 'isVisible' => true]);
        CategorySetting::create(['name' => 'Action', 'isVisible' => true]);
        CategorySetting::create(['name' => 'Hidden Secret', 'isVisible' => false]);

        $response = $this->getJson('/api/categories');

        $response->assertOk()
            ->assertJsonCount(2)
            ->assertJsonPath('0.name', 'Action')
            ->assertJsonPath('1.name', 'Strategy')
            ->assertJsonMissing(['name' => 'Hidden Secret']);
    }

    public function test_get_highlights_returns_all_highlights(): void
    {
        $game = Game::create([
            'name' => 'Featured Legend',
            'price' => 59.99,
            'stock' => 10,
        ]);

        Highlight::create([
            'gameId' => $game->id,
            'name' => 'Top Game 1',
            'customImage' => 'https://example.com/h1.png',
            'buttonColor' => '#FF0000',
        ]);

        Highlight::create([
            'gameId' => $game->id,
            'name' => 'Top Game 2',
            'customImage' => 'https://example.com/h2.png',
            'buttonColor' => '#00FF00',
        ]);

        $response = $this->getJson('/api/highlights');

        $response->assertOk()
            ->assertJsonCount(2)
            ->assertJsonPath('0.name', 'Top Game 1')
            ->assertJsonPath('0.customImage', 'https://example.com/h1.png')
            ->assertJsonPath('0.buttonColor', '#FF0000')
            ->assertJsonPath('1.name', 'Top Game 2');
    }

    public function test_get_games_without_filters_returns_all_games(): void
    {
        Game::create([
            'name' => 'Elden Ring',
            'price' => 59.99,
            'stock' => 20,
            'categories' => ['RPG', 'Action'],
        ]);

        Game::create([
            'name' => 'Hades',
            'price' => 24.99,
            'stock' => 15,
            'categories' => ['Action', 'Rogue-like'],
        ]);

        $response = $this->getJson('/api/games');

        $response->assertOk()
            ->assertJsonCount(2)
            ->assertJsonFragment(['name' => 'Elden Ring'])
            ->assertJsonFragment(['name' => 'Hades']);
    }

    public function test_get_games_filters_by_category(): void
    {
        Game::create([
            'name' => 'RPG Quest',
            'price' => 30.00,
            'stock' => 10,
            'categories' => ['RPG', 'Fantasy'],
        ]);

        Game::create([
            'name' => 'Forza Horizon',
            'price' => 45.00,
            'stock' => 10,
            'categories' => ['Racing', 'Sports'],
        ]);

        $rpgResponse = $this->getJson('/api/games?category=RPG');
        $rpgResponse->assertOk()
            ->assertJsonCount(1)
            ->assertJsonPath('0.name', 'RPG Quest');

        $racingResponse = $this->getJson('/api/games?category=Racing');
        $racingResponse->assertOk()
            ->assertJsonCount(1)
            ->assertJsonPath('0.name', 'Forza Horizon');
    }

    public function test_get_games_searches_by_keyword_case_insensitive(): void
    {
        Game::create([
            'name' => 'Cyberpunk 2077',
            'price' => 49.99,
            'stock' => 10,
        ]);

        Game::create([
            'name' => 'The Witcher 3',
            'price' => 29.99,
            'stock' => 10,
        ]);

        // Search with ?q= query param
        $qResponse = $this->getJson('/api/games?q=CYBER');
        $qResponse->assertOk()
            ->assertJsonCount(1)
            ->assertJsonPath('0.name', 'Cyberpunk 2077');

        // Search with ?search= query param
        $searchResponse = $this->getJson('/api/games?search=witcher');
        $searchResponse->assertOk()
            ->assertJsonCount(1)
            ->assertJsonPath('0.name', 'The Witcher 3');

        // Search via /api/search alias route
        $aliasResponse = $this->getJson('/api/search?q=cyberpunk');
        $aliasResponse->assertOk()
            ->assertJsonCount(1)
            ->assertJsonPath('0.name', 'Cyberpunk 2077');
    }

    public function test_search_also_matches_category_names_like_the_old_store(): void
    {
        Game::create(['name' => 'Hades', 'price' => 10, 'stock' => 5, 'categories' => ['Roguelike']]);
        Game::create(['name' => 'Tetris', 'price' => 10, 'stock' => 5, 'categories' => ['Puzzle']]);

        $this->getJson('/api/search?q=rogue')
            ->assertOk()
            ->assertJsonCount(1)
            ->assertJsonPath('0.name', 'Hades');
    }

    public function test_get_games_supports_limit_and_pagination(): void
    {
        Game::create(['name' => 'Game A', 'price' => 10, 'stock' => 5]);
        Game::create(['name' => 'Game B', 'price' => 20, 'stock' => 5]);
        Game::create(['name' => 'Game C', 'price' => 30, 'stock' => 5]);

        // Test with limit query param
        $limitResponse = $this->getJson('/api/games?limit=2');
        $limitResponse->assertOk()
            ->assertJsonCount(2);

        // Test with page query param (paginator structure)
        $pageResponse = $this->getJson('/api/games?page=1&limit=2');
        $pageResponse->assertOk()
            ->assertJsonStructure([
                'current_page',
                'data',
                'total',
                'per_page',
            ])
            ->assertJsonCount(2, 'data')
            ->assertJsonPath('total', 3);
    }

    public function test_get_game_by_id_returns_game_details(): void
    {
        $game = Game::create([
            'name' => 'Stardew Valley',
            'description' => 'Farming simulation RPG',
            'coverImage' => 'https://example.com/stardew.jpg',
            'screenshots' => ['https://example.com/s1.jpg'],
            'categories' => ['Simulation', 'RPG'],
            'price' => 14.99,
            'stock' => 100,
            'rating' => 9.8,
            'systemRequirements' => ['os' => 'Windows 10'],
        ]);

        $response = $this->getJson("/api/games/{$game->id}");

        $response->assertOk()
            ->assertJsonPath('id', $game->id)
            ->assertJsonPath('name', 'Stardew Valley')
            ->assertJsonPath('price', 14.99)
            ->assertJsonPath('categories', ['Simulation', 'RPG'])
            ->assertJsonPath('systemRequirements.os', 'Windows 10');
    }

    public function test_get_game_by_id_returns_404_when_not_found(): void
    {
        $response = $this->getJson('/api/games/non-existent-uuid');

        $response->assertStatus(404)
            ->assertJson(['message' => 'Game not found']);
    }
}

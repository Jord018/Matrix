<?php

namespace Tests\Feature;

use App\Models\CategorySetting;
use App\Models\Game;
use App\Models\Highlight;
use Illuminate\Support\Facades\Cache;
use Tests\Concerns\BackOfficeSchema;
use Tests\TestCase;

class CatalogCacheTest extends TestCase
{
    use BackOfficeSchema;

    public function test_categories_are_cached_and_invalidated_on_model_change(): void
    {
        CategorySetting::create(['name' => 'Strategy', 'isVisible' => true]);

        $res1 = $this->getJson('/api/categories');
        $res1->assertOk()->assertJsonCount(1);
        $this->assertTrue(Cache::has('catalog.categories'));

        // Modifying model should automatically flush catalog cache
        CategorySetting::create(['name' => 'Adventure', 'isVisible' => true]);
        $this->assertFalse(Cache::has('catalog.categories'));

        $res2 = $this->getJson('/api/categories');
        $res2->assertOk()->assertJsonCount(2);
    }

    public function test_highlights_are_cached_and_invalidated_on_model_change(): void
    {
        $game = Game::create(['name' => 'Hero Game', 'price' => 50, 'stock' => 10]);
        Highlight::create(['gameId' => $game->id, 'name' => 'Highlight 1']);

        $res1 = $this->getJson('/api/highlights');
        $res1->assertOk()->assertJsonCount(1);
        $this->assertTrue(Cache::has('catalog.highlights'));

        Highlight::create(['gameId' => $game->id, 'name' => 'Highlight 2']);
        $this->assertFalse(Cache::has('catalog.highlights'));

        $res2 = $this->getJson('/api/highlights');
        $res2->assertOk()->assertJsonCount(2);
    }

    public function test_games_are_cached_and_invalidated_on_game_save(): void
    {
        Game::create(['name' => 'Game 1', 'price' => 10, 'stock' => 5]);

        $res1 = $this->getJson('/api/games');
        $res1->assertOk()->assertJsonCount(1);

        $cacheKey = 'catalog.games.'.hash('sha256', url('/api/games'));
        $this->assertTrue(Cache::has($cacheKey));

        Game::create(['name' => 'Game 2', 'price' => 20, 'stock' => 5]);
        $this->assertFalse(Cache::has($cacheKey));

        $res2 = $this->getJson('/api/games');
        $res2->assertOk()->assertJsonCount(2);
    }
}

<?php

namespace Tests\Unit;

use App\Models\CategorySetting;
use App\Models\Game;
use App\Models\Highlight;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Tests\Concerns\BackOfficeSchema;
use Tests\TestCase;

class GameTest extends TestCase
{
    use BackOfficeSchema;

    protected function setUp(): void
    {
        parent::setUp();
    }

    public function test_model_configuration(): void
    {
        $game = new Game;

        $this->assertSame('games', $game->getTable());
        $this->assertSame('id', $game->getKeyName());
        $this->assertSame('string', $game->getKeyType());
        $this->assertFalse($game->getIncrementing());
        $this->assertFalse($game->timestamps);

        $expectedFillable = [
            'id',
            'name',
            'description',
            'coverImage',
            'screenshots',
            'categories',
            'price',
            'stock',
            'rating',
            'igdbId',
            'systemRequirements',
            'game_id',
        ];
        $this->assertSame($expectedFillable, $game->getFillable());
    }

    public function test_attribute_casts_and_persisting(): void
    {
        $game = Game::create([
            'name' => 'Cyber Adventure',
            'description' => 'A futuristic RPG',
            'coverImage' => 'https://example.com/cover.png',
            'screenshots' => ['https://example.com/1.png', 'https://example.com/2.png'],
            'categories' => ['RPG', 'Action'],
            'price' => '49.99',
            'stock' => '25',
            'rating' => '9.5',
            'igdbId' => '123456',
            'systemRequirements' => [
                'os' => 'Windows 11',
                'processor' => 'i7-12700K',
                'memory' => '16 GB',
                'graphics' => 'RTX 3070',
                'storage' => '50 GB',
            ],
        ]);

        $game->game_id = 'game-101';

        $this->assertNotEmpty($game->id);
        $this->assertSame('Cyber Adventure', $game->name);
        $this->assertSame(49.99, $game->price);
        $this->assertSame(25, $game->stock);
        $this->assertSame(9.5, $game->rating);
        $this->assertSame(123456, $game->igdbId);
        $this->assertIsArray($game->screenshots);
        $this->assertSame(['https://example.com/1.png', 'https://example.com/2.png'], $game->screenshots);
        $this->assertIsArray($game->categories);
        $this->assertSame(['RPG', 'Action'], $game->categories);
        $this->assertIsArray($game->systemRequirements);
        $this->assertSame('Windows 11', $game->systemRequirements['os']);
        $this->assertSame('game-101', $game->game_id);

        $fresh = Game::find($game->id);
        $this->assertNotNull($fresh);
        $this->assertSame(49.99, $fresh->price);
        $this->assertSame(25, $fresh->stock);
        $this->assertSame(9.5, $fresh->rating);
        $this->assertSame(123456, $fresh->igdbId);
        $this->assertSame(['RPG', 'Action'], $fresh->categories);
        $this->assertSame('i7-12700K', $fresh->systemRequirements['processor']);
    }

    public function test_custom_legacy_string_id(): void
    {
        $legacyId = '507f1f77bcf86cd799439011';
        $game = Game::create([
            'id' => $legacyId,
            'name' => 'Legacy Game',
            'price' => 20,
            'stock' => 5,
        ]);

        $this->assertSame($legacyId, $game->id);
        $found = Game::find($legacyId);
        $this->assertNotNull($found);
        $this->assertSame($legacyId, $found->id);
    }

    public function test_highlights_relation(): void
    {
        $game = Game::create([
            'name' => 'Featured Masterpiece',
            'price' => 60,
            'stock' => 10,
        ]);

        $relation = $game->highlights();
        $this->assertInstanceOf(HasMany::class, $relation);
        $this->assertSame('gameId', $relation->getForeignKeyName());

        $highlight = Highlight::create([
            'gameId' => $game->id,
            'name' => 'Banner Highlight',
            'customImage' => 'https://example.com/banner.jpg',
            'buttonColor' => '#FF0000',
        ]);

        $this->assertCount(1, $game->highlights);
        $this->assertSame($highlight->id, $game->highlights->first()->id);
    }

    public function test_with_category_helper(): void
    {
        Game::create([
            'name' => 'RPG Quest',
            'categories' => ['RPG', 'Fantasy'],
            'price' => 30,
            'stock' => 10,
        ]);

        Game::create([
            'name' => 'Space Shooter',
            'categories' => ['Shooter', 'Sci-Fi'],
            'price' => 40,
            'stock' => 10,
        ]);

        $rpgGames = Game::withCategory('RPG');
        $this->assertCount(1, $rpgGames);
        $this->assertSame('RPG Quest', $rpgGames->first()->name);

        $empty = Game::withCategory('NonExistent');
        $this->assertCount(0, $empty);
    }

    public function test_scope_visible(): void
    {
        CategorySetting::create(['name' => 'RPG', 'isVisible' => true]);
        CategorySetting::create(['name' => 'Adult', 'isVisible' => false]);

        $visibleGame = Game::create([
            'name' => 'Family RPG',
            'categories' => ['RPG'],
            'price' => 20,
            'stock' => 5,
        ]);

        $query = Game::query();
        $visibleGame->scopeVisible($query);
        $this->assertInstanceOf(Builder::class, $query);
    }
}

<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Game;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\Concerns\BackOfficeSchema;
use Tests\TestCase;

class AdminGameStoreTest extends TestCase
{
    use BackOfficeSchema;

    protected function setUp(): void
    {
        parent::setUp();
        Category::create(['name' => 'RPG']);
    }

    private function valid(array $over = []): array
    {
        return $over + [
            'name' => 'New Game', 'price' => 99.5, 'stock' => 4, 'coverImage' => 'http://x/c.png',
            'screenshots' => ['http://x/1.png'], 'categories' => ['RPG'], 'description' => 'd',
            'systemRequirements' => ['os' => 'Win', 'processor' => 'i5', 'memory' => '8', 'graphics' => 'gtx', 'storage' => '10'],
        ];
    }

    public function test_requires_admin(): void
    {
        $this->postJson('/api/admin/games', $this->valid())->assertStatus(401);
        $this->actAs('customer');
        $this->postJson('/api/admin/games', $this->valid())->assertStatus(403);
    }

    public function test_creates_game(): void
    {
        $this->actAs();
        $this->postJson('/api/admin/games', $this->valid())->assertCreated()
            ->assertJsonPath('name', 'New Game')->assertJsonPath('categories', ['RPG']);

        $game = Game::first();
        $this->assertSame(99.5, $game->price);
        $this->assertSame('i5', $game->systemRequirements['processor']);
    }

    public function test_optional_fields_default_to_empty_lists(): void
    {
        $this->actAs();
        $this->postJson('/api/admin/games', ['name' => 'Bare', 'price' => 0, 'stock' => 0])->assertCreated()
            ->assertJsonPath('screenshots', [])->assertJsonPath('categories', []);
    }

    #[DataProvider('invalidPayloads')]
    public function test_rejects_invalid_input(string $field, array $payload): void
    {
        $this->actAs();
        $this->postJson('/api/admin/games', $this->valid($payload))->assertStatus(422)->assertJsonValidationErrors($field);
        $this->assertSame(0, Game::count());
    }

    public static function invalidPayloads(): array
    {
        return [
            'no name' => ['name', ['name' => '']],
            'negative price' => ['price', ['price' => -1]],
            'text price' => ['price', ['price' => 'abc']],
            'negative stock' => ['stock', ['stock' => -1]],
            'fractional stock' => ['stock', ['stock' => 1.5]],
            'bad cover url' => ['coverImage', ['coverImage' => 'nope']],
            'too many screenshots' => ['screenshots', ['screenshots' => array_fill(0, 6, 'http://x/a.png')]],
            'bad screenshot url' => ['screenshots.0', ['screenshots' => ['nope']]],
            'unknown category' => ['categories.0', ['categories' => ['Nope']]],
        ];
    }
}

<?php

namespace Tests\Unit;

use App\Models\Game;
use App\Models\Highlight;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Tests\Concerns\BackOfficeSchema;
use Tests\TestCase;

class HighlightTest extends TestCase
{
    use BackOfficeSchema;

    protected function setUp(): void
    {
        parent::setUp();
    }

    public function test_model_configuration(): void
    {
        $highlight = new Highlight;

        $this->assertSame('highlights', $highlight->getTable());
        $this->assertSame('id', $highlight->getKeyName());
        $this->assertSame('string', $highlight->getKeyType());
        $this->assertFalse($highlight->getIncrementing());
        $this->assertFalse($highlight->timestamps);

        $expectedFillable = ['id', 'gameId', 'name', 'customImage', 'buttonColor'];
        $this->assertSame($expectedFillable, $highlight->getFillable());
    }

    public function test_create_and_find(): void
    {
        $game = Game::create([
            'name' => 'Featured Title',
            'price' => 59.99,
            'stock' => 50,
        ]);

        $highlight = Highlight::create([
            'gameId' => $game->id,
            'name' => 'Top Pick Of The Month',
            'customImage' => 'https://example.com/top.png',
            'buttonColor' => '#00FF00',
        ]);

        $this->assertNotEmpty($highlight->id);
        $this->assertSame($game->id, $highlight->gameId);
        $this->assertSame('Top Pick Of The Month', $highlight->name);
        $this->assertSame('https://example.com/top.png', $highlight->customImage);
        $this->assertSame('#00FF00', $highlight->buttonColor);

        $relation = $highlight->game();
        $this->assertInstanceOf(BelongsTo::class, $relation);
        $this->assertSame('gameId', $relation->getForeignKeyName());

        $this->assertNotNull($highlight->game);
        $this->assertSame($game->id, $highlight->game->id);
        $this->assertSame('Featured Title', $highlight->game->name);
    }

    public function test_custom_legacy_string_id(): void
    {
        $customId = 'highlight-legacy-id-01';
        $highlight = Highlight::create([
            'id' => $customId,
            'name' => 'Custom Highlight',
            'buttonColor' => '#123456',
        ]);

        $this->assertSame($customId, $highlight->id);
        $found = Highlight::find($customId);
        $this->assertNotNull($found);
        $this->assertSame($customId, $found->id);
    }
}

<?php

namespace Tests\Feature;

use App\Models\Game;
use App\Models\Highlight;
use Tests\Concerns\BackOfficeSchema;
use Tests\TestCase;

class AdminHighlightStoreTest extends TestCase
{
    use BackOfficeSchema;

    private Game $game;

    protected function setUp(): void
    {
        parent::setUp();
        $this->game = Game::create(['name' => 'Zelda', 'coverImage' => 'http://x/cover.png']);
    }

    public function test_requires_admin(): void
    {
        $this->postJson('/api/admin/highlights', ['gameId' => $this->game->id])->assertStatus(401);
        $this->actAs('customer');
        $this->postJson('/api/admin/highlights', ['gameId' => $this->game->id])->assertStatus(403);
    }

    public function test_defaults_to_cover_image_and_dark_red(): void
    {
        $this->actAs();
        $this->postJson('/api/admin/highlights', ['gameId' => $this->game->id])->assertCreated()
            ->assertJsonPath('name', 'Zelda')
            ->assertJsonPath('gameId', $this->game->id)
            ->assertJsonPath('customImage', 'http://x/cover.png')
            ->assertJsonPath('buttonColor', '#8b0000');
    }

    public function test_uses_given_image_and_color(): void
    {
        $this->actAs();
        $this->postJson('/api/admin/highlights', [
            'gameId' => $this->game->id, 'customImage' => 'http://x/banner.png', 'buttonColor' => '#00FF7f',
        ])->assertCreated()->assertJsonPath('customImage', 'http://x/banner.png')->assertJsonPath('buttonColor', '#00FF7f');
        $this->assertSame(1, Highlight::count());
    }

    public function test_rejects_bad_input(): void
    {
        $this->actAs();
        $this->postJson('/api/admin/highlights', [])->assertStatus(422)->assertJsonValidationErrors('gameId');
        $this->postJson('/api/admin/highlights', ['gameId' => 'nope'])->assertStatus(422)->assertJsonValidationErrors('gameId');
        $this->postJson('/api/admin/highlights', ['gameId' => $this->game->id, 'customImage' => 'x'])
            ->assertStatus(422)->assertJsonValidationErrors('customImage');
        $this->postJson('/api/admin/highlights', ['gameId' => $this->game->id, 'buttonColor' => 'red'])
            ->assertStatus(422)->assertJsonValidationErrors('buttonColor');
        $this->assertSame(0, Highlight::count());
    }
}

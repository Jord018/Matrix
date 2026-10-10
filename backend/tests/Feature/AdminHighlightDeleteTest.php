<?php

namespace Tests\Feature;

use App\Models\Highlight;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Concerns\BackOfficeSchema;
use Tests\TestCase;

class AdminHighlightDeleteTest extends TestCase
{
    use BackOfficeSchema, RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->createSchema();
    }

    public function test_requires_admin(): void
    {
        $h = Highlight::create(['name' => 'A']);
        $this->deleteJson("/api/admin/highlights/{$h->id}")->assertStatus(401);
        $this->actAs('customer');
        $this->deleteJson("/api/admin/highlights/{$h->id}")->assertStatus(403);
        $this->assertSame(1, Highlight::count());
    }

    public function test_deletes_only_that_highlight(): void
    {
        $a = Highlight::create(['name' => 'A']);
        Highlight::create(['name' => 'B']);
        $this->actAs();
        $this->deleteJson("/api/admin/highlights/{$a->id}")->assertOk();
        $this->assertSame(['B'], Highlight::pluck('name')->all());
    }

    public function test_unknown_highlight_is_404(): void
    {
        $this->actAs();
        $this->deleteJson('/api/admin/highlights/nope')->assertStatus(404);
    }
}

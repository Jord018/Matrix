<?php

namespace Tests\Feature;

use App\Models\Highlight;
use Tests\Concerns\BackOfficeSchema;
use Tests\TestCase;

class AdminHighlightDeleteTest extends TestCase
{
    use BackOfficeSchema;

    protected function setUp(): void
    {
        parent::setUp();
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

    public function test_deletes_a_highlight_with_a_legacy_non_uuid_id(): void
    {
        $highlight = new Highlight(['name' => 'Legacy']);
        $highlight->id = '69b7fba7cbfe780b4c63c7d2'; // id format of rows migrated from Mongo
        $highlight->save();
        $this->actAs();

        $this->deleteJson('/api/admin/highlights/69b7fba7cbfe780b4c63c7d2')->assertOk();
        $this->assertSame(0, Highlight::count());
    }

    public function test_unknown_highlight_is_404(): void
    {
        $this->actAs();
        $this->deleteJson('/api/admin/highlights/nope')->assertStatus(404);
    }
}

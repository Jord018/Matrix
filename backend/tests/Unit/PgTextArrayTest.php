<?php

namespace Tests\Unit;

use App\Casts\PgTextArray;
use App\Models\Game;
use PHPUnit\Framework\TestCase;

class PgTextArrayTest extends TestCase
{
    private PgTextArray $cast;

    private Game $model;

    protected function setUp(): void
    {
        parent::setUp();
        $this->cast = new PgTextArray;
        $this->model = new Game;
    }

    public function test_get_handles_null_and_empty(): void
    {
        $this->assertSame([], $this->cast->get($this->model, 'categories', null, []));
        $this->assertSame([], $this->cast->get($this->model, 'categories', '{}', []));
    }

    public function test_get_parses_postgres_text_arrays(): void
    {
        // Simple unquoted postgres array
        $this->assertSame(['Action', 'RPG'], $this->cast->get($this->model, 'categories', '{Action,RPG}', []));

        // Quoted postgres array
        $this->assertSame(['Racing', 'Shooter'], $this->cast->get($this->model, 'categories', '{"Racing","Shooter"}', []));

        // With commas and spaces inside quotes
        $this->assertSame(['Action, Adventure', 'Sci-Fi'], $this->cast->get($this->model, 'categories', '{"Action, Adventure","Sci-Fi"}', []));

        // With quotes escaped
        $this->assertSame(['He said "Hello"', 'Standard'], $this->cast->get($this->model, 'categories', '{"He said \\"Hello\\"","Standard"}', []));

        // With backslash
        $this->assertSame(['path\\to\\file'], $this->cast->get($this->model, 'categories', '{"path\\\\to\\\\file"}', []));
    }

    public function test_set_handles_null(): void
    {
        $this->assertNull($this->cast->set($this->model, 'categories', null, []));
    }

    public function test_set_handles_empty_array(): void
    {
        $this->assertSame('{}', $this->cast->set($this->model, 'categories', [], []));
    }

    public function test_roundtrip_serialization_and_deserialization(): void
    {
        $input = ['RPG', 'Action, Adventure', 'Says "Hi"', 'path\\test'];
        $serialized = $this->cast->set($this->model, 'categories', $input, []);

        $this->assertStringStartsWith('{', $serialized);
        $this->assertStringEndsWith('}', $serialized);

        $deserialized = $this->cast->get($this->model, 'categories', $serialized, []);
        $this->assertSame($input, $deserialized);
    }
}

<?php

namespace Tests\Unit;

use App\Casts\PgTextArray;
use App\Models\Game;
use PHPUnit\Framework\TestCase;

class ExampleTest extends TestCase
{
    public function test_pg_text_array_round_trips(): void
    {
        $cast = new PgTextArray;
        $values = ['Shooter', "Role-playing (RPG)", 'He said "hi"', 'a,b', 'back\slash'];

        $stored = $cast->set(new Game, 'categories', $values, []);

        $this->assertSame($values, $cast->get(new Game, 'categories', $stored, []));
        $this->assertSame([], $cast->get(new Game, 'categories', '{}', []));
        $this->assertSame(['Racing', 'Shooter'], $cast->get(new Game, 'categories', '{Racing,Shooter}', []));
    }
}

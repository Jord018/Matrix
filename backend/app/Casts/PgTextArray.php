<?php

namespace App\Casts;

use Illuminate\Contracts\Database\Eloquent\CastsAttributes;
use Illuminate\Database\Eloquent\Model;

/**
 * Postgres text[] <-> PHP array. Used by games.categories / games.screenshots.
 */
class PgTextArray implements CastsAttributes
{
    public function get(Model $model, string $key, mixed $value, array $attributes): array
    {
        if ($value === null || $value === '{}') {
            return [];
        }

        $items = str_getcsv(substr($value, 1, -1), ',', '"', '\\');

        return array_map(fn ($v) => str_replace(['\\"', '\\\\'], ['"', '\\'], $v), $items);
    }

    public function set(Model $model, string $key, mixed $value, array $attributes): ?string
    {
        if ($value === null) {
            return null;
        }

        $quoted = array_map(fn ($v) => '"'.addcslashes((string) $v, '"\\').'"', array_values($value));

        return '{'.implode(',', $quoted).'}';
    }
}

<?php

namespace App\Models;

use App\Casts\PgTextArray;
use App\Models\Concerns\AcceptsAnyStringId;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

class Game extends Model
{
    use AcceptsAnyStringId;

    public $timestamps = false;

    protected $fillable = [
        'name', 'description', 'coverImage', 'screenshots', 'categories',
        'price', 'stock', 'rating', 'igdbId', 'systemRequirements',
    ];

    protected $casts = [
        'screenshots' => PgTextArray::class,
        'categories' => PgTextArray::class,
        'systemRequirements' => 'array',
        'price' => 'float',
        'stock' => 'integer',
    ];

    /** Games that are not in any hidden category. */
    public function scopeVisible(Builder $query): void
    {
        $hidden = Category::where('isVisible', false)->pluck('name')->all();

        if ($hidden) {
            $query->whereRaw('NOT (coalesce(categories, \'{}\') && ?::text[])', [
                (new PgTextArray)->set($this, 'categories', $hidden, []),
            ]);
        }
    }

    /**
     * Games listing the given category. Filtered in PHP so it works on any driver (text[] has no portable operator).
     * ponytail: loads every game; use `? = ANY(categories)` on Postgres if the catalogue grows past a few thousand.
     */
    public static function withCategory(string $name): Collection
    {
        return static::all()->filter(fn (self $g) => in_array($name, $g->categories, true))->values();
    }
}

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
}

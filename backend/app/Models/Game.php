<?php

namespace App\Models;

use App\Casts\PgTextArray;
use App\Models\Concerns\AcceptsAnyStringId;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Game extends Model
{
    use AcceptsAnyStringId;

    protected $table = 'games';

    protected $primaryKey = 'id';

    protected $keyType = 'string';

    public $incrementing = false;

    public $timestamps = false;

    protected $fillable = [
        'id',
        'name',
        'description',
        'coverImage',
        'screenshots',
        'categories',
        'price',
        'stock',
        'rating',
        'igdbId',
        'systemRequirements',
        'game_id',
    ];

    protected $casts = [
        'screenshots' => PgTextArray::class,
        'categories' => PgTextArray::class,
        'systemRequirements' => 'array',
        'price' => 'float',
        'stock' => 'integer',
        'rating' => 'float',
        'igdbId' => 'integer',
    ];

    public function highlights(): HasMany
    {
        return $this->hasMany(Highlight::class, 'gameId');
    }

    /** Games that are not in any hidden category. */
    public function scopeVisible(Builder $query): void
    {
        $hidden = CategorySetting::where('isVisible', false)->pluck('name')->all();

        if (empty($hidden)) {
            return;
        }

        if ($query->getConnection()->getDriverName() === 'pgsql') {
            $query->whereRaw('NOT (coalesce(categories, \'{}\') && ?::text[])', [
                (new PgTextArray)->set($this, 'categories', $hidden, []),
            ]);
        } else {
            foreach ($hidden as $cat) {
                $query->where(function (Builder $q) use ($cat) {
                    $q->whereNull('categories')
                        ->orWhere(function (Builder $sub) use ($cat) {
                            $sub->where('categories', 'not like', '%"'.$cat.'"%')
                                ->where('categories', 'not like', '%'.$cat.'%');
                        });
                });
            }
        }
    }

    /**
     * Games listing the given category. Postgres filters in SQL (loading every game from Supabase took ~1s
     * and made the back-office category page look empty); other drivers (SQLite tests) filter in PHP.
     */
    public static function withCategory(string $name): Collection
    {
        if (static::query()->getConnection()->getDriverName() === 'pgsql') {
            return static::whereRaw('? = ANY(coalesce(categories, \'{}\'))', [$name])->get();
        }

        return static::all()->filter(fn (self $g) => is_array($g->categories) && in_array($name, $g->categories, true))->values();
    }
}

<?php

namespace App\Http\Controllers;

use App\Models\CategorySetting;
use App\Models\Game;
use App\Models\Highlight;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class CatalogController extends Controller
{
    /**
     * Cache TTL in seconds for public catalog data.
     */
    public const CACHE_TTL = 60;

    /**
     * GET /api/categories
     * Returns visible categories from category_settings table.
     */
    public function categories(): JsonResponse
    {
        $categories = Cache::remember('catalog.categories', self::CACHE_TTL, function () {
            return CategorySetting::where('isVisible', true)
                ->orderBy('name')
                ->get(['id', 'name'])
                ->toArray();
        });

        return response()->json($categories);
    }

    /**
     * GET /api/highlights
     * Returns highlight items for hero carousel.
     */
    public function highlights(): JsonResponse
    {
        $highlights = Cache::remember('catalog.highlights', self::CACHE_TTL, function () {
            return Highlight::all()->toArray();
        });

        return response()->json($highlights);
    }

    /**
     * GET /api/games
     * Returns games filtered by category and search keyword, supporting pagination/limits.
     */
    public function games(Request $request): JsonResponse
    {
        $cacheKey = 'catalog.games.'.hash('sha256', $request->fullUrl());

        $data = Cache::remember($cacheKey, self::CACHE_TTL, function () use ($request) {
            $query = Game::query();

            if ($search = $request->query('q') ?? $request->query('search')) {
                // '!' as the LIKE escape: pgsql PDO reads '\' as an escaped quote and loses the next "?".
                $like = '%'.str_replace(['!', '%', '_'], ['!!', '!%', '!_'], mb_strtolower((string) $search)).'%';
                // Like the old store: match the name or any category name.
                $query->whereRaw(
                    "(LOWER(name) LIKE ? ESCAPE '!' OR LOWER(CAST(categories AS TEXT)) LIKE ? ESCAPE '!')",
                    [$like, $like]
                );
            }

            if ($category = $request->query('category')) {
                if (DB::connection()->getDriverName() === 'pgsql') {
                    $query->whereRaw('? = ANY(coalesce(categories, \'{}\'))', [(string) $category]);
                } else {
                    $query->where(function ($q) use ($category) {
                        $q->where('categories', 'like', '%"'.$category.'"%')
                            ->orWhere('categories', 'like', '%'.$category.'%');
                    });
                }
            }

            if ($request->has('page')) {
                $limit = max(1, (int) $request->query('limit', 15));

                return $query->paginate($limit)->toArray();
            }

            if ($request->has('limit')) {
                $limit = max(1, (int) $request->query('limit'));

                return $query->limit($limit)->get()->toArray();
            }

            return $query->get()->toArray();
        });

        return response()->json($data);
    }

    /**
     * GET /api/games/{id}
     * Returns a single game by id, or 404 if not found.
     */
    public function game(string $id): JsonResponse
    {
        $game = Cache::remember('catalog.game.'.$id, self::CACHE_TTL, function () use ($id) {
            return Game::find($id)?->toArray();
        });

        if (! $game) {
            return response()->json(['message' => 'Game not found'], 404);
        }

        return response()->json($game);
    }
}

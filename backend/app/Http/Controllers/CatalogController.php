<?php

namespace App\Http\Controllers;

use App\Models\CategorySetting;
use App\Models\Game;
use App\Models\Highlight;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CatalogController extends Controller
{
    /**
     * GET /api/categories
     * Returns visible categories from category_settings table.
     */
    public function categories(): JsonResponse
    {
        $categories = CategorySetting::where('isVisible', true)
            ->orderBy('name')
            ->get(['id', 'name']);

        return response()->json($categories);
    }

    /**
     * GET /api/highlights
     * Returns highlight items for hero carousel.
     */
    public function highlights(): JsonResponse
    {
        $highlights = Highlight::all();

        return response()->json($highlights);
    }

    /**
     * GET /api/games
     * Returns games filtered by category and search keyword, supporting pagination/limits.
     */
    public function games(Request $request): JsonResponse
    {
        $query = Game::query();

        if ($search = $request->query('q') ?? $request->query('search')) {
            $like = '%'.addcslashes(mb_strtolower((string) $search), '\%_').'%';
            $query->whereRaw("LOWER(name) LIKE ? ESCAPE '\\'", [$like]);
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

            return response()->json($query->paginate($limit));
        }

        if ($request->has('limit')) {
            $limit = max(1, (int) $request->query('limit'));

            return response()->json($query->limit($limit)->get());
        }

        return response()->json($query->get());
    }

    /**
     * GET /api/games/{id}
     * Returns a single game by id, or 404 if not found.
     */
    public function game(string $id): JsonResponse
    {
        $game = Game::find($id);

        if (! $game) {
            return response()->json(['message' => 'Game not found'], 404);
        }

        return response()->json($game);
    }
}

<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Game;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class CategoryController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(Category::orderBy('name')->get());
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255', Rule::unique('category_settings', 'name')],
        ]);

        return response()->json(Category::create($data + ['isVisible' => true]), 201);
    }

    /** Rename and cascade the new name into every game that uses the category. */
    public function update(Request $request, Category $category): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255', Rule::unique('category_settings', 'name')->ignore($category->id)],
        ]);
        $old = $category->name;

        DB::transaction(function () use ($category, $data, $old) {
            foreach (Game::withCategory($old) as $game) {
                $game->categories = array_map(fn ($c) => $c === $old ? $data['name'] : $c, $game->categories);
                $game->save();
            }
            $category->update($data);
        });

        return response()->json($category);
    }

    /** Delete a category and strip it from every game (the old store left it dangling). */
    public function destroy(Category $category): JsonResponse
    {
        DB::transaction(function () use ($category) {
            foreach (Game::withCategory($category->name) as $game) {
                $game->categories = array_values(array_filter($game->categories, fn ($c) => $c !== $category->name));
                $game->save();
            }
            $category->delete();
        });

        return response()->json(['message' => 'Deleted.']);
    }

    /** Hide/show a category on the storefront. */
    public function visibility(Request $request, Category $category): JsonResponse
    {
        $data = $request->validate(['isVisible' => ['required', 'boolean']]);
        $category->update($data);

        return response()->json($category);
    }

    /** Games that list this category (back-office "View"). */
    public function games(Category $category): JsonResponse
    {
        return response()->json(Game::withCategory($category->name)->sortByDesc('name')->values());
    }
}

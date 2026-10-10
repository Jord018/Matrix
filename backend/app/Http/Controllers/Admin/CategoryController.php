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
}

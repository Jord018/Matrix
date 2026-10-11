<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Game;
use App\Models\Highlight;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class HighlightController extends Controller
{
    /** Highlights plus the games list the "add highlight" dropdown needs. */
    public function index(): JsonResponse
    {
        return response()->json([
            'highlights' => Highlight::all(),
            'games' => Game::orderBy('name')->get(['id', 'name']),
        ]);
    }

    /** Banner defaults to the game's cover art and a dark-red "Shop Now" button, like the old store. */
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'gameId' => ['required', 'exists:games,id'],
            'customImage' => ['nullable', 'url'],
            'buttonColor' => ['nullable', 'regex:/^#[0-9a-fA-F]{6}$/'],
        ]);
        $game = Game::findOrFail($data['gameId']);

        return response()->json(Highlight::create([
            'gameId' => $game->id,
            'name' => $game->name,
            'customImage' => $data['customImage'] ?? $game->coverImage,
            'buttonColor' => $data['buttonColor'] ?? '#8b0000',
        ]), 201);
    }

    public function destroy(Highlight $highlight): JsonResponse
    {
        $highlight->delete();

        return response()->json(['message' => 'Deleted.']);
    }
}

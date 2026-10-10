<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\GameRequest;
use App\Models\Game;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GameController extends Controller
{
    /** Back-office game list: optional ?search= (case-insensitive name match), sorted Z→A like the old store. */
    public function index(Request $request): JsonResponse
    {
        $games = Game::query()
            ->when($request->query('search'), function ($q, string $search) {
                $like = '%'.addcslashes(mb_strtolower($search), '\%_').'%';
                $q->whereRaw("LOWER(name) LIKE ? ESCAPE '\\'", [$like]);
            })
            ->orderByDesc('name')
            ->get();

        return response()->json($games);
    }

    public function show(Game $game): JsonResponse
    {
        return response()->json($game);
    }

    public function store(GameRequest $request): JsonResponse
    {
        return response()->json(Game::create($request->gameData()), 201);
    }
}

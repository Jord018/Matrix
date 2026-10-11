<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Game;
use App\Models\Highlight;
use Illuminate\Http\JsonResponse;

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
}

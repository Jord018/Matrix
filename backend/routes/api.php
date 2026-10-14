<?php

use App\Http\Controllers\Admin\CategoryController;
use App\Http\Controllers\Admin\GameController;
use App\Http\Controllers\Admin\HighlightController;
use App\Http\Controllers\Admin\OrderController as AdminOrderController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CatalogController;
use App\Http\Controllers\OrderController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Str;

if (!defined('ROUTE_CATEGORIES')) {
    define('ROUTE_CATEGORIES', '/categories');
    define('ROUTE_HIGHLIGHTS', '/highlights');
    define('ROUTE_GAMES', '/games');
    define('ROUTE_GAME_PARAM', '/games/{game}');
    define('ROUTE_ORDERS', '/orders');
}

Route::get('/health', fn () => ['status' => 'ok']);

// Changes after every back-office change (the catalog cache is flushed on each save, which drops this key).
// Shops poll it, so a shop in another browser or account picks up hidden categories and new highlights.
Route::get('/catalog-version', fn () => ['version' => Cache::rememberForever('catalog.version', fn () => (string) Str::uuid())]);

Route::get(ROUTE_CATEGORIES, [CatalogController::class, 'categories']);
Route::get(ROUTE_HIGHLIGHTS, [CatalogController::class, 'highlights']);
Route::get(ROUTE_GAMES, [CatalogController::class, 'games']);
Route::get('/games/{id}', [CatalogController::class, 'game']);
Route::get('/search', [CatalogController::class, 'games']);

Route::get(ROUTE_ORDERS, [OrderController::class, 'index'])->middleware('auth:sanctum');
Route::post(ROUTE_ORDERS, [OrderController::class, 'store'])->middleware('auth:sanctum');
Route::post('/checkout', [OrderController::class, 'store'])->middleware('auth:sanctum');

Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);
Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');

Route::get('/user', fn (Request $request) => $request->user())->middleware('auth:sanctum');

Route::prefix('admin')->middleware(['auth:sanctum', 'admin'])->group(function () {
    Route::get(ROUTE_ORDERS, [AdminOrderController::class, 'index']);
    Route::get(ROUTE_HIGHLIGHTS, [HighlightController::class, 'index']);
    Route::post(ROUTE_HIGHLIGHTS, [HighlightController::class, 'store']);
    Route::delete('/highlights/{highlight}', [HighlightController::class, 'destroy']);
    Route::get(ROUTE_CATEGORIES, [CategoryController::class, 'index']);
    Route::post(ROUTE_CATEGORIES, [CategoryController::class, 'store']);
    Route::put('/categories/{category}', [CategoryController::class, 'update']);
    Route::delete('/categories/{category}', [CategoryController::class, 'destroy']);
    Route::patch('/categories/{category}/visibility', [CategoryController::class, 'visibility']);
    Route::get('/categories/{category}/games', [CategoryController::class, 'games']);
    Route::get(ROUTE_GAMES, [GameController::class, 'index']);
    Route::post(ROUTE_GAMES, [GameController::class, 'store']);
    Route::get(ROUTE_GAME_PARAM, [GameController::class, 'show']);
    Route::put(ROUTE_GAME_PARAM, [GameController::class, 'update']);
    Route::delete(ROUTE_GAME_PARAM, [GameController::class, 'destroy']);
});

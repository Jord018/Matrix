<?php

use App\Http\Controllers\Admin\CategoryController;
use App\Http\Controllers\Admin\GameController;
use App\Http\Controllers\Admin\HighlightController;
use App\Http\Controllers\Admin\OrderController as AdminOrderController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CatalogController;
use App\Http\Controllers\OrderController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/health', fn () => ['status' => 'ok']);

Route::get('/categories', [CatalogController::class, 'categories']);
Route::get('/highlights', [CatalogController::class, 'highlights']);
Route::get('/games', [CatalogController::class, 'games']);
Route::get('/games/{id}', [CatalogController::class, 'game']);
Route::get('/search', [CatalogController::class, 'games']);

Route::get('/orders', [OrderController::class, 'index'])->middleware('auth:sanctum');
Route::post('/orders', [OrderController::class, 'store'])->middleware('auth:sanctum');
Route::post('/checkout', [OrderController::class, 'store'])->middleware('auth:sanctum');

Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);
Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');

Route::get('/user', fn (Request $request) => $request->user())->middleware('auth:sanctum');

Route::prefix('admin')->middleware(['auth:sanctum', 'admin'])->group(function () {
    Route::get('/orders', [AdminOrderController::class, 'index']);
    Route::get('/highlights', [HighlightController::class, 'index']);
    Route::post('/highlights', [HighlightController::class, 'store']);
    Route::delete('/highlights/{highlight}', [HighlightController::class, 'destroy']);
    Route::get('/categories', [CategoryController::class, 'index']);
    Route::post('/categories', [CategoryController::class, 'store']);
    Route::put('/categories/{category}', [CategoryController::class, 'update']);
    Route::delete('/categories/{category}', [CategoryController::class, 'destroy']);
    Route::patch('/categories/{category}/visibility', [CategoryController::class, 'visibility']);
    Route::get('/categories/{category}/games', [CategoryController::class, 'games']);
    Route::get('/games', [GameController::class, 'index']);
    Route::post('/games', [GameController::class, 'store']);
    Route::get('/games/{game}', [GameController::class, 'show']);
    Route::put('/games/{game}', [GameController::class, 'update']);
    Route::delete('/games/{game}', [GameController::class, 'destroy']);
});

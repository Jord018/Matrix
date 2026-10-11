<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\JsonResponse;

class OrderController extends Controller
{
    /** Sale history, newest first. */
    public function index(): JsonResponse
    {
        return response()->json(Order::orderByDesc('purchaseDate')->get());
    }
}

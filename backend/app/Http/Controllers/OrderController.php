<?php

namespace App\Http\Controllers;

use App\Http\Requests\CheckoutRequest;
use App\Models\Game;
use App\Models\Order;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class OrderController extends Controller
{
    /**
     * GET /api/orders
     * The signed-in user's orders, newest first (profile page "My Digital Keys").
     */
    public function index(Request $request): JsonResponse
    {
        $orders = Order::where('userId', (string) $request->user()->id)
            ->orderByDesc('purchaseDate')
            ->get();

        return response()->json($orders);
    }

    /**
     * POST /api/orders
     * Handles checkout, stock decrement, activation key generation, and order persistence.
     */
    public function store(CheckoutRequest $request): JsonResponse
    {
        $order = DB::transaction(function () use ($request) {
            $orderItems = [];

            foreach ($request->validated('items') as $item) {
                $game = Game::find($item['gameId']);

                if (! $game) {
                    throw ValidationException::withMessages([
                        'items' => ['The selected game was not found.'],
                    ]);
                }

                $amount = (int) $item['amount'];

                if ($game->stock < $amount) {
                    throw ValidationException::withMessages([
                        'stock' => ["Not enough stock for '{$game->name}'. Available: {$game->stock}, requested: {$amount}."],
                    ]);
                }

                $game->decrement('stock', $amount);

                $keys = [];
                for ($k = 0; $k < $amount; $k++) {
                    $keys[] = $this->generateActivationKey();
                }

                $orderItems[] = [
                    'gameId' => $game->id,
                    'gameName' => $game->name,
                    'coverImage' => $game->coverImage,
                    'price' => (float) $game->price,
                    'amount' => $amount,
                    'keys' => $keys,
                ];
            }

            // Route requires login; the order always belongs to the signed-in account.
            $user = $request->user();

            return Order::create([
                'id' => $this->generateOrderId(),
                'userId' => (string) $user->id,
                'username' => (string) $user->Username,
                'items' => $orderItems,
                'purchaseDate' => now(),
                'status' => 'completed',
            ]);
        });

        return response()->json($order, 201);
    }

    /**
     * Generate an activation key in format XXXX-XXXX-XXXX.
     */
    private function generateActivationKey(): string
    {
        $chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        $segment = function (int $length) use ($chars): string {
            $out = '';
            for ($i = 0; $i < $length; $i++) {
                $out .= $chars[random_int(0, strlen($chars) - 1)];
            }

            return $out;
        };

        return sprintf('%s-%s-%s', $segment(4), $segment(4), $segment(4));
    }

    /**
     * Generate an order ID prefixed with ORD- followed by 8 alphanumeric characters.
     */
    private function generateOrderId(): string
    {
        $chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        $suffix = '';
        for ($i = 0; $i < 8; $i++) {
            $suffix .= $chars[random_int(0, strlen($chars) - 1)];
        }

        return 'ORD-'.$suffix;
    }
}

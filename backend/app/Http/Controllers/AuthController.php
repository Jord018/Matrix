<?php

namespace App\Http\Controllers;

use App\Models\Account;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function login(Request $request): JsonResponse
    {
        $data = $request->validate([
            'username' => ['required', 'string'],
            'password' => ['required', 'string'],
        ]);

        if (! Auth::guard('web')->attempt(['Username' => $data['username'], 'password' => $data['password']])) {
            return response()->json(['message' => 'Invalid username or password.'], 401);
        }

        $request->session()->regenerate();

        return response()->json(Auth::guard('web')->user());
    }

    // Same rules as the old Node controller: new accounts are customers, Username/Email must be unused.
    public function register(Request $request): JsonResponse
    {
        $data = $request->validate([
            'username' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255'],
            'password' => ['required', 'string'],
            'confirmPassword' => ['required', 'same:password'],
        ]);

        $taken = Account::where('Username', $data['username'])->orWhere('Email', $data['email'])->exists();
        if ($taken) {
            return response()->json(['message' => 'Username or email is already taken.'], 409);
        }

        $account = Account::create([
            'Username' => $data['username'],
            'Email' => $data['email'],
            'PasswordHash' => Hash::make($data['password']),
            'Role' => 'customer',
            'createdAt' => now(),
        ]);

        return response()->json($account, 201);
    }

    public function logout(Request $request): JsonResponse
    {
        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json(['message' => 'Logged out.']);
    }
}

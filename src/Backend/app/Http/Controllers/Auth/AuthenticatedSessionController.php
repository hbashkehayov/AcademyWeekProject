<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class AuthenticatedSessionController extends Controller
{
    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request): JsonResponse
    {
        $request->authenticate();

        // Only regenerate session if available (not in API context)
        if ($request->hasSession()) {
            $request->session()->regenerate();
        }

        // Return user data with role information for the frontend
        $user = Auth::user()->load('role', 'organization');
        
        return response()->json([
            'message' => 'Login successful',
            'user' => $user
        ], 200);
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): Response
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();

        $request->session()->regenerateToken();

        return response()->noContent();
    }
}

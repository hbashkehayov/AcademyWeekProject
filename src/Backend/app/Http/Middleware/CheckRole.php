<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckRole
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     * @param  string  ...$roles
     */
    public function handle(Request $request, Closure $next, ...$roles): Response
    {
        // Check if user is authenticated
        if (!$request->user()) {
            return response()->json([
                'message' => 'Unauthenticated. Please login to access this resource.'
            ], 401);
        }

        // Load the role relationship if not loaded
        if (!$request->user()->relationLoaded('role')) {
            $request->user()->load('role');
        }

        // Check if user has one of the required roles
        $userRole = $request->user()->role->name ?? null;
        
        if (!$userRole || !in_array($userRole, $roles)) {
            return response()->json([
                'message' => 'Unauthorized. You do not have permission to access this resource.',
                'required_role' => $roles,
                'your_role' => $userRole
            ], 403);
        }

        return $next($request);
    }
}
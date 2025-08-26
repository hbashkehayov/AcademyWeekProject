<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Role;
use Illuminate\Http\JsonResponse;

class RoleController extends Controller
{
    /**
     * Display a listing of roles.
     */
    public function index(): JsonResponse
    {
        $roles = Role::withCount('users')->get();
        
        return response()->json($roles);
    }

    /**
     * Get tools for a specific role.
     */
    public function tools(string $roleId): JsonResponse
    {
        $role = Role::findOrFail($roleId);
        
        $tools = $role->tools()
            ->where('status', 'active')
            ->with(['categories', 'roles'])
            ->orderByPivot('relevance_score', 'desc')
            ->get();
        
        return response()->json($tools);
    }
}
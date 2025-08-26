<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\JsonResponse;

class CategoryController extends Controller
{
    /**
     * Display a listing of categories.
     */
    public function index(): JsonResponse
    {
        $categories = Category::withCount('tools')
            ->with('children')
            ->whereNull('parent_id')
            ->get();

        return response()->json($categories);
    }

    /**
     * Display the specified category.
     */
    public function show(string $slug): JsonResponse
    {
        $category = Category::where('slug', $slug)
            ->with(['tools' => function ($query) {
                $query->where('status', 'active')
                    ->with(['categories', 'roles']);
            }])
            ->withCount('tools')
            ->firstOrFail();

        return response()->json($category);
    }
}

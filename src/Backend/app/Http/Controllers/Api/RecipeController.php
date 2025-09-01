<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Recipe;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class RecipeController extends Controller
{
    /**
     * Display a listing of recipes
     */
    public function index(Request $request): JsonResponse
    {
        $query = Recipe::with('creator:id,name,display_name')
            ->active();

        // Filter by difficulty
        if ($request->has('difficulty') && $request->difficulty !== 'all') {
            $query->byDifficulty($request->difficulty);
        }

        // Filter by category
        if ($request->has('category') && $request->category !== 'all') {
            $query->whereJsonContains('categories', $request->category);
        }

        // Search by name or description
        if ($request->has('search') && !empty($request->search)) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%')
                  ->orWhere('description', 'like', '%' . $request->search . '%')
                  ->orWhere('goal', 'like', '%' . $request->search . '%');
            });
        }

        // Sort options
        $sortBy = $request->get('sort', 'featured');
        switch ($sortBy) {
            case 'popular':
                $query->popular();
                break;
            case 'success_rate':
                $query->highSuccess();
                break;
            case 'newest':
                $query->latest();
                break;
            case 'featured':
            default:
                $query->orderBy('is_featured', 'desc')
                      ->orderBy('success_rate', 'desc')
                      ->orderBy('uses_count', 'desc');
                break;
        }

        $limit = min($request->get('limit', 10), 50); // Max 50 recipes per request
        $recipes = $query->paginate($limit);

        return response()->json([
            'status' => 'success',
            'data' => $recipes->items(),
            'meta' => [
                'current_page' => $recipes->currentPage(),
                'last_page' => $recipes->lastPage(),
                'per_page' => $recipes->perPage(),
                'total' => $recipes->total(),
            ]
        ]);
    }

    /**
     * Store a newly created recipe
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'goal' => 'required|string',
            'steps' => 'required|array|min:2',
            'steps.*.step' => 'required|integer|min:1',
            'steps.*.tool_name' => 'required|string',
            'steps.*.instruction' => 'required|string',
            'steps.*.tool_id' => 'nullable|string',
            'estimated_time' => 'nullable|integer|min:1',
            'difficulty' => 'required|in:beginner,intermediate,advanced',
            'tags' => 'nullable|array',
            'tags.*' => 'string|max:50',
            'categories' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $recipe = Recipe::create([
                'name' => $request->name,
                'description' => $request->description,
                'goal' => $request->goal,
                'steps' => $request->steps,
                'estimated_time' => $request->estimated_time,
                'difficulty' => $request->difficulty,
                'tags' => $request->tags ?? [],
                'categories' => $request->categories ?? [],
                'created_by' => Auth::id(),
                'status' => 'active', // Auto-approve for now
            ]);

            $recipe->load('creator:id,name,display_name');

            return response()->json([
                'status' => 'success',
                'message' => 'Recipe created successfully',
                'data' => $recipe
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to create recipe',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified recipe
     */
    public function show(string $id): JsonResponse
    {
        try {
            $recipe = Recipe::with('creator:id,name,display_name')
                ->active()
                ->findOrFail($id);

            return response()->json([
                'status' => 'success',
                'data' => $recipe
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Recipe not found'
            ], 404);
        }
    }

    /**
     * Update the specified recipe
     */
    public function update(Request $request, string $id): JsonResponse
    {
        try {
            $recipe = Recipe::findOrFail($id);

            // Check if user owns this recipe or is admin
            if ($recipe->created_by !== Auth::id() && !Auth::user()->hasRole('Owner')) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Unauthorized to update this recipe'
                ], 403);
            }

            $validator = Validator::make($request->all(), [
                'name' => 'sometimes|required|string|max:255',
                'description' => 'sometimes|required|string',
                'goal' => 'sometimes|required|string',
                'steps' => 'sometimes|required|array|min:2',
                'steps.*.step' => 'required_with:steps|integer|min:1',
                'steps.*.tool_name' => 'required_with:steps|string',
                'steps.*.instruction' => 'required_with:steps|string',
                'steps.*.tool_id' => 'nullable|string',
                'estimated_time' => 'nullable|integer|min:1',
                'difficulty' => 'sometimes|required|in:beginner,intermediate,advanced',
                'tags' => 'nullable|array',
                'tags.*' => 'string|max:50',
                'categories' => 'nullable|array',
                'status' => 'sometimes|in:active,draft,archived',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $recipe->update($request->only([
                'name', 'description', 'goal', 'steps', 'estimated_time', 
                'difficulty', 'tags', 'categories', 'status'
            ]));

            $recipe->load('creator:id,name,display_name');

            return response()->json([
                'status' => 'success',
                'message' => 'Recipe updated successfully',
                'data' => $recipe
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Recipe not found'
            ], 404);
        }
    }

    /**
     * Remove the specified recipe
     */
    public function destroy(string $id): JsonResponse
    {
        try {
            $recipe = Recipe::findOrFail($id);

            // Check if user owns this recipe or is admin
            if ($recipe->created_by !== Auth::id() && !Auth::user()->hasRole('Owner')) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Unauthorized to delete this recipe'
                ], 403);
            }

            $recipe->delete();

            return response()->json([
                'status' => 'success',
                'message' => 'Recipe deleted successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Recipe not found'
            ], 404);
        }
    }

    /**
     * Increment uses count when recipe is executed
     */
    public function incrementUses(string $id): JsonResponse
    {
        try {
            $recipe = Recipe::findOrFail($id);
            $recipe->incrementUses();

            return response()->json([
                'status' => 'success',
                'message' => 'Recipe usage incremented',
                'data' => ['uses_count' => $recipe->uses_count]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Recipe not found'
            ], 404);
        }
    }

    /**
     * Get featured recipes for dashboard
     */
    public function featured(): JsonResponse
    {
        $recipes = Recipe::with('creator:id,name,display_name')
            ->active()
            ->featured()
            ->orderBy('success_rate', 'desc')
            ->limit(5)
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => $recipes
        ]);
    }

    /**
     * Get popular recipes
     */
    public function popular(): JsonResponse
    {
        $recipes = Recipe::with('creator:id,name,display_name')
            ->active()
            ->popular()
            ->limit(10)
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => $recipes
        ]);
    }
}
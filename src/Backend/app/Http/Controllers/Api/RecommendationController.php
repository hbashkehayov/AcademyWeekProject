<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\RecommendationEngine;
use App\Models\Role;
use App\Models\UserAiInteraction;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;

class RecommendationController extends Controller
{
    private RecommendationEngine $recommendationEngine;

    public function __construct(RecommendationEngine $recommendationEngine)
    {
        $this->recommendationEngine = $recommendationEngine;
    }

    /**
     * Get recommendations for a specific role
     */
    public function index(Request $request): JsonResponse
    {
        $roleName = $request->query('role');
        $limit = $request->query('limit', 10);
        
        if (!$roleName) {
            return response()->json([
                'error' => 'Role parameter is required'
            ], 400);
        }
        
        $role = Role::where('name', $roleName)->first();
        
        if (!$role) {
            return response()->json([
                'error' => 'Invalid role'
            ], 404);
        }
        
        $recommendations = $this->recommendationEngine->getRecommendationsForRole($roleName, $limit);
        
        return response()->json([
            'role' => $role,
            'recommendations' => $recommendations,
            'total' => $recommendations->count()
        ]);
    }

    /**
     * Role mapping for variations
     */
    private const ROLE_MAPPINGS = [
        'product owner' => 'owner',
        'productowner' => 'owner',
        'project manager' => 'pm',
        'projectmanager' => 'pm',
        'qa engineer' => 'qa',
        'ui/ux designer' => 'designer',
        'uiuxdesigner' => 'designer',
        'ux designer' => 'designer',
        'ui designer' => 'designer',
        'front-end' => 'frontend',
        'back-end' => 'backend',
        'full-stack' => 'frontend', // Default to frontend for full-stack
        'fullstack' => 'frontend'
    ];

    /**
     * Normalize role name with backend mapping
     */
    private function normalizeRoleName(string $roleName): string
    {
        $normalized = strtolower(trim($roleName));
        return self::ROLE_MAPPINGS[$normalized] ?? $normalized;
    }

    /**
     * Get role-based recommendations for the authenticated user
     */
    public function roleBasedRecommendations(Request $request): JsonResponse
    {
        try {
            $rawRoleName = $request->query('role', 'frontend');
            $limit = max(1, min(50, (int) $request->query('limit', 10))); // Clamp between 1-50
            $offset = max(0, (int) $request->query('offset', 0));
            $userId = $request->query('user_id'); // For now, get from query param since auth might not be fully set up
            
            // Normalize role name using backend logic
            $roleName = $this->normalizeRoleName($rawRoleName);
            
            $role = Role::where('name', $roleName)->first();
            
            if (!$role) {
                // Try to find any role that might match
                $availableRoles = Role::pluck('name')->toArray();
                
                return response()->json([
                    'error' => 'Invalid role specified',
                    'error_type' => 'INVALID_ROLE',
                    'message' => "Role '{$rawRoleName}' not found. Please use one of: " . implode(', ', $availableRoles),
                    'available_roles' => $availableRoles,
                    'suggestions' => $this->suggestSimilarRoles($rawRoleName, $availableRoles)
                ], 422);
            }
            
            $recommendations = $this->recommendationEngine->getRecommendationsForRole($roleName, $limit, $offset, $userId);
            
            if ($recommendations->isEmpty()) {
                return response()->json([
                    'error' => 'No recommendations available',
                    'error_type' => 'NO_RECOMMENDATIONS',
                    'message' => "No AI tools found for {$role->name} role. Try adjusting your search criteria.",
                    'role' => $role,
                    'recommendations' => [],
                    'total' => 0,
                    'has_more' => false
                ]);
            }
            
            // Add explanation for each recommendation
            $recommendations = $recommendations->map(function ($tool) use ($role) {
                $tool->recommendation_explanation = $this->generateExplanation($tool, $role);
                return $tool;
            });
            
            // Check if there are more recommendations available
            $totalAvailable = $this->recommendationEngine->getTotalRecommendationsCount($roleName);
            $hasMore = ($offset + $limit) < $totalAvailable;
            
            // Get recently added tools for this role
            $recentlyAdded = $this->recommendationEngine->getRecentlyAddedTools($roleName, 7, 3);
            
            return response()->json([
                'success' => true,
                'role' => $role,
                'recommendations' => $recommendations,
                'total' => $recommendations->count(),
                'total_available' => $totalAvailable,
                'has_more' => $hasMore,
                'next_offset' => $hasMore ? $offset + $limit : null,
                'recently_added' => $recentlyAdded,
                'personalized' => $userId !== null
            ]);
            
        } catch (\Exception $e) {
            \Log::error('Error fetching recommendations: ' . $e->getMessage(), [
                'role' => $request->query('role'),
                'limit' => $request->query('limit'),
                'user_id' => $request->query('user_id'),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'error' => 'Server error occurred',
                'error_type' => 'SERVER_ERROR',
                'message' => 'Unable to fetch recommendations. Please try again later.',
                'retry_after' => 5
            ], 500);
        }
    }

    /**
     * Track user interaction with AI tools
     */
    public function trackInteraction(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'user_id' => 'required|uuid',
                'tool_id' => 'nullable|uuid',
                'interaction_type' => 'required|in:viewed,clicked,added,suggested_by_ai,favorited,rated',
                'source' => 'required|in:dashboard,ai_assistant,search,browse',
                'metadata' => 'nullable|array',
                'session_duration' => 'nullable|integer|min:0',
                'rating' => 'nullable|numeric|between:0,5'
            ]);
            
            $interaction = UserAiInteraction::createInteraction(
                $validated['user_id'],
                $validated['tool_id'] ?? null,
                $validated['interaction_type'],
                $validated['source'],
                $validated['metadata'] ?? [],
                $validated['session_duration'] ?? null,
                $validated['rating'] ?? null
            );
            
            // Clear relevant caches when new interactions are added
            if (in_array($validated['interaction_type'], ['added', 'suggested_by_ai', 'favorited'])) {
                $this->recommendationEngine->clearCaches();
            }
            
            return response()->json([
                'success' => true,
                'interaction_id' => $interaction->id,
                'message' => 'Interaction tracked successfully'
            ]);
            
        } catch (\Exception $e) {
            Log::error('Error tracking interaction: ' . $e->getMessage(), [
                'request_data' => $request->all(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'error' => 'Failed to track interaction',
                'error_type' => 'TRACKING_ERROR',
                'message' => 'Unable to save interaction data. Please try again later.'
            ], 500);
        }
    }

    /**
     * Suggest similar roles based on input
     */
    private function suggestSimilarRoles(string $input, array $availableRoles): array
    {
        $suggestions = [];
        $input = strtolower($input);
        
        foreach ($availableRoles as $role) {
            $similarity = similar_text($input, strtolower($role));
            if ($similarity > 2) { // Basic similarity threshold
                $suggestions[] = $role;
            }
        }
        
        return array_slice($suggestions, 0, 3); // Return top 3 suggestions
    }

    /**
     * Generate explanation for why a tool is recommended
     */
    private function generateExplanation($tool, $role): string
    {
        $score = $tool->recommendation_score ?? 0;
        $reasons = $tool->match_reasons ?? [];
        
        if ($score >= 80) {
            $prefix = "Excellent match: ";
        } elseif ($score >= 60) {
            $prefix = "Strong recommendation: ";
        } elseif ($score >= 40) {
            $prefix = "Good option: ";
        } else {
            $prefix = "Suggested tool: ";
        }
        
        if (!empty($reasons)) {
            return $prefix . implode('. ', array_slice($reasons, 0, 2));
        }
        
        return $prefix . "This tool can enhance your {$role->name} workflow";
    }

    /**
     * Get recommendations for all roles
     */
    public function getAllRoleRecommendations(): JsonResponse
    {
        $allRecommendations = $this->recommendationEngine->getAllRoleRecommendations();
        
        return response()->json([
            'recommendations' => $allRecommendations
        ]);
    }
}

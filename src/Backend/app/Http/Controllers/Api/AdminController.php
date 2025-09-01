<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AiTool;
use App\Models\User;
use App\Services\RecommendationEngine;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Carbon\Carbon;

class AdminController extends Controller
{
    /**
     * Get all pending tools
     */
    public function getPendingTools(Request $request): JsonResponse
    {
        try {
            // Temporarily disabled auth check for testing
            // $user = $request->user();
            // if (!$user || $user->role->name !== 'owner') {
            //     return response()->json(['error' => 'Unauthorized'], 403);
            // }

            $pendingTools = AiTool::where('status', 'pending')
                ->with(['submittedBy', 'categories', 'suggestedForRole'])
                ->orderBy('created_at', 'desc')
                ->get()
                ->map(function ($tool) {
                    return [
                        'id' => $tool->id,
                        'name' => $tool->name,
                        'slug' => $tool->slug,
                        'description' => $tool->description,
                        'detailed_description' => $tool->detailed_description,
                        'website_url' => $tool->website_url,
                        'api_endpoint' => $tool->api_endpoint,
                        'logo_url' => $tool->logo_url,
                        'pricing_model' => $tool->pricing_model,
                        'features' => $tool->features,
                        'integration_type' => $tool->integration_type,
                        'status' => $tool->status,
                        'submitted_at' => $tool->created_at->toIso8601String(),
                        'updated_at' => $tool->updated_at->toIso8601String(),
                        'submitted_by_user' => $tool->submittedBy ? [
                            'name' => $tool->submittedBy->display_name ? $tool->submittedBy->display_name : $tool->submittedBy->name,
                            'email' => $tool->submittedBy->email,
                            'role' => $tool->submittedBy->role ? $tool->submittedBy->role->display_name : 'No Role'
                        ] : null,
                        'categories' => $tool->categories->map(function($category) {
                            return [
                                'id' => $category->id,
                                'name' => $category->name,
                                'slug' => $category->slug,
                                'description' => $category->description,
                                'icon' => $category->icon
                            ];
                        }),
                        'suggested_for_role' => $tool->suggestedForRole ? [
                            'id' => $tool->suggestedForRole->id,
                            'name' => $tool->suggestedForRole->name,
                            'display_name' => $tool->suggestedForRole->display_name
                        ] : null
                    ];
                });

            return response()->json([
                'success' => true,
                'data' => $pendingTools
            ]);
        } catch (\Exception $e) {
            \Log::error('AdminController getPendingTools error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Internal server error',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Approve a pending tool
     */
    public function approveTool(Request $request, string $toolId): JsonResponse
    {
        // Temporarily disabled auth check for testing
        // $user = $request->user();
        // if (!$user || $user->role->name !== 'owner') {
        //     return response()->json(['error' => 'Unauthorized'], 403);
        // }
        $user = User::where('email', 'h.bashkehayov@softart.bg')->first();

        $tool = AiTool::find($toolId);
        if (!$tool) {
            return response()->json(['error' => 'Tool not found'], 404);
        }

        if ($tool->status !== 'pending') {
            return response()->json(['error' => 'Tool is not pending'], 400);
        }

        $tool->status = 'active';
        $tool->approved_by = $user->id;
        $tool->save();

        // Clear recommendation cache so the newly approved tool appears immediately
        $recommendationEngine = app(RecommendationEngine::class);
        $recommendationEngine->clearCaches();

        return response()->json([
            'success' => true,
            'message' => 'Tool approved successfully',
            'tool' => $tool
        ]);
    }

    /**
     * Reject a pending tool
     */
    public function rejectTool(Request $request, string $toolId): JsonResponse
    {
        // Temporarily disabled auth check for testing
        // $user = $request->user();
        // if (!$user || $user->role->name !== 'owner') {
        //     return response()->json(['error' => 'Unauthorized'], 403);
        // }

        $tool = AiTool::find($toolId);
        if (!$tool) {
            return response()->json(['error' => 'Tool not found'], 404);
        }

        if ($tool->status !== 'pending') {
            return response()->json(['error' => 'Tool is not pending'], 400);
        }

        // Delete the rejected tool completely
        $tool->delete();

        return response()->json([
            'success' => true,
            'message' => 'Tool rejected and deleted successfully'
        ]);
    }

    /**
     * Get admin dashboard stats
     */
    public function getDashboardStats(Request $request): JsonResponse
    {
        try {
            // Temporarily disabled auth check for testing
            // $user = $request->user();
            // if (!$user || $user->role->name !== 'owner') {
            //     return response()->json(['error' => 'Unauthorized'], 403);
            // }

            $stats = [
                'pending_tools' => AiTool::where('status', 'pending')->count(),
                'active_tools' => AiTool::where('status', 'active')->count(),
                'inactive_tools' => AiTool::where('status', 'inactive')->count(),
                'total_tools' => AiTool::count(),
                'total_users' => User::count(),
                'online_users' => $this->getOnlineUsersCount(),
                'recent_signups' => User::where('created_at', '>=', Carbon::now()->subDays(7))->count(),
                'tools_this_week' => AiTool::where('created_at', '>=', Carbon::now()->subDays(7))->count(),
                'tools_this_month' => AiTool::where('created_at', '>=', Carbon::now()->subDays(30))->count(),
                'users_by_role' => $this->getUsersByRole(),
                'tools_by_category' => $this->getToolsByCategory(),
                'recent_activity' => $this->getRecentActivity(),
            ];

            return response()->json([
                'success' => true,
                'data' => $stats
            ]);
        } catch (\Exception $e) {
            \Log::error('AdminController getDashboardStats error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Internal server error',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get online users count (users active in last 15 minutes)
     */
    private function getOnlineUsersCount(): int
    {
        // This would typically be tracked with a 'last_seen' field or Redis
        // For now, we'll simulate based on recent activity
        return User::where('updated_at', '>=', Carbon::now()->subMinutes(15))->count();
    }

    /**
     * Get users grouped by role
     */
    private function getUsersByRole(): array
    {
        return User::with('role')
            ->get()
            ->groupBy('role.name')
            ->map(function ($users, $role) {
                return [
                    'role' => $role ? $role : 'No Role',
                    'count' => $users->count(),
                    'percentage' => round(($users->count() / User::count()) * 100, 1)
                ];
            })
            ->values()
            ->toArray();
    }

    /**
     * Get tools grouped by category
     */
    private function getToolsByCategory(): array
    {
        $tools = AiTool::with('categories')->get();
        $categoryStats = [];
        
        foreach ($tools as $tool) {
            foreach ($tool->categories as $category) {
                if (!isset($categoryStats[$category->name])) {
                    $categoryStats[$category->name] = 0;
                }
                $categoryStats[$category->name]++;
            }
        }

        return collect($categoryStats)->map(function ($count, $category) {
            return [
                'category' => $category,
                'count' => $count
            ];
        })->values()->toArray();
    }

    /**
     * Get recent activity (last 10 activities)
     */
    private function getRecentActivity(): array
    {
        $activities = [];
        
        // Recent tool submissions
        $recentTools = AiTool::with(['submittedBy'])
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->get();
            
        foreach ($recentTools as $tool) {
            $submitterName = 'Anonymous';
            if ($tool->submittedBy) {
                $submitterName = $tool->submittedBy->display_name ? $tool->submittedBy->display_name : $tool->submittedBy->name;
            }
            
            $activities[] = [
                'type' => 'tool_submission',
                'description' => "Tool '{$tool->name}' was submitted",
                'user' => $submitterName,
                'timestamp' => $tool->created_at->toIso8601String(),
                'status' => $tool->status
            ];
        }
        
        // Recent user registrations
        $recentUsers = User::with('role')
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->get();
            
        foreach ($recentUsers as $user) {
            $userName = $user->display_name ? $user->display_name : $user->name;
            $activities[] = [
                'type' => 'user_registration',
                'description' => "New user registered: {$userName}",
                'user' => $userName,
                'timestamp' => $user->created_at->toIso8601String(),
                'role' => $user->role ? $user->role->display_name : 'No Role'
            ];
        }
        
        // Sort by timestamp and take most recent 10
        usort($activities, function ($a, $b) {
            return strtotime($b['timestamp']) - strtotime($a['timestamp']);
        });
        
        return array_slice($activities, 0, 10);
    }

    /**
     * Get all users for admin management
     */
    public function getUsers(Request $request): JsonResponse
    {
        try {
            // Temporarily disabled auth check for testing
            // $user = $request->user();
            // if (!$user || $user->role->name !== 'owner') {
            //     return response()->json(['error' => 'Unauthorized'], 403);
            // }

            $users = User::with(['role', 'organization'])
                ->orderBy('created_at', 'desc')
                ->get()
                ->map(function ($user) {
                    return [
                        'id' => $user->id,
                        'name' => $user->name,
                        'email' => $user->email,
                        'display_name' => $user->display_name,
                        'phone_number' => $user->phone_number,
                        'role' => $user->role ? [
                            'id' => $user->role->id,
                            'name' => $user->role->name,
                            'display_name' => $user->role->display_name
                        ] : null,
                        'organization' => $user->organization ? [
                            'id' => $user->organization->id,
                            'name' => $user->organization->name
                        ] : null,
                        'email_verified_at' => $user->email_verified_at,
                        'two_factor_enabled' => $user->two_factor_enabled,
                        'created_at' => $user->created_at->toIso8601String(),
                        'tools_submitted' => $user->submittedTools()->count(),
                        'tools_rated' => $user->ratings()->count(),
                    ];
                });

            return response()->json([
                'success' => true,
                'data' => $users
            ]);
        } catch (\Exception $e) {
            \Log::error('AdminController getUsers error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Internal server error',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get all active tools
     */
    public function getActiveTools(Request $request): JsonResponse
    {
        try {
            // Temporarily disabled auth check for testing
            // $user = $request->user();
            // if (!$user || $user->role->name !== 'owner') {
            //     return response()->json(['error' => 'Unauthorized'], 403);
            // }

            $activeTools = AiTool::where('status', 'active')
                ->with(['categories', 'suggestedForRole'])
                ->orderBy('name', 'asc')
                ->get()
                ->map(function ($tool) {
                    return [
                        'id' => $tool->id,
                        'name' => $tool->name,
                        'slug' => $tool->slug,
                        'description' => $tool->description,
                        'detailed_description' => $tool->detailed_description,
                        'website_url' => $tool->website_url,
                        'api_endpoint' => $tool->api_endpoint,
                        'logo_url' => $tool->logo_url,
                        'pricing_model' => $tool->pricing_model,
                        'features' => $tool->features,
                        'integration_type' => $tool->integration_type,
                        'status' => $tool->status,
                        'created_at' => $tool->created_at->toIso8601String(),
                        'updated_at' => $tool->updated_at->toIso8601String(),
                        'categories' => $tool->categories->map(function($category) {
                            return [
                                'id' => $category->id,
                                'name' => $category->name,
                                'slug' => $category->slug
                            ];
                        }),
                        'suggested_for_role' => $tool->suggestedForRole ? [
                            'id' => $tool->suggestedForRole->id,
                            'name' => $tool->suggestedForRole->name,
                            'display_name' => $tool->suggestedForRole->display_name
                        ] : null
                    ];
                });

            return response()->json([
                'success' => true,
                'data' => $activeTools
            ]);
        } catch (\Exception $e) {
            \Log::error('AdminController getActiveTools error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Internal server error',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update a tool
     */
    public function updateTool(Request $request, string $toolId): JsonResponse
    {
        try {
            // Temporarily disabled auth check for testing
            // $user = $request->user();
            // if (!$user || $user->role->name !== 'owner') {
            //     return response()->json(['error' => 'Unauthorized'], 403);
            // }

            $validated = $request->validate([
                'name' => 'sometimes|required|string|max:255',
                'slug' => 'nullable|string|max:255',
                'description' => 'sometimes|required|string',
                'detailed_description' => 'nullable|string',
                'website_url' => 'sometimes|required|url',
                'api_endpoint' => 'nullable|url',
                'logo_url' => 'nullable|url',
                'features' => 'nullable|array',
                'pricing_model' => 'nullable|array',
                'integration_type' => 'nullable|string|in:redirect,api,iframe,extension,plugin',
                'status' => 'nullable|string|in:active,pending,archived',
                'suggested_for_role' => 'nullable|exists:roles,id',
                'category_ids' => 'nullable|array',
                'category_ids.*' => 'exists:categories,id',
            ]);

            $tool = AiTool::find($toolId);
            if (!$tool) {
                return response()->json(['error' => 'Tool not found'], 404);
            }

            // Update basic fields
            $tool->update([
                'name' => $validated['name'] ?? $tool->name,
                'slug' => $validated['slug'] ?? $tool->slug,
                'description' => $validated['description'] ?? $tool->description,
                'detailed_description' => $validated['detailed_description'] ?? $tool->detailed_description,
                'website_url' => $validated['website_url'] ?? $tool->website_url,
                'api_endpoint' => $validated['api_endpoint'] ?? $tool->api_endpoint,
                'logo_url' => $validated['logo_url'] ?? $tool->logo_url,
                'features' => $validated['features'] ?? $tool->features,
                'pricing_model' => $validated['pricing_model'] ?? $tool->pricing_model,
                'integration_type' => $validated['integration_type'] ?? $tool->integration_type,
                'status' => $validated['status'] ?? $tool->status,
                'suggested_for_role' => $validated['suggested_for_role'] ?? $tool->suggested_for_role,
            ]);

            // Update categories if provided
            if (isset($validated['category_ids'])) {
                $tool->categories()->sync($validated['category_ids']);
            }

            // Load relationships for response
            $tool->load(['categories', 'suggestedForRole']);

            return response()->json([
                'success' => true,
                'message' => 'Tool updated successfully',
                'data' => [
                    'id' => $tool->id,
                    'name' => $tool->name,
                    'slug' => $tool->slug,
                    'description' => $tool->description,
                    'detailed_description' => $tool->detailed_description,
                    'website_url' => $tool->website_url,
                    'api_endpoint' => $tool->api_endpoint,
                    'logo_url' => $tool->logo_url,
                    'pricing_model' => $tool->pricing_model,
                    'features' => $tool->features,
                    'integration_type' => $tool->integration_type,
                    'status' => $tool->status,
                    'created_at' => $tool->created_at->toIso8601String(),
                    'updated_at' => $tool->updated_at->toIso8601String(),
                    'categories' => $tool->categories->map(function($category) {
                        return [
                            'id' => $category->id,
                            'name' => $category->name,
                            'slug' => $category->slug
                        ];
                    }),
                    'suggested_for_role' => $tool->suggestedForRole ? [
                        'id' => $tool->suggestedForRole->id,
                        'name' => $tool->suggestedForRole->name,
                        'display_name' => $tool->suggestedForRole->display_name
                    ] : null
                ]
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'error' => 'Validation failed',
                'message' => $e->getMessage(),
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            \Log::error('AdminController updateTool error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Internal server error',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete a tool
     */
    public function deleteTool(Request $request, string $toolId): JsonResponse
    {
        try {
            // Temporarily disabled auth check for testing
            // $user = $request->user();
            // if (!$user || $user->role->name !== 'owner') {
            //     return response()->json(['error' => 'Unauthorized'], 403);
            // }

            $tool = AiTool::find($toolId);
            if (!$tool) {
                return response()->json(['error' => 'Tool not found'], 404);
            }

            // Store tool info before deletion
            $deletedToolInfo = [
                'name' => $tool->name,
                'id' => $tool->id
            ];

            // Delete related records
            $tool->categories()->detach();
            $tool->roles()->detach();
            $tool->ratings()->delete();
            $tool->userUsage()->delete();

            // Delete the tool
            $tool->delete();

            return response()->json([
                'success' => true,
                'message' => 'Tool deleted successfully',
                'deleted_tool' => $deletedToolInfo
            ]);
        } catch (\Exception $e) {
            \Log::error('AdminController deleteTool error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Internal server error',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete a user
     */
    public function deleteUser(Request $request, string $userId): JsonResponse
    {
        // Temporarily disabled auth check for testing
        // $user = $request->user();
        // if (!$user || $user->role->name !== 'owner') {
        //     return response()->json(['error' => 'Unauthorized'], 403);
        // }

        try {
            $userToDelete = User::find($userId);
            if (!$userToDelete) {
                return response()->json(['error' => 'User not found'], 404);
            }

            // Prevent deleting yourself or other owners
            if ($userToDelete->role && $userToDelete->role->name === 'owner') {
                return response()->json(['error' => 'Cannot delete owner accounts'], 403);
            }

            // Store user info before deletion for response
            $deletedUserInfo = [
                'name' => $userToDelete->name,
                'email' => $userToDelete->email
            ];

            // Delete related records first to avoid foreign key constraint issues
            // Delete user's tool ratings
            $userToDelete->ratings()->delete();
            
            // Delete user's tool usage records
            $userToDelete->toolUsage()->delete();
            
            // Update tools submitted by this user (set submitted_by to null)
            $userToDelete->submittedTools()->update(['submitted_by' => null]);
            
            // Update tools approved by this user (set approved_by to null)
            $userToDelete->approvedTools()->update(['approved_by' => null]);
            
            // Now delete the user
            $userToDelete->delete();

            return response()->json([
                'success' => true,
                'message' => 'User deleted successfully',
                'deleted_user' => $deletedUserInfo
            ]);
        } catch (\Exception $e) {
            \Log::error('Error deleting user: ' . $e->getMessage());
            return response()->json([
                'error' => 'Failed to delete user: ' . $e->getMessage()
            ], 500);
        }
    }
}
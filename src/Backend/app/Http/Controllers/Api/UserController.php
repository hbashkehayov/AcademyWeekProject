<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Role;
use App\Models\RoleChangeRequest;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class UserController extends Controller
{
    /**
     * Get current user profile with relationships
     */
    public function getCurrentUser(Request $request): JsonResponse
    {
        $user = $request->user()->load(['role', 'organization']);
        
        return response()->json([
            'id' => $user->id,
            'name' => $user->name,
            'display_name' => $user->display_name,
            'email' => $user->email,
            'phone_number' => $user->phone_number,
            'role' => [
                'id' => $user->role->id,
                'name' => $user->role->name,
                'display_name' => $user->role->display_name ?? ucfirst($user->role->name)
            ],
            'organization' => $user->organization ? [
                'id' => $user->organization->id,
                'name' => $user->organization->name
            ] : null,
            'two_factor_enabled' => $user->hasTwoFactorEnabled()
        ]);
    }

    /**
     * Update user profile
     */
    public function updateProfile(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'display_name' => 'nullable|string|max:255',
            'email' => 'required|email|unique:users,email,' . $request->user()->id,
            'phone_number' => 'nullable|string|max:20',
        ]);

        $user = $request->user();
        $user->update($validated);
        
        return response()->json([
            'id' => $user->id,
            'name' => $user->name,
            'display_name' => $user->display_name,
            'email' => $user->email,
            'phone_number' => $user->phone_number,
            'role' => [
                'id' => $user->role->id,
                'name' => $user->role->name,
                'display_name' => $user->role->display_name ?? ucfirst($user->role->name)
            ],
            'organization' => $user->organization ? [
                'id' => $user->organization->id,
                'name' => $user->organization->name
            ] : null,
            'two_factor_enabled' => $user->hasTwoFactorEnabled()
        ]);
    }

    /**
     * Change user password
     */
    public function changePassword(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'current_password' => 'required|string',
            'new_password' => 'required|string|min:8|confirmed',
        ]);

        $user = $request->user();
        
        if (!Hash::check($validated['current_password'], $user->password)) {
            return response()->json([
                'message' => 'Current password is incorrect'
            ], 400);
        }

        $user->update([
            'password' => Hash::make($validated['new_password'])
        ]);

        return response()->json([
            'message' => 'Password updated successfully'
        ]);
    }

    /**
     * Get all available roles (for role change requests)
     */
    public function getRoles(): JsonResponse
    {
        $roles = Role::all()->map(function ($role) {
            return [
                'id' => $role->id,
                'name' => $role->name,
                'display_name' => $role->display_name ?? ucfirst($role->name)
            ];
        });

        return response()->json($roles);
    }

    /**
     * Request role change
     */
    public function requestRoleChange(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'requested_role_id' => 'required|exists:roles,id',
            'reason' => 'required|string|min:10|max:500',
        ]);

        $user = $request->user();
        $requestedRole = Role::find($validated['requested_role_id']);

        // Check if user is trying to request the same role they already have
        if ($user->role_id == $validated['requested_role_id']) {
            return response()->json([
                'message' => 'You already have this role'
            ], 400);
        }

        // Check if there's already a pending request for this role
        $existingRequest = RoleChangeRequest::where('user_id', $user->id)
            ->where('requested_role_id', $validated['requested_role_id'])
            ->where('status', 'pending')
            ->first();

        if ($existingRequest) {
            return response()->json([
                'message' => 'You already have a pending request for this role'
            ], 400);
        }

        $roleChangeRequest = RoleChangeRequest::create([
            'user_id' => $user->id,
            'current_role_id' => $user->role_id,
            'requested_role_id' => $validated['requested_role_id'],
            'reason' => $validated['reason'],
            'status' => 'pending'
        ]);

        return response()->json([
            'message' => 'Role change request submitted successfully',
            'request' => [
                'id' => $roleChangeRequest->id,
                'status' => $roleChangeRequest->status,
                'reason' => $roleChangeRequest->reason,
                'created_at' => $roleChangeRequest->created_at->toISOString()
            ]
        ], 201);
    }

    /**
     * Get user's role change requests
     */
    public function getRoleChangeRequests(Request $request): JsonResponse
    {
        $requests = RoleChangeRequest::where('user_id', $request->user()->id)
            ->with(['currentRole', 'requestedRole'])
            ->orderByDesc('created_at')
            ->get();

        $formattedRequests = $requests->map(function ($request) {
            return [
                'id' => $request->id,
                'current_role' => [
                    'id' => $request->currentRole->id,
                    'name' => $request->currentRole->name,
                    'display_name' => $request->currentRole->display_name ?? ucfirst($request->currentRole->name)
                ],
                'requested_role' => [
                    'id' => $request->requestedRole->id,
                    'name' => $request->requestedRole->name,
                    'display_name' => $request->requestedRole->display_name ?? ucfirst($request->requestedRole->name)
                ],
                'reason' => $request->reason,
                'status' => $request->status,
                'created_at' => $request->created_at->toISOString(),
                'processed_at' => $request->processed_at ? $request->processed_at->toISOString() : null
            ];
        });

        return response()->json($formattedRequests);
    }

    /**
     * Get all pending role change requests (Owner only)
     */
    public function getAllPendingRoleChangeRequests(Request $request): JsonResponse
    {
        // Check if user is owner
        if ($request->user()->role->name !== 'owner') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $requests = RoleChangeRequest::where('status', 'pending')
            ->with(['user', 'currentRole', 'requestedRole'])
            ->orderByDesc('created_at')
            ->get();

        $formattedRequests = $requests->map(function ($request) {
            return [
                'id' => $request->id,
                'user' => [
                    'id' => $request->user->id,
                    'name' => $request->user->name,
                    'display_name' => $request->user->display_name,
                    'email' => $request->user->email
                ],
                'current_role' => [
                    'id' => $request->currentRole->id,
                    'name' => $request->currentRole->name,
                    'display_name' => $request->currentRole->display_name ?? ucfirst($request->currentRole->name)
                ],
                'requested_role' => [
                    'id' => $request->requestedRole->id,
                    'name' => $request->requestedRole->name,
                    'display_name' => $request->requestedRole->display_name ?? ucfirst($request->requestedRole->name)
                ],
                'reason' => $request->reason,
                'status' => $request->status,
                'created_at' => $request->created_at->toISOString()
            ];
        });

        return response()->json($formattedRequests);
    }

    /**
     * Approve or reject role change request (Owner only)
     */
    public function processRoleChangeRequest(Request $request, string $requestId): JsonResponse
    {
        // Check if user is owner
        if ($request->user()->role->name !== 'owner') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'action' => 'required|in:approve,reject',
            'admin_comment' => 'nullable|string|max:500'
        ]);

        $roleChangeRequest = RoleChangeRequest::where('id', $requestId)
            ->where('status', 'pending')
            ->first();

        if (!$roleChangeRequest) {
            return response()->json(['message' => 'Role change request not found or already processed'], 404);
        }

        DB::beginTransaction();
        try {
            $roleChangeRequest->update([
                'status' => $validated['action'] === 'approve' ? 'approved' : 'rejected',
                'admin_comment' => $validated['admin_comment'] ?? null,
                'processed_by' => $request->user()->id,
                'processed_at' => now()
            ]);

            // If approved, update the user's role
            if ($validated['action'] === 'approve') {
                $user = User::find($roleChangeRequest->user_id);
                $user->update(['role_id' => $roleChangeRequest->requested_role_id]);
            }

            DB::commit();

            return response()->json([
                'message' => 'Role change request ' . ($validated['action'] === 'approve' ? 'approved' : 'rejected') . ' successfully',
                'request' => [
                    'id' => $roleChangeRequest->id,
                    'status' => $roleChangeRequest->status,
                    'processed_at' => $roleChangeRequest->processed_at->toISOString()
                ]
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Error processing role change request',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
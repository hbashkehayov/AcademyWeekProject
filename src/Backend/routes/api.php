<?php

use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\RecommendationController;
use App\Http\Controllers\Api\RoleController;
use App\Http\Controllers\Api\ToolController;
use App\Http\Controllers\Api\AIAssistantController;
use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Auth\TwoFactorController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

// Include auth routes
require __DIR__.'/auth.php';

// Public routes
Route::get('/tools', [ToolController::class, 'index']);
Route::get('/tools/{tool:slug}', [ToolController::class, 'show']);
Route::get('/tools/search', [ToolController::class, 'search']);

Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/categories/{category:slug}', [CategoryController::class, 'show']);

Route::get('/roles', [RoleController::class, 'index']);
Route::get('/roles/{role}/tools', [RoleController::class, 'tools']);

// Temporary: Allow tool creation without authentication for testing
Route::post('/tools', [ToolController::class, 'store']);

// AI Assistant - Allow unauthenticated access
Route::post('/ai-assistant/chat', [AIAssistantController::class, 'chat']);
Route::post('/ai-assistant/submit-tool', [AIAssistantController::class, 'submitTool']);

// Authentication routes - Allow unauthenticated access
Route::post('/register', [App\Http\Controllers\Auth\RegisteredUserController::class, 'store']);
Route::post('/login', [App\Http\Controllers\Auth\AuthenticatedSessionController::class, 'store']);

// 2FA routes - Allow unauthenticated access for setup and verification
Route::prefix('2fa')->group(function () {
    Route::post('/setup-method', [TwoFactorController::class, 'setupMethod']);
    Route::post('/complete-setup', [TwoFactorController::class, 'completeSetup']);
    Route::post('/send-email-code', [TwoFactorController::class, 'sendEmailCode']);
    Route::post('/verify-email-setup', [TwoFactorController::class, 'verifyEmailSetup']);
    Route::post('/verify-login', [TwoFactorController::class, 'verifyLogin']);
    Route::post('/available-methods', [TwoFactorController::class, 'getAvailableMethods']);
    Route::post('/resend-qr', [TwoFactorController::class, 'resendQrCode']);
    Route::post('/skip-setup', [TwoFactorController::class, 'skipSetup']);
});

// Temporary: Allow admin endpoints without authentication for testing
Route::get('/admin/pending-tools', [AdminController::class, 'getPendingTools']);
Route::post('/admin/tools/{tool}/approve', [AdminController::class, 'approveTool']);
Route::post('/admin/tools/{tool}/reject', [AdminController::class, 'rejectTool']);
Route::get('/admin/users', [AdminController::class, 'getUsers']);
Route::delete('/admin/users/{user}', [AdminController::class, 'deleteUser']);
Route::get('/admin/stats', [AdminController::class, 'getDashboardStats']);

// Authentication required routes
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', function (Request $request) {
        return $request->user()->load('role', 'organization');
    });

    // Dashboard route
    Route::get('/dashboard', function (Request $request) {
        return response()->json([
            'message' => 'Dashboard access granted',
            'user' => $request->user()->load('role', 'organization')
        ]);
    });

    // Tool management (except create which is above)
    Route::put('/tools/{tool}', [ToolController::class, 'update']);
    Route::delete('/tools/{tool}', [ToolController::class, 'destroy']);
    
    // Tool interactions
    Route::post('/tools/{tool}/rate', [ToolController::class, 'rate']);
    Route::post('/tools/{tool}/favorite', [ToolController::class, 'toggleFavorite']);
    Route::post('/tools/{tool}/usage', [ToolController::class, 'trackUsage']);
    
    // Recommendations
    Route::get('/recommendations', [RecommendationController::class, 'index']);
    Route::get('/recommendations/role-based', [RecommendationController::class, 'roleBasedRecommendations']);
    
    // User favorites and history
    Route::get('/user/favorites', [ToolController::class, 'favorites']);
    Route::get('/user/history', [ToolController::class, 'history']);
    
    // Admin routes (Owner only)
    Route::prefix('admin')->group(function () {
        Route::get('/pending-tools', [AdminController::class, 'getPendingTools']);
        Route::post('/tools/{tool}/approve', [AdminController::class, 'approveTool']);
        Route::post('/tools/{tool}/reject', [AdminController::class, 'rejectTool']);
        Route::get('/dashboard-stats', [AdminController::class, 'getDashboardStats']);
    });
});

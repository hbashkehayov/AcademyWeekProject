<?php

use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\RecommendationController;
use App\Http\Controllers\Api\RoleController;
use App\Http\Controllers\Api\ToolController;
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
});

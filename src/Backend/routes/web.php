<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

Route::get('/', function () {
    return ['Laravel' => app()->version()];
});

// Sanctum CSRF Cookie route (this initializes the CSRF token in cookies)
Route::middleware('web')->get('/sanctum/csrf-cookie', function () {
    return response()->json([
        'message' => 'CSRF cookie set',
        'csrf_token' => csrf_token()
    ]);
});

// Temporary dashboard route to prevent 404 errors
Route::get('/dashboard', function () {
    return response()->json(['message' => 'Dashboard route accessed', 'success' => true]);
})->name('dashboard');

require __DIR__.'/auth.php';

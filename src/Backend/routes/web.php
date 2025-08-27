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

// Temporary dashboard route to prevent 404 errors
Route::get('/dashboard', function () {
    return response()->json(['message' => 'Dashboard route accessed', 'success' => true]);
})->name('dashboard');

require __DIR__.'/auth.php';

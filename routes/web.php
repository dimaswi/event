<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\Api\UploadController;
use App\Http\Controllers\DashboardController;

// Route::get('/', function () {
//     return Inertia::render('welcome');
// })->name('home');

Route::get('/', function () {
    return redirect()->route('new.tickets.index');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');
});

// API Routes for file upload
Route::post('/api/upload', [UploadController::class, 'upload'])->middleware(['auth', 'verified']);

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
require __DIR__.'/master.php';
require __DIR__.'/tickets.php';
require __DIR__.'/admin.php';
require __DIR__.'/test.php';

<?php

declare(strict_types=1);

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\TaskController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return redirect()->route('login');
});

Route::middleware(['auth', 'verified'])->group(function (): void {
    // 1. Dashboard & Projects
    Route::get('/dashboard', [ProjectController::class, 'dashboard'])->name('dashboard');
    Route::get('/projects', [ProjectController::class, 'index'])->name('projects.index');
    Route::resource('projects', ProjectController::class)->except(['index', 'create', 'edit']);
    Route::get('/projects/{project}/export', [ProjectController::class, 'export'])->name('projects.export');

    // 2. Calendar & Summary Report
    Route::get('/calendar', [ProjectController::class, 'calendar'])->name('calendar');
    Route::get('/report', [ProjectController::class, 'report'])->name('report');

    // 3. Tasks Management
    Route::post('/projects/{project}/tasks', [TaskController::class, 'store'])->name('projects.tasks.store');
    Route::put('/tasks/{task}', [TaskController::class, 'update'])->name('tasks.update');
    Route::delete('/tasks/{task}', [TaskController::class, 'destroy'])->name('tasks.destroy');
    Route::patch('/tasks/{task}/status', [TaskController::class, 'updateStatus'])->name('tasks.updateStatus');

    // 4. Profile & Settings
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    Route::get('/settings', [ProjectController::class, 'settings'])->name('settings');

    // Debug overdue
    Route::post('/debug/simulate-overdue', [ProjectController::class, 'simulateOverdueTask'])->name('debug.overdue');
});

require __DIR__.'/auth.php';

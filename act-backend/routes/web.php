<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\DB;

Route::get('/', function () {
    return ['Laravel' => app()->version(), 'status' => 'ok'];
});

// Health check endpoint for Render.com
Route::get('/health', function () {
    try {
        // Check database connection
        DB::connection()->getPdo();
        return response()->json([
            'status' => 'healthy',
            'database' => 'connected',
            'timestamp' => now()->toIso8601String()
        ], 200);
    } catch (\Exception $e) {
        return response()->json([
            'status' => 'unhealthy',
            'database' => 'disconnected',
            'error' => $e->getMessage(),
            'timestamp' => now()->toIso8601String()
        ], 503);
    }
});

require __DIR__.'/auth.php';

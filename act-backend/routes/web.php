<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\DB;

Route::get('/', function () {
    try {
        return response()->json([
            'Laravel' => \Illuminate\Foundation\Application::VERSION ?? '12.x',
            'status' => 'ok',
            'message' => 'ACT E-Learning API',
            'timestamp' => now()->toIso8601String()
        ], 200);
    } catch (\Exception $e) {
        return response()->json([
            'status' => 'error',
            'message' => 'API is running but encountered an error',
            'error' => $e->getMessage()
        ], 500);
    }
});

// Health check endpoint for Render.com (supports GET and HEAD)
Route::match(['get', 'head'], '/health', function () {
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

// Debug endpoint (remove in production if needed)
Route::get('/debug', function () {
    return response()->json([
        'php_version' => PHP_VERSION,
        'laravel_version' => \Illuminate\Foundation\Application::VERSION ?? 'unknown',
        'app_env' => config('app.env'),
        'app_debug' => config('app.debug'),
        'cache_driver' => config('cache.default'),
        'db_connection' => config('database.default'),
    ], 200);
});

require __DIR__.'/auth.php';

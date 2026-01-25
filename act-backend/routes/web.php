<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\DB;

// Simple test route without any dependencies
Route::get('/', function () {
    return response()->json([
        'Laravel' => '12.x',
        'status' => 'ok',
        'message' => 'ACT E-Learning API',
        'timestamp' => date('c')
    ], 200);
});

// Health check endpoint for Render.com (supports GET and HEAD)
Route::match(['get', 'head'], '/health', function () {
    try {
        // Check database connection
        DB::connection()->getPdo();
        return response()->json([
            'status' => 'healthy',
            'database' => 'connected',
            'timestamp' => date('c')
        ], 200);
    } catch (\Exception $e) {
        return response()->json([
            'status' => 'unhealthy',
            'database' => 'disconnected',
            'error' => $e->getMessage(),
            'timestamp' => date('c')
        ], 503);
    }
});

// Debug endpoint (remove in production if needed)
Route::get('/debug', function () {
    try {
        return response()->json([
            'php_version' => PHP_VERSION,
            'laravel_version' => '12.x',
            'app_env' => env('APP_ENV', 'unknown'),
            'app_debug' => env('APP_DEBUG', false),
            'routes_loaded' => true,
        ], 200);
    } catch (\Exception $e) {
        return response()->json([
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString()
        ], 500);
    }
});

require __DIR__.'/auth.php';

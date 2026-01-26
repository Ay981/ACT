<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\Cache;
class CheckMaintenanceMode
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // 1. Check if maintenance mode is enabled (FORCE DISABLED)
        $isMaintenance = false; // Cache::get('maintenance_mode');
        
        if (!$isMaintenance) {
            return $next($request);
        }

        // 2. Define exempt routes (Login, Logout, CSRF)
        $exemptRoutes = [
            'login',
            'logout',
            'sanctum/csrf-cookie',
            'api/admin/maintenance' // Allow checking status
        ];

        if ($request->is($exemptRoutes) || $request->is('api/login') || $request->is('api/logout')) {
            return $next($request);
        }

        // 3. Check Authentication manually if not already resolved
        // We need to know who the user is to allow Admins.
        // If the request expects JSON (API), we can try to get the user via Sanctum.
        
        $user = $request->user('sanctum');

        if ($user && $user->role === 'admin') {
             return $next($request);
        }

        // 4. Block everyone else (Guests, Students, Instructors)
        return response()->json([
            'message' => 'System is under maintenance.',
            'maintenance' => true
        ], 503);
    }
}

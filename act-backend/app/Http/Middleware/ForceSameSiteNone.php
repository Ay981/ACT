<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ForceSameSiteNone
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);
        
        // Force SameSite=None for all cookies in cross-domain scenarios
        if (config('session.same_site') === 'none' || env('SESSION_SAME_SITE') === 'none') {
            foreach ($response->headers->getCookies() as $cookie) {
                // Clone cookie with SameSite=None
                $response->headers->removeCookie(
                    $cookie->getName(),
                    $cookie->getPath(),
                    $cookie->getDomain()
                );
                
                $response->headers->setCookie(
                    $cookie->getName(),
                    $cookie->getValue(),
                    $cookie->getExpiresTime(),
                    $cookie->getPath(),
                    $cookie->getDomain(),
                    true, // secure
                    $cookie->isHttpOnly(),
                    false, // raw
                    'none' // SameSite
                );
            }
        }
        
        return $response;
    }
}

<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class LogApiRequests
{
    /**
     * Journal de toutes les requêtes API.
     */
    public function handle(Request $request, Closure $next): mixed
    {
        $response = $next($request);

        Log::channel('daily')->info('API Request', [
            'method'  => $request->method(),
            'url'     => $request->fullUrl(),
            'ip'      => $request->ip(),
            'user_id' => optional(auth('api')->user())->id,
            'status'  => $response->getStatusCode(),
        ]);

        return $response;
    }
}

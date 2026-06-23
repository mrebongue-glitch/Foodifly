<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class RoleMiddleware
{
    /**
     * Vérifie que l'utilisateur connecté possède le rôle requis.
     */
    public function handle(Request $request, Closure $next, string $role): mixed
    {
        $user = auth('api')->user();

        if (! $user || $user->role !== $role) {
            return response()->json([
                'message' => 'Accès refusé : rôle insuffisant.',
            ], 403);
        }

        return $next($request);
    }
}

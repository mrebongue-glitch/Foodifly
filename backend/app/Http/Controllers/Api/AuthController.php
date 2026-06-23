<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Tymon\JWTAuth\Facades\JWTAuth;
use Tymon\JWTAuth\Exceptions\JWTException;

class AuthController extends Controller
{
    /**
     * Connexion utilisateur → retourne un token JWT.
     */
    public function login(Request $request)
    {
        $request->validate([
            'email'       => 'required|email',
            'mot_de_passe' => 'required|string|min:6',
        ]);

        $user = User::where('email', $request->email)->first();

        if (! $user || ! Hash::check($request->mot_de_passe, $user->mot_de_passe)) {
            return response()->json([
                'message' => 'Identifiants incorrects.',
            ], 401);
        }

        try {
            $token = JWTAuth::fromUser($user);
        } catch (JWTException $e) {
            return response()->json(['message' => 'Impossible de créer le token.'], 500);
        }

        return response()->json([
            'token'      => $token,
            'token_type' => 'bearer',
            'expires_in' => config('jwt.ttl') * 60,
            'user'       => [
                'id'            => $user->id,
                'nom'           => $user->nom,
                'email'         => $user->email,
                'role'          => $user->role,
                'restaurant_id' => $user->restaurant_id,
            ],
        ]);
    }

    /**
     * Récupère le profil de l'utilisateur connecté.
     */
    public function me(Request $request)
    {
        $user = auth('api')->user();

        return response()->json([
            'id'            => $user->id,
            'nom'           => $user->nom,
            'email'         => $user->email,
            'role'          => $user->role,
            'restaurant_id' => $user->restaurant_id,
        ]);
    }

    /**
     * Invalidation du token (déconnexion).
     */
    public function logout()
    {
        try {
            JWTAuth::invalidate(JWTAuth::getToken());
        } catch (JWTException $e) {
            // Token déjà expiré, on ignore
        }

        return response()->json(['message' => 'Déconnecté avec succès.']);
    }

    /**
     * Rafraîchit le token JWT.
     */
    public function refresh()
    {
        try {
            $newToken = JWTAuth::refresh(JWTAuth::getToken());
        } catch (JWTException $e) {
            return response()->json(['message' => 'Token invalide.'], 401);
        }

        return response()->json(['token' => $newToken]);
    }

    /**
     * Création d'un utilisateur (admin uniquement).
     */
    public function register(Request $request)
    {
        $request->validate([
            'nom'           => 'required|string|max:100',
            'email'         => 'required|email|unique:users',
            'mot_de_passe'  => 'required|string|min:8|confirmed',
            'role'          => 'required|in:admin,restaurant',
            'restaurant_id' => 'nullable|exists:restaurants,id',
        ]);

        $user = User::create([
            'nom'           => $request->nom,
            'email'         => $request->email,
            'mot_de_passe'  => Hash::make($request->mot_de_passe),
            'role'          => $request->role,
            'restaurant_id' => $request->restaurant_id,
        ]);

        return response()->json([
            'message' => 'Utilisateur créé.',
            'user'    => $user->only(['id', 'nom', 'email', 'role', 'restaurant_id']),
        ], 201);
    }
}

<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CatalogueController;
use App\Http\Controllers\Api\CommandeController;
use App\Http\Controllers\Api\RestaurantController;

/*
|--------------------------------------------------------------------------
| Routes publiques (sans authentification)
|--------------------------------------------------------------------------
*/

// Authentification
Route::prefix('auth')->group(function () {
    Route::post('login',   [AuthController::class, 'login']);
    Route::post('refresh', [AuthController::class, 'refresh']);
});

// Catalogue public (mini-site client)
Route::get('catalogue',    [CatalogueController::class, 'index']);
Route::get('catalogue/{id}', [CatalogueController::class, 'show']);

// Liste publique des restaurants
Route::get('restaurants',      [RestaurantController::class, 'index']);
Route::get('restaurants/{id}', [RestaurantController::class, 'show']);

// Création de commande par le client (sans auth)
Route::post('commandes', [CommandeController::class, 'store']);

/*
|--------------------------------------------------------------------------
| Routes protégées par JWT
|--------------------------------------------------------------------------
*/

Route::middleware('auth:api')->group(function () {

    // Auth
    Route::post('auth/logout',   [AuthController::class, 'logout']);
    Route::get('auth/me',        [AuthController::class, 'me']);

    // Catalogue (gestion par le restaurant)
    Route::post('catalogue',           [CatalogueController::class, 'store']);
    Route::put('catalogue/{id}',       [CatalogueController::class, 'update']);
    Route::patch('catalogue/{id}',     [CatalogueController::class, 'update']);
    Route::delete('catalogue/{id}',    [CatalogueController::class, 'destroy']);

    // Commandes (dashboard)
    Route::get('commandes',                         [CommandeController::class, 'index']);
    Route::get('commandes/statistiques',            [CommandeController::class, 'statistiques']);
    Route::get('commandes/{id}',                    [CommandeController::class, 'show']);
    Route::patch('commandes/{id}/statut',           [CommandeController::class, 'updateStatut']);

    // Routes admin uniquement
    Route::middleware('role:admin')->group(function () {
        Route::post('auth/register',       [AuthController::class, 'register']);
        Route::post('restaurants',         [RestaurantController::class, 'store']);
        Route::put('restaurants/{id}',     [RestaurantController::class, 'update']);
        Route::delete('restaurants/{id}',  [RestaurantController::class, 'destroy']);
    });
});

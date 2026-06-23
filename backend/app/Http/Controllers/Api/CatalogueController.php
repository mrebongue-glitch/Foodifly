<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Catalogue;
use Illuminate\Http\Request;

class CatalogueController extends Controller
{
    /**
     * Liste tous les plats d'un restaurant.
     * Public : accessible sans authentification pour le mini-site client.
     */
    public function index(Request $request)
    {
        $restaurantId = $request->query('restaurant_id') ?? $this->getRestaurantIdFromUser();

        if (! $restaurantId) {
            return response()->json(['message' => 'restaurant_id requis.'], 400);
        }

        $items = Catalogue::where('restaurant_id', $restaurantId)
            ->when($request->query('dispo_only'), fn ($q) => $q->where('dispo', true))
            ->when($request->query('categorie'), fn ($q, $cat) => $q->where('categorie', $cat))
            ->orderBy('categorie')
            ->orderBy('plat')
            ->get();

        return response()->json($items);
    }

    /**
     * Affiche un plat spécifique.
     */
    public function show(int $id)
    {
        $item = Catalogue::findOrFail($id);
        $this->authorizeRestaurant($item->restaurant_id);

        return response()->json($item);
    }

    /**
     * Ajoute un plat au catalogue.
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'plat'          => 'required|string|max:150',
            'description'   => 'nullable|string',
            'prix'          => 'required|numeric|min:0',
            'dispo'         => 'boolean',
            'categorie'     => 'nullable|string|max:80',
            'image'         => 'nullable|string',
        ]);

        $restaurantId = $this->getRestaurantIdFromUser();
        $data['restaurant_id'] = $restaurantId;
        $data['dispo'] = $data['dispo'] ?? true;

        $item = Catalogue::create($data);

        return response()->json($item, 201);
    }

    /**
     * Modifie un plat existant.
     */
    public function update(Request $request, int $id)
    {
        $item = Catalogue::findOrFail($id);
        $this->authorizeRestaurant($item->restaurant_id);

        $data = $request->validate([
            'plat'        => 'sometimes|string|max:150',
            'description' => 'nullable|string',
            'prix'        => 'sometimes|numeric|min:0',
            'dispo'       => 'boolean',
            'categorie'   => 'nullable|string|max:80',
            'image'       => 'nullable|string',
        ]);

        $item->update($data);

        return response()->json($item);
    }

    /**
     * Supprime un plat.
     */
    public function destroy(int $id)
    {
        $item = Catalogue::findOrFail($id);
        $this->authorizeRestaurant($item->restaurant_id);
        $item->delete();

        return response()->json(['message' => 'Plat supprimé.']);
    }

    // ──────────────────────────────────────────────
    // Helpers

    private function getRestaurantIdFromUser(): ?int
    {
        $user = auth('api')->user();

        if (! $user) {
            return null;
        }

        // Un admin peut passer restaurant_id en query
        return $user->restaurant_id;
    }

    private function authorizeRestaurant(int $restaurantId): void
    {
        $user = auth('api')->user();

        if ($user->role === 'admin') {
            return;
        }

        if ((int) $user->restaurant_id !== $restaurantId) {
            abort(403, 'Accès refusé à ce restaurant.');
        }
    }
}

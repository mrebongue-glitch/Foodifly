<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Commande;
use App\Models\Catalogue;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class CommandeController extends Controller
{
    /**
     * Liste les commandes du restaurant (dashboard).
     */
    public function index(Request $request)
    {
        $restaurantId = $this->resolveRestaurantId($request);

        $query = Commande::where('restaurant_id', $restaurantId)
            ->orderByDesc('created_at');

        if ($statut = $request->query('statut')) {
            $query->where('statut', $statut);
        }

        if ($date = $request->query('date')) {
            $query->whereDate('date', $date);
        }

        return response()->json($query->paginate(20));
    }

    /**
     * Détails d'une commande.
     */
    public function show(int $id)
    {
        $commande = Commande::findOrFail($id);
        $this->authorizeRestaurant($commande->restaurant_id);

        return response()->json($commande);
    }

    /**
     * Crée une nouvelle commande (accessible sans auth pour le mini-site client).
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'client_nom'        => 'required|string|max:100',
            'client_telephone'  => 'nullable|string|max:20',
            'restaurant_id'     => 'required|exists:restaurants,id',
            'items'             => 'required|array|min:1',
            'items.*.catalogue_id' => 'required|exists:catalogue,id',
            'items.*.quantite'  => 'required|integer|min:1',
            'notes'             => 'nullable|string|max:500',
        ]);

        // Calcule le total en récupérant les prix depuis la BDD
        $total = 0;
        $itemsAvecPrix = [];

        foreach ($data['items'] as $item) {
            $plat = Catalogue::findOrFail($item['catalogue_id']);

            if (! $plat->dispo) {
                return response()->json([
                    'message' => "Le plat \"{$plat->plat}\" n'est plus disponible.",
                ], 422);
            }

            $sousTotal = $plat->prix * $item['quantite'];
            $total += $sousTotal;

            $itemsAvecPrix[] = [
                'catalogue_id' => $plat->id,
                'plat'         => $plat->plat,
                'prix_unitaire' => (float) $plat->prix,
                'quantite'     => $item['quantite'],
                'sous_total'   => (float) $sousTotal,
            ];
        }

        $commande = Commande::create([
            'client_nom'       => $data['client_nom'],
            'client_telephone' => $data['client_telephone'] ?? null,
            'restaurant_id'    => $data['restaurant_id'],
            'statut'           => 'en_attente',
            'items'            => $itemsAvecPrix,
            'total'            => $total,
            'notes'            => $data['notes'] ?? null,
            'date'             => now(),
        ]);

        return response()->json($commande, 201);
    }

    /**
     * Mise à jour du statut d'une commande (dashboard restaurant).
     */
    public function updateStatut(Request $request, int $id)
    {
        $commande = Commande::findOrFail($id);
        $this->authorizeRestaurant($commande->restaurant_id);

        $request->validate([
            'statut' => 'required|in:en_attente,en_preparation,pret,livre,annule',
        ]);

        $commande->update(['statut' => $request->statut]);

        return response()->json($commande);
    }

    /**
     * Statistiques journalières pour le dashboard.
     */
    public function statistiques(Request $request)
    {
        $restaurantId = $this->resolveRestaurantId($request);

        $today = Carbon::today();
        $hier  = Carbon::yesterday();

        $statsAujourdhui = $this->buildStats($restaurantId, $today);
        $statsHier       = $this->buildStats($restaurantId, $hier);

        // Évolution sur les 7 derniers jours
        $evolution = [];
        for ($i = 6; $i >= 0; $i--) {
            $jour = Carbon::today()->subDays($i);
            $evolution[] = [
                'date'      => $jour->format('Y-m-d'),
                'label'     => $jour->locale('fr')->isoFormat('ddd D'),
                'commandes' => Commande::where('restaurant_id', $restaurantId)
                    ->whereDate('date', $jour)
                    ->count(),
                'chiffre_affaires' => (float) Commande::where('restaurant_id', $restaurantId)
                    ->whereDate('date', $jour)
                    ->whereIn('statut', ['pret', 'livre'])
                    ->sum('total'),
            ];
        }

        return response()->json([
            'aujourd_hui' => $statsAujourdhui,
            'hier'        => $statsHier,
            'evolution'   => $evolution,
        ]);
    }

    // ──────────────────────────────────────────────
    // Helpers

    private function buildStats(int $restaurantId, Carbon $date): array
    {
        $base = Commande::where('restaurant_id', $restaurantId)->whereDate('date', $date);

        return [
            'total_commandes'    => (clone $base)->count(),
            'en_attente'         => (clone $base)->where('statut', 'en_attente')->count(),
            'en_preparation'     => (clone $base)->where('statut', 'en_preparation')->count(),
            'livrees'            => (clone $base)->whereIn('statut', ['pret', 'livre'])->count(),
            'annulees'           => (clone $base)->where('statut', 'annule')->count(),
            'chiffre_affaires'   => (float) (clone $base)->whereIn('statut', ['pret', 'livre'])->sum('total'),
        ];
    }

    private function resolveRestaurantId(Request $request): int
    {
        $user = auth('api')->user();

        if ($user->role === 'admin' && $request->query('restaurant_id')) {
            return (int) $request->query('restaurant_id');
        }

        return (int) $user->restaurant_id;
    }

    private function authorizeRestaurant(int $restaurantId): void
    {
        $user = auth('api')->user();

        if ($user->role === 'admin') {
            return;
        }

        if ((int) $user->restaurant_id !== $restaurantId) {
            abort(403, 'Accès refusé à cette commande.');
        }
    }
}

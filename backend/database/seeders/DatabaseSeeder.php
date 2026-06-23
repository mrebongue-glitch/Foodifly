<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\Restaurant;
use App\Models\Catalogue;
use App\Models\Commande;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // ─── Restaurants ───────────────────────────────────────────
        $resto1 = Restaurant::create([
            'nom'         => 'Le Petit Foyer',
            'adresse'     => '12 Rue de la Paix, Douala',
            'telephone'   => '+237 655 123 456',
            'email'       => 'contact@lepetitfoyer.cm',
            'description' => 'Cuisine camerounaise traditionnelle',
            'actif'       => true,
        ]);

        $resto2 = Restaurant::create([
            'nom'         => 'Mboa Kitchen',
            'adresse'     => '8 Avenue Kennedy, Yaoundé',
            'telephone'   => '+237 699 987 654',
            'email'       => 'info@mboakitchen.cm',
            'description' => 'Grillades et spécialités africaines',
            'actif'       => true,
        ]);

        // ─── Utilisateurs ─────────────────────────────────────────
        User::create([
            'nom'           => 'Administrateur',
            'email'         => 'admin@foodifly.cm',
            'mot_de_passe'  => Hash::make('Admin@1234'),
            'role'          => 'admin',
            'restaurant_id' => null,
        ]);

        User::create([
            'nom'           => 'Gérant Foyer',
            'email'         => 'gerant@lepetitfoyer.cm',
            'mot_de_passe'  => Hash::make('Foyer@1234'),
            'role'          => 'restaurant',
            'restaurant_id' => $resto1->id,
        ]);

        User::create([
            'nom'           => 'Gérant Mboa',
            'email'         => 'gerant@mboakitchen.cm',
            'mot_de_passe'  => Hash::make('Mboa@1234'),
            'role'          => 'restaurant',
            'restaurant_id' => $resto2->id,
        ]);

        // ─── Catalogue Restaurant 1 ───────────────────────────────
        $plats1 = [
            ['plat' => 'Ndolé au poisson',   'prix' => 2500, 'categorie' => 'Plats principaux'],
            ['plat' => 'Poulet DG',          'prix' => 3500, 'categorie' => 'Plats principaux'],
            ['plat' => 'Koki aux crevettes', 'prix' => 2000, 'categorie' => 'Entrées'],
            ['plat' => 'Riz sauté légumes',  'prix' => 1500, 'categorie' => 'Plats principaux'],
            ['plat' => 'Jus de Bissap',      'prix' => 500,  'categorie' => 'Boissons'],
            ['plat' => 'Beignets plantain',  'prix' => 800,  'categorie' => 'Accompagnements'],
        ];

        foreach ($plats1 as $plat) {
            Catalogue::create(array_merge($plat, [
                'restaurant_id' => $resto1->id,
                'dispo'         => true,
            ]));
        }

        // ─── Catalogue Restaurant 2 ───────────────────────────────
        $plats2 = [
            ['plat' => 'Brochettes de bœuf',  'prix' => 3000, 'categorie' => 'Grillades'],
            ['plat' => 'Tilapia braisé',       'prix' => 4000, 'categorie' => 'Grillades'],
            ['plat' => 'Plantain braisé',      'prix' => 1000, 'categorie' => 'Accompagnements'],
            ['plat' => 'Salade avocat',        'prix' => 1200, 'categorie' => 'Entrées'],
            ['plat' => 'Eau minérale',         'prix' => 300,  'categorie' => 'Boissons'],
            ['plat' => 'Bière Beaufort 65cl',  'prix' => 700,  'categorie' => 'Boissons'],
        ];

        foreach ($plats2 as $plat) {
            Catalogue::create(array_merge($plat, [
                'restaurant_id' => $resto2->id,
                'dispo'         => true,
            ]));
        }

        // ─── Commandes de démonstration ───────────────────────────
        $cat = Catalogue::where('restaurant_id', $resto1->id)->get()->keyBy('plat');

        Commande::create([
            'client_nom'       => 'Marie Nguemo',
            'client_telephone' => '+237 677 111 222',
            'restaurant_id'    => $resto1->id,
            'statut'           => 'livre',
            'items'            => [
                ['catalogue_id' => $cat['Ndolé au poisson']->id, 'plat' => 'Ndolé au poisson', 'prix_unitaire' => 2500, 'quantite' => 1, 'sous_total' => 2500],
                ['catalogue_id' => $cat['Jus de Bissap']->id,    'plat' => 'Jus de Bissap',    'prix_unitaire' => 500,  'quantite' => 2, 'sous_total' => 1000],
            ],
            'total' => 3500,
            'date'  => now()->subHours(2),
        ]);

        Commande::create([
            'client_nom'       => 'Paul Atangana',
            'client_telephone' => '+237 690 333 444',
            'restaurant_id'    => $resto1->id,
            'statut'           => 'en_preparation',
            'items'            => [
                ['catalogue_id' => $cat['Poulet DG']->id, 'plat' => 'Poulet DG', 'prix_unitaire' => 3500, 'quantite' => 2, 'sous_total' => 7000],
            ],
            'total' => 7000,
            'date'  => now()->subMinutes(30),
        ]);

        Commande::create([
            'client_nom'    => 'Ines Mbida',
            'restaurant_id' => $resto1->id,
            'statut'        => 'en_attente',
            'items'         => [
                ['catalogue_id' => $cat['Koki aux crevettes']->id, 'plat' => 'Koki aux crevettes', 'prix_unitaire' => 2000, 'quantite' => 1, 'sous_total' => 2000],
                ['catalogue_id' => $cat['Beignets plantain']->id,  'plat' => 'Beignets plantain',  'prix_unitaire' => 800,  'quantite' => 1, 'sous_total' => 800],
            ],
            'total' => 2800,
            'date'  => now()->subMinutes(10),
        ]);
    }
}

<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Restaurant;
use Illuminate\Http\Request;

class RestaurantController extends Controller
{
    public function index()
    {
        return response()->json(Restaurant::where('actif', true)->get());
    }

    public function show(int $id)
    {
        return response()->json(Restaurant::findOrFail($id));
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'nom'         => 'required|string|max:150',
            'adresse'     => 'required|string|max:255',
            'telephone'   => 'nullable|string|max:20',
            'email'       => 'nullable|email',
            'description' => 'nullable|string',
        ]);

        $restaurant = Restaurant::create($data);

        return response()->json($restaurant, 201);
    }

    public function update(Request $request, int $id)
    {
        $restaurant = Restaurant::findOrFail($id);

        $data = $request->validate([
            'nom'         => 'sometimes|string|max:150',
            'adresse'     => 'sometimes|string|max:255',
            'telephone'   => 'nullable|string|max:20',
            'email'       => 'nullable|email',
            'description' => 'nullable|string',
            'actif'       => 'boolean',
        ]);

        $restaurant->update($data);

        return response()->json($restaurant);
    }

    public function destroy(int $id)
    {
        Restaurant::findOrFail($id)->delete();

        return response()->json(['message' => 'Restaurant supprimé.']);
    }
}

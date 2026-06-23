<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Restaurant extends Model
{
    use HasFactory;

    protected $fillable = [
        'nom',
        'adresse',
        'telephone',
        'email',
        'description',
        'actif',
    ];

    protected $casts = [
        'actif' => 'boolean',
    ];

    public function catalogue()
    {
        return $this->hasMany(Catalogue::class);
    }

    public function commandes()
    {
        return $this->hasMany(Commande::class);
    }

    public function users()
    {
        return $this->hasMany(User::class);
    }
}

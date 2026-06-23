<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Commande extends Model
{
    use HasFactory;

    protected $fillable = [
        'client_nom',
        'client_telephone',
        'restaurant_id',
        'statut',
        'items',
        'total',
        'notes',
        'date',
    ];

    protected $casts = [
        'items' => 'array',
        'total' => 'decimal:2',
        'date'  => 'datetime',
    ];

    public function restaurant()
    {
        return $this->belongsTo(Restaurant::class);
    }
}

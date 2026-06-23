<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Catalogue extends Model
{
    use HasFactory;

    protected $table = 'catalogue';

    protected $fillable = [
        'restaurant_id',
        'plat',
        'description',
        'prix',
        'dispo',
        'categorie',
        'image',
    ];

    protected $casts = [
        'prix'  => 'decimal:2',
        'dispo' => 'boolean',
    ];

    public function restaurant()
    {
        return $this->belongsTo(Restaurant::class);
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Tymon\JWTAuth\Contracts\JWTSubject;

class User extends Authenticatable implements JWTSubject
{
    use HasFactory, Notifiable;

    protected $fillable = [
        'nom',
        'email',
        'mot_de_passe',
        'role',
        'restaurant_id',
    ];

    protected $hidden = [
        'mot_de_passe',
        'remember_token',
    ];

    // Mappe le champ 'mot_de_passe' sur le getter/setter standard Laravel
    public function getAuthPassword(): string
    {
        return $this->mot_de_passe;
    }

    public function getJWTIdentifier(): mixed
    {
        return $this->getKey();
    }

    public function getJWTCustomClaims(): array
    {
        return [
            'role'          => $this->role,
            'restaurant_id' => $this->restaurant_id,
        ];
    }

    public function restaurant()
    {
        return $this->belongsTo(Restaurant::class);
    }
}

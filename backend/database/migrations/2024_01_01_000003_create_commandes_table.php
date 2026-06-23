<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('commandes', function (Blueprint $table) {
            $table->id();
            $table->string('client_nom');
            $table->string('client_telephone')->nullable();
            $table->unsignedBigInteger('restaurant_id');
            $table->enum('statut', ['en_attente', 'en_preparation', 'pret', 'livre', 'annule'])
                  ->default('en_attente');
            $table->json('items'); // [{catalogue_id, plat, prix, quantite}]
            $table->decimal('total', 10, 2)->default(0);
            $table->text('notes')->nullable();
            $table->timestamp('date')->useCurrent();
            $table->timestamps();

            $table->foreign('restaurant_id')->references('id')->on('restaurants')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('commandes');
    }
};

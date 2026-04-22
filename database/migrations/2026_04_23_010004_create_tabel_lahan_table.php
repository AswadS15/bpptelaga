<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tabel_lahan', function (Blueprint $table) {
            $table->id('id_lahan');
            $table->unsignedBigInteger('id_petani');
            $table->decimal('luas', 10, 2);
            $table->json('koordinat')->nullable(); // GeoJSON
            $table->foreign('id_petani')->references('id_petani')->on('tabel_petani')->onDelete('cascade');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tabel_lahan');
    }
};

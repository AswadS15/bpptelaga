<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tabel_lahan_komoditas', function (Blueprint $table) {
            $table->unsignedBigInteger('id_lahan');
            $table->unsignedBigInteger('id_komoditas');
            $table->primary(['id_lahan', 'id_komoditas']);
            $table->foreign('id_lahan')->references('id_lahan')->on('tabel_lahan')->onDelete('cascade');
            $table->foreign('id_komoditas')->references('id_komoditas')->on('tabel_komoditas')->onDelete('cascade');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tabel_lahan_komoditas');
    }
};

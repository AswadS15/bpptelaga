<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tabel_kelompok_tani', function (Blueprint $table) {
            $table->id('id_kelompok');
            $table->string('nama_kelompok');
            $table->string('desa');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tabel_kelompok_tani');
    }
};

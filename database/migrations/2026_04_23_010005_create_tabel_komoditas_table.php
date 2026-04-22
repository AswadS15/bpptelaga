<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tabel_komoditas', function (Blueprint $table) {
            $table->id('id_komoditas');
            $table->string('nama_komoditas');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tabel_komoditas');
    }
};

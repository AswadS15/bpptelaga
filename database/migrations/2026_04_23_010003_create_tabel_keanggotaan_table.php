<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tabel_keanggotaan', function (Blueprint $table) {
            $table->unsignedBigInteger('id_petani');
            $table->unsignedBigInteger('id_kelompok');
            $table->primary(['id_petani', 'id_kelompok']);
            $table->foreign('id_petani')->references('id_petani')->on('tabel_petani')->onDelete('cascade');
            $table->foreign('id_kelompok')->references('id_kelompok')->on('tabel_kelompok_tani')->onDelete('cascade');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tabel_keanggotaan');
    }
};

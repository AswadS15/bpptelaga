<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('tabel_lahan', function (Blueprint $table) {
            $table->string('fase_tanam')->default('belum_tanam')->after('luas');
            // Menambahkan kolom untuk menyimpan nilai NDVI terakhir (simulasi hasil analisis satelit)
            $table->decimal('ndvi_skor', 4, 3)->nullable()->after('fase_tanam');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tabel_lahan', function (Blueprint $table) {
            $table->dropColumn(['fase_tanam', 'ndvi_skor']);
        });
    }
};

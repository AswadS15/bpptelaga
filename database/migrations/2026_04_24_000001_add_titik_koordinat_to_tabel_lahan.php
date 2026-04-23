<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tabel_lahan', function (Blueprint $table) {
            // Ubah luas dari decimal(10,2) ke decimal(10,4) agar lebih presisi
            $table->decimal('luas', 12, 4)->change();
            // Kolom baru: array titik koordinat individual
            $table->json('titik_koordinat')->nullable()->after('koordinat');
        });
    }

    public function down(): void
    {
        Schema::table('tabel_lahan', function (Blueprint $table) {
            $table->dropColumn('titik_koordinat');
            $table->decimal('luas', 10, 2)->change();
        });
    }
};

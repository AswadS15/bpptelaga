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
        Schema::table('tabel_komoditas', function (Blueprint $table) {
            $table->string('kategori')->nullable()->after('nama_komoditas');
            $table->string('icon')->default('eco')->after('kategori');
            $table->unsignedTinyInteger('masa_tanam_bulan')->nullable()->after('icon');
            $table->decimal('target_produktivitas', 8, 2)->nullable()->after('masa_tanam_bulan');
        });
    }

    public function down(): void
    {
        Schema::table('tabel_komoditas', function (Blueprint $table) {
            $table->dropColumn(['kategori', 'icon', 'masa_tanam_bulan', 'target_produktivitas']);
        });
    }
};

<?php

use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Kolom fase_tanam & ndvi_skor sudah ditambahkan pada migration
        // 2026_04_23_010004_create_tabel_lahan_table agar urutan pembuatan tabel benar.
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //
    }
};

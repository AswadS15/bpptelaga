<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tabel_penerima_bantuan', function (Blueprint $table) {
            $table->unsignedBigInteger('id_petani');
            $table->unsignedBigInteger('id_bantuan');
            $table->date('tanggal');
            $table->primary(['id_petani', 'id_bantuan', 'tanggal']);
            $table->foreign('id_petani')->references('id_petani')->on('tabel_petani')->onDelete('cascade');
            $table->foreign('id_bantuan')->references('id_bantuan')->on('tabel_bantuan')->onDelete('cascade');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tabel_penerima_bantuan');
    }
};

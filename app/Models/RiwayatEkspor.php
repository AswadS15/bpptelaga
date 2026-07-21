<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RiwayatEkspor extends Model
{
    protected $table = 'tabel_riwayat_ekspor';

    protected $primaryKey = 'id_riwayat';

    protected $fillable = [
        'nama_file',
        'jenis',
        'ukuran_bytes',
    ];
}

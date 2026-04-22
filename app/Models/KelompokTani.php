<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class KelompokTani extends Model
{
    protected $table = 'tabel_kelompok_tani';
    protected $primaryKey = 'id_kelompok';

    protected $fillable = [
        'nama_kelompok',
        'desa',
    ];

    /**
     * Kelompok Tani memiliki banyak anggota Petani (M:N)
     */
    public function petani(): BelongsToMany
    {
        return $this->belongsToMany(Petani::class, 'tabel_keanggotaan', 'id_kelompok', 'id_petani')
                    ->withTimestamps();
    }
}

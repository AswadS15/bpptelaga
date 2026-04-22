<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Petani extends Model
{
    protected $table = 'tabel_petani';
    protected $primaryKey = 'id_petani';

    protected $fillable = [
        'nik',
        'nama',
        'jenis_kelamin',
        'no_hp',
        'alamat',
    ];

    /**
     * Petani memiliki banyak Lahan (1:N)
     */
    public function lahan(): HasMany
    {
        return $this->hasMany(Lahan::class, 'id_petani', 'id_petani');
    }

    /**
     * Petani tergabung dalam banyak Kelompok Tani (M:N)
     */
    public function kelompokTani(): BelongsToMany
    {
        return $this->belongsToMany(KelompokTani::class, 'tabel_keanggotaan', 'id_petani', 'id_kelompok')
                    ->withTimestamps();
    }

    /**
     * Petani menerima banyak Bantuan (M:N)
     */
    public function bantuan(): BelongsToMany
    {
        return $this->belongsToMany(Bantuan::class, 'tabel_penerima_bantuan', 'id_petani', 'id_bantuan')
                    ->withPivot('tanggal')
                    ->withTimestamps();
    }
}

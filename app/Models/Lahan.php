<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Lahan extends Model
{
    protected $table = 'tabel_lahan';
    protected $primaryKey = 'id_lahan';

    protected $fillable = [
        'id_petani',
        'luas',
        'koordinat',
    ];

    protected $casts = [
        'koordinat' => 'array',
        'luas' => 'decimal:2',
    ];

    /**
     * Lahan dimiliki oleh satu Petani (N:1)
     */
    public function petani(): BelongsTo
    {
        return $this->belongsTo(Petani::class, 'id_petani', 'id_petani');
    }

    /**
     * Lahan ditanami banyak Komoditas (M:N)
     */
    public function komoditas(): BelongsToMany
    {
        return $this->belongsToMany(Komoditas::class, 'tabel_lahan_komoditas', 'id_lahan', 'id_komoditas')
                    ->withTimestamps();
    }
}

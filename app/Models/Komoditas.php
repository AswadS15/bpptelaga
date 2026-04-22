<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Komoditas extends Model
{
    protected $table = 'tabel_komoditas';
    protected $primaryKey = 'id_komoditas';

    protected $fillable = [
        'nama_komoditas',
    ];

    /**
     * Komoditas ditanam di banyak Lahan (M:N)
     */
    public function lahan(): BelongsToMany
    {
        return $this->belongsToMany(Lahan::class, 'tabel_lahan_komoditas', 'id_komoditas', 'id_lahan')
                    ->withTimestamps();
    }
}

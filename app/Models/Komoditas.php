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
        'kategori',
        'icon',
        'masa_tanam_bulan',
        'target_produktivitas',
    ];

    protected function casts(): array
    {
        return [
            'masa_tanam_bulan' => 'integer',
            'target_produktivitas' => 'decimal:2',
        ];
    }

    public function lahan(): BelongsToMany
    {
        return $this->belongsToMany(Lahan::class, 'tabel_lahan_komoditas', 'id_komoditas', 'id_lahan')
            ->withTimestamps();
    }
}

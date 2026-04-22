<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Bantuan extends Model
{
    protected $table = 'tabel_bantuan';
    protected $primaryKey = 'id_bantuan';

    protected $fillable = [
        'nama_bantuan',
    ];

    /**
     * Bantuan diterima oleh banyak Petani (M:N)
     */
    public function petani(): BelongsToMany
    {
        return $this->belongsToMany(Petani::class, 'tabel_penerima_bantuan', 'id_bantuan', 'id_petani')
                    ->withPivot('tanggal')
                    ->withTimestamps();
    }
}

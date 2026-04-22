<?php

namespace App\Http\Controllers;

use App\Models\Petani;
use App\Models\Lahan;
use App\Models\KelompokTani;
use App\Models\Komoditas;
use App\Models\Bantuan;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\DB;

class BerandaController extends Controller
{
    /**
     * Menampilkan halaman beranda (dashboard) dengan statistik dan data chart.
     */
    public function index(): Response
    {
        $statistik = [
            'total_petani' => Petani::count(),
            'total_lahan' => Lahan::count(),
            'total_luas_lahan' => round(Lahan::sum('luas'), 2),
            'total_kelompok_tani' => KelompokTani::count(),
            'total_komoditas' => Komoditas::count(),
            'total_bantuan' => Bantuan::count(),
            'total_penerima_bantuan' => DB::table('tabel_penerima_bantuan')->distinct('id_petani')->count('id_petani'),
        ];

        // Data Luas Lahan per Komoditas (untuk Chart)
        $luasPerKomoditas = DB::table('tabel_lahan_komoditas')
            ->join('tabel_komoditas', 'tabel_lahan_komoditas.id_komoditas', '=', 'tabel_komoditas.id_komoditas')
            ->join('tabel_lahan', 'tabel_lahan_komoditas.id_lahan', '=', 'tabel_lahan.id_lahan')
            ->select('tabel_komoditas.nama_komoditas as name', DB::raw('SUM(tabel_lahan.luas) as value'))
            ->groupBy('tabel_komoditas.nama_komoditas')
            ->get();

        // Data Distribusi Petani per Desa (untuk Chart)
        $petaniPerDesa = DB::table('tabel_kelompok_tani')
            ->join('tabel_keanggotaan', 'tabel_kelompok_tani.id_kelompok', '=', 'tabel_keanggotaan.id_kelompok')
            ->select('tabel_kelompok_tani.desa as name', DB::raw('COUNT(DISTINCT tabel_keanggotaan.id_petani) as value'))
            ->groupBy('tabel_kelompok_tani.desa')
            ->get();

        $aktivitasTerbaru = Petani::latest()->take(5)->get(['id_petani', 'nama', 'created_at']);

        return Inertia::render('Beranda', [
            'statistik' => $statistik,
            'aktivitasTerbaru' => $aktivitasTerbaru,
            'charts' => [
                'luasPerKomoditas' => $luasPerKomoditas,
                'petaniPerDesa' => $petaniPerDesa,
            ]
        ]);
    }
}

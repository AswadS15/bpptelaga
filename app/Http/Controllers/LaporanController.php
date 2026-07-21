<?php

namespace App\Http\Controllers;

use App\Models\Lahan;
use App\Models\Petani;
use App\Models\RiwayatEkspor;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class LaporanController extends Controller
{
    public function index(): Response
    {
        $riwayat = RiwayatEkspor::latest()->take(10)->get()->map(function ($r) {
            return [
                'id' => $r->id_riwayat,
                'nama_file' => $r->nama_file,
                'jenis' => $r->jenis,
                'waktu' => $r->created_at->format('d M Y, H:i'),
                'ukuran' => $r->ukuran_bytes ? $this->formatBytes($r->ukuran_bytes) : '-',
            ];
        });

        $statistik = [
            'total_petani' => Petani::count(),
            'total_lahan' => Lahan::count(),
            'update_terakhir_petani' => Petani::latest('updated_at')->value('updated_at'),
            'update_terakhir_lahan' => Lahan::latest('updated_at')->value('updated_at'),
        ];

        return Inertia::render('Laporan', [
            'riwayatEkspor' => $riwayat,
            'statistik' => $statistik,
        ]);
    }

    public function eksporPetani(): StreamedResponse
    {
        $petani = Petani::all();
        $filename = 'master_petani_'.now()->format('Ymd').'.csv';

        $headers = [
            'Content-type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename='.$filename,
            'Pragma' => 'no-cache',
            'Cache-Control' => 'must-revalidate, post-check=0, pre-check=0',
            'Expires' => '0',
        ];

        $callback = function () use ($petani) {
            $file = fopen('php://output', 'w');
            fputcsv($file, ['ID', 'NIK', 'Nama', 'Jenis Kelamin', 'No HP', 'Alamat']);

            foreach ($petani as $p) {
                fputcsv($file, [$p->id_petani, $p->nik, $p->nama, $p->jenis_kelamin, $p->no_hp, $p->alamat]);
            }

            fclose($file);
        };

        // Catat riwayat ekspor
        $this->catatEkspor($filename, 'petani');

        return response()->stream($callback, 200, $headers);
    }

    public function eksporLahan(): StreamedResponse
    {
        $lahan = Lahan::with(['petani', 'komoditas'])->get();
        $filename = 'lahan_gis_'.now()->format('Ymd').'.csv';

        $headers = [
            'Content-type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename='.$filename,
            'Pragma' => 'no-cache',
            'Cache-Control' => 'must-revalidate, post-check=0, pre-check=0',
            'Expires' => '0',
        ];

        $callback = function () use ($lahan) {
            $file = fopen('php://output', 'w');
            fputcsv($file, ['ID', 'Pemilik', 'Luas (Ha)', 'Komoditas', 'NIK Pemilik']);

            foreach ($lahan as $l) {
                fputcsv($file, [
                    $l->id_lahan,
                    $l->petani->nama ?? '-',
                    $l->luas,
                    $l->komoditas->pluck('nama_komoditas')->implode(', '),
                    $l->petani->nik ?? '-',
                ]);
            }

            fclose($file);
        };

        // Catat riwayat ekspor
        $this->catatEkspor($filename, 'lahan');

        return response()->stream($callback, 200, $headers);
    }

    /**
     * Simpan log riwayat ekspor ke database.
     */
    private function catatEkspor(string $namaFile, string $jenis): void
    {
        RiwayatEkspor::create([
            'nama_file' => $namaFile,
            'jenis' => $jenis,
        ]);
    }

    /**
     * Format bytes ke ukuran yang mudah dibaca.
     */
    private function formatBytes(int $bytes, int $precision = 2): string
    {
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];

        $bytes = max($bytes, 0);
        $pow = floor(($bytes ? log($bytes) : 0) / log(1024));
        $pow = min($pow, count($units) - 1);

        return round($bytes / (1024 ** $pow), $precision).' '.$units[$pow];
    }
}

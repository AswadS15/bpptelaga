<?php

namespace App\Http\Controllers;

use App\Models\Petani;
use App\Models\Lahan;
use App\Models\KelompokTani;
use App\Models\Bantuan;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;

class LaporanController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Laporan');
    }

    public function eksporPetani(): StreamedResponse
    {
        $headers = [
            'Content-type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename=data_petani.csv',
            'Pragma' => 'no-cache',
            'Cache-Control' => 'must-revalidate, post-check=0, pre-check=0',
            'Expires' => '0',
        ];

        $petani = Petani::all();

        $callback = function () use ($petani) {
            $file = fopen('php://output', 'w');
            fputcsv($file, ['ID', 'NIK', 'Nama', 'Jenis Kelamin', 'No HP', 'Alamat']);

            foreach ($petani as $p) {
                fputcsv($file, [$p->id_petani, $p->nik, $p->nama, $p->jenis_kelamin, $p->no_hp, $p->alamat]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    public function eksporLahan(): StreamedResponse
    {
        $headers = [
            'Content-type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename=data_lahan.csv',
            'Pragma' => 'no-cache',
            'Cache-Control' => 'must-revalidate, post-check=0, pre-check=0',
            'Expires' => '0',
        ];

        $lahan = Lahan::with(['petani', 'komoditas'])->get();

        $callback = function () use ($lahan) {
            $file = fopen('php://output', 'w');
            fputcsv($file, ['ID', 'Pemilik', 'Luas (Ha)', 'Komoditas', 'NIK Pemilik']);

            foreach ($lahan as $l) {
                fputcsv($file, [
                    $l->id_lahan,
                    $l->petani->nama ?? '-',
                    $l->luas,
                    $l->komoditas->pluck('nama_komoditas')->implode(', '),
                    $l->petani->nik ?? '-'
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}

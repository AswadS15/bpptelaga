<?php

namespace App\Http\Controllers;

use App\Models\Lahan;
use App\Models\Petani;
use App\Models\Komoditas;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PetaController extends Controller
{
    /**
     * tampilkanPeta - Menampilkan halaman peta interaktif dengan data GeoJSON.
     */
    public function index(): Response
    {
        $dataLahan = Lahan::with(['petani.kelompokTani', 'komoditas'])
            ->whereNotNull('koordinat')
            ->get()
            ->map(function ($lahan) {
                $kelompok = $lahan->petani?->kelompokTani ?? collect();
                return [
                    'id_lahan' => $lahan->id_lahan,
                    'luas' => $lahan->luas,
                    'koordinat' => $lahan->koordinat,
                    'nama_pemilik' => $lahan->petani->nama ?? '-',
                    'nik_pemilik' => $lahan->petani->nik ?? '-',
                    'alamat_pemilik' => $lahan->petani->alamat ?? '-',
                    'id_petani' => $lahan->id_petani,
                    'komoditas' => $lahan->komoditas->pluck('nama_komoditas')->toArray(),
                    'komoditas_ids' => $lahan->komoditas->pluck('id_komoditas')->toArray(),
                    'komoditas_utama' => $lahan->komoditas->first()?->nama_komoditas ?? 'Belum Ditentukan',
                    'kelompok_tani' => $kelompok->pluck('nama_kelompok')->toArray(),
                    'desa' => $kelompok->first()?->desa ?? ($lahan->petani?->alamat ?? '-'),
                ];
            });

        $daftarPetani = Petani::orderBy('nama')->get(['id_petani', 'nama', 'nik']);
        $daftarKomoditas = Komoditas::orderBy('nama_komoditas')->get(['id_komoditas', 'nama_komoditas']);

        return Inertia::render('Peta', [
            'dataLahan' => $dataLahan,
            'daftarPetani' => $daftarPetani,
            'daftarKomoditas' => $daftarKomoditas,
        ]);
    }

    /**
     * tambahLahan - Menyimpan lahan baru langsung dari halaman peta.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'id_petani' => 'required|exists:tabel_petani,id_petani',
            'luas' => 'required|numeric|min:0.01',
            'koordinat' => 'required|array',
            'komoditas' => 'nullable|array',
            'komoditas.*' => 'exists:tabel_komoditas,id_komoditas',
        ]);

        $lahan = Lahan::create([
            'id_petani' => $validated['id_petani'],
            'luas' => $validated['luas'],
            'koordinat' => $validated['koordinat'],
        ]);

        if (!empty($validated['komoditas'])) {
            $lahan->komoditas()->sync($validated['komoditas']);
        }

        return redirect()->route('peta')->with('sukses', 'Data lahan berhasil ditambahkan ke peta.');
    }
}

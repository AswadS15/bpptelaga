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
     * Mengekstrak titik koordinat individual dari GeoJSON polygon.
     * Menghasilkan array: [["titik"=>1,"lat"=>0.612,"lng"=>122.958], ...]
     */
    private function ekstrakTitik(?array $geoJSON): ?array
    {
        if (!$geoJSON) return null;

        // Dukung format Feature maupun Geometry langsung
        $coords = $geoJSON['geometry']['coordinates'][0]
            ?? $geoJSON['coordinates'][0]
            ?? null;

        if (!$coords || !is_array($coords)) return null;

        // Poligon GeoJSON menutup dirinya sendiri (titik pertama = titik terakhir)
        // Buang titik penutup jika sama dengan titik pertama
        $titikList = [];
        $total = count($coords);
        foreach ($coords as $i => $c) {
            // Lewati titik penutup (sama dengan titik pertama)
            if ($i === $total - 1 && $c[0] == $coords[0][0] && $c[1] == $coords[0][1]) {
                break;
            }
            $titikList[] = [
                'titik' => $i + 1,
                'lat'   => round((float) $c[1], 8),
                'lng'   => round((float) $c[0], 8),
            ];
        }

        return $titikList ?: null;
    }
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
                    'fase_tanam' => $lahan->fase_tanam,
                    'ndvi_skor' => (float) $lahan->ndvi_skor,
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
            'fase_tanam' => 'nullable|string|in:belum_tanam,awal_tanam,tumbuh_subur,panen',
        ]);

        // Simulasi analisis satelit (NDVI) berdasarkan fase tanam
        $ndvi = match($request->fase_tanam) {
            'belum_tanam' => rand(50, 150) / 1000, // 0.05 - 0.15
            'awal_tanam' => rand(200, 400) / 1000,  // 0.20 - 0.40
            'tumbuh_subur' => rand(600, 900) / 1000, // 0.60 - 0.90
            'panen' => rand(150, 300) / 1000,       // 0.15 - 0.30
            default => null,
        };

        $koordinat = $validated['koordinat'];

        $lahan = Lahan::create([
            'id_petani' => $validated['id_petani'],
            'luas' => $validated['luas'],
            'koordinat' => $koordinat,
            'titik_koordinat' => $this->ekstrakTitik($koordinat),
            'fase_tanam' => $validated['fase_tanam'] ?? 'belum_tanam',
            'ndvi_skor' => $ndvi,
        ]);

        if (!empty($validated['komoditas'])) {
            $lahan->komoditas()->sync($validated['komoditas']);
        }

        return redirect()->route('peta')->with('sukses', 'Data lahan berhasil ditambahkan ke peta.');
    }

    /**
     * Memperbarui koordinat lahan dari halaman peta (redirect ke peta).
     */
    public function update(Request $request, int $id): RedirectResponse
    {
        $lahan = Lahan::findOrFail($id);

        $validated = $request->validate([
            'id_petani'  => 'required|exists:tabel_petani,id_petani',
            'luas'       => 'required|numeric|min:0.0001',
            'koordinat'  => 'nullable|array',
            'komoditas'  => 'nullable|array',
            'komoditas.*' => 'exists:tabel_komoditas,id_komoditas',
            'fase_tanam' => 'nullable|string',
        ]);

        $koordinat = $validated['koordinat'] ?? $lahan->koordinat;

        $lahan->update([
            'luas'            => $validated['luas'],
            'koordinat'       => $koordinat,
            'titik_koordinat' => $this->ekstrakTitik(is_array($koordinat) ? $koordinat : null)
                                 ?? $lahan->titik_koordinat,
            'fase_tanam'      => $validated['fase_tanam'] ?? $lahan->fase_tanam,
        ]);

        if (isset($validated['komoditas'])) {
            $lahan->komoditas()->sync($validated['komoditas']);
        }

        return redirect()->route('peta')->with('sukses', 'Data lahan berhasil diperbarui.');
    }

    /**
     * Menghapus lahan dari halaman peta (redirect ke peta).
     */
    public function destroy(int $id): RedirectResponse
    {
        Lahan::findOrFail($id)->delete();

        return redirect()->route('peta')->with('sukses', 'Data lahan berhasil dihapus.');
    }
}

<?php

namespace App\Http\Controllers;

use App\Models\Lahan;
use App\Models\Petani;
use App\Models\Komoditas;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class LahanController extends Controller
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
     * Menampilkan daftar semua lahan.
     */
    public function index(): Response
    {
        $lahan = Lahan::with(['petani', 'komoditas'])
            ->orderBy('created_at', 'desc')
            ->get();

        $daftarPetani    = Petani::orderBy('nama')->get(['id_petani', 'nama']);
        $daftarKomoditas = Komoditas::orderBy('nama_komoditas')->get(['id_komoditas', 'nama_komoditas']);

        return Inertia::render('DataLahan', [
            'daftarLahan'     => $lahan,
            'daftarPetani'    => $daftarPetani,
            'daftarKomoditas' => $daftarKomoditas,
        ]);
    }

    /**
     * Menyimpan data lahan baru.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'id_petani'  => 'required|exists:tabel_petani,id_petani',
            'luas'       => 'required|numeric|min:0.0001',
            'koordinat'  => 'nullable|array',
            'komoditas'  => 'nullable|array',
            'fase_tanam' => 'nullable|string',
            'komoditas.*' => 'exists:tabel_komoditas,id_komoditas',
        ]);

        $koordinat = $validated['koordinat'] ?? null;

        $lahan = Lahan::create([
            'id_petani'        => $validated['id_petani'],
            'luas'             => $validated['luas'],
            'koordinat'        => $koordinat,
            'titik_koordinat'  => $this->ekstrakTitik($koordinat),
            'fase_tanam'       => $validated['fase_tanam'] ?? 'belum_tanam',
        ]);

        if (!empty($validated['komoditas'])) {
            $lahan->komoditas()->sync($validated['komoditas']);
        }

        return redirect()->route('data-lahan')->with('sukses', 'Data lahan berhasil ditambahkan.');
    }

    /**
     * Memperbarui data lahan.
     */
    public function update(Request $request, int $id): RedirectResponse
    {
        $lahan = Lahan::findOrFail($id);

        $validated = $request->validate([
            'id_petani'  => 'required|exists:tabel_petani,id_petani',
            'luas'       => 'required|numeric|min:0.0001',
            'koordinat'  => 'nullable|array',
            'komoditas'  => 'nullable|array',
            'fase_tanam' => 'nullable|string',
            'komoditas.*' => 'exists:tabel_komoditas,id_komoditas',
        ]);

        $koordinat = $validated['koordinat'] ?? $lahan->koordinat;

        $lahan->update([
            'id_petani'        => $validated['id_petani'],
            'luas'             => $validated['luas'],
            'koordinat'        => $koordinat,
            'titik_koordinat'  => $this->ekstrakTitik(is_array($validated['koordinat'] ?? null) ? $validated['koordinat'] : null)
                                  ?? $lahan->titik_koordinat,
            'fase_tanam'       => $validated['fase_tanam'] ?? $lahan->fase_tanam,
        ]);

        if (isset($validated['komoditas'])) {
            $lahan->komoditas()->sync($validated['komoditas']);
        }

        return redirect()->route('data-lahan')->with('sukses', 'Data lahan berhasil diperbarui.');
    }

    /**
     * Menghapus data lahan.
     */
    public function destroy(int $id): RedirectResponse
    {
        Lahan::findOrFail($id)->delete();

        return redirect()->route('data-lahan')->with('sukses', 'Data lahan berhasil dihapus.');
    }

    /**
     * Menghapus banyak data lahan sekaligus.
     */
    public function bulkDestroy(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'ids' => 'required|array|min:1',
            'ids.*' => 'integer|exists:tabel_lahan,id_lahan',
        ]);

        Lahan::whereIn('id_lahan', $validated['ids'])->delete();

        return redirect()->route('data-lahan')->with('sukses', count($validated['ids']) . ' data lahan berhasil dihapus.');
    }
}

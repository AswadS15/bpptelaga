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
     * Menampilkan daftar semua lahan.
     */
    public function index(): Response
    {
        $lahan = Lahan::with(['petani', 'komoditas'])
            ->orderBy('created_at', 'desc')
            ->get();

        $daftarPetani = Petani::orderBy('nama')->get(['id_petani', 'nama']);
        $daftarKomoditas = Komoditas::orderBy('nama_komoditas')->get(['id_komoditas', 'nama_komoditas']);

        return Inertia::render('DataLahan', [
            'daftarLahan' => $lahan,
            'daftarPetani' => $daftarPetani,
            'daftarKomoditas' => $daftarKomoditas,
        ]);
    }

    /**
     * tambahLahan - Menyimpan data lahan baru.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'id_petani' => 'required|exists:tabel_petani,id_petani',
            'luas' => 'required|numeric|min:0.01',
            'koordinat' => 'nullable|array',
            'komoditas' => 'nullable|array',
            'komoditas.*' => 'exists:tabel_komoditas,id_komoditas',
        ]);

        $lahan = Lahan::create([
            'id_petani' => $validated['id_petani'],
            'luas' => $validated['luas'],
            'koordinat' => $validated['koordinat'] ?? null,
        ]);

        if (!empty($validated['komoditas'])) {
            $lahan->komoditas()->sync($validated['komoditas']);
        }

        return redirect()->route('data-lahan')->with('sukses', 'Data lahan berhasil ditambahkan.');
    }

    /**
     * simpanKoordinat - Menyimpan/memperbarui koordinat GeoJSON lahan.
     */
    public function update(Request $request, int $id): RedirectResponse
    {
        $lahan = Lahan::findOrFail($id);

        $validated = $request->validate([
            'id_petani' => 'required|exists:tabel_petani,id_petani',
            'luas' => 'required|numeric|min:0.01',
            'koordinat' => 'nullable|array',
            'komoditas' => 'nullable|array',
            'komoditas.*' => 'exists:tabel_komoditas,id_komoditas',
        ]);

        $lahan->update([
            'id_petani' => $validated['id_petani'],
            'luas' => $validated['luas'],
            'koordinat' => $validated['koordinat'] ?? $lahan->koordinat,
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
        $lahan = Lahan::findOrFail($id);
        $lahan->delete();

        return redirect()->route('data-lahan')->with('sukses', 'Data lahan berhasil dihapus.');
    }
}

<?php

namespace App\Http\Controllers;

use App\Models\KelompokTani;
use App\Models\Petani;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class KelompokTaniController extends Controller
{
    /**
     * Menampilkan daftar semua kelompok tani.
     */
    public function index(): Response
    {
        $kelompokTani = KelompokTani::with('petani')
            ->orderBy('created_at', 'desc')
            ->get();

        $daftarPetani = Petani::orderBy('nama')->get(['id_petani', 'nama']);

        return Inertia::render('DataKelompokTani', [
            'daftarKelompokTani' => $kelompokTani,
            'daftarPetani' => $daftarPetani,
        ]);
    }

    /**
     * Menyimpan kelompok tani baru.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'nama_kelompok' => 'required|string|max:255',
            'desa' => 'required|string|max:255',
            'anggota' => 'nullable|array',
            'anggota.*' => 'exists:tabel_petani,id_petani',
        ]);

        $kelompok = KelompokTani::create([
            'nama_kelompok' => $validated['nama_kelompok'],
            'desa' => $validated['desa'],
        ]);

        if (!empty($validated['anggota'])) {
            $kelompok->petani()->sync($validated['anggota']);
        }

        return redirect()->route('data-kelompok-tani')->with('sukses', 'Kelompok tani berhasil ditambahkan.');
    }

    /**
     * Memperbarui kelompok tani.
     */
    public function update(Request $request, int $id): RedirectResponse
    {
        $kelompok = KelompokTani::findOrFail($id);

        $validated = $request->validate([
            'nama_kelompok' => 'required|string|max:255',
            'desa' => 'required|string|max:255',
            'anggota' => 'nullable|array',
            'anggota.*' => 'exists:tabel_petani,id_petani',
        ]);

        $kelompok->update([
            'nama_kelompok' => $validated['nama_kelompok'],
            'desa' => $validated['desa'],
        ]);

        if (isset($validated['anggota'])) {
            $kelompok->petani()->sync($validated['anggota']);
        }

        return redirect()->route('data-kelompok-tani')->with('sukses', 'Kelompok tani berhasil diperbarui.');
    }

    /**
     * Menghapus kelompok tani.
     */
    public function destroy(int $id): RedirectResponse
    {
        $kelompok = KelompokTani::findOrFail($id);
        $kelompok->delete();

        return redirect()->route('data-kelompok-tani')->with('sukses', 'Kelompok tani berhasil dihapus.');
    }

    /**
     * Menghapus banyak data kelompok tani sekaligus.
     */
    public function bulkDestroy(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'ids' => 'required|array|min:1',
            'ids.*' => 'integer|exists:tabel_kelompok_tani,id_kelompok',
        ]);

        KelompokTani::whereIn('id_kelompok', $validated['ids'])->delete();

        return redirect()->route('data-kelompok-tani')->with('sukses', count($validated['ids']) . ' kelompok tani berhasil dihapus.');
    }
}

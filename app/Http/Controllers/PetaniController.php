<?php

namespace App\Http\Controllers;

use App\Models\Petani;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PetaniController extends Controller
{
    /**
     * ambilDataPetani - Menampilkan daftar semua petani.
     */
    public function index(): Response
    {
        $petani = Petani::with(['kelompokTani', 'lahan', 'bantuan'])
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('DataPetani', [
            'daftarPetani' => $petani,
        ]);
    }

    /**
     * tambahPetani - Menyimpan data petani baru.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'nik' => 'required|string|size:16|unique:tabel_petani,nik',
            'nama' => 'required|string|max:255',
            'jenis_kelamin' => 'required|in:L,P',
            'no_hp' => 'nullable|string|max:15',
            'alamat' => 'nullable|string',
        ]);

        Petani::create($validated);

        return redirect()->route('data-petani')->with('sukses', 'Data petani berhasil ditambahkan.');
    }

    /**
     * ubahPetani - Memperbarui data petani.
     */
    public function update(Request $request, int $id): RedirectResponse
    {
        $petani = Petani::findOrFail($id);

        $validated = $request->validate([
            'nik' => 'required|string|size:16|unique:tabel_petani,nik,' . $id . ',id_petani',
            'nama' => 'required|string|max:255',
            'jenis_kelamin' => 'required|in:L,P',
            'no_hp' => 'nullable|string|max:15',
            'alamat' => 'nullable|string',
        ]);

        $petani->update($validated);

        return redirect()->route('data-petani')->with('sukses', 'Data petani berhasil diperbarui.');
    }

    /**
     * hapusPetani - Menghapus data petani.
     */
    public function destroy(int $id): RedirectResponse
    {
        $petani = Petani::findOrFail($id);
        $petani->delete();

        return redirect()->route('data-petani')->with('sukses', 'Data petani berhasil dihapus.');
    }

    /**
     * Menghapus banyak data petani sekaligus.
     */
    public function bulkDestroy(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'ids' => 'required|array|min:1',
            'ids.*' => 'integer|exists:tabel_petani,id_petani',
        ]);

        Petani::whereIn('id_petani', $validated['ids'])->delete();

        return redirect()->route('data-petani')->with('sukses', count($validated['ids']) . ' data petani berhasil dihapus.');
    }
}

<?php

namespace App\Http\Controllers;

use App\Models\Komoditas;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class KomoditasController extends Controller
{
    /**
     * Menampilkan daftar semua komoditas.
     */
    public function index(): Response
    {
        $komoditas = Komoditas::withCount('lahan')
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('DataKomoditas', [
            'daftarKomoditas' => $komoditas,
        ]);
    }

    /**
     * Menyimpan komoditas baru.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'nama_komoditas' => 'required|string|max:255|unique:tabel_komoditas,nama_komoditas',
        ]);

        Komoditas::create($validated);

        return redirect()->route('data-komoditas')->with('sukses', 'Komoditas berhasil ditambahkan.');
    }

    /**
     * Memperbarui komoditas.
     */
    public function update(Request $request, int $id): RedirectResponse
    {
        $komoditas = Komoditas::findOrFail($id);

        $validated = $request->validate([
            'nama_komoditas' => 'required|string|max:255|unique:tabel_komoditas,nama_komoditas,' . $id . ',id_komoditas',
        ]);

        $komoditas->update($validated);

        return redirect()->route('data-komoditas')->with('sukses', 'Komoditas berhasil diperbarui.');
    }

    /**
     * Menghapus komoditas.
     */
    public function destroy(int $id): RedirectResponse
    {
        $komoditas = Komoditas::findOrFail($id);
        $komoditas->delete();

        return redirect()->route('data-komoditas')->with('sukses', 'Komoditas berhasil dihapus.');
    }
}

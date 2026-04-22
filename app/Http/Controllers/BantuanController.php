<?php

namespace App\Http\Controllers;

use App\Models\Bantuan;
use App\Models\Petani;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BantuanController extends Controller
{
    /**
     * Menampilkan daftar semua bantuan.
     */
    public function index(): Response
    {
        $bantuan = Bantuan::with('petani')
            ->orderBy('created_at', 'desc')
            ->get();

        $daftarPetani = Petani::orderBy('nama')->get(['id_petani', 'nama']);

        return Inertia::render('DataBantuan', [
            'daftarBantuan' => $bantuan,
            'daftarPetani' => $daftarPetani,
        ]);
    }

    /**
     * Menyimpan bantuan baru.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'nama_bantuan' => 'required|string|max:255',
            'penerima' => 'nullable|array',
            'penerima.*.id_petani' => 'exists:tabel_petani,id_petani',
            'penerima.*.tanggal' => 'required|date',
        ]);

        $bantuan = Bantuan::create([
            'nama_bantuan' => $validated['nama_bantuan'],
        ]);

        if (!empty($validated['penerima'])) {
            foreach ($validated['penerima'] as $p) {
                $bantuan->petani()->attach($p['id_petani'], ['tanggal' => $p['tanggal']]);
            }
        }

        return redirect()->route('data-bantuan')->with('sukses', 'Bantuan berhasil ditambahkan.');
    }

    /**
     * Memperbarui bantuan.
     */
    public function update(Request $request, int $id): RedirectResponse
    {
        $bantuan = Bantuan::findOrFail($id);

        $validated = $request->validate([
            'nama_bantuan' => 'required|string|max:255',
            'penerima' => 'nullable|array',
            'penerima.*.id_petani' => 'exists:tabel_petani,id_petani',
            'penerima.*.tanggal' => 'required|date',
        ]);

        $bantuan->update([
            'nama_bantuan' => $validated['nama_bantuan'],
        ]);

        if (isset($validated['penerima'])) {
            $syncData = [];
            foreach ($validated['penerima'] as $p) {
                $syncData[$p['id_petani']] = ['tanggal' => $p['tanggal']];
            }
            $bantuan->petani()->sync($syncData);
        }

        return redirect()->route('data-bantuan')->with('sukses', 'Bantuan berhasil diperbarui.');
    }

    /**
     * Menghapus bantuan.
     */
    public function destroy(int $id): RedirectResponse
    {
        $bantuan = Bantuan::findOrFail($id);
        $bantuan->delete();

        return redirect()->route('data-bantuan')->with('sukses', 'Bantuan berhasil dihapus.');
    }
}

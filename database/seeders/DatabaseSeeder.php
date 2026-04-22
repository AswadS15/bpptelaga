<?php

namespace Database\Seeders;

use App\Models\Petani;
use App\Models\KelompokTani;
use App\Models\Lahan;
use App\Models\Komoditas;
use App\Models\Bantuan;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // === Komoditas ===
        $padi = Komoditas::create(['nama_komoditas' => 'Padi Sawah']);
        $jagung = Komoditas::create(['nama_komoditas' => 'Jagung']);
        $kedelai = Komoditas::create(['nama_komoditas' => 'Kedelai']);
        $cabai = Komoditas::create(['nama_komoditas' => 'Cabai Merah']);
        $tomat = Komoditas::create(['nama_komoditas' => 'Tomat']);

        // === Kelompok Tani ===
        $kelompok1 = KelompokTani::create(['nama_kelompok' => 'Tani Makmur', 'desa' => 'Desa Luhu']);
        $kelompok2 = KelompokTani::create(['nama_kelompok' => 'Sumber Rejeki', 'desa' => 'Desa Luhu']);
        $kelompok3 = KelompokTani::create(['nama_kelompok' => 'Harapan Baru', 'desa' => 'Desa Luhu']);

        // === Bantuan ===
        $bantuan1 = Bantuan::create(['nama_bantuan' => 'Bantuan Pupuk Subsidi']);
        $bantuan2 = Bantuan::create(['nama_bantuan' => 'Bantuan Benih Unggul']);
        $bantuan3 = Bantuan::create(['nama_bantuan' => 'Bantuan Alat Pertanian']);

        // === Petani ===
        $petani1 = Petani::create([
            'nik' => '7501010101010001',
            'nama' => 'Budi Santoso',
            'jenis_kelamin' => 'L',
            'no_hp' => '081234567890',
            'alamat' => 'Desa Luhu, Kec. Telaga',
        ]);

        $petani2 = Petani::create([
            'nik' => '7501010101010002',
            'nama' => 'Siti Aminah',
            'jenis_kelamin' => 'P',
            'no_hp' => '081298765432',
            'alamat' => 'Desa Luhu, Kec. Telaga',
        ]);

        $petani3 = Petani::create([
            'nik' => '7501010101010003',
            'nama' => 'Ahmad Dahlan',
            'jenis_kelamin' => 'L',
            'no_hp' => '085211223344',
            'alamat' => 'Desa Luhu, Kec. Telaga',
        ]);

        $petani4 = Petani::create([
            'nik' => '7501010101010004',
            'nama' => 'Fatimah Zahra',
            'jenis_kelamin' => 'P',
            'no_hp' => '082155667788',
            'alamat' => 'Desa Luhu, Kec. Telaga',
        ]);

        $petani5 = Petani::create([
            'nik' => '7501010101010005',
            'nama' => 'Rahman Hakim',
            'jenis_kelamin' => 'L',
            'no_hp' => '089977665544',
            'alamat' => 'Desa Luhu, Kec. Telaga',
        ]);

        // === Keanggotaan Kelompok Tani ===
        $kelompok1->petani()->attach([$petani1->id_petani, $petani2->id_petani, $petani3->id_petani]);
        $kelompok2->petani()->attach([$petani3->id_petani, $petani4->id_petani]);
        $kelompok3->petani()->attach([$petani4->id_petani, $petani5->id_petani]);

        // === Lahan dengan GeoJSON ===
        $lahan1 = Lahan::create([
            'id_petani' => $petani1->id_petani,
            'luas' => 2.5,
            'koordinat' => [
                'type' => 'Feature',
                'properties' => ['id_lahan' => 1],
                'geometry' => [
                    'type' => 'Polygon',
                    'coordinates' => [[
                        [122.956, 0.612],
                        [122.958, 0.612],
                        [122.958, 0.610],
                        [122.956, 0.610],
                        [122.956, 0.612],
                    ]],
                ],
            ],
        ]);

        $lahan2 = Lahan::create([
            'id_petani' => $petani2->id_petani,
            'luas' => 1.2,
            'koordinat' => [
                'type' => 'Feature',
                'properties' => ['id_lahan' => 2],
                'geometry' => [
                    'type' => 'Polygon',
                    'coordinates' => [[
                        [122.960, 0.615],
                        [122.962, 0.615],
                        [122.961, 0.613],
                        [122.959, 0.613],
                        [122.960, 0.615],
                    ]],
                ],
            ],
        ]);

        $lahan3 = Lahan::create([
            'id_petani' => $petani3->id_petani,
            'luas' => 3.0,
            'koordinat' => [
                'type' => 'Feature',
                'properties' => ['id_lahan' => 3],
                'geometry' => [
                    'type' => 'Polygon',
                    'coordinates' => [[
                        [122.950, 0.608],
                        [122.953, 0.608],
                        [122.953, 0.605],
                        [122.950, 0.605],
                        [122.950, 0.608],
                    ]],
                ],
            ],
        ]);

        $lahan4 = Lahan::create([
            'id_petani' => $petani4->id_petani,
            'luas' => 1.8,
            'koordinat' => [
                'type' => 'Feature',
                'properties' => ['id_lahan' => 4],
                'geometry' => [
                    'type' => 'Polygon',
                    'coordinates' => [[
                        [122.964, 0.618],
                        [122.966, 0.618],
                        [122.966, 0.616],
                        [122.964, 0.616],
                        [122.964, 0.618],
                    ]],
                ],
            ],
        ]);

        $lahan5 = Lahan::create([
            'id_petani' => $petani5->id_petani,
            'luas' => 0.8,
            'koordinat' => null,
        ]);

        // === Lahan-Komoditas ===
        $lahan1->komoditas()->attach([$padi->id_komoditas]);
        $lahan2->komoditas()->attach([$jagung->id_komoditas, $kedelai->id_komoditas]);
        $lahan3->komoditas()->attach([$padi->id_komoditas, $cabai->id_komoditas]);
        $lahan4->komoditas()->attach([$tomat->id_komoditas]);

        // === Penerima Bantuan ===
        $bantuan1->petani()->attach([
            $petani1->id_petani => ['tanggal' => '2026-01-15'],
            $petani2->id_petani => ['tanggal' => '2026-01-15'],
            $petani3->id_petani => ['tanggal' => '2026-02-20'],
        ]);

        $bantuan2->petani()->attach([
            $petani1->id_petani => ['tanggal' => '2026-03-10'],
            $petani4->id_petani => ['tanggal' => '2026-03-10'],
        ]);

        $bantuan3->petani()->attach([
            $petani5->id_petani => ['tanggal' => '2026-04-01'],
        ]);
    }
}

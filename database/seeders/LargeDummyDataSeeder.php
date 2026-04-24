<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Faker\Factory as Faker;
use Carbon\Carbon;

class LargeDummyDataSeeder extends Seeder
{
    public function run(): void
    {
        $faker = Faker::create('id_ID');
        $now = Carbon::now();
        $chunkSize = 500;
        
        $this->command->info('Mulai generate 1000 data Petani...');
        $petaniData = [];
        for ($i = 0; $i < 1000; $i++) {
            $petaniData[] = [
                'nik' => $faker->unique()->numerify('750101##########'),
                'nama' => $faker->name,
                'jenis_kelamin' => $faker->randomElement(['L', 'P']),
                'no_hp' => $faker->numerify('08##########'),
                'alamat' => $faker->address,
                'created_at' => $now,
                'updated_at' => $now,
            ];
        }
        foreach (array_chunk($petaniData, $chunkSize) as $chunk) {
            DB::table('tabel_petani')->insertOrIgnore($chunk);
        }
        $petaniIds = DB::table('tabel_petani')->pluck('id_petani')->toArray();
        if (empty($petaniIds)) return;
        
        $this->command->info('Mulai generate 1000 data Kelompok Tani...');
        $kelompokData = [];
        for ($i = 0; $i < 1000; $i++) {
            $kelompokData[] = [
                'nama_kelompok' => 'Kelompok Tani ' . $faker->company . ' ' . $i,
                'desa' => $faker->city,
                'created_at' => $now,
                'updated_at' => $now,
            ];
        }
        foreach (array_chunk($kelompokData, $chunkSize) as $chunk) {
            DB::table('tabel_kelompok_tani')->insertOrIgnore($chunk);
        }
        $kelompokIds = DB::table('tabel_kelompok_tani')->pluck('id_kelompok')->toArray();

        $this->command->info('Mulai generate 1000 data Komoditas...');
        $komoditasData = [];
        for ($i = 0; $i < 1000; $i++) {
            $komoditasData[] = [
                'nama_komoditas' => 'Komoditas ' . str_pad((string)$i, 4, '0', STR_PAD_LEFT),
                'created_at' => $now,
                'updated_at' => $now,
            ];
        }
        foreach (array_chunk($komoditasData, $chunkSize) as $chunk) {
            DB::table('tabel_komoditas')->insertOrIgnore($chunk);
        }
        $komoditasIds = DB::table('tabel_komoditas')->pluck('id_komoditas')->toArray();

        $this->command->info('Mulai generate 1000 data Bantuan...');
        $bantuanData = [];
        for ($i = 0; $i < 1000; $i++) {
            $bantuanData[] = [
                'nama_bantuan' => 'Program Bantuan ' . str_pad((string)$i, 4, '0', STR_PAD_LEFT),
                'created_at' => $now,
                'updated_at' => $now,
            ];
        }
        foreach (array_chunk($bantuanData, $chunkSize) as $chunk) {
            DB::table('tabel_bantuan')->insertOrIgnore($chunk);
        }
        $bantuanIds = DB::table('tabel_bantuan')->pluck('id_bantuan')->toArray();

        $this->command->info('Mulai generate 1000 data Lahan...');
        $lahanData = [];
        for ($i = 0; $i < 1000; $i++) {
            $lahanData[] = [
                'id_petani' => $faker->randomElement($petaniIds),
                'luas' => $faker->randomFloat(2, 0.1, 5.0),
                'fase_tanam' => $faker->randomElement(['belum_tanam', 'tanam', 'panen']),
                'koordinat' => null,
                'titik_koordinat' => null,
                'created_at' => $now,
                'updated_at' => $now,
            ];
        }
        foreach (array_chunk($lahanData, $chunkSize) as $chunk) {
            DB::table('tabel_lahan')->insertOrIgnore($chunk);
        }
        $lahanIds = DB::table('tabel_lahan')->pluck('id_lahan')->toArray();

        $this->command->info('Menghubungkan relasi pivot...');
        $keanggotaanData = [];
        foreach ($kelompokIds as $kId) {
            $randomPetani = $faker->randomElements($petaniIds, 5);
            foreach ($randomPetani as $pId) {
                $keanggotaanData[] = [
                    'id_petani' => $pId,
                    'id_kelompok' => $kId,
                    'created_at' => $now,
                    'updated_at' => $now,
                ];
            }
        }
        foreach (array_chunk($keanggotaanData, $chunkSize) as $chunk) {
            DB::table('tabel_keanggotaan')->insertOrIgnore($chunk); // Using insertOrIgnore to be universally compatible
        }

        $lahanKomoditasData = [];
        foreach ($lahanIds as $lId) {
            $randomKomoditas = $faker->randomElements($komoditasIds, rand(1, 2));
            foreach ($randomKomoditas as $kId) {
                $lahanKomoditasData[] = [
                    'id_lahan' => $lId,
                    'id_komoditas' => $kId,
                ];
            }
        }
        foreach (array_chunk($lahanKomoditasData, $chunkSize) as $chunk) {
            DB::table('tabel_lahan_komoditas')->insertOrIgnore($chunk);
        }

        $penerimaBantuanData = [];
        foreach ($bantuanIds as $bId) {
            $randomPetani = $faker->randomElements($petaniIds, rand(5, 10));
            foreach ($randomPetani as $pId) {
                $penerimaBantuanData[] = [
                    'id_bantuan' => $bId,
                    'id_petani' => $pId,
                    'tanggal' => $faker->date(),
                    'created_at' => $now,
                    'updated_at' => $now,
                ];
            }
        }
        foreach (array_chunk($penerimaBantuanData, $chunkSize) as $chunk) {
            DB::table('tabel_penerima_bantuan')->insertOrIgnore($chunk);
        }
        
        $this->command->info('Selesai generate 1000 data dummy!');
    }
}

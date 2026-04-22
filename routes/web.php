<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\LoginController;
use App\Http\Controllers\BerandaController;
use App\Http\Controllers\PetaController;
use App\Http\Controllers\PetaniController;
use App\Http\Controllers\LahanController;
use App\Http\Controllers\KelompokTaniController;
use App\Http\Controllers\KomoditasController;
use App\Http\Controllers\BantuanController;
use App\Http\Controllers\LaporanController;

Route::get('/', function () {
    return redirect('/beranda');
});

Route::get('/login', [LoginController::class, 'index'])->name('login');

// Halaman utama
Route::get('/beranda', [BerandaController::class, 'index'])->name('beranda');
Route::get('/peta', [PetaController::class, 'index'])->name('peta');
Route::post('/peta', [PetaController::class, 'store'])->name('peta.store');

// CRUD Petani
Route::get('/data-petani', [PetaniController::class, 'index'])->name('data-petani');
Route::post('/data-petani', [PetaniController::class, 'store'])->name('petani.store');
Route::put('/data-petani/{id}', [PetaniController::class, 'update'])->name('petani.update');
Route::delete('/data-petani/{id}', [PetaniController::class, 'destroy'])->name('petani.destroy');

// CRUD Lahan
Route::get('/data-lahan', [LahanController::class, 'index'])->name('data-lahan');
Route::post('/data-lahan', [LahanController::class, 'store'])->name('lahan.store');
Route::put('/data-lahan/{id}', [LahanController::class, 'update'])->name('lahan.update');
Route::delete('/data-lahan/{id}', [LahanController::class, 'destroy'])->name('lahan.destroy');

// CRUD Kelompok Tani
Route::get('/data-kelompok-tani', [KelompokTaniController::class, 'index'])->name('data-kelompok-tani');
Route::post('/data-kelompok-tani', [KelompokTaniController::class, 'store'])->name('kelompok-tani.store');
Route::put('/data-kelompok-tani/{id}', [KelompokTaniController::class, 'update'])->name('kelompok-tani.update');
Route::delete('/data-kelompok-tani/{id}', [KelompokTaniController::class, 'destroy'])->name('kelompok-tani.destroy');

// CRUD Komoditas
Route::get('/data-komoditas', [KomoditasController::class, 'index'])->name('data-komoditas');
Route::post('/data-komoditas', [KomoditasController::class, 'store'])->name('komoditas.store');
Route::put('/data-komoditas/{id}', [KomoditasController::class, 'update'])->name('komoditas.update');
Route::delete('/data-komoditas/{id}', [KomoditasController::class, 'destroy'])->name('komoditas.destroy');

// CRUD Bantuan
Route::get('/data-bantuan', [BantuanController::class, 'index'])->name('data-bantuan');

// Laporan & Ekspor
Route::get('/laporan', [LaporanController::class, 'index'])->name('laporan');
Route::get('/laporan/ekspor-petani', [LaporanController::class, 'eksporPetani'])->name('laporan.petani');
Route::get('/laporan/ekspor-lahan', [LaporanController::class, 'eksporLahan'])->name('laporan.lahan');
Route::post('/data-bantuan', [BantuanController::class, 'store'])->name('bantuan.store');
Route::put('/data-bantuan/{id}', [BantuanController::class, 'update'])->name('bantuan.update');
Route::delete('/data-bantuan/{id}', [BantuanController::class, 'destroy'])->name('bantuan.destroy');

// Include route bawaan breeze (auth.php)
require __DIR__.'/auth.php';

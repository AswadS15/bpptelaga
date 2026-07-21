<?php

namespace Tests\Feature;

use App\Models\Petani;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DataPetaniTest extends TestCase
{
    use RefreshDatabase;

    public function test_halaman_data_petani_dapat_diakses(): void
    {
        Petani::factory()->create();

        $response = $this->get(route('data-petani'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page->component('DataPetani'));
    }

    public function test_halaman_data_petani_menampilkan_daftar_petani(): void
    {
        Petani::factory()->count(3)->create();

        $response = $this->get(route('data-petani'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('DataPetani')
            ->has('daftarPetani', 3));
    }
}

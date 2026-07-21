<?php

namespace Database\Factories;

use App\Models\Petani;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Petani>
 */
class PetaniFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'nik' => $this->faker->unique()->numerify('7501############'),
            'nama' => $this->faker->name(),
            'jenis_kelamin' => $this->faker->randomElement(['L', 'P']),
            'no_hp' => $this->faker->numerify('08##########'),
            'alamat' => $this->faker->streetAddress(),
        ];
    }
}

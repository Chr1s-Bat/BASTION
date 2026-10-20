<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/** @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\User> */
class UserFactory extends Factory
{
    protected static ?string $password = null;

    public function definition(): array
    {
        return [
            'name' => fake()->name(),
            'email' => fake()->unique()->safeEmail(),
            'rank' => fake()->randomElement(['Private', 'Corporal', 'Sergeant', 'Lieutenant', 'Captain']),
            'service_number' => 'BLC-'.fake()->unique()->numerify('####'),
            'unit' => fake()->randomElement(['Alpha Company', 'Bravo Company', 'HQ Platoon', 'Signal Section']),
            'role' => 'user',
            'email_verified_at' => now(),
            'password' => static::$password ??= Hash::make('Password123!'),
            'remember_token' => Str::random(10),
        ];
    }

    public function admin(): static
    {
        return $this->state(fn () => ['role' => 'admin', 'rank' => 'Colonel']);
    }
}

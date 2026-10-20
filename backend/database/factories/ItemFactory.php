<?php

namespace Database\Factories;

use App\Models\Category;
use App\Models\Depot;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Item> */
class ItemFactory extends Factory
{
    public function definition(): array
    {
        return [
            'name' => fake()->words(3, true),
            'serial_number' => strtoupper(fake()->unique()->bothify('??-####-??')),
            'category_id' => Category::factory(),
            'depot_id' => Depot::factory(),
            'created_by' => User::factory(),
            'quantity' => fake()->numberBetween(5, 120),
            'reorder_level' => 5,
            'status' => 'operational',
            'description' => fake()->sentence(),
        ];
    }
}

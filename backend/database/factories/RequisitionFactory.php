<?php

namespace Database\Factories;

use App\Models\Item;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/** @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Requisition> */
class RequisitionFactory extends Factory
{
    public function definition(): array
    {
        return [
            'reference' => 'REQ-'.now()->format('ymd').'-'.strtoupper(Str::random(4)),
            'user_id' => User::factory(),
            'item_id' => Item::factory(),
            'quantity' => fake()->numberBetween(1, 5),
            'purpose' => fake()->sentence(4),
            'priority' => fake()->randomElement(['routine', 'urgent', 'critical']),
            'status' => 'pending',
            'needed_by' => now()->addDays(fake()->numberBetween(3, 20))->toDateString(),
        ];
    }
}

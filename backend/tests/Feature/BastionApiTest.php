<?php

namespace Tests\Feature;

use App\Models\Item;
use App\Models\Requisition;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class BastionApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_register_login_and_current_user(): void
    {
        $this->postJson('/api/register', [
            'name' => 'Test Officer', 'email' => 'new@bastion.test',
            'password' => 'Password123!', 'password_confirmation' => 'Password123!',
        ])->assertCreated()->assertJsonStructure(['token', 'user' => ['id', 'role']])
          ->assertJsonPath('user.role', 'user');

        $login = $this->postJson('/api/login', ['email' => 'new@bastion.test', 'password' => 'Password123!'])
            ->assertOk();

        $this->withToken($login->json('token'))->getJson('/api/user')
            ->assertOk()->assertJsonPath('data.email', 'new@bastion.test');
    }

    public function test_bad_login_returns_422_and_guests_get_401(): void
    {
        User::factory()->create(['email' => 'a@bastion.test']);

        $this->postJson('/api/login', ['email' => 'a@bastion.test', 'password' => 'wrong-pass'])
            ->assertStatus(422);

        $this->getJson('/api/items')->assertStatus(401);
    }

    public function test_guest_without_accept_header_still_gets_json_401(): void
    {
        // A plain browser/Postman request (no Accept header) must not end in a 500.
        $this->get('/api/items')->assertStatus(401)->assertJson(['message' => 'Unauthenticated.']);
    }

    public function test_item_list_is_paginated_and_searchable(): void
    {
        Sanctum::actingAs(User::factory()->create());
        Item::factory()->count(12)->create();
        Item::factory()->create(['name' => 'Unique Radio Alpha']);

        $this->getJson('/api/items?per_page=5')->assertOk()->assertJsonCount(5, 'data')
            ->assertJsonPath('meta.per_page', 5);

        $this->getJson('/api/items?search=Unique Radio')->assertOk()->assertJsonCount(1, 'data');
    }

    public function test_only_admin_can_delete_item_or_change_status(): void
    {
        $item = Item::factory()->create();

        Sanctum::actingAs(User::factory()->create());
        $this->deleteJson("/api/items/{$item->id}")->assertStatus(403);
        $this->patchJson("/api/items/{$item->id}/status", ['status' => 'maintenance'])->assertStatus(403);

        Sanctum::actingAs(User::factory()->admin()->create());
        $this->patchJson("/api/items/{$item->id}/status", ['status' => 'maintenance'])->assertOk();
        $this->deleteJson("/api/items/{$item->id}")->assertNoContent();
    }

    public function test_item_validation_returns_422(): void
    {
        Sanctum::actingAs(User::factory()->create());

        $this->postJson('/api/items', ['name' => 'x'])->assertStatus(422)
            ->assertJsonValidationErrors(['name', 'serial_number', 'category_id', 'depot_id', 'quantity']);
    }

    public function test_requisition_workflow_adjusts_stock(): void
    {
        $officer = User::factory()->create();
        $item = Item::factory()->create(['quantity' => 10]);

        Sanctum::actingAs($officer);
        $id = $this->postJson('/api/requisitions', [
            'item_id' => $item->id, 'quantity' => 4,
            'purpose' => 'Field exercise', 'priority' => 'urgent',
        ])->assertCreated()->json('data.id');

        // Officers cannot change status
        $this->patchJson("/api/requisitions/{$id}/status", ['status' => 'approved'])->assertStatus(403);

        Sanctum::actingAs(User::factory()->admin()->create());
        $this->patchJson("/api/requisitions/{$id}/status", ['status' => 'issued'])->assertStatus(422); // skipped approval
        $this->patchJson("/api/requisitions/{$id}/status", ['status' => 'approved'])->assertOk();
        $this->patchJson("/api/requisitions/{$id}/status", ['status' => 'issued'])->assertOk();
        $this->assertSame(6, $item->fresh()->quantity);

        $this->patchJson("/api/requisitions/{$id}/status", ['status' => 'returned'])->assertOk();
        $this->assertSame(10, $item->fresh()->quantity);
    }

    public function test_personnel_roster_is_admin_only(): void
    {
        Sanctum::actingAs(User::factory()->create());
        $this->getJson('/api/users')->assertStatus(403);

        Sanctum::actingAs(User::factory()->admin()->create());
        $this->getJson('/api/users')->assertOk()->assertJsonStructure(['data', 'meta']);
    }

    public function test_dashboard_returns_figures(): void
    {
        Sanctum::actingAs(User::factory()->admin()->create());
        Requisition::factory()->count(3)->create();

        $this->getJson('/api/dashboard')->assertOk()
            ->assertJsonPath('figures.total_requisitions', 3)
            ->assertJsonStructure(['figures' => ['total_items', 'pending_requisitions'], 'items_by_category']);
    }
}

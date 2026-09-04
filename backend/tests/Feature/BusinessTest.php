<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BusinessTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_create_a_business(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $response = $this->actingAs($admin)->postJson('/api/businesses', ['name' => 'Peluquería Ana']);

        $response->assertCreated()->assertJsonFragment(['name' => 'Peluquería Ana', 'ownerId' => $admin->id]);
    }

    public function test_admin_only_sees_their_own_businesses(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $otherAdmin = User::factory()->create(['role' => 'admin']);

        $this->actingAs($admin)->postJson('/api/businesses', ['name' => 'Mi negocio'])->assertCreated();
        $this->actingAs($otherAdmin)->postJson('/api/businesses', ['name' => 'Negocio ajeno'])->assertCreated();

        $response = $this->actingAs($admin)->getJson('/api/businesses');

        $response->assertOk()->assertJsonCount(1)->assertJsonFragment(['name' => 'Mi negocio']);
    }

    public function test_supervisor_cannot_create_or_list_businesses(): void
    {
        $supervisor = User::factory()->create(['role' => 'supervisor']);

        $this->actingAs($supervisor)->postJson('/api/businesses', ['name' => 'No debería'])->assertForbidden();
        $this->actingAs($supervisor)->getJson('/api/businesses')->assertForbidden();
    }

    public function test_employee_cannot_create_or_list_businesses(): void
    {
        $employee = User::factory()->create(['role' => 'employee']);

        $this->actingAs($employee)->postJson('/api/businesses', ['name' => 'No debería'])->assertForbidden();
        $this->actingAs($employee)->getJson('/api/businesses')->assertForbidden();
    }
}

<?php

namespace Tests\Feature;

use App\Infrastructure\Persistence\Eloquent\BusinessModel;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UserManagementTest extends TestCase
{
    use RefreshDatabase;

    private function createBusinessFor(User $owner): BusinessModel
    {
        return BusinessModel::create(['owner_id' => $owner->id, 'name' => 'Peluquería Ana']);
    }

    public function test_admin_can_create_an_employee_for_their_own_business(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $business = $this->createBusinessFor($admin);

        $response = $this->actingAs($admin)->postJson('/api/users', [
            'name' => 'Sara Pérez',
            'email' => 'sara@time.test',
            'password' => 'password123',
            'dni' => '12345678A',
            'role' => 'employee',
            'business_id' => $business->id,
        ]);

        $response->assertCreated()->assertJsonFragment(['name' => 'Sara Pérez', 'role' => 'employee']);
        $this->assertDatabaseHas('users', ['email' => 'sara@time.test', 'business_id' => $business->id]);
    }

    public function test_employee_number_is_generated_automatically_and_sequential(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $business = $this->createBusinessFor($admin);

        $first = $this->actingAs($admin)->postJson('/api/users', [
            'name' => 'Sara Pérez', 'email' => 'sara@time.test', 'password' => 'password123',
            'dni' => '111', 'role' => 'employee', 'business_id' => $business->id,
        ])->json();

        $second = $this->actingAs($admin)->postJson('/api/users', [
            'name' => 'Luis Gómez', 'email' => 'luis@time.test', 'password' => 'password123',
            'dni' => '222', 'role' => 'employee', 'business_id' => $business->id,
        ])->json();

        $this->assertMatchesRegularExpression('/^EMP-\d{5}$/', $first['employee_number']);
        $this->assertNotSame($first['employee_number'], $second['employee_number']);
    }

    public function test_admin_role_does_not_require_a_business(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $response = $this->actingAs($admin)->postJson('/api/users', [
            'name' => 'Otro Admin',
            'email' => 'otro-admin@time.test',
            'password' => 'password123',
            'dni' => '00000000Z',
            'role' => 'admin',
        ]);

        $response->assertCreated();
        $this->assertDatabaseHas('users', ['email' => 'otro-admin@time.test', 'business_id' => null]);
    }

    public function test_admin_cannot_assign_an_employee_to_a_business_they_do_not_own(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $otherAdmin = User::factory()->create(['role' => 'admin']);
        $foreignBusiness = $this->createBusinessFor($otherAdmin);

        $response = $this->actingAs($admin)->postJson('/api/users', [
            'name' => 'Sara Pérez',
            'email' => 'sara@time.test',
            'password' => 'password123',
            'dni' => '12345678A',
            'role' => 'employee',
            'business_id' => $foreignBusiness->id,
        ]);

        $response->assertUnprocessable()->assertJsonValidationErrors('business_id');
    }

    public function test_non_admin_role_requires_a_business(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $response = $this->actingAs($admin)->postJson('/api/users', [
            'name' => 'Sara Pérez',
            'email' => 'sara@time.test',
            'password' => 'password123',
            'dni' => '12345678A',
            'role' => 'employee',
        ]);

        $response->assertUnprocessable()->assertJsonValidationErrors('business_id');
    }

    public function test_dni_must_be_unique(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $business = $this->createBusinessFor($admin);
        User::factory()->create(['dni' => '12345678A']);

        $response = $this->actingAs($admin)->postJson('/api/users', [
            'name' => 'Sara Pérez',
            'email' => 'sara@time.test',
            'password' => 'password123',
            'dni' => '12345678A',
            'role' => 'employee',
            'business_id' => $business->id,
        ]);

        $response->assertUnprocessable()->assertJsonValidationErrors(['dni']);
    }

    public function test_non_admin_cannot_create_users(): void
    {
        $employee = User::factory()->create(['role' => 'employee']);

        $this->actingAs($employee)->postJson('/api/users', ['name' => 'No debería'])->assertForbidden();
    }

    public function test_admin_can_list_and_search_their_employees(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $business = $this->createBusinessFor($admin);
        User::factory()->create(['role' => 'employee', 'business_id' => $business->id, 'name' => 'Sara Pérez', 'dni' => '111', 'created_by' => $admin->id]);
        User::factory()->create(['role' => 'employee', 'business_id' => $business->id, 'name' => 'Luis Gómez', 'dni' => '222', 'created_by' => $admin->id]);

        $otherAdmin = User::factory()->create(['role' => 'admin']);
        $otherBusiness = $this->createBusinessFor($otherAdmin);
        User::factory()->create(['role' => 'employee', 'business_id' => $otherBusiness->id, 'name' => 'Ajeno', 'created_by' => $otherAdmin->id]);

        $response = $this->actingAs($admin)->getJson('/api/users');
        $response->assertOk()->assertJsonCount(2);

        $response = $this->actingAs($admin)->getJson('/api/users?search=Sara');
        $response->assertOk()->assertJsonCount(1)->assertJsonFragment(['name' => 'Sara Pérez']);
    }

    public function test_employee_list_includes_unassigned_staff_they_created(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $business = $this->createBusinessFor($admin);
        User::factory()->create(['role' => 'employee', 'business_id' => null, 'created_by' => $admin->id, 'name' => 'Sin negocio']);

        $response = $this->actingAs($admin)->getJson('/api/users');

        $response->assertOk()->assertJsonCount(1)->assertJsonFragment(['name' => 'Sin negocio']);
    }

    public function test_non_admin_cannot_list_users(): void
    {
        $employee = User::factory()->create(['role' => 'employee']);

        $this->actingAs($employee)->getJson('/api/users')->assertForbidden();
    }

    public function test_admin_can_update_an_employee_they_created(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $business = $this->createBusinessFor($admin);
        $employee = User::factory()->create(['role' => 'employee', 'business_id' => $business->id, 'created_by' => $admin->id, 'name' => 'Sara Pérez', 'dni' => '111']);

        $response = $this->actingAs($admin)->putJson("/api/users/{$employee->id}", [
            'name' => 'Sara P. Actualizada',
            'dni' => '111',
            'role' => 'supervisor',
            'business_id' => $business->id,
        ]);

        $response->assertOk()->assertJsonFragment(['name' => 'Sara P. Actualizada', 'role' => 'supervisor']);
        $this->assertDatabaseHas('users', ['id' => $employee->id, 'name' => 'Sara P. Actualizada', 'role' => 'supervisor']);
    }

    public function test_admin_cannot_update_an_employee_they_did_not_create(): void
    {
        $creator = User::factory()->create(['role' => 'admin']);
        $otherAdmin = User::factory()->create(['role' => 'admin']);
        $business = $this->createBusinessFor($creator);
        $employee = User::factory()->create(['role' => 'employee', 'business_id' => $business->id, 'created_by' => $creator->id]);

        $this->actingAs($otherAdmin)->putJson("/api/users/{$employee->id}", [
            'name' => 'Hackeado', 'dni' => $employee->dni, 'role' => 'employee', 'business_id' => $business->id,
        ])->assertForbidden();
    }

    public function test_admin_can_unassign_an_employee_keeping_their_data(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $business = $this->createBusinessFor($admin);
        $employee = User::factory()->create([
            'role' => 'employee', 'business_id' => $business->id, 'created_by' => $admin->id,
            'dni' => '12345678A', 'employee_number' => 'EMP-00042',
        ]);

        $response = $this->actingAs($admin)->postJson("/api/users/{$employee->id}/unassign");

        $response->assertOk()->assertJsonFragment(['business_id' => null]);
        $this->assertDatabaseHas('users', [
            'id' => $employee->id,
            'business_id' => null,
            'dni' => '12345678A',
            'employee_number' => 'EMP-00042',
        ]);
    }

    public function test_admin_cannot_unassign_an_employee_they_did_not_create(): void
    {
        $creator = User::factory()->create(['role' => 'admin']);
        $otherAdmin = User::factory()->create(['role' => 'admin']);
        $business = $this->createBusinessFor($creator);
        $employee = User::factory()->create(['role' => 'employee', 'business_id' => $business->id, 'created_by' => $creator->id]);

        $this->actingAs($otherAdmin)->postJson("/api/users/{$employee->id}/unassign")->assertForbidden();
    }
}

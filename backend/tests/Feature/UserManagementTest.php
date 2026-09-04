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
            'employee_number' => 'EMP-001',
            'role' => 'employee',
            'business_id' => $business->id,
        ]);

        $response->assertCreated()->assertJsonFragment(['name' => 'Sara Pérez', 'role' => 'employee']);
        $this->assertDatabaseHas('users', ['email' => 'sara@time.test', 'business_id' => $business->id]);
    }

    public function test_admin_role_does_not_require_a_business(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $response = $this->actingAs($admin)->postJson('/api/users', [
            'name' => 'Otro Admin',
            'email' => 'otro-admin@time.test',
            'password' => 'password123',
            'dni' => '00000000Z',
            'employee_number' => 'EMP-999',
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
            'employee_number' => 'EMP-001',
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
            'employee_number' => 'EMP-001',
            'role' => 'employee',
        ]);

        $response->assertUnprocessable()->assertJsonValidationErrors('business_id');
    }

    public function test_dni_and_employee_number_must_be_unique(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $business = $this->createBusinessFor($admin);
        User::factory()->create(['dni' => '12345678A', 'employee_number' => 'EMP-001']);

        $response = $this->actingAs($admin)->postJson('/api/users', [
            'name' => 'Sara Pérez',
            'email' => 'sara@time.test',
            'password' => 'password123',
            'dni' => '12345678A',
            'employee_number' => 'EMP-001',
            'role' => 'employee',
            'business_id' => $business->id,
        ]);

        $response->assertUnprocessable()->assertJsonValidationErrors(['dni', 'employee_number']);
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
        User::factory()->create(['role' => 'employee', 'business_id' => $business->id, 'name' => 'Sara Pérez', 'dni' => '111']);
        User::factory()->create(['role' => 'employee', 'business_id' => $business->id, 'name' => 'Luis Gómez', 'dni' => '222']);

        $otherAdmin = User::factory()->create(['role' => 'admin']);
        $otherBusiness = $this->createBusinessFor($otherAdmin);
        User::factory()->create(['role' => 'employee', 'business_id' => $otherBusiness->id, 'name' => 'Ajeno']);

        $response = $this->actingAs($admin)->getJson('/api/users');
        $response->assertOk()->assertJsonCount(2);

        $response = $this->actingAs($admin)->getJson('/api/users?search=Sara');
        $response->assertOk()->assertJsonCount(1)->assertJsonFragment(['name' => 'Sara Pérez']);
    }

    public function test_non_admin_cannot_list_users(): void
    {
        $employee = User::factory()->create(['role' => 'employee']);

        $this->actingAs($employee)->getJson('/api/users')->assertForbidden();
    }
}

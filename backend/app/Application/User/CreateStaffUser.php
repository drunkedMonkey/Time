<?php

namespace App\Application\User;

use App\Models\User;
use Illuminate\Support\Facades\DB;

class CreateStaffUser
{
    public function handle(array $data, int $createdBy): User
    {
        return DB::transaction(function () use ($data, $createdBy) {
            $counterId = DB::table('employee_number_counters')->insertGetId([]);

            return User::create([
                'name' => $data['name'],
                'email' => $data['email'],
                'password' => $data['password'],
                'dni' => $data['dni'],
                'employee_number' => sprintf('EMP-%05d', $counterId),
                'role' => $data['role'],
                'business_id' => $data['role'] === 'admin' ? null : $data['business_id'],
                'created_by' => $createdBy,
            ]);
        });
    }
}

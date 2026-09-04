<?php

namespace App\Application\User;

use App\Models\User;
use Illuminate\Support\Facades\DB;

class CreateStaffUser
{
    public function handle(array $data): User
    {
        return DB::transaction(fn () => User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => $data['password'],
            'dni' => $data['dni'],
            'employee_number' => $data['employee_number'],
            'role' => $data['role'],
            'business_id' => $data['role'] === 'admin' ? null : $data['business_id'],
        ]));
    }
}

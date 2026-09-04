<?php

namespace App\Application\User;

use App\Models\User;
use Illuminate\Support\Facades\DB;

class UpdateStaffUser
{
    public function handle(User $user, array $data): User
    {
        return DB::transaction(function () use ($user, $data) {
            $user->update([
                'name' => $data['name'],
                'dni' => $data['dni'],
                'role' => $data['role'],
                'business_id' => $data['role'] === 'admin' ? null : $data['business_id'],
            ]);

            return $user->fresh();
        });
    }
}

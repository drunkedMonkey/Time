<?php

namespace App\Application\User;

use App\Models\User;

class UnassignStaffUser
{
    public function handle(User $user): User
    {
        $user->update(['business_id' => null]);

        return $user->fresh();
    }
}

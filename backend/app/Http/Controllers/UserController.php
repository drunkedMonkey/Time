<?php

namespace App\Http\Controllers;

use App\Application\User\CreateStaffUser;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    public function index(Request $request)
    {
        abort_unless($request->user()->isAdmin(), 403);

        $businessIds = $request->user()->ownedBusinesses()->pluck('id');

        $query = User::query()
            ->whereIn('business_id', $businessIds)
            ->whereIn('role', ['supervisor', 'employee']);

        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('dni', 'like', "%{$search}%")
                    ->orWhere('employee_number', 'like', "%{$search}%");
            });
        }

        return response()->json(
            $query->get(['id', 'name', 'email', 'dni', 'employee_number', 'role', 'business_id'])
        );
    }

    public function store(Request $request, CreateStaffUser $createStaffUser)
    {
        abort_unless($request->user()->isAdmin(), 403);

        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8'],
            'dni' => ['required', 'string', 'unique:users,dni'],
            'employee_number' => ['required', 'string', 'unique:users,employee_number'],
            'role' => ['required', Rule::in(['admin', 'supervisor', 'employee'])],
            'business_id' => [
                Rule::requiredIf(fn () => $request->input('role') !== 'admin'),
                'nullable',
                Rule::exists('businesses', 'id')->where('owner_id', $request->user()->id),
            ],
        ]);

        $user = $createStaffUser->handle($data);

        return response()->json($user, 201);
    }
}

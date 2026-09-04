<?php

namespace App\Http\Controllers;

use App\Application\User\CreateStaffUser;
use App\Application\User\UnassignStaffUser;
use App\Application\User\UpdateStaffUser;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    public function index(Request $request)
    {
        abort_unless($request->user()->isAdmin(), 403);

        $query = User::query()
            ->where('created_by', $request->user()->id)
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
            'email' => ['required', 'email', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8'],
            ...$this->staffFieldRules($request),
        ]);

        $user = $createStaffUser->handle($data, $request->user()->id);

        return response()->json($user, 201);
    }

    public function update(Request $request, int $id, UpdateStaffUser $updateStaffUser)
    {
        $employee = $this->findManagedEmployee($request, $id);

        $data = $request->validate($this->staffFieldRules($request, $employee->id));

        $employee = $updateStaffUser->handle($employee, $data);

        return response()->json($employee);
    }

    public function unassign(Request $request, int $id, UnassignStaffUser $unassignStaffUser)
    {
        $employee = $this->findManagedEmployee($request, $id);

        return response()->json($unassignStaffUser->handle($employee));
    }

    private function findManagedEmployee(Request $request, int $id): User
    {
        abort_unless($request->user()->isAdmin(), 403);

        $employee = User::find($id);
        abort_unless($employee, 404);
        abort_unless($employee->created_by === $request->user()->id, 403);

        return $employee;
    }

    private function staffFieldRules(Request $request, ?int $ignoreUserId = null): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'dni' => ['required', 'string', Rule::unique('users', 'dni')->ignore($ignoreUserId)],
            'role' => ['required', Rule::in(['admin', 'supervisor', 'employee'])],
            'business_id' => [
                Rule::requiredIf(fn () => $request->input('role') !== 'admin'),
                'nullable',
                Rule::exists('businesses', 'id')->where('owner_id', $request->user()->id),
            ],
        ];
    }
}

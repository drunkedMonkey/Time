<?php

namespace App\Http\Controllers;

use App\Application\Business\CreateBusiness;
use App\Application\Business\ListOwnedBusinesses;
use Illuminate\Http\Request;

class BusinessController extends Controller
{
    public function index(Request $request, ListOwnedBusinesses $listOwnedBusinesses)
    {
        abort_unless($request->user()->isAdmin(), 403);

        return response()->json($listOwnedBusinesses->handle($request->user()->id));
    }

    public function store(Request $request, CreateBusiness $createBusiness)
    {
        abort_unless($request->user()->isAdmin(), 403);

        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
        ]);

        $business = $createBusiness->handle($request->user()->id, $data['name']);

        return response()->json($business, 201);
    }
}

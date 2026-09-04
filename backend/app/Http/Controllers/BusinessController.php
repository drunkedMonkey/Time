<?php

namespace App\Http\Controllers;

use App\Application\Business\CreateBusiness;
use Illuminate\Http\Request;

class BusinessController extends Controller
{
    public function store(Request $request, CreateBusiness $createBusiness)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
        ]);

        $business = $createBusiness->handle($request->user()->id, $data['name']);

        return response()->json($business, 201);
    }
}

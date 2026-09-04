<?php

use App\Http\Controllers\AppointmentController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\BusinessController;
use App\Http\Controllers\UserController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', fn (Request $request) => $request->user());
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/businesses', [BusinessController::class, 'index']);
    Route::post('/businesses', [BusinessController::class, 'store']);
    Route::get('/businesses/{id}', [BusinessController::class, 'show']);
    Route::delete('/businesses/{id}', [BusinessController::class, 'destroy']);
    Route::post('/appointments', [AppointmentController::class, 'store']);
    Route::get('/users', [UserController::class, 'index']);
    Route::post('/users', [UserController::class, 'store']);
    Route::put('/users/{id}', [UserController::class, 'update']);
    Route::post('/users/{id}/unassign', [UserController::class, 'unassign']);
});

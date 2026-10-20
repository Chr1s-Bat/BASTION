<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\ItemController;
use App\Http\Controllers\Api\MetaController;
use App\Http\Controllers\Api\RequisitionController;
use App\Http\Controllers\Api\UserController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| BASTION API  (prefix /api is added automatically)
|--------------------------------------------------------------------------
*/

// ---- Public ---------------------------------------------------------------
Route::post('/register', [AuthController::class, 'register'])->middleware('throttle:20,1');
Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:20,1');

// ---- Authenticated (Sanctum bearer token) ---------------------------------
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'me']);

    Route::get('/dashboard', DashboardController::class);
    Route::get('/meta', MetaController::class);

    // Equipment items: index/show/store for everyone, update = owner/admin (policy)
    Route::get('/items', [ItemController::class, 'index']);
    Route::post('/items', [ItemController::class, 'store']);
    Route::get('/items/{item}', [ItemController::class, 'show']);
    Route::put('/items/{item}', [ItemController::class, 'update']);

    // Requisitions: users manage their own, admins see everything
    Route::apiResource('requisitions', RequisitionController::class);

    // ---- Admin only (middleware role:admin + policies) --------------------
    Route::middleware('role:admin')->group(function () {
        Route::get('/users', [UserController::class, 'index']); // personnel roster
        Route::delete('/items/{item}', [ItemController::class, 'destroy']);
        Route::patch('/items/{item}/status', [ItemController::class, 'updateStatus']);
        Route::patch('/requisitions/{requisition}/status', [RequisitionController::class, 'updateStatus']);
    });
});

<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\DeliveryController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/verify-id', [AuthController::class, 'verifyId']);
    
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    // Orders
    Route::apiResource('orders', OrderController::class);
    
    // Deliveries
    Route::post('/orders/{order}/delivery', [DeliveryController::class, 'store']);
    Route::put('/deliveries/{delivery}', [DeliveryController::class, 'update']);
});

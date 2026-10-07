<?php

use App\Http\Controllers\CartController;
use Illuminate\Support\Facades\Route;

Route::get('/carts/{userId}', [CartController::class, 'index']);
Route::post('/carts', [CartController::class, 'store']);
Route::put('/carts/items/{id}', [CartController::class, 'update']);
Route::delete('/carts/items/{id}', [CartController::class, 'destroy']);
Route::delete('/carts/{userId}', [CartController::class, 'clear']);

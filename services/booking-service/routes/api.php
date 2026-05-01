<?php

use Illuminate\Http\Request;
use App\Http\Controllers\FieldController;
use App\Http\Controllers\FieldCategoryController;
use App\Http\Controllers\BookingController;
use Illuminate\Support\Facades\Route;

Route::get('/user-info', function (Request $request) {
    return response()->json([
        'user' => $request->user() // Jika menggunakan library auth Laravel
    ]);
});

Route::get('/fields', [FieldController::class, 'index']);
Route::post('/fields', [FieldController::class, 'store']);

Route::get('/categories', [FieldCategoryController::class, 'index']);
Route::post('/categories', [FieldCategoryController::class, 'store']);

Route::post('/book', [BookingController::class, 'store']);
Route::get('/bookings', [BookingController::class, 'index']);
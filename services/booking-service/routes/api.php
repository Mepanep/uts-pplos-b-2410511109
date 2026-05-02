<?php

use Illuminate\Http\Request;
use App\Http\Controllers\FieldController;
use App\Http\Controllers\FieldCategoryController;
use App\Http\Controllers\BookingController;
use Illuminate\Support\Facades\Route;

Route::get('/user-info', function (Request $request) {
    return response()->json([
        'user' => $request->user()
    ]);
});

Route::get('/fields', [FieldController::class, 'index']);
Route::post('/fields', [FieldController::class, 'store']);
Route::put('/fields/{id}', [FieldController::class, 'update']);
Route::delete('/fields/{id}', [FieldController::class, 'destroy']);

Route::get('/categories', [FieldCategoryController::class, 'index']);
Route::post('/categories', [FieldCategoryController::class, 'store']);
Route::put('/categories/{id}', [FieldCategoryController::class, 'update']);
Route::delete('/categories/{id}', [FieldCategoryController::class, 'destroy']);

Route::post('/bookings', [BookingController::class, 'store']);
Route::get('/bookings', [BookingController::class, 'index']);
Route::put('/bookings/{id}', [BookingController::class, 'update']);
Route::delete('/bookings/{id}', [BookingController::class, 'destroy']);
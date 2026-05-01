<?php

use Illuminate\Http\Request;
use App\Http\Controllers\FieldController;
use App\Http\Controllers\BookingController;
use Illuminate\Support\Facades\Route;

Route::get('/fields', [FieldController::class, 'index']);

Route::post('/book', [BookingController::class, 'store']);
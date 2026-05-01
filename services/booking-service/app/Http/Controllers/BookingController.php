<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class BookingController extends Controller
{
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'user_id'    => 'required|integer',
            'field_id'   => 'required|integer',
            'start_time' => 'required|date',
            'end_time'   => 'required|date|after:start_time',
            'total_price'=> 'required|numeric'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validasi gagal',
                'errors'  => $validator->errors()
            ], 422);
        }

        try {
            $booking = Booking::create([
                'user_id'     => $request->user_id,
                'field_id'    => $request->field_id,
                'start_time'  => $request->start_time,
                'end_time'    => $request->end_time,
                'total_price' => $request->total_price,
                // 'status'      => 'pending'
            ]);

            return response()->json([
                'message' => 'Booking berhasil dibuat',
                'data'    => $booking
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Gagal membuat booking',
                'error'   => $e->getMessage()
            ], 500);
        }
    }

    public function index()
    {
        $bookings = Booking::with(['user', 'field'])->get();
        return response()->json($bookings);
    }
}
<?php

namespace App\Http\Controllers;

use App\Models\Field;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class FieldController extends Controller
{
    public function index(Request $request)
    {
        // Sesuaikan nama kolom menjadi field_category_id sesuai image_20e2b8.png
        $query = Field::query();

        if ($request->has('field_category_id')) {
            $query->where('field_category_id', $request->field_category_id);
        }

        return response()->json($query->paginate($request->get('per_page', 10)));
    }

    public function store(Request $request)
    {
        // Validasi tanpa kolom 'description' sesuai instruksimu
        $validator = Validator::make($request->all(), [
            'field_category_id' => 'required|integer',
            'name'              => 'required|string|max:255',
            'price_per_hour'    => 'required|numeric'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validasi gagal',
                'errors'  => $validator->errors()
            ], 422);
        }

        try {
            $field = Field::create([
                'field_category_id' => $request->field_category_id,
                'name'              => $request->name,
                'price_per_hour'    => $request->price_per_hour,
            ]);

            return response()->json([
                'message' => 'Lapangan berhasil ditambahkan',
                'data'    => $field
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Gagal menambah lapangan',
                'error'   => $e->getMessage()
            ], 500);
        }
    }
}
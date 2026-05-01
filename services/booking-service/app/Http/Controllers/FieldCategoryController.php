<?php

namespace App\Http\Controllers;

use App\Models\FieldCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class FieldCategoryController extends Controller
{
    public function index()
    {
        try {
            $categories = FieldCategory::all();
            return response()->json([
                'status'  => 'success',
                'message' => 'Daftar kategori berhasil diambil',
                'data'    => $categories
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Gagal mengambil data kategori',
                'error'   => $e->getMessage()
            ], 500);
        }
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name'        => 'required|string|unique:field_categories,name',
            'description' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validasi gagal',
                'errors'  => $validator->errors()
            ], 422);
        }

        try {
            $category = FieldCategory::create([
                'name'        => $request->name,
                'description' => $request->description
            ]);

            return response()->json([
                'status'  => 'success',
                'message' => 'Kategori berhasil ditambahkan',
                'data'    => $category
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Gagal menambahkan kategori',
                'error'   => $e->getMessage()
            ], 500);
        }
    }
}
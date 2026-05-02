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

    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'name'        => 'required|string|unique:field_categories,name,' . $id,
            'description' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Validasi gagal',
                'errors'  => $validator->errors()
            ], 422);
        }

        try {
            $category = FieldCategory::find($id);

            if (!$category) {
                return response()->json([
                    'status'  => 'error',
                    'message' => 'Kategori tidak ditemukan'
                ], 404);
            }

            $category->update([
                'name'        => $request->name,
                'description' => $request->description
            ]);

            return response()->json([
                'status'  => 'success',
                'message' => 'Kategori berhasil diperbarui',
                'data'    => $category
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Gagal memperbarui kategori',
                'error'   => $e->getMessage()
            ], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $category = FieldCategory::find($id);

            if (!$category) {
                return response()->json([
                    'status'  => 'error',
                    'message' => 'Kategori tidak ditemukan'
                ], 404);
            }

            $category->delete();

            return response()->json([
                'status'  => 'success',
                'message' => 'Kategori berhasil dihapus'
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Gagal menghapus kategori',
                'error'   => $e->getMessage()
            ], 500);
        }
    }
}
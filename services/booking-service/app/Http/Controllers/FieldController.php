<?php

namespace App\Http\Controllers;

use App\Models\Field;
use Illuminate\Http\Request;

class FieldController extends Controller
{
    public function index(Request $request)
    {
        $query = Field::query();

        // Contoh Filtering berdasarkan category_id (Wajib Poin 2)
        if ($request->has('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        // Contoh Paging (Wajib Poin 2)
        // per_page bisa diambil dari request atau default 10
        return $query->paginate($request->get('per_page', 10));
    }
}
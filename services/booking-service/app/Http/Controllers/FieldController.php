<?php

namespace App\Http\Controllers;

use App\Models\Field;
use Illuminate\Http\Request;

class FieldController extends Controller
{
    public function index(Request $request)
    {
        $query = Field::query();

        if ($request->has('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        return $query->paginate($request->get('per_page', 10));
    }
}
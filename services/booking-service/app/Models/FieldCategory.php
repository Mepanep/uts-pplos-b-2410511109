<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FieldCategory extends Model
{
    protected $fillable = [
    'name', 
    'description'
    ];

    public function fields()
    {
        return $this->hasMany(Field::class);
    }
}
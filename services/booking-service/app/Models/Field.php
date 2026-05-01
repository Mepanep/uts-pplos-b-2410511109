<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Field extends Model
{
    protected $fillable = ['field_category_id', 'name', 'price_per_hour'];

    public function category()
    {
        return $this->belongsTo(FieldCategory::class, 'field_category_id');
    }

    public function bookings()
    {
        return $this->hasMany(Booking::class);
    }
}
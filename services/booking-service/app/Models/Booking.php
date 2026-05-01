<?php

namespace App\Models;
use App\Models\User;
use App\Models\Field;
use Illuminate\Database\Eloquent\Model;

class Booking extends Model
{
    protected $fillable = [
        'user_id', 
        'field_id', 
        'start_time', 
        'end_time', 
        'total_price', 
        'status'
        ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function field()
    {
        return $this->belongsTo(Field::class);
    }
}
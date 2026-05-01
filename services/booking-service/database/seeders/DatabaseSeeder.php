<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Field;
use App\Models\FieldCategory;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $user = User::create([
            'name'     => 'Hanif Member',
            'email'    => 'hanif@example.com',
            'password' => Hash::make('password123'),
        ]);

        //Kategori Lapangan
        $futsal = FieldCategory::create([
            'name'        => 'Futsal',
            'description' => 'Lapangan indoor dengan rumput sintetis berkualitas.'
        ]);

        $badminton = FieldCategory::create([
            'name'        => 'Badminton',
            'description' => 'Lapangan vinyl standar internasional.'
        ]);

        //Lapangan
        Field::create([
            'field_category_id' => $futsal->id,
            'name'              => 'Wembley Futsal',
            'price_per_hour'    => 150000
        ]);

        Field::create([
            'field_category_id' => $futsal->id,
            'name'              => 'Old Trafford Arena',
            'price_per_hour'    => 125000
        ]);

        Field::create([
            'field_category_id' => $badminton->id,
            'name'              => 'Istora Court',
            'price_per_hour'    => 50000
        ]);
    }
}
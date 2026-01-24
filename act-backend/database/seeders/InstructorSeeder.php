<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class InstructorSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Check if user exists to avoid duplicates
        if (!User::where('email', 'instructor@act.edu')->exists()) {
            User::create([
                'name' => 'Instructor Demo',
                'email' => 'instructor@act.edu',
                'password' => Hash::make('password'),
                'role' => 'instructor',
                'email_verified_at' => now(),
            ]);
            $this->command->info('Instructor user created successfully.');
        } else {
            $this->command->info('Instructor user already exists.');
        }
    }
}

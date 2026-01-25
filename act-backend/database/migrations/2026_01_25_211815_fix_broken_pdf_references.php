<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Get all existing PDF files in storage
        $existingFiles = [
            '8kdEuBnAFMmgpX3v0qqz9RVGPAl7e4VX4HiKxRGw.pdf',
            'CXropm888MA20O90duKbSWtX2h48NJteVPFuTJUT.pdf',
            'Fp7UUu9HpnBG8EatauNeXNGdv4kxrleC06bzqeB8.pdf',
            'QinpyAUdNqOMQHQGIBwnI5k691YSeBHAsLXIgv1B.pdf',
            'tOnG2FpoNjWZFDipVoSgTRSqCjY70wO2BHE1Kw3V.pdf'
        ];
        
        // Find all lessons with resource_path
        $allLessons = DB::table('lessons')->whereNotNull('resource_path')->get();
        
        foreach ($allLessons as $lesson) {
            $filename = basename($lesson->resource_path);
            
            // Check if the file exists
            if (!in_array($filename, $existingFiles)) {
                echo "Removing broken PDF reference for lesson ID: {$lesson->id}, file: {$filename}\n";
                DB::table('lessons')
                    ->where('id', $lesson->id)
                    ->update(['resource_path' => null]);
            } else {
                echo "Keeping valid PDF reference for lesson ID: {$lesson->id}, file: {$filename}\n";
            }
        }
        
        // Add a test lesson with valid PDF for testing
        if (DB::table('lessons')->where('resource_path', 'like', '%8kdEuBnAFMmgpX3v0qqz9RVGPAl7e4VX4HiKxRGw.pdf%')->count() == 0) {
            // Find first course to associate with
            $course = DB::table('courses')->first();
            if ($course) {
                DB::table('lessons')->insert([
                    'course_id' => $course->id,
                    'title' => 'Test Lesson with PDF',
                    'description' => 'This is a test lesson to demonstrate PDF reading functionality',
                    'resource_path' => '/storage/resources/8kdEuBnAFMmgpX3v0qqz9RVGPAl7e4VX4HiKxRGw.pdf',
                    'order' => 1,
                    'created_at' => now(),
                    'updated_at' => now()
                ]);
                echo "Added test lesson with valid PDF for course ID: {$course->id}\n";
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // This migration is not reversible as we don't know the original values
        // In a real scenario, you might want to backup the original values first
    }
};

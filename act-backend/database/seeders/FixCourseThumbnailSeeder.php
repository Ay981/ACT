<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Course;

class FixCourseThumbnailSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Fix course 1 thumbnail with a working URL
        $course = Course::find(1);
        if ($course) {
            // Use a reliable Unsplash image that always works
            $course->update([
                'thumbnail' => 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
            ]);
            $this->command->info('Fixed thumbnail for course: ' . $course->title);
            $this->command->info('New thumbnail: ' . $course->thumbnail);
        } else {
            $this->command->info('Course 1 does not exist');
        }
    }
}

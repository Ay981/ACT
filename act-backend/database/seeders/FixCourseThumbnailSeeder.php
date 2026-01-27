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
        // Fix course 1 thumbnail if it's empty or null
        $course = Course::find(1);
        if ($course && (is_null($course->thumbnail) || $course->thumbnail === '')) {
            $course->update([
                'thumbnail' => '/storage/thumbnails/KYXC1OQb0WdOwBAaXzKuO095uT0M6DyYxmvvm2Je.jpg'
            ]);
            $this->command->info('Fixed thumbnail for course: ' . $course->title);
        } else {
            $this->command->info('Course 1 already has a thumbnail or does not exist');
        }
    }
}

<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Course;
use App\Models\Lesson;
use App\Models\User;

class CourseSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Ensure we have an instructor
        $instructor = User::firstOrCreate(
            ['email' => 'instructor@example.com'],
            [
                'name' => 'John Instructor',
                'password' => bcrypt('password'),
                'role' => 'instructor',
            ]
        );

        // 2. Mock Data from Frontend
        $coursesDetails = [
            [
                'title' => 'Create An LMS Website With LearnPress',
                'category' => 'Photography',
                'level' => 'Beginner',
                'thumbnail' => 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
                'price' => 0.00,
                'status' => 'published',
            ],
            [
                'title' => 'Design A Website With ThimPress',
                'category' => 'Photography',
                'level' => 'Beginner',
                'thumbnail' => 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
                'price' => 49.00,
                'status' => 'published',
            ],
            [
                'title' => 'Create An LMS Website With LearnPress (Intermediate)',
                'category' => 'Photography',
                'level' => 'Intermediate',
                'thumbnail' => 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
                'price' => 0.00,
                'status' => 'published',
            ],
            [
                'title' => 'Wordpress Development Masterclass',
                'category' => 'Photography',
                'level' => 'Advanced',
                'thumbnail' => 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
                'price' => 29.00,
                'status' => 'published',
            ],
        ];

        foreach ($coursesDetails as $detail) {
            $course = Course::create(array_merge($detail, [
                'instructor_id' => $instructor->id,
                'description' => 'This is a sample course description to demonstrate the layout and functionality of the platform.',
            ]));

            // Add dummy lessons
            $this->addLessons($course);
        }
    }

    private function addLessons(Course $course)
    {
        $lessonTitles = [
            'Introduction to the Course',
            'Syllabus Overview',
            'Getting Started with the Tools',
            'First Practical Assignment',
            'Conclusion and Next Steps'
        ];

        foreach ($lessonTitles as $index => $title) {
            Lesson::create([
                'course_id' => $course->id,
                'title' => $title,
                'description' => 'In this lesson, we will cover the basics of ' . $title,
                'video_url' => 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                'content_type' => 'video',
                'order' => $index + 1,
            ]);
        }
    }
}

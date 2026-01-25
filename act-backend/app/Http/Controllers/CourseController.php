<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\Lesson;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class CourseController extends Controller
{
    public function all()
    {
        // Return all courses regardless of status for now, to ensure students see uploaded content
        return response()->json(Course::withCount(['lessons', 'students'])->orderBy('created_at', 'desc')->get());
    }

    public function index(Request $request)
    {
        $courses = Course::where('instructor_id', $request->user()->id)
            ->withCount(['lessons', 'students'])
            ->orderBy('created_at', 'desc')
            ->get();
        return response()->json($courses);
    }

    public function show(Request $request, $id)
    {
        // Check if this is an instructor request (from authenticated route)
        if ($request->is('api/instructor/*')) {
            $course = Course::where('id', $id)
                ->where('instructor_id', $request->user()->id)
                ->with(['lessons' => function($query) {
                    $query->orderBy('order');
                }])
                ->firstOrFail();
        } else {
            // Public route - anyone can view
            $course = Course::with(['lessons' => function($query) {
                $query->orderBy('order');
            }])->findOrFail($id);
        }

        // Only check for authenticated user if token is provided
        try {
            $user = $request->user('sanctum');
        } catch (\Exception $e) {
            $user = null;
        }
        
        $isEnrolled = false;
        $isInstructor = false;

        if ($user) {
            $isEnrolled = $course->students()->where('user_id', $user->id)->exists();
            $isInstructor = $course->instructor_id === $user->id;
        }

        // Hide video_url if not enrolled and not instructor
        if (!$isEnrolled && !$isInstructor) {
            $course->lessons->makeHidden(['video_url']);
        }

        $course->is_enrolled = $isEnrolled;

        // Fetch related quizzes (linked by Course Title as Category)
        $quizzes = \App\Models\Quiz::where('category', $course->title)
            ->where('status', 'published')
            ->withCount('questions')
            ->get();
            
        $course->setRelation('related_quizzes', $quizzes);
        
        return response()->json($course);
    }

    public function enroll(Request $request, $id)
    {
        $user = $request->user();
        $course = Course::findOrFail($id);

        if ($course->students()->where('user_id', $user->id)->exists()) {
            return response()->json(['message' => 'Already enrolled'], 200);
        }

        if ($course->instructor_id === $user->id) {
             return response()->json(['message' => 'Instructor cannot enroll in own course'], 400);
        }

        $course->students()->attach($user->id);

        return response()->json(['message' => 'Enrolled successfully'], 200);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'category' => 'required|string',
            'level' => 'required|string',
            'price' => 'numeric|min:0',
            'thumbnail' => 'nullable|image|max:2048', // Max 2MB
        ]);

        $path = null;
        if ($request->hasFile('thumbnail')) {
            $path = $request->file('thumbnail')->store('thumbnails', 'public');
        }

        $course = Course::create([
            'instructor_id' => $request->user()->id,
            'title' => $validated['title'],
            'description' => $validated['description'] ?? '',
            'category' => $validated['category'],
            'level' => $validated['level'],
            'price' => $validated['price'] ?? 0,
            'thumbnail' => $path ? '/storage/' . $path : null,
            'status' => 'published' // Auto-publish for now so students can see it immediately
        ]);

        return response()->json($course, 201);
    }

    public function update(Request $request, $id)
    {
        $course = Course::where('id', $id)
            ->where('instructor_id', $request->user()->id)
            ->firstOrFail();

        // Debug: Log all request data
        \Log::info('Course update request data:', [
            'all' => $request->all(),
            'has_title' => $request->has('title'),
            'title_value' => $request->input('title'),
            'files' => $request->allFiles()
        ]);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'category' => 'required|string',
            'level' => 'required|string',
            'price' => 'numeric|min:0',
            'thumbnail' => 'nullable|image|max:2048', // Max 2MB
        ]);

        // Handle thumbnail update
        if ($request->hasFile('thumbnail')) {
            $path = $request->file('thumbnail')->store('thumbnails', 'public');
            $validated['thumbnail'] = '/storage/' . $path;
        }

        $course->update([
            'title' => $validated['title'],
            'description' => $validated['description'] ?? '',
            'category' => $validated['category'],
            'level' => $validated['level'],
            'price' => $validated['price'] ?? 0,
            'thumbnail' => $validated['thumbnail'] ?? $course->thumbnail,
        ]);

        return response()->json($course, 200);
    }

    public function updateLesson(Request $request, $courseId, $lessonId)
    {
        $course = Course::where('id', $courseId)
            ->where('instructor_id', $request->user()->id)
            ->firstOrFail();

        $lesson = Lesson::where('id', $lessonId)
            ->where('course_id', $courseId)
            ->firstOrFail();

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'video' => 'nullable|file|mimes:mp4,mov,ogg,webm,avi,wmv,flv,mkv,pdf,doc,docx|max:102400',
            'youtube_url' => 'nullable|url',
            'resource' => 'nullable|file|mimes:pdf,doc,docx|max:20480',
        ]);

        // Handle video file update
        if ($request->hasFile('video')) {
            $videoFile = $request->file('video');
            $mime = $videoFile->getMimeType();
            $ext = $videoFile->extension();
            
            if (in_array($ext, ['pdf', 'doc', 'docx']) || str_contains($mime, 'pdf') || str_contains($mime, 'word') || str_contains($mime, 'document')) {
                $path = $videoFile->store('resources', 'public');
                $validated['resource_path'] = '/storage/' . $path;
                $validated['video_url'] = null;
            } else {
                $path = $videoFile->store('videos', 'public');
                $validated['video_url'] = '/storage/' . $path;
                $validated['resource_path'] = null;
            }
        }

        // Handle resource file update
        if ($request->hasFile('resource')) {
            $path = $request->file('resource')->store('resources', 'public');
            $validated['resource_path'] = '/storage/' . $path;
        }

        $lesson->update([
            'title' => $validated['title'],
            'description' => $validated['description'] ?? '',
            'video_url' => $validated['video_url'] ?? $lesson->video_url,
            'youtube_url' => $validated['youtube_url'] ?? $lesson->youtube_url,
            'resource_path' => $validated['resource_path'] ?? $lesson->resource_path,
        ]);

        return response()->json($lesson, 200);
    }

    public function deleteLesson(Request $request, $courseId, $lessonId)
    {
        $course = Course::where('id', $courseId)
            ->where('instructor_id', $request->user()->id)
            ->firstOrFail();

        $lesson = Lesson::where('id', $lessonId)
            ->where('course_id', $courseId)
            ->firstOrFail();

        $lesson->delete();

        return response()->json(['message' => 'Lesson deleted successfully'], 200);
    }

    public function addLesson(Request $request, $courseId)
    {
        $course = Course::where('id', $courseId)
            ->where('instructor_id', $request->user()->id)
            ->firstOrFail();

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'video' => 'nullable|file|mimes:mp4,mov,ogg,webm,avi,wmv,flv,mkv,pdf,doc,docx|max:102400', // Max 100MB, allowed PDF to be flexible
            'youtube_url' => 'nullable|url',
            'resource' => 'nullable|file|mimes:pdf,doc,docx|max:20480', // Max 20MB
        ]);

        $videoPath = null;
        $resourcePath = null;

        // Handle the 'video' input file - checking if it's actually a PDF or Doc
        if ($request->hasFile('video')) {
            $videoFile = $request->file('video');
            $mime = $videoFile->getMimeType();
            $ext = $videoFile->extension();
            
            // If user uploaded a PDF/Doc in the video slot, treat it as a resource
            if (in_array($ext, ['pdf', 'doc', 'docx']) || str_contains($mime, 'pdf') || str_contains($mime, 'word') || str_contains($mime, 'document')) {
                $path = $videoFile->store('resources', 'public');
                $resourcePath = '/storage/' . $path;
            } else {
                // It's a video
                $path = $videoFile->store('videos', 'public');
                $videoPath = '/storage/' . $path;
            }
        }

        // Handle the explicit 'resource' input file
        if ($request->hasFile('resource')) {
            $path = $request->file('resource')->store('resources', 'public');
            // If we already have a resource from the video slot, we'll just overwrite/use this one
            // or we could decide to reject, but overwriting with the explicit field is safer.
            $resourcePath = '/storage/' . $path;
        }

        $count = $course->lessons()->count();

        $lesson = Lesson::create([
            'course_id' => $course->id,
            'title' => $validated['title'],
            'description' => $validated['description'] ?? '',
            'video_url' => $videoPath,
            'youtube_url' => $validated['youtube_url'] ?? null,
            'resource_path' => $resourcePath,
            'order' => $count + 1,
        ]);

        return response()->json($lesson, 201);
    }

    public function enrolled(Request $request)
    {
        $courses = $request->user()->enrolledCourses()
            ->withCount('lessons')
            ->orderBy('pivot_created_at', 'desc')
            ->get();
            
        return response()->json($courses);
    }

    public function downloadResource(Request $request, $lessonId)
    {
        $lesson = Lesson::findOrFail($lessonId);
        
        if (!$lesson->resource_path) {
            return response()->json(['message' => 'No resource found'], 404);
        }

        // Convert web path to storage path
        $relativePath = str_replace('/storage/', '', $lesson->resource_path);
        
        if (!Storage::disk('public')->exists($relativePath)) {
            return response()->json(['message' => 'File not found: ' . $relativePath], 404);
        }

        try {
            $file = Storage::disk('public')->get($relativePath);
            $filename = basename($lesson->resource_path);

            return response($file)
                ->header('Content-Type', 'application/pdf')
                ->header('Content-Disposition', 'attachment; filename="' . $filename . '"')
                ->header('Content-Length', strlen($file));
        } catch (\Exception $e) {
            \Log::error('Download error: ' . $e->getMessage());
            return response()->json(['message' => 'Download failed: ' . $e->getMessage()], 500);
        }
    }

    public function storageProxy($path)
    {
        try {
            // URL decode the path to handle special characters
            $decodedPath = urldecode($path);
            $fullPath = 'resources/' . $decodedPath;
            
            if (!Storage::disk('public')->exists($fullPath)) {
                return response()->json(['message' => 'File not found: ' . $fullPath], 404);
            }

            $file = Storage::disk('public')->get($fullPath);

            return response($file)
                ->header('Content-Type', 'application/pdf')
                ->header('Content-Disposition', 'attachment; filename="' . basename($decodedPath) . '"')
                ->header('Content-Length', strlen($file));
                
        } catch (\Exception $e) {
            \Log::error('Storage proxy error: ' . $e->getMessage());
            return response()->json(['message' => 'Proxy failed: ' . $e->getMessage()], 500);
        }
    }
}

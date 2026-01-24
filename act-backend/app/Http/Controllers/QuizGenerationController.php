<?php

namespace App\Http\Controllers;

use App\Models\Question;
use App\Models\QuestionOption;
use App\Models\Quiz;
use App\Services\GeminiService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class QuizGenerationController extends Controller
{
    protected $gemini;

    public function __construct(GeminiService $gemini)
    {
        $this->gemini = $gemini;
    }

    public function generate(Request $request)
    {
        $request->validate([
            'topic' => 'required_without:course_id|string|nullable|min:3',
            'course_id' => 'nullable|integer|exists:courses,id',
            'difficulty' => 'nullable|string|in:Beginner,Intermediate,Advanced',
            'count' => 'nullable|integer|min:3|max:20',
        ]);

        $topic = $request->input('topic');
        $courseId = $request->input('course_id');
        $difficulty = $request->input('difficulty', 'Intermediate');
        $count = $request->input('count', 5);
        $context = "";

        // If Course ID provided, construct context from Lessons (YouTube + PDF)
        if ($courseId) {
            $course = \App\Models\Course::with('lessons')->find($courseId);
            if ($course) {
                // If topic wasn't explicitly provided, use course title
                if (!$topic) $topic = $course->title;

                $context .= "Source Material from Course: {$course->title}\n\n";
                
                // Parse PDF logic
                $parser = new \Smalot\PdfParser\Parser();
                
                foreach ($course->lessons as $lesson) {
                    $context .= "Lesson: {$lesson->title}\n";
                    if ($lesson->youtube_url) {
                        $context .= "Video Resource: {$lesson->youtube_url}\n";
                    }
                    if ($lesson->resource_path) {
                        // resource_path is relative usually start with /storage
                        // Mapping to absolute path: storage_path('app/public/...') if stored in public disk
                        try {
                            // Convert web path (/storage/resources/file.pdf) to filesystem path
                            // Assuming path starts with /storage/
                            $relativePath = str_replace('/storage/', '', $lesson->resource_path);
                            // Verify if file exists in public disk
                            if (\Illuminate\Support\Facades\Storage::disk('public')->exists($relativePath)) {
                                $absPath = \Illuminate\Support\Facades\Storage::disk('public')->path($relativePath);
                                $pdf = $parser->parseFile($absPath);
                                $text = $pdf->getText();
                                // Clean up text to reduce token usage significantly
                                // Limit extraction length to avoid overload
                                $cleaned = substr(preg_replace('/\s+/', ' ', $text), 0, 3000); 
                                $context .= "PDF Content ({$lesson->resource_path}): {$cleaned}...\n";
                            }
                        } catch (\Exception $e) {
                            Log::warning("PDF Parsing failed for Lesson {$lesson->id}: " . $e->getMessage());
                            $context .= "PDF Content ({$lesson->resource_path}): [Failed to read content]\n";
                        }
                    }
                    $context .= "\n";
                }
            }
        }

        try {
            // Pass the enhanced context to the service
            $data = $this->gemini->generateQuiz($topic, $difficulty, $count, $context);

            if (!$data || !isset($data['questions'])) {
                return response()->json(['message' => 'AI failed to generate a valid quiz.'], 500);
            }

            // Return generated data directly without saving to DB yet.
            // The frontend will allow the user to review/edit before saving.
            return response()->json([
                'message' => 'Quiz generated successfully',
                'quiz' => $data, // Structure: { title, description, questions: [{ prompt, options:[], correctIndex }] }
                'questions' => $data['questions']
            ], 200);

        } catch (\Exception $e) {
            Log::error('Quiz Generation Failed: ' . $e->getMessage());
            return response()->json(['message' => 'Generation failed: ' . $e->getMessage()], 500);
        }
    }
}

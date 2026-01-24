<?php

namespace App\Http\Controllers;

use App\Models\Question;
use App\Models\QuestionOption;
use App\Models\Quiz;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class QuizController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        // Return quizzes created by the authenticated user
        $quizzes = Quiz::where('created_by', $request->user()->id)
            ->withCount('questions')
            ->orderBy('created_at', 'desc')
            ->get();
            
        return response()->json($quizzes);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'subject' => 'required|string|max:255', // Frontend uses 'subject', DB uses 'category'
            'difficulty' => 'required|string|in:Beginner,Intermediate,Advanced',
            'timeLimitMinutes' => 'required|integer|min:1',
            'passingScorePercent' => 'required|integer|min:0|max:100',
            'courseId' => 'nullable|integer|exists:courses,id',
            'questions' => 'required|array|min:1',
            'questions.*.prompt' => 'required|string',
            'questions.*.options' => 'required|array|min:2',
            'questions.*.options.*' => 'required|string', // Ensure options are not null
            'questions.*.correctIndex' => 'required|integer|min:0',
        ]);

        try {
            return DB::transaction(function () use ($validated, $request) {
                // 1. Create the Quiz
                $quiz = Quiz::create([
                    'title' => $validated['title'],
                    'description' => $validated['description'] ?? '',
                    'category' => $validated['subject'], // Mapping subject to category
                    'difficulty' => $validated['difficulty'],
                    'time_limit_minutes' => $validated['timeLimitMinutes'],
                    'passing_score_percent' => $validated['passingScorePercent'],
                    'status' => 'published', // Published immediately as per user flow
                    'created_by' => $request->user()->id,
                    'course_id' => $request->input('courseId'),
                ]);

                // 2. Create Questions
                foreach ($validated['questions'] as $qData) {
                    $question = Question::create([
                        'quiz_id' => $quiz->id,
                        'prompt' => $qData['prompt'],
                        'type' => 'multiple-choice',
                        'explanation' => $qData['explanation'] ?? null,
                    ]);

                    // 3. Create Options
                    foreach ($qData['options'] as $index => $optContent) {
                        QuestionOption::create([
                            'question_id' => $question->id,
                            'content' => $optContent, // Validated as string
                            'is_correct' => $index === (int)$qData['correctIndex'],
                        ]);
                    }
                }

                return response()->json([
                    'message' => 'Quiz published successfully',
                    'id' => $quiz->id,
                    'quiz' => $quiz
                ], 201);
            });
        } catch (\Exception $e) {
            Log::error('Quiz Create Failed: ' . $e->getMessage());
            return response()->json(['message' => 'Failed to publish quiz: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        $quiz = Quiz::with(['questions.options' => function($query) {
                // Ensure consistent ordering so indices match
                $query->orderBy('id', 'asc');
            }, 'creator'])
            ->where('id', $id)
            ->firstOrFail();
            
        return response()->json($quiz);
    }

    /**
     * Grade a quiz attempt.
     */
    public function submit(Request $request, $id)
    {
        try {
            $quiz = Quiz::with(['questions.options' => function($query) {
                $query->orderBy('id', 'asc');
            }])->findOrFail($id);

            $answers = $request->input('answers', []); // [question_id => option_index]
            \Illuminate\Support\Facades\Log::info("Quiz Submission for Quiz ID $id", ['answers' => $answers, 'user' => $request->user()->id]);
            
            $correctCount = 0;
            $totalQuestions = $quiz->questions->count();
            $detail = [];

            foreach ($quiz->questions as $question) {
                $userOptionIndex = $answers[$question->id] ?? null;
                $isCorrect = false;
                
                if ($userOptionIndex !== null) {
                    $options = $question->options->values();
                    
                    if (isset($options[$userOptionIndex])) {
                        if ($options[$userOptionIndex]->is_correct) {
                            $correctCount++;
                            $isCorrect = true;
                        }
                    }
                }
                $detail[$question->id] = $isCorrect;
            }

            $score = $totalQuestions > 0 ? round(($correctCount / $totalQuestions) * 100) : 0;
            $passed = $score >= $quiz->passing_score_percent;

            // Save Attempt
            $attempt = \App\Models\QuizAttempt::create([
                'user_id' => $request->user()->id,
                'quiz_id' => $quiz->id,
                'score' => $score,
                'started_at' => now(), // Ideally passed from frontend
                'completed_at' => now(),
            ]);

            return response()->json([
                'score' => $score,
                'percent' => $score, // Frontend expects 'percent' based on mock API
                'passed' => $passed,
                'correctCount' => $correctCount,
                'total' => $totalQuestions,
                'attempt_id' => $attempt->id
            ]);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error("Quiz Submission Error: " . $e->getMessage());
            return response()->json(['message' => 'Submission failed', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Get attempts for a quiz.
     * Instructors see all attempts for their quiz.
     * Students see only their own attempts.
     */
    public function attempts(Request $request, $id)
    {
        $quiz = Quiz::findOrFail($id);
        $user = $request->user();
        
        $query = \App\Models\QuizAttempt::where('quiz_id', $id)
            ->with('user:id,name,email') 
            ->orderBy('created_at', 'desc');

        // Authorization / Filtering
        if ($quiz->created_by !== $user->id) {
            // Not the instructor -> Only show own attempts
            $query->where('user_id', $user->id);
        }

        $attempts = $query->get()->map(function($a) {
                return [
                    'id' => $a->id,
                    'userName' => $a->user->name,
                    'userEmail' => $a->user->email,
                    'percent' => $a->score,
                    'timestamp' => $a->created_at->timestamp * 1000, // Frontend expects MS timestamp
                    'createdAt' => $a->created_at,
                    // Mocking detail correctness counts if needed, or storing them in future
                    'correct' => (int) round(($a->score / 100) * $a->quiz->questions()->count()),
                    'total' => $a->quiz->questions()->count(),
                ];
            });

        return response()->json($attempts);
    }

    /**
     * Get all attempts for the current user across all quizzes.
     */
    public function myHistory(Request $request)
    {
        $attempts = \App\Models\QuizAttempt::where('user_id', $request->user()->id)
            ->with(['quiz:id,title']) // Eager load quiz title
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function($a) {
                return [
                    'id' => $a->id,
                    'quizId' => $a->quiz_id,
                    'title' => $a->quiz->title ?? 'Deleted Quiz',
                    'percent' => $a->score,
                    'timestamp' => $a->created_at->timestamp * 1000,
                    'createdAt' => $a->created_at,
                ];
            });

        return response()->json($attempts);
    }
}


<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\QuizAttempt;
use App\Models\Quiz;
use App\Models\Course;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $userId = $request->user()->id;

        // Stats
        $attemptCount = QuizAttempt::where('user_id', $userId)->count();
        $avgScore = round(QuizAttempt::where('user_id', $userId)->avg('score') ?? 0);
        $totalQuizzes = Quiz::count(); // Total available quizzes (or visible to user)
        
        // In Progress (Mock logic for now as we don't save progress on DB yet, only locally)
        // We could count 'courses' enrolled as a proxy or just leave it 0
        $inProgressCount = $request->user()->courses()->count(); 

        // Recent Attempts
        $recentAttempts = QuizAttempt::where('user_id', $userId)
            ->with('quiz:id,title')
            ->orderBy('created_at', 'desc')
            ->take(3)
            ->get()
            ->map(function ($attempt) {
                return [
                    'id' => $attempt->id,
                    'quizId' => $attempt->quiz_id,
                    'quizTitle' => $attempt->quiz->title,
                    'percent' => $attempt->score,
                    'passed' => $attempt->score >= $attempt->quiz->passing_score_percent,
                    'timestamp' => $attempt->created_at->timestamp * 1000,
                ];
            });

        return response()->json([
            'stats' => [
                'attemptCount' => $attemptCount,
                'avgScore' => $avgScore,
                'inProgressCount' => $inProgressCount,
                'totalQuizzes' => $totalQuizzes,
            ],
            'recentAttempts' => $recentAttempts
        ]);
    }
}

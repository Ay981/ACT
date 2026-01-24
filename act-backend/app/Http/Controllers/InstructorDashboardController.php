<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Quiz;
use App\Models\Course;
use App\Models\QuizAttempt;
use App\Models\User;

class InstructorDashboardController extends Controller
{
    public function index(Request $request)
    {
        $userId = $request->user()->id;

        // 1. Quizzes
        $totalQuizzes = Quiz::where('created_by', $userId)->count();
        $newQuizzesLastMonth = Quiz::where('created_by', $userId)
            ->where('created_at', '>=', now()->subDays(30))
            ->count();

        // 2. Courses Meta
        $activeCoursesCount = Course::where('instructor_id', $userId)->count();
        
        // 3. Students (Unique students who attempted quizzes)
        $quizIds = Quiz::where('created_by', $userId)->pluck('id');
        $studentCount = QuizAttempt::whereIn('quiz_id', $quizIds)
            ->distinct('user_id')
            ->count('user_id');

        // 4. Avg Completion (Score)
        $avgScore = QuizAttempt::whereIn('quiz_id', $quizIds)->avg('score') ?? 0;

        // 5. Recent Quizzes
        $recentQuizzes = Quiz::where('created_by', $userId)
            ->latest()
            ->take(3)
            ->get()
            ->map(function ($quiz) {
                $attempts = $quiz->attempts;
                $count = $attempts->count();
                $passCount = $attempts->where('score', '>=', $quiz->passing_score_percent)->count();

                return [
                    'id' => $quiz->id,
                    'title' => $quiz->title,
                    'questionCount' => $quiz->questions()->count(),
                    'completions' => $count,
                    'passRate' => $count > 0 ? round(($passCount / $count) * 100) : 0,
                    'image' => $quiz->image,
                ];
            });

        // 6. Active Courses List
        $activeCoursesList = Course::where('instructor_id', $userId)
            ->latest() // Show newest courses first
            ->withCount('students')
            ->take(4)
            ->get()
            ->map(function ($c) {
                return [
                    'id' => $c->id,
                    'title' => $c->title,
                    'students' => $c->students_count,
                    'rating' => 4.8, // Mock rating as table not evident yet
                    'thumbnail' => $c->thumbnail,
                    'level' => $c->level,
                ];
            });

        // 7. Top Students
        $topStudents = QuizAttempt::whereIn('quiz_id', $quizIds)
            ->selectRaw('user_id, AVG(score) as avg_score')
            ->groupBy('user_id')
            ->orderByDesc('avg_score')
            ->take(5)
            ->with('user:id,name')
            ->get()
            ->map(function ($attempt) {
                return [
                    'userId' => $attempt->user_id,
                    'userName' => $attempt->user->name ?? 'Unknown',
                    'percent' => round($attempt->avg_score) . '%',
                ];
            });

        return response()->json([
            'metrics' => [
                'total_quizzes' => [
                    'value' => $totalQuizzes,
                    'delta' => $newQuizzesLastMonth > 0 ? "+$newQuizzesLastMonth this month" : null
                ],
                'active_courses' => [
                    'value' => $activeCoursesCount,
                    'delta' => null
                ],
                'students' => [
                    'value' => $studentCount,
                    'delta' => null
                ],
                'avg_completion' => [
                    'value' => round($avgScore),
                    'suffix' => '%',
                    'delta' => null
                ]
            ],
            'recent_quizzes' => $recentQuizzes,
            'active_courses' => $activeCoursesList,
            'top_students' => $topStudents
        ]);
    }
}

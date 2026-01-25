<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/courses', [\App\Http\Controllers\CourseController::class, 'all']);
Route::get('/courses/{id}', [\App\Http\Controllers\CourseController::class, 'show']);
Route::get('/storage-proxy/{path}', [\App\Http\Controllers\CourseController::class, 'storageProxy']);

Route::middleware(['auth:sanctum'])->group(function () {
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
    
    // Dashboard
    Route::get('/dashboard', [\App\Http\Controllers\DashboardController::class, 'index']);
    
    // Profile
    Route::put('/profile', [\App\Http\Controllers\ProfileController::class, 'update']);
    Route::put('/password', [\App\Http\Controllers\ProfileController::class, 'updatePassword']);

    // Notifications
    Route::get('/notifications', [\App\Http\Controllers\NotificationController::class, 'index']);
    Route::post('/notifications/{id}/read', [\App\Http\Controllers\NotificationController::class, 'markAsRead']);
    
    Route::get('/my-courses', [\App\Http\Controllers\CourseController::class, 'enrolled']);
    
    // AI Quiz Generation
    Route::post('/quiz/generate', [\App\Http\Controllers\QuizGenerationController::class, 'generate']);
    // AI Content Generation
    Route::post('/ai/course-outline', [\App\Http\Controllers\AiContentController::class, 'generateCourseOutline']);
    
    // Quiz CRUD
    Route::post('/quizzes', [\App\Http\Controllers\QuizController::class, 'store']);
    Route::get('/quizzes', [\App\Http\Controllers\QuizController::class, 'index']);
    Route::get('/quizzes/{id}', [\App\Http\Controllers\QuizController::class, 'show']);
    Route::post('/quizzes/{id}/attempt', [\App\Http\Controllers\QuizController::class, 'submit']);
    Route::get('/quizzes/{id}/attempts', [\App\Http\Controllers\QuizController::class, 'attempts']);
    Route::get('/my-attempts', [\App\Http\Controllers\QuizController::class, 'myHistory']);

    // Courses
    Route::get('/instructor/courses', [\App\Http\Controllers\CourseController::class, 'index']);
    Route::get('/instructor/courses/{id}', [\App\Http\Controllers\CourseController::class, 'show']);
    Route::post('/instructor/courses', [\App\Http\Controllers\CourseController::class, 'store']);
    Route::put('/instructor/courses/{id}', [\App\Http\Controllers\CourseController::class, 'update']);
    Route::post('/courses/{id}/enroll', [\App\Http\Controllers\CourseController::class, 'enroll']);
    Route::post('/instructor/courses/{id}/lessons', [\App\Http\Controllers\CourseController::class, 'addLesson']);
    Route::put('/instructor/courses/{courseId}/lessons/{lessonId}', [\App\Http\Controllers\CourseController::class, 'updateLesson']);
    Route::delete('/instructor/courses/{courseId}/lessons/{lessonId}', [\App\Http\Controllers\CourseController::class, 'deleteLesson']);

    Route::get('/instructor/dashboard', [\App\Http\Controllers\InstructorDashboardController::class, 'index']);

    // Comments
    Route::post('/comments', [\App\Http\Controllers\CommentController::class, 'store']);
    Route::put('/comments/{id}', [\App\Http\Controllers\CommentController::class, 'update']);
    Route::delete('/comments/{id}', [\App\Http\Controllers\CommentController::class, 'destroy']);
    Route::post('/comments/{id}/like', [\App\Http\Controllers\CommentController::class, 'toggleLike']);

    // Messages
    Route::get('/messages', [\App\Http\Controllers\MessageController::class, 'index']);
    Route::post('/messages', [\App\Http\Controllers\MessageController::class, 'store']);
    Route::get('/messages/init/{id}', [\App\Http\Controllers\MessageController::class, 'initConversation']);
    Route::post('/messages/{id}/read', [\App\Http\Controllers\MessageController::class, 'markAsRead']);
    Route::get('/messages/unread', [\App\Http\Controllers\MessageController::class, 'getUnreadCount']);

    // Reporting
    Route::post('/reports', [\App\Http\Controllers\ReportController::class, 'store']);

    // Admin Reports
    Route::prefix('admin')->group(function () {
        Route::get('/maintenance', [\App\Http\Controllers\AdminDashboardController::class, 'getMaintenanceStatus']);
        Route::post('/maintenance', [\App\Http\Controllers\AdminDashboardController::class, 'toggleMaintenance']);

        Route::get('/dashboard', [\App\Http\Controllers\AdminDashboardController::class, 'index']);
        Route::post('/broadcast', [\App\Http\Controllers\AdminDashboardController::class, 'broadcast']);
        Route::get('/reports', [\App\Http\Controllers\AdminReportController::class, 'index']);
        Route::post('/reports/{id}/action', [\App\Http\Controllers\AdminReportController::class, 'action']);
        
        // Instructors
        Route::get('/instructors', [\App\Http\Controllers\AdminInstructorController::class, 'index']);
        Route::delete('/instructors/{id}', [\App\Http\Controllers\AdminInstructorController::class, 'destroy']);
        Route::post('/instructors/{id}/approve', [\App\Http\Controllers\AdminInstructorController::class, 'approve']);
    });
});

Route::get('/comments', [\App\Http\Controllers\CommentController::class, 'index']);
Route::get('/cors-test', function () {
    return response()->json(['message' => 'CORS OK']);
});

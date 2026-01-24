<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Course;

class AdminInstructorController extends Controller
{
    public function index()
    {
        // Fetch all users with role 'instructor'
        $instructors = User::where('role', 'instructor')
            ->withCount('courses') // Requires 'courses' relationship on User
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($inst) {
                return [
                    'id' => $inst->id,
                    'name' => $inst->name,
                    'email' => $inst->email,
                    'status' => $inst->email_verified_at ? 'Active' : 'Pending', // Simple logic for now
                    'courses' => $inst->courses_count, // Use query count
                    'joinDate' => $inst->created_at->format('Y-m-d')
                ];
            });

        return response()->json($instructors);
    }

    public function destroy($id)
    {
        $user = User::findOrFail($id);
        if ($user->role !== 'instructor') {
            return response()->json(['message' => 'User is not an instructor'], 400);
        }
        
        // Soft delete or hard delete? Let's do simple delete for now, assuming cascade handled or manual cleanup needed
        // For production, soft delete is better.
        $user->delete();

        return response()->json(['message' => 'Instructor removed successfully']);
    }

    public function approve($id)
    {
        $user = User::findOrFail($id);
        if ($user->role !== 'instructor') {
            return response()->json(['message' => 'User is not an instructor'], 400);
        }

        $user->email_verified_at = now();
        $user->save();

        return response()->json(['message' => 'Instructor approved']);
    }
}

<?php

namespace App\Http\Controllers;

use App\Services\GeminiService;
use Illuminate\Http\Request;

class AiContentController extends Controller
{
    protected $gemini;

    public function __construct(GeminiService $gemini)
    {
        $this->gemini = $gemini;
    }

    public function generateCourseOutline(Request $request)
    {
        $request->validate([
            'topic' => 'required|string|min:3',
            'level' => 'nullable|string|in:Beginner,Intermediate,Advanced'
        ]);

        $outline = $this->gemini->generateCourseOutline(
            $request->input('topic'), 
            $request->input('level', 'Beginner')
        );

        if (!$outline) {
            return response()->json(['message' => 'Failed to generate outline. Please try again.'], 500);
        }

        return response()->json($outline);
    }
}

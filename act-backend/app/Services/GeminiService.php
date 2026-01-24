<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class GeminiService
{
    protected $apiKey;
    // updated to gemini-2.5-flash which might have better quota availability or simply be the current standard
    protected $baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

    public function __construct()
    {
        $this->apiKey = env('GEMINI_API_KEY');
    }

    public function generateQuiz($topic, $difficulty = 'Intermediate', $count = 5, $context = '')
    {
        $contextString = $context ? "Use the following context content to generate the questions:\n\n{$context}\n\n" : "";
        
        $prompt = "Create a quiz about '{$topic}' with {$count} multiple-choice questions. 
        Difficulty level: {$difficulty}.
        Target audience: University students.
        
        {$contextString}
        
        Return ONLY valid JSON in the following format, no markdown formatting:
        {
            \"title\": \"Quiz Title\",
            \"description\": \"Short description\",
            \"questions\": [
                {
                    \"prompt\": \"Question text\",
                    \"options\": [\"Option A\", \"Option B\", \"Option C\", \"Option D\"],
                    \"correctIndex\": 0,
                    \"explanation\": \"Why this answer is correct\"
                }
            ]
        }";

        $response = Http::post("{$this->baseUrl}?key={$this->apiKey}", [
            'contents' => [
                [
                    'parts' => [
                        ['text' => $prompt]
                    ]
                ]
            ],
            'generationConfig' => [
                'temperature' => 0.7,
            ]
        ]);

        if ($response->failed()) {
            Log::error('Gemini API Error: ' . $response->body());
            throw new \Exception('Failed to communicate with AI service.');
        }

        $result = $response->json();
        
        try {
            $text = $result['candidates'][0]['content']['parts'][0]['text'];
            // Clean up markdown block if present
            $text = str_replace(['```json', '```'], '', $text);
            return json_decode($text, true);
        } catch (\Exception $e) {
            Log::error('Gemini Parsing Error: ' . $e->getMessage());
            throw new \Exception('Failed to parse AI response.');
        }
    }

    public function generateCourseOutline($topic, $level = 'Beginner') {
        $prompt = "Create a detailed course outline for a course titled '{$topic}' designed for '{$level}' students.
        
        Return ONLY valid JSON in the following format, no markdown formatting:
        {
            \"title\": \"Engaging Course Title\",
            \"description\": \"Comprehensive course description (2-3 sentences)\",
            \"category\": \"Category Name (e.g. Programming, Design)\",
            \"price\": 49.99,
            \"lessons\": [
                {
                    \"title\": \"Lesson 1 Title\",
                    \"description\": \"Lesson summary\"
                },
                {
                    \"title\": \"Lesson 2 Title\",
                    \"description\": \"Lesson summary\"
                },
                {
                    \"title\": \"Lesson 3 Title\", 
                    \"description\": \"Lesson summary\"
                },
                {
                    \"title\": \"Lesson 4 Title\", 
                    \"description\": \"Lesson summary\"
                },
                {
                    \"title\": \"Lesson 5 Title\", 
                    \"description\": \"Lesson summary\"
                }
            ]
        }";

        try {
            $response = Http::post("{$this->baseUrl}?key={$this->apiKey}", [
                'contents' => [
                    [
                        'parts' => [
                            ['text' => $prompt]
                        ]
                    ]
                ],
                'generationConfig' => [
                    'temperature' => 0.7,
                ]
            ]);

            if ($response->failed()) {
                Log::error('Gemini Outline API Error: ' . $response->body());
                return null;
            }

            $data = $response->json();
            $rawText = $data['candidates'][0]['content']['parts'][0]['text'] ?? '';
            $jsonStr = str_replace(['```json', '```'], '', $rawText);
            
            return json_decode($jsonStr, true);

        } catch (\Exception $e) {
             Log::error('Gemini Outline Exception: ' . $e->getMessage());
             return null;
        }
    }
}

<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Comment;
use App\Models\Message;
use App\Models\Report;

class ReportController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'reason' => 'required|string',
            'reportable_id' => 'required|integer',
            'reportable_type' => 'required|string|in:comment,message', 
        ]);

        $type = $validated['reportable_type'] === 'comment' ? Comment::class : Message::class;
        $content = $type::findOrFail($validated['reportable_id']);

        // Determine reported user
        $reportedUserId = ($validated['reportable_type'] === 'comment') ? $content->user_id : $content->sender_id;

        $report = Report::create([
            'reporter_id' => $request->user()->id,
            'reported_user_id' => $reportedUserId,
            'reportable_id' => $validated['reportable_id'],
            'reportable_type' => $type,
            'reason' => $validated['reason'],
        ]);

        return response()->json(['message' => 'Report submitted successfully'], 201);
    }
}

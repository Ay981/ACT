<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Report;

class AdminReportController extends Controller
{
    public function index()
    {
        $reports = Report::with(['reporter:id,name', 'reportedUser:id,name', 'reportable'])
            ->where('status', 'pending')
            ->orderBy('created_at', 'desc')
            ->get();
            
        // Clean up the response to handle morphable properly if accessed by frontend
        return response()->json($reports);
    }

    public function action(Request $request, $id)
    {
        $report = Report::findOrFail($id);
        $user = $report->reportedUser;
        $action = $request->input('action'); 
        // actions: 'ban', 'warn', 'restrict', 'dismiss'

        if ($action === 'dismiss') {
            $report->update(['status' => 'dismissed']);
            return response()->json(['message' => 'Report dismissed']);
        }

        if (!$user) {
             return response()->json(['message' => 'Reported user not found'], 404);
        }

        if ($action === 'ban') {
            $user->update([
                'banned_at' => now(), 
                'restriction_reason' => 'Banned due to report #' . $id
            ]);
            $report->update(['status' => 'resolved', 'admin_note' => 'User banned']);
        } elseif ($action === 'warn') {
             $user->increment('warning_count');
             $user->notify(new \App\Notifications\WarningIssued("Violation in report #{$id}"));
             $report->update(['status' => 'resolved', 'admin_note' => 'User warned']);
        } elseif ($action === 'restrict') {
             $user->update([
                 'restricted_until' => now()->addDays(7), 
                 'restriction_reason' => 'Restricted (7 days) due to report #' . $id
             ]);
             $report->update(['status' => 'resolved', 'admin_note' => 'User restricted for 7 days']);
        } elseif ($action === 'delete_content') {
             if ($report->reportable) {
                 $report->reportable->delete();
                 $report->update(['status' => 'resolved', 'admin_note' => 'Content deleted by admin']);
             } else {
                 return response()->json(['message' => 'Content not found or already deleted'], 404);
             }
        } else {
             return response()->json(['message' => 'Invalid action'], 400);
        }

        return response()->json(['message' => 'Action taken successfully']);
    }
}

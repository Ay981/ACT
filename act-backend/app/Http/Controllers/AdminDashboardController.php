<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Report;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Notification;
use App\Notifications\BroadcastMessage;
use Illuminate\Support\Facades\Cache;

class AdminDashboardController extends Controller
{
    public function getMaintenanceStatus() 
    {
        return response()->json(['enabled' => Cache::get('maintenance_mode', false)]);
    }

    public function toggleMaintenance(Request $request)
    {
        $status = $request->input('enabled');
        if ($status) {
            Cache::forever('maintenance_mode', true);
        } else {
            Cache::forget('maintenance_mode');
        }
        return response()->json(['enabled' => $status]);
    }

    public function index()
    {
        $totalUsers = User::count();
        $activeInstructors = User::where('role', 'instructor')->count();
        $pendingReports = Report::where('status', 'pending')->count();
        
        // Calculate deltas (simple comparison with created_at < 30 days ago for now, or just mock delta for simplicity as real delta requires historical snapshots)
        $newUsersLastMonth = User::where('created_at', '>=', now()->subDays(30))->count();
        $newInstructorsLastMonth = User::where('role', 'instructor')->where('created_at', '>=', now()->subDays(30))->count();
        $newReportsLastMonth = Report::where('status', 'pending')->where('created_at', '>=', now()->subDays(30))->count();

        // Recent Reports
        $recentReports = Report::with(['reporter:id,name', 'reportedUser:id,name'])
            ->latest()
            ->take(5)
            ->get()
            ->map(function ($report) {
                return [
                    'id' => 'R-' . $report->id,
                    'subject' => ucfirst($report->reason),
                    'reporter' => $report->reporter ? $report->reporter->name : 'Unknown',
                    'status' => ucfirst($report->status),
                    'date' => $report->created_at->diffForHumans()
                ];
            });

        return response()->json([
            'stats' => [
                'total_users' => [
                    'value' => number_format($totalUsers),
                    'delta' => '+' . $newUsersLastMonth . ' this month'
                ],
                'active_instructors' => [
                    'value' => number_format($activeInstructors),
                    'delta' => '+' . $newInstructorsLastMonth . ' this month'
                ],
                'pending_reports' => [
                    'value' => $pendingReports,
                    'delta' => '+' . $newReportsLastMonth . ' this month',
                    'status' => $pendingReports > 0 ? 'warning' : 'success'
                ],
                'system_health' => [
                    'value' => '99.9%',
                    'status' => 'success'
                ]
            ],
            'recent_reports' => $recentReports
        ]);
    }

    public function broadcast(Request $request) 
    {
        $request->validate([
            'message' => 'required|string|min:5',
            'target' => 'required|string|in:all,instructors,students'
        ]);

        $query = User::query();

        if ($request->target === 'instructors') {
            $query->where('role', 'instructor');
        } elseif ($request->target === 'students') {
            $query->where('role', 'student');
        }

        // Chunking would be better for massive datasets, but for this size Notification::send handles collection
        $users = $query->get();
        
        Notification::send($users, new BroadcastMessage($request->message));

        return response()->json(['message' => 'Broadcast sent successfully to ' . $users->count() . ' users.']);
    }
}

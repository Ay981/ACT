<?php

namespace App\Http\Controllers;

use App\Models\Message;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class MessageController extends Controller
{
    public function index(Request $request)
    {
        $userId = $request->user()->id;

        // Get all unique users interacted with
        $sentTo = Message::where('sender_id', $userId)->pluck('receiver_id');
        $receivedFrom = Message::where('receiver_id', $userId)->pluck('sender_id');
        
        $partnerIds = $sentTo->merge($receivedFrom)->unique()->values();

        $partners = User::whereIn('id', $partnerIds)->get();

        $conversations = $partners->map(function ($partner) use ($userId) {
            // Get last message
            $lastMessage = Message::where(function ($q) use ($userId, $partner) {
                $q->where('sender_id', $userId)->where('receiver_id', $partner->id);
            })->orWhere(function ($q) use ($userId, $partner) {
                $q->where('sender_id', $partner->id)->where('receiver_id', $userId);
            })->orderBy('created_at', 'desc')->first();

            // Count unread from this partner
            $unread = Message::where('sender_id', $partner->id)
                ->where('receiver_id', $userId)
                ->where('is_read', false)
                ->count();
            
            // Get full history for the frontend state (simplification for now)
            $messages = Message::where(function ($q) use ($userId, $partner) {
                $q->where('sender_id', $userId)->where('receiver_id', $partner->id);
            })->orWhere(function ($q) use ($userId, $partner) {
                $q->where('sender_id', $partner->id)->where('receiver_id', $userId);
            })->orderBy('created_at', 'asc')->get()->map(function ($m) use ($userId) {
                return [
                    'id' => $m->id,
                    'text' => $m->message,
                    'sender' => $m->sender_id === $userId ? 'student' : 'instructor', // Frontend treats "student" as "me"
                    'at' => $m->created_at->toIso8601String(),
                    'is_read' => $m->is_read
                ];
            });

            return [
                'id' => $partner->id, // Conversation ID is effectively the partner user ID
                'title' => 'Chat with ' . $partner->name,
                'participant' => $partner->name,
                'unread' => $unread,
                'lastMessageAt' => $lastMessage ? $lastMessage->created_at->toIso8601String() : null,
                'messages' => $messages
            ];
        });

        // Sort by last message
        $conversations = $conversations->sortByDesc('lastMessageAt')->values();

        return response()->json($conversations);
    }

    public function store(Request $request)
    {
        $user = $request->user();
        if ($user->isBanned()) {
             return response()->json(['message' => 'You are banned from sending messages.'], 403);
        }
        if ($user->isRestricted()) {
             return response()->json(['message' => 'You are temporarily restricted from messaging until ' . $user->restricted_until], 403);
        }

        $validated = $request->validate([
            'recipient_id' => 'required|exists:users,id',
            'message' => 'required|string',
        ]);

        $message = Message::create([
            'sender_id' => $request->user()->id,
            'receiver_id' => $validated['recipient_id'],
            'message' => $validated['message'],
        ]);

        return response()->json($message, 201);
    }

    public function initConversation(Request $request, $partnerId)
    {
        $partner = User::findOrFail($partnerId);
        
        // This structure must match the one in index()
        return response()->json([
            'id' => $partner->id,
            'title' => 'Chat with ' . $partner->name,
            'participant' => $partner->name,
            'unread' => 0,
            'lastMessageAt' => null,
            'messages' => []
        ]);
    }

    public function markAsRead(Request $request, $partnerId)
    {
        $userId = $request->user()->id;

        Message::where('sender_id', $partnerId)
            ->where('receiver_id', $userId)
            ->where('is_read', false)
            ->update(['is_read' => true]);
            
        return response()->json(['message' => 'Marked as read']);
    }

    public function getUnreadCount(Request $request)
    {
        $count = Message::where('receiver_id', $request->user()->id)
            ->where('is_read', false)
            ->count();
            
        return response()->json(['count' => $count]);
    }
}

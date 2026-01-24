<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class CommentController extends Controller
{
    public function index(Request $request)
    {
        $request->validate([
            'type' => 'required|string',
            'id' => 'required|integer'
        ]);

        $modelClass = $this->getModelClass($request->type);
        if (!$modelClass) return response()->json(['message' => 'Invalid Type'], 400);

        $comments = \App\Models\Comment::where('commentable_type', $modelClass)
            ->where('commentable_id', $request->id)
            ->whereNull('parent_id') // Get root comments
            ->with(['replies.user', 'user', 'replies.replies']) // Nested eager load
            ->withCount('likes') // Root comment likes
            ->get()
            ->each(function($comment) {
                // Manually load recursive likes/auth check for depth? 
                // Creating a recursive loader is cleaner.
                $this->loadLikesRecursively($comment);
            });
            
        // Because of the recursive loading logic in a loop, it's n+1 ish but acceptable for comments section size.
        // Better approach: use a transformer, but for now this works.
        
        return response()->json($comments);
    }
    
    // Helper to recursively load counts and check "is_liked_by_me"
    private function loadLikesRecursively($comment) {
        $user = request()->user('sanctum');
        $comment->loadCount('likes');
        $comment->is_liked_by_me = $user ? $comment->likes()->where('user_id', $user->id)->exists() : false;
        
        if ($comment->relationLoaded('replies')) {
            foreach ($comment->replies as $reply) {
                $reply->load(['user']); // Ensure user is loaded
                $this->loadLikesRecursively($reply);
            }
        }
    }

    public function store(Request $request)
    {
        $user = $request->user();
        if ($user->isBanned()) {
             return response()->json(['message' => 'You are banned from commenting.'], 403);
        }
        if ($user->isRestricted()) {
             return response()->json(['message' => 'You are temporarily restricted from commenting until ' . $user->restricted_until], 403);
        }

        $validated = $request->validate([
            'content' => 'required|string|max:1000',
            'type' => 'required|string',
            'id' => 'required|integer',
            'parent_id' => 'nullable|integer|exists:comments,id'
        ]);

        $modelClass = $this->getModelClass($request->type);
        if (!$modelClass) return response()->json(['message' => 'Invalid Type'], 400);

        $comment = \App\Models\Comment::create([
            'user_id' => $request->user()->id,
            'content' => $validated['content'],
            'commentable_type' => $modelClass,
            'commentable_id' => $validated['id'],
            'parent_id' => $validated['parent_id'] ?? null
        ]);

        return response()->json($comment->load('user'), 201);
    }

    private function getModelClass($type) {
        $map = [
            'course' => \App\Models\Course::class,
            'lesson' => \App\Models\Lesson::class,
            'quiz' => \App\Models\Quiz::class
        ];
        return $map[$type] ?? null;
    }

    public function update(Request $request, $id)
    {
        $comment = \App\Models\Comment::findOrFail($id);
        
        if ($request->user()->id !== $comment->user_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'content' => 'required|string|max:1000'
        ]);

        $comment->update(['content' => $validated['content']]);
        return response()->json($comment);
    }

    public function destroy(Request $request, $id)
    {
        $comment = \App\Models\Comment::findOrFail($id);

        if ($request->user()->id !== $comment->user_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $comment->delete();
        return response()->json(['message' => 'Deleted']);
    }

    public function toggleLike(Request $request, $id)
    {
        $comment = \App\Models\Comment::findOrFail($id);
        $user = $request->user();
        
        $like = \App\Models\CommentLike::where('user_id', $user->id)
            ->where('comment_id', $comment->id)
            ->first();
            
        if ($like) {
            $like->delete();
            $liked = false;
        } else {
            \App\Models\CommentLike::create([
                'user_id' => $user->id,
                'comment_id' => $comment->id
            ]);
            $liked = true;
        }
        
        return response()->json([
            'liked' => $liked,
            'likes_count' => $comment->likes()->count()
        ]);
    }
}

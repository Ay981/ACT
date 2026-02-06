<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Lesson extends Model
{
    use HasFactory;

    protected $fillable = [
        'course_id',
        'title',
        'description',
        'video_url',
        'youtube_url',
        'resource_path',
        'content_type',
        'order',
    ];

    protected $appends = ['resource_url'];

    public function course()
    {
        return $this->belongsTo(Course::class);
    }

    public function getResourceUrlAttribute()
    {
        if (!$this->resource_path) {
            return null;
        }

        $path = $this->resource_path;

        // If it's already a full URL, return as-is
        if (str_starts_with($path, 'http://') || str_starts_with($path, 'https://')) {
            return $path;
        }

        // Handle common external links without scheme (e.g., drive.google.com/...)
        if (str_starts_with($path, 'drive.google.com') || str_starts_with($path, 'www.')) {
            return 'https://' . $path;
        }

        // Convert relative/local path to full URL
        return url($path);
    }
}

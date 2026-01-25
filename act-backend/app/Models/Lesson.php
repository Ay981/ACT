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
        if ($this->resource_path) {
            // If it's already a full URL, return as-is
            if (str_starts_with($this->resource_path, 'http')) {
                return $this->resource_path;
            }
            // Convert relative path to full URL
            return url($this->resource_path);
        }
        return null;
    }
}

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

    public function course()
    {
        return $this->belongsTo(Course::class);
    }
}

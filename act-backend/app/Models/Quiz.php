<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Quiz extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'description',
        'category',
        'difficulty',
        'time_limit_minutes',
        'passing_score_percent',
        'status',
        'created_by',
        'course_id',
    ];

    public function questions()
    {
        return $this->hasMany(Question::class);
    }

    public function attempts()
    {
        return $this->hasMany(QuizAttempt::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}

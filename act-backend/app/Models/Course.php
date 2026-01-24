<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Course extends Model
{
    use HasFactory;

    protected $fillable = [
        'instructor_id',
        'title',
        'description',
        'category',
        'level',
        'thumbnail',
        'price',
        'status',
    ];

    public function instructor()
    {
        return $this->belongsTo(User::class, 'instructor_id');
    }

    public function lessons()
    {
        return $this->hasMany(Lesson::class)->orderBy('order');
    }

    public function students()
    {
        return $this->belongsToMany(User::class, 'enrollments')
                    ->withTimestamps()
                    ->withPivot('enrolled_at');
    }
}
